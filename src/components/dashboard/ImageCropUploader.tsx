'use client';

import React, { useRef, useState } from 'react';
import {
  Upload,
  ZoomIn,
  Move,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
  Video,
  Film,
  Play,
  Loader2,
} from 'lucide-react';
import { extractPaletteFromImage } from '@/lib/color-extractor';

export const ALL_IMAGE_FORMATS_ACCEPT =
  'image/*,.png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.ico,.bmp,.tiff,.tif,.heic,.heif,.apng,.jfif';

export const ALL_MEDIA_FORMATS_ACCEPT =
  'image/*,video/*,.png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.ico,.bmp,.tiff,.tif,.heic,.heif,.apng,.jfif,.mp4,.webm,.mov,.mkv,.ogg,.m4v,.avi';

export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|music\.youtube\.com\/watch\?v=))([\w-]{11})/i);
  return match ? match[1] : null;
}

export function isVideoMedia(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  if (clean.startsWith('data:video/')) return true;
  if (/\.(mp4|webm|mov|mkv|ogg|m4v|avi)(\?.*)?$/i.test(clean)) return true;
  if (/youtube\.com\/watch|youtu\.be\/|youtube\.com\/embed/i.test(clean)) return true;
  if (/vimeo\.com/i.test(clean)) return true;
  return false;
}

const IMAGE_EXTENSIONS_REGEX =
  /\.(png|jpe?g|webp|gif|svg|avif|ico|bmp|tiff?|heic|heif|apng|jfif)$/i;

/**
 * Smart universal image file processor that accepts ALL image formats
 * (PNG, JPG, JPEG, WebP, SVG, GIF, AVIF, ICO, BMP, TIFF, HEIC, APNG)
 * while preserving transparency for logos/icons and animations for GIF/APNG/SVG.
 */
export function processUniversalImageFile(
  file: File,
  maxDim = 800,
  onSuccess: (dataUrl: string, formatLabel: string) => void,
  onError?: (msg: string) => void
) {
  const isImageMime = file.type.startsWith('image/');
  const isImageExt = IMAGE_EXTENSIONS_REGEX.test(file.name);

  if (!isImageMime && !isImageExt) {
    onError?.('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP, SVG, GIF, ICO, AVIF...)');
    return;
  }

  const ext = (file.name.split('.').pop() || file.type.split('/')[1] || 'IMG').toUpperCase();
  const isVectorOrAnimatedOrIcon =
    file.type.includes('svg') ||
    file.type.includes('gif') ||
    file.type.includes('icon') ||
    file.type.includes('ico') ||
    /\.(svg|gif|ico|apng)$/i.test(file.name);

  const reader = new FileReader();
  reader.onload = (ev) => {
    const rawDataUrl = String(ev.target?.result || '');
    if (!rawDataUrl) return;

    // Preserve vector and animated formats untouched
    if (isVectorOrAnimatedOrIcon) {
      onSuccess(rawDataUrl, ext);
      return;
    }

    // For raster images, scale smoothly and encode efficiently (WebP / compressed JPEG)
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width || maxDim;
      let h = img.height || maxDim;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        
        let optimizedDataUrl = '';
        try {
          optimizedDataUrl = canvas.toDataURL('image/webp', 0.82);
        } catch {}

        if (!optimizedDataUrl || !optimizedDataUrl.startsWith('data:image/webp')) {
          const isOpaqueJpeg = file.type === 'image/jpeg' || /\.(jpe?g|jfif)$/i.test(file.name);
          const outputMime = isOpaqueJpeg ? 'image/jpeg' : 'image/png';
          optimizedDataUrl = canvas.toDataURL(outputMime, 0.85);
        }

        onSuccess(optimizedDataUrl, ext);
      } else {
        onSuccess(rawDataUrl, ext);
      }
    };
    img.onerror = () => {
      // Fallback for formats the browser canvas cannot decode directly (e.g. HEIC/TIFF)
      onSuccess(rawDataUrl, ext);
    };
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

