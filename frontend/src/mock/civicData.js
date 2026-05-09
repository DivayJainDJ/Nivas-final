export const wards = [
  {
    id: 'ward-shivajinagar',
    name: 'Shivajinagar Ward 92',
    zone: 'East Zone',
    population: 84600,
    center: { lat: 12.9867, lng: 77.6051 },
    boundary: [
      { lat: 12.9959, lng: 77.5967 },
      { lat: 12.9973, lng: 77.6126 },
      { lat: 12.9862, lng: 77.6205 },
      { lat: 12.9773, lng: 77.6112 },
      { lat: 12.9794, lng: 77.5979 },
    ],
    infrastructureDeficit: 78,
    complaintPressure: 86,
    housingDemand: 73,
    priority: 'Critical',
    color: '#e85d4f',
  },
  {
    id: 'ward-kr-market',
    name: 'KR Market Ward 109',
    zone: 'South Zone',
    population: 93500,
    center: { lat: 12.9608, lng: 77.5779 },
    boundary: [
      { lat: 12.9707, lng: 77.5664 },
      { lat: 12.9694, lng: 77.5865 },
      { lat: 12.9584, lng: 77.5923 },
      { lat: 12.9497, lng: 77.5792 },
      { lat: 12.9548, lng: 77.5647 },
    ],
    infrastructureDeficit: 69,
    complaintPressure: 74,
    housingDemand: 81,
    priority: 'High',
    color: '#d7a32f',
  },
  {
    id: 'ward-banaswadi',
    name: 'Banaswadi Ward 27',
    zone: 'Mahadevapura Link',
    population: 76200,
    center: { lat: 13.0144, lng: 77.6512 },
    boundary: [
      { lat: 13.0266, lng: 77.6411 },
      { lat: 13.0245, lng: 77.6616 },
      { lat: 13.0111, lng: 77.6683 },
      { lat: 13.0005, lng: 77.6531 },
      { lat: 13.0056, lng: 77.6379 },
    ],
    infrastructureDeficit: 55,
    complaintPressure: 58,
    housingDemand: 62,
    priority: 'Watch',
    color: '#f5c542',
  },
  {
    id: 'ward-jayanagar',
    name: 'Jayanagar Ward 167',
    zone: 'South Zone',
    population: 68800,
    center: { lat: 12.925, lng: 77.5938 },
    boundary: [
      { lat: 12.9362, lng: 77.5814 },
      { lat: 12.9366, lng: 77.6045 },
      { lat: 12.922, lng: 77.6113 },
      { lat: 12.9129, lng: 77.5948 },
      { lat: 12.9184, lng: 77.5799 },
    ],
    infrastructureDeficit: 34,
    complaintPressure: 41,
    housingDemand: 47,
    priority: 'Stable',
    color: '#34d399',
  },
  {
    id: 'ward-yelahanka',
    name: 'Yelahanka Ward 4',
    zone: 'North Zone',
    population: 104300,
    center: { lat: 13.1007, lng: 77.5963 },
    boundary: [
      { lat: 13.1153, lng: 77.5796 },
      { lat: 13.1168, lng: 77.6115 },
      { lat: 13.0991, lng: 77.6232 },
      { lat: 13.0837, lng: 77.6013 },
      { lat: 13.0894, lng: 77.5758 },
    ],
    infrastructureDeficit: 48,
    complaintPressure: 52,
    housingDemand: 59,
    priority: 'Moderate',
    color: '#60a5fa',
  },
]

const categories = ['Water supply', 'Drainage', 'Streetlight', 'Waste pickup', 'Road damage', 'Encroachment']
const statuses = ['Open', 'Triaged', 'Crew assigned', 'Resolved']

