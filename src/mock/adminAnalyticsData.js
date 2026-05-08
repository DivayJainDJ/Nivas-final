import { complaints, housingSnapshot, housingUnits, wards } from './civicData.js'
import { complaintTrend, demoComplaints } from './complaintsDemoData.js'
import { demoMatchResult } from './housingMatchData.js'
import { getFallbackAnalysis, plannerWards } from './slumPlannerData.js'

const riskRank = {
  Critical: 4,
  High: 3,
  Watch: 2,
  Moderate: 1,
  Stable: 0,
}

export const wardAnalytics = wards.map((ward, index) => {
  const wardComplaints = complaints.filter((complaint) => complaint.wardId === ward.id)
  const activeComplaints = wardComplaints.filter((complaint) => complaint.status !== 'Resolved').length
  const pressure = Math.round((ward.infrastructureDeficit * 0.42) + (ward.complaintPressure * 0.34) + (ward.housingDemand * 0.24))
  const responseEfficiency = Math.max(58, 94 - activeComplaints * 4 - riskRank[ward.priority] * 3 + index * 2)

  return {
    id: ward.id,
    name: ward.name,
    zone: ward.zone,
    population: ward.population,
    center: ward.center,
    boundary: ward.boundary,
    infrastructurePressure: pressure,
    complaintVolume: wardComplaints.length,
    activeComplaints,
    housingDemand: ward.housingDemand,
    aiRisk: ward.priority,
    responseEfficiency,
    trend: index % 2 === 0 ? 'rising' : 'stabilizing',
    trendValue: index % 2 === 0 ? `+${4 + index}%` : `-${2 + index}%`,
    populationImpact: Math.round(ward.population * (pressure / 100) * 0.48),
    color: ward.color,
  }
})

export const executiveMetrics = [
  { id: 'wards', label: 'Wards monitored', value: wards.length, suffix: '', detail: 'active civic zones', tone: 'indigo' },
  { id: 'pressure', label: 'Infrastructure pressure', value: 68, suffix: '/100', detail: 'weighted city risk', tone: 'rose' },
  { id: 'resolution', label: 'Resolution efficiency', value: 82, suffix: '%', detail: 'triaged and closed velocity', tone: 'green' },
  { id: 'housing', label: 'Housing allocation success', value: 64, suffix: '%', detail: 'eligible placement throughput', tone: 'cyan' },
  { id: 'signals', label: 'Active citizen signals', value: demoComplaints.filter((item) => item.status !== 'resolved').length + complaints.filter((item) => item.status !== 'Resolved').length, suffix: '', detail: 'open operational inputs', tone: 'amber' },
  { id: 'impact', label: 'Population impact estimate', value: 214000, suffix: '', detail: 'residents represented in priority wards', tone: 'navy' },
]

export const complaintCategoryData = Object.values(
  demoComplaints.reduce((acc, complaint) => {
    acc[complaint.category] = acc[complaint.category] || { category: complaint.category, count: 0 }
    acc[complaint.category].count += 1
    return acc
  }, {}),
).sort((a, b) => b.count - a.count)

export const escalationData = [
  { label: '08:00', critical: 1, escalated: 2, unresolved: 6 },
  { label: '10:00', critical: 2, escalated: 4, unresolved: 11 },
  { label: '12:00', critical: 3, escalated: 5, unresolved: 15 },
  { label: '14:00', critical: 4, escalated: 6, unresolved: 17 },
  { label: '16:00', critical: 3, escalated: 5, unresolved: 14 },
]

export const workloadData = [
  { officer: 'Ward Eng.', load: 72, closed: 18 },
  { officer: 'Water Cell', load: 58, closed: 14 },
  { officer: 'SWM Lead', load: 66, closed: 16 },
  { officer: 'Housing Desk', load: 49, closed: 11 },
  { officer: 'Field Ops', load: 81, closed: 22 },
]

export const housingAllocationTrend = [
  { month: 'Jan', allocated: 28, waitlist: 1320, ready: 58 },
  { month: 'Feb', allocated: 34, waitlist: 1306, ready: 61 },
  { month: 'Mar', allocated: 41, waitlist: 1298, ready: 67 },
  { month: 'Apr', allocated: 46, waitlist: 1289, ready: 71 },
  { month: 'May', allocated: 52, waitlist: 1287, ready: 78 },
]

export const housingCategoryDistribution = demoMatchResult.analytics.categoryDistribution

export const housingDemandClusters = housingUnits.map((unit, index) => ({
  id: unit.id,
  name: unit.scheme,
  wardId: unit.wardId,
  position: unit.position,
  demand: 58 + index * 5,
  availableUnits: Math.max(8, Math.round(unit.units * (1 - unit.occupancy / 100))),
}))

export const operationalInsights = [
  {
    title: 'Highest pressure housing zones',
    body: 'KR Market and Shivajinagar show the strongest overlap between complaint pressure, waitlist demand, and limited ready inventory.',
    signal: 'Immediate allocation review',
  },
  {
    title: 'Allocation bottleneck prediction',
    body: 'Document readiness is likely to delay 18 to 24 percent of high-confidence EWS placements in the next 30 days.',
    signal: 'Deploy verification help desk',
  },
  {
    title: 'Wards requiring intervention',
    body: 'Drainage and sanitation stress in central-east wards is likely to exceed response thresholds during the next rainfall window.',
    signal: 'Pre-position field crews',
  },
  {
    title: 'Projected demand increase',
    body: 'Affordable rental demand is projected to rise 11 percent near market-worker corridors if current eviction notices continue.',
    signal: 'Expand rental pool',
  },
]

const yeshwanthpurAnalysis = getFallbackAnalysis('ward-14')

export const analysisHistory = plannerWards.slice(0, 5).map((ward, index) => ({
  id: `SCAN-${2400 + index}`,
  wardId: ward.id,
  wardName: ward.name,
  timestamp: ['Today 15:42 IST', 'Yesterday 18:20 IST', 'May 06 09:15 IST', 'May 04 16:05 IST', 'May 02 11:30 IST'][index],
  infrastructureScore: Math.max(34, 82 - index * 7),
  recommendation: yeshwanthpurAnalysis.recommendations[index % yeshwanthpurAnalysis.recommendations.length].project,
  populationImpact: `${Math.round((ward.population * 0.32) / 1000)}K residents`,
  remediationProgress: Math.min(92, 28 + index * 13),
  status: index === 0 ? 'New scan' : index < 3 ? 'In progress' : 'Monitoring',
}))

export const systemHealth = [
  { name: 'Firestore', status: 'Operational', latency: '42 ms', quality: 96 },
  { name: 'Maps API', status: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Operational' : 'Seeded fallback', latency: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '124 ms' : 'local', quality: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 91 : 100 },
  { name: 'analyzeWard API', status: 'Operational', latency: '226 ms', quality: 88 },
  { name: 'matchHousing API', status: 'Operational', latency: '184 ms', quality: 92 },
  { name: 'Storage', status: 'Operational', latency: '68 ms', quality: 94 },
  { name: 'Notifications', status: 'Queued', latency: '19 pending', quality: 81 },
  { name: 'Seeded continuity', status: 'Ready', latency: 'instant', quality: 100 },
]

export const adminAnalytics = {
  generatedAt: 'Today 16:40 IST',
  seededMode: true,
  executiveMetrics,
  wardAnalytics,
  complaintCategoryData,
  complaintTrend,
  escalationData,
  workloadData,
  housingSnapshot,
  housingAllocationTrend,
  housingCategoryDistribution,
  housingDemandClusters,
  operationalInsights,
  analysisHistory,
  systemHealth,
}
