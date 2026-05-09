import { Schema, model } from 'mongoose';

export type HousingUnitDocument = {
  scheme: string;
  address: Record<string, unknown>;
  specifications: Record<string, unknown>;
  financial: Record<string, unknown>;
  eligibility: Record<string, unknown>;
  nearbyFacilities?: Record<string, unknown>;
  status: 'available' | 'booked' | 'under_construction' | 'maintenance';
  possessionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const housingUnitSchema = new Schema<HousingUnitDocument>(
  {
    scheme: { type: String, required: true, index: true },
    address: { type: Schema.Types.Mixed, required: true },
    specifications: { type: Schema.Types.Mixed, required: true },
    financial: { type: Schema.Types.Mixed, required: true },
    eligibility: { type: Schema.Types.Mixed, required: true },
    nearbyFacilities: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['available', 'booked', 'under_construction', 'maintenance'],
      default: 'available',
      index: true,
    },
    possessionDate: Date,
  },
  { timestamps: true }
);

export const HousingUnitModel = model<HousingUnitDocument>('HousingUnit', housingUnitSchema);
