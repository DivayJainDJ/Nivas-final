import { listComplaints } from '../repositories/complaintsRepository.js'
import { fetchWards } from '../repositories/wardsRepository.js'
import { civicSnapshot } from '../mock/civicData.js'
import { systemApi } from '../lib/api/systemApi.js'

function severityRank(severity) {
  return { critical: 'Severe', high: 'High', medium: 'Medium', low: 'Low' }[String(severity).toLowerCase()] || severity || 'Medium'
}

function statusLabel(status) {
  return String(status || '').toLowerCase() === 'resolved' ? 'Resolved' : status || 'Pending'
}

function normalizeDashboardComplaint(item) {
  return {
    ...item,
    severity: severityRank(item.severity),
    status: statusLabel(item.status),
    center: item.location,
  }
}

export async function fetchCivicSnapshot() {
  try {
    const [health, wards, complaints] = await Promise.all([
      systemApi.health().catch(() => null),
      fetchWards().catch(() => []),
      listComplaints().catch(() => []),
    ])

    return {
      ...civicSnapshot,
      apiHealth: health,
      wards: wards.length ? wards.map((ward, index) => ({ ...civicSnapshot.wards[index % civicSnapshot.wards.length], ...ward })) : civicSnapshot.wards,
      complaints: complaints.length ? complaints.map(normalizeDashboardComplaint) : civicSnapshot.complaints,
      serviceStatuses: civicSnapshot.serviceStatuses.map((service) => (
        service.name === 'BFF API'
          ? { ...service, status: health ? 'Operational' : 'Continuity', latency: health?.latency || service.latency }
          : service
      )),
    }
  } catch {
    return civicSnapshot
  }
}

