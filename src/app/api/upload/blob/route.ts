import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// The browser uploads straight to Vercel Blob, bypassing the 4.5MB serverless body limit.
// This route only issues a short-lived token after checking the session.
const ALLOWED_CONTENT_TYPES = [
  // SVG is intentionally excluded: it can embed scripts (stored XSS)
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/bmp',
  'image/x-icon', 'image/vnd.microsoft.icon', 'image/tiff', 'image/heic', 'image/heif', 'image/apng',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/ogg', 'video/x-m4v', 'video/x-msvideo',
];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Lets the client fall back to /api/upload (local disk) in development
    return NextResponse.json({ error: 'Blob storage not configured' }, { status: 503 });
  }

  const body = (await req.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const user = await getAuthUser(req);
        if (!user) throw new Error('Unauthorized');
        // Each user may only write inside their own folder
        if (!pathname.startsWith(`uploads/${user.id}/`)) throw new Error('Invalid upload path');
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 400 });
  }
}
