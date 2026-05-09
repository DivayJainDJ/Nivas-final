import { Router } from 'express';
import { getDocumentById, postParseDocument, postUploadComplete } from '../controllers/documents.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { uploadCompleteSchema } from '../validators/documents.js';

export const documentsRouter = Router();

documentsRouter.use(requireAuth);
documentsRouter.post('/upload-complete', validateBody(uploadCompleteSchema), asyncHandler(postUploadComplete));
documentsRouter.post('/:documentId/parse', asyncHandler(postParseDocument));
documentsRouter.get('/:documentId', asyncHandler(getDocumentById));
