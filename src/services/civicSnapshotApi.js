import axios from 'axios'
import { civicSnapshot } from '../mock/civicData.js'

const civicClient = axios.create({
  baseURL: import.meta.env.VITE_CIVIC_API_BASE_URL || '/api',
  timeout: 4500,
})

export async function fetchCivicSnapshot() {
  if (import.meta.env.VITE_USE_REAL_CIVIC_API !== 'true') {
    return civicSnapshot
  }

  try {
    const response = await civicClient.get('/civic-snapshot')
    return response.data
  } catch {
    return civicSnapshot
  }
}
