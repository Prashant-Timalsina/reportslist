<template>
  <BaseTable :rows="rows" :columns="columns" row-key="id">
    <!-- TITLE -->
    <template #body-cell-title="props">
      <q-td :props="props">
        {{ props.row.title }}
      </q-td>
    </template>

    <!-- DESCRIPTION -->
    <template #body-cell-description="props">
      <q-td :props="props">
        <div class="ellipsis">{{ props.row.description }}</div>
        <q-tooltip>{{ props.row.description }}</q-tooltip>
      </q-td>
    </template>

    <!-- STATUS -->
    <template #body-cell-status="props">
      <q-td :props="props">
        <q-chip
          :color="props.value === 'active' ? 'positive' : 'grey'"
          class="cursor-default"
          text-color="white"
          size="sm"
        >
          {{ props.value }}
        </q-chip>
      </q-td>
    </template>

    <!-- CONNECTION -->
    <template #body-cell-connection="props">
      <q-td :props="props">
        <q-badge outline color="cyan" class="cursor-default">{{ props.value }}</q-badge>
      </q-td>
    </template>

    <!-- SQL QUERY -->
    <template #body-cell-sql_query="props">
      <q-td :props="props" style="min-width: 350px">
        <div class="sql-code-preview">
          <code>{{ props.value }}</code>
        </div>
      </q-td>
    </template>

    <!-- DELETE -->
    <template #body-cell-delete="props">
      <q-td :props="props">
        <q-btn flat round color="primary" icon="edit" @click="$emit('edit', props.row)">
          <q-tooltip>Edit Column</q-tooltip>
        </q-btn>
        <q-btn flat round dense color="red-4" icon="close" @click="$emit('delete', props.row)">
          <q-tooltip>Delete Column</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </BaseTable>
</template>

<script setup>
import BaseTable from './BaseTable.vue'
import { defineProps } from 'vue'

defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  allowedStatuses: { type: Array, default: () => ['active', 'pending', 'inactive'] },
  connections: { type: Array, default: () => [] },
})

defineEmits(['delete', 'edit'])
</script>

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
