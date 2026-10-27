/**
 * One-off: when themes became paid, give every existing user the theme they already
 * use, so nobody's page changes. Safe to run more than once.
 *
 *   npx tsx scripts/grandfather-themes.ts
 */
import { PrismaClient } from '@prisma/client';
import { getThemeTier } from '../src/lib/theme-store';

const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.profileConfig.findMany({ select: { userId: true, themeId: true } });
  const paid = configs.filter((c) => getThemeTier(c.themeId) === 'premium');

  for (const c of paid) {
    await prisma.themePurchase.upsert({
      where: { userId_themeId: { userId: c.userId, themeId: c.themeId } },
      update: {},
      create: { userId: c.userId, themeId: c.themeId },
    });
  }
  console.log(`Granted current paid theme to ${paid.length} of ${configs.length} users.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
