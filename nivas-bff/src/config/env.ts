import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  MONGO_URI: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  NIVASAI_SERVICES_BASE_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_MAPS_KEY: z.string().optional(),
  DOCUMENT_AI_PROJECT_ID: z.string().optional(),
  DOCUMENT_AI_LOCATION: z.string().optional(),
  DOCUMENT_AI_PROCESSOR_ID: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
