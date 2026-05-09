import { z } from 'zod';
import { locationSchema } from './common.js';

export const createComplaintSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  category: z.string().optional(),
  location: locationSchema,
  wardId: z.string().min(1),
  photoUrl: z.string().url().optional(),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'escalated', 'classification_failed']),
});

export const routeComplaintSchema = z.object({
  officerId: z.string().optional(),
});
