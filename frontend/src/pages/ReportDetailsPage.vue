<script setup>
import { useQuasar } from 'quasar'
import { useReportStore } from 'src/stores/reportStore'
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Papa from 'papaparse'
import ReportItemsTable from 'src/components/ReportItemsTable.vue'

const route = useRoute()
const store = useReportStore()
const $q = useQuasar()

onMounted(async () => {
  try {
    await store.fetchColumnsForReport(route.params.id)
  } catch (err) {
    console.error('Error fetching columns:', err)
  }
})

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
    style: 'min-width: 350px; white-space:normal',
  },
  {
    name: 'delete',
    label: 'Remove',
    field: 'delete',
    align: 'center',
    style: 'width: 80px;',
  },
]
const showAddItemDialog = ref(false)

const newItem = ref({
  title: '',
  description: '',
  status: 'active',
  connection: 'PostgreSQL_Main',
  sql_query: 'SELECT * FROM ...',
})

// Edit dialog for columns
const editingColumnId = ref(null)
const showEditItemDialog = ref(false)
const editItem = ref({
  title: '',
  description: '',
  status: 'active',
  connection: 'PostgreSQL_Main',
  sql_query: 'SELECT * FROM ...',
})

const openEditItem = (row) => {
  editingColumnId.value = row.id
  editItem.value = {
    title: row.title,
    description: row.description,
    status: row.status,
    connection: row.connection,
    sql_query: row.sql_query,
  }
  showEditItemDialog.value = true
}

const submitEditItem = async () => {
  if (!editItem.value.title || !editItem.value.status || !editItem.value.connection) {
    $q.notify({ type: 'warning', message: 'Please fill in all required fields' })
    return
  }

  try {
    const reportId = route.params.id
    await store.updateColumn(reportId, editingColumnId.value, {
      title: editItem.value.title,
      description: editItem.value.description,
      status: editItem.value.status,
      connection: editItem.value.connection,
      sql_query: editItem.value.sql_query,
    })

    showEditItemDialog.value = false
    editingColumnId.value = null

    $q.notify({ type: 'positive', message: 'Column Updated!' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error updating column: ' + (err.response?.data?.detail || err.message) })
  }
}

const cancelEditItem = () => {
  showEditItemDialog.value = false
  editingColumnId.value = null
  editItem.value = { title: '', description: '', status: 'active', connection: 'PostgreSQL_Main', sql_query: 'SELECT * FROM ...' }
}

const submitItem = async () => {
  if (!newItem.value.title || !newItem.value.status || !newItem.value.connection) {
    $q.notify({ type: 'warning', message: 'Please fill in all required fields' })
    return
  }

  try {
    const parentId = route.params.id
    await store.addItem(parentId, { ...newItem.value })

    newItem.value = {
      title: '',
      description: '',
      status: 'active',
      connection: 'PostgreSQL_Main',
      sql_query: 'SELECT * FROM ...',
    }
    showAddItemDialog.value = false

    $q.notify({ type: 'positive', message: 'New Item Created!' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error creating column: ' + (err.response?.data?.detail || err.message) })
  }
}

const removeSubItem = async (row) => {
  $q.dialog({
    title: 'Delete Item',
    message: 'Remove this query from the report?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const reportId = route.params.id
      await store.deleteColumn(reportId, row.id)
      $q.notify({ type: 'positive', message: 'Column deleted successfully' })
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Error deleting column: ' + (err.response?.data?.detail || err.message) })
    }
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
    complete: async (results) => {
      const data = results.data
      const reportId = route.params.id

      for (const row of data) {
        try {
          await store.addItem(reportId, {
            title: row.title || '',
            description: row.description || '',
            status: row.status || 'active',
            connection: row.connection || 'PostgreSQL_Main',
            sql_query: row.sql_query || 'SELECT * FROM ...',
          })
        } catch (err) {
          console.error('Error importing row:', err)
        }
      }
      $q.notify({ type: 'positive', message: `Imported ${data.length} items!` })
    },
  })
}

// const openCSV = document.getElementById('csvInput')?.click()
</script>

<template>
  <q-page class="q-px-xl q-py-md">
    <q-btn icon="arrow_back" flat color="primary" round to="/" />
    <div class="row items-center q-my-md">
      <q-card class="text-h5 q-px-sm q-py-xs val-part">Linked Reports</q-card>
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
            :options="store.ALLOWED_STATUSES"
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

    <q-dialog v-model="showEditItemDialog">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">Edit Report Item</div></q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="editItem.title" label="Title" filled dense />
          <q-input v-model="editItem.description" label="Description" filled dense type="textarea" />
          <q-select
            v-model="editItem.status"
            :options="store.ALLOWED_STATUSES"
            label="Status"
            filled
            dense
          />
          <q-select
            v-model="editItem.connection"
            :options="store.CONNECTIONS"
            label="Connection"
            filled
            dense
          />
          <q-input
            v-model="editItem.sql_query"
            label="SQL_Query"
            type="textarea"
            filled
            placeholder="SELECT * FROM table ..."
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelEditItem" />
          <q-btn color="green" label="Save" @click="submitEditItem" />
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
        @edit="openEditItem"
      />
    </div>
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

/* HEADER CARD – subtle only */
.val-part {
  background: white;
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: 600;

  cursor: default;
  user-select: none;
}
/* PAGE */
.q-page {
  background: #fafafa;
}
/* TABLE CONTAINER */
.table-scroll {
  max-height: 55vh;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
}
/* TABLE HEADER – keep Quasar feel */
.q-table thead tr th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f5f5f5;
  font-size: 0.75rem;
  font-weight: 600;
  color: #555;
}

/* CELLS */
.q-td {
  padding: 8px 10px;
  vertical-align: top;
}

/* ROW HOVER – subtle */
.q-table tbody tr:hover {
  background: #f9f9f9;
}
/* BUTTONS – don’t overpower */
.q-btn {
  border-radius: 6px;
}
</style>

<!-- <style scoped>
/* SQL PREVIEW – lighter */
.sql-code-preview {
  background: #f4f6f8;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 0.8em;
}

.sql-code-preview code {
  background: transparent;
  color: #333;
  font-family: monospace;
}

/* NON-INTERACTIVE LABELS */
</style> -->
