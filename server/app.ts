import cors from 'cors';
import express from 'express';
import { adminRouter } from './api/admin';
import { authRouter } from './api/auth';
import { healthRouter } from './api/health';
import { invitationsRouter } from './api/invitations';
import { errorHandler } from './middleware/errorHandler';
import { config } from './utils/config';
import { uploadsDir } from './utils/uploads';

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.clientOrigin }));
  app.use('/uploads', express.static(uploadsDir));
  app.use(express.json());

  app.use('/api', healthRouter);
  app.use('/api', authRouter);
  app.use('/api', invitationsRouter);
  app.use('/api', adminRouter);
  app.use(errorHandler);

  return app;
}
