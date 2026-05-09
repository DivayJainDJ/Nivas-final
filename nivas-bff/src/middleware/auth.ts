import type { NextFunction, Request, Response } from 'express';
import { firebaseAdmin } from '../config/firebaseAdmin.js';
import { upsertUserFromAuth } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new ApiError(401, 'Unauthorized', 'Missing Firebase bearer token');
    }

    if (!firebaseAdmin) {
      throw new ApiError(500, 'AuthNotConfigured', 'Firebase Admin is not configured');
    }

    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    const user = await upsertUserFromAuth({
      uid: decoded.uid,
      phone: decoded.phone_number,
      email: decoded.email,
    });

    req.user = {
      uid: decoded.uid,
      phone: decoded.phone_number,
      email: decoded.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, 'Unauthorized', 'Invalid Firebase bearer token'));
  }
}
