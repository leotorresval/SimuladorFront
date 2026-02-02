<template>
  <n-layout has-sider class="main-layout">
    <n-layout-content class="left-panel">
      <SimulatorPanel />
    </n-layout-content>

    <n-layout-sider width="380" class="right-panel">
      <ParameterPanel />
      <TablesPanel />
    </n-layout-sider>
  </n-layout>
</template>

<script setup>
import { NLayout, NLayoutContent, NLayoutSider } from 'naive-ui'
import SimulatorPanel from '@/simulator/SimulatorPanel.vue'
import ParameterPanel from '@/parameters/ParameterPanel.vue'
import TablesPanel from '@/tables/TablesPanel.vue'
</script>
