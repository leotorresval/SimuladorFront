<template>
  <div class="fragility-wrapper">
    <Line
      v-if="chartData && active"
      :key="active"
      ref="chartRef"
      :data="chartData"
      :options="options"
    />
    <div v-else class="empty">
      Ejecuta una simulación para ver la curva de fragilidad
    </div>
  </div>
</template>

<script setup>
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
      text: 'Fragility Curve'
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
        text: 'Repair rate × pipe length'
      }
    },
    y: {
      min: 0,
      max: 1,
      title: {
        display: true,
        text: 'Probability of exceeding a damage state'
      }
    }
  }
}

/* Datos del gráfico */
const chartData = computed(() => {
  if (!props.data || !props.data.x || !props.data.states) return null

  return {
datasets: props.data.states.map((state, idx) => ({
  label: state.name,
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
</script>

<style scoped>
.fragility-wrapper {
  width: 100%;
  height: 100%;
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
</style>
