'use client';

import React from 'react';
import { ProfileRenderer, type ProfileData } from './ProfileRenderer';
import { DEFAULT_EFFECTS_CONFIG, type ThemeConfig } from '@/lib/themes';

const DEMO_PROFILE: ProfileData = {
  id: '',
  username: 'yourname',
  displayName: 'Your Name',
  bio: 'صانع محتوى ومصمم — كل روابطي في مكان واحد ✨',
  avatarUrl: '',
  coverUrl: '',
  isVerified: true,
  locale: 'ar',
  links: [
    { id: 'd1', title: 'موقعي الرسمي', url: '#', icon: 'Globe', isFeatured: true, badgeText: 'جديد' },
    { id: 'd2', title: 'أحدث فيديو على يوتيوب', url: '#', icon: 'Youtube', description: 'شاهد الآن' },
    { id: 'd3', title: 'المتجر', url: '#', icon: 'ShoppingBag' },
    { id: 'd4', title: 'احجز استشارة', url: '#', icon: 'Calendar' },
  ],
  socialLinks: [
    { id: 's1', platform: 'instagram', url: '#' },
    { id: 's2', platform: 'tiktok', url: '#' },
    { id: 's3', platform: 'youtube', url: '#' },
    { id: 's4', platform: 'x', url: '#' },
  ],
};

const STILL_EFFECTS = { ...DEFAULT_EFFECTS_CONFIG, reduceMotion: true };

/** A real, scaled-down render of a theme's page for store cards (static: no motion). */
export function TemplateThumb({ theme, height = 300 }: { theme: ThemeConfig; height?: number }) {
  const width = 390;
  const scale = 0.5;
  return (
    <div className="relative w-full overflow-hidden rounded-2xl pointer-events-none select-none" style={{ height }} aria-hidden>
      <div className="absolute top-0 left-1/2" style={{ width, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'top center' }}>
        <div style={{ height: height / scale }}>
          <ProfileRenderer profile={DEMO_PROFILE} theme={theme} effects={STILL_EFFECTS} isPreview compactPhone />
        </div>
      </div>
    </div>
  );
}
