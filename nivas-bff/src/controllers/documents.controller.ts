import type { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { createDocumentUpload, getDocument, parseDocument } from '../services/document.service.js';

export async function postUploadComplete(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized', 'Authentication is required');
  }

  const document = await createDocumentUpload(req.user.uid, req.body);
  res.status(201).json({ document });
}

export async function postParseDocument(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized', 'Authentication is required');
  }

  const document = await parseDocument(req.params.documentId, req.user.uid);
  res.json({ document });
}

export async function getDocumentById(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized', 'Authentication is required');
  }

  const document = await getDocument(req.params.documentId, req.user.uid);
  res.json({ document });
}