interface UniversalImageUploaderProps {
  label: string;
  value: string;
  onChange: (newUrl: string) => void;
  defaultUrl?: string;
  placeholder?: string;
  isRtl?: boolean;
  helperText?: string;
  compact?: boolean;
}

/**
 * Luxury Drag-and-Drop + 1-Click Universal Image Uploader
 * Supports all image formats (PNG, JPG, WebP, SVG, GIF, ICO, AVIF, BMP, HEIC)
 * with live preview, format indicator, and direct URL fallback.
 */
export function UniversalImageUploader({
  label,
  value,
  onChange,
  defaultUrl = '/voltix-logo.png',
  placeholder = '/voltix-logo.png',
  isRtl = true,
  helperText,
  compact = false,
}: UniversalImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFormat, setUploadedFormat] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    processUniversalImageFile(
      file,
      900,
      (dataUrl, formatLabel) => {
        onChange(dataUrl);
        setUploadedFormat(formatLabel);
        setUploadedFileName(file.name);
      },
      (errMsg) => alert(errMsg)
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-extrabold text-zinc-200">{label}</label>
        <span
          dir="ltr"
          className="text-[10px] font-mono text-amber-300/90 bg-amber-500/10 border border-amber-400/25 px-2 py-0.5 rounded-full"
        >
          PNG • JPG • WEBP • SVG • GIF • ICO • AVIF
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const droppedFile = e.dataTransfer.files?.[0];
          handleFile(droppedFile);
        }}
        className={`rounded-2xl border transition-all ${
          compact ? 'p-3' : 'p-3.5'
        } ${
          isDragging
            ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_25px_rgba(212,175,55,0.3)]'
            : 'border-white/15 bg-black/60 hover:border-amber-400/45'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALL_IMAGE_FORMATS_ACCEPT}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Live Image Thumbnail Box */}
          <div
            onClick={() => inputRef.current?.click()}
            title={isRtl ? 'انقر لرفع صورة جديدة' : 'Click to upload image'}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-amber-400/45 p-1.5 flex items-center justify-center shrink-0 cursor-pointer relative overflow-hidden group shadow-inner mx-auto sm:mx-0"
          >
            {value ? (
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-amber-400/70" />
            )}
            <span className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] font-black text-amber-300 text-center px-1">
              {isRtl ? 'تغيير' : 'Change'}
            </span>
          </div>

          {/* Upload Button + Direct URL Input + Actions */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs flex items-center gap-1.5 shadow-[0_6px_18px_-4px_rgba(212,175,55,0.5)] hover:brightness-110 transition-all whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isRtl ? 'رفع صورة من جهازك (جميع الصيغ)' : 'Upload Image (All Formats)'}
                </span>
              </button>

              {defaultUrl && value !== defaultUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(defaultUrl);
                    setUploadedFormat(null);
                    setUploadedFileName(null);
                  }}
                  title={isRtl ? 'استعادة الشعار الافتراضي' : 'Restore default'}
                  className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-[11px] font-bold text-zinc-300 flex items-center gap-1 whitespace-nowrap"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>{isRtl ? 'الافتراضي' : 'Default'}</span>
                </button>
              )}

              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setUploadedFormat(null);
                    setUploadedFileName(null);
                  }}
                  title={isRtl ? 'مسح الصورة' : 'Clear image'}
                  className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {uploadedFormat && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-[10px] font-extrabold text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span dir="ltr">
                    {uploadedFormat} {uploadedFileName ? `• ${uploadedFileName.slice(0, 18)}` : ''}
                  </span>
                </span>
              )}
            </div>

            {/* Optional URL Input or Data-URI Indicator */}
            <input
              type="text"
              dir="ltr"
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => {
                onChange(e.target.value);
                setUploadedFormat(null);
                setUploadedFileName(null);
              }}
              placeholder={
                value.startsWith('data:')
                  ? isRtl
                    ? '✓ تم رفع الصورة مباشرة من جهازك (أو الصق رابط خارجي هنا)'
                    : '✓ Image uploaded from device (or paste external URL here)'
                  : placeholder
              }
              className="w-full px-3 py-1.5 rounded-xl bg-black/55 border border-white/10 focus:border-amber-400 text-xs font-mono text-zinc-200 placeholder:text-emerald-300/85 focus:outline-none"
            />
          </div>
        </div>

        {helperText && (
          <p className="text-[11px] text-zinc-400 mt-2">{helperText}</p>
        )}
      </div>
    </div>
  );
}

interface ImageCropUploaderProps {
  label: string;
  value: string;
  position: { zoom: number; x: number; y: number };
  onChange: (newUrl: string, newPos: { zoom: number; x: number; y: number }) => void;
  onExtractColors?: (palette: {
    primaryAccent: string;
    secondaryAccent: string;
    surfaceBase: string;
  }) => void;
  aspect?: 'circle' | 'cover';
  isRtl?: boolean;
}

export function ImageCropUploader({
  label,
  value,
  position,
  onChange,
  onExtractColors,
  aspect = 'circle',
  isRtl = true,
}: ImageCropUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isCover = aspect === 'cover';
  const isVideo = isVideoMedia(value);
  const ytId = extractYouTubeId(value);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideoFile =
      file.type.startsWith('video/') ||
      /\.(mp4|webm|mov|mkv|ogg|m4v|avi)$/i.test(file.name);

    if (isVideoFile && !isCover) {
      alert(isRtl ? 'الفيديو متاح لغلاف الملف الشخصي فقط' : 'Videos are supported for cover banner only');
      e.target.value = '';
      return;
    }

    setUploading(true);

    // Try server-side upload API first for fast, lightweight streaming files
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url, { zoom: 1, x: 0, y: 0 });
          setUploading(false);
          e.target.value = '';
          return;
        }
      }
    } catch {
      // Fallback to in-browser FileReader if upload API is unreachable
    }

    if (isVideoFile) {
      // Fallback: Read video file via browser FileReader
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = String(ev.target?.result || '');
        if (dataUrl) {
          onChange(dataUrl, { zoom: 1, x: 0, y: 0 });
        }
        setUploading(false);
      };
      reader.onerror = () => {
        alert(isRtl ? 'تعذر قراءة ملف الفيديو' : 'Failed to read video file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } else {
      // Universal Image processor
      processUniversalImageFile(
        file,
        isCover ? 1200 : 500,
        (dataUrl) => {
          onChange(dataUrl, { zoom: 1, x: 0, y: 0 });
          setUploading(false);
        },
        (errMsg) => {
          alert(errMsg);
          setUploading(false);
        }
      );
    }

    e.target.value = '';
  };

  const handleSmartExtract = async () => {
    if (!value || !onExtractColors || isVideo) return;
    setExtracting(true);
    const palette = await extractPaletteFromImage(value);
    onExtractColors(palette);
    setExtracting(false);
  };

  const displayFormatBadge = () => {
    if (!value) return null;
    if (ytId) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black tracking-wider bg-red-600/20 text-red-400 border border-red-500/40 flex items-center gap-1.5 whitespace-nowrap shadow-sm shrink-0">
          <Play className="w-2.5 h-2.5 fill-current shrink-0" />
          <span>YOUTUBE VIDEO</span>
        </span>
      );
    }
    if (isVideo) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5 whitespace-nowrap shadow-sm shrink-0">
          <Film className="w-2.5 h-2.5 shrink-0" />
          <span>CINEMATIC VIDEO</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black tracking-wider bg-amber-500/15 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 whitespace-nowrap shadow-sm shrink-0">
        <ImageIcon className="w-2.5 h-2.5 shrink-0" />
        <span>HD IMAGE</span>
      </span>
    );
  };

  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3.5">
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pb-1 border-b border-white/5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-bold text-zinc-200 whitespace-nowrap">
            {isCover
              ? isRtl
                ? 'صورة الغلاف (Cover Image)'
                : 'Profile Cover Banner'
              : label}
          </span>
          <div className="shrink-0">{displayFormatBadge()}</div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept={isCover ? ALL_MEDIA_FORMATS_ACCEPT : ALL_IMAGE_FORMATS_ACCEPT}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/20 to-amber-500/10 hover:from-amber-400/30 hover:to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all disabled:opacity-50 whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : isCover ? (
              <>
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{isRtl ? 'رفع صورة أو فيديو' : 'Upload Image / Video'}</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{isRtl ? 'رفع صورة' : 'Upload Image'}</span>
              </>
            )}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange('', { zoom: 1, x: 0, y: 0 })}
              className="w-8 h-8 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
              title={isRtl ? 'حذف الملف' : 'Remove media'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* URL Input Alternative (Direct Image or Video / YouTube URL) */}
      <input
        type="text"
        value={value.startsWith('data:') ? '' : value}
        onChange={(e) => onChange(e.target.value, position)}
        placeholder={
          isCover
            ? isRtl
              ? 'أو الصق رابط صورة أو فيديو مباشر (MP4, WebM, YouTube, GIF, Unsplash...)'
              : 'Or paste direct Image / Video URL (MP4, WebM, YouTube, GIF...)'
            : isRtl
            ? 'أو الصق رابط صورة مباشر https://...'
            : 'Or paste direct image URL https://...'
        }
        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
        dir="ltr"
      />

      {/* Interactive Crop / Zoom / Position Controls when media is present */}
      {value && (
        <div className="pt-2 space-y-3 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div
              className={`overflow-hidden border border-amber-500/40 bg-black shrink-0 relative ${
                aspect === 'circle' ? 'w-16 h-16 rounded-full' : 'w-28 h-16 rounded-xl'
              }`}
            >
              {ytId ? (
                <div className="relative w-full h-full">
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                    alt="YouTube Video Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <Play className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                </div>
              ) : isVideo ? (
                <div className="relative w-full h-full">
                  <video
                    src={value}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${position.zoom || 1}) translate(${position.x || 0}px, ${position.y || 0}px)`,
                    }}
                  />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-black text-amber-300 flex items-center gap-1">
                    <Film className="w-2.5 h-2.5 text-amber-400" />
                    <span>VID</span>
                  </div>
                </div>
              ) : (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `scale(${position.zoom || 1}) translate(${position.x || 0}px, ${position.y || 0}px)`,
                  }}
                />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="text-[11px] text-zinc-400 w-14">
                  {isRtl ? 'التكبير' : 'Zoom'}
                </span>
                <input
                  type="range"
                  min="1"
                  max="2.2"
                  step="0.05"
                  value={position.zoom || 1}
                  onChange={(e) =>
                    onChange(value, { ...position, zoom: parseFloat(e.target.value) })
                  }
                  className="flex-1 accent-amber-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <Move className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="text-[11px] text-zinc-400 w-14">
                  {isRtl ? 'الموضع X/Y' : 'Pan X/Y'}
                </span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={position.x || 0}
                  onChange={(e) =>
                    onChange(value, { ...position, x: parseInt(e.target.value, 10) })
                  }
                  className="w-1/2 accent-amber-400"
                />
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={position.y || 0}
                  onChange={(e) =>
                    onChange(value, { ...position, y: parseInt(e.target.value, 10) })
                  }
                  className="w-1/2 accent-amber-400"
                />
              </div>
            </div>
          </div>

          {onExtractColors && !isVideo && (
            <button
              type="button"
              onClick={handleSmartExtract}
              disabled={extracting}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-white/15 text-xs font-semibold text-amber-200 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {extracting
                  ? isRtl
                    ? 'جاري استخراج الألوان الذكية...'
                    : 'Extracting Smart Palette...'
                  : isRtl
                  ? 'استخراج ألوان الثيم الذكية من هذه الصورة (Smart Accent Color)'
                  : 'Extract Smart Accent Colors from this Image'}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

