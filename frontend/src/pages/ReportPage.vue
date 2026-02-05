<template>
  <q-page class="q-px-xl q-py-md">
    <div class="row text-h4 q-mb-md">
      Reports of
      <p class="text-h4 q-ml-md text-weight-bold">
        {{ authStore.email }}
      </p>
      <q-space />
      <q-btn color="primary" icon="add" label="New Report" @click="showAddReportDialog = true" />
    </div>

    <q-dialog v-model="showAddReportDialog">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Create Report</div></q-card-section>
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
              </q-chip>
              <q-btn icon="add" round size="xs" color="teal" flat @click="addParamNew" />
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
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Edit Report</div></q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="editReport.title" label="Title" dense autofocus class="q-mb-sm" />
          <q-input
            v-model="editReport.description"
            label="Description"
            dense
            type="textarea"
            class="q-mb-sm"
          />
          <div class="row q-gutter-sm">
            <q-select
              v-model="editReport.type"
              :options="store.ALLOWED_TYPES"
              label="Type"
              dense
              class="col"
            />
            <q-select
              v-model="editReport.interval"
              :options="store.ALLOWED_INTERVALS"
              label="Interval"
              dense
              class="col"
            />
          </div>
          <q-select
            v-model="editReport.status"
            :options="store.ALLOWED_STATUSES"
            label="Status"
            dense
            class="q-mt-sm"
          />

          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-xs">Parameters</div>
            <q-list bordered separator class="rounded-borders overflow-hidden">
              <q-item v-for="(value, key) in editReport.parameters" :key="key" dense>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-caption text-grey-9 text-uppercase">{{
                    key
                  }}</q-item-label>
                  <q-item-label class="text-body2">{{ value }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    icon="close"
                    flat
                    round
                    dense
                    color="grey-6"
                    size="sm"
                    @click="removeParamEdit(key)"
                  >
                    <q-tooltip>Remove</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>

              <q-item v-if="showNewParamRow">
                <q-item-section>
                  <div class="row q-gutter-x-sm items-center no-wrap">
                    <q-input
                      v-model="tempParam.key"
                      label="Key"
                      dense
                      outlined
                      bg-color="white"
                      class="col"
                    />
                    <q-input
                      v-model="tempParam.value"
                      label="Value"
                      dense
                      outlined
                      bg-color="white"
                      class="col"
                    />
                  </div>
                </q-item-section>
                <q-item-section side>
                  <div class="row no-wrap">
                    <q-btn
                      icon="check"
                      flat
                      round
                      color="positive"
                      size="sm"
                      @click="confirmAddParam"
                    />
                    <q-btn
                      icon="close"
                      flat
                      round
                      color="negative"
                      size="sm"
                      @click="showNewParamRow = false"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <q-btn
              v-if="!showNewParamRow"
              icon="add"
              label="Add Parameter"
              flat
              dense
              color="primary"
              class="full-width q-mt-sm"
              @click="initiateNewParam"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat label="Cancel" color="grey-7" @click="cancelEditReport" />
          <q-btn color="primary" label="Save Changes" unelevated @click="submitEditReport" />
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
import { useAuthStore } from 'src/stores/auth'
import { computed, ref, onMounted } from 'vue'
import ReportTable from 'src/components/ReportTable.vue'

const $q = useQuasar()
const store = useReportStore()
const authStore = useAuthStore()

// State for Parameter Adding
const showNewParamRow = ref(false)
const tempParam = ref({ key: '', value: '' })

onMounted(async () => {
  try {
    await store.fetchAllReports()
  } catch (err) {
    console.error('Error fetching reports:', err)
  }
})

const columns = computed(() => [
  { name: 'actions', label: 'View', align: 'center' },
  { name: 'id', label: '#', field: 'id', align: 'left', sortable: true },
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
// CREATE LOGIC
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
    await store.addReport({ ...newReport.value, params: newReport.value.parameters })
    newReport.value = {
      title: '',
      description: '',
      type: 'realtime',
      interval: 'daily',
      status: 'active',
      parameters: {},
    }
    showAddReportDialog.value = false
    $q.notify({ type: 'positive', message: 'New Report Created!' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error creating report' })
  }
}

const addParamNew = () => {
  $q.dialog({
    title: 'New Parameter',
    message: 'Enter Key:',
    prompt: { model: '', type: 'text' },
    cancel: true,
  }).onOk((key) => {
    if (key) newReport.value.parameters[key] = 'Value'
  })
}

const removeParamNew = (key) => {
  const params = { ...newReport.value.parameters }
  delete params[key]
  newReport.value.parameters = params
}

// EDIT LOGIC
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
    ...row,
    parameters: row.parameters ? { ...row.parameters } : {},
  }
  showEditReportDialog.value = true
}

const initiateNewParam = () => {
  tempParam.value = { key: '', value: '' }
  showNewParamRow.value = true
}

const confirmAddParam = () => {
  const k = tempParam.value.key.trim()
  const v = tempParam.value.value.trim()

  if (!k) {
    $q.notify({ type: 'warning', message: 'Key is required' })
    return
  }

  // Create a fresh copy to ensure Vue reactivity tracks the addition
  const updatedParams = { ...editReport.value.parameters }
  if (updatedParams[k]) {
    $q.notify({ type: 'warning', message: 'Key already exists' })
    return
  }

  updatedParams[k] = v || 'Value'
  editReport.value.parameters = updatedParams

  showNewParamRow.value = false
  tempParam.value = { key: '', value: '' }
}

const removeParamEdit = (key) => {
  const updatedParams = { ...editReport.value.parameters }
  delete updatedParams[key]
  editReport.value.parameters = updatedParams
}

const submitEditReport = async () => {
  try {
    await store.updateReport(editingReportId.value, {
      ...editReport.value,
      params: editReport.value.parameters,
    })
    showEditReportDialog.value = false
    $q.notify({ type: 'positive', message: 'Report Updated!' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Update failed' })
  }
}

const cancelEditReport = () => {
  showEditReportDialog.value = false
  showNewParamRow.value = false
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${row.title}"?`,
    cancel: true,
    ok: { color: 'negative', label: 'Delete', unelevated: true },
  }).onOk(async () => {
    try {
      await store.deleteReport(row.id)
      $q.notify({ type: 'positive', message: 'Deleted' })
    } catch (err) {
      console.log(err)

      $q.notify({ type: 'negative', message: 'Delete failed' })
    }
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

.td-description {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
