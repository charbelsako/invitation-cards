import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config';

export function requireAdmin(request: Request, response: Response, next: NextFunction) {
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    response.status(401).json({ message: 'Admin login required.' });
    return;
  }

  try {
    request.admin = jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
    next();
  } catch {
    response.status(401).json({ message: 'Your admin session expired. Please log in again.' });
  }
}
