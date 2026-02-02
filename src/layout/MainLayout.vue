<template>
  <div class="main-layout">

    <!-- FILA SUPERIOR: PARÁMETROS -->
    <div class="top-panel">
      <ParameterPanel @simulation-done="onSimulationDone" />

    </div>

    <!-- FILA INFERIOR: SIMULADOR + TABLAS -->
    <div class="bottom-panel">

      <!-- SIMULADOR -->
      <div
        class="left-panel"
        :style="{ width: leftWidth + 'px' }"
      >
        <SimulatorPanel :simulationResult="simulationResult" />

      </div>

      <!-- DIVISOR -->
      <div
        class="v-divider"
        @mousedown="startDrag"
      />

      <!-- TABLAS -->
      <div class="right-panel">
        <TablesPanel />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import ParameterPanel from '@/parameters/ParameterPanel.vue'
import SimulatorPanel from '@/simulator/SimulatorPanel.vue'
import TablesPanel from '@/tables/TablesPanel.vue'

const simulationResult = ref(null)

/* ===== CONFIG ===== */
const MIN_LEFT = 480
const MIN_RIGHT = 420

const leftWidth = ref(window.innerWidth * 0.6)
let isDragging = false

/* ===== DRAG HORIZONTAL ===== */
function startDrag() {
  isDragging = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.cursor = 'col-resize'
}

function onDrag(e: MouseEvent) {
  if (!isDragging) return

  const totalWidth = window.innerWidth
  const newLeft = e.clientX
  const rightWidth = totalWidth - newLeft

  if (newLeft < MIN_LEFT) return
  if (rightWidth < MIN_RIGHT) return

  leftWidth.value = newLeft
}

function stopDrag() {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.cursor = 'default'
}

function onSimulationDone(result: any) {
  simulationResult.value = result
}


onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== TOP: PARÁMETROS ===== */
.top-panel {
  flex-shrink: 0;
  padding: 0;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
}

/* ===== BOTTOM ===== */
.bottom-panel {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* SIMULADOR */
.left-panel {
  height: 100%;
  overflow: auto;
  padding: 12px;
}

/* TABLAS */
.right-panel {
  flex: 1;
  min-width: 420px;
  height: 100%;
  overflow: auto;
  padding: 12px;
  border-left: 1px solid #e5e7eb;
}

/* DIVISOR */
.v-divider {
  width: 6px;
  cursor: col-resize;
  background-color: transparent;
}

.v-divider:hover {
  background-color: #d1d5db;
}
</style>
