<template>
  <div class="container">
    <!-- CONTROLES -->
    <div class="controls">
      <input type="file" @change="onFileChange" />
      <input type="number" v-model="magnitude" placeholder="Magnitud" />
      <input type="number" v-model="depth" placeholder="Profundidad" />
      <button @click="simulate">Simular</button>
    </div>

    <!-- MAPA -->
    <div id="map" class="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import axios from 'axios'

let map = null
let layers = []

const inpFile = ref(null)
const magnitude = ref(6)
const depth = ref(10000)

/* =========================
   MAP INIT
========================= */
onMounted(() => {
  map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -10
  })
})

/* =========================
   FILE
========================= */
function onFileChange(e) {
  inpFile.value = e.target.files[0]
}

/* =========================
   COLOR POR PRESIÓN
========================= */
function pressureColor(p) {
  if (p < 20) return '#8b0000'
  if (p < 30) return '#ff4500'
  if (p < 40) return '#ffa500'
  if (p < 50) return '#ffff00'
  return '#00aa00'
}

/* =========================
   LIMPIAR MAPA
========================= */
function clearMap() {
  layers.forEach(l => map.removeLayer(l))
  layers = []
}

/* =========================
   SIMULACIÓN
========================= */
async function simulate() {
  if (!inpFile.value) {
    alert('Selecciona un archivo INP')
    return
  }

  clearMap()

  const formData = new FormData()
  formData.append('inp_file', inpFile.value)
  formData.append('magnitude', magnitude.value)
  formData.append('depth', depth.value)

  const res = await axios.post(
    'https://simapi.torvalsoft.com/api/simulate',
    formData
  )

  const data = res.data
  console.log('DATA:', data)

  /* =========================
     CALCULAR BOUNDS
  ========================= */
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  data.nodes.forEach(n => {
    minX = Math.min(minX, n.x)
    minY = Math.min(minY, n.y)
    maxX = Math.max(maxX, n.x)
    maxY = Math.max(maxY, n.y)
  })

  console.log('BOUNDS:', minX, minY, maxX, maxY)

  /* =========================
     DIBUJAR NODOS
  ========================= */
  const nodeMap = {}

  data.nodes.forEach(n => {
    const circle = L.circle(
      [n.y, n.x],
      {
        radius: 15,
        color: pressureColor(n.pressure),
        fillOpacity: 0.8
      }
    ).bindTooltip(`
      <b>${n.id}</b><br/>
      Presión: ${n.pressure.toFixed(2)} m
    `)

    circle.addTo(map)
    layers.push(circle)

    nodeMap[n.id] = n
  })

  /* =========================
     DIBUJAR TUBERÍAS
  ========================= */
  data.pipes.forEach(p => {
    const from = nodeMap[p.from]
    const to = nodeMap[p.to]
    if (!from || !to) return

    let color = '#666'
    if (p.damage_state === 'Minor Leak') color = 'orange'
    if (p.damage_state === 'Major Leak') color = 'red'

    const line = L.polyline(
      [
        [from.y, from.x],
        [to.y, to.x]
      ],
      {
        color,
        weight: 3
      }
    ).bindTooltip(`
      <b>${p.id}</b><br/>
      Daño: ${p.damage_state ?? 'Ninguno'}<br/>
      Repair rate: ${p.repair_rate.toExponential(2)}
    `)

    line.addTo(map)
    layers.push(line)
  })

  /* =========================
     AJUSTAR VISTA
  ========================= */
  const bounds = L.latLngBounds(
    [minY, minX],
    [maxY, maxX]
  )

  map.fitBounds(bounds)
}
</script>

<style scoped>
.container {
  background: #1e1e1e;
  padding: 10px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.map {
  width: 100%;
  height: 600px;
  background: #b7dce8;
}
</style>
