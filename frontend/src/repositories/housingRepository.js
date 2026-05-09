import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { getFirebaseDb } from './firebaseApp.js'

export async function saveFamilyProfile(profile) {
  const ref = await addDoc(collection(getFirebaseDb(), 'familyProfiles'), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export function listenToHousingUnits(onData, onError) {
  const unitsQuery = query(collection(getFirebaseDb(), 'housingUnits'), orderBy('updatedAt', 'desc'))
  return onSnapshot(unitsQuery, (snapshot) => onData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))), onError)
}

export function listenToFamilyMatches(familyId, onData, onError) {
  const matchesQuery = query(collection(getFirebaseDb(), 'familyMatches'), where('familyId', '==', familyId), orderBy('createdAt', 'desc'))
  return onSnapshot(matchesQuery, (snapshot) => onData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))), onError)
}
