<template>
  <n-card title="TABLAS" size="small" class="tables-panel">
    <n-tabs type="segment">
      <n-tab-pane name="t1" tab="Tabla 1">
        <TablePlaceholder />
      </n-tab-pane>
      <n-tab-pane name="t2" tab="Tabla 2">
        <TablePlaceholder />
      </n-tab-pane>
      <n-tab-pane name="t3" tab="Tabla 3">
        <TablePlaceholder />
      </n-tab-pane>
      <n-tab-pane name="t4" tab="Tabla 4">
        <TablePlaceholder />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup>
import { NCard, NTabs, NTabPane } from 'naive-ui'
import TablePlaceholder from './TablePlaceholder.vue'
</script>
