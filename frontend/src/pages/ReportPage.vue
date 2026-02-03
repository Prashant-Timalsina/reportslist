<template>
  <q-page class="q-px-xl q-py-md">
    <div class="row text-h4 q-mb-md">
      Main Reports
      <q-space />
      <div class="row q-gutter-sm">
        <input type="file" ref="csvInput" accept=".csv" style="display: none" @change="importCSV" />

        <q-btn
          outline
          color="primary"
          icon="upload_file"
          label="Import CSV"
          caption="Report"
          @click="openCSV"
        >
          <q-tooltip>Import Reports from CSV</q-tooltip>
        </q-btn>

        <q-btn color="primary" icon="add" label="New Report" @click="showAddReportDialog = true" />
      </div>
    </div>

    <q-dialog v-model="showAddReportDialog">
      <q-card style="min-width: 400px">
        <q-card-section><div class="text-h6">Create Main Report</div></q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="newReport.title" label="Title" dense autofocus />
          <q-input v-model="newReport.description" label="Description" dense type="textarea" />
          <q-select v-model="newReport.type" :options="store.ALLOWED_TYPES" label="Type" />
          <q-select
            v-model="newReport.interval"
            :options="store.ALLOWED_INTERVALS"
            label="Interval"
          />
          <q-select v-model="newReport.status" :options="store.ALLOWED_STATUSES" label="Status" />
          
          <div class="q-mt-md">
            <div class="text-subtitle2">Parameters</div>
            <div class="my-param-style">
              <q-chip
                v-for="(value, key) in newReport.parameters"
                :key="key"
                removable
                color="teal-1"
                text-color="teal-9"
                size="sm"
                @remove="removeParamNew(key)"
              >
                <strong>{{ key }}:</strong>&nbsp;{{ value }}
                <q-popup-edit v-model="newReport.parameters[key]" buttons>
                  <q-input v-model="newReport.parameters[key]" dense autofocus />
                </q-popup-edit>
              </q-chip>
              <q-btn
                icon="add"
                round
                size="xs"
                color="teal"
                flat
                @click="addParamNew"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Create" @click="submitReport" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditReportDialog">
      <q-card style="min-width: 400px">
        <q-card-section><div class="text-h6">Edit Report</div></q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="editReport.title" label="Title" dense autofocus />
          <q-input v-model="editReport.description" label="Description" dense type="textarea" />
          <q-select v-model="editReport.type" :options="store.ALLOWED_TYPES" label="Type" />
          <q-select
            v-model="editReport.interval"
            :options="store.ALLOWED_INTERVALS"
            label="Interval"
          />
          <q-select v-model="editReport.status" :options="store.ALLOWED_STATUSES" label="Status" />
          
          <q-list bordered separator class="q-mt-sm">

          <q-item
            v-for="(value, key) in editReport.parameters"
            :key="key"
            clickable
          >
            <q-item-section>
              <q-item-label>
                <strong>{{ key }}</strong>
              </q-item-label>
              <q-item-label caption>
                {{ value }}
              </q-item-label>

              <q-popup-edit
                v-model="editReport.parameters[key]"
                buttons
                anchor="bottom left"
                self="top left"
                v-slot="scope"
              >
                <q-input
                  v-model="scope.value"
                  label="Value"
                  dense
                  outlined
                  autofocus
                />
              </q-popup-edit>
            </q-item-section>

            <q-item-section side>
              <q-btn
                icon="delete"
                flat
                round
                dense
                color="negative"
                @click.stop="removeParamEdit(key)"
              />
            </q-item-section>
          </q-item>

        </q-list>

        <q-btn
          icon="add"
          label="Add parameter"
          flat
          dense
          class="q-mt-sm"
          @click="addParamEdit"
        />

        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelEditReport" />
          <q-btn color="primary" label="Save" @click="submitEditReport" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <ReportTable
      :rows="store.table1"
      :columns="columns"
      :allowed-types="store.ALLOWED_TYPES"
      :allowed-intervals="store.ALLOWED_INTERVALS"
      @delete="confirmDelete"
      @edit="openEditReport"
    />
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useReportStore } from 'src/stores/reportStore'
import { computed, ref, onMounted } from 'vue'
import Papa from 'papaparse'
import ReportTable from 'src/components/ReportTable.vue'

//
const $q = useQuasar()
const store = useReportStore()

onMounted(async () => {
  try {
    await store.fetchAllReports()
  } catch (err) {
    console.error('Error fetching reports:', err)
  }
})

const columns = computed(() => [
  { name: 'actions', label: 'View', align: 'center' },
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'title', label: 'Title', field: 'title', align: 'left', sortable: true },
  {
    name: 'description',
    label: 'Description',
    field: 'description',
    align: 'left',
    classes: 'td-description',
  },
  { name: 'type', label: 'Type', field: 'type', align: 'center' },
  { name: 'interval', label: 'Interval', field: 'interval', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left' },
  { name: 'parameters', label: 'Params', field: 'parameters', align: 'left' },
  { name: 'actions-col', label: 'Actions', field: 'actions-col', align: 'center' },
])



