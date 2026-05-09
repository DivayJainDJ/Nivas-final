import admin from 'firebase-admin';
import { env } from './env.js';

export function getFirebaseAdmin(): admin.app.App | null {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    if (env.NODE_ENV !== 'test') {
      console.warn('Firebase Admin credentials are not configured. Auth-protected routes will fail.');
    }
    return null;
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export const firebaseAdmin = getFirebaseAdmin();
