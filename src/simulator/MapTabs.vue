
<template>
    <div ref="tabsWrapper" class="tabs-wrapper">
      <div style="margin-bottom: 10px;">
        <label>
          <input type="checkbox" v-model="showBaseMap" />
          Mostrar mapa base
        </label>
      </div>
  <n-tabs
    type="line"
    animated
    scrollable
    v-model:value="activeTab"
  >
    <n-tab-pane name="map1" tab="PRESIÓN EN NODOS">
      <MapView
        map-type="pressure"
        :nodes="nodes"
        :pipes="pipes"
        :epicenter="epicenter"
        :showBaseMap="showBaseMap"
        :active="activeTab === 'map1'"
      />
    </n-tab-pane>

    <n-tab-pane name="map2" tab="DAÑO EN TUBERÍAS">
      <MapView
        map-type="damage"
        :nodes="nodes"
        :pipes="pipes"
        :epicenter="epicenter"
        :showBaseMap="showBaseMap"
        :active="activeTab === 'map2'"
      />
    </n-tab-pane>

    <n-tab-pane name="map3" tab="VELOCIDAD EN ROCA">
      <MapView
        map-type="pga"
        :nodes="nodes"
        :pipes="pipes"
        :epicenter="epicenter"
        :showBaseMap="showBaseMap"
        :active="activeTab === 'map3'"
      />
    </n-tab-pane>

    <n-tab-pane name="map4" tab="TASA DE REPARACIÓN">
      <MapView
        map-type="rr"
        :nodes="nodes"
        :pipes="pipes"
        :epicenter="epicenter"
        :showBaseMap="showBaseMap"
        :active="activeTab === 'map4'"
      />
    </n-tab-pane>
    <n-tab-pane name="map6" tab="CURVA DE FRAGILIDAD">
      <FragilityCurve
        :data="simulationResult.fragility_curve"
        :active="activeTab === 'map6'"
      />

    </n-tab-pane>
    <n-tab-pane name="map7" tab="DEMANDA DE FUGA">
      <LeakDemandChart
        :data="simulationResult"
        :active="activeTab === 'map7'"
      />

    </n-tab-pane>

  </n-tabs>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { NTabs, NTabPane } from 'naive-ui'
import MapView from './MapView.vue'
import { epicenter } from '@/services/simulationStore'
import FragilityCurve from './FragilityCurve.vue'
import LeakDemandChart from './LeakDemandChart.vue'
import { simulationResult} from '@/services/simulationStore'

defineProps({
  nodes: Array,
  pipes: Array
})

const showBaseMap = ref(true)

const activeTab = ref('map1')
const tabsWrapper = ref<HTMLElement | null>(null)

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!tabsWrapper.value) return

  resizeObserver = new ResizeObserver(() => {
    // fuerza re-render suave
    nextTick(() => {
      activeTab.value = activeTab.value
    })
  })

  resizeObserver.observe(tabsWrapper.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

</script>
<style scoped>
.tabs-wrapper {
  width: 100%;
  height: calc(100vh - 20%);
   overflow: hidden; 
}
:deep(.n-tabs),
:deep(.n-tabs-content),
:deep(.n-tab-pane) {
  height: 97%;
}
</style>