<template>
  <n-card size="small" style="height:100%">
    <MapTabs
      :nodes="simulationResult?.nodes ?? []"
      :pipes="simulationResult?.pipes ?? []"
    />
  </n-card>
</template>

<script setup>
import MapTabs from './MapTabs.vue'
import { NCard } from 'naive-ui'


defineProps({
  simulationResult: Object
})
</script>
