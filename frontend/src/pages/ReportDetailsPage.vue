<template>
  <q-page class="q-px-xl q-py-md">
    <q-btn icon="arrow_back" flat color="primary" round to="/" />

    <!-- Report Metadata Header Section -->
    <div class="q-my-lg">
      <div class="text-h4 text-bold q-mb-sm">{{ reportDetails.title || 'Report' }}</div>
      <div class="text-subtitle2 text-grey-7 q-mb-md">
        Review all associated metadata and data logs below
      </div>

      <q-list bordered separator class="rounded-borders" style="background: white">
        <q-item>
          <q-item-section side>
            <div class="text-weight-bold text-grey-8">Status</div>
          </q-item-section>
          <q-item-section>
            <q-badge
              outline
              :color="reportDetails.status === 'active' ? 'positive' : 'grey-6'"
              class="text-uppercase text-weight-bolder"
            >
              {{ reportDetails.status || 'N/A' }}
            </q-badge>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section side>
            <div class="text-weight-bold text-grey-8">Type</div>
          </q-item-section>
          <q-item-section>
            <q-badge
              rounded
              :color="reportDetails.type === 'realtime' ? 'positive' : 'warning'"
              class="q-px-sm"
            >
              {{ reportDetails.type || 'N/A' }}
            </q-badge>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section side>
            <div class="text-weight-bold text-grey-8">Interval</div>
          </q-item-section>
          <q-item-section>
            <span class="text-body2">{{ reportDetails.interval || 'N/A' }}</span>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section side>
            <div class="text-weight-bold text-grey-8">Slug</div>
          </q-item-section>
          <q-item-section>
            <q-chip dense size="11px" outline color="blue-grey-4" class="text-weight-medium">
              {{ reportDetails.slug || 'N/A' }}
            </q-chip>
          </q-item-section>
        </q-item>

        <q-item v-if="reportDetails.description">
          <q-item-section side>
            <div class="text-weight-bold text-grey-8">Description</div>
          </q-item-section>
          <q-item-section>
            <span class="text-body2">{{ reportDetails.description }}</span>
          </q-item-section>
        </q-item>

        <q-item v-if="hasParameters">
          <q-item-section side>
            <div class="text-weight-bold text-grey-8">Parameters</div>
          </q-item-section>
          <q-item-section>
            <div class="parameter-container">
              <q-chip
                v-for="(value, key) in reportDetails.parameters"
                :key="key"
                size="sm"
                color="blue-grey-1"
                text-color="blue-grey-9"
                class="parameter-chip"
              >
                <span class="text-weight-bold">{{ key }}:</span>&nbsp;{{ value }}
              </q-chip>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div class="row items-center q-my-md">
      <q-card class="text-h5 q-px-sm q-py-xs val-part">Linked Reports</q-card>
      <q-space />
      <div class="row items-center q-gutter-sm">
        <q-btn
          label="New Report Item"
          color="green"
          icon="add_circle"
          @click="showAddItemDialog = true"
        />
      </div>
    </div>

    <q-dialog v-model="showAddItemDialog">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Create Report Item</div></q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-sm">
          <q-input v-model="newItem.title" label="Title" filled dense />
          <q-input v-model="newItem.description" label="Description" filled dense type="textarea" />
          <q-select
            v-model="newItem.status"
            :options="store.ALLOWED_STATUSES"
            label="Status"
            filled
            dense
          />
          <q-input v-model="newItem.connection" label="Connection" filled dense />
          <q-input
            v-model="newItem.sql_query"
            label="SQL Query"
            type="textarea"
            filled
            placeholder="SELECT * FROM table ..."
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="green" label="Create Item" @click="submitItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditItemDialog">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Edit Report Item</div></q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-sm">
          <q-input v-model="editItem.title" label="Title" filled dense />
          <q-input
            v-model="editItem.description"
            label="Description"
            filled
            dense
            type="textarea"
          />
          <q-select
            v-model="editItem.status"
            :options="store.ALLOWED_STATUSES"
            label="Status"
            filled
            dense
          />
          <q-input v-model="editItem.connection" label="Connection" filled dense />
          <q-input v-model="editItem.sql_query" label="SQL Query" type="textarea" filled />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelEditItem" />
          <q-btn color="green" label="Save Changes" @click="submitEditItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="table-scroll fixed-layout">
      <report-items-table
        :rows="rows"
        :columns="columns"
        :allowed-statuses="store.ALLOWED_STATUSES"
        @delete="removeSubItem"
        @edit="openEditItem"
      />
    </div>
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
  try {
    await store.fetchColumnsForReport(route.params.id)
  } catch (err) {
    console.error('Error fetching columns:', err)
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

const hasParameters = computed(() => {
  return reportDetails.value.parameters && Object.keys(reportDetails.value.parameters).length > 0
})

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
  { name: 'connection', label: 'Conn', field: 'connection', align: 'left' },
  {
    name: 'sql_query',
    label: 'SQL Query',
    field: 'sql_query',
    align: 'left',
    classes: 'td-column-limit sql-font',
  },
  { name: 'delete', label: 'Remove', field: 'id', align: 'center', style: 'width: 80px;' },
]

const showAddItemDialog = ref(false)
const newItem = ref({
  title: '',
  description: '',
  status: 'active',
  connection: '',
  sql_query: '',
})

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
    newItem.value = {
      title: '',
      description: '',
      status: 'active',
      connection: '',
      sql_query: '',
    }
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
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await store.deleteColumn(route.params.id, row.id)
      $q.notify({ type: 'positive', message: 'Deleted' })
    } catch (err) {
      console.log(err)

      $q.notify({ type: 'negative', message: 'Delete failed' })
    }
  })
}
</script>

<style scoped>
/* Force the table to respect our truncation widths */
.fixed-layout :deep(table) {
  table-layout: fixed;
  width: 100%;
}

/* Reusable 3-line truncation logic */
.td-column-limit {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  white-space: normal !important;
  word-break: break-all;
  max-width: 300px; /* Adjust as needed */
}

.sql-font {
  font-family: 'Fira Code', monospace;
  font-size: 0.85em;
  color: #2c3e50;
}

.val-part {
  background: white;
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: 600;
  user-select: none;
}

.q-page {
  background: #fafafa;
}

.table-scroll {
  max-height: 65vh;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
}

/* Ensure the header stays visible while scrolling */
.table-scroll :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f5f5f5;
}

/* Parameter display styles */
.parameter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 100%;
}

.parameter-chip {
  margin: 0;
  border-radius: 4px;
}
</style>
