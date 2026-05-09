import { Schema, model } from 'mongoose';
import type { UserRole } from '../types/shared.js';

export type UserDocument = {
  firebaseUid: string;
  phone?: string;
  email?: string;
  role: UserRole;
  profile?: Record<string, unknown>;
  wardId?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    phone: String,
    email: String,
    role: { type: String, enum: ['resident', 'officer', 'admin'], default: 'resident', index: true },
    profile: { type: Schema.Types.Mixed, default: {} },
    wardId: { type: String, index: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>('User', userSchema);
