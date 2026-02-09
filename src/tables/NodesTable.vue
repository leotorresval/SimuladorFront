<template>
  <n-data-table
    v-if="nodes"
    :columns="columns"
    :data="nodes"
    size="small"
    :pagination="{ pageSize: 5 }"
  />
  <TablePlaceholder v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NDataTable } from 'naive-ui'
import { simulationResult } from '@/services/simulationStore'
import TablePlaceholder from './TablePlaceholder.vue'

const nodes = computed(() => simulationResult.value?.nodes)

const columns = [
  { title: 'Nodo', key: 'id' },
  { title: 'Presión (m)', key: 'pressure', render: (row) => formatNumber(row.pressure, 5) },
  { title: 'Bajo mínimo', key: 'below_required' }
]

function formatNumber(value, decimals = 4) {
  if (value === null || value === undefined) return '-'
  return Number(value).toFixed(decimals)
}
</script>
