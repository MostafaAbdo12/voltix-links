import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = new Set([
  // Images
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'bmp', 'ico', 'tiff', 'tif', 'heic', 'heif', 'apng', 'jfif',
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeHash = crypto.randomBytes(6).toString('hex');
    const safeFilename = `voltix-${Date.now()}-${safeHash}.${rawExt}`;
    const filePath = path.join(uploadsDir, safeFilename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;
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

