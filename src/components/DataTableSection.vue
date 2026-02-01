<template>
  <div class="table-section">
    <h3>Tablas de Datos</h3>
    <VueGoodTable
      :columns="columns"
      :rows="rows"
      :pagination-options="{
        enabled: true,
        perPage: 10,
      }"
      class="table"
    />
    <div class="export-buttons">
      <button @click="exportCSV" class="export-btn">Descargar CSV</button>
      <button @click="exportXLS" class="export-btn">Descargar XLS</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VueGoodTable from 'vue-good-table-next'
import 'vue-good-table-next/dist/vue-good-table-next.css'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface RowData {
  nodo: number
  presion: number
  flujo: number
}

const props = defineProps<{
  rows: RowData[]
}>()

const columns = ref([
  { label: 'Nodo', field: 'nodo' },
  { label: 'Presión', field: 'presion' },
  { label: 'Flujo', field: 'flujo' },
])

const exportCSV = () => {
  const csvContent = 'data:text/csv;charset=utf-8,' + 
    columns.value.map(col => col.label).join(',') + '\n' +
    props.rows.map(row => Object.values(row).join(',')).join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'datos_simulacion.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportXLS = () => {
  const worksheet = XLSX.utils.json_to_sheet(props.rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(data, 'datos_simulacion.xlsx')
}
</script>

<style scoped>
.table-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.table {
  flex: 1;
  margin-bottom: 1rem;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
}

.export-btn {
  padding: 0.5rem 1rem;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.export-btn:hover {
  background-color: #229954;
}
</style>