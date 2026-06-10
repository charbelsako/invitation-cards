import { NextFunction, Request, Response } from 'express';
import { isDatabaseConnected } from '../utils/database';

export function requireDatabase(_request: Request, response: Response, next: NextFunction) {
  if (!isDatabaseConnected()) {
    response.status(503).json({ message: 'MongoDB is not connected. Add MONGODB_URI to enable this feature.' });
    return;
  }

  next();
}
