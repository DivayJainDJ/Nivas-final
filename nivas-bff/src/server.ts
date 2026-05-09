import { createApp } from './app.js';
import { connectMongo } from './config/mongo.js';
import { env } from './config/env.js';

async function bootstrap(): Promise<void> {
  if (env.MONGO_URI) {
    await connectMongo();
  } else {
    console.log('MongoDB not configured; using Firestore as primary datastore');
  }

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`NivasAI BFF listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start NivasAI BFF', error);
  process.exit(1);
});
