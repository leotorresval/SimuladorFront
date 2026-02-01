<template>
  <div class="parameters-section">
    <h3>Parámetros del Epicentro</h3>
    <button @click="toggleExpanded" class="toggle-button">
      {{ isExpanded ? 'Minimizar' : 'Expandir' }}
    </button>
    <div v-if="isExpanded" class="parameters-content">
      <div class="parameter">
        <label for="magnitude">Magnitud:</label>
        <input type="number" id="magnitude" v-model.number="magnitude" step="0.1" min="0" />
      </div>
      <div class="parameter">
        <label for="depth">Profundidad (km):</label>
        <input type="number" id="depth" v-model.number="depth" step="0.1" min="0" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isExpanded = ref(false)
const magnitude = ref(0)
const depth = ref(0)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Exponer los valores para que el padre pueda acceder
defineExpose({
  magnitude,
  depth
})
</script>

<style scoped>
.parameters-section {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.toggle-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.toggle-button:hover {
  background-color: #2980b9;
}

.parameters-content {
  margin-top: 1rem;
}

.parameter {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #3498db;
}
</style>