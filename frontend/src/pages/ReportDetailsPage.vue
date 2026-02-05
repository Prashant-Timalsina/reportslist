<template>
  <q-page class="q-px-xl q-py-md bg-grey-1">
    <div class="row items-center q-gutter-x-sm q-mb-xs">
      <q-btn icon="arrow_back" flat color="grey-7" round size="sm" to="/" />
      <div class="text-h5 text-weight-bold text-grey-9">
        {{ reportDetails.title || 'Report' }}
      </div>
      <q-badge
        :color="reportDetails.status === 'active' ? 'positive' : 'grey-7'"
        rounded
        class="q-px-sm text-weight-bold"
        outline
      >
        {{ reportDetails.status || 'N/A' }}
      </q-badge>
      <q-space />
      <div class="text-caption text-grey-6 font-mono">Slug: {{ reportDetails.slug || 'n/a' }}</div>
    </div>

    <div v-if="reportDetails.description" class="q-pl-md q-mb-md">
      <div class="text-body2 text-grey-7 description-text">
        {{ reportDetails.description }}
      </div>
    </div>

    <div class="info-bar row items-center q-pa-md q-mb-lg shadow-sm">
      <div class="info-item q-mr-xl">
        <span class="label">TYPE</span>
        <span class="value text-uppercase">{{ reportDetails.type || 'N/A' }}</span>
      </div>
      <div class="info-item q-mr-xl">
        <span class="label">INTERVAL</span>
        <span class="value">{{ reportDetails.interval || 'Manual' }}</span>
      </div>

      <q-separator vertical inset class="q-mx-md" v-if="hasParameters" />

      <div v-if="hasParameters" class="info-item col-auto q-ml-md">
        <span class="label q-mb-xs">QUERY PARAMETERS</span>
        <div class="row q-gutter-xs">
          <div v-for="(value, key) in reportDetails.parameters" :key="key" class="param-pill">
            <span class="param-key">{{ key }}:</span> {{ value }}
          </div>
        </div>
      </div>
    </div>

    <div class="row items-center q-mb-md">
      <q-btn
        label="New Query"
        color="primary"
        icon="add"
        unelevated
        @click="showAddItemDialog = true"
      />
    </div>

    <div class="table-container fixed-layout shadow-1">
      <report-items-table
        :rows="rows"
        :columns="columns"
        :allowed-statuses="store.ALLOWED_STATUSES"
        @delete="removeSubItem"
        @edit="openEditItem"
        @execute="executeQuery"
      />
    </div>

    <q-dialog v-model="showAddItemDialog" persistent>
      <q-card style="width: 600px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="row items-center">
          <div class="text-h6">Create Report Item</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-md">
          <q-input v-model="newItem.title" label="Title" outlined dense />
          <q-input
            v-model="newItem.description"
            label="Description"
            outlined
            dense
            type="textarea"
            rows="2"
          />
          <div class="row q-col-gutter-sm">
            <q-select
              class="col-6"
              v-model="newItem.status"
              :options="store.ALLOWED_STATUSES"
              label="Status"
              outlined
              dense
            />
            <q-input class="col-6" v-model="newItem.connection" label="Connection" outlined dense />
          </div>
          <q-input
            v-model="newItem.sql_query"
            label="SQL Query"
            type="textarea"
            outlined
            class="sql-font"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn unelevated color="primary" label="Create Item" @click="submitItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditItemDialog" persistent>
      <q-card style="width: 600px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="row items-center">
          <div class="text-h6">Edit Report Item</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="cancelEditItem" />
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-md">
          <q-input v-model="editItem.title" label="Title" outlined dense />
          <q-input
            v-model="editItem.description"
            label="Description"
            outlined
            dense
            type="textarea"
            rows="2"
          />
          <div class="row q-col-gutter-sm">
            <q-select
              class="col-6"
              v-model="editItem.status"
              :options="store.ALLOWED_STATUSES"
              label="Status"
              outlined
              dense
            />
            <q-input
              class="col-6"
              v-model="editItem.connection"
              label="Connection"
              outlined
              dense
            />
          </div>
          <q-input
            v-model="editItem.sql_query"
            label="SQL Query"
            type="textarea"
            outlined
            class="sql-font"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat label="Cancel" color="grey-7" @click="cancelEditItem" />
          <q-btn unelevated color="primary" label="Save Changes" @click="submitEditItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- QUERY OUTPUT DIALOG -->
    <q-dialog v-model="showOutputDialog" maximized>
      <q-card class="output-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Query Output: {{ executingItem?.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md scroll-area">
          <div v-if="queryOutput.loading" class="flex flex-center" style="min-height: 300px">
            <q-spinner color="primary" size="50px" />
          </div>

          <div v-else-if="queryOutput.error" class="q-pa-md bg-red-1 rounded-borders">
            <div class="text-h6 text-red-9">Error</div>
            <div class="text-body2 text-red-8 font-mono">{{ queryOutput.error }}</div>
          </div>

          <div v-else-if="queryOutput.success && queryOutput.rows">
            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-bold">
                Results: {{ queryOutput.row_count }} row(s) returned
              </div>
            </div>

            <div class="table-wrapper bg-white rounded-borders border-1" style="overflow-x: auto">
              <table class="output-table">
                <thead>
                  <tr>
                    <th v-for="(col, idx) in queryOutput.columns" :key="idx" class="text-weight-bold">
                      {{ col }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIdx) in queryOutput.rows" :key="rowIdx">
                    <td v-for="(cell, colIdx) in row" :key="colIdx" class="cell-content">
                      {{ cell !== null ? cell : 'NULL' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="q-mt-md text-caption text-grey-6">
              Executed at: {{ new Date(queryOutput.executedAt).toLocaleString() }}
            </div>
          </div>

          <div v-else class="text-center q-pa-lg text-grey-6">
            No data
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useReportStore } from 'src/stores/reportStore'
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import ReportItemsTable from 'src/components/ReportItemsTable.vue'

const route = useRoute()
const store = useReportStore()
const $q = useQuasar()

onMounted(async () => {
  const reportId = route.params.id
  try {
    await Promise.all([store.fetchReportById(reportId), store.fetchColumnsForReport(reportId)])
  } catch (err) {
    console.error('Error fetching data on mount:', err)
  }
})

const reportDetails = computed(() => {
  const report = store.getReportById(route.params.id)
  return (
    report || {
      title: '',
      description: '',
      status: '',
      type: '',
      interval: '',
      slug: '',
      parameters: {},
    }
  )
})

const hasParameters = computed(
  () => reportDetails.value.parameters && Object.keys(reportDetails.value.parameters).length > 0,
)
const rows = computed(() => store.getItemsforReport(route.params.id))

const columns = [
  { name: 'title', label: 'Item Title', field: 'title', align: 'left', sortable: true },
  {
    name: 'description',
    label: 'Description',
    field: 'description',
    align: 'left',
    classes: 'td-column-limit',
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'connection', label: 'Connection id', field: 'connection', align: 'left' },
  {
    name: 'sql_query',
    label: 'SQL Query',
    field: 'sql_query',
    align: 'left',
    classes: 'td-column-limit sql-font',
  },
  { name: 'delete', label: 'Actions', field: 'id', align: 'center', style: 'width: 100px;' },
]

const showAddItemDialog = ref(false)
const newItem = ref({ title: '', description: '', status: 'active', connection: '', sql_query: '' })
const editingColumnId = ref(null)
const showEditItemDialog = ref(false)
const editItem = ref({
  title: '',
  description: '',
  status: 'active',
  connection: '',
  sql_query: '',
})

const openEditItem = (row) => {
  editingColumnId.value = row.id
  editItem.value = { ...row }
  showEditItemDialog.value = true
}

const submitEditItem = async () => {
  if (!editItem.value.title) return $q.notify({ type: 'warning', message: 'Title required' })
  try {
    await store.updateColumn(route.params.id, editingColumnId.value, { ...editItem.value })
    showEditItemDialog.value = false
    $q.notify({ type: 'positive', message: 'Updated!' })
  } catch (err) {
    console.log(err)

    $q.notify({ type: 'negative', message: 'Update failed' })
  }
}

const cancelEditItem = () => {
  showEditItemDialog.value = false
  editingColumnId.value = null
}

const submitItem = async () => {
  if (!newItem.value.title) return $q.notify({ type: 'warning', message: 'Title required' })
  try {
    await store.addItem(route.params.id, { ...newItem.value })
    newItem.value = { title: '', description: '', status: 'active', connection: '', sql_query: '' }
    showAddItemDialog.value = false
    $q.notify({ type: 'positive', message: 'Item Created!' })
  } catch (err) {
    console.log(err)

    $q.notify({ type: 'negative', message: 'Creation failed' })
  }
}

const removeSubItem = async (row) => {
  $q.dialog({
    title: 'Delete Item',
    message: 'Remove this query?',
    cancel: true,
    ok: { color: 'negative', label: 'Delete', unelevated: true },
  }).onOk(async () => {
    try {
      await store.deleteColumn(route.params.id, row.id)
      $q.notify({ type: 'positive', message: 'Deleted' })
    } catch (err) {
      console.error(err)

      $q.notify({ type: 'negative', message: 'Delete failed' })
    }
  })
}

// Query execution
const showOutputDialog = ref(false)
const executingItem = ref(null)
const queryOutput = ref({
  loading: false,
  success: false,
  error: null,
  columns: [],
  rows: [],
  row_count: 0,
  executedAt: null,
})

const executeQuery = async (row) => {
  executingItem.value = row
  showOutputDialog.value = true
  
  queryOutput.value = {
    loading: true,
    success: false,
    error: null,
    columns: [],
    rows: [],
    row_count: 0,
    executedAt: null,
  }

  try {
    const response = await api.post(
      `/reports/${route.params.id}/columns/${row.id}/execute`,
      {},
      { params: { limit: 100 } }
    )

    if (response.data.success) {
      queryOutput.value = {
        loading: false,
        success: true,
        error: null,
        columns: response.data.columns || [],
        rows: response.data.rows || [],
        row_count: response.data.row_count || 0,
        executedAt: new Date(),
      }
    } else {
      queryOutput.value = {
        loading: false,
        success: false,
        error: response.data.error || 'Unknown error',
        columns: [],
        rows: [],
        row_count: 0,
        executedAt: new Date(),
      }
    }
  } catch (err) {
    console.error('Query execution error:', err)
    queryOutput.value = {
      loading: false,
      success: false,
      error: err.response?.data?.detail || err.message || 'Failed to execute query',
      columns: [],
      rows: [],
      row_count: 0,
      executedAt: new Date(),
    }
  }
}
</script>

<style scoped>
.description-text {
  max-width: 800px;
  line-height: 1.5;
  border-left: 3px solid #e0e0e0;
  padding-left: 12px;
}

.info-bar {
  background: white;
  border-radius: 8px;
  border: 1px solid #0d5aff;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #382222;
  letter-spacing: 0.1em;
  line-height: 1;
  margin-bottom: 4px;
}

.value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.param-pill {
  background: #edf2f7;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #4a5568;
  border: 1px solid #cbd5e0;
}

.param-key {
  font-weight: 700;
  color: #3182ce;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.table-container :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.td-column-limit {
  display: -webkit-box;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  white-space: normal !important;
  word-break: break-all;
  font-size: 0.85rem;
}

.sql-font {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.8rem;
  background: #f8f9fa;
}

.font-mono {
  font-family: monospace;
}

/* Query Output Styles */
.output-card {
  width: 100%;
  height: 100%;
}

.scroll-area {
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.table-wrapper {
  overflow-x: auto;
}

.output-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.output-table thead {
  background: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 1;
}

.output-table th {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 2px solid #e0e0e0;
  white-space: nowrap;
  background: #f5f5f5;
  color: #333;
}

.output-table td {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  color: #555;
}

.output-table tbody tr:hover {
  background: #f9f9f9;
}

.cell-content {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  word-break: break-word;
  max-width: 300px;
  white-space: pre-wrap;
}

.border-1 {
  border: 1px solid #e0e0e0;
}
</style>
