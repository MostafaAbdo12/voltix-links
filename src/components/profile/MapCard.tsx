'use client';

import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { mapEmbedUrl, mapDirectionsUrl } from '@/lib/maps';

interface MapCardProps {
  title: string;
  description?: string;
  query: string;
  /** The link the owner pasted; "Open in Maps" uses it so pins and short links keep working */
  url: string;
  isRtl: boolean;
  isPreview: boolean;
  colors: { bg: string; text: string; subtext: string; border: string; accent: string; accentText: string };
  radius?: string;
  onOpen?: () => void;
}

/** An embedded Google Map with the place name and "Directions" / "Open in Maps" actions. */
export function MapCard({ title, description, query, url, isRtl, isPreview, colors, radius = '24px', onOpen }: MapCardProps) {
  const action = (href: string) => ({
    href: isPreview ? undefined : href,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: () => onOpen?.(),
  });

  return (
    <div className="w-full overflow-hidden" style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: radius }}>
      <div className="relative w-full h-44 bg-black/10">
        <iframe
          title={title}
          src={mapEmbedUrl(query, isRtl ? 'ar' : 'en')}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className={`absolute inset-0 w-full h-full border-0 ${isPreview ? 'pointer-events-none' : ''}`}
          allowFullScreen
        />
      </div>
      <div className="p-3.5 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: colors.accent, color: colors.accentText }}>
          <MapPin className="w-5 h-5" />
        </span>
        <span className="flex-1 min-w-0 text-start">
          <span className="block font-bold text-[15px] truncate">{title}</span>
          <span className="block text-xs truncate" style={{ color: colors.subtext }}>
            {description || query}
          </span>
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 px-3.5 pb-3.5">
        <a
          {...action(mapDirectionsUrl(query))}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-transform"
          style={{ background: colors.accent, color: colors.accentText }}
        >
          <Navigation className="w-4 h-4" />
          {isRtl ? 'الاتجاهات' : 'Directions'}
        </a>
        <a
          {...action(url)}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-transform"
          style={{ border: `1px solid ${colors.border}`, color: colors.text }}
        >
          <ExternalLink className="w-4 h-4" />
          {isRtl ? 'افتح في الخرايط' : 'Open in Maps'}
        </a>
      </div>
    </div>
  );
}
