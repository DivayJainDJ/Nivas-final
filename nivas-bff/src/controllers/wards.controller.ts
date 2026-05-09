import type { Request, Response } from 'express';
import { analyzeWard, getWardAnalysis, listWardAnalyses } from '../services/ward.service.js';

export async function getWards(_req: Request, res: Response): Promise<void> {
  const wards = await listWardAnalyses();
  res.json({ wards });
}

export async function getWard(req: Request, res: Response): Promise<void> {
  const ward = await getWardAnalysis(req.params.wardId);
  res.json({ ward });
}

export async function postWardAnalysis(req: Request, res: Response): Promise<void> {
  const result = await analyzeWard(req.params.wardId, req.body);
  res.json(result);
}
