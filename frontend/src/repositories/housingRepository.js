import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { housingApi } from '../lib/api/housingApi.js'
import { getFirebaseDb } from './firebaseApp.js'

export async function saveFamilyProfile(profile) {
  const saved = await housingApi.saveProfile(profile)
  const bffProfileId = saved?.id || saved?.profile?.id || saved?.profile?._id || ''
  try {
    const ref = await addDoc(collection(getFirebaseDb(), 'familyProfiles'), {
      ...profile,
      bffProfileId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return bffProfileId || ref.id
  } catch {
    return bffProfileId || profile.id
  }
}

export async function getFamilyProfile() {
  return housingApi.getProfile()
}

export async function getHousingMatches(profile) {
  return housingApi.matchHousing(profile)
}

export async function listHousingApplications() {
  return housingApi.listApplications()
}

export async function createHousingApplication(payload) {
  return housingApi.createApplication(payload)
}

export function listenToHousingUnits(onData, onError) {
  try {
    const unitsQuery = query(collection(getFirebaseDb(), 'housingUnits'), orderBy('updatedAt', 'desc'))
    return onSnapshot(unitsQuery, (snapshot) => onData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))), onError)
  } catch (error) {
    onError?.(error)
    return () => {}
  }
}

export function listenToFamilyMatches(familyId, onData, onError) {
  try {
    const matchesQuery = query(collection(getFirebaseDb(), 'familyMatches'), where('familyId', '==', familyId), orderBy('createdAt', 'desc'))
    return onSnapshot(matchesQuery, (snapshot) => onData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))), onError)
  } catch (error) {
    onError?.(error)
    return () => {}
  }
}