export const complaints = [
  ['CMP-2401', 'ward-shivajinagar', 'Drainage', 'Severe', 'Open', 'Tasker Town main drain backing up after rain', 12.9889, 77.6088, '08:14'],
  ['CMP-2402', 'ward-shivajinagar', 'Water supply', 'High', 'Triaged', 'Irregular tanker supply near Russell Market', 12.9849, 77.604, '08:33'],
  ['CMP-2403', 'ward-kr-market', 'Waste pickup', 'High', 'Crew assigned', 'Organic waste pile blocking market lane', 12.9626, 77.5771, '08:47'],
  ['CMP-2404', 'ward-banaswadi', 'Streetlight', 'Medium', 'Open', 'Seven streetlights out near HRBR link road', 13.0158, 77.6488, '09:02'],
  ['CMP-2405', 'ward-jayanagar', 'Road damage', 'Medium', 'Triaged', 'Pothole cluster on 9th Block bus route', 12.9258, 77.5927, '09:19'],
  ['CMP-2406', 'ward-yelahanka', 'Drainage', 'High', 'Open', 'Stormwater inlet clogged near Puttenahalli lake road', 13.0979, 77.5921, '09:31'],
  ['CMP-2407', 'ward-kr-market', 'Encroachment', 'Severe', 'Open', 'Emergency vehicle lane obstructed by temporary stalls', 12.9599, 77.5817, '09:48'],
  ['CMP-2408', 'ward-shivajinagar', 'Streetlight', 'Low', 'Resolved', 'Dark stretch near infantry road crossing restored', 12.9837, 77.6119, '10:05'],
  ['CMP-2409', 'ward-banaswadi', 'Water supply', 'Medium', 'Triaged', 'Low pressure in pipeline near Ombr Layout', 13.0109, 77.6569, '10:22'],
  ['CMP-2410', 'ward-yelahanka', 'Waste pickup', 'Medium', 'Crew assigned', 'Missed collection on housing board approach', 13.1041, 77.6004, '10:44'],
  ['CMP-2411', 'ward-jayanagar', 'Waste pickup', 'Low', 'Resolved', 'Segregated waste bins overflowing near school zone', 12.9207, 77.5981, '11:06'],
  ['CMP-2412', 'ward-kr-market', 'Water supply', 'High', 'Open', 'Commercial block reports brown water in taps', 12.9661, 77.5843, '11:31'],
  ['CMP-2413', 'ward-shivajinagar', 'Road damage', 'High', 'Crew assigned', 'Bus turning radius damaged near Bowring compound', 12.9917, 77.6032, '11:52'],
  ['CMP-2414', 'ward-banaswadi', 'Drainage', 'Medium', 'Open', 'Manhole cover displaced after cable work', 13.0188, 77.6537, '12:18'],
  ['CMP-2415', 'ward-yelahanka', 'Streetlight', 'Low', 'Triaged', 'Pedestrian underpass lights flickering', 13.1096, 77.5929, '12:39'],
  ['CMP-2416', 'ward-jayanagar', 'Water supply', 'Medium', 'Crew assigned', 'Valve leak near 4th T Block park', 12.9294, 77.5884, '13:02'],
  ['CMP-2417', 'ward-kr-market', 'Drainage', 'Severe', 'Open', 'Silt overflow affecting wholesale loading bay', 12.9565, 77.5749, '13:28'],
  ['CMP-2418', 'ward-shivajinagar', 'Waste pickup', 'High', 'Open', 'Biomedical waste mixed with municipal garbage', 12.9819, 77.6009, '13:44'],
  ['CMP-2419', 'ward-banaswadi', 'Road damage', 'Low', 'Resolved', 'Patch repair verified near Horamavu junction', 13.0069, 77.6462, '14:06'],
  ['CMP-2420', 'ward-yelahanka', 'Encroachment', 'Medium', 'Triaged', 'Footpath blocked near BMTC depot access', 13.0943, 77.6047, '14:27'],
].map(([id, wardId, category, severity, status, description, lat, lng, time], index) => ({
  id,
  wardId,
  category: category || categories[index % categories.length],
  severity,
  status: status || statuses[index % statuses.length],
  description,
  position: { lat, lng },
  timestamp: `Today ${time} IST`,
}))

