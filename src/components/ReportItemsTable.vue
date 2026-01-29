<template>
  <BaseTable :rows="rows" :columns="columns" row-key="id">
    <!-- TITLE -->
    <template #body-cell-title="props">
      <q-td :props="props">
        {{ props.row.title }}
        <q-popup-edit v-model="props.row.title" v-slot="scope" buttons>
          <q-input v-model="scope.value" dense autofocus />
        </q-popup-edit>
      </q-td>
    </template>

    <!-- DESCRIPTION -->
    <template #body-cell-description="props">
      <q-td :props="props">
        <div class="ellipsis" style="max-width: 150px">{{ props.row.description }}</div>
        <q-tooltip>{{ props.value }}</q-tooltip>
        <q-popup-edit v-model="props.row.description" v-slot="scope" buttons>
          <q-input type="textarea" v-model="scope.value" dense autofocus />
        </q-popup-edit>
      </q-td>
    </template>

    <!-- STATUS -->
    <template #body-cell-status="props">
      <q-td :props="props">
        <q-chip
          :color="props.value === 'active' ? 'positive' : 'grey'"
          text-color="white"
          size="sm"
        >
          {{ props.value }}
        </q-chip>
        <q-popup-edit v-model="props.row.status" v-slot="scope" buttons>
          <q-select v-model="scope.value" :options="allowedStatuses" dense autofocus />
        </q-popup-edit>
      </q-td>
    </template>

    <!-- CONNECTION -->
    <template #body-cell-connection="props">
      <q-td :props="props">
        <q-badge outline color="cyan">{{ props.value }}</q-badge>
        <q-popup-edit v-model="props.row.connection" v-slot="scope" buttons>
          <q-select
            v-model="scope.value"
            :options="connections"
            dense
            autofocus
            label="Select Database"
          />
        </q-popup-edit>
      </q-td>
    </template>

    <!-- SQL QUERY -->
    <template #body-cell-sql_query="props">
      <q-td :props="props" style="min-width: 350px">
        <div class="sql-code-preview">
          <code>{{ props.value }}</code>
        </div>
        <q-popup-edit v-model="props.row.sql_query" v-slot="scope" buttons label-set="Update Query">
          <q-input
            v-model="scope.value"
            type="textarea"
            autofocus
            label="SQL Statement"
            filled
            style="min-width: 300px"
          />
        </q-popup-edit>
      </q-td>
    </template>

    <!-- DELETE -->
    <template #body-cell-delete="props">
      <q-td :props="props">
        <q-btn flat round dense color="red-4" icon="close" @click="$emit('delete', props.row)" />
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
