import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'nivasai-bff',
    timestamp: new Date().toISOString(),
  });
});
