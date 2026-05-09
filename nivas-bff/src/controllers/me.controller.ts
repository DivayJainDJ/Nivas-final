import type { Request, Response } from 'express';
import { getUserById } from '../repositories/user.repository.js';

export async function getMe(req: Request, res: Response): Promise<void> {
  const userRecord = req.user?.uid ? await getUserById(req.user.uid) : null;

  res.json({
    user: {
      id: req.user?.uid,
      phone: req.user?.phone ?? null,
      email: req.user?.email ?? null,
      role: userRecord?.role ?? req.user?.role ?? 'resident',
      profile: userRecord?.profile ?? {},
    },
  });
}
