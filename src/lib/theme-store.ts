import { AURA_THEMES, type ThemeConfig } from './themes';

/**
 * Theme catalog tiers and prices (EGP).
 * - FREE: available to everyone.
 * - PREMIUM: bought one by one, or unlocked all at once by the Premium plan.
 * - Anything else is RETIRED: hidden from the picker, but users who already
 *   selected it keep it (so nobody's page changes under them).
 */

export const FREE_THEME_IDS = [
  'obsidian-luxury',
  'aurora-dream',
  'frosted-glass',
  'minimal-white',
  'deep-ocean',
  'cyberpunk-neon',
  'dark-carbon',
  'sunset-motion',
] as const;

export const PREMIUM_THEME_PRICES: Record<string, number> = {
  // New signature collection
  'pharaoh-sun-gold': 149,
  'sakura-dusk': 129,
  'bioluminescent-abyss': 129,
  'noir-cinema': 129,
  'warp-drive': 129,
  'zen-ceramic': 99,
  // Curated classics
  'royal-gold': 99,
  'imperial-oud-gold': 99,
  'rolls-starlight': 99,
  'black-diamond': 99,
  'cartier-crimson': 99,
  'monaco-yacht': 79,
  'cosmic-galaxy': 79,
  'holographic-vision': 79,
  'liquid-chrome': 79,
  'rgb-gaming': 79,
  'neo-tokyo-matrix': 79,
  'venetian-marble': 79,
  'haute-couture-noir': 79,
  'desert-dune-astronomy': 79,
  'quantum-singularity': 79,
};

export const NEW_THEME_IDS = new Set([
  'pharaoh-sun-gold',
  'sakura-dusk',
  'bioluminescent-abyss',
  'noir-cinema',
  'warp-drive',
  'zen-ceramic',
]);

export const PREMIUM_PLANS = {
  PREMIUM_MONTHLY: { price: 79, days: 31, nameAr: 'بريميوم شهري', nameEn: 'Premium Monthly' },
  PREMIUM_YEARLY: { price: 599, days: 366, nameAr: 'بريميوم سنوي', nameEn: 'Premium Yearly' },
} as const;

export type PremiumPlanKind = keyof typeof PREMIUM_PLANS;
export type ThemeTier = 'free' | 'premium' | 'retired';

const FREE_SET = new Set<string>(FREE_THEME_IDS);

export function getThemeTier(themeId: string): ThemeTier {
  if (FREE_SET.has(themeId)) return 'free';
  if (themeId in PREMIUM_THEME_PRICES) return 'premium';
  return 'retired';
}

export function getThemePrice(themeId: string): number | null {
  return PREMIUM_THEME_PRICES[themeId] ?? null;
}

/** Themes shown in pickers and the store: free first, then premium (new collection first). */
export function getCatalogThemes(): ThemeConfig[] {
  const byId = new Map(AURA_THEMES.map((t) => [t.id, t]));
  const free = FREE_THEME_IDS.map((id) => byId.get(id)).filter(Boolean) as ThemeConfig[];
  const premiumIds = Object.keys(PREMIUM_THEME_PRICES).sort(
    (a, b) => Number(NEW_THEME_IDS.has(b)) - Number(NEW_THEME_IDS.has(a))
  );
  const premium = premiumIds.map((id) => byId.get(id)).filter(Boolean) as ThemeConfig[];
  return [...free, ...premium];
}

export interface ThemeEntitlements {
  premiumUntil: Date | string | null;
  ownedThemeIds: string[];
}

export function hasActivePremium(ent: Pick<ThemeEntitlements, 'premiumUntil'>, now = new Date()): boolean {
  return Boolean(ent.premiumUntil && new Date(ent.premiumUntil).getTime() > now.getTime());
}

/**
 * Whether a user may use a theme. Retired themes stay usable only for users
 * already on them (`currentThemeId`), so existing pages never break.
 */
export function canUseTheme(themeId: string, ent: ThemeEntitlements, currentThemeId?: string | null): boolean {
  // A bought theme is the buyer's for life, even if it is later retired or repriced
  if (ent.ownedThemeIds.includes(themeId)) return true;
  const tier = getThemeTier(themeId);
  if (tier === 'free') return true;
  if (tier === 'retired') return themeId === currentThemeId;
  return hasActivePremium(ent) || ent.ownedThemeIds.includes(themeId);
}

export const FALLBACK_FREE_THEME_ID = 'obsidian-luxury';
