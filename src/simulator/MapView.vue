<template>
  <div ref="mapRef" class="map-container"></div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { epicenter } from '../services/simulationStore'

const props = defineProps({
  mapType: String,
  nodes: Array,
  pipes: Array,
  epicenter: Object,
  active: Boolean
})

const mapRef = ref(null)
let map = null
let layerGroup = null
let legendControl = null
let hasFitted = false
let epicenterLayer = null
let waveInterval = null

function pressureColor(p) {
  if (p < 5) return '#d73027'
  if (p < 15) return '#fc8d59'
  if (p < 30) return '#fee08b'
  if (p < 50) return '#d9ef8b'
  return '#1a9850'
}

function pipeColor(p) {
  if (props.mapType === 'damage') {
    if (p.damage_state === 'Major Leak') return '#d73027'
    if (p.damage_state === 'Minor Leak') return '#fc8d59'
    return '#91bfdb'
  }
  if (props.mapType === 'pga') {
    if (p.pga > 0.5) return '#d73027'
    if (p.pga > 0.3) return '#fc8d59'
    return '#fee08b'
  }
  if (props.mapType === 'rr') {
    if (p.repair_rate > 0.3) return '#d73027'
    if (p.repair_rate > 0.1) return '#fc8d59'
    return '#1a9850'
  }
  return '#666'
}

function getLegendHTML() {
  if (props.mapType === 'pressure') {
    return `
      <h4>Presión (m)</h4>
      <i style="background:#d73027"></i> &lt; 5<br/>
      <i style="background:#fc8d59"></i> 5 – 15<br/>
      <i style="background:#fee08b"></i> 15 – 30<br/>
      <i style="background:#d9ef8b"></i> 30 – 50<br/>
      <i style="background:#1a9850"></i> &gt; 50
    `
  }
  if (props.mapType === 'damage') {
    return `
      <h4>Daño</h4>
      <i style="background:#d73027"></i> Major Leak<br/>
      <i style="background:#fc8d59"></i> Minor Leak<br/>
      <i style="background:#91bfdb"></i> Sin daño
    `
  }
  if (props.mapType === 'pga') {
    return `
      <h4>PGA</h4>
      <i style="background:#d73027"></i> &gt; 0.5<br/>
      <i style="background:#fc8d59"></i> 0.3 – 0.5<br/>
      <i style="background:#fee08b"></i> &lt; 0.3
    `
  }
  if (props.mapType === 'rr') {
    return `
      <h4>Repair Rate</h4>
      <i style="background:#d73027"></i> &gt; 0.3<br/>
      <i style="background:#fc8d59"></i> 0.1 – 0.3<br/>
      <i style="background:#1a9850"></i> &lt; 0.1
    `
  }
  return ''
}

function createLegend() {
  if (!map) return

  if (legendControl) {
    legendControl.remove()
    legendControl = null
  }

  const html = getLegendHTML()
  if (!html) return

  legendControl = L.control({ position: 'bottomright' })
  legendControl.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-legend')
    div.innerHTML = html
    return div
  }
  legendControl.addTo(map)
}

function drawMap({ fit = false } = {}) {
  if (!map || !layerGroup || !props.nodes?.length) return

  layerGroup.clearLayers()

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  const nodeMap = {}

  props.nodes.forEach(n => {
    nodeMap[n.id] = n
    minX = Math.min(minX, n.x)
    minY = Math.min(minY, n.y)
    maxX = Math.max(maxX, n.x)
    maxY = Math.max(maxY, n.y)
  })

  // Tuberías primero
  if (props.pipes?.length) {
    props.pipes.forEach(p => {
      const from = nodeMap[p.from]
      const to = nodeMap[p.to]
      if (!from || !to) return

      L.polyline(
        [[from.y, from.x], [to.y, to.x]],
        { color: pipeColor(p), weight: 3, opacity: 0.8 }
      )
        .bindTooltip(
          `<b>Tubería:</b> ${p.id}<br/>
           <b>Material:</b> ${p.material}<br/> 
           <b>Diametro:</b> ${p.diameter ?? 'Ninguno'}<br/>
           <b>Longitud:</b> ${p.length.toFixed(3) ?? 'Ninguno'} m<br/>
           <b>Velocidad: ${Number(p.speed).toFixed(2)} m/s<br/>`
        )
        .addTo(layerGroup)
    })
  }

  // Nodos encima
  props.nodes.forEach(n => {
    L.circle([n.y, n.x], {
      radius: 12,
      color: pressureColor(n.pressure),
      fillOpacity: 0.9
    })
      .bindTooltip(
        `<b>Nodo:</b> ${n.id}<br/>
         <b>Cota:</b> ${Number(n.elevation).toFixed(2)} m <br/>
         <b>Presión:</b> ${Number(n.pressure).toFixed(2)} m<br/>
         <b>Demanda:</b> ${Number(n.demand).toFixed(2)} L/s`
         
      )
      .addTo(layerGroup)
  })

  if ((fit || !hasFitted) && isFinite(minX)) {
    const bounds = L.latLngBounds([minY, minX], [maxY, maxX])
    map.fitBounds(bounds)
    hasFitted = true
  }

  drawEpicenter()
  createLegend()
}



