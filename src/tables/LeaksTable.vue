<template>
  <n-data-table
    v-if="leaks"
    :columns="columns"
    :data="leaks"
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

const leaks = computed(() => simulationResult.value?.leaks)

const columns = [
  { title: 'Fuga', key: 'id' },
  { title: 'Tubería', key: 'pipe_origin' },
  { title: 'Tipo', key: 'leak_type' },
  { title: 'Área', key: 'leak_area' ,render: (row) => formatNumber(row.leak_area, 5) },
  { title: 'Inicio (h)', key: 'start_time_h' }
]


function formatNumber(value, decimals = 4) {
  if (value === null || value === undefined) return '-'
  return Number(value).toFixed(decimals)
}

</script>
