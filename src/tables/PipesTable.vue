<template>
  <n-data-table
    v-if="pipes"
    :columns="columns"
    :data="pipes"
    size="small"
    :pagination="{ pageSize: 8 }"
  />
  <TablePlaceholder v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NDataTable } from 'naive-ui'
import { simulationResult } from '@/services/simulationStore'
import TablePlaceholder from './TablePlaceholder.vue'

const pipes = computed(() => simulationResult.value?.pipes)

const columns = [
  { title: 'ID', key: 'id' },
  { title: 'Estado', key: 'damage_state' },
  { title: 'PGA', key: 'pga',   render: (row) => formatNumber(row.pga, 4) },
  { title: 'PGV', key: 'pgv',   render: (row) => formatNumber(row.pgv, 4) },
  { title: 'RR', key: 'repair_rate', render: (row) => formatNumber(row.repair_rate, 4) },
  { title: 'Longitud (m)', key: 'length', render: (row) => formatNumber(row.length, 3) },
  { title: 'Diámetro (m)', key: 'diameter', render: (row) => formatNumber(row.diameter, 3) },
  { title: 'Índice daño', key: 'damage_index', render: (row) => formatNumber(row.damage_index, 4) },
  { title: 'P. Fuga Menor', key: 'p_minor_leak',  render: (row) => formatNumber(row.p_minor_leak, 4) },
  { title: 'P. Fuga Mayor', key: 'p_major_leak', render: (row) => formatNumber(row.p_major_leak, 4) }
]

function formatNumber(value, decimals = 4) {
  if (value === null || value === undefined) return '-'
  return Number(value).toFixed(decimals)
}

</script>
