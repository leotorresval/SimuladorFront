<script setup>
import { onMounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* Color según probabilidad */
function getColor(p) {
  return p > 0.85 ? "#fde725" :
         p > 0.65 ? "#7ad151" :
         p > 0.45 ? "#22a884" :
         p > 0.25 ? "#2a788e" :
                    "#440154";
}

onMounted(() => {
  const map = L.map("map", {
    zoomControl: false,
    attributionControl: false
  }).setView([-1.25, -78.62], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    opacity: 0.15
  }).addTo(map);

  /* =========================
     NODOS DE LA RED
     ========================= */
  const nodes = [
    { id: "N1", lat: -1.23,  lng: -78.63,  pressure: 45 },
    { id: "N2", lat: -1.24,  lng: -78.625, pressure: 50 },
    { id: "N3", lat: -1.25,  lng: -78.62,  pressure: 42 },
    { id: "N4", lat: -1.26,  lng: -78.615, pressure: 38 },
    { id: "N5", lat: -1.27,  lng: -78.61,  pressure: 30 },
    { id: "N6", lat: -1.245, lng: -78.635, pressure: 48 },
    { id: "N7", lat: -1.245, lng: -78.61,  pressure: 44 },
    { id: "N8", lat: -1.265, lng: -78.62,  pressure: 36 }
  ];

  /* =========================
     SEGMENTOS (TUBERÍAS)
     ========================= */
  const network = [
    { from: "N1", to: "N2", p: 0.9 },
    { from: "N2", to: "N3", p: 0.7 },
    { from: "N3", to: "N4", p: 0.4 },
    { from: "N4", to: "N5", p: 0.2 },
    { from: "N2", to: "N6", p: 0.6 },
    { from: "N3", to: "N7", p: 0.8 },
    { from: "N4", to: "N8", p: 0.55 }
  ];

  /* Mapa rápido de nodos */
  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id] = n);

  /* Dibujar segmentos */
  network.forEach(seg => {
    const a = nodeMap[seg.from];
    const b = nodeMap[seg.to];

    L.polyline(
      [[a.lat, a.lng], [b.lat, b.lng]],
      {
        color: getColor(seg.p),
        weight: 4,
        opacity: 0.9
      }
    )
    .addTo(map)
    .bindTooltip(
      `<b>Tramo</b><br>
       ${seg.from} → ${seg.to}<br>
       Probabilidad: ${seg.p}`,
      { sticky: true }
    );
  });

  /* =========================
     DIBUJAR NODOS (VISTOSOS)
     ========================= */
  nodes.forEach(n => {
    L.circleMarker([n.lat, n.lng], {
      radius: 7,
      fillColor: "#ff5722",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 1
    })
    .addTo(map)
    .bindTooltip(
      `<b>Nodo ${n.id}</b><br>
       Presión: ${n.pressure} psi`,
      {
        direction: "top",
        sticky: true
      }
    );
  });
});
</script>

<template>
  <div id="map" class="map-container"></div>
</template>

<style scoped>
.map-container {
  height: 520px;
  width: 100%;
}
</style>
