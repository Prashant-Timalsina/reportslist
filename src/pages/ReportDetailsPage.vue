<script setup>
import { useQuasar } from 'quasar'
import { useReportStore } from 'src/stores/reportStore'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Papa from 'papaparse'

const route = useRoute()
const store = useReportStore()
const $q = useQuasar()

const isSaving = ref(false)

const rows = computed(() => store.getItemsforReport(route.params.id))

const columns = [
  { name: 'title', label: 'Item Title', field: 'title', align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'connection', label: 'Conn', field: 'connection', align: 'left' },
  { name: 'sql_query', label: 'SQL Query', field: 'sql_query', align: 'left' },
  { name: 'delete', label: 'Remove', field: 'delete', align: 'center' },
]

const handleSave = () => {
  isSaving.value = true

  setTimeout(() => {
    isSaving.value = false
    $q.notify({
      type: 'positive',
      message: 'Changes saved successfully to local storage',
      position: 'top',
      timeout: 2000,
    })
  }, 1000)
}
const showAddItemDialog = ref(false)

const newItem = ref({
  title: '',
  description: '',
  status: 'active',
  connection: 'PostgreSQL_Main',
  sql_query: 'SELECT * FROM ...',
})

const submitItem = () => {
  const parentId = route.params.id
  store.addItem(parentId, { ...newItem.value })

  newItem.value = {
    title: '',
    description: '',
    status: 'active',
    connection: 'PostgreSQL_Main',
    sql_query: 'SELECT * FROM ...',
  }
  showAddItemDialog.value = false

  store.saveToDisk()

  $q.notify({ type: 'positive', message: 'New Item Created!' })
}

const removeSubItem = (row) => {
  $q.dialog({
    title: 'Delete Item',
    message: 'Remove this query from the report?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    store.deleteItem(row.id)
    $q.notify({ type: 'positive', message: 'This query deleted' })
  })
}

const csvInput = ref(null)

const openCSV = () => {
  csvInput.value?.click()
}

const importCSV = (event) => {
  const file = event.target.files[0]
  if (!file) return

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const data = results.data

      data.forEach((row) => {
        store.addItem({
          title: row.title || '',
          description: row.description || '',
          status: row.status || 'active',
          connection: row.connection || 'PostgreSQL_Main',
          sql_query: row.sql_query || 'SELECT * FROM ...',
        })
      })
    },
  })
}

// const openCSV = document.getElementById('csvInput')?.click()
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn icon="arrow_back" flat round to="/" />
      <div class="text-h5 q-ml-sm">Linked Reports for ID: {{ $route.params.id }}</div>
      <q-space />
      <div class="row items-center q-gutter-sm">
        <input ref="csvInput" type="file" accept=".csv" class="hidden" @change="importCSV" />

        <q-btn
          outline
          color="primary"
          icon="upload_file"
          label="Import CSV"
          caption="Sub report"
          @click="openCSV"
        >
          <q-tooltip>Import Sub Report from CSV</q-tooltip>
        </q-btn>

        <q-btn
          label="New Report Item"
          color="green"
          icon="add_circle"
          @click="showAddItemDialog = true"
        />
      </div>
    </div>

    <q-dialog v-model="showAddItemDialog">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">Create Report Item</div></q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="newItem.title" label="Title" filled dense />
          <q-input v-model="newItem.description" label="Description" filled dense type="textarea" />
          <q-select
            v-model="newItem.status"
            :options="['active', 'pending', 'inactive']"
            label="Status"
            filled
            dense
          />
          <q-select
            v-model="newItem.connection"
            :options="store.CONNECTIONS"
            label="Connection"
            filled
            dense
          />
          <q-input
            v-model="newItem.sql_query"
            label="SQL_Query"
            type="textarea"
            filled
            placeholder="SELECT * FROM table ..."
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="green" label="Create Report" @click="submitItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-table :rows="rows" :columns="columns" row-key="id" flat bordered>
      <template v-slot:body-cell-title="props">
        <q-td :props="props">
          {{ props.row.title }}
          <q-popup-edit v-model="props.row.title" v-slot="scope" buttons>
            <q-input v-model="scope.value" dense autofocus />
          </q-popup-edit>
        </q-td>
      </template>

      <template v-slot:body-cell-description="props">
        <q-td :props="props">
          <div class="ellipsis" style="max-width: 150px">{{ props.row.description }}</div>
          <q-tooltip>{{ props.value }}</q-tooltip>
          <q-popup-edit v-model="props.row.description" v-slot="scope" buttons>
            <q-input type="textarea" v-model="scope.value" dense autofocus />
          </q-popup-edit>
        </q-td>
      </template>
      <template #body-cell-status="props"
        ><q-td :props="props">
          <q-chip
            :color="props.value === 'active' ? 'positive' : 'grey'"
            text-color="white"
            size="sm"
          >
            {{ props.value }}
          </q-chip>
          <q-popup-edit v-model="props.row.status" v-slot="scope" buttons
            ><q-select v-model="scope.value" :options="store.ALLOWED_STATUSES" dense autofocus
          /></q-popup-edit>
        </q-td>
      </template>
      <template v-slot:body-cell-connection="props">
        <q-td :props="props">
          <q-badge outline color="cyan">
            {{ props.value }}
          </q-badge>

          <q-popup-edit v-model="props.row.connection" v-slot="scope" buttons>
            <q-select
              v-model="scope.value"
              :options="store.CONNECTIONS"
              dense
              autofocus
              label="Select Database"
            />
          </q-popup-edit>
        </q-td>
      </template>
      <template v-slot:body-cell-sql_query="props">
        <q-td :props="props">
          <div class="sql-code-preview">
            <code
              >{{ props.value.substring(0, 30) }}{{ props.value.length > 30 ? '...' : '' }}</code
            >
          </div>

          <q-popup-edit
            v-model="props.row.sql_query"
            v-slot="scope"
            buttons
            label-set="Update Query"
          >
            <q-input
              v-model="scope.value"
              type="textarea"
              autofocus
              label="SQL Statement"
              hint="Example: SELECT * FROM table WHERE id = 1"
              filled
              style="min-width: 300px"
            />
          </q-popup-edit>
        </q-td>
      </template>
      <template v-slot:body-cell-delete="props">
        <q-td :props="props">
          <q-btn flat round dense color="red-4" icon="close" @click="removeSubItem(props.row)" />
        </q-td>
      </template>
    </q-table>
    <q-btn
      color="secondary"
      icon="save"
      label="Save Changes"
      :loading="isSaving"
      @click="handleSave"
    >
      <template>
        <q-spinner-facebook />
      </template>
    </q-btn>
  </q-page>
</template>

<style scoped>
.sql-code-preview code {
  background-color: #272c34;
  color: #cfd7e5;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.85em;
}
</style>
