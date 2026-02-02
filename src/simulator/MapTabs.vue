<template>
  <n-tabs type="line" animated>
    <n-tab-pane name="map1" tab="MAPA 1">
      <MapView />
    </n-tab-pane>

    <n-tab-pane name="map2" tab="MAPA 2">
      <MapView />
    </n-tab-pane>

    <n-tab-pane name="map3" tab="MAPA 3">
      <MapView />
    </n-tab-pane>

    <n-tab-pane name="map4" tab="MAPA 4">
      <MapView />
    </n-tab-pane>

    <n-tab-pane name="map5" tab="MAPA 5">
      <MapView />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import { NTabs, NTabPane } from 'naive-ui'
import MapView from './MapView.vue'
</script>
