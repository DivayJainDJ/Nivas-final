import { z } from 'zod';

export const analyzeWardSchema = z.object({
  wardName: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
});
