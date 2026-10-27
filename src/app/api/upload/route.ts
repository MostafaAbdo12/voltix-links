import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { saveUpload } from '@/lib/storage';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const BLOCKED_MIME_TYPES = new Set(['image/svg+xml', 'text/html', 'application/xhtml+xml', 'application/xml', 'text/xml']);

const ALLOWED_EXTENSIONS = new Set([
  // Images
  // SVG is intentionally excluded: it can embed scripts (stored XSS)
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp', 'ico', 'tiff', 'tif', 'heic', 'heif', 'apng', 'jfif',
  // Videos
  'mp4', 'webm', 'mov', 'mkv', 'ogg', 'm4v', 'avi'
]);

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized / غير مصرح' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرفاق ملف / No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً. الحد الأقصى المسموح 50 ميجابايت / File exceeds 50MB' },
        { status: 400 }
      );
    }

    const originalName = file.name || 'media';
    const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
    const rawExt = extMatch ? extMatch[1].toLowerCase() : (file.type.split('/')[1] || 'bin').toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: `صيغة الملف غير مدعومة (.${rawExt}). الصيغ المدعومة: صور وفيديوهات بجميع الصيغ.` },
        { status: 400 }
      );
    }

    if (BLOCKED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'صيغة الملف غير مسموحة / File type not allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeHash = crypto.randomBytes(6).toString('hex');
    const safeFilename = `voltix-${Date.now()}-${safeHash}.${rawExt}`;
    const publicUrl = await saveUpload(safeFilename, buffer, file.type || 'application/octet-stream');
    const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'ogg', 'm4v'].includes(rawExt);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      isVideo,
      format: rawExt.toUpperCase(),
      size: file.size,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

