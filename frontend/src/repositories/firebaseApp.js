import app, { firestore, hasFirebaseConfig, storage } from '../firebase.js'

export { hasFirebaseConfig }

export function getFirebaseApp() {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase environment variables are not configured')
  }
  return app
}

export function getFirebaseDb() {
  if (!hasFirebaseConfig) {
    throw new Error('Firestore is unavailable in seeded mode')
  }
  return firestore
}

export function getFirebaseStorage() {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase Storage is unavailable in seeded mode')
  }
  return storage
}

