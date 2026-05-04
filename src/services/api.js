import axios from 'axios'

// const API_URL = 'https://simapi.torvalsoft.com/api'
const API_URL = import.meta.env.VITE_API_BASE

function safeParseApiResponse(data) {
  if (typeof data !== 'string') {
    return data
  }

  try {
    return JSON.parse(data)
  } catch (error) {
    console.warn('La API devolvió texto con valores no válidos para JSON. Se intentará corregir NaN/Infinity.')

    const fixedData = data
      .replace(/\bNaN\b/g, 'null')
      .replace(/\bInfinity\b/g, 'null')
      .replace(/\b-Infinity\b/g, 'null')

    return JSON.parse(fixedData)
  }
}

export async function runSimulation(formData) {
  const response = await axios.post(
    `${API_URL}/simulate`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )

  return safeParseApiResponse(response.data)
}