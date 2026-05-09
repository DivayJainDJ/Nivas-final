import { z } from 'zod';

export const familyProfileSchema = z.object({
  headOfFamily: z.record(z.unknown()),
  householdSize: z.number().int().positive(),
  monthlyIncome: z.number().nonnegative(),
  category: z.enum(['ews', 'lig', 'mig', 'hig']),
  currentAddress: z.record(z.unknown()),
  currentHousing: z.record(z.unknown()),
  documents: z.array(z.unknown()).default([]),
  preferences: z.record(z.unknown()).default({}),
});

export const housingMatchSchema = z.object({
  familyProfile: familyProfileSchema.optional(),
});

export const createHousingApplicationSchema = z.object({
  familyProfileId: z.string().min(1),
  housingUnitId: z.string().min(1),
  documents: z.array(z.unknown()).default([]),
  remarks: z.string().optional(),
});
