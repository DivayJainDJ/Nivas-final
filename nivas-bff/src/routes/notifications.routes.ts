import { Router } from 'express';
import { registerNotificationToken } from '../controllers/notifications.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { registerTokenSchema } from '../validators/notifications.js';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);
notificationsRouter.post('/register-token', validateBody(registerTokenSchema), asyncHandler(registerNotificationToken));
