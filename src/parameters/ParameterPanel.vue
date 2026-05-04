<template>
  <n-card size="small" class="param-card">
    <!-- HEADER -->
    <div class="param-header">
      PARÁMETROS
    </div>

    <!-- FORM -->
    <n-form label-placement="top">
      <n-grid :cols="6" x-gap="20" y-gap="8">

        <!-- ARCHIVO INP -->
        <n-grid-item>
          <n-form-item label="Archivo INP" :show-feedback="false">
            <n-upload
              ref="uploadRef"
              :max="1"
              :show-file-list="false"
              @change="onFileChange"
            >
              <n-button block>
                <template v-if="file">
                  {{ file.name.slice(0, 20) + '...' }}
                  <span
                    style="margin-left: 10px; color: red; cursor: pointer;"
                    @click.stop="removeFile"
                  >
                    ❌
                  </span>
                </template>
                <template v-else>
                  Seleccionar archivo
                </template>
              </n-button>
            </n-upload>
          </n-form-item>
        </n-grid-item>

        <!-- EJE_X -->
        <n-grid-item>
          <n-form-item label="Longitud / Eje x (m)" :show-feedback="false">
            <n-input-number
              v-model:value="x"
              :min="166000"
              :max="834000"
              :step="500"
              style="width: 100%"
            />
          </n-form-item>
        </n-grid-item>

        <!-- EJE_Y -->
        <n-grid-item>
          <n-form-item label="Latitud / Eje y (m)" :show-feedback="false">
            <n-input-number
              v-model:value="y"
              :min="0"
              :max="10000000"
              :step="500"
              style="width: 100%"
            />
          </n-form-item>
        </n-grid-item>

        <!-- MAGNITUD -->
        <n-grid-item>
          <n-form-item label="Magnitud (Richter)" :show-feedback="false">
            <n-input-number
              v-model:value="magnitude"
              :min="0"
              :max="10"
              :step="0.1"
              style="width: 100%"
            />
          </n-form-item>
        </n-grid-item>

        <!-- PROFUNDIDAD -->
        <n-grid-item>
          <n-form-item label="Profundidad (m)" :show-feedback="false">
            <n-input-number
              v-model:value="depth"
              :min="1000"
              :max="10000"
              :step="100"
              style="width: 100%"
            />
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
  NGridItem
} from 'naive-ui'

import { simulationResult, epicenter } from '@/services/simulationStore'
import { setStatus } from '@/services/uiStatusStore'
import { runSimulation } from '@/services/api'

const file = ref<File | null>(null)

const magnitude = ref(6.5)
const x = ref(763122.112)
const y = ref(9861762.92)
const depth = ref(10000)

const loading = ref(false)
const uploadRef = ref()

const emit = defineEmits<{
  (e: 'simulation-done', result: any): void
}>()

function onFileChange({ file: uploadFile }: any) {
  file.value = uploadFile?.file ?? null
}

function removeFile() {
  file.value = null
  uploadRef.value?.clear()
}

function toNumberOrNull(value: any): number | null {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function buildSafeEpicenter(result: any) {
  const backendEpicenter = result?.epicenter ?? {}

  return {
    x: toNumberOrNull(backendEpicenter.x ?? x.value),
    y: toNumberOrNull(backendEpicenter.y ?? y.value),
    lat: toNumberOrNull(backendEpicenter.lat),
    lng: toNumberOrNull(backendEpicenter.lng),
    magnitude: toNumberOrNull(backendEpicenter.magnitude ?? magnitude.value),
    depth: toNumberOrNull(backendEpicenter.depth ?? depth.value)
  }
}

async function onSimulate() {
  if (
    !file.value ||
    magnitude.value == null ||
    depth.value == null ||
    x.value == null ||
    y.value == null
  ) {
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
    const rawResult = await runSimulation(formData)

    const result = typeof rawResult === 'string'
      ? JSON.parse(rawResult)
      : rawResult

    // console.log('RESULTADO BACKEND:', result)
    // console.log('EPICENTRO BACKEND:', result?.epicenter)

    simulationResult.value = result
    epicenter.value = buildSafeEpicenter(result)

    emit('simulation-done', result)
  } catch (err: any) {
    // console.error('ERROR EN onSimulate:', err)

    setStatus(
      'error',
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Error al ejecutar la simulación.'
    )
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

/* Elimina el espacio fantasma */
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