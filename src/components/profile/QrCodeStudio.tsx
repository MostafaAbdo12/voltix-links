'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode as QrIcon } from 'lucide-react';

export interface QrConfig {
  fgColor: string;
  bgColor: string;
  includeLogo: boolean;
  logoUrl?: string;
}

export function QrCodeView({
  url,
  fgColor = '#D4AF37',
  bgColor = '#050508',
  includeLogo = true,
  logoUrl = '/voltix-logo.png',
  size = 240,
  showDownloadButtons = true,
  username = 'voltix',
}: {
  url: string;
  fgColor?: string;
  bgColor?: string;
  includeLogo?: boolean;
  logoUrl?: string;
  size?: number;
  showDownloadButtons?: boolean;
  username?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string>('');

  useEffect(() => {
    let active = true;
    const renderQr = async () => {
      try {
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, url || 'https://voltix.io', {
            width: size,
            margin: 2,
            errorCorrectionLevel: 'H',
            color: {
              dark: fgColor || '#D4AF37',
              light: bgColor || '#050508',
            },
          });

          if (includeLogo && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              const centerSize = Math.floor(size * 0.24);
              const centerPos = Math.floor((size - centerSize) / 2);

              ctx.save();
              ctx.fillStyle = bgColor || '#050508';
              ctx.strokeStyle = fgColor || '#D4AF37';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.roundRect(centerPos - 4, centerPos - 4, centerSize + 8, centerSize + 8, 12);
              ctx.fill();
              ctx.stroke();

              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                if (!active || !canvasRef.current) return;
                ctx.drawImage(img, centerPos, centerPos, centerSize, centerSize);
                ctx.restore();
              };
              img.onerror = () => {
                ctx.fillStyle = fgColor || '#D4AF37';
                ctx.font = `bold ${Math.floor(centerSize * 0.48)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('V', size / 2, size / 2);
                ctx.restore();
              };
              img.src = logoUrl || '/voltix-logo.png';
            }
          }
        }

        const svgStr = await QRCode.toString(url || 'https://voltix.io', {
          type: 'svg',
          width: size,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: fgColor || '#D4AF37',
            light: bgColor || '#050508',
          },
        });
        if (active) setSvgMarkup(svgStr);
      } catch (err) {
        console.error('QR generation error:', err);
      }
    };
    renderQr();
    return () => {
      active = false;
    };
  }, [url, fgColor, bgColor, includeLogo, logoUrl, size]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `voltix-${username}-qr.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadSvg = () => {
    if (!svgMarkup) return;
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `voltix-${username}-qr.svg`;
    link.href = blobUrl;
    link.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative p-4 rounded-3xl border border-white/15 shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
        style={{ backgroundColor: bgColor }}
      >
        <canvas ref={canvasRef} className="rounded-2xl block" />
      </div>

      {showDownloadButtons && (
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download PNG</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all"
          >
            <QrIcon className="w-4 h-4 text-cyan-400" />
            <span>Download SVG</span>
          </button>
        </div>
      )}
    </div>
  );
}
