import { collection, getDocs, limit, onSnapshot, query } from 'firebase/firestore'
import { wardsApi } from '../lib/api/wardsApi.js'
import { plannerWards } from '../mock/slumPlannerData.js'
import { getFirebaseDb } from './firebaseApp.js'

function normalize(snapshot) {
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function fetchWards(max = 50) {
  const apiWards = await wardsApi.listWards({ limit: max })
  if (apiWards?.length) return apiWards

  try {
    const wardsQuery = query(collection(getFirebaseDb(), 'wards'), limit(max))
    const rows = normalize(await getDocs(wardsQuery))
    return rows.length ? rows : plannerWards
  } catch {
    return plannerWards
  }
}

export async function fetchWard(wardId) {
  return wardsApi.getWard(wardId)
}

export async function analyzeWard(ward) {
  return wardsApi.analyzeWard(ward)
}

export function listenToWards(onData, onError) {
  try {
    return onSnapshot(collection(getFirebaseDb(), 'wards'), (snapshot) => onData(normalize(snapshot)), onError)
  } catch (error) {
    onError?.(error)
    return () => {}
  }
}

export async function fetchInfraScores(max = 50) {
  try {
    const scoresQuery = query(collection(getFirebaseDb(), 'infraScores'), limit(max))
    return normalize(await getDocs(scoresQuery))
  } catch {
    return []
  }
}

export async function fetchWardProjects(max = 80) {
  try {
    const projectsQuery = query(collection(getFirebaseDb(), 'upgradeProjects'), limit(max))
    return normalize(await getDocs(projectsQuery))
  } catch {
    return []
  }
}

