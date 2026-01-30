<script setup>
import { useQuasar } from 'quasar'
import { useReportStore } from 'src/stores/reportStore'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Papa from 'papaparse'
import ReportItemsTable from 'src/components/ReportItemsTable.vue'

const route = useRoute()
const store = useReportStore()
const $q = useQuasar()

const isSaving = ref(false)
const isDirty = ref(false)

const rows = computed(() => store.getItemsforReport(route.params.id))

const columns = [
  { name: 'title', label: 'Item Title', field: 'title', align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'connection', label: 'Conn', field: 'connection', align: 'left' },
  {
    name: 'sql_query',
    label: 'SQL Query',
    field: 'sql_query',
    align: 'left',
    style: 'min-width: 350px;',
  },
  {
    name: 'delete',
    label: 'Remove',
    field: 'delete',
    align: 'center',
    style: 'vertical-align: top; min-width: 250px;',
  },
]

watch(
  [() => store.reportItems],
  () => {
    isDirty.value = true
  },
  { deep: true },
)

const beforeunloadHandler = (e) => {
  if (!isDirty.value) return
  e.preventDefault()
  e.returnValue = ''
}

window.addEventListener('beforeunload', beforeunloadHandler)
onUnmounted(() => window.removeEventListener('beforeunload', beforeunloadHandler))

const handleSave = () => {
  isSaving.value = true

  isDirty.value = false

  store.saveToDisk()
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

  isDirty.value = false

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
    // Stage deletion locally and mark unsaved
    store.deleteItem(row.id, { persist: false })
    isDirty.value = true
    $q.notify({ type: 'positive', message: 'This query removed locally — press Save to persist.' })
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
      $q.notify({ type: 'positive', message: `Imported ${data.length} reports!` })
      isDirty.value = false
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

    <div class="table-scroll">
      <report-items-table
        :rows="rows"
        :columns="columns"
        :allowed-statuses="store.ALLOWED_STATUSES"
        :connections="store.CONNECTIONS"
        @delete="removeSubItem"
      />
    </div>

    <q-btn
      :color="isDirty ? 'orange' : 'secondary'"
      icon="save"
      label="Save Changes"
      :loading="isSaving"
      @click="handleSave"
      :disable="!isDirty"
    >
      <template>
        <q-spinner-facebook />
      </template>
    </q-btn>
  </q-page>
</template>

<style scoped>
.sql-code-preview {
  white-space: normal;
  word-break: break-all;
  padding: 4px 0;
}

.sql-code-preview code {
  background-color: #272c34;
  color: #cfd7e5;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.85em;

  display: inline-block;
  max-width: 100%;
  line-height: 1.6;
}
</style>

<style scoped>
.table-scroll {
  max-height: 55vh;
  overflow-y: auto;
}
</style>
