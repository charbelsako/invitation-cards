import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof z.ZodError) {
    response.status(400).json({ message: error.issues[0]?.message || 'Invalid request details.' });
    return;
  }

  console.error(error);
  response.status(500).json({ message: 'Unexpected server error.' });
}
