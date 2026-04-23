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
    <n-descriptions-item label="# Tuberías críticas">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>{{ summary.pipes_to_fix.length }}</span>
          <n-button size="tiny" @click="exportPipesToFix">
              <template #icon>
                <n-icon>
                  <DownloadOutline />
                </n-icon>
              </template>
            </n-button>
      </div>
    </n-descriptions-item>
        <n-descriptions-item label="Disponibilidad del servicio (%)">
      {{ summary.wsa_avg }}
    </n-descriptions-item>
            <n-descriptions-item label="Índice de resiliencia hidráulica">
      {{ summary.todini_index }}
    </n-descriptions-item>
    <!-- <n-descriptions-item label="Entropía del sistema">
      {{ summary.system_entropy }}
    </n-descriptions-item> -->
  </n-descriptions>

  <TablePlaceholder v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NDescriptions, NDescriptionsItem } from 'naive-ui'
import { simulationResult } from '@/services/simulationStore'
import TablePlaceholder from './TablePlaceholder.vue'
import * as XLSX from 'xlsx'
import { NButton, NIcon } from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'
const summary = computed(() => simulationResult.value?.summary)
function exportPipesToFix() {
  if (!summary.value?.pipes_to_fix) return

  const data = summary.value.pipes_to_fix

  // 👇 FORZAR ORDEN
  const orderedData = data.map(item => ({
    Prioridad: item.Prioridad,
    Tuberia: item.Tuberia,
    Estado_daño: item.Estado_daño,
    Fuga_acumulada: item.Fuga_acumulada
  }))

  const ws = XLSX.utils.json_to_sheet(orderedData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'TuberiasCriticas')

  XLSX.writeFile(wb, 'tuberias_criticas.xlsx')
}

</script>
