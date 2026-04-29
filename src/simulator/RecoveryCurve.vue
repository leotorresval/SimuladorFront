<template>
  <div class="chart-wrapper">

    <!-- BOTONES (overlay arriba izquierda) -->
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
      Ejecuta una simulación para ver la curva de recuperación
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
  resilience: Object,
  active: Boolean
})

const chartRef = ref(null)


// ===============================
// 📊 DATA
// ===============================
const chartData = computed(() => {
  if (!props.data) return null

  return {
    labels: props.data.time,
    datasets: [
      {
        label: 'Sin reparación',
        data: props.data.no_repair,
        borderColor: '#e53935', // rojo
        backgroundColor: '#e53935',
        borderWidth: 1.7,
        pointRadius: 2,
        tension: 0
      },
      {
        label: 'Con reparación',
        data: props.data.repair,
        borderColor: '#43a047', // verde
        backgroundColor: '#43a047',
        borderWidth: 4,
        pointRadius: 1.5,
        tension: 0
      }
    ]
  }
})


// ===============================
// 📏 Líneas verticales
// ===============================
const verticalLinesPlugin = {
  id: 'verticalLines',
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart
    if (!props.data) return

    const xScale = scales.x

    const drawLine = (xValue, label) => {
      const x = xScale.getPixelForValue(xValue)
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x, chartArea.top)
      ctx.lineTo(x, chartArea.bottom)
      ctx.lineWidth = 2
      ctx.strokeStyle = '#000'
      ctx.setLineDash([6, 6])
      ctx.stroke()

      ctx.fillStyle = '#000'
      ctx.fillText(label, x + 5, chartArea.top + 10)
      ctx.restore()
    }

    drawLine(props.data.event_time, 'Evento')
    drawLine(props.data.repair_time, 'Reparación')
  }
}


// ===============================
// ⚙️ OPTIONS
// ===============================
const options = computed(() => {
  if (!props.data) return {}

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Curva de recuperación del sistema Q(t)'
      },
      legend: {
        display: true
      },
      tooltip: {
        callbacks: {
          afterLabel: (ctx) => {
            if (!props.resilience) return ''
            return ctx.datasetIndex === 0
              ? `RS: ${props.resilience.no_repair}`
              : `RS: ${props.resilience.repair}`
          }
        }
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
        min: 0,
        max: 1.05,
        title: {
          display: true,
          text: 'Funcionalidad Q(t)'
        }
      }
    }
  }
})


// ===============================
// 📤 EXPORT XLSX
// ===============================
function exportData() {
  if (!props.data) return

  const rows = props.data.time.map((t, i) => ({
    Tiempo: t,
    Sin_reparacion: props.data.no_repair[i],
    Con_reparacion: props.data.repair[i]
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Recovery')

  XLSX.writeFile(wb, 'recovery_curve.xlsx')
}


// ===============================
// 🖼 EXPORT PNG
// ===============================
function exportImage() {
  if (!chartRef.value) return

  const chart = chartRef.value.chart
  const link = document.createElement('a')

  link.href = chart.toBase64Image()
  link.download = 'recovery_curve.png'
  link.click()
}
</script>


<style scoped>
.chart-wrapper {
  position: relative; /* 🔥 clave para overlay */
  height: 100%;
}

/* BOTONES flotantes */
.chart-actions {
  position: absolute;
  top: 10px;
  right: 10px; /* 👈 ahora a la izquierda */
  z-index: 10;

  display: flex;
  gap: 10px;
}

/* botones estilo simple */
.chart-actions button {
  background: #1f2d3d;
  color: white;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.chart-actions button:hover {
  opacity: 0.8;
}

.empty {
  text-align: center;
  margin-top: 40px;
  color: #999;
}
</style>