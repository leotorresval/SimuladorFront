<template>
  <n-tabs
    type="line"
    animated
    v-model:value="activeTab"
  >
    <n-tab-pane name="map1" tab="MAPA 1">
      <MapView
        map-type="pressure"
        :nodes="nodes"
        :pipes="pipes"
        :active="activeTab === 'map1'"
      />
    </n-tab-pane>

    <n-tab-pane name="map2" tab="MAPA 2">
      <MapView
        map-type="damage"
        :nodes="nodes"
        :pipes="pipes"
        :active="activeTab === 'map2'"
      />
    </n-tab-pane>

    <n-tab-pane name="map3" tab="MAPA 3">
      <MapView
        map-type="pga"
        :nodes="nodes"
        :pipes="pipes"
        :active="activeTab === 'map3'"
      />
    </n-tab-pane>

    <n-tab-pane name="map4" tab="MAPA 4">
      <MapView
        map-type="rr"
        :nodes="nodes"
        :pipes="pipes"
        :active="activeTab === 'map4'"
      />
    </n-tab-pane>

    <n-tab-pane name="map5" tab="MAPA 5">
      <MapView
        map-type="combined"
        :nodes="nodes"
        :pipes="pipes"
        :active="activeTab === 'map5'"
      />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import { ref } from 'vue'
import { NTabs, NTabPane } from 'naive-ui'
import MapView from './MapView.vue'

defineProps({
  nodes: Array,
  pipes: Array
})

const activeTab = ref('map1')
</script>
