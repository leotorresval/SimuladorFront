
<template>
  <n-tabs
    type="line"
    animated
    v-model:value="activeTab"
  >
    <n-tab-pane name="map1" tab="PRESIÓN EN NODOS">
      <MapView
        map-type="pressure"
        :nodes="nodes"
        :pipes="pipes"
        :epicenter="epicenter"

        :active="activeTab === 'map1'"
      />
    </n-tab-pane>

    <n-tab-pane name="map2" tab="DAÑO EN TUBERÍAS">
      <MapView
        map-type="damage"
        :nodes="nodes"
        :pipes="pipes"
        :epicenter="epicenter"

        :active="activeTab === 'map2'"
      />
    </n-tab-pane>

    <n-tab-pane name="map3" tab="VELOCIDAD EN ROCA">
      <MapView
        map-type="pga"
        :nodes="nodes"
        :pipes="pipes"
        :epicenter="epicenter"
        :active="activeTab === 'map3'"
      />
    </n-tab-pane>

    <n-tab-pane name="map4" tab="TASA DE REPARACIÓN">
      <MapView
        map-type="rr"
        :nodes="nodes"
        :pipes="pipes"
        :epicenter="epicenter"
        :active="activeTab === 'map4'"
      />
    </n-tab-pane>
    <n-tab-pane name="map6" tab="CURVA DE FRAGILIDAD">
      <FragilityCurve
        :data="simulationResult.fragility_curve"
        :active="activeTab === 'map6'"
      />

    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import { ref } from 'vue'
import { NTabs, NTabPane } from 'naive-ui'
import MapView from './MapView.vue'
import { epicenter } from '@/services/simulationStore'
import FragilityCurve from './FragilityCurve.vue'
import { simulationResult} from '@/services/simulationStore'
defineProps({
  nodes: Array,
  pipes: Array
})

const activeTab = ref('map1')
</script>
