import type { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import {
  createHousingApplication,
  getFamilyProfile,
  listHousingApplications,
  matchHousing,
  upsertFamilyProfile,
} from '../services/housing.service.js';

export async function getProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized', 'Authentication is required');
  }

  const profile = await getFamilyProfile(req.user.uid);
  res.json({ profile });
}

export async function postProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized', 'Authentication is required');
  }

  const profile = await upsertFamilyProfile(req.user.uid, req.body);
  res.status(201).json({ profile });
}

export async function postMatches(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized', 'Authentication is required');
  }

  const result = await matchHousing(req.user.uid, req.body);
  res.json(result);
}

export async function getApplications(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized', 'Authentication is required');
  }

  const applications = await listHousingApplications(req.user.uid);
  res.json({ applications });
}

export async function postApplication(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized', 'Authentication is required');
  }

  const application = await createHousingApplication(req.user.uid, req.body);
  res.status(201).json({ application });
}
