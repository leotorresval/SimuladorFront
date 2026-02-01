<template>
  <div class="map-section">
    <h3>Mapa de Red</h3>
    <div id="map" ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapData {
  lat: number
  lng: number
  label: string
}

const props = defineProps<{
  mapData: MapData[]
}>()

const mapContainer = ref<HTMLElement>()
let map: L.Map | null = null
let markers: L.Marker[] = []

onMounted(() => {
  if (mapContainer.value) {
    map = L.map(mapContainer.value).setView([-1.8312, -78.1834], 7) // Centro de Ecuador

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)
  }
})

watch(() => props.mapData, (newData) => {
  if (map) {
    // Limpiar marcadores anteriores
    markers.forEach(marker => map!.removeLayer(marker))
    markers = []

    if (newData.length > 0) {
      // Agregar nuevos marcadores
      newData.forEach(point => {
        const marker = L.marker([point.lat, point.lng]).addTo(map!).bindPopup(point.label)
        markers.push(marker)
      })
      // Ajustar vista al primer punto
      map.setView([newData[0].lat, newData[0].lng], 13)
    }
  }
}, { deep: true })
</script>

<style scoped>
.map-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.map-container {
  flex: 1;
  border-radius: 4px;
  overflow: hidden;
}
</style>