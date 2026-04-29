<template>
  <div class="chart-wrapper">

<div v-if="chartData && active" class="chart-container">

  <!-- BOTONES -->
  <div class="chart-actions">
    <button @click="exportData">XLSX</button>
    <button @click="exportImage">PNG</button>
  </div>

  <!-- GRÁFICA -->
  <Line
    ref="chartRef"
    :data="chartData"
    :options="options"
  />
</div>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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

const chartData = computed(() => {
  if (!props.data) return null

  return {
    labels: props.data.time,
      datasets: [
        {
          label: 'Presión promedio (m)',
          data: props.data.values,
          tension: 0,

          borderColor: '#36A2EB',          // 🔵 línea azul fuerte
          backgroundColor: 'rgba(54,162,235,0.2)', // área suave
          pointBackgroundColor: '#36A2EB',
          pointBorderColor: '#fff',
          pointRadius: 3,

          borderWidth: 2,
          fill: true
        }
      ]
  }
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#666'
      },
      title: {
        display: true,
        text: 'Tiempo (hr)',
        color: '#333'
      }
    },
    y: {
      ticks: {
        color: '#666'
      },
      title: {
        display: true,
        text: 'Presión promedio (m)',
        color: '#333'
      }
    }
  }
}

function exportImage() {
  const chart = chartRef.value?.chart
  if (!chart) return

  const link = document.createElement('a')
  link.href = chart.toBase64Image()
  link.download = 'pressure_avg.png'
  link.click()
}

function exportData() {
  if (!props.data) return

  const rows = props.data.time.map((t, i) => ({
    Tiempo: t,
    Presion: props.data.values[i]
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'PresionPromedio')

  XLSX.writeFile(wb, 'pressure_avg.xlsx')
}
</script>

<style scoped>
.chart-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* BOTONES A LA DERECHA (flotantes) */
.chart-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

/* 🔥 BOTONES NEGROS */
.chart-actions button {
  background: #000;
  color: #fff;
  border: 1px solid #000;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

/* hover */
.chart-actions button:hover {
  background: #222;
  border-color: #222;
}

/* click */
.chart-actions button:active {
  transform: scale(0.95);
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.chart-container {
  position: relative;   /* 🔥 clave para overlay */
  flex: 1;
  min-height: 0;
}

</style>