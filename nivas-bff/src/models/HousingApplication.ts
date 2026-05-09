import { Schema, model } from 'mongoose';

export type HousingApplicationDocument = {
  userId: string;
  familyProfileId: string;
  housingUnitId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'submitted';
  documents: unknown[];
  remarks?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const housingApplicationSchema = new Schema<HousingApplicationDocument>(
  {
    userId: { type: String, required: true, index: true },
    familyProfileId: { type: String, required: true, index: true },
    housingUnitId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'submitted'],
      default: 'submitted',
      index: true,
    },
    documents: { type: [Schema.Types.Mixed], default: [] },
    remarks: String,
    reviewedBy: String,
    reviewedAt: Date,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const HousingApplicationModel = model<HousingApplicationDocument>(
  'HousingApplication',
  housingApplicationSchema
);
