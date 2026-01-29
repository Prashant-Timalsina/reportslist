<template>
  <q-table :rows="rows" :columns="columns" :row-key="rowKey" flat bordered>
    <!-- Forward all slots -->
    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </q-table>
</template>

<script setup>
defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  rowKey: { type: String, default: 'id' },
})
</script>
