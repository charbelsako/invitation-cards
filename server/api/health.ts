import { Router } from 'express';
import { getDatabaseStatus } from '../utils/database';

export const healthRouter = Router();

healthRouter.get('/health', (_request, response) => {
  response.json({
    ok: true,
    database: getDatabaseStatus()
  });
});
