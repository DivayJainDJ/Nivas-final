import { Router } from 'express';
import { getMe } from '../controllers/me.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

export const meRouter = Router();

meRouter.get('/', requireAuth, asyncHandler(getMe));
