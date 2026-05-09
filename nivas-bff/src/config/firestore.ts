import type { firestore } from 'firebase-admin';
import { firebaseAdmin } from './firebaseAdmin.js';
import { ApiError } from '../utils/ApiError.js';

export function getFirestoreDb(): firestore.Firestore {
  if (!firebaseAdmin) {
    throw new ApiError(500, 'FirestoreNotConfigured', 'Firebase Admin is required for Firestore access');
  }

  return firebaseAdmin.firestore();
}
