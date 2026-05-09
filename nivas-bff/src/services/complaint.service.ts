import {
  createComplaintRecord,
  getComplaintRecord,
  listComplaintRecords,
  type ComplaintRecord,
} from '../repositories/complaint.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { microservicesClient } from './microservicesClient.js';

export async function createComplaint(userId: string, payload: any) {
  const complaint = await createComplaintRecord({
    ...payload,
    userId,
    status: 'pending',
  });

  await microservicesClient.classifyComplaint(complaint.id).catch((error) => {
    console.warn('Complaint classification trigger failed', error.message);
  });

  return complaint;
}

export async function listComplaints(user: Express.Request['user']) {
  if (!user) {
    throw new ApiError(401, 'Unauthorized', 'Authentication is required');
  }

  if (user.role === 'admin') {
    return listComplaintRecords();
  }

  if (user.role === 'officer') {
    return listComplaintRecords({ routedTo: user.uid });
  }

  return listComplaintRecords({ userId: user.uid });
}

export async function getComplaintForUser(complaintId: string, user: Express.Request['user']) {
  const complaint = await getComplaintRecord(complaintId);
  if (!complaint) {
    throw new ApiError(404, 'NotFound', 'Complaint not found');
  }

  if (user?.role === 'admin' || complaint.userId === user?.uid || complaint.routedTo === user?.uid) {
    return complaint;
  }

  throw new ApiError(403, 'Forbidden', 'You do not have permission to access this complaint');
}

export type { ComplaintRecord };
