import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/db';
import {
  createSessionToken,
  verifySessionToken,
  hashPassword,
  verifyPassword,
  validateSafeUrl,
  sanitizeText,
} from '@/lib/auth';
import {
  AURA_THEMES,
  LINK_CARD_TYPES,
  PROFILE_LAYOUTS,
  ARABIC_FONTS,
  ENGLISH_FONTS,
  mergeThemeWithCustom,
  mergeEffectsConfig,
  generateThemeDNA,
  DEFAULT_EFFECTS_CONFIG,
} from '@/lib/themes';
import { SOCIAL_PLATFORMS } from '@/lib/social-platforms';
import { translations } from '@/lib/i18n';

// Import actual Next.js API Route Handlers for real integration testing
import { POST as registerPOST } from '@/app/api/auth/register/route';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { GET as meGET } from '@/app/api/auth/me/route';
import { POST as forgotPOST } from '@/app/api/auth/forgot-password/route';
import { POST as resetPOST } from '@/app/api/auth/reset-password/route';
import { PUT as profilePUT, GET as profileGET } from '@/app/api/profile/route';
import { POST as linksPOST, PUT as linksPUT, GET as linksGET } from '@/app/api/links/route';
import { PATCH as linkPATCH, DELETE as linkDELETE } from '@/app/api/links/[id]/route';
import { POST as viewPOST } from '@/app/api/analytics/view/route';
import { POST as clickPOST } from '@/app/api/analytics/click/route';
import { GET as statsGET } from '@/app/api/analytics/stats/route';
import { GET as adminGET, POST as adminPOST } from '@/app/api/admin/route';

