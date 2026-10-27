'use client';

import React from 'react';
import type { PageTemplateId } from '@/lib/themes';
import type { TemplateProps } from './kit';
import { MaisonTemplate } from './MaisonTemplate';
import { BlackCardTemplate } from './BlackCardTemplate';
import { BentoTemplate } from './BentoTemplate';
import { IosTemplate } from './IosTemplate';
import { PosterTemplate } from './PosterTemplate';
import { StickerTemplate } from './StickerTemplate';
import { HudTemplate } from './HudTemplate';

const TEMPLATES: Record<PageTemplateId, React.ComponentType<TemplateProps>> = {
  maison: MaisonTemplate,
  'black-card': BlackCardTemplate,
  bento: BentoTemplate,
  ios: IosTemplate,
  poster: PosterTemplate,
  sticker: StickerTemplate,
  hud: HudTemplate,
};

export function PremiumTemplate({ template, ...props }: TemplateProps & { template: PageTemplateId }) {
  const Template = TEMPLATES[template];
  return <Template {...props} />;
}

export type { TemplateProps };
