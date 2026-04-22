<template>
  <div class="chart-wrapper">

    <!-- BOTONES -->
    <div v-if="chartData" class="chart-actions">
      <button @click="exportData">XLSX</button>
      <button @click="exportImage">PNG</button>
    </div>

    <!-- GRÁFICA -->
    <Line
      v-if="chartData && active"
      ref="chartRef"
      :data="chartData"
      :options="options"
    />

    <div v-else class="empty">
      Ejecuta una simulación
    </div>

  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import * as XLSX from 'xlsx'

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  data: Object,
  active: Boolean
})

const chartRef = ref(null)

/* 🔥 CLAVE: múltiples series */
const chartData = computed(() => {
  if (!props.data || !props.data.leak_demand_curve) return null

  const { time, series } = props.data.leak_demand_curve

  return {
    labels: time,
    datasets: series.map((s, idx) => ({
      label: s.name,
      data: s.y,

      borderColor: `hsl(${(idx * 30) % 360}, 70%, 50%)`,
      backgroundColor: `hsla(${(idx * 30) % 360}, 70%, 50%, 0.1)`,

      tension: 0.3,
      pointRadius: 0,
      borderWidth: 1,
      fill: false
    }))
  }
})

const options = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    title: {
      display: true,
      text: 'Demanda de fuga sin reparación'
    },
    legend: {
      display: false  
    }
  },

  scales: {
    x: {
      title: {
        display: true,
        text: 'Tiempo (hr)'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Demanda de fuga (L/s)'
      }
    }
  }
}

/* =========================
   EXPORTAR XLSX
========================= */
function exportData() {
  if (!props.data?.pipes) return

  const exportData = props.data.pipes.map(p => ({
    id: p.id,
    flowrate_lps: p.flowrate_lps
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, 'Flowrate')
  XLSX.writeFile(wb, 'flowrate.xlsx')
}

/* =========================
   EXPORTAR IMAGEN
========================= */
function exportImage() {
  const chart = chartRef.value?.chart
  if (!chart) return

  const url = chart.toBase64Image()

  const a = document.createElement('a')
  a.href = url
  a.download = 'flowrate.png'
  a.click()
}
</script>

<style scoped>
.chart-wrapper {
  height: 94%;
  display: flex;
  flex-direction: column;
}

.chart-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 10px;
}

button {
  background: #1f2937;
  color: white;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
}

.empty {
  color: #aaa;
  text-align: center;
}
</style>