<template>
  <q-table
    :rows="rows"
    :columns="columns"
    :row-key="rowKey"
    dense
    separator="horizontal"
    flat
    bordered
    class="base-table"
  >
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

<style scoped>
.base-table {
  max-width: 100%;
  background: #fff;
}

.base-table thead tr th {
  position: sticky;
  top: 0;
  background: #f5f5f5;
  font-weight: 600;
  color: #555;
  z-index: 1;
  font-size: 0.75rem;
}

.base-table tbody tr:hover {
  background: #f9f9f9;
}

.q-td {
  padding: 8px 10px;
  vertical-align: top;
}
</style>
