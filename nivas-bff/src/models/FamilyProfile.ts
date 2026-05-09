import { Schema, model } from 'mongoose';

export type FamilyProfileDocument = {
  userId: string;
  headOfFamily: Record<string, unknown>;
  householdSize: number;
  monthlyIncome: number;
  category: 'ews' | 'lig' | 'mig' | 'hig';
  currentAddress: Record<string, unknown>;
  currentHousing: Record<string, unknown>;
  documents: unknown[];
  preferences: Record<string, unknown>;
  eligibility?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

const familyProfileSchema = new Schema<FamilyProfileDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    headOfFamily: { type: Schema.Types.Mixed, required: true },
    householdSize: { type: Number, required: true },
    monthlyIncome: { type: Number, required: true },
    category: { type: String, enum: ['ews', 'lig', 'mig', 'hig'], required: true },
    currentAddress: { type: Schema.Types.Mixed, required: true },
    currentHousing: { type: Schema.Types.Mixed, required: true },
    documents: { type: [Schema.Types.Mixed], default: [] },
    preferences: { type: Schema.Types.Mixed, default: {} },
    eligibility: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const FamilyProfileModel = model<FamilyProfileDocument>('FamilyProfile', familyProfileSchema);