function drawEpicenter() {
  if (!map || !props.epicenter?.x || !props.epicenter?.y) return

  // Limpiar anterior
  if (epicenterLayer) {
    epicenterLayer.remove()
    epicenterLayer = null
  }
  if (waveInterval) {
    clearInterval(waveInterval)
    waveInterval = null
  }

  epicenterLayer = L.layerGroup().addTo(map)

  const lat = props.epicenter.y
  const lng = props.epicenter.x
  const depth = props.epicenter.depth
  const magnitude = props.epicenter.magnitude

  // 🔴 NÚCLEO (tooltip AQUÍ)
  const core = L.circleMarker(
    [lat, lng],
    {
      radius: 7,
      color: '#000',
      fillColor: 'red',
      fillOpacity: 1,
      interactive: true   // 🔥 CLAVE
    }
  )
    .bindTooltip(
      `<b>Epicentro</b><br/>
       X: ${lng.toFixed(2)}<br/>
       Y: ${lat.toFixed(2)}<br/>
       Magnitud: ${props.epicenter.magnitude ?? 'N/A'}<br/>
       Profundidad: ${props.epicenter.depth ?? 'N/A'} km`,
      {
        direction: 'top',
        offset: [0, -8],
        sticky: true       // 🔥 CLAVE
      }
    )
    .addTo(epicenterLayer)

  core.bringToFront() // 🔥 CLAVE

  // 🌊 ONDA EXPANSIVA (NO interactiva)
  let radius = 8
  let opacity = 0.5

  const wave = L.circleMarker(
    [lat, lng],
    {
      radius,
      color: 'red',
      weight: 2,
      fillOpacity: 0,
      interactive: false  // 🔥 CLAVE
    }
  ).addTo(epicenterLayer)

  waveInterval = setInterval(() => {
    radius += 2
    opacity -= 0.02

    if (opacity <= 0) {
      radius = 8
      opacity = 0.5
    }

    wave.setRadius(radius)
    wave.setStyle({ opacity })
  }, 60)
}

/* =========================
   1) Crear mapa cuando el tab está activo
========================= */
watch(
  () => props.active,
  async (isActive) => {
    if (!isActive) return

    await nextTick()

    if (!map && mapRef.value) {
      // crear mapa si no existe
      map = L.map(mapRef.value, {
        crs: L.CRS.Simple,
        zoomControl: true,
        minZoom: -10
      })
      layerGroup = L.layerGroup().addTo(map)
      hasFitted = false

    }

    if (map) {
      setTimeout(() => {
        map.invalidateSize()

        // 🔥 CLAVE: redibujar capas al volver al tab
        drawMap({ fit: false })
      }, 60)
    }
  },
  { immediate: true }
)

/* =========================
   2) Redibujar cuando llegan datos (Simular)
   -> aquí SÍ hacemos fitBounds
========================= */
watch(
  () => [props.nodes, props.pipes],
  () => {
    drawMap({ fit: true })
  },
  { deep: true, immediate: true }
)

/* =========================
   3) Redibujar al cambiar mapType (cambio de tab)
   -> NO hacemos fitBounds para no “saltar” la cámara
========================= */
watch(
  () => props.mapType,
  () => {
    drawMap({ fit: false })
  }
)

/* =========================
   4) Redibujar al cambiar epicenter
========================= */
watch(
  () => props.epicenter,
  () => {
    drawEpicenter()
  },
  { deep: true }
)

</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 370px; /* mantiene el tamaño que tenías */
  background: #fafafa;
}

:deep(.map-legend) {
  background: white;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 18px;
  color: #333;
  border-radius: 4px;
  box-shadow: 0 0 6px rgba(0,0,0,0.2);
}

:deep(.map-legend h4) {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 600;
}

:deep(.map-legend i) {
  width: 14px;
  height: 14px;
  float: left;
  margin-right: 6px;
  opacity: 0.9;
}


.epicenter-emoji {
  font-size: 26px;
  text-shadow: 0 0 6px rgba(255, 0, 0, 0.6);
}

:deep(.epicenter-emoji) {
  font-size: 20px;
  text-shadow: 0 0 8px rgba(255, 0, 0, 0.7);
}


</style>
