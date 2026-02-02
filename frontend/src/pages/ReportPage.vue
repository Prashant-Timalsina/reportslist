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
      <q-card style="min-width: 350px">
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
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Create" @click="submitReport" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <ReportTable
      :rows="store.table1"
      :columns="columns"
      :allowed-types="store.ALLOWED_TYPES"
      :allowed-intervals="store.ALLOWED_INTERVALS"
      @add-param="addParam"
      @remove-param="removeParam"
      @delete="confirmDelete"
      @update-title="handleTitleUpdate"
    />

    <q-btn
      :color="isDirty === true ? 'orange' : 'secondary'"
      icon="save"
      label="Save Changes"
      class="q-mt-md"
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

<script setup>
import { useQuasar } from 'quasar'
import { useReportStore } from 'src/stores/reportStore'
import { computed, ref, watch, onUnmounted } from 'vue'
import Papa from 'papaparse'
import ReportTable from 'src/components/ReportTable.vue'

//
const $q = useQuasar()
const isSaving = ref(false)
const store = useReportStore()
const isDirty = ref(false)

watch(
  [() => store.table1],
  () => {
    isDirty.value = true
  },
  { deep: true },
)

// Warn user on page unload if there are unsaved changes
const beforeUnloadHandler = (e) => {
  if (!isDirty.value) return
  e.preventDefault()
  e.returnValue = ''
}

window.addEventListener('beforeunload', beforeUnloadHandler)
onUnmounted(() => window.removeEventListener('beforeunload', beforeUnloadHandler))

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
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left' },
  { name: 'parameters', label: 'Params', field: 'parameters', align: 'left' },
  { name: 'delete', label: 'Delete', field: 'delete', align: 'center' },
])

const handleSave = () => {
  isSaving.value = true

  store.saveToDisk()
  setTimeout(() => {
    // Mark as saved
    isDirty.value = false
    isSaving.value = false

    $q.notify({
      type: 'positive',
      icon: 'cloud_done',
      message: 'Changes Saved to localStorage',
      position: 'top',
      timeout: 2000,
    })
  }, 1000)
}

const showAddReportDialog = ref(false)
const newReport = ref({
  title: '',
  description: '',
  type: 'real',
  interval: 'daily',
  parameters: {},
})

const submitReport = () => {
  // Use the function we created in the store on Day 10
  store.addReport({
    ...newReport.value,
    slug: store.slugify(newReport.value.title),
  })

  // addReport saves immediately, so clear dirty flag
  isDirty.value = false

  // Reset form and close dialog
  newReport.value = { title: '', description: '', type: 'real', interval: 'daily', parameters: {} }
  showAddReportDialog.value = false

  $q.notify({ type: 'positive', message: 'New Report Created!' })
}

const handleTitleUpdate = (id, title) => {
  store.updateReportTitle(id, title)
  isDirty.value = true
}

const addParam = (row) => {
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
    if (row.parameters[key]) {
      $q.notify({
        type: 'warning',
        message: 'Key already exists',
      })
      return
    }
    row.parameters = {
      ...row.parameters,
      [key]: 'Change Me',
    }
  })
}

const removeParam = (row, key) => {
  const newParams = { ...row.parameters }
  delete newParams[key]
  row.parameters = newParams
}

// const itemsLength = store.reportItems.filter((item) => item.report_id === store.table1.id).length

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${row.title}"? This will also delete all its sub-reports.`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Delete Everything' },
  }).onOk(() => {
    // Stage deletion locally and mark unsaved
    store.deleteReport(row.id, { persist: false })
    isDirty.value = true
    $q.notify({ type: 'negative', message: 'Report removed locally — press Save to persist.' })
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
        // We clean the data and send it to our store function from Day 10
        store.addReport({
          title: row.title || 'Untitled Report',
          description: row.description || '',
          type: row.type || 'real',
          interval: row.interval || 'daily',
          parameters: row.parameters ? JSON.parse(row.parameters) : {},
        })
      })

      $q.notify({ type: 'positive', message: `Imported ${data.length} reports!` })
      // addReport saved to disk for each row; ensure UI considers changes saved
      isDirty.value = false
    },
  })
}
</script>

<style lang="scss" scoped>
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
