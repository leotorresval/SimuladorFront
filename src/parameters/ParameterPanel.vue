<template>
  <n-card size="small" class="param-card">
    <!-- HEADER -->
    <div class="param-header">
      PARÁMETROS
    </div>

        <!-- PANEL DE ESTADO
<transition name="status-fade">
  <n-alert
    v-if="uiStatus"
    :type="uiStatus.type"
    show-icon
    closable
    @close="clearStatus"
    class="status-alert"
  >
    {{ uiStatus.message }}
  </n-alert>
</transition> -->


    <!-- FORM -->
    <n-form label-placement="top">
      <n-grid :cols="6" x-gap="20" y-gap="8">

        <!-- ARCHIVO INP -->
        <n-grid-item >
          <n-form-item label="Archivo INP" :show-feedback="false">
            <n-upload :max="1" @change="onFileChange">
              <n-button block>
                Seleccionar archivo
              </n-button>
            </n-upload>
          </n-form-item>
        </n-grid-item>

                <!-- EJE_X -->
        <n-grid-item>
          <n-form-item label="Longitud / Eje x" :show-feedback="false">
            <n-input-number v-model:value="x" :min="166000" :max="834000" :step="500" style="width: 100%" />
          </n-form-item>
        </n-grid-item>

        <!-- EJE_Y -->
        <n-grid-item>
          <n-form-item label="Latitud / Eje y" :show-feedback="false">
            <n-input-number v-model:value="y" :min="0" :max="10000000" :step="500" style="width: 100%" />
          </n-form-item>
        </n-grid-item>

        <!-- MAGNITUD -->
        <n-grid-item>
          <n-form-item label="Magnitud" :show-feedback="false">
            <n-input-number v-model:value="magnitude" :min="0" :max="10" :step="0.1" style="width: 100%" />
          </n-form-item>
        </n-grid-item>

        <!-- PROFUNDIDAD -->
        <n-grid-item>
          <n-form-item label="Profundidad" :show-feedback="false">
            <n-input-number v-model:value="depth" :min="1000" :max="10000" :step="100" style="width: 100%" />
          </n-form-item>
        </n-grid-item>

        <!-- BOTÓN -->
        <n-grid-item>
          <n-form-item label=" " :show-feedback="false">
            <n-button
              type="primary"
              block
              :loading="loading"
              @click="onSimulate"
            >
              Simular
            </n-button>
          </n-form-item>
        </n-grid-item>

      </n-grid>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NCard,
  NForm,
  NFormItem,
  NUpload,
  NButton,
  NInputNumber,
  NGrid,
  NGridItem,
  NAlert, NSpin
} from 'naive-ui'
import { simulationResult } from '@/services/simulationStore'
import { uiStatus, setStatus,clearStatus} from '@/services/uiStatusStore'

import { runSimulation } from '@/services/api'
import { epicenter } from '../services/simulationStore'
const file = ref<File | null>(null)
const magnitude =  ref(6.5)
const x =  ref(787671.8935)
const y = ref(9992673.3202)
const depth = ref(10000)
const loading = ref(false)

const emit = defineEmits<{
  (e: 'simulation-done', result: any): void
}>()


function onFileChange({ file: uploadFile }: any) {
  file.value = uploadFile?.file ?? null
}

async function onSimulate() {
if (!file.value || magnitude.value == null || depth.value == null || x.value == null || y.value == null) {
  setStatus('warning', 'Debe completar todos los parámetros antes de ejecutar la simulación.')
  return
}


  const formData = new FormData()
  formData.append('inp_file', file.value)
  formData.append('magnitude', String(magnitude.value))
  formData.append('depth', String(depth.value))
  formData.append('x', String(x.value))
  formData.append('y', String(y.value))
setStatus('info', 'Ejecutando simulación…')

loading.value = true

  try {
    const result = await runSimulation(formData)
    simulationResult.value = result
    epicenter.value = {
      x: x.value,
      y: y.value,
      lat: result.epicenter.lat,
      lng: result.epicenter.lng,
      magnitude: magnitude.value,
      depth: depth.value
    }
    emit('simulation-done', result)
setStatus('success', 'Simulación ejecutada correctamente.')


  } catch (err) {
    setStatus('error', err.message || 'Error al ejecutar la simulación.')
  } finally {
    loading.value = false
  }
}
</script>


<style scoped>
.param-header {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
}

/* Reduce padding interno del card */
:deep(.param-card .n-card__content) {
  padding-top: 0;
  padding-bottom: 8px;
}

/* 🔥 CLAVE: elimina el espacio fantasma */
:deep(.param-card .n-form-item-feedback-wrapper) {
  display: none;
}


.status-fade-enter-active,
.status-fade-leave-active {
  transition: all 0.35s ease;
}

.status-fade-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

</style>
