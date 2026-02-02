<template>
  <div class="split-layout">
    <!-- PANEL IZQUIERDO -->
    <div
      class="left-panel"
      :style="{ width: leftWidth + 'px' }"
    >
      <SimulatorPanel />
    </div>

    <!-- DIVISOR -->
    <div
      class="divider"
      @mousedown="startDrag"
    />

    <!-- PANEL DERECHO -->
    <div class="right-panel">
      <ParameterPanel />
      <TablesPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import SimulatorPanel from '@/simulator/SimulatorPanel.vue'
import ParameterPanel from '@/parameters/ParameterPanel.vue'
import TablesPanel from '@/tables/TablesPanel.vue'

/* ===== CONFIGURACIÓN ===== */
const MIN_LEFT = 700      // mínimo simulador
const MIN_RIGHT = 400     // mínimo parámetros

const leftWidth = ref(window.innerWidth * 0.65)
let isDragging = false

/* ===== DRAG LOGIC ===== */
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

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.split-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* IZQUIERDA */
.left-panel {
  height: 100%;
  overflow: auto;
  padding: 12px;
}

/* DERECHA */
.right-panel {
  flex: 1;
  min-width: 360px;
  height: 100%;
  overflow: auto;
  padding: 12px;
  border-left: 1px solid #e5e7eb;
}

/* DIVISOR */
.divider {
  width: 6px;
  cursor: col-resize;
  background-color: transparent;
}

.divider:hover {
  background-color: #d1d5db;
}
</style>
