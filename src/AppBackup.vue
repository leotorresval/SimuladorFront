<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import ParametersSection from './components/ParametersSection.vue'
import MapSection from './components/MapSection.vue'
import DataTableSection from './components/DataTableSection.vue'
import Tabs from './components/Tabs.vue'

const paramsRef = ref()
const simulationData = ref([])
const mapData = ref([])

const runSimulation = async () => {
  const magnitude = paramsRef.value.magnitude.value
  const depth = paramsRef.value.depth.value
  try {
    const response = await axios.post('http://localhost:3000/api/simulate', { magnitude, depth })
    simulationData.value = response.data.tableData
    mapData.value = response.data.mapData
  } catch (error) {
    console.error('Error en simulación:', error)
  }
}

const mapTabs = computed(() => [
  {
    title: 'Mapa de Red',
    component: MapSection,
    props: { mapData: mapData.value }
  }
])

const tableTabs = computed(() => [
  {
    title: 'Tablas de Resultados',
    component: DataTableSection,
    props: { rows: simulationData.value }
  }
])
</script>

<template>
  <div id="app">
    <main class="dashboard-main">
      <div class="left-panel">
        <Tabs :tabs="mapTabs" />
      </div>
      <div class="right-panel">
        <div class="top-section">
          <div class="mini-header">
            <h1>Dashboard de Simulación de Tuberías</h1>
            <button @click="runSimulation" class="run-button">Ejecutar Simulación</button>
          </div>
          <ParametersSection ref="paramsRef" />
        </div>
        <div class="bottom-section">
          <Tabs :tabs="tableTabs" />
        </div>
      </div>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: white;
  color: #333;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

#app {
  height: 100vh;
}

.dashboard-main {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.left-panel {
  flex: 3; /* 60% aproximadamente */
  display: flex;
  flex-direction: column;
  background-color: transparent;
}

.right-panel {
  flex: 2; /* 40% */
  display: flex;
  flex-direction: column;
}

.top-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: transparent;
}

.mini-header {
  background-color: #2c3e50;
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.mini-header h1 {
  font-size: 1.2rem;
  margin: 0;
}

.run-button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.run-button:hover {
  background-color: #2980b9;
}

.bottom-section {
  flex: 1;
  background-color: transparent;
  overflow: hidden;
}

@media (max-width: 768px) {
  .dashboard-main {
    flex-direction: column;
  }
  .left-panel, .right-panel {
    flex: 1;
  }
  .top-section, .bottom-section {
    flex: 1;
  }
}
</style>
