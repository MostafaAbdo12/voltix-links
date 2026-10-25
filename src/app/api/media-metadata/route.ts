import { NextResponse } from 'next/server';
import { getAuthUser, checkRateLimit } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function cleanTitleAndArtist(rawTitle: string, rawAuthor: string, platform: string) {
  let title = (rawTitle || '').trim();
  let artist = (rawAuthor || '').trim();

  // Strip common noisy tags from titles
  const tagsToRemove = [
    /\s*[\[\(](Official\s+)?(Music\s+)?Video[\]\)]/gi,
    /\s*[\[\(](Official\s+)?Audio[\]\)]/gi,
    /\s*[\[\(]Lyric(s)?\s+Video[\]\)]/gi,
    /\s*[\[\(]Visualizer[\]\)]/gi,
    /\s*[\[\(](فيديو\s+كليب|كليب\s+رسمي|فيديو|أوديو|الأوديو\s+الرسمي|النسخة\s+الأصلية|بالكلمات)[\]\)]/gi,
    /\s*[\[\(]\d{4}\s+Remaster[\]\)]/gi,
    /\s*[\[\(]4K(\s+Remaster)?[\]\)]/gi,
    /\s*[\[\(]HD[\]\)]/gi,
  ];

  for (const rx of tagsToRemove) {
    title = title.replace(rx, '');
  }
  title = title.trim();

  if (platform === 'soundcloud' && artist && title.toLowerCase().endsWith(' by ' + artist.toLowerCase())) {
    title = title.slice(0, title.length - (' by ' + artist).length).trim();
  }

  // Check separators: " - ", " – ", " — ", " | "
  const sepMatch = title.match(/^(.*?)\s*[-–—|]\s*(.*?)$/);
  if (sepMatch && sepMatch[1] && sepMatch[2]) {
    const part1 = sepMatch[1].trim();
    const part2 = sepMatch[2].trim();

    // Check if channel is a known record label or music distributor
    const isLabelChannel = /^(rotana|mazzika|craft media|free music|melody|sony music|universal music|warner music|vevo|t-series)/i.test(artist);

    if (isLabelChannel) {
      artist = part1;
      title = part2;
    } else if (artist && (part1.toLowerCase().includes(artist.toLowerCase()) || artist.toLowerCase().includes(part1.toLowerCase()))) {
      artist = part1;
      title = part2;
    } else if (artist && (part2.toLowerCase().includes(artist.toLowerCase()) || artist.toLowerCase().includes(part2.toLowerCase()))) {
      artist = part2;
      title = part1;
    } else if (part1.length > 0 && part2.length > 0) {
      artist = part1;
      title = part2;
    }
  }

  // Clean remaining wrapping quotes
  title = title.replace(/^["'«“]+|["'»”]+$/g, '').trim();
  artist = artist.replace(/^["'«“]+|["'»”]+$/g, '').trim();

  return { title, artist };
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized / غير مصرح' }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rl = checkRateLimit(`media-meta:${user.id || ip}`, 60, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'تجاوزت الحد المسموح من الطلبات، يرجى الانتظار / Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const targetUrl = typeof body?.url === 'string' ? body.url.trim() : '';

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return NextResponse.json({ error: 'الرابط غير صالح / Invalid URL' }, { status: 400 });
    }

    const lower = targetUrl.toLowerCase();

    // Platform detection
    let platform: 'youtube' | 'youtube-music' | 'spotify' | 'soundcloud' | 'anghami' | 'custom' = 'youtube';
    if (/music\.youtube\.com/i.test(lower)) platform = 'youtube-music';
    else if (/youtube\.com|youtu\.be/i.test(lower)) platform = 'youtube';
    else if (/spotify\.com/i.test(lower)) platform = 'spotify';
    else if (/soundcloud\.com/i.test(lower)) platform = 'soundcloud';
    else if (/anghami\.com/i.test(lower)) platform = 'anghami';
    else if (/\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(lower)) platform = 'custom';

    let rawTitle = '';
    let rawAuthor = '';
    let coverUrl = '';

    // 1. YouTube & YouTube Music
    if (platform === 'youtube' || platform === 'youtube-music') {
      let videoId = '';
      const watchMatch = targetUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      const shortMatch = targetUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      const embedMatch = targetUrl.match(/youtube\.com\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);

      if (watchMatch) videoId = watchMatch[1];
      else if (shortMatch) videoId = shortMatch[1];
      else if (embedMatch) videoId = embedMatch[1];

      const canonical = videoId ? `https://www.youtube.com/watch?v=${videoId}` : targetUrl;
      coverUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';

      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(canonical)}&format=json`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          rawTitle = data.title || '';
          rawAuthor = data.author_name || '';
          if (data.thumbnail_url) coverUrl = data.thumbnail_url;
        }
      } catch (err) {
        console.warn('YouTube metadata fetch warning:', err);
      }
    }

    // 2. Spotify
    else if (platform === 'spotify') {
      try {
        const oembedRes = await fetch(
          `https://open.spotify.com/oembed?url=${encodeURIComponent(targetUrl)}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          rawTitle = data.title || '';
          coverUrl = data.thumbnail_url || '';
        }
      } catch {}

      try {
        const htmlRes = await fetch(targetUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(5000),
        });
        if (htmlRes.ok) {
          const html = await htmlRes.text();
          const musicianMatch = html.match(/name="music:musician_description"\s+content="([^"]+)"/i);
          const ogDescMatch = html.match(/property="og:description"\s+content="([^"·]+)·/i);
          const ogImgMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
          const ogTitleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i);

          if (musicianMatch) rawAuthor = musicianMatch[1].trim();
          else if (ogDescMatch) rawAuthor = ogDescMatch[1].trim();

          if (!rawTitle && ogTitleMatch) rawTitle = ogTitleMatch[1].trim();
          if (ogImgMatch) coverUrl = ogImgMatch[1].trim();
        }
      } catch {}
    }

    // 3. SoundCloud
    else if (platform === 'soundcloud') {
      try {
        const oembedRes = await fetch(
          `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(targetUrl)}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          rawTitle = data.title || '';
          rawAuthor = data.author_name || '';
          coverUrl = data.thumbnail_url || '';
        }
      } catch {}
    }

    // 4. Direct Audio (.mp3, etc.)
    else if (platform === 'custom') {
      try {
        const pathPart = new URL(targetUrl).pathname;
        const fileName = pathPart.split('/').pop() || 'Track';
        const cleanName = decodeURIComponent(fileName.replace(/\.(mp3|wav|ogg|m4a|aac|flac)$/i, '')).replace(/[_-]/g, ' ');
        rawTitle = cleanName;
      } catch {}
    }

    // 5. General Web / OpenGraph Fallback
    if (!rawTitle) {
      try {
        const pageRes = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          signal: AbortSignal.timeout(5000),
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
          const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
          const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
          const authorMeta = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i);

          rawTitle = ogTitle ? ogTitle[1] : (titleTag ? titleTag[1] : '');
          rawAuthor = authorMeta ? authorMeta[1] : (ogDesc ? ogDesc[1] : '');
          if (ogImg) coverUrl = ogImg[1];
        }
      } catch {}
    }

    const { title, artist } = cleanTitleAndArtist(rawTitle, rawAuthor, platform);

    return NextResponse.json({
      success: true,
      platform,
      title: title || rawTitle || 'مقطع صوتي جديد',
      artist: artist || rawAuthor || '',
      coverUrl: coverUrl || '',
      originalTitle: rawTitle || '',
    });
  } catch (error: any) {
    console.error('media-metadata error:', error);
    return NextResponse.json(
      { error: error?.message || 'فشل في استخراج بيانات المقطع' },
      { status: 500 }
    );
  }
}
