import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDb } from '../config/firestore.js';
import { serializeDoc, serializeDocs } from '../utils/firestoreData.js';

export type FamilyProfileRecord = {
  id: string;
  userId: string;
  [key: string]: unknown;
};

export type HousingApplicationRecord = {
  id: string;
  userId: string;
  familyProfileId: string;
  housingUnitId: string;
  status: string;
  submittedAt?: string;
  [key: string]: unknown;
};

const db = () => getFirestoreDb();

export async function upsertFamilyProfileRecord(userId: string, payload: Record<string, unknown>) {
  const ref = db().collection('familyProfiles').doc(userId);
  await ref.set(
    {
      ...payload,
      userId,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return serializeDoc<Omit<FamilyProfileRecord, 'id'>>(await ref.get()) as FamilyProfileRecord;
}

export async function getFamilyProfileRecord(userId: string) {
  return serializeDoc<Omit<FamilyProfileRecord, 'id'>>(
    await db().collection('familyProfiles').doc(userId).get()
  ) as FamilyProfileRecord | null;
}

export async function createHousingApplicationRecord(userId: string, payload: Record<string, unknown>) {
  const ref = await db()
    .collection('housingApplications')
    .add({
      ...payload,
      userId,
      status: 'submitted',
      submittedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return serializeDoc<Omit<HousingApplicationRecord, 'id'>>(await ref.get()) as HousingApplicationRecord;
}

export async function listHousingApplicationRecords(userId: string) {
  const snapshot = await db()
    .collection('housingApplications')
    .where('userId', '==', userId)
    .orderBy('submittedAt', 'desc')
    .get();

  return serializeDocs<Omit<HousingApplicationRecord, 'id'>>(snapshot) as HousingApplicationRecord[];
}
