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
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useReportStore } from 'src/stores/reportStore'
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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
  -webkit-line-clamp: 2;
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
</style>
