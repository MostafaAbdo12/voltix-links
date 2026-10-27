import fs from 'fs';
import path from 'path';

/**
 * Persists an uploaded file and returns its public URL.
 * Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set (required on serverless hosts,
 * whose disk is wiped between deployments), otherwise falls back to public/uploads.
 */
export async function saveUpload(filename: string, buffer: Buffer, contentType: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`uploads/${filename}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}
