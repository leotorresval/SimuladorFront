<template>
    <n-card title="DATOS GENERADOS" size="small" class="tables-panel">
      <!-- BOTONES DE DESCARGA -->
  <div class="download-actions">
    <n-button block secondary @click="downloadCSV">
      Descargar CSV
    </n-button>

    <n-button block type="primary" @click="downloadXLSX">
      Descargar XLSX
    </n-button>
  </div>

      <!-- TABS -->
      <n-tabs
        type="segment"
        v-model:value="activeTab"
          class="tabs-container"
      >
        <n-tab-pane name="summary" tab="Resumen">
          <n-scrollbar style="max-height: 100%">
            <SummaryTable />
          </n-scrollbar>
        </n-tab-pane>

        <n-tab-pane name="pipes" tab="Tuberías">
          <n-scrollbar style="max-height: 100%">
          <PipesTable />
          </n-scrollbar>
        </n-tab-pane>

        <n-tab-pane name="nodes" tab="Nodos">
          <n-scrollbar style="max-height: 100%">
            <NodesTable />
          </n-scrollbar>
        </n-tab-pane>

        <n-tab-pane name="leaks" tab="Fugas">
          <n-scrollbar style="max-height: 100%">
          <LeaksTable />
          </n-scrollbar>
        </n-tab-pane>
      </n-tabs>



    </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NTabs, NTabPane, NButton, NScrollbar, useNotification } from 'naive-ui'

import SummaryTable from './SummaryTable.vue'
import PipesTable from './PipesTable.vue'
import NodesTable from './NodesTable.vue'
import LeaksTable from './LeaksTable.vue'
import { setStatus } from '@/services/uiStatusStore'



//const API_BASE = 'https://simapi.torvalsoft.com/api'
const API_BASE = import.meta.env.VITE_API_BASE

const notification = useNotification()

/* =========================
   TAB ACTIVO
========================= */
const activeTab = ref('summary')

/* =========================
   DESCARGAS
========================= */
function downloadCSV () {
  downloadFile('csv')
}

function downloadXLSX () {
  downloadFile('xlsx')
}

async function downloadFile (format: 'csv' | 'xlsx') {
setStatus('info', 'Preparando descarga…')

  try {
    const response = await fetch(
      `${API_BASE}/export/${activeTab.value}?format=${format}`
    )

    // ❌ ERROR DEL BACKEND
    if (!response.ok) {
      const errorJson = await response.json()
      throw new Error(errorJson.message || 'Error al exportar datos')
    }

    // ✅ ARCHIVO CORRECTO
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab.value}.${format}`
    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    notification.success({
      title: 'Exportación completada',
      content: `La tabla "${activeTab.value}" se descargó en formato ${format.toUpperCase()}.`,
      duration: 3000
    })
  } catch (err: any) {
    notification.error({
      title: 'Error al exportar',
      content: err.message,
      duration: 5000
    })
  }
}



</script>

<style scoped>
.download-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.tables-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabs-container {
  flex: 1;
  min-height: 0; /* 🔥 MUY IMPORTANTE */
  display: flex;
  flex-direction: column;
}


</style>