const showAddReportDialog = ref(false)
const newReport = ref({
  title: '',
  description: '',
  type: 'realtime',
  interval: 'daily',
  status: 'active',
  parameters: {},
})

const submitReport = async () => {
  if (!newReport.value.title || !newReport.value.type || !newReport.value.interval) {
    $q.notify({ type: 'warning', message: 'Please fill in all required fields' })
    return
  }

  try {
    await store.addReport({
      title: newReport.value.title,
      description: newReport.value.description,
      type: newReport.value.type,
      interval: newReport.value.interval,
      status: newReport.value.status || 'active',
      params: newReport.value.parameters || {},
    })

    // Reset form and close dialog
    newReport.value = { title: '', description: '', type: 'realtime', interval: 'daily', status: 'active', parameters: {} }
    showAddReportDialog.value = false

    $q.notify({ type: 'positive', message: 'New Report Created!' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error creating report: ' + (err.response?.data?.detail || err.message) })
  }
}

const addParamNew = () => {
  $q.dialog({
    title: 'New Parameter',
    message: 'Enter the parameter name (Key):',
    prompt: {
      model: '',
      type: 'text',
    },
    cancel: true,
    persistent: true,
  }).onOk((key) => {
    if (!key) return
    if (newReport.value.parameters[key]) {
      $q.notify({
        type: 'warning',
        message: 'Key already exists',
      })
      return
    }
    newReport.value.parameters[key] = 'Change Me'
  })
}

const removeParamNew = (key) => {
  const newParams = { ...newReport.value.parameters }
  delete newParams[key]
  newReport.value.parameters = newParams
}

// Edit dialog for updating reports
const editingReportId = ref(null)
const showEditReportDialog = ref(false)
const editReport = ref({
  title: '',
  description: '',
  type: 'realtime',
  interval: 'daily',
  status: 'active',
  parameters: {},
})

const openEditReport = (row) => {
  editingReportId.value = row.id
  editReport.value = {
    title: row.title,
    description: row.description,
    type: row.type,
    interval: row.interval,
    status: row.status || 'active',
    parameters: { ...row.parameters },
  }
  showEditReportDialog.value = true
}

const submitEditReport = async () => {
  if (!editReport.value.title || !editReport.value.type || !editReport.value.interval) {
    $q.notify({ type: 'warning', message: 'Please fill in all required fields' })
    return
  }

  try {
    await store.updateReport(editingReportId.value, {
      title: editReport.value.title,
      description: editReport.value.description,
      type: editReport.value.type,
      interval: editReport.value.interval,
      status: editReport.value.status || 'active',
      params: editReport.value.parameters || {},
    })

    showEditReportDialog.value = false
    editingReportId.value = null

    $q.notify({ type: 'positive', message: 'Report Updated!' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error updating report: ' + (err.response?.data?.detail || err.message) })
  }
}

const cancelEditReport = () => {
  showEditReportDialog.value = false
  editingReportId.value = null
  editReport.value = { title: '', description: '', type: 'realtime', interval: 'daily', status: 'active', parameters: {} }
}

const addParamEdit = () => {
  $q.dialog({
    title: 'New Parameter',
    message: 'Enter the parameter name (Key):',
    prompt: {
      model: '',
      type: 'text',
    },
    cancel: true,
    persistent: true,
  }).onOk((key) => {
    if (!key) return
    if (editReport.value.parameters[key]) {
      $q.notify({
        type: 'warning',
        message: 'Key already exists',
      })
      return
    }
    editReport.value.parameters[key] = 'Change Me'
  })
}

const removeParamEdit = (key) => {
  const newParams = { ...editReport.value.parameters }
  delete newParams[key]
  editReport.value.parameters = newParams
}



// const itemsLength = store.reportItems.filter((item) => item.report_id === store.table1.id).length

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${row.title}"? This will also delete all its sub-reports.`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Delete Everything' },
  }).onOk(async () => {
    try {
      await store.deleteReport(row.id)
      $q.notify({ type: 'positive', message: 'Report deleted successfully' })
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Error deleting report: ' + (err.response?.data?.detail || err.message) })
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

      for (const row of data) {
        try {
          await store.addReport({
            title: row.title || 'Untitled Report',
            description: row.description || '',
            type: row.type || 'realtime',
            interval: row.interval || 'daily',
            params: row.params ? JSON.parse(row.params) : {},
          })
        } catch (err) {
          console.error('Error importing row:', err)
        }
      }

      $q.notify({ type: 'positive', message: `Imported ${data.length} reports!` })
    },
  })
}
</script>

<style lang="scss" scoped>
.my-param-style {
  font-family: 'Courier New', Courier, monospace;
  background: #eceff1;
  padding: 8px 4px;
  border-radius: 4px;
  font-size: 0.85em;
}

.q-table {
  max-width: 100%;

  thead tr th {
    position: sticky;
    z-index: 1;
    background-color: #d10707;
    font-weight: bold;
    text-transform: uppercase;
  }
}

.td-description {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.my-param-style {
  font-family: 'Courier New', Courier, monospace;
  background: #eceff1;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.85em;
}
</style>
