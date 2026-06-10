import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof z.ZodError) {
    response.status(400).json({ message: error.issues[0]?.message || 'Invalid request details.' });
    return;
  }

  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'File is too large.' : error.message;
    response.status(400).json({ message });
    return;
  }

  if (error instanceof Error && error.message === 'Unsupported file type.') {
    response.status(400).json({ message: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({ message: 'Unexpected server error.' });
}
