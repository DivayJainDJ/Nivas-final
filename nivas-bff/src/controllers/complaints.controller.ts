import type { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { createComplaint, getComplaintForUser, listComplaints } from '../services/complaint.service.js';
import { microservicesClient } from '../services/microservicesClient.js';
import { updateComplaintRecord } from '../repositories/complaint.repository.js';

export async function postComplaint(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized', 'Authentication is required');
  }

  const complaint = await createComplaint(req.user.uid, req.body);
  res.status(201).json({ complaint });
}

export async function getComplaints(req: Request, res: Response): Promise<void> {
  const complaints = await listComplaints(req.user);
  res.json({ complaints });
}

export async function getComplaint(req: Request, res: Response): Promise<void> {
  const complaint = await getComplaintForUser(req.params.complaintId, req.user);
  res.json({ complaint });
}

export async function patchComplaintStatus(req: Request, res: Response): Promise<void> {
  const complaint = await getComplaintForUser(req.params.complaintId, req.user);

  if (req.user?.role === 'resident' && complaint.userId !== req.user.uid) {
    throw new ApiError(403, 'Forbidden', 'Residents can update only their own complaints');
  }

  const updated = await updateComplaintRecord(complaint.id, { status: req.body.status });

  res.json({ complaint: updated });
}

export async function routeComplaint(req: Request, res: Response): Promise<void> {
  const complaint = await getComplaintForUser(req.params.complaintId, req.user);
  await microservicesClient.routeComplaint(complaint.id, req.body.officerId);
  res.json({ success: true });
}
