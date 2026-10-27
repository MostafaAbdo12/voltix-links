'use client';

import { upload } from '@vercel/blob/client';

let cachedUserId: string | null = null;

async function getUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  cachedUserId = data?.user?.id ?? null;
  return cachedUserId;
}

/**
 * Uploads a media file and returns its public URL, or null on failure.
 * Goes straight from the browser to Vercel Blob (no 4.5MB serverless body limit);
 * falls back to /api/upload when Blob isn't configured (local development).
 */
export async function uploadMediaFile(file: File): Promise<string | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const ext = (file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1] || 'bin').toLowerCase();
  try {
    const blob = await upload(`uploads/${userId}/voltix.${ext}`, file, {
      access: 'public',
      handleUploadUrl: '/api/upload/blob',
      contentType: file.type || undefined,
      multipart: file.size > 8 * 1024 * 1024,
    });
    return blob.url;
  } catch (err) {
    // 503 = Blob not configured, so use the local-disk route; any other error is a real failure
    if (!(err instanceof Error) || !/not configured/i.test(err.message)) {
      console.error('Blob upload failed:', err);
      return null;
    }
  }

  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.url ?? null;
}
