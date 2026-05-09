import {
  createDocumentUploadRecord,
  getDocumentUploadRecord,
  updateDocumentUploadRecord,
} from '../repositories/document.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { microservicesClient } from './microservicesClient.js';

export async function createDocumentUpload(userId: string, payload: any) {
  return createDocumentUploadRecord(userId, payload);
}

export async function parseDocument(documentId: string, userId: string) {
  const document = await getDocumentUploadRecord(documentId);
  if (!document || document.userId !== userId) {
    throw new ApiError(404, 'NotFound', 'Document not found');
  }

  const parsed = await microservicesClient.parseDocument(documentId);
  return updateDocumentUploadRecord(documentId, {
      status: parsed.status,
      extractedData: parsed.extractedData,
      confidence: parsed.confidence,
      verifiedAt: parsed.status === 'verified' ? new Date().toISOString() : undefined,
    });
}

export async function getDocument(documentId: string, userId: string) {
  const document = await getDocumentUploadRecord(documentId);
  if (!document || document.userId !== userId) {
    throw new ApiError(404, 'NotFound', 'Document not found');
  }

  return document;
}
