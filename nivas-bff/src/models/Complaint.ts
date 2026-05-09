import { Schema, model } from 'mongoose';

export type ComplaintDocument = {
  userId: string;
  title: string;
  description: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'classification_failed';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  wardId: string;
  photoUrl?: string;
  geminiSummary?: string;
  suggestedDepartment?: string;
  routedTo?: string;
  routedAt?: Date;
  notificationSent?: boolean;
  classifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const complaintSchema = new Schema<ComplaintDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: String,
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'escalated', 'classification_failed'],
      default: 'pending',
      index: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    wardId: { type: String, required: true, index: true },
    photoUrl: String,
    geminiSummary: String,
    suggestedDepartment: String,
    routedTo: { type: String, index: true },
    routedAt: Date,
    notificationSent: Boolean,
    classifiedAt: Date,
  },
  { timestamps: true }
);

export const ComplaintModel = model<ComplaintDocument>('Complaint', complaintSchema);
