import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDb } from '../config/firestore.js';
import type { UserRole } from '../types/shared.js';
import { serializeDoc } from '../utils/firestoreData.js';

export type UserRecord = {
  id: string;
  firebaseUid: string;
  phone?: string;
  email?: string;
  role: UserRole;
  profile?: Record<string, unknown>;
  wardId?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

const users = () => getFirestoreDb().collection('users');

export async function upsertUserFromAuth(payload: {
  uid: string;
  phone?: string;
  email?: string;
}): Promise<UserRecord> {
  const ref = users().doc(payload.uid);
  const existing = await ref.get();
  const now = FieldValue.serverTimestamp();

  if (!existing.exists) {
    await ref.set({
      firebaseUid: payload.uid,
      phone: payload.phone,
      email: payload.email,
      role: 'resident',
      profile: {},
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });
  } else {
    await ref.set(
      {
        phone: payload.phone,
        email: payload.email,
        updatedAt: now,
        lastLoginAt: now,
      },
      { merge: true }
    );
  }

  const updated = await ref.get();
  return serializeDoc<Omit<UserRecord, 'id'>>(updated) as UserRecord;
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  return serializeDoc<Omit<UserRecord, 'id'>>(await users().doc(userId).get()) as UserRecord | null;
}
