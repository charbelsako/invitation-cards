import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

export const uploadsDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const imageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const audioMimeTypes = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-wav']);

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  }
});

function createUpload(allowedMimeTypes: Set<string>, maxSizeMb: number) {
  return multer({
    storage,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    fileFilter: (_request: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
      if (allowedMimeTypes.has(file.mimetype)) {
        callback(null, true);
        return;
      }

      callback(new Error('Unsupported file type.'));
    }
  });
}

export const uploadImage = createUpload(imageMimeTypes, 10);
export const uploadAudio = createUpload(audioMimeTypes, 25);
