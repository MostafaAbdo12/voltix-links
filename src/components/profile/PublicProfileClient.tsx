'use client';

import React, { useEffect } from 'react';
import { ProfileRenderer, ProfileData } from './ProfileRenderer';
import { ThemeConfig, EffectsConfig } from '@/lib/themes';

export function PublicProfileClient({
  profile,
  theme,
  effects,
}: {
  profile: ProfileData;
  theme: ThemeConfig;
  effects: EffectsConfig;
}) {
  useEffect(() => {
    if (!profile.id) return;
    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: profile.id,
        username: profile.username,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      }),
    }).catch(() => {});
  }, [profile.id, profile.username]);

  return (
    <ProfileRenderer
      profile={profile}
      theme={theme}
      effects={effects}
      isPreview={false}
    />
  );
}

