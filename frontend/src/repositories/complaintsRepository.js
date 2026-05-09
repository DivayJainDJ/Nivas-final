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
import { complaintsApi } from '../lib/api/complaintsApi.js'
import { getFirebaseDb, getFirebaseStorage } from './firebaseApp.js'

function formatTimestamp(value) {
  if (!value) return ''
  if (value.toDate) return value.toDate().toLocaleString('en-IN')
  if (typeof value === 'string') return value
  return new Date(value).toLocaleString('en-IN')
}

function normalizeComplaint(data = {}, id) {
  const category = data.category || data.title || 'Civic issue'
  const severity = String(data.severity || data.priority || 'medium').toLowerCase()
  const status = String(data.status || 'pending').toLowerCase()
  return {
    id: id || data.id || data._id,
    residentId: data.residentId || data.userId || data.createdBy || '',
    residentPhone: data.residentPhone || data.phone || '',
    wardId: data.wardId || 'unknown',
    wardName: data.wardName || data.ward?.name || data.wardId || 'Ward pending',
    location: data.location || { lat: 12.9716, lng: 77.5946 },
    address: data.address || data.location?.address || 'Location pending',
    category,
    title: data.title || category,
    severity,
    status,
    photoUrl: data.photoUrl || data.imageUrl || '',
    geminiSummary: data.aiSummary || data.geminiSummary || data.summary || '',
    suggestedDepartment: data.suggestedDepartment || data.department || '',
    confidence: data.confidence || data.aiConfidence || 0,
    routedTo: data.routedTo || data.assignedOfficerName || data.assignedTo || '',
    description: data.description || '',
    notes: data.notes || '',
    timeline: data.timeline || [{ label: 'Complaint received', time: formatTimestamp(data.createdAt) || 'Recently' }],
    createdAt: formatTimestamp(data.createdAt || data.timestamp) || 'Recently',
    updatedAt: formatTimestamp(data.updatedAt) || formatTimestamp(data.createdAt) || 'Recently',
  }
}

function normalizeSnapshot(snapshot) {
  return normalizeComplaint(snapshot.data(), snapshot.id)
}

export async function uploadComplaintPhoto(file, complaintId) {
  if (!file) return ''
  const storage = getFirebaseStorage()
  const extension = file.name?.split('.').pop() || 'jpg'
  const storageRef = ref(storage, `complaints/${complaintId}/photo.${extension}`)
  const result = await uploadBytes(storageRef, file, { contentType: file.type })
  return getDownloadURL(result.ref)
}

async function createComplaintInFirestore(payload) {
  const db = getFirebaseDb()
  const docRef = await addDoc(collection(db, 'complaints'), {
    ...payload,
    status: payload.status || 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function createComplaint(payload) {
  try {
    const response = await complaintsApi.createComplaint(payload)
    return response?.id || response?.complaint?.id || response?.complaintId || normalizeComplaint(response).id || payload.id
  } catch {
    return createComplaintInFirestore(payload)
  }
}

export async function listComplaints(params = {}) {
  try {
    const response = await complaintsApi.listComplaints(params)
    const items = response?.complaints || response?.items || response || []
    return Array.isArray(items) ? items.map((item) => normalizeComplaint(item)) : []
  } catch {
    return []
  }
}

export function listenToComplaints(onData, onError) {
  try {
    const db = getFirebaseDb()
    const complaintsQuery = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'))
    return onSnapshot(
      complaintsQuery,
      (snapshot) => onData(snapshot.docs.map(normalizeSnapshot)),
      (error) => onError?.(error),
    )
  } catch (error) {
    onError?.(error)
    return () => {}
  }
}

export function listenToComplaint(complaintId, onData, onError) {
  try {
    const db = getFirebaseDb()
    return onSnapshot(
      doc(db, 'complaints', complaintId),
      (snapshot) => onData(snapshot.exists() ? normalizeSnapshot(snapshot) : null),
      (error) => onError?.(error),
    )
  } catch (error) {
    onError?.(error)
    return () => {}
  }
}

export async function updateComplaintStatus(complaintId, status, notes = '') {
  try {
    await complaintsApi.updateComplaintStatus(complaintId, status)
  } catch {
    const db = getFirebaseDb()
    await updateDoc(doc(db, 'complaints', complaintId), {
      status,
      notes,
      updatedAt: serverTimestamp(),
    })
  }
}

export async function routeComplaint(complaintId, officerId) {
  return complaintsApi.routeComplaint(complaintId, { officerId })
}
