import fs from 'fs';
import path from 'path';

export const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');

export function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export interface UploadImageResult {
  url: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
}

/**
 * Validates and saves an uploaded image (from Base64 or binary buffer) to data/uploads.
 * Supported formats: image/png, image/jpeg, image/webp
 * Max file size: 5MB
 */
export async function saveUploadedImage(
  base64Data: string,
  originalFilename?: string
): Promise<UploadImageResult> {
  ensureUploadsDir();

  // Extract mime type and clean base64 payload
  let mimeType = 'image/png';
  let cleanBase64 = base64Data;

  const dataUriMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch) {
    mimeType = dataUriMatch[1].toLowerCase();
    cleanBase64 = dataUriMatch[2];
  }

  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error('صيغة الملف غير مدعومة. الصيغ المسموحة هي: PNG, JPG, JPEG, WEBP');
  }

  const buffer = Buffer.from(cleanBase64, 'base64');
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB
  if (buffer.length > maxSizeBytes) {
    throw new Error('حجم الملف يتجاوز الحد الأقصى المسموح به (5 ميجابايت)');
  }

  // Determine extension
  let ext = 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
  else if (mimeType.includes('webp')) ext = 'webp';

  // Generate unique collision-free filename
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const filename = `madar_${timestamp}_${randomSuffix}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  fs.writeFileSync(filePath, buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
    sizeBytes: buffer.length,
    mimeType,
  };
}
