import { collection, getDocs, limit, query } from 'firebase/firestore'
import { getFirebaseDb } from './firebaseApp.js'

function normalize(snapshot) {
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function fetchWards(max = 50) {
  const wardsQuery = query(collection(getFirebaseDb(), 'wards'), limit(max))
  return normalize(await getDocs(wardsQuery))
}

export async function fetchInfraScores(max = 50) {
  const scoresQuery = query(collection(getFirebaseDb(), 'infraScores'), limit(max))
  return normalize(await getDocs(scoresQuery))
}

export async function fetchWardProjects(max = 80) {
  const projectsQuery = query(collection(getFirebaseDb(), 'upgradeProjects'), limit(max))
  return normalize(await getDocs(projectsQuery))
}
