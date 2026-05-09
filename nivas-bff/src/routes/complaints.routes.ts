import { Router } from 'express';
import {
  getComplaint,
  getComplaints,
  patchComplaintStatus,
  postComplaint,
  routeComplaint,
} from '../controllers/complaints.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validateBody } from '../middleware/validate.js';
import {
  createComplaintSchema,
  routeComplaintSchema,
  updateComplaintStatusSchema,
} from '../validators/complaints.js';

export const complaintsRouter = Router();

complaintsRouter.use(requireAuth);
complaintsRouter.post('/', validateBody(createComplaintSchema), asyncHandler(postComplaint));
complaintsRouter.get('/', asyncHandler(getComplaints));
complaintsRouter.get('/:complaintId', asyncHandler(getComplaint));
complaintsRouter.patch('/:complaintId/status', validateBody(updateComplaintStatusSchema), asyncHandler(patchComplaintStatus));
complaintsRouter.post(
  '/:complaintId/route',
  requireRole('officer', 'admin'),
  validateBody(routeComplaintSchema),
  asyncHandler(routeComplaint)
);
