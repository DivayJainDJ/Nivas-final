import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDb } from '../config/firestore.js';
import { serializeDoc, serializeDocs } from '../utils/firestoreData.js';

export type WardAnalysisRecord = {
  id: string;
  wardId: string;
  wardName?: string;
  scores: Record<string, number>;
  summary: string;
  topPriority: string;
  estimatedPopulation: number;
  report: Record<string, unknown>;
  analyzedAt?: string;
};

const wardAnalyses = () => getFirestoreDb().collection('wardAnalyses');

export async function upsertWardAnalysisRecord(wardId: string, payload: Omit<WardAnalysisRecord, 'id'>) {
  const ref = wardAnalyses().doc(wardId);
  await ref.set(
    {
      ...payload,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return serializeDoc<Omit<WardAnalysisRecord, 'id'>>(await ref.get()) as WardAnalysisRecord;
}

export async function listWardAnalysisRecords() {
  const snapshot = await wardAnalyses().orderBy('analyzedAt', 'desc').get();
  return serializeDocs<Omit<WardAnalysisRecord, 'id'>>(snapshot) as WardAnalysisRecord[];
}

export async function getWardAnalysisRecord(wardId: string) {
  return serializeDoc<Omit<WardAnalysisRecord, 'id'>>(await wardAnalyses().doc(wardId).get()) as WardAnalysisRecord | null;
}
