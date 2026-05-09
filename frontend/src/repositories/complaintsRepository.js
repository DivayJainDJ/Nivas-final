import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseDb, getFirebaseStorage } from './firebaseApp.js'

function normalizeDoc(snapshot) {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString('en-IN') : data.createdAt,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toLocaleString('en-IN') : data.updatedAt,
  }
}

export async function uploadComplaintPhoto(file, complaintId) {
  if (!file) return ''
  const storage = getFirebaseStorage()
  const extension = file.name?.split('.').pop() || 'jpg'
  const storageRef = ref(storage, `complaints/${complaintId}/photo.${extension}`)
  const result = await uploadBytes(storageRef, file, { contentType: file.type })
  return getDownloadURL(result.ref)
}

export async function createComplaint(payload) {
  const db = getFirebaseDb()
  const docRef = await addDoc(collection(db, 'complaints'), {
    residentId: payload.residentId,
    residentPhone: payload.residentPhone,
    wardId: payload.wardId,
    wardName: payload.wardName,
    location: payload.location,
    address: payload.address,
    category: payload.category,
    severity: payload.severity,
    status: payload.status || 'pending',
    photoUrl: payload.photoUrl || '',
    geminiSummary: payload.geminiSummary || '',
    suggestedDepartment: payload.suggestedDepartment || '',
    confidence: payload.confidence || 0,
    routedTo: payload.routedTo || '',
    description: payload.description,
    notes: payload.notes || '',
    timeline: payload.timeline || [{ label: 'Complaint received', time: 'Just now' }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export function listenToComplaints(onData, onError) {
  const db = getFirebaseDb()
  const complaintsQuery = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    complaintsQuery,
    (snapshot) => onData(snapshot.docs.map(normalizeDoc)),
    (error) => onError?.(error),
  )
}

export function listenToComplaint(complaintId, onData, onError) {
  const db = getFirebaseDb()
  return onSnapshot(
    doc(db, 'complaints', complaintId),
    (snapshot) => onData(snapshot.exists() ? normalizeDoc(snapshot) : null),
    (error) => onError?.(error),
  )
}

export async function updateComplaintStatus(complaintId, status, notes = '') {
  const db = getFirebaseDb()
  await updateDoc(doc(db, 'complaints', complaintId), {
    status,
    notes,
    updatedAt: serverTimestamp(),
  })
}
