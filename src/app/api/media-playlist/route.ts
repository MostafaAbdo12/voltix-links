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

    // 1. YouTube & YouTube Music Playlist or Mix
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      const isYtMusic = lower.includes('music.youtube.com');
      platform = isYtMusic ? 'youtube-music' : 'youtube';

      // Extract playlist ID and video ID
      const listMatch = targetUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
      const playlistId = listMatch ? listMatch[1] : '';

      let videoId = '';
      const watchMatch = targetUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      const shortMatch = targetUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      const embedMatch = targetUrl.match(/youtube\.com\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (watchMatch) videoId = watchMatch[1];
      else if (shortMatch) videoId = shortMatch[1];
      else if (embedMatch) videoId = embedMatch[1];

      if (!playlistId && !videoId) {
        return NextResponse.json(
          { error: 'لم يتم العثور على معرّف قائمة تشغيل أو فيديو في الرابط (list=...) / No playlist or video ID found' },
          { status: 400 }
        );
      }

      const isMix = playlistId ? playlistId.startsWith('RD') : Boolean(videoId);

      // Helper to parse watch page mix / queue
      const tryFetchWatchMix = async (vId: string, pId?: string) => {
        const candidateUrls = [
          pId ? `https://www.youtube.com/watch?v=${vId}&list=${pId}` : null,
          `https://www.youtube.com/watch?v=${vId}&list=RD${vId}`,
        ].filter(Boolean) as string[];

        for (const candidate of candidateUrls) {
          try {
            const res = await fetch(candidate, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
              },
              signal: AbortSignal.timeout(8000),
            });
            if (!res.ok) continue;
            const html = await res.text();
            const match = html.match(/var ytInitialData = ({[\s\S]*?});<\/script>/);
            if (!match) continue;
            const data = JSON.parse(match[1]);
            const plData = data.contents?.twoColumnWatchNextResults?.playlist?.playlist;
            if (plData && Array.isArray(plData.contents) && plData.contents.length > 0) {
              const mixTitle = plData.title || 'ميكس YouTube Mix';
              let mixCover = '';
              const mixTracks: typeof tracks = [];

              for (const it of plData.contents) {
                const r = it?.playlistPanelVideoRenderer;
                if (r && r.videoId) {
                  const rawTitle = r.title?.simpleText || r.title?.runs?.[0]?.text || '';
                  const rawAuthor =
                    r.shortBylineText?.runs?.[0]?.text ||
                    r.longBylineText?.runs?.[0]?.text ||
                    '';
                  const { title, artist } = cleanTitleAndArtist(rawTitle, rawAuthor, platform);
                  const cover = `https://i.ytimg.com/vi/${r.videoId}/hqdefault.jpg`;
                  if (!mixCover) mixCover = cover;

                  mixTracks.push({
                    id: `yt-${r.videoId}-${mixTracks.length}`,
                    title: title || rawTitle,
                    artist: artist || rawAuthor,
                    url: `https://www.youtube.com/watch?v=${r.videoId}`,
                    coverUrl: cover,
                    type: platform,
                  });
                }
              }

              if (mixTracks.length > 0) {
                return { playlistTitle: mixTitle, playlistCover: mixCover, tracks: mixTracks };
              }
            }
          } catch (e) {
            console.warn('Watch mix candidate warning:', e);
          }
        }
        return null;
      };

      // Helper to parse standard playlist page
      const tryFetchStandardPlaylist = async (pId: string) => {
        try {
          const plRes = await fetch(`https://www.youtube.com/playlist?list=${pId}`, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
            },
            signal: AbortSignal.timeout(8000),
          });
          if (!plRes.ok) return null;
          const plHtml = await plRes.text();
          const plMatch = plHtml.match(/var ytInitialData = ({[\s\S]*?});<\/script>/);
          if (!plMatch) return null;
          const plData = JSON.parse(plMatch[1]);

          // Check if YouTube returned alerts (e.g. invalid type or private)
          if (plData.alerts && Array.isArray(plData.alerts)) {
            for (const alert of plData.alerts) {
              const alertText = alert.alertRenderer?.text?.runs?.[0]?.text;
              if (alertText) {
                console.warn('Standard playlist alert:', alertText);
                return { alertError: alertText };
              }
            }
          }

          const pTitle =
            plData.metadata?.playlistMetadataRenderer?.title ||
            plData.header?.playlistHeaderRenderer?.title?.simpleText ||
            plData.header?.playlistHeaderRenderer?.title?.runs?.[0]?.text ||
            'قائمة تشغيل YouTube';
          let pCover = '';
          const pTracks: typeof tracks = [];

          const sec =
            plData.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
              ?.sectionListRenderer;
          const itemSecContents = sec?.contents?.[0]?.itemSectionRenderer?.contents || [];

          for (const item of itemSecContents) {
            if (item.lockupViewModel) {
              const v = item.lockupViewModel;
              const vId = v.contentId;
              const rawTitle = v.metadata?.lockupMetadataViewModel?.title?.content || '';
              if (vId && rawTitle) {
                const { title, artist } = cleanTitleAndArtist(rawTitle, '', platform);
                const cover = `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;
                if (!pCover) pCover = cover;
                pTracks.push({
                  id: `yt-${vId}-${pTracks.length}`,
                  title: title || rawTitle,
                  artist: artist || '',
                  url: `https://www.youtube.com/watch?v=${vId}`,
                  coverUrl: cover,
                  type: platform,
                });
              }
            }
            if (item.playlistVideoListRenderer) {
              const subContents = item.playlistVideoListRenderer.contents || [];
              for (const sub of subContents) {
                const v = sub.playlistVideoRenderer;
                if (v && v.videoId) {
                  const rawTitle = v.title?.runs?.[0]?.text || v.title?.simpleText || '';
                  const rawAuthor = v.shortBylineText?.runs?.[0]?.text || '';
                  const { title, artist } = cleanTitleAndArtist(rawTitle, rawAuthor, platform);
                  const cover = `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
                  if (!pCover) pCover = cover;
                  pTracks.push({
                    id: `yt-${v.videoId}-${pTracks.length}`,
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

          if (pTracks.length > 0) {
            return { playlistTitle: pTitle, playlistCover: pCover, tracks: pTracks };
          }
        } catch (e) {
          console.warn('Standard playlist error:', e);
        }
        return null;
      };

      // Execution Strategy:
      // A) If Mix (RD...), immediately fetch via watch mix endpoint!
      if (isMix && videoId) {
        const mixResult = await tryFetchWatchMix(videoId, playlistId);
        if (mixResult && mixResult.tracks.length > 0) {
          playlistTitle = mixResult.playlistTitle;
          playlistCover = mixResult.playlistCover;
          tracks = mixResult.tracks;
        }
      }

      // B) If not a mix (or mix returned no tracks and has a playlistId), try standard playlist endpoint
      if (tracks.length === 0 && playlistId && !playlistId.startsWith('RD')) {
        const stdResult = await tryFetchStandardPlaylist(playlistId);
        if (stdResult && 'tracks' in stdResult && Array.isArray(stdResult.tracks) && stdResult.tracks.length > 0) {
          playlistTitle = stdResult.playlistTitle || 'قائمة تشغيل YouTube';
          playlistCover = stdResult.playlistCover || '';
          tracks = stdResult.tracks;
        }
      }

      // C) Fallback: If still no tracks, but videoId exists, try watch mix
      if (tracks.length === 0 && videoId) {
        const mixFallback = await tryFetchWatchMix(videoId, playlistId || `RD${videoId}`);
        if (mixFallback && mixFallback.tracks.length > 0) {
          playlistTitle = mixFallback.playlistTitle;
          playlistCover = mixFallback.playlistCover;
          tracks = mixFallback.tracks;
        }
      }

      // If still nothing, give friendly explanation
      if (tracks.length === 0) {
        return NextResponse.json(
          { error: 'تعذر استخراج المقاطع من هذا الرابط، تأكد من صحة الرابط أو جرب رابط قائمة آخر' },
          { status: 400 }
        );
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
