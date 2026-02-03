<template>
  <BaseTable :rows="rows" :columns="columns" row-key="id">
    <!-- ACTIONS -->
    <template #body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          flat
          round
          color="primary"
          icon="list"
          :to="{ name: 'report-details', params: { id: props.row.id } }"
        >
          <q-tooltip>View linked reports</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <template #body-cell-id="props">
      <q-td :props="props" class="shell-part">
        {{ props.value }}
      </q-td>
    </template>

    <!-- TITLE -->
    <template #body-cell-title="props">
      <q-td :props="props">
        {{ props.row.title }}
      </q-td>
    </template>

    <!-- SLUG -->
    <template #body-cell-slug="props">
      <q-td :props="props" class="shell-part">
        <q-chip dense size="sm" outline color="grey-7" class="val-part">
          {{ props.row.slug }}
        </q-chip>
      </q-td>
    </template>

    <!-- DESCRIPTION -->
    <template #body-cell-description="props">
      <q-td :props="props">
        <div class="td-description">{{ props.row.description }}</div>
        <q-tooltip>{{ props.row.description }}</q-tooltip>
      </q-td>
    </template>

    <!-- TYPE -->
    <template #body-cell-type="props">
      <q-td :props="props">
        <q-badge :color="props.value === 'realtime' ? 'green' : 'orange'" class="cursor-pointer">
          {{ props.value }}
        </q-badge>
      </q-td>
    </template>

    <!-- INTERVAL -->
    <template #body-cell-interval="props">
      <q-td :props="props" class="cursor-pointer">
        {{ props.value }}
      </q-td>
    </template>

    <!-- STATUS -->
    <template #body-cell-status="props">
      <q-td :props="props">
        <q-badge :color="props.value === 'active' ? 'green' : 'grey'" class="cursor-pointer">
          {{ props.value }}
        </q-badge>
      </q-td>
    </template>

    <!-- PARAMETERS -->
    <template #body-cell-parameters="props">
      <q-td :props="props">
        <div class="my-param-style">
          <q-chip
            v-for="(value, key) in props.row.parameters"
            :key="key"
            color="teal-1"
            text-color="teal-9"
            size="sm"
          >
            <strong>{{ key }}:</strong>&nbsp;{{ value }}
          </q-chip>
        </div>
      </q-td>
    </template>

    <!-- DELETE -->
    <template #body-cell-actions-col="props">
      <q-td :props="props">
        <q-btn flat round color="primary" icon="edit" @click="$emit('edit', props.row)">
          <q-tooltip>Edit Report</q-tooltip>
        </q-btn>
        <q-btn flat round color="negative" icon="delete" @click="$emit('delete', props.row)">
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

.shell-part,
.val-part {
  cursor: default !important;
  user-select: none;
}
</style>
