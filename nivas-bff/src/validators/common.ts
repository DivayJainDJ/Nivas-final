import { z } from 'zod';

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().min(1),
});

export const objectIdParamSchema = z.object({
  id: z.string().min(1),
});
