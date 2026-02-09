<template>
  <n-config-provider>
    <n-notification-provider>
      <MainLayout />
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider } from 'naive-ui'
import MainLayout from '@/layout/MainLayout.vue'
</script>
