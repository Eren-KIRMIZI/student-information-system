import { StorageProvider } from './storageProvider.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class LocalStorageProvider extends StorageProvider {
  constructor() {
    super();
    this.uploadDir = path.resolve('uploads');
    // Ensure base upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file, purpose = 'OTHER') {
    // Break taint on file extension using strict validation
    const rawExt = path.extname(file.originalname || '').toLowerCase();
    const ext = /^\.[a-z0-9]+$/.test(rawExt) ? rawExt : '';

    // Break taint on purpose using strict validation
    const rawPurpose = String(purpose || 'OTHER');
    const cleanPurpose = /^[A-Za-z0-9_-]+$/.test(rawPurpose) ? rawPurpose : 'OTHER';

    const storageKey = `${cleanPurpose}/${uuidv4()}${ext}`;
    const absolutePath = path.resolve(this.uploadDir, storageKey);

    if (!absolutePath.startsWith(this.uploadDir)) {
      throw new Error('Invalid storage key');
    }

    const relativeUrl = `/uploads/${storageKey}`;

    // Ensure the subdirectory exists
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Move file to target path
    // Multer uses file.path for the temporary file
    fs.renameSync(file.path, absolutePath);

    return {
      storageKey,
      fileUrl: relativeUrl,
      fileSize: file.size,
      fileType: file.mimetype,
      extension: ext,
      originalFileName: file.originalname,
    };
  }

  async delete(storageKey) {
    const absolutePath = path.resolve(this.uploadDir, storageKey);
    if (!absolutePath.startsWith(this.uploadDir)) {
      throw new Error('Invalid storage key');
    }
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }
}