export const housingUnits = [
  { id: 'HSG-101', wardId: 'ward-shivajinagar', scheme: 'PMAY Transit Block A', units: 42, occupancy: 88, position: { lat: 12.9874, lng: 77.6018 } },
  { id: 'HSG-102', wardId: 'ward-shivajinagar', scheme: 'Night Shelter Upgrade', units: 18, occupancy: 67, position: { lat: 12.9805, lng: 77.6081 } },
  { id: 'HSG-201', wardId: 'ward-kr-market', scheme: 'Market Worker Rental Cluster', units: 64, occupancy: 93, position: { lat: 12.961, lng: 77.5849 } },
  { id: 'HSG-202', wardId: 'ward-kr-market', scheme: 'Victoria Road EWS Annex', units: 27, occupancy: 71, position: { lat: 12.9528, lng: 77.5729 } },
  { id: 'HSG-301', wardId: 'ward-banaswadi', scheme: 'Banaswadi EWS Redevelopment', units: 39, occupancy: 76, position: { lat: 13.013, lng: 77.6611 } },
  { id: 'HSG-401', wardId: 'ward-jayanagar', scheme: 'Jayanagar Assisted Rental Pool', units: 23, occupancy: 65, position: { lat: 12.9189, lng: 77.5899 } },
  { id: 'HSG-501', wardId: 'ward-yelahanka', scheme: 'Yelahanka Resettlement Phase II', units: 81, occupancy: 82, position: { lat: 13.1019, lng: 77.6074 } },
  { id: 'HSG-502', wardId: 'ward-yelahanka', scheme: 'Airport Road Worker Hostel', units: 36, occupancy: 69, position: { lat: 13.0887, lng: 77.5944 } },
]

export const healthTrend = [
  { month: 'Dec', score: 69 },
  { month: 'Jan', score: 71 },
  { month: 'Feb', score: 70 },
  { month: 'Mar', score: 74 },
  { month: 'Apr', score: 72 },
  { month: 'May', score: 76 },
]

export const cityHealth = {
  score: 76,
  monthlyTrend: '+4.1%',
  explanation:
    'Score blends complaint resolution velocity, service uptime, ward infrastructure deficit, and verified housing match capacity.',
}

export const housingSnapshot = {
  availableUnits: 143,
  waitingFamilies: 1287,
  todaysMatches: 36,
  highestNeedFamily: 'Asha B. family, 5 members, KR Market informal settlement',
}

export const recommendedActions = [
  {
    id: 'ACT-01',
    title: 'Pre-position desilting crew before evening rain window',
    reason: 'Three severe drainage complaints cluster within 750m of Shivajinagar and KR Market low points.',
    urgency: 'Immediate',
    estimatedImpact: 'Reduce flood exposure for 18,400 residents',
    wardId: 'ward-shivajinagar',
  },
  {
    id: 'ACT-02',
    title: 'Release 24 EWS units to verified market-worker waitlist',
    reason: 'Housing vacancy exists near KR Market while demand pressure exceeds city threshold.',
    urgency: 'High',
    estimatedImpact: 'Cut waiting queue by 7.6% in high-risk families',
    wardId: 'ward-kr-market',
  },
  {
    id: 'ACT-03',
    title: 'Shift one electrical response team to Banaswadi corridor',
    reason: 'Streetlight outage density is rising along school and bus-stop paths.',
    urgency: 'Moderate',
    estimatedImpact: 'Restore safe access for 9 public facilities',
    wardId: 'ward-banaswadi',
  },
]

export const serviceStatuses = [
  { name: 'Firestore', status: 'Operational', latency: '42 ms' },
  { name: 'Maps', status: 'Degraded', latency: '148 ms' },
  { name: 'analyzeWard API', status: 'Operational', latency: '226 ms' },
  { name: 'matchHousing API', status: 'Operational', latency: '184 ms' },
  { name: 'notifications', status: 'Queued', latency: '19 pending' },
]

export const civicSnapshot = {
  wards,
  complaints,
  housingUnits,
  healthTrend,
  cityHealth,
  housingSnapshot,
  recommendedActions,
  serviceStatuses,
}
