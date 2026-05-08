import { wards } from './civicData.js'

export const complaintCategories = [
  'Water leakage',
  'No water access',
  'Drainage issue',
  'Road damage',
  'Garbage accumulation',
  'Electricity issue',
  'Eviction threat',
  'Unsafe structure',
  'Sanitation issue',
  'Other',
]

export const complaintStatuses = ['pending', 'classified', 'routed', 'in_progress', 'resolved', 'classification-failed']
export const complaintSeverities = ['low', 'medium', 'high', 'critical']

const categoryDepartments = {
  'Water leakage': 'BWSSB Water Maintenance',
  'No water access': 'BWSSB Distribution Cell',
  'Drainage issue': 'Stormwater Drainage Division',
  'Road damage': 'Road Infrastructure Cell',
  'Garbage accumulation': 'Solid Waste Management',
  'Electricity issue': 'BESCOM Liaison Desk',
  'Eviction threat': 'Housing Rights Response Cell',
  'Unsafe structure': 'Building Safety Authority',
  'Sanitation issue': 'Public Health Engineering',
  Other: 'Ward Control Room',
}

const rows = [
  ['CMP-BLR-8841', 'ward-shivajinagar', 'Drainage issue', 'critical', 'routed', 'Open drain overflow is entering homes behind Russell Market after two hours of rain.', 12.9868, 77.6074, 'Today 08:12 IST'],
  ['CMP-BLR-8842', 'ward-kr-market', 'Garbage accumulation', 'high', 'classified', 'Market lane has mixed waste pile blocking handcart movement and attracting stray animals.', 12.9629, 77.5798, 'Today 08:36 IST'],
  ['CMP-BLR-8843', 'ward-yelahanka', 'No water access', 'high', 'pending', 'Four houses near the housing board approach have no tap water for three days.', 13.1038, 77.6001, 'Today 09:03 IST'],
  ['CMP-BLR-8844', 'ward-banaswadi', 'Electricity issue', 'medium', 'in_progress', 'Street feeder flickers every evening near HRBR bus stop and school crossing.', 13.0151, 77.6506, 'Today 09:27 IST'],
  ['CMP-BLR-8845', 'ward-jayanagar', 'Road damage', 'medium', 'routed', 'Deep potholes on 9th Block bus route are slowing ambulances and BMTC buses.', 12.9254, 77.5932, 'Today 10:08 IST'],
  ['CMP-BLR-8846', 'ward-shivajinagar', 'Unsafe structure', 'critical', 'classified', 'Wall of a tenement building has visible crack after nearby excavation.', 12.9819, 77.6014, 'Today 10:31 IST'],
  ['CMP-BLR-8847', 'ward-kr-market', 'Sanitation issue', 'high', 'in_progress', 'Community toilet block has no water connection and queue is spilling onto main road.', 12.9576, 77.5758, 'Today 11:05 IST'],
  ['CMP-BLR-8848', 'ward-banaswadi', 'Water leakage', 'medium', 'resolved', 'Pipeline leak near Ombr Layout park repaired by field crew.', 13.0105, 77.6572, 'Today 11:44 IST'],
  ['CMP-BLR-8849', 'ward-yelahanka', 'Eviction threat', 'critical', 'pending', 'Families near informal settlement report overnight notice without rehabilitation information.', 13.0945, 77.6043, 'Today 12:17 IST'],
  ['CMP-BLR-8850', 'ward-jayanagar', 'Garbage accumulation', 'low', 'resolved', 'Overflowing segregated waste bins near school have been cleared.', 12.9205, 77.5985, 'Today 12:49 IST'],
  ['CMP-BLR-8851', 'ward-shivajinagar', 'Water leakage', 'high', 'routed', 'Large water loss observed near Bowring compound valve chamber.', 12.9912, 77.6035, 'Today 13:18 IST'],
  ['CMP-BLR-8852', 'ward-kr-market', 'Road damage', 'medium', 'classification-failed', 'Road edge has collapsed near loading bay after repeated heavy vehicle movement.', 12.9657, 77.5841, 'Today 13:52 IST'],
]

export const demoComplaints = rows.map(([id, wardId, category, severity, status, description, lat, lng, timestamp], index) => {
  const ward = wards.find((item) => item.id === wardId) || wards[0]
  return {
    id,
    residentId: `resident-${2000 + index}`,
    residentPhone: `+91 98${String(42000000 + index * 3719).slice(0, 8)}`,
    wardId,
    wardName: ward.name,
    location: { lat, lng },
    address: `${ward.name.replace(' Ward', '')}, ${ward.zone}, Bengaluru`,
    category,
    severity,
    status,
    photoUrl: '',
    geminiSummary: `${categoryDepartments[category]} should inspect ${category.toLowerCase()} conditions in ${ward.name}. Complaint suggests ${severity} civic disruption with nearby resident impact.`,
    suggestedDepartment: categoryDepartments[category],
    confidence: status === 'classification-failed' ? 41 : 78 + (index % 16),
    routedTo: categoryDepartments[category],
    createdAt: timestamp,
    updatedAt: timestamp,
    description,
    notes: index % 3 === 0 ? 'Ward engineer requested field verification before closure.' : '',
    timeline: [
      { label: 'Complaint received', time: timestamp },
      { label: status === 'pending' ? 'Awaiting AI classification' : 'AI classification completed', time: timestamp.replace('Today', 'Today') },
      ...(status === 'resolved' ? [{ label: 'Resolution verified by officer', time: 'Today 14:20 IST' }] : []),
    ],
  }
})

export const complaintTrend = [
  { hour: '08:00', complaints: 6, critical: 1 },
  { hour: '09:00', complaints: 9, critical: 1 },
  { hour: '10:00', complaints: 13, critical: 2 },
  { hour: '11:00', complaints: 17, critical: 2 },
  { hour: '12:00', complaints: 20, critical: 3 },
  { hour: '13:00', complaints: 24, critical: 4 },
]
