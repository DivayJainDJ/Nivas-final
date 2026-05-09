import type { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { microservicesClient } from '../services/microservicesClient.js';

export async function registerNotificationToken(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized', 'Authentication is required');
  }

  await microservicesClient.broadcastNotification({
    type: 'register-token',
    userId: req.user.uid,
    token: req.body.token,
    deviceInfo: {
      platform: req.body.platform,
      version: req.body.version,
    },
  });

  res.status(202).json({ success: true });
}
