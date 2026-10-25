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
    const rl = checkRateLimit(`media-pl:${user.id || ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'تجاوزت الحد المسموح من الطلبات، يرجى الانتظار / Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const targetUrl = typeof body?.url === 'string' ? body.url.trim() : '';

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return NextResponse.json({ error: 'رابط قائمة التشغيل غير صالح / Invalid URL' }, { status: 400 });
    }

    const lower = targetUrl.toLowerCase();
    let platform: 'youtube' | 'youtube-music' | 'spotify' | 'soundcloud' = 'youtube';
    let playlistTitle = '';
    let playlistCover = '';
    let tracks: Array<{
      id: string;
      title: string;
      artist: string;
      url: string;
      coverUrl?: string;
      type: 'youtube' | 'youtube-music' | 'spotify' | 'soundcloud';
    }> = [];

    // 1. YouTube & YouTube Music Playlist
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      const isYtMusic = lower.includes('music.youtube.com');
      platform = isYtMusic ? 'youtube-music' : 'youtube';

      // Extract playlist ID
      const listMatch = targetUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
      if (!listMatch) {
        return NextResponse.json(
          { error: 'لم يتم العثور على معرّف قائمة التشغيل في الرابط (list=...) / No playlist ID found' },
          { status: 400 }
        );
      }
      const playlistId = listMatch[1];

      const plRes = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!plRes.ok) {
        return NextResponse.json(
          { error: 'تعذر الوصول لقائمة التشغيل، تأكد أنها عامة وغير محذوفة / Playlist not found or private' },
          { status: 404 }
        );
      }

      const plHtml = await plRes.text();
      const plMatch = plHtml.match(/var ytInitialData = ({[\s\S]*?});<\/script>/);
      if (!plMatch) {
        return NextResponse.json(
          { error: 'تعذر قراءة بيانات يوتيوب لقائمة التشغيل / Failed to parse YouTube data' },
          { status: 500 }
        );
      }

      const plData = JSON.parse(plMatch[1]);

      if (plData.alerts && Array.isArray(plData.alerts)) {
        for (const alert of plData.alerts) {
          const alertText = alert.alertRenderer?.text?.runs?.[0]?.text;
          if (alertText) {
            return NextResponse.json({ error: alertText }, { status: 400 });
          }
        }
      }

      playlistTitle =
        plData.metadata?.playlistMetadataRenderer?.title ||
        plData.header?.playlistHeaderRenderer?.title?.simpleText ||
        plData.header?.playlistHeaderRenderer?.title?.runs?.[0]?.text ||
        'قائمة تشغيل YouTube';

      const sec =
        plData.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
          ?.sectionListRenderer;
      const itemSecContents = sec?.contents?.[0]?.itemSectionRenderer?.contents || [];

      for (const item of itemSecContents) {
        // Modern YouTube layout (lockupViewModel)
        if (item.lockupViewModel) {
          const v = item.lockupViewModel;
          const videoId = v.contentId;
          const rawTitle = v.metadata?.lockupMetadataViewModel?.title?.content || '';
          if (videoId && rawTitle) {
            const { title, artist } = cleanTitleAndArtist(rawTitle, '', platform);
            const cover = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            if (!playlistCover) playlistCover = cover;
            tracks.push({
              id: `yt-${videoId}-${tracks.length}`,
              title: title || rawTitle,
              artist: artist || '',
              url: `https://www.youtube.com/watch?v=${videoId}`,
              coverUrl: cover,
              type: platform,
            });
          }
        }
        // Classic YouTube layout (playlistVideoListRenderer)
        if (item.playlistVideoListRenderer) {
          const subContents = item.playlistVideoListRenderer.contents || [];
          for (const sub of subContents) {
            const v = sub.playlistVideoRenderer;
            if (v && v.videoId) {
              const rawTitle = v.title?.runs?.[0]?.text || v.title?.simpleText || '';
              const rawAuthor = v.shortBylineText?.runs?.[0]?.text || '';
              const { title, artist } = cleanTitleAndArtist(rawTitle, rawAuthor, platform);
              const cover = `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
              if (!playlistCover) playlistCover = cover;
              tracks.push({
                id: `yt-${v.videoId}-${tracks.length}`,
                title: title || rawTitle,
                artist: artist || rawAuthor,
                url: `https://www.youtube.com/watch?v=${v.videoId}`,
                coverUrl: cover,
                type: platform,
              });
            }
          }
        }
      }
    }

    // 2. Spotify Playlist
    else if (lower.includes('spotify.com/playlist/')) {
      platform = 'spotify';
      const plMatch = targetUrl.match(/playlist\/([a-zA-Z0-9]+)/);
      if (!plMatch) {
        return NextResponse.json({ error: 'رابط قائمة سبوتيفاي غير صالح' }, { status: 400 });
      }
      const playlistId = plMatch[1];
      const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;

      const res = await fetch(embedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        return NextResponse.json({ error: 'تعذر الوصول لقائمة سبوتيفاي' }, { status: 404 });
      }

      const html = await res.text();
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (nextDataMatch) {
        const data = JSON.parse(nextDataMatch[1]);
        const entity = data.props?.pageProps?.state?.data?.entity;
        playlistTitle = entity?.name || entity?.title || 'قائمة تشغيل Spotify';
        playlistCover = entity?.coverArt?.sources?.[0]?.url || '';

        const trackList = entity?.trackList || [];
        for (const tr of trackList) {
          const trackId = tr.uri ? tr.uri.split(':')[2] : '';
          const trUrl = trackId
            ? `https://open.spotify.com/track/${trackId}`
            : targetUrl;
          tracks.push({
            id: `sp-${trackId || tracks.length}`,
            title: tr.title || 'مقطع صوتي',
            artist: tr.subtitle || '',
            url: trUrl,
            coverUrl: playlistCover,
            type: 'spotify',
          });
        }
      }
    }

    // 3. SoundCloud Sets / Playlist
    else if (lower.includes('soundcloud.com') && lower.includes('/sets/')) {
      platform = 'soundcloud';
      try {
        const oembedRes = await fetch(
          `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(targetUrl)}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          playlistTitle = oembedData.title || 'SoundCloud Playlist';
          playlistCover = oembedData.thumbnail_url || '';
        }
      } catch {}

      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const html = await res.text();
        const articleRx = /<article[^>]*itemprop="track"[^>]*>([\s\S]*?)<\/article>/gi;
        let artMatch: RegExpExecArray | null;
        while ((artMatch = articleRx.exec(html)) !== null) {
          const content = artMatch[1];
          const nameMatch = content.match(/<h2[^>]*itemprop="name"[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
          const authorMatch = content.match(/by\s+<a[^>]*>([^<]+)<\/a>/i);
          if (nameMatch) {
            const trackPath = nameMatch[1];
            const rawTitle = nameMatch[2].trim();
            const rawAuthor = authorMatch ? authorMatch[1].trim() : '';
            const { title, artist } = cleanTitleAndArtist(rawTitle, rawAuthor, 'soundcloud');
            tracks.push({
              id: `sc-${tracks.length}-${Date.now()}`,
              title: title || rawTitle,
              artist: artist || rawAuthor,
              url: `https://soundcloud.com${trackPath}`,
              coverUrl: playlistCover,
              type: 'soundcloud',
            });
          }
        }
      }
    }

    if (tracks.length === 0) {
      return NextResponse.json(
        { error: 'لم يتم العثور على مقاطع قابلة للاستخراج داخل هذه القائمة / No tracks found' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      platform,
      playlistTitle: playlistTitle || 'قائمة التشغيل المستوردة',
      playlistCover,
      totalTracks: tracks.length,
      tracks,
    });
  } catch (error: any) {
    console.error('media-playlist error:', error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ أثناء معالجة قائمة التشغيل' },
      { status: 500 }
    );
  }
}
