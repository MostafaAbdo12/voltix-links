'use client';

import React, { useMemo } from 'react';
import type { ThemeConfig } from '@/lib/themes';

/**
 * Backdrops for the redesigned paid collection (one signature scene per theme).
 * Pure CSS/SVG like ThemeBackdrop: no canvas, a few dozen nodes at most, and every
 * animation pauses with reduceMotion.
 */

export const COLLECTION_BACKDROPS = [
  'bokeh',
  'synthwave',
  'matrix',
  'marble',
  'blobs',
  'constellation',
  'prism',
  'silk',
  'caustics',
  'nebula',
  'aurora-curtain',
  'spotlight',
  'dunes',
  'blackhole',
  'smoke',
] as const;

export type CollectionBackdropType = (typeof COLLECTION_BACKDROPS)[number];

function seeded(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const KEYFRAMES = `
@keyframes cb-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(var(--dx), var(--dy)) scale(1.15); } }
@keyframes cb-grid { to { background-position: 0 64px; } }
@keyframes cb-rain { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
@keyframes cb-marble { 0%,100% { transform: scale(1.1) rotate(0deg); } 50% { transform: scale(1.25) rotate(6deg); } }
@keyframes cb-blob { 0%,100% { border-radius: 42% 58% 63% 37% / 41% 44% 56% 59%; transform: translate(0,0) rotate(0deg); }
  50% { border-radius: 63% 37% 38% 62% / 55% 61% 39% 45%; transform: translate(var(--dx), var(--dy)) rotate(120deg); } }
@keyframes cb-twinkle { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }
@keyframes cb-prism { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
@keyframes cb-sparkle { 0%,100% { transform: scale(0) rotate(0deg); opacity: 0; } 50% { transform: scale(1) rotate(90deg); opacity: 1; } }
@keyframes cb-silk { 0%,100% { transform: translateX(0) skewY(-4deg); } 50% { transform: translateX(-6%) skewY(4deg); } }
@keyframes cb-caustics { 0%,100% { transform: scale(1.2) translate(0,0); } 50% { transform: scale(1.35) translate(-3%,2%); } }
@keyframes cb-spin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
@keyframes cb-curtain { 0%,100% { transform: scaleY(1) translateX(0); opacity: 0.55; } 50% { transform: scaleY(1.25) translateX(4%); opacity: 0.95; } }
@keyframes cb-beam { 0%,100% { transform: rotate(-18deg); } 50% { transform: rotate(18deg); } }
@keyframes cb-dune { to { transform: translateX(-50%); } }
@keyframes cb-smoke { 0% { transform: translateY(20%) scale(0.8); opacity: 0; } 30% { opacity: 0.9; } 100% { transform: translateY(-120%) scale(1.6) translateX(var(--dx)); opacity: 0; } }
`;

function useSeeded<T>(count: number, offset: number, make: (r: (k: number) => number, i: number) => T) {
  // Stable per mount; positions never change between renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => Array.from({ length: count }, (_, i) => make((k) => seeded(i * 31 + offset + k), i)), []);
}

export function CollectionBackdrop({ theme, reduceMotion }: { theme: ThemeConfig; reduceMotion: boolean }) {
  const type = theme.animatedBgType as string;
  const play = reduceMotion ? 'paused' : 'running';
  const { accentColor: accent, glowColor: glow, gradientColors: g } = theme;

  const bokeh = useSeeded(14, 1, (r) => ({
    left: `${r(1) * 100}%`, top: `${r(2) * 100}%`, size: 60 + r(3) * 160,
    dur: 14 + r(4) * 14, dx: `${(r(5) - 0.5) * 120}px`, dy: `${(r(6) - 0.5) * 120}px`, o: 0.18 + r(7) * 0.3,
  }));
  const columns = useSeeded(22, 2, (r) => ({
    left: `${r(1) * 100}%`, dur: 6 + r(2) * 8, delay: -r(3) * 12, size: 12 + Math.round(r(4) * 6),
    text: Array.from({ length: 22 }, (_, j) => 'アイウエオカキクケコサシスセソ01ﾊﾋﾌﾍﾎ'[Math.floor(seeded(j + r(5) * 99) * 20)]).join('\n'),
  }));
  const stars = useSeeded(40, 3, (r) => ({ x: r(1) * 100, y: r(2) * 100, s: 1 + r(3) * 2.2, d: 2 + r(4) * 4, delay: -r(5) * 6 }));
  const sparkles = useSeeded(12, 4, (r) => ({ left: `${10 + r(1) * 80}%`, top: `${5 + r(2) * 70}%`, d: 2.5 + r(3) * 3, delay: -r(4) * 5, s: 8 + r(5) * 14 }));
  const puffs = useSeeded(9, 5, (r) => ({ left: `${r(1) * 100}%`, size: 160 + r(2) * 220, dur: 14 + r(3) * 12, delay: -r(4) * 26, dx: `${(r(5) - 0.5) * 140}px` }));

  if (!(COLLECTION_BACKDROPS as readonly string[]).includes(type)) return null;

  const anim = (value: string): React.CSSProperties => ({ animation: value, animationPlayState: play });

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="absolute inset-x-0 top-0 h-[100svh] max-h-full overflow-hidden">
        {type === 'bokeh' &&
          bokeh.map((b, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: b.left, top: b.top, width: b.size, height: b.size, opacity: b.o,
                background: `radial-gradient(circle at 35% 35%, ${i % 3 ? glow : accent}cc, transparent 70%)`,
                filter: 'blur(6px)',
                ['--dx' as string]: b.dx, ['--dy' as string]: b.dy,
                ...anim(`cb-drift ${b.dur}s ease-in-out infinite`),
              }}
            />
          ))}

        {type === 'synthwave' && (
          <>
            <div
              className="absolute left-1/2 top-[22%] -translate-x-1/2 w-[46vmin] h-[46vmin] rounded-full"
              style={{
                background: `linear-gradient(180deg, ${glow} 0%, ${accent} 70%)`,
                maskImage: 'repeating-linear-gradient(180deg, black 0 14px, transparent 14px 20px)',
                WebkitMaskImage: 'linear-gradient(180deg, black 55%, transparent 55%), repeating-linear-gradient(180deg, black 0 10px, transparent 10px 16px)',
                boxShadow: `0 0 120px ${accent}88`,
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-[48%] overflow-hidden" style={{ perspective: '320px' }}>
              <div
                className="absolute -inset-x-1/2 -bottom-10 h-[160%]"
                style={{
                  transform: 'rotateX(68deg)', transformOrigin: 'bottom',
                  backgroundImage: `linear-gradient(${accent}aa 2px, transparent 2px), linear-gradient(90deg, ${accent}aa 2px, transparent 2px)`,
                  backgroundSize: '64px 64px',
                  maskImage: 'linear-gradient(to top, black 30%, transparent 95%)',
                  WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 95%)',
                  ...anim('cb-grid 1.2s linear infinite'),
                }}
              />
            </div>
          </>
        )}

        {type === 'matrix' &&
          columns.map((c, i) => (
            <pre
              key={i}
              className="absolute top-0 m-0 font-mono leading-tight whitespace-pre"
              style={{
                left: c.left, fontSize: c.size, color: glow, opacity: 0.35,
                textShadow: `0 0 8px ${glow}`,
                maskImage: 'linear-gradient(to bottom, transparent, black 70%, white)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 70%)',
                ...anim(`cb-rain ${c.dur}s linear ${c.delay}s infinite`),
              }}
            >
              {c.text}
            </pre>
          ))}

        {type === 'marble' && (
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" style={anim('cb-marble 40s ease-in-out infinite')}>
            <filter id="cb-marble-f">
              <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="4" seed="7" />
              <feColorMatrix values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.2 1.3`} />
            </filter>
            <rect width="100%" height="100%" fill={g[1]} />
            <rect width="100%" height="100%" filter="url(#cb-marble-f)" opacity="0.22" />
            <rect width="100%" height="100%" fill={`url(#cb-marble-sheen)`} />
            <defs>
              <linearGradient id="cb-marble-sheen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={accent} stopOpacity="0.18" />
                <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="1" stopColor={accent} stopOpacity="0.12" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {type === 'blobs' &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${[8, 55, 25][i]}%`, top: `${[6, 18, 48][i]}%`, width: '48vmin', height: '48vmin',
                background: `linear-gradient(135deg, ${[accent, glow, g[2]][i]}, transparent)`,
                filter: 'blur(28px)', opacity: 0.6, mixBlendMode: 'screen',
                ['--dx' as string]: `${[60, -50, 40][i]}px`, ['--dy' as string]: `${[40, 60, -50][i]}px`,
                ...anim(`cb-blob ${[18, 22, 26][i]}s ease-in-out infinite`),
              }}
            />
          ))}

        {type === 'constellation' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {stars.slice(0, 14).map((s, i) => {
              const n = stars[(i * 7 + 3) % 14];
              return <line key={`l${i}`} x1={s.x} y1={s.y} x2={n.x} y2={n.y} stroke={accent} strokeOpacity="0.14" strokeWidth="0.12" />;
            })}
            {stars.map((s, i) => (
              <circle
                key={i} cx={s.x} cy={s.y} r={s.s * 0.12} fill={i % 5 ? '#ffffff' : accent}
                style={{ filter: `drop-shadow(0 0 0.6px ${glow})`, ...anim(`cb-twinkle ${s.d}s ease-in-out ${s.delay}s infinite`) }}
              />
            ))}
          </svg>
        )}

        {type === 'prism' && (
          <>
            <div
              className="absolute left-1/2 top-[30%] w-[150vmax] h-[150vmax]"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${accent}22 20deg, transparent 40deg, #ff7ad922 80deg, transparent 100deg, #7ad9ff22 150deg, transparent 170deg, ${glow}22 230deg, transparent 260deg, #fff6a822 310deg, transparent 340deg)`,
                ...anim('cb-prism 70s linear infinite'),
              }}
            />
            {sparkles.map((s, i) => (
              <span
                key={i}
                className="absolute"
                style={{
                  left: s.left, top: s.top, width: s.s, height: s.s,
                  background: '#ffffff', clipPath: 'polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%)',
                  filter: `drop-shadow(0 0 6px ${glow})`,
                  ...anim(`cb-sparkle ${s.d}s ease-in-out ${s.delay}s infinite`),
                }}
              />
            ))}
          </>
        )}

        {type === 'silk' && (
          <svg className="absolute -inset-x-[10%] top-[14%] w-[120%] h-[86%]" viewBox="0 0 1200 600" preserveAspectRatio="none" style={anim('cb-silk 16s ease-in-out infinite')}>
            <defs>
              <linearGradient id="cb-silk-g" x1="0" x2="1">
                <stop offset="0" stopColor={accent} stopOpacity="0" />
                <stop offset="0.5" stopColor={accent} stopOpacity="0.9" />
                <stop offset="1" stopColor={glow} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M0,${260 + i * 22} C300,${120 + i * 30} 600,${420 - i * 18} 900,${230 + i * 20} S1200,${180 + i * 25} 1200,${200 + i * 25}`}
                fill="none" stroke="url(#cb-silk-g)" strokeWidth={36 - i * 6} strokeOpacity={0.75 - i * 0.1}
              />
            ))}
          </svg>
        )}

        {type === 'caustics' && (
          <svg className="absolute inset-0 w-full h-full" style={anim('cb-caustics 18s ease-in-out infinite')}>
            <filter id="cb-caustics-f">
              <feTurbulence type="turbulence" baseFrequency="0.018" numOctaves="2" seed="3" />
              <feColorMatrix values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 9 -4.4`} />
            </filter>
            <rect width="100%" height="100%" filter="url(#cb-caustics-f)" opacity="0.16" />
            <rect width="100%" height="100%" fill={glow} opacity="0.06" />
          </svg>
        )}

        {type === 'nebula' && (
          <>
            <div
              className="absolute left-1/2 top-[34%] w-[150vmin] h-[150vmin] rounded-full"
              style={{
                background: `conic-gradient(from 0deg, ${accent}99, transparent 25%, ${glow}88 45%, transparent 65%, #ffffff33 80%, ${accent}99)`,
                filter: 'blur(40px)', maskImage: 'radial-gradient(circle, black 0%, transparent 65%)',
                WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 65%)',
                ...anim('cb-spin 80s linear infinite'),
              }}
            />
            {stars.map((s, i) => (
              <span
                key={i} className="absolute rounded-full bg-white"
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, ...anim(`cb-twinkle ${s.d}s ease-in-out ${s.delay}s infinite`) }}
              />
            ))}
          </>
        )}

        {type === 'aurora-curtain' &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute top-0 h-[85%]"
              style={{
                left: `${-5 + i * 18}%`, width: '22%', transformOrigin: 'top',
                background: `linear-gradient(180deg, transparent, ${i % 2 ? glow : accent}aa 40%, transparent)`,
                filter: 'blur(18px)',
                ...anim(`cb-curtain ${7 + i * 1.7}s ease-in-out ${-i * 1.3}s infinite`),
              }}
            />
          ))}

        {type === 'spotlight' &&
          [0, 1].map((i) => (
            <div
              key={i}
              className="absolute -top-[10%] h-[120%] w-[40vmax]"
              style={{
                left: i ? '62%' : '-2%', transformOrigin: 'top center',
                background: `linear-gradient(180deg, ${glow}55, transparent 75%)`,
                clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)', filter: 'blur(6px)',
                ...anim(`cb-beam ${9 + i * 3}s ease-in-out ${-i * 4}s infinite`),
              }}
            />
          ))}

        {type === 'dunes' && (
          <>
            <div className="absolute right-[14%] top-[10%] w-[18vmin] h-[18vmin] rounded-full" style={{ background: '#fff5e1', boxShadow: `0 0 80px ${glow}` }} />
            {stars.slice(0, 26).map((s, i) => (
              <span key={i} className="absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y * 0.45}%`, width: s.s * 0.8, height: s.s * 0.8, ...anim(`cb-twinkle ${s.d}s ease-in-out ${s.delay}s infinite`) }} />
            ))}
            {[0, 1, 2].map((i) => (
              <svg
                key={i} viewBox="0 0 1440 320" preserveAspectRatio="none"
                className="absolute bottom-0 left-0 h-[42%]"
                style={{ width: '200%', opacity: 0.5 + i * 0.2, ...anim(`cb-dune ${120 - i * 30}s linear infinite`) }}
              >
                <path fill={[g[2], accent, g[1]][i]} fillOpacity={0.35 + i * 0.15}
                  d={`M0,${200 - i * 10} Q180,${120 + i * 20} 360,${190 - i * 6} T720,${170 + i * 8} T1080,${200 - i * 10} T1440,${180} L1440,320 L0,320 Z`} />
              </svg>
            ))}
          </>
        )}

        {type === 'blackhole' && (
          <>
            <div
              className="absolute left-1/2 top-[34%] w-[150vmin] h-[150vmin] rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent, ${accent}, ${glow}, transparent 40%, transparent 60%, ${accent}aa, transparent)`,
                maskImage: 'radial-gradient(circle, transparent 26%, black 30%, black 42%, transparent 62%)',
                WebkitMaskImage: 'radial-gradient(circle, transparent 26%, black 30%, black 42%, transparent 62%)',
                filter: 'blur(4px)', opacity: 0.95,
                ...anim('cb-spin 14s linear infinite'),
              }}
            />
            <div className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 w-[40vmin] h-[40vmin] rounded-full bg-black" style={{ boxShadow: `0 0 90px 20px ${glow}88` }} />
          </>
        )}

        {type === 'smoke' &&
          puffs.map((p, i) => (
            <span
              key={i}
              className="absolute bottom-0 rounded-full"
              style={{
                left: p.left, width: p.size, height: p.size,
                background: `radial-gradient(circle, ${i % 2 ? glow : accent}70, transparent 70%)`,
                filter: 'blur(24px)', opacity: 0, ['--dx' as string]: p.dx,
                ...anim(`cb-smoke ${p.dur}s ease-out ${p.delay}s infinite`),
              }}
            />
          ))}
      </div>
    </>
  );
}
