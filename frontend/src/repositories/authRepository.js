import { onAuthStateChanged } from 'firebase/auth'
import { systemApi } from '../lib/api/systemApi.js'
import { auth } from '../firebase.js'

export function listenToAuthState(onUser, onError) {
  try {
    return onAuthStateChanged(auth, onUser, onError)
  } catch (error) {
    onError?.(error)
    return () => {}
  }
}

export async function getCurrentUserProfile() {
  return systemApi.me()
}

export async function getHealth() {
  return systemApi.health()
}

