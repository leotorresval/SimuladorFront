<template>
  <n-card title="TABLAS" size="small" class="tables-panel">
    <n-tabs type="segment">
      <n-tab-pane name="summary" tab="Resumen">
        <SummaryTable />
      </n-tab-pane>
      <n-tab-pane name="pipes" tab="Tuberías">
        <PipesTable />
      </n-tab-pane>
      <n-tab-pane name="nodes" tab="Nodos">
        <NodesTable />
      </n-tab-pane>
      <n-tab-pane name="leaks" tab="Fugas">
        <LeaksTable />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NTabs, NTabPane } from 'naive-ui'
import SummaryTable from './SummaryTable.vue'
import PipesTable from './PipesTable.vue'
import NodesTable from './NodesTable.vue'
import LeaksTable from './LeaksTable.vue'
</script>
