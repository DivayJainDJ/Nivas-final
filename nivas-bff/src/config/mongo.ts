import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectMongo(): Promise<void> {
  if (!env.MONGO_URI) {
    return;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI);
  console.log('MongoDB connected');
}
