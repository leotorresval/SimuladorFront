import { ref } from 'vue'

export const simulationResult = ref<any>(null)
export const epicenter = ref<{
  x: number | null
  y: number | null
    lat: number | null
  lng: number | null
  magnitude: number | null
  depth: number | null
}>({
  x: null,
  y: null,
  lat: null,
  lng: null,
  magnitude: null,
  depth: null
})