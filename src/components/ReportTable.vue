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

    <!-- TITLE -->
    <template #body-cell-title="props">
      <q-td :props="props">
        {{ props.row.title }}

        <q-popup-edit v-model="props.row.title" v-slot="scope" auto-save>
          <q-input
            v-model="scope.value"
            dense
            autofocus
            counter
            @keydown.enter.prevent="
              () => {
                scope.set(scope.value)
                $emit('update-title', props.row.id, scope.value)
              }
            "
            @keydown.esc="scope.cancel()"
          />
        </q-popup-edit>
      </q-td>
    </template>

    <!-- SLUG -->
    <template #body-cell-slug="props">
      <q-td :props="props">
        <q-chip dense size="sm" outline color="grey-7">
          {{ props.row.slug }}
        </q-chip>
      </q-td>
    </template>

    <!-- DESCRIPTION -->
    <template #body-cell-description="props">
      <q-td :props="props">
        <div class="td-description">{{ props.row.description }}</div>
        <q-tooltip>{{ props.row.description }}</q-tooltip>

        <q-popup-edit v-model="props.row.description" buttons label-set="Save">
          <q-input
            type="textarea"
            v-model="props.row.description"
            dense
            autofocus
            label="Edit Description"
          />
        </q-popup-edit>
      </q-td>
    </template>

    <!-- TYPE -->
    <template #body-cell-type="props">
      <q-td :props="props">
        <q-badge :color="props.value === 'real' ? 'green' : 'orange'">
          {{ props.value }}
        </q-badge>

        <q-popup-edit v-model="props.row.type" buttons>
          <q-select v-model="props.row.type" :options="allowedTypes" dense autofocus />
        </q-popup-edit>
      </q-td>
    </template>

    <!-- INTERVAL -->
    <template #body-cell-interval="props">
      <q-td :props="props">
        {{ props.value }}
        <q-popup-edit v-model="props.row.interval" buttons>
          <q-select v-model="props.row.interval" :options="allowedIntervals" />
        </q-popup-edit>
      </q-td>
    </template>

    <!-- PARAMETERS -->
    <template #body-cell-parameters="props">
      <q-td :props="props">
        <div class="my-param-style">
          <q-chip
            v-for="(value, key) in props.row.parameters"
            :key="key"
            removable
            color="teal-1"
            text-color="teal-9"
            size="sm"
            @remove="$emit('remove-param', props.row, key)"
          >
            <strong>{{ key }}:</strong>&nbsp;{{ value }}

            <q-popup-edit v-model="props.row.parameters[key]" buttons>
              <q-input v-model="props.row.parameters[key]" dense autofocus />
            </q-popup-edit>
          </q-chip>

          <q-btn
            icon="add"
            round
            size="xs"
            color="teal"
            flat
            @click="$emit('add-param', props.row)"
          />
        </div>
      </q-td>
    </template>

    <!-- DELETE -->
    <template #body-cell-delete="props">
      <q-td :props="props">
        <q-btn flat round color="negative" icon="delete" @click="$emit('delete', props.row)" />
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

defineEmits(['add-param', 'remove-param', 'delete', 'update-title'])
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
</style>
