import { prisma } from './db';
import { buildEntitlements, type ThemeEntitlements } from './theme-store';

export async function getThemeEntitlements(userId: string): Promise<ThemeEntitlements> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, premiumUntil: true, themePurchases: { select: { themeId: true } } },
  });
  if (!user) return { premiumUntil: null, ownedThemeIds: [] };
  return buildEntitlements(user);
}
