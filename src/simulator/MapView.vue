<template>
  <div class="map-wrapper">
    
    <!-- BOTONES -->
    <div class="map-actions">
      <button @click="exportImage">PNG</button>
    </div>

    <!-- MAPA -->
    <div ref="mapRef" class="map-container"></div>

  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import L from 'leaflet'
import SimpleMapScreenshoter from 'leaflet-simple-map-screenshoter'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  mapType: String,
  nodes: Array,
  pipes: Array,
  epicenter: Object,
  active: Boolean,
  showBaseMap: Boolean
})

const mapRef = ref(null)
let map = null
let layerGroup = null
let legendControl = null
let epicenterLayer = null
let waveInterval = null
let hasFitted = false
let baseLayer = null
let screenshoter = null
/* =========================
   COLORES
========================= */
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

/* =========================
   LEYENDA
========================= */
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
  console.log('MAP TYPE:', props.mapType)
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

/* =========================
   DIBUJAR MAPA
========================= */
function drawMap({ fit = false } = {}) {
  if (!map || !layerGroup || !props.nodes?.length) return

  layerGroup.clearLayers()

  const nodeMap = {}
  let minLat = Infinity, minLng = Infinity
  let maxLat = -Infinity, maxLng = -Infinity

  props.nodes.forEach(n => {
    if (n.lat == null || n.lng == null) return
    nodeMap[n.id] = n
    minLat = Math.min(minLat, n.lat)
    minLng = Math.min(minLng, n.lng)
    maxLat = Math.max(maxLat, n.lat)
    maxLng = Math.max(maxLng, n.lng)
  })

  /* ---- TUBERÍAS ---- */
  props.pipes?.forEach(p => {
    const from = nodeMap[p.from]
    const to = nodeMap[p.to]
    if (!from || !to) return

    L.polyline(
      [[from.lat, from.lng], [to.lat, to.lng]],
      { color: pipeColor(p), weight: 3, opacity: 0.85 }
    )
      .bindTooltip(
        `<b>Tubería:</b> ${p.id}<br/>
         <b>Material:</b> ${p.material}<br/>
         <b>Diámetro:</b> ${p.diameter ?? 'N/A'}<br/>
         <b>Longitud:</b> ${p.length?.toFixed(2)} m<br/>
         <b>Velocidad:</b> ${Number(p.speed).toFixed(2)} m/s <br/>
         <b>Caudal:</b> ${Number(p.flowrate_lps ?? p.flowrate ?? 0).toFixed(2)} L/s<br/>`
      )
      .addTo(layerGroup)
  })

  /* ---- NODOS ---- */
  props.nodes.forEach(n => {
    if (n.lat == null || n.lng == null) return

    L.circleMarker([n.lat, n.lng], {
      radius: getRadiusByZoom(),
      color: pressureColor(n.pressure),
      fillOpacity: 0.9
    })
      .bindTooltip(
        `<b>Nodo:</b> ${n.id}<br/>
         <b>Cota:</b> ${n.elevation.toFixed(2)} m<br/>
         <b>Presión:</b> ${n.pressure.toFixed(2)} m<br/>
         <b>Demanda:</b> ${n.demand_lps.toFixed(3)} L/s`
      )
      .addTo(layerGroup)
  })

  if ((fit || !hasFitted) && isFinite(minLat)) {
    map.fitBounds([[minLat, minLng], [maxLat, maxLng]])
    hasFitted = true
  }

  drawEpicenter()
  createLegend()
}

/* =========================
   EPICENTRO
========================= */
function drawEpicenter() {
  if (!map || !props.epicenter?.lat || !props.epicenter?.lng) return

  if (epicenterLayer) epicenterLayer.remove()
  if (waveInterval) clearInterval(waveInterval)

  epicenterLayer = L.layerGroup().addTo(map)

  const { lat, lng, magnitude, depth } = props.epicenter

  const core = L.circleMarker([lat, lng], {
    radius: 7,
    color: '#000',
    fillColor: 'red',
    fillOpacity: 1
  })
    .bindTooltip(
      `<b>Epicentro</b><br/>
       Lat: ${lat.toFixed(5)}<br/>
       Lng: ${lng.toFixed(5)}<br/>
       Magnitud: ${magnitude ?? 'N/A'}<br/>
       Profundidad: ${depth ?? 'N/A'} km`,
      { sticky: true }
    )
    .addTo(epicenterLayer)

  core.bringToFront()

  let radius = 8
  let opacity = 0.5

  const wave = L.circleMarker([lat, lng], {
    radius,
    color: 'red',
    weight: 2,
    fillOpacity: 0,
    interactive: false
  }).addTo(epicenterLayer)

  waveInterval = setInterval(() => {
    radius += 2
    opacity -= 0.03
    if (opacity <= 0) {
      radius = 8
      opacity = 0.5
    }
    wave.setRadius(radius)
    wave.setStyle({ opacity })
  }, 60)
}

function toggleBaseMap(show) {
  if (!map || !baseLayer) return

  if (show) {
    map.addLayer(baseLayer)
  } else {
    map.removeLayer(baseLayer)
  }
}

