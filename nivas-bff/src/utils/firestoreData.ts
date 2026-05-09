import type { firestore } from 'firebase-admin';

export type FirestoreEntity<T extends Record<string, unknown>> = T & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

export function serializeDoc<T extends Record<string, unknown>>(
  doc: firestore.DocumentSnapshot
): FirestoreEntity<T> | null {
  if (!doc.exists) {
    return null;
  }

  const data = serializeValue(doc.data() ?? {}) as Record<string, unknown>;

  return {
    id: doc.id,
    ...data,
  } as FirestoreEntity<T>;
}

export function serializeDocs<T extends Record<string, unknown>>(
  snapshot: firestore.QuerySnapshot
): Array<FirestoreEntity<T>> {
  return snapshot.docs.map((doc) => serializeDoc<T>(doc)).filter((doc): doc is FirestoreEntity<T> => Boolean(doc));
}

export function serializeValue(value: unknown): unknown {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, serializeValue(nestedValue)])
    );
  }

  return value;
}
