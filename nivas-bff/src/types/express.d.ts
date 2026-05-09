import type { UserRole } from './shared.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        phone?: string;
        email?: string;
        role: UserRole;
      };
    }
  }
}

export {};
