import { prisma } from './db';
import type { ThemeEntitlements } from './theme-store';

export async function getThemeEntitlements(userId: string): Promise<ThemeEntitlements> {
  const [user, purchases] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { premiumUntil: true } }),
    prisma.themePurchase.findMany({ where: { userId }, select: { themeId: true } }),
  ]);
  return {
    premiumUntil: user?.premiumUntil ?? null,
    ownedThemeIds: purchases.map((p) => p.themeId),
  };
}
