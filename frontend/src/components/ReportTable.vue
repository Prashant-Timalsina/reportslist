<template>
  <BaseTable :rows="rows" :columns="columns" row-key="id" class="modern-table">
    <template #body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          flat
          round
          dense
          color="indigo-7"
          icon="list_alt"
          :to="{ name: 'report-details', params: { id: props.row.id } }"
        >
          <q-tooltip transition-show="scale" transition-hide="scale">View linked reports</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <template #body-cell-id="props">
      <q-td :props="props" class="shell-part text-weight-medium text-grey-8">
        #{{ props.value }}
      </q-td>
    </template>

    <template #body-cell-title="props">
      <q-td :props="props" class="text-weight-bold text-blue-grey-10">
        {{ props.row.title }}
      </q-td>
    </template>

    <template #body-cell-slug="props">
      <q-td :props="props" class="shell-part">
        <q-chip dense size="11px" outline color="blue-grey-4" class="val-part text-weight-medium">
          {{ props.row.slug }}
        </q-chip>
      </q-td>
    </template>

    <template #body-cell-description="props">
      <q-td :props="props">
        <div class="td-description-multi">
          {{ props.row.description }}
        </div>
        <q-tooltip max-width="300px" anchor="bottom middle" self="top middle">
          {{ props.row.description }}
        </q-tooltip>
      </q-td>
    </template>

    <template #body-cell-type="props">
      <q-td :props="props">
        <q-badge
          rounded
          :color="props.value === 'realtime' ? 'positive' : 'warning'"
          class="q-px-sm"
        >
          {{ props.value }}
        </q-badge>
      </q-td>
    </template>

    <template #body-cell-interval="props">
      <q-td :props="props" class="text-grey-7">
        {{ props.value }}
      </q-td>
    </template>

    <template #body-cell-status="props">
      <q-td :props="props">
        <q-badge
          outline
          :color="props.value === 'active' ? 'positive' : 'grey-6'"
          class="text-uppercase text-weight-bolder status-badge"
        >
          {{ props.value }}
        </q-badge>
      </q-td>
    </template>

    <template #body-cell-parameters="props">
      <q-td :props="props">
        <div class="parameter-container">
          <q-chip
            v-for="(value, key) in props.row.parameters"
            :key="key"
            size="sm"
            color="blue-grey-1"
            text-color="blue-grey-9"
            class="parameter-chip"
          >
            <span class="text-weight-bold">{{ key }}:</span>&nbsp;{{ value }}
          </q-chip>
        </div>
      </q-td>
    </template>

    <template #body-cell-actions-col="props">
      <q-td :props="props" class="text-right">
        <q-btn
          flat
          round
          dense
          color="blue-7"
          icon="edit"
          @click="$emit('edit', props.row)"
          class="q-mr-xs"
        >
          <q-tooltip>Edit Report</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          color="red-4"
          icon="delete_outline"
          @click="$emit('delete', props.row)"
        >
          <q-tooltip>Delete Report</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </BaseTable>
</template>

<script setup>
import BaseTable from './BaseTable.vue'

defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  allowedTypes: { type: Array, required: true },
  allowedIntervals: { type: Array, required: true },
})

defineEmits(['delete', 'edit'])
</script>

<style scoped>
/* 3-LINE ELLIPSIS & LONG STRING WRAP FIX */
.td-description-multi {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  font-size: 0.85rem;

  /* Critical for long strings with no spaces */
  word-break: break-all;
  overflow-wrap: anywhere;
  white-space: normal;

  /* Adjust width to suit your table layout */
  min-width: 150px;
  max-width: 280px;
}

/* TABLE UI ENHANCEMENTS */
.modern-table :deep(thead tr th) {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  background-color: #fafafa;
  border-bottom: 2px solid #eceff1;
}

.status-badge {
  letter-spacing: 0.5px;
  font-size: 10px;
  padding: 2px 8px;
}

.parameter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 250px;
}

.parameter-chip {
  margin: 0;
  border-radius: 4px;
}

.shell-part {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
}

.val-part {
  border-radius: 4px;
}
</style>
