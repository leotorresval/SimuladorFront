<template>
  <n-card title="PARÁMETROS" size="small">
    <n-form label-placement="top">

      <n-form-item label="Archivo INP">
        <n-upload :max="1">
          <n-button>Seleccionar archivo</n-button>
        </n-upload>
      </n-form-item>

      <n-form-item label="Magnitud">
        <n-input-number />
      </n-form-item>

      <n-form-item label="Profundidad">
        <n-input-number />
      </n-form-item>

      <n-button type="primary" block>
        Simular
      </n-button>

    </n-form>
  </n-card>
</template>

<script setup>
import {
  NCard,
  NForm,
  NFormItem,
  NUpload,
  NButton,
  NInputNumber
} from 'naive-ui'
</script>
