import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDb } from '../config/firestore.js';
import { serializeDoc } from '../utils/firestoreData.js';

export type DocumentUploadRecord = {
  id: string;
  userId: string;
  type: string;
  url: string;
  status: 'pending' | 'verified' | 'rejected' | 'needs_review';
  extractedData?: Record<string, unknown>;
  confidence?: number;
  verifiedAt?: string;
};

const documentUploads = () => getFirestoreDb().collection('documentUploads');

export async function createDocumentUploadRecord(userId: string, payload: Record<string, unknown>) {
  const ref = await documentUploads().add({
    ...payload,
    userId,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return serializeDoc<Omit<DocumentUploadRecord, 'id'>>(await ref.get()) as DocumentUploadRecord;
}

export async function getDocumentUploadRecord(documentId: string) {
  return serializeDoc<Omit<DocumentUploadRecord, 'id'>>(
    await documentUploads().doc(documentId).get()
  ) as DocumentUploadRecord | null;
}

export async function updateDocumentUploadRecord(documentId: string, updates: Partial<DocumentUploadRecord>) {
  const ref = documentUploads().doc(documentId);
  await ref.set(
    {
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return getDocumentUploadRecord(documentId);
}