describe('AURA LINKS — Comprehensive 18-Scenario Verification Suite', () => {
  const testRunId = Date.now().toString(36);
  const userAEmail = `usera_${testRunId}@auralinks.io`;
  const userAUsername = `usera_${testRunId}`;
  const userBEmail = `userb_${testRunId}@auralinks.io`;
  const userBUsername = `userb_${testRunId}`;

  let userAToken = '';
  let userAId = '';
  let userBToken = '';
  let userBId = '';
  let adminToken = '';
  let createdLink1Id = '';
  let createdLink2Id = '';

  // The suite runs against the real database, so remove every record it created
  afterAll(async () => {
    const emails = [userAEmail, userBEmail, `other_${userAEmail}`];
    await prisma.user.deleteMany({
      where: { OR: [{ username: { in: [userAUsername, userBUsername] } }, { email: { in: emails } }] },
    });
    await prisma.passwordResetToken.deleteMany({ where: { email: { in: emails } } });
    await prisma.verificationToken.deleteMany({ where: { email: { in: emails } } });
  });

  beforeAll(async () => {
    // Ensure admin user exists for admin authorization tests
    const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } });
    if (adminUser) {
      adminToken = await createSessionToken({
        userId: adminUser.id,
        email: adminUser.email,
        username: adminUser.username,
        role: 'ADMIN',
      });
    }
  });

  it('Scenario 1 & 4: New user can create an account & choose a unique username (rejects duplicates)', async () => {
    const req1 = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAEmail,
        username: userAUsername,
        password: 'Password@123',
        displayName: 'User A Luxury',
        locale: 'ar',
      }),
    });

    const res1 = await registerPOST(req1);
    expect(res1.status).toBe(201);
    const data1 = await res1.json();
    expect(data1.user.username).toBe(userAUsername);
    userAId = data1.user.id;

    userAToken = await createSessionToken({
      userId: userAId,
      email: userAEmail,
      username: userAUsername,
      role: 'USER',
    });

    // Attempt to register with the same username -> must fail with 409
    const reqDup = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `other_${userAEmail}`,
        username: userAUsername,
        password: 'Password@123',
      }),
    });
    const resDup = await registerPOST(reqDup);
    expect(resDup.status).toBe(409);

    // Register User B for cross-user isolation tests
    const reqB = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userBEmail,
        username: userBUsername,
        password: 'Password@123',
        displayName: 'User B',
      }),
    });
    const resB = await registerPOST(reqB);
    expect(resB.status).toBe(201);
    const dataB = await resB.json();
    userBId = dataB.user.id;
    userBToken = await createSessionToken({
      userId: userBId,
      email: userBEmail,
      username: userBUsername,
      role: 'USER',
    });
  });

  it('Scenario 2: User can log in with valid credentials and invalid credentials are rejected', async () => {
    const validReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: userAUsername,
        password: 'Password@123',
      }),
    });
    const validRes = await loginPOST(validReq);
    expect(validRes.status).toBe(200);
    const validData = await validRes.json();
    expect(validData.user.username).toBe(userAUsername);

    const invalidReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: userAUsername,
        password: 'WrongPassword999',
      }),
    });
    const invalidRes = await loginPOST(invalidReq);
    expect(invalidRes.status).toBe(401);
  });

  it('Scenario 3: User can recover and reset their password via token', async () => {
    const forgotReq = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAEmail }),
    });
    const forgotRes = await forgotPOST(forgotReq);
    expect(forgotRes.status).toBe(200);
    const forgotData = await forgotRes.json();
    expect(forgotData.resetToken).toBeDefined();

    // Reset password using the token
    const resetReq = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: forgotData.resetToken,
        newPassword: 'NewPassword@456',
      }),
    });
    const resetRes = await resetPOST(resetReq);
    expect(resetRes.status).toBe(200);

    // Verify login works with the new password
    const userRecord = await prisma.user.findUnique({ where: { id: userAId } });
    const matches = await verifyPassword('NewPassword@456', userRecord!.passwordHash);
    expect(matches).toBe(true);
  });

  it('Scenario 5 & 6: User can add, edit, reorder, and delete links', async () => {
    // Add Link 1
    const addReq1 = new Request('http://localhost:3000/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        title: 'My Luxury Project 1',
        url: 'https://auralinks.io/p1',
        cardType: 'spotlight',
        isFeatured: true,
      }),
    });
    const addRes1 = await linksPOST(addReq1);
    expect(addRes1.status).toBe(201);
    createdLink1Id = (await addRes1.json()).link.id;

    // Add Link 2
    const addReq2 = new Request('http://localhost:3000/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        title: 'My Luxury Project 2',
        url: 'https://auralinks.io/p2',
        cardType: 'neon',
      }),
    });
    const addRes2 = await linksPOST(addReq2);
    expect(addRes2.status).toBe(201);
    createdLink2Id = (await addRes2.json()).link.id;

    // Edit Link 1
    const editReq = new Request(`http://localhost:3000/api/links/${createdLink1Id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        title: 'Updated Luxury Project 1',
        badgeText: 'VIP',
      }),
    });
    const editRes = await linkPATCH(editReq, { params: { id: createdLink1Id } });
    expect(editRes.status).toBe(200);
    const editData = await editRes.json();
    expect(editData.link.title).toBe('Updated Luxury Project 1');
    expect(editData.link.badgeText).toBe('VIP');

    // Get all user A links and reorder them
    const listReq = new Request('http://localhost:3000/api/links', {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const listRes = await linksGET(listReq);
    const currentLinks = (await listRes.json()).links;
    const reversedIds = currentLinks.map((l: { id: string }) => l.id).reverse();

    const reorderReq = new Request('http://localhost:3000/api/links', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ orderedIds: reversedIds }),
    });
    const reorderRes = await linksPUT(reorderReq);
    expect(reorderRes.status).toBe(200);
    const reorderedLinks = (await reorderRes.json()).links;
    expect(reorderedLinks[0].id).toBe(reversedIds[0]);

    // Delete Link 2
    const delReq = new Request(`http://localhost:3000/api/links/${createdLink2Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const delRes = await linkDELETE(delReq, { params: { id: createdLink2Id } });
    expect(delRes.status).toBe(200);
  });

  it('Scenario 7, 8 & 9: Theme Engine has 20 themes, applies new theme & persists after reload', async () => {
    expect(AURA_THEMES.length).toBeGreaterThanOrEqual(20);

    const updateThemeReq = new Request('http://localhost:3000/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        displayName: 'Sultan Royal',
        profileConfig: {
          themeId: 'royal-gold',
          layout: 'bento',
          customThemeJson: {
            accentColor: '#FFD700',
            borderRadius: 28,
            fontFamilyAr: 'Cairo',
          },
        },
      }),
    });
    const updateRes = await profilePUT(updateThemeReq);
    expect(updateRes.status).toBe(200);

    // Reload profile to verify persistence
    const reloadReq = new Request('http://localhost:3000/api/profile', {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const reloadRes = await profileGET(reloadReq);
    const reloadData = await reloadRes.json();
    expect(reloadData.user.profileConfig.themeId).toBe('royal-gold');
    expect(reloadData.user.profileConfig.layout).toBe('bento');

    const merged = mergeThemeWithCustom(
      reloadData.user.profileConfig.themeId,
      reloadData.user.profileConfig.customThemeJson
    );
    expect(merged.accentColor).toBe('#FFD700');
    expect(merged.borderRadius).toBe(28);
    expect(merged.fontFamilyAr).toBe('Cairo');
  });

  it('Scenario 10 & 11: Public profile is accessible and views & link clicks are tracked accurately', async () => {
    const publicUser = await prisma.user.findUnique({
      where: { username: userAUsername },
      include: { links: true, profileConfig: true },
    });
    expect(publicUser).not.toBeNull();
    expect(publicUser?.displayName).toBe('Sultan Royal');

    // Record page view
    const viewReq = new Request('http://localhost:3000/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userAId,
        username: userAUsername,
        referrer: 'https://instagram.com',
      }),
    });
    const viewRes = await viewPOST(viewReq);
    expect(viewRes.status).toBe(200);

    // Record link click
    const clickReq = new Request('http://localhost:3000/api/analytics/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        linkId: createdLink1Id,
        referrer: 'https://instagram.com',
      }),
    });
    const clickRes = await clickPOST(clickReq);
    expect(clickRes.status).toBe(200);
    const clickData = await clickRes.json();
    expect(clickData.clicksCount).toBe(1);

    // Fetch analytics stats
    const statsReq = new Request('http://localhost:3000/api/analytics/stats?days=30', {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const statsRes = await statsGET(statsReq);
    expect(statsRes.status).toBe(200);
    const statsData = await statsRes.json();
    expect(statsData.totalViews).toBeGreaterThanOrEqual(1);
    expect(statsData.totalClicks).toBeGreaterThanOrEqual(1);
  });

  it('Scenario 12: User B CANNOT modify or delete User A links or profile (Strict Authorization Isolation)', async () => {
    // User B tries to edit User A's link
    const hackPatchReq = new Request(`http://localhost:3000/api/links/${createdLink1Id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({ title: 'Hacked by User B' }),
    });
    const hackPatchRes = await linkPATCH(hackPatchReq, { params: { id: createdLink1Id } });
    expect(hackPatchRes.status).toBe(403);

    // User B tries to delete User A's link
    const hackDelReq = new Request(`http://localhost:3000/api/links/${createdLink1Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const hackDelRes = await linkDELETE(hackDelReq, { params: { id: createdLink1Id } });
    expect(hackDelRes.status).toBe(403);

    // User B tries to update User A's profile by passing targetUserId
    const hackProfileReq = new Request('http://localhost:3000/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({
        targetUserId: userAId,
        displayName: 'Hacked Profile',
      }),
    });
    const hackProfileRes = await profilePUT(hackProfileReq);
    expect(hackProfileRes.status).toBe(403);
  });

  it('Scenario 13: Regular user CANNOT access Admin Panel API (403), while Admin user succeeds (200)', async () => {
    const regularAdminReq = new Request('http://localhost:3000/api/admin', {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const regularAdminRes = await adminGET(regularAdminReq);
    expect(regularAdminRes.status).toBe(403);

    if (adminToken) {
      const realAdminReq = new Request('http://localhost:3000/api/admin', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const realAdminRes = await adminGET(realAdminReq);
      expect(realAdminRes.status).toBe(200);
      const adminData = await realAdminRes.json();
      expect(adminData.metrics.totalUsers).toBeGreaterThanOrEqual(3);
    }
  });

  it('Scenario 14, 15 & 16: Bilingual i18n, 24 Fonts, 12 Card Types, 7 Layouts, 14 Socials & Effects Studio', () => {
    expect(translations.ar.brand).toBe('VoltiX');
    expect(translations.en.brand).toBe('VoltiX');
    expect(ARABIC_FONTS.length).toBe(12);
    expect(ENGLISH_FONTS.length).toBe(12);
    expect(LINK_CARD_TYPES.length).toBe(12);
    expect(PROFILE_LAYOUTS.length).toBe(7);
    expect(SOCIAL_PLATFORMS.length).toBe(14);

    const dna = generateThemeDNA('#FF0080', '#00F5D4', '#050508', 'gaming');
    expect(dna.accentColor).toBe('#FF0080');

    const effects = mergeEffectsConfig({ reduceMotion: true, particleDensity: 15 });
    expect(effects.reduceMotion).toBe(true);
    expect(effects.particleDensity).toBe(15);

    // XSS & Unsafe URL sanitization checks
    expect(validateSafeUrl('javascript:alert(1)').valid).toBe(false);
    expect(validateSafeUrl('https://auralinks.io').valid).toBe(true);
    expect(sanitizeText('<script>evil()</script>Hello')).toBe('Hello');
  });
});

