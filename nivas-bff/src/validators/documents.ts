import { z } from 'zod';

export const uploadCompleteSchema = z.object({
  type: z.enum(['aadhaar', 'pan', 'income_certificate', 'rent_agreement', 'ration_card', 'other']),
  url: z.string().url(),
});
