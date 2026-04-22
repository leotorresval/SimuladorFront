<template>
  <n-descriptions
    v-if="summary"
    bordered
    size="small"
    :column="2"
  >
    <n-descriptions-item label="Tiempo analizado (h)">
      {{ summary.time_analyzed_h }}
    </n-descriptions-item>
    <n-descriptions-item label="Presión mínima (m)">
      {{ summary.pressure_min }}
    </n-descriptions-item>
    <n-descriptions-item label="Presión máxima (m)">
      {{ summary.pressure_max }}
    </n-descriptions-item>
    <n-descriptions-item label="Presión promedio (m)">
      {{ summary.pressure_mean }}
    </n-descriptions-item>
    <n-descriptions-item label="% nodos baja presión">
      {{ summary.nodes_below_required_percent }} %
    </n-descriptions-item>
    <n-descriptions-item label="Tuberías críticas">
      {{ summary.avg_major_leak_prob }}
    </n-descriptions-item>
        <n-descriptions-item label="Disponibilidad del servicio (%)">
      {{ summary.wsa_avg }}
    </n-descriptions-item>
            <n-descriptions-item label="Índice de resiliencia hidráulica">
      {{ summary.todini_index }}
    </n-descriptions-item>
            <n-descriptions-item label="Entropía del sistema">
      {{ summary.system_entropy }}
    </n-descriptions-item>
  </n-descriptions>

  <TablePlaceholder v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NDescriptions, NDescriptionsItem } from 'naive-ui'
import { simulationResult } from '@/services/simulationStore'
import TablePlaceholder from './TablePlaceholder.vue'

const summary = computed(() => simulationResult.value?.summary)
</script>
