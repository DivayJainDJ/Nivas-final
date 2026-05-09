import { adminAnalytics } from '../mock/adminAnalyticsData.js'
import { listComplaints } from '../repositories/complaintsRepository.js'
import { fetchWards } from '../repositories/wardsRepository.js'
import { systemApi } from '../lib/api/systemApi.js'

function buildConnectedAnalytics({ health, wards, complaints }) {
  const activeComplaints = complaints.filter((item) => item.status !== 'resolved' && item.status !== 'Resolved')
  return {
    ...adminAnalytics,
    seededMode: !health && !wards.length && !complaints.length,
    firestoreCounts: {
      wards: wards.length,
      complaints: complaints.length,
      housingUnits: adminAnalytics.housingSnapshot.availableUnits,
    },
    executiveMetrics: adminAnalytics.executiveMetrics.map((metric) => {
      if (metric.id === 'signals') return { ...metric, value: activeComplaints.length || metric.value }
      if (metric.id === 'wards') return { ...metric, value: wards.length || metric.value }
      return metric
    }),
    systemHealth: adminAnalytics.systemHealth.map((service) => (
      service.name.includes('BFF') || service.name.includes('API')
        ? { ...service, status: health ? 'Operational' : 'Continuity', quality: health ? 98 : 84 }
        : service
    )),
  }
}

export async function fetchAdminAnalytics() {
  try {
    const [health, wards, complaints] = await Promise.all([
      systemApi.health().catch(() => null),
      fetchWards().catch(() => []),
      listComplaints().catch(() => []),
    ])
    return buildConnectedAnalytics({ health, wards, complaints })
  } catch {
    return adminAnalytics
  }
}