function getRadiusByZoom() {
  const zoom = map.getZoom()
  return Math.max(2, (zoom - 12) * 1.2)
}

async function exportImage() {
  if (!screenshoter) return

  try {
    const mapImage = await screenshoter.takeScreen('image')

    const img = new Image()
    img.src = mapImage

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = img.width
      canvas.height = img.height

      // 🗺 dibujar mapa
      ctx.drawImage(img, 0, 0)

      // 📌 dibujar leyenda
      drawLegend(ctx, canvas.width, canvas.height)

      // 💾 descargar
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = 'map.png'
      link.click()
    }

  } catch (e) {
    console.error('Error exportando mapa', e)
  }
}

function drawLegend(ctx, width, height) {
  const legend = getLegendItems()
  if (!legend) return

  const { title, items } = legend

  const boxWidth = 140
  const boxHeight = 30 + items.length * 20

  const x = width - boxWidth - 10
  let y = height - boxHeight - 10

  // fondo
  ctx.fillStyle = 'white'
  ctx.fillRect(x, y, boxWidth, boxHeight)

  ctx.strokeStyle = '#ccc'
  ctx.strokeRect(x, y, boxWidth, boxHeight)

  // título
  ctx.fillStyle = 'black'
  ctx.font = 'bold 12px Arial'
  ctx.fillText(title, x + 10, y + 15)

  // items
  ctx.font = '12px Arial'
  y += 25

  items.forEach(item => {
    ctx.fillStyle = item.color
    ctx.fillRect(x + 10, y - 8, 12, 12)

    ctx.fillStyle = 'black'
    ctx.fillText(item.label, x + 30, y)

    y += 18
  })
}

function getLegendItems() {
  if (props.mapType === 'pressure') {
    return {
      title: 'Presión (m)',
      items: [
        { color: '#d73027', label: '< 5' },
        { color: '#fc8d59', label: '5 – 15' },
        { color: '#fee08b', label: '15 – 30' },
        { color: '#d9ef8b', label: '30 – 50' },
        { color: '#1a9850', label: '> 50' }
      ]
    }
  }

  if (props.mapType === 'damage') {
    return {
      title: 'Daño',
      items: [
        { color: '#d73027', label: 'Major Leak' },
        { color: '#fc8d59', label: 'Minor Leak' },
        { color: '#91bfdb', label: 'Sin daño' }
      ]
    }
  }

  if (props.mapType === 'pga') {
    return {
      title: 'PGA',
      items: [
        { color: '#d73027', label: '> 0.5' },
        { color: '#fc8d59', label: '0.3 – 0.5' },
        { color: '#fee08b', label: '< 0.3' }
      ]
    }
  }

  if (props.mapType === 'rr') {
    return {
      title: 'Repair Rate',
      items: [
        { color: '#d73027', label: '> 0.3' },
        { color: '#fc8d59', label: '0.1 – 0.3' },
        { color: '#1a9850', label: '< 0.1' }
      ]
    }
  }

  return null
}

/* =========================
   WATCHERS
========================= */
watch(
  () => props.active,
  async isActive => {
    if (!isActive) return
    await nextTick()

    if (!map && mapRef.value) {
      map = L.map(mapRef.value)
      
      baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)
      // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //   attribution: '&copy; OpenStreetMap contributors'
      // }).addTo(map)

        screenshoter = new SimpleMapScreenshoter({
          hidden: true
        }).addTo(map)

        if (!props.showBaseMap) {
          map.removeLayer(baseLayer)
        }


      layerGroup = L.layerGroup().addTo(map)
      hasFitted = false
              map.on('zoomend', () => {
          drawMap({ fit: false })
        })
    }

setTimeout(() => {
  map.invalidateSize()
  drawMap({ fit: false })
}, 100)
  },
  { immediate: true }
)



watch(
  () => [props.nodes, props.pipes],
  () => drawMap({ fit: true }),
  { deep: true }
)

watch(
  () => props.mapType,
  () => {drawMap({ fit: false })
 createLegend()  }
)

watch(
  () => props.epicenter,
  () => drawEpicenter(),
  { deep: true }
)

watch(
  () => props.showBaseMap,
  (val) => {
    toggleBaseMap(val)
  }
)



</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 470px;
    position: relative;
  z-index: 0;  
}

:deep(.map-legend) {
  background: white;
  padding: 8px 10px;
  font-size: 12px;
  border-radius: 4px;
  box-shadow: 0 0 6px rgba(0,0,0,0.2);
  z-index: 1000;
}

:deep(.map-legend h4) {
  margin: 0 0 6px;
  font-size: 13px;
}

.leaflet-control .map-legend {
  background: white;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 18px;
  color: #333;
  border-radius: 4px;
  box-shadow: 0 0 6px rgba(0,0,0,0.3);
  z-index: 1000;
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;

  display: flex;
  gap: 8px;
}

.map-actions button {
  background: white;
  border: 1px solid #ccc;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 6px;
}

.leaflet-container {
  background: white !important;
}

</style>
