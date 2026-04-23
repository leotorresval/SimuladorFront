<template>
<div class="fragility-wrapper">
  
  <!-- CASO: hay datos -->
  <div v-if="chartData && active" class="chart-container">
    
    <!-- BOTONES -->
    <div class="chart-actions">
      <button @click="exportFragility">XLSX</button>
      <button @click="exportImage">PNG</button>
    </div>

    <!-- GRÁFICA -->
    <Line
      :key="active"
      ref="chartRef"
      :data="chartData"
      :options="options"
    />

  </div>

  <!-- CASO: no hay datos -->
  <div v-else class="empty">
    Ejecuta una simulación para ver la curva de fragilidad
  </div>

</div>
</template>

<script setup>
import * as XLSX from 'xlsx'
import { computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

/* Registrar componentes de Chart.js */
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

/* Props */
const props = defineProps({
  data: {
    type: Object,
    default: null
  },
  active: {
    type: Boolean,
    default: false
  }
})

const chartRef = ref(null)

/* Opciones del gráfico */
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Curva de fragilidad considerando incertidumbre en parámetros'
    },
    legend: {
      position: 'top'
    }
  },
  scales: {
    x: {
      type: 'linear',
      title: {
        display: true,
        text: 'Aceleración máxima - PGA [g]'
      }
    },
    y: {
      min: 0,
      max: 1,
      title: {
        display: true,
        text: 'Probabilidad de falla'
      }
    }
  }
}

/* Datos del gráfico */
const chartData = computed(() => {
  if (!props.data || !props.data.x || !props.data.states) return null

  return {
datasets: props.data.states.map((state, idx) => ({
  label: idx === 0 ? 'Estado de daño menor' : 'Estado de daño mayor',
  data: props.data.x.map((xVal, i) => ({
    x: xVal,
    y: state.y[i]
  })),

  fill: 'origin',
  tension: 0.4,
  pointRadius: 0,
  borderWidth: 2,

  borderColor: idx === 0 ? '#1f77b4' : '#ff7f0e',
  backgroundColor:
    idx === 0
      ? 'rgba(31,119,180,0.35)'
      : 'rgba(255,127,14,0.35)',

  // 👇 CLAVE ABSOLUTA
  order: idx === 0 ? 2 : 1
}))

  }
})


function exportFragility() {
  const x = props.data.x
  const states = props.data.states

  const rows = x.map((val, i) => {
    const row = { x: val }

    states.forEach(state => {
      row[state.name] = state.y[i]
    })

    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, "Fragility")

  XLSX.writeFile(workbook, "fragility_curve.xlsx")
}

function exportImage() {
  const chart = chartRef.value?.chart
  const url = chart.toBase64Image()

  const link = document.createElement('a')
  link.href = url
  link.download = 'fragility_curve.png'
  link.click()
}

</script>

<style scoped>
.fragility-wrapper {
  width: 99%;
  height: 99%;
  padding: 12px;
}

.empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-style: italic;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.chart-actions button {
  background: rgba(255,255,255,0.9);
  border: 1px solid #ccc;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  border-radius: 4px;
}

.chart-actions button:hover {
  background: #f0f0f0;
}
</style>
