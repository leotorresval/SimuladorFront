import axios from 'axios'

//const API_URL = 'https://simapi.torvalsoft.com/api'
const API_URL = import.meta.env.VITE_API_BASE
export async function runSimulation(formData) {
  const response = await axios.post(
    `${API_URL}/simulate`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data
}
