import { ref } from 'vue'

export type UIStatusType = 'info' | 'success' | 'warning' | 'error' | null

export const uiStatus = ref<{
  type: UIStatusType
  message: string
} | null>(null)

let timeoutId: number | null = null

export function setStatus (
  type: UIStatusType,
  message: string,
  autoClose = true
) {
  // Limpia timeout anterior
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }

  uiStatus.value = { type, message }

  // ⏱️ Autocierre solo para info / success
  if (autoClose && (type === 'info' || type === 'success')) {
    timeoutId = window.setTimeout(() => {
      uiStatus.value = null
    }, 4000) // ⏱️ tiempo prudente (4s)
  }
}

export function clearStatus () {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  uiStatus.value = null
}
