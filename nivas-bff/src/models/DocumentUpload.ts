import { Schema, model } from 'mongoose';

export type DocumentUploadDocument = {
  userId: string;
  type: 'aadhaar' | 'pan' | 'income_certificate' | 'rent_agreement' | 'ration_card' | 'other';
  url: string;
  status: 'pending' | 'verified' | 'rejected' | 'needs_review';
  extractedData?: Record<string, unknown>;
  confidence?: number;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const documentUploadSchema = new Schema<DocumentUploadDocument>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['aadhaar', 'pan', 'income_certificate', 'rent_agreement', 'ration_card', 'other'],
      required: true,
    },
    url: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'needs_review'],
      default: 'pending',
      index: true,
    },
    extractedData: { type: Schema.Types.Mixed, default: {} },
    confidence: Number,
    verifiedAt: Date,
  },
  { timestamps: true }
);

export const DocumentUploadModel = model<DocumentUploadDocument>('DocumentUpload', documentUploadSchema);
