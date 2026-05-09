import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDb } from '../config/firestore.js';
import { serializeDoc, serializeDocs } from '../utils/firestoreData.js';

export type ComplaintRecord = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'classification_failed';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  wardId: string;
  photoUrl?: string;
  geminiSummary?: string;
  suggestedDepartment?: string;
  routedTo?: string;
  routedAt?: string;
  notificationSent?: boolean;
  classifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

const complaints = () => getFirestoreDb().collection('complaints');

export async function createComplaintRecord(payload: Omit<ComplaintRecord, 'id'>): Promise<ComplaintRecord> {
  const now = FieldValue.serverTimestamp();
  const ref = await complaints().add({
    ...payload,
    createdAt: now,
    updatedAt: now,
  });

  return serializeDoc<Omit<ComplaintRecord, 'id'>>(await ref.get()) as ComplaintRecord;
}

export async function listComplaintRecords(filters: {
  userId?: string;
  routedTo?: string;
} = {}): Promise<ComplaintRecord[]> {
  let query: FirebaseFirestore.Query = complaints();

  if (filters.userId) {
    query = query.where('userId', '==', filters.userId);
  }

  if (filters.routedTo) {
    query = query.where('routedTo', '==', filters.routedTo);
  }

  const snapshot = await query.orderBy('createdAt', 'desc').get();
  return serializeDocs<Omit<ComplaintRecord, 'id'>>(snapshot) as ComplaintRecord[];
}

export async function getComplaintRecord(complaintId: string): Promise<ComplaintRecord | null> {
  return serializeDoc<Omit<ComplaintRecord, 'id'>>(await complaints().doc(complaintId).get()) as ComplaintRecord | null;
}

export async function updateComplaintRecord(
  complaintId: string,
  updates: Partial<ComplaintRecord>
): Promise<ComplaintRecord | null> {
  const ref = complaints().doc(complaintId);
  await ref.set(
    {
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return getComplaintRecord(complaintId);
}
