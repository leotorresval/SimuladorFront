<template>
  <div class="tabs">
    <div class="tab-headers">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        @click="activeTab = index"
        :class="['tab-button', { active: activeTab === index }]"
      >
        {{ tab.title }}
      </button>
    </div>
    <div class="tab-content">
      <div v-for="(tab, index) in tabs" :key="index" v-show="activeTab === index">
        <component :is="tab.component" v-bind="tab.props" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Tab {
  title: string
  component: any
  props?: Record<string, any>
}

const props = defineProps<{
  tabs: Tab[]
}>()

const activeTab = ref(0)
</script>

<style scoped>
.tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-headers {
  display: flex;
  border-bottom: 1px solid #ddd;
  background-color: #f9f9f9;
  flex-shrink: 0;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-button:hover {
  background-color: #e9e9e9;
}

.tab-button.active {
  color: #3498db;
  border-bottom-color: #3498db;
  background-color: white;
}

.tab-content {
  flex: 1;
  overflow: hidden;
}
</style>