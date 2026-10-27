'use client';

import React from 'react';
import type { PageTemplateId } from '@/lib/themes';
import type { TemplateProps } from './kit';
import { StudioTemplate } from './StudioTemplate';

const TEMPLATES: Record<PageTemplateId, React.ComponentType<TemplateProps>> = {
  studio: StudioTemplate,
};

export function PremiumTemplate({ template, ...props }: TemplateProps & { template: PageTemplateId }) {
  const Template = TEMPLATES[template];
  return <Template {...props} />;
}

export type { TemplateProps };
