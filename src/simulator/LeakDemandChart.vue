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
  if (!props.data?.leak_demand_curve) return

  const { time, series } = props.data.leak_demand_curve

  // 🔥 FILTRAR SOLO LAS SERIES QUE TE INTERESAN
  const filteredSeries = series.filter(s => s.name.startsWith('Leak_'))

  // 🔥 HEADERS LIMPIOS
  const headers = ['time', ...filteredSeries.map(s => s.name)]

  // 🔥 FILAS
  const rows = time.map((t, i) => {
    const row = { time: t }

    filteredSeries.forEach(s => {
      row[s.name] = s.y[i]
    })

    return row
  })

  // 🔥 TABLA CONTROLADA (SIN BASURA)
  const ws = XLSX.utils.aoa_to_sheet([
    headers,
    ...rows.map(r => headers.map(h => r[h]))
  ])

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Leak Demand')

  XLSX.writeFile(wb, 'leak_demand.xlsx')
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
  width: 99%;
  height: 94%;
  padding: 12px;
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