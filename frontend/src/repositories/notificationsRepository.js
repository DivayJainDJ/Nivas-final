import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { notificationsApi } from '../lib/api/notificationsApi.js'
import { getFirebaseDb } from './firebaseApp.js'

export async function registerNotificationToken(token, metadata = {}) {
  return notificationsApi.registerToken({
    token,
    platform: metadata.platform || 'web',
    version: metadata.version,
  })
}

export function listenToNotifications(userId, onData, onError) {
  try {
    const notificationsQuery = query(collection(getFirebaseDb(), `users/${userId}/notifications`), orderBy('createdAt', 'desc'))
    return onSnapshot(
      notificationsQuery,
      (snapshot) => onData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
      onError,
    )
  } catch (error) {
    onError?.(error)
    return () => {}
  }
}

