import axios from 'axios'
import { adminAnalytics } from '../mock/adminAnalyticsData.js'

const adminClient = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api',
  timeout: 4200,
})

async function fetchFirestoreAdminSnapshot() {
  const [{ collection, getDocs, limit, query }, { firestore }] = await Promise.all([
    import('firebase/firestore'),
    import('../config/firebase'),
  ])

  const [wardsSnapshot, complaintsSnapshot, housingSnapshot] = await Promise.all([
    getDocs(query(collection(firestore, 'wards'), limit(20))),
    getDocs(query(collection(firestore, 'complaints'), limit(80))),
    getDocs(query(collection(firestore, 'housingUnits'), limit(40))),
  ])

  return {
    ...adminAnalytics,
    seededMode: false,
    firestoreCounts: {
      wards: wardsSnapshot.size,
      complaints: complaintsSnapshot.size,
      housingUnits: housingSnapshot.size,
    },
  }
}

export async function fetchAdminAnalytics() {
  try {
    if (import.meta.env.VITE_USE_REAL_ADMIN_API === 'true') {
      const response = await adminClient.get('/admin/analytics')
      return { ...adminAnalytics, ...response.data, seededMode: false }
    }

    if (import.meta.env.VITE_USE_FIRESTORE_ADMIN === 'true') {
      return await fetchFirestoreAdminSnapshot()
    }

    return adminAnalytics
  } catch {
    return adminAnalytics
  }
}
