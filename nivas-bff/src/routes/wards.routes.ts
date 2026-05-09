import { Router } from 'express';
import { getWard, getWards, postWardAnalysis } from '../controllers/wards.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validateBody } from '../middleware/validate.js';
import { analyzeWardSchema } from '../validators/wards.js';

export const wardsRouter = Router();

wardsRouter.use(requireAuth);
wardsRouter.get('/', requireRole('officer', 'admin'), asyncHandler(getWards));
wardsRouter.get('/:wardId', requireRole('officer', 'admin'), asyncHandler(getWard));
wardsRouter.post('/:wardId/analyze', requireRole('officer', 'admin'), validateBody(analyzeWardSchema), asyncHandler(postWardAnalysis));
