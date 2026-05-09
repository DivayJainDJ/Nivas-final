import { Router } from 'express';
import {
  getApplications,
  getProfile,
  postApplication,
  postMatches,
  postProfile,
} from '../controllers/housing.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createHousingApplicationSchema,
  familyProfileSchema,
  housingMatchSchema,
} from '../validators/housing.js';

export const housingRouter = Router();

housingRouter.use(requireAuth);
housingRouter.get('/profile', asyncHandler(getProfile));
housingRouter.post('/profile', validateBody(familyProfileSchema), asyncHandler(postProfile));
housingRouter.post('/matches', validateBody(housingMatchSchema), asyncHandler(postMatches));
housingRouter.get('/applications', asyncHandler(getApplications));
housingRouter.post('/applications', validateBody(createHousingApplicationSchema), asyncHandler(postApplication));
