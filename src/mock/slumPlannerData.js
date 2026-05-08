export const plannerWards = [
  {
    id: 'ward-14',
    name: 'Ward 14 - Yeshwanthpur Industrial Belt',
    shortName: 'Yeshwanthpur',
    zone: 'North-West Bengaluru',
    lat: 13.0239,
    lng: 77.5512,
    population: 118400,
    informalHouseholds: 14860,
    boundary: [
      { lat: 13.0362, lng: 77.5358 },
      { lat: 13.0385, lng: 77.5654 },
      { lat: 13.0226, lng: 77.5762 },
      { lat: 13.0086, lng: 77.5576 },
      { lat: 13.0131, lng: 77.5327 },
    ],
    pressure: 'High',
  },
  {
    id: 'ward-92',
    name: 'Ward 92 - Shivajinagar Core',
    shortName: 'Shivajinagar',
    zone: 'Central-East Bengaluru',
    lat: 12.9867,
    lng: 77.6051,
    population: 84600,
    informalHouseholds: 9720,
    boundary: [
      { lat: 12.9959, lng: 77.5967 },
      { lat: 12.9973, lng: 77.6126 },
      { lat: 12.9862, lng: 77.6205 },
      { lat: 12.9773, lng: 77.6112 },
      { lat: 12.9794, lng: 77.5979 },
    ],
    pressure: 'Critical',
  },
  {
    id: 'ward-109',
    name: 'Ward 109 - KR Market Settlement Edge',
    shortName: 'KR Market',
    zone: 'South Bengaluru',
    lat: 12.9608,
    lng: 77.5779,
    population: 93500,
    informalHouseholds: 12640,
    boundary: [
      { lat: 12.9707, lng: 77.5664 },
      { lat: 12.9694, lng: 77.5865 },
      { lat: 12.9584, lng: 77.5923 },
      { lat: 12.9497, lng: 77.5792 },
      { lat: 12.9548, lng: 77.5647 },
    ],
    pressure: 'High',
  },
  {
    id: 'ward-27',
    name: 'Ward 27 - Banaswadi Rail Corridor',
    shortName: 'Banaswadi',
    zone: 'East Bengaluru',
    lat: 13.0144,
    lng: 77.6512,
    population: 76200,
    informalHouseholds: 6840,
    boundary: [
      { lat: 13.0266, lng: 77.6411 },
      { lat: 13.0245, lng: 77.6616 },
      { lat: 13.0111, lng: 77.6683 },
      { lat: 13.0005, lng: 77.6531 },
      { lat: 13.0056, lng: 77.6379 },
    ],
    pressure: 'Watch',
  },
  {
    id: 'ward-167',
    name: 'Ward 167 - Jayanagar Rehabilitation Zone',
    shortName: 'Jayanagar',
    zone: 'South Bengaluru',
    lat: 12.925,
    lng: 77.5938,
    population: 68800,
    informalHouseholds: 4210,
    boundary: [
      { lat: 12.9362, lng: 77.5814 },
      { lat: 12.9366, lng: 77.6045 },
      { lat: 12.922, lng: 77.6113 },
      { lat: 12.9129, lng: 77.5948 },
      { lat: 12.9184, lng: 77.5799 },
    ],
    pressure: 'Moderate',
  },
]

export const scanSteps = [
  'Fetching satellite tile',
  'Analyzing road density',
  'Estimating sanitation gaps',
  'Reading water access patterns',
  'Identifying informal settlement clusters',
  'Generating remediation strategy',
]

export const plannerOverlays = {
  roadHints: [
    [{ lat: 13.033, lng: 77.539 }, { lat: 13.026, lng: 77.55 }, { lat: 13.018, lng: 77.568 }],
    [{ lat: 13.012, lng: 77.538 }, { lat: 13.021, lng: 77.552 }, { lat: 13.035, lng: 77.562 }],
    [{ lat: 13.007, lng: 77.556 }, { lat: 13.021, lng: 77.558 }, { lat: 13.036, lng: 77.556 }],
  ],
  housingClusters: [
    { lat: 13.0301, lng: 77.5482, weight: 4, label: 'Cluster A' },
    { lat: 13.0214, lng: 77.5664, weight: 5, label: 'Cluster B' },
    { lat: 13.0149, lng: 77.5451, weight: 3, label: 'Cluster C' },
    { lat: 13.0272, lng: 77.5584, weight: 4, label: 'Cluster D' },
  ],
  drainageZones: [
    { lat: 13.0186, lng: 77.5538, radius: 620 },
    { lat: 13.0282, lng: 77.5419, radius: 440 },
  ],
  waterStress: [
    { lat: 13.0314, lng: 77.5616, radius: 520 },
    { lat: 13.0134, lng: 77.5502, radius: 390 },
  ],
  civicPressure: [
    { lat: 13.0231, lng: 77.5574, weight: 78 },
    { lat: 13.0325, lng: 77.5513, weight: 64 },
    { lat: 13.0172, lng: 77.5426, weight: 59 },
  ],
}

