export const documentChecklist = [
  { key: 'aadhaar', label: 'Aadhaar' },
  { key: 'incomeCertificate', label: 'Income Certificate' },
  { key: 'rationCard', label: 'Ration Card' },
  { key: 'domicileCertificate', label: 'Domicile Certificate' },
  { key: 'bankDetails', label: 'Bank Details' },
]

export const demoHousingUnits = [
  {
    id: 'unit-ews-101',
    projectName: 'Yelahanka Resettlement Phase II',
    wardId: 'ward-yelahanka',
    category: 'EWS',
    location: { lat: 13.1019, lng: 77.6074 },
    distanceKm: 5.8,
    monthlyRent: 2400,
    rooms: '1 RK + kitchen',
    availabilityStatus: '24 units available',
    infrastructureQuality: 86,
    waitlistEstimate: '4-6 weeks',
    eligibilityConfidence: 92,
    matchScore: 94,
    requiredDocuments: ['Aadhaar', 'Income Certificate', 'Ration Card', 'Bank Details'],
    nearbyFacilities: ['Govt. school 650m', 'PHC 1.1km', 'BMTC stop 280m', 'Anganwadi 500m'],
    explanation:
      'This option is close enough for work continuity, fits the declared EWS income band, and has better water and transport access than most available units.',
    floorDetails: 'Ground and first-floor units available with shared courtyard access.',
    transportAccess: 'BMTC feeder and suburban rail connection within 12 minutes.',
    sanitationQuality: 'Individual toilet, treated community drainage, weekly solid-waste pickup.',
    schoolProximity: 'Primary school and Anganwadi within walking distance.',
    healthcareAccess: 'Primary health center and Jan Aushadhi outlet nearby.',
    safetyIndicators: 'Streetlights, resident welfare desk, and women help point active.',
    readiness: 'Ready for allocation after document verification.',
  },
  {
    id: 'unit-ews-202',
    projectName: 'Market Worker Rental Cluster',
    wardId: 'ward-kr-market',
    category: 'EWS',
    location: { lat: 12.961, lng: 77.5849 },
    distanceKm: 3.2,
    monthlyRent: 3100,
    rooms: '1 BHK compact',
    availabilityStatus: 'Waitlist open',
    infrastructureQuality: 78,
    waitlistEstimate: '8-10 weeks',
    eligibilityConfidence: 89,
    matchScore: 88,
    requiredDocuments: ['Aadhaar', 'Income Certificate', 'Ration Card', 'Domicile Certificate'],
    nearbyFacilities: ['Market work zone 900m', 'UPHC 1.4km', 'Bus terminal 450m', 'Public school 1km'],
    explanation:
      'This match preserves access to livelihood opportunities and has strong transit proximity, but current demand may extend the waitlist timeline.',
    floorDetails: 'Second-floor units with lift access planned in next maintenance phase.',
    transportAccess: 'Central bus terminal and metro connection nearby.',
    sanitationQuality: 'Shared maintenance contract active; greywater line needs monitoring.',
    schoolProximity: 'Two public schools within 1.2km.',
    healthcareAccess: 'Urban primary health center within short bus ride.',
    safetyIndicators: 'High pedestrian activity and market police outpost nearby.',
    readiness: 'Allocation possible after queue clearance.',
  },
  {
    id: 'unit-lig-301',
    projectName: 'Banaswadi EWS Redevelopment',
    wardId: 'ward-banaswadi',
    category: 'LIG',
    location: { lat: 13.013, lng: 77.6611 },
    distanceKm: 7.4,
    monthlyRent: 4200,
    rooms: '1 BHK',
    availabilityStatus: '11 units available',
    infrastructureQuality: 83,
    waitlistEstimate: '6-8 weeks',
    eligibilityConfidence: 81,
    matchScore: 82,
    requiredDocuments: ['Aadhaar', 'Income Certificate', 'Bank Details'],
    nearbyFacilities: ['Clinic 800m', 'Bus stop 350m', 'School 1.3km', 'Park 600m'],
    explanation:
      'This unit is slightly farther from the current address but has stronger sanitation quality and more predictable occupancy turnover.',
    floorDetails: 'Third-floor units with wide staircase and water storage connection.',
    transportAccess: 'Frequent bus routes toward East Bengaluru employment corridors.',
    sanitationQuality: 'Individual toilet and covered stormwater channel.',
    schoolProximity: 'Government and aided schools within 1.5km.',
    healthcareAccess: 'Clinic and pharmacy within walking distance.',
    safetyIndicators: 'Street lighting and community watch group present.',
    readiness: 'Ready after income band verification.',
  },
]

export const demoMatchResult = {
  familyId: 'family-demo',
  generatedAt: 'Today 16:10 IST',
  demoMode: true,
  eligibility: {
    category: 'EWS',
    approvalConfidence: 88,
    qualifies: true,
    summary:
      'The family appears eligible for EWS-linked affordable rental allocation based on household income, family size, and document readiness.',
    factors: [
      { label: 'Income band fit', value: 92 },
      { label: 'Family size priority', value: 86 },
      { label: 'Document readiness', value: 72 },
      { label: 'Distance feasibility', value: 81 },
    ],
    missingDocuments: ['Domicile Certificate', 'Bank Details'],
    nextActions: [
      'Upload missing domicile certificate before final verification.',
      'Keep income certificate and ration card originals available for ward-level review.',
      'Visit the allocation help desk within 7 days if a preferred unit is shortlisted.',
    ],
  },
  waitlist: {
    currentDemand: 1287,
    projectedTimeline: '4-8 weeks',
    queuePosition: 143,
    wardDemandPressure: 'High',
    infrastructureReadiness: 82,
  },
  analytics: {
    allocationReadiness: 78,
    availableInventory: 143,
    fulfillmentRate: 64,
    categoryDistribution: [
      { name: 'EWS', value: 58 },
      { name: 'LIG', value: 29 },
      { name: 'MIG', value: 13 },
    ],
    wardPressure: [
      { ward: 'Yelahanka', demand: 72 },
      { ward: 'KR Market', demand: 88 },
      { ward: 'Banaswadi', demand: 61 },
      { ward: 'Jayanagar', demand: 44 },
    ],
  },
  matches: demoHousingUnits,
}

export function createDemoMatch(familyProfile) {
  const categoryMatches = demoHousingUnits
    .map((unit, index) => ({
      ...unit,
      matchScore: Math.max(62, unit.matchScore - (familyProfile.category === unit.category ? 0 : 8) - index),
      eligibilityConfidence: Math.max(58, unit.eligibilityConfidence - (familyProfile.annualIncome > 300000 ? 6 : 0)),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)

  return {
    ...demoMatchResult,
    familyId: familyProfile.id,
    demoMode: true,
    eligibility: {
      ...demoMatchResult.eligibility,
      category: familyProfile.category,
      missingDocuments: documentChecklist.filter((doc) => !familyProfile.documents?.[doc.key]).map((doc) => doc.label),
    },
    matches: categoryMatches,
  }
}
