import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import { firestore } from '@/config/firebase'
import { AppUser, UserRole } from '@/types/user.types'
import { Complaint, ComplaintStatus, ComplaintStats } from '@/types/complaint.types'
import { FamilyProfile, HousingUnit, MatchResult, ApplicationStatus } from '@/types/housing.types'
import { Ward, InfraScore, UpgradeProject, AIAnalysis } from '@/types/ward.types'

export class FirestoreService {
  private db = firestore

  // User operations
  async createUser(user: Omit<AppUser, 'id'>): Promise<AppUser> {
    try {
      const userRef = collection(this.db, 'users')
      const docRef = await addDoc(userRef, {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return {
        ...user,
        id: docRef.id,
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  async getUser(userId: string): Promise<AppUser | null> {
    try {
      const userRef = doc(this.db, 'users', userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const data = userDoc.data()
        return {
          ...data,
          id: userDoc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate() || new Date(),
        } as AppUser
      }

      return null
    } catch (error) {
      console.error('Error getting user:', error)
      throw new Error('Failed to get user')
    }
  }

  async updateUser(userId: string, updates: Partial<AppUser>): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Failed to update user')
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId)
      await updateDoc(userRef, {
        role,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error updating user role:', error)
      throw new Error('Failed to update user role')
    }
  }

  // Complaint operations
  async createComplaint(complaint: Omit<Complaint, 'id'>): Promise<Complaint> {
    try {
      const complaintRef = collection(this.db, 'complaints')
      const docRef = await addDoc(complaintRef, {
        ...complaint,
        timestamp: serverTimestamp(),
        ...(complaint.resolvedAt && { resolvedAt: serverTimestamp() }),
      })

      return {
        ...complaint,
        id: docRef.id,
      }
    } catch (error) {
      console.error('Error creating complaint:', error)
      throw new Error('Failed to create complaint')
    }
  }

  async getComplaint(complaintId: string): Promise<Complaint | null> {
    try {
      const complaintRef = doc(this.db, 'complaints', complaintId)
      const complaintDoc = await getDoc(complaintRef)

      if (complaintDoc.exists()) {
        const data = complaintDoc.data()
        return {
          ...data,
          id: complaintDoc.id,
          timestamp: data.timestamp?.toDate() || new Date(),
          ...(data.resolvedAt && { resolvedAt: data.resolvedAt.toDate() }),
          updates: data.updates?.map((update: any) => ({
            ...update,
            timestamp: update.timestamp?.toDate() || new Date(),
          })) || [],
        } as Complaint
      }

      return null
    } catch (error) {
      console.error('Error getting complaint:', error)
      throw new Error('Failed to get complaint')
    }
  }

  async getComplaints(filters?: {
    userId?: string
    wardId?: string
    status?: ComplaintStatus[]
    category?: string[]
    limit?: number
    lastDoc?: any
  }): Promise<Complaint[]> {
    try {
      let q = query(collection(this.db, 'complaints'), orderBy('timestamp', 'desc'))

      if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId))
      }

      if (filters?.wardId) {
        q = query(q, where('wardId', '==', filters.wardId))
      }

      if (filters?.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status))
      }

      if (filters?.category && filters.category.length > 0) {
        q = query(q, where('category', 'in', filters.category))
      }

      if (filters?.limit) {
        q = query(q, limit(filters.limit))
      }

      if (filters?.lastDoc) {
        q = query(q, startAfter(filters.lastDoc))
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate() || new Date(),
          ...(data.resolvedAt && { resolvedAt: data.resolvedAt.toDate() }),
          updates: data.updates?.map((update: any) => ({
            ...update,
            timestamp: update.timestamp?.toDate() || new Date(),
          })) || [],
        } as Complaint
      })
    } catch (error) {
      console.error('Error getting complaints:', error)
      throw new Error('Failed to get complaints')
    }
  }

  async updateComplaint(complaintId: string, updates: Partial<Complaint>): Promise<void> {
    try {
      const complaintRef = doc(this.db, 'complaints', complaintId)
      const updateData: any = { ...updates }

      if (updates.timestamp) {
        updateData.timestamp = Timestamp.fromDate(updates.timestamp)
      }

      if (updates.resolvedAt) {
        updateData.resolvedAt = Timestamp.fromDate(updates.resolvedAt)
      }

      if (updates.updates) {
        updateData.updates = updates.updates.map(update => ({
          ...update,
          timestamp: Timestamp.fromDate(update.timestamp),
        }))
      }

      await updateDoc(complaintRef, updateData)
    } catch (error) {
      console.error('Error updating complaint:', error)
      throw new Error('Failed to update complaint')
    }
  }

  async getComplaintStats(userId?: string): Promise<ComplaintStats> {
    try {
      let q = query(collection(this.db, 'complaints'))

      if (userId) {
        q = query(q, where('userId', '==', userId))
      }

      const querySnapshot = await getDocs(q)
      const complaints = querySnapshot.docs.map(doc => doc.data())

      const total = complaints.length
      const pending = complaints.filter(c => c.status === 'pending').length
      const inProgress = complaints.filter(c => c.status === 'in_progress').length
      const resolved = complaints.filter(c => c.status === 'resolved').length
      const escalated = complaints.filter(c => c.status === 'escalated').length

      // Calculate average resolution time
      const resolvedComplaints = complaints.filter(c => c.status === 'resolved' && c.resolvedAt)
      const avgResolutionTime = resolvedComplaints.length > 0
        ? resolvedComplaints.reduce((acc, c) => {
            const resolutionTime = c.resolvedAt!.toDate().getTime() - c.timestamp.toDate().getTime()
            return acc + resolutionTime
          }, 0) / resolvedComplaints.length / (1000 * 60 * 60) // Convert to hours
        : 0

      // Group by category
      const byCategory = complaints.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Group by ward
      const byWard = complaints.reduce((acc, c) => {
        acc[c.wardId] = (acc[c.wardId] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        total,
        pending,
        inProgress,
        resolved,
        escalated,
        avgResolutionTime,
        byCategory: byCategory as any,
        byWard,
      }
    } catch (error) {
      console.error('Error getting complaint stats:', error)
      throw new Error('Failed to get complaint stats')
    }
  }

  // Housing operations
  async createFamilyProfile(profile: Omit<FamilyProfile, 'id'>): Promise<FamilyProfile> {
    try {
      const profileRef = collection(this.db, 'familyProfiles')
      const docRef = await addDoc(profileRef, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return {
        ...profile,
        id: docRef.id,
      }
    } catch (error) {
      console.error('Error creating family profile:', error)
      throw new Error('Failed to create family profile')
    }
  }

  async getFamilyProfile(userId: string): Promise<FamilyProfile | null> {
    try {
      const q = query(collection(this.db, 'familyProfiles'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as FamilyProfile
      }

      return null
    } catch (error) {
      console.error('Error getting family profile:', error)
      throw new Error('Failed to get family profile')
    }
  }

  async updateFamilyProfile(profile: FamilyProfile): Promise<void> {
    try {
      const profileRef = doc(this.db, 'familyProfiles', profile.id)
      await updateDoc(profileRef, {
        ...profile,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error updating family profile:', error)
      throw new Error('Failed to update family profile')
    }
  }

  async getHousingUnits(filters?: {
    category?: string[]
    minPrice?: number
    maxPrice?: number
    location?: { lat: number; lng: number; radius: number }
  }): Promise<HousingUnit[]> {
    try {
      let q = query(collection(this.db, 'housingUnits'))

      if (filters?.category && filters.category.length > 0) {
        q = query(q, where('eligibility.category', 'array-contains-any', filters.category))
      }

      if (filters?.minPrice) {
        q = query(q, where('financial.price', '>=', filters.minPrice))
      }

      if (filters?.maxPrice) {
        q = query(q, where('financial.price', '<=', filters.maxPrice))
      }

      const querySnapshot = await getDocs(q)
      let units = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          possessionDate: data.possessionDate?.toDate() || new Date(),
        } as HousingUnit
      })

      // Apply location filter if specified
      if (filters?.location) {
        units = units.filter(unit => {
          const distance = this.calculateDistance(
            filters.location!.lat,
            filters.location!.lng,
            unit.address.coordinates.lat,
            unit.address.coordinates.lng
          )
          return distance <= filters.location!.radius
        })
      }

      return units
    } catch (error) {
      console.error('Error getting housing units:', error)
      throw new Error('Failed to get housing units')
    }
  }

  async getMatchedHousingUnits(userId: string): Promise<MatchResult[]> {
    try {
      const profile = await this.getFamilyProfile(userId)
      if (!profile) return []

      const units = await this.getHousingUnits({
        category: [profile.category],
        minPrice: 0,
        maxPrice: profile.monthlyIncome * 12 * 5, // 5 years of income
      })

      const matches: MatchResult[] = units.map(unit => {
        const score = this.calculateMatchScore(profile, unit)
        const distance = this.calculateDistance(
          profile.currentAddress.coordinates?.lat || 0,
          profile.currentAddress.coordinates?.lng || 0,
          unit.address.coordinates.lat,
          unit.address.coordinates.lng
        )

        return {
          unit,
          score,
          reasons: this.generateMatchReasons(profile, unit),
          distance,
          eligibility: {
            eligible: this.isEligible(profile, unit),
            missingDocuments: this.getMissingDocuments(profile, unit),
            incomeGap: Math.max(0, unit.eligibility.incomeMin - profile.monthlyIncome),
          },
        }
      })

      return matches.sort((a, b) => b.score - a.score)
    } catch (error) {
      console.error('Error getting matched housing units:', error)
      throw new Error('Failed to get matched housing units')
    }
  }

  async createHousingApplication(userId: string, application: any): Promise<any> {
    try {
      const applicationRef = collection(this.db, 'housingApplications')
      const docRef = await addDoc(applicationRef, {
        ...application,
        userId,
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      })

      return {
        ...application,
        id: docRef.id,
      }
    } catch (error) {
      console.error('Error creating housing application:', error)
      throw new Error('Failed to create housing application')
    }
  }

  async getHousingApplications(userId: string): Promise<any[]> {
    try {
      const q = query(collection(this.db, 'housingApplications'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        }
      })
    } catch (error) {
      console.error('Error getting housing applications:', error)
      throw new Error('Failed to get housing applications')
    }
  }

  async getWaitlistPosition(userId: string, unitId: string): Promise<number | null> {
    try {
      const q = query(
        collection(this.db, 'housingApplications'),
        where('unitId', '==', unitId),
        where('status', 'in', ['submitted', 'under_review', 'waitlisted']),
        orderBy('submittedAt', 'asc')
      )
      const querySnapshot = await getDocs(q)

      const applications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
      }))

      const userApplication = applications.find(app => app.userId === userId)
      if (!userApplication) return null

      return applications.findIndex(app => app.id === userApplication.id) + 1
    } catch (error) {
      console.error('Error getting waitlist position:', error)
      throw new Error('Failed to get waitlist position')
    }
  }

  // Ward operations
  async getWards(): Promise<Ward[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, 'wards'))
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as Ward
      })
    } catch (error) {
      console.error('Error getting wards:', error)
      throw new Error('Failed to get wards')
    }
  }

  async getWard(wardId: string): Promise<Ward | null> {
    try {
      const wardRef = doc(this.db, 'wards', wardId)
      const wardDoc = await getDoc(wardRef)

      if (wardDoc.exists()) {
        const data = wardDoc.data()
        return {
          ...data,
          id: wardDoc.id,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as Ward
      }

      return null
    } catch (error) {
      console.error('Error getting ward:', error)
      throw new Error('Failed to get ward')
    }
  }

  async updateWard(wardId: string, updates: Partial<Ward>): Promise<void> {
    try {
      const wardRef = doc(this.db, 'wards', wardId)
      await updateDoc(wardRef, {
        ...updates,
        lastUpdated: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error updating ward:', error)
      throw new Error('Failed to update ward')
    }
  }

  async getInfraScores(): Promise<Record<string, InfraScore>> {
    try {
      const querySnapshot = await getDocs(collection(this.db, 'infraScores'))
      const scores: Record<string, InfraScore> = {}

      querySnapshot.docs.forEach(doc => {
        const data = doc.data()
        scores[doc.id] = {
          ...data,
          lastCalculated: data.lastCalculated?.toDate() || new Date(),
        } as InfraScore
      })

      return scores
    } catch (error) {
      console.error('Error getting infrastructure scores:', error)
      throw new Error('Failed to get infrastructure scores')
    }
  }

  async updateInfraScore(wardId: string, score: InfraScore): Promise<void> {
    try {
      const scoreRef = doc(this.db, 'infraScores', wardId)
      await updateDoc(scoreRef, {
        ...score,
        lastCalculated: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error updating infrastructure score:', error)
      throw new Error('Failed to update infrastructure score')
    }
  }

  // Project operations
  async createUpgradeProject(project: Omit<UpgradeProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<UpgradeProject> {
    try {
      const projectRef = collection(this.db, 'upgradeProjects')
      const docRef = await addDoc(projectRef, {
        ...project,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return {
        ...project,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } catch (error) {
      console.error('Error creating upgrade project:', error)
      throw new Error('Failed to create upgrade project')
    }
  }

  async getWardProjects(wardId: string): Promise<UpgradeProject[]> {
    try {
      const q = query(collection(this.db, 'upgradeProjects'), where('wardId', '==', wardId))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          timeline: {
            ...data.timeline,
            start: data.timeline.start?.toDate() || new Date(),
            end: data.timeline.end?.toDate() || new Date(),
          },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UpgradeProject
      })
    } catch (error) {
      console.error('Error getting ward projects:', error)
      throw new Error('Failed to get ward projects')
    }
  }

  async updateProject(projectId: string, updates: Partial<UpgradeProject>): Promise<void> {
    try {
      const projectRef = doc(this.db, 'upgradeProjects', projectId)
      const updateData: any = { ...updates }

      if (updates.timeline) {
        updateData.timeline = {
          ...updates.timeline,
          ...(updates.timeline.start && { start: Timestamp.fromDate(updates.timeline.start) }),
          ...(updates.timeline.end && { end: Timestamp.fromDate(updates.timeline.end) }),
        }
      }

      await updateDoc(projectRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error updating project:', error)
      throw new Error('Failed to update project')
    }
  }

  // AI Analysis operations
  async saveAIAnalysis(analysis: Omit<AIAnalysis, 'id'>): Promise<AIAnalysis> {
    try {
      const analysisRef = collection(this.db, 'aiAnalysis')
      const docRef = await addDoc(analysisRef, {
        ...analysis,
        processedAt: serverTimestamp(),
      })

      return {
        ...analysis,
        id: docRef.id,
      }
    } catch (error) {
      console.error('Error saving AI analysis:', error)
      throw new Error('Failed to save AI analysis')
    }
  }

  async getAIAnalysis(wardId: string): Promise<AIAnalysis | null> {
    try {
      const q = query(
        collection(this.db, 'aiAnalysis'),
        where('wardId', '==', wardId),
        orderBy('processedAt', 'desc'),
        limit(1)
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          processedAt: data.processedAt?.toDate() || new Date(),
          satelliteImage: {
            ...data.satelliteImage,
            timestamp: data.satelliteImage.timestamp?.toDate() || new Date(),
          },
        } as AIAnalysis
      }

      return null
    } catch (error) {
      console.error('Error getting AI analysis:', error)
      throw new Error('Failed to get AI analysis')
    }
  }

  // Helper methods
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private calculateMatchScore(profile: FamilyProfile, unit: HousingUnit): number {
    let score = 0

    // Income eligibility (40% weight)
    if (profile.monthlyIncome >= unit.eligibility.incomeMin && 
        profile.monthlyIncome <= unit.eligibility.incomeMax) {
      score += 40
    }

    // Category match (20% weight)
    if (unit.eligibility.category.includes(profile.category)) {
      score += 20
    }

    // Room requirements (20% weight)
    if (unit.specifications.bedrooms >= profile.preferences.minRooms) {
      score += 20
    }

    // Distance (20% weight)
    const distance = this.calculateDistance(
      profile.currentAddress.coordinates?.lat || 0,
      profile.currentAddress.coordinates?.lng || 0,
      unit.address.coordinates.lat,
      unit.address.coordinates.lng
    )
    if (distance <= 5) score += 20
    else if (distance <= 10) score += 15
    else if (distance <= 20) score += 10
    else if (distance <= 30) score += 5

    return Math.min(score, 100)
  }

  private generateMatchReasons(profile: FamilyProfile, unit: HousingUnit): string[] {
    const reasons = []

    if (unit.eligibility.category.includes(profile.category)) {
      reasons.push(`Matches your ${profile.category.toUpperCase()} category`)
    }

    if (unit.specifications.bedrooms >= profile.preferences.minRooms) {
      reasons.push(`Has ${unit.specifications.bedrooms} bedrooms (you need ${profile.preferences.minRooms})`)
    }

    const distance = this.calculateDistance(
      profile.currentAddress.coordinates?.lat || 0,
      profile.currentAddress.coordinates?.lng || 0,
      unit.address.coordinates.lat,
      unit.address.coordinates.lng
    )
    if (distance <= 10) {
      reasons.push(`Close to your current location (${distance.toFixed(1)} km)`)
    }

    if (unit.nearbyFacilities.schools > 0) {
      reasons.push(`${unit.nearbyFacilities.schools} schools nearby`)
    }

    if (unit.nearbyFacilities.hospitals > 0) {
      reasons.push(`${unit.nearbyFacilities.hospitals} hospitals nearby`)
    }

    return reasons
  }

  private isEligible(profile: FamilyProfile, unit: HousingUnit): boolean {
    return (
      profile.monthlyIncome >= unit.eligibility.incomeMin &&
      profile.monthlyIncome <= unit.eligibility.incomeMax &&
      unit.eligibility.category.includes(profile.category)
    )
  }

  private getMissingDocuments(profile: FamilyProfile, unit: HousingUnit): string[] {
    const missing = []
    const existingDocs = profile.documents.map(doc => doc.type)

    for (const requiredDoc of unit.eligibility.documents) {
      if (!existingDocs.includes(requiredDoc)) {
        missing.push(requiredDoc)
      }
    }

    return missing
  }
}

export const firestoreService = new FirestoreService()