export const mockWardAnalyses = {
  'ward-14': {
    analysisId: 'NIV-SCAN-14-0526',
    wardId: 'ward-14',
    generatedAt: 'Today 15:42 IST',
    confidence: 91,
    demoMode: true,
    executiveSummary:
      'Ward 14 shows concentrated infrastructure stress along the industrial-residential interface. Road access is serviceable on arterial edges, but interior settlement lanes show sanitation, drainage, and water access deficits that could worsen during monsoon runoff.',
    scores: [
      { key: 'road', label: 'Road connectivity', value: 62, severity: 'Watch', explanation: 'Arterial access is strong, but last-mile lanes inside informal clusters are narrow and discontinuous.' },
      { key: 'water', label: 'Water access', value: 54, severity: 'High', explanation: 'Shared tap density is below recommended service radius for two large settlement pockets.' },
      { key: 'sanitation', label: 'Sanitation coverage', value: 41, severity: 'Critical', explanation: 'Community toilet capacity and greywater routing are insufficient near Cluster B and C.' },
      { key: 'electricity', label: 'Electricity access', value: 73, severity: 'Moderate', explanation: 'Most homes show electrical access, but feeder reliability is uneven near industrial edges.' },
      { key: 'green', label: 'Green coverage', value: 29, severity: 'Critical', explanation: 'Very limited open space and heat-buffering vegetation across dense settlement blocks.' },
      { key: 'settlement', label: 'Informal settlement intensity', value: 82, severity: 'Critical', explanation: 'High roof-density signatures indicate overcrowding and limited emergency access.' },
    ],
    report: {
      primaryRisk:
        'The highest near-term risk is sanitation and stormwater overflow in dense housing clusters east of the rail corridor, where surface drainage appears fragmented and road widths constrain response vehicles.',
      immediateAction:
        'Deploy a joint drainage and sanitation survey within 72 hours, prioritize temporary desilting at two low-lying inlets, and add mobile sanitation capacity near Cluster B before the next rainfall cycle.',
      longTermStrategy:
        'Create a phased upgrading plan combining lane widening, community toilet reconstruction, piped water standpost expansion, and resilient rental housing options for families located in recurring flood pockets.',
      estimatedPopulationImpact: '34,000 to 42,000 residents would benefit from the first two intervention phases.',
    },
    recommendations: [
      { project: 'Primary drain desilting and inlet reconstruction', priority: 'Immediate', cost: '₹1.8 Cr', time: '8 weeks', impact: 91, explanation: 'Reduces monsoon overflow risk around the rail-side settlement pockets.' },
      { project: 'Community sanitation block upgrade', priority: 'High', cost: '₹2.4 Cr', time: '14 weeks', impact: 88, explanation: 'Adds toilet capacity and safer greywater routing for high-density clusters.' },
      { project: 'Water standpost and pressure balancing network', priority: 'High', cost: '₹1.2 Cr', time: '10 weeks', impact: 81, explanation: 'Improves service radius and reduces dependence on irregular tanker supply.' },
      { project: 'Interior lane restoration and emergency access marking', priority: 'Medium', cost: '₹90 L', time: '6 weeks', impact: 74, explanation: 'Improves ambulance, fire, and solid-waste access through narrow settlement lanes.' },
      { project: 'Temporary housing allocation for flood-prone households', priority: 'Medium', cost: '₹1.6 Cr', time: '12 weeks', impact: 79, explanation: 'Relocates the highest-risk families while permanent upgrading is sequenced.' },
    ],
  },
}

export function getFallbackAnalysis(wardId) {
  const base = mockWardAnalyses[wardId] || mockWardAnalyses['ward-14']
  return {
    ...base,
    wardId,
    demoMode: true,
  }
}
