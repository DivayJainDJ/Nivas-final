import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../types/shared.js';
import { ApiError } from '../utils/ApiError.js';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Unauthorized', 'Authentication is required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, 'Forbidden', 'You do not have permission to access this resource'));
      return;
    }

    next();
  };
}
