<template>
  <n-card size="small" class="param-card">
    <!-- HEADER -->
    <div class="param-header">
      PARÁMETROS
    </div>

    <!-- FORM -->
    <n-form label-placement="top">
      <n-grid :cols="5" x-gap="20" y-gap="8">

        <!-- ARCHIVO INP -->
        <n-grid-item :span="2">
          <n-form-item label="Archivo INP" :show-feedback="false">
            <n-upload :max="1" @change="onFileChange">
              <n-button block>
                Seleccionar archivo
              </n-button>
            </n-upload>
          </n-form-item>
        </n-grid-item>

        <!-- MAGNITUD -->
        <n-grid-item>
          <n-form-item label="Magnitud" :show-feedback="false">
            <n-input-number v-model:value="magnitude" style="width: 100%" />
          </n-form-item>
        </n-grid-item>

        <!-- PROFUNDIDAD -->
        <n-grid-item>
          <n-form-item label="Profundidad" :show-feedback="false">
            <n-input-number v-model:value="depth" style="width: 100%" />
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

import { runSimulation } from '@/services/api'

const file = ref<File | null>(null)
const magnitude = ref<number | null>(null)
const depth = ref<number | null>(null)
const loading = ref(false)

function onFileChange({ file: uploadFile }: any) {
  file.value = uploadFile?.file ?? null
}

async function onSimulate() {
  if (!file.value || magnitude.value == null || depth.value == null) {
    console.warn('Faltan parámetros')
    return
  }

  const formData = new FormData()
  formData.append('inp_file', file.value)
  formData.append('magnitude', String(magnitude.value))
  formData.append('depth', String(depth.value))

  loading.value = true
  try {
    const result = await runSimulation(formData)
    console.log('Resultado simulación:', result)
  } catch (err) {
    console.error('Error simulación', err)
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
</style>
