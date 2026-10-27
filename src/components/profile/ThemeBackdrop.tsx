'use client';

import React, { useMemo } from 'react';
import type { ThemeConfig } from '@/lib/themes';

/**
 * Signature animated backdrops for the premium collection.
 * Pure CSS/SVG (no canvas) so they stay cheap on phones; all motion stops with reduceMotion.
 */

// Deterministic pseudo-random so server and client render the same layout
function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const KEYFRAMES = `
@keyframes vx-rays-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes vx-petal-fall {
  0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.9; }
  100% { transform: translate3d(var(--drift), 110vh, 0) rotate(540deg); opacity: 0; }
}
@keyframes vx-wave-slide { to { transform: translateX(-50%); } }
@keyframes vx-warp {
  0% { transform: translate(-50%, -50%) rotate(var(--a)) translateY(0) scaleY(0.2); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(-50%, -50%) rotate(var(--a)) translateY(75vmax) scaleY(1.6); opacity: 0; }
}
@keyframes vx-grain {
  0%, 100% { transform: translate(0, 0); } 20% { transform: translate(-3%, 2%); }
  40% { transform: translate(2%, -3%); } 60% { transform: translate(-2%, -1%); } 80% { transform: translate(3%, 3%); }
}
@keyframes vx-flicker { 0%, 100% { opacity: 0.08; } 50% { opacity: 0.14; } }
@keyframes vx-ring-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
`;

export function ThemeBackdrop({ theme, reduceMotion }: { theme: ThemeConfig; reduceMotion: boolean }) {
  const type = theme.animatedBgType;
  const play = reduceMotion ? 'paused' : 'running';

  const petals = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${seeded(i) * 100}%`,
        size: 8 + seeded(i + 40) * 10,
        duration: 9 + seeded(i + 80) * 9,
        delay: -seeded(i + 120) * 18,
        drift: `${(seeded(i + 160) - 0.5) * 30}vw`,
      })),
    []
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        angle: `${seeded(i + 200) * 360}deg`,
        duration: 1.6 + seeded(i + 240) * 2.4,
        delay: -seeded(i + 280) * 4,
        length: 30 + seeded(i + 320) * 70,
      })),
    []
  );

  if (!['sunrays', 'petals', 'waves', 'starfield', 'film', 'rings'].includes(type)) return null;

  return (
    <>
      <style>{KEYFRAMES}</style>
      {/* Viewport-anchored layer: centered effects sit on the first screen, not mid-page behind the links */}
      <div className="absolute inset-x-0 top-0 h-[100svh] max-h-full overflow-hidden">

      {type === 'sunrays' && (
        <>
          <div
            className="absolute left-1/2 top-[18%] w-[220vmax] h-[220vmax]"
            style={{
              transform: 'translate(-50%, -50%)',
              background: `repeating-conic-gradient(from 0deg, ${theme.glowColor}26 0deg 6deg, transparent 6deg 18deg)`,
              maskImage: 'radial-gradient(circle, black 0%, transparent 55%)',
              WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 55%)',
              animation: 'vx-rays-spin 90s linear infinite',
              animationPlayState: play,
            }}
          />
          <div
            className="absolute left-1/2 top-[18%] w-[46vmin] h-[46vmin] rounded-full"
            style={{
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${theme.glowColor}88 0%, ${theme.accentColor}33 40%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />
        </>
      )}

      {type === 'waves' && (
        <div className="absolute inset-x-0 bottom-0 h-[55%]">
          {[0, 1, 2].map((layer) => (
            <svg
              key={layer}
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              className="absolute bottom-0 left-0 h-full"
              style={{
                width: '200%',
                opacity: 0.18 + layer * 0.12,
                animation: `vx-wave-slide ${26 - layer * 7}s linear infinite`,
                animationPlayState: play,
                filter: `drop-shadow(0 0 18px ${theme.glowColor})`,
              }}
            >
              <path
                fill={layer === 2 ? theme.glowColor : theme.gradientColors[2]}
                d={`M0,${180 + layer * 30} C240,${120 + layer * 30} 480,${240 + layer * 20} 720,${180 + layer * 30} C960,${120 + layer * 30} 1200,${240 + layer * 20} 1440,${180 + layer * 30} L1440,320 L0,320 Z`}
              />
            </svg>
          ))}
        </div>
      )}

      {type === 'starfield' && (
        <>
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at center, ${theme.gradientColors[2]}66 0%, transparent 60%)` }}
          />
          {stars.map((s, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-[32%] w-[2px] rounded-full"
              style={
                {
                  height: s.length,
                  background: `linear-gradient(to bottom, transparent, ${theme.glowColor})`,
                  boxShadow: `0 0 6px ${theme.glowColor}`,
                  '--a': s.angle,
                  opacity: 0,
                  animation: `vx-warp ${s.duration}s cubic-bezier(0.55, 0, 1, 0.45) ${s.delay}s infinite`,
                  animationPlayState: play,
                } as React.CSSProperties
              }
            />
          ))}
        </>
      )}

      {type === 'rings' &&
        [0, 1, 2, 3].map((r) => (
          <div
            key={r}
            className="absolute left-1/2 top-[38%] rounded-full border"
            style={{
              width: `${40 + r * 22}vmin`,
              height: `${40 + r * 22}vmin`,
              transform: 'translate(-50%, -50%)',
              borderColor: `${theme.accentColor}${r % 2 ? '22' : '33'}`,
              borderStyle: r % 2 ? 'dashed' : 'solid',
              borderWidth: r === 0 ? 2 : 1,
              animation: `vx-ring-spin ${60 + r * 30}s linear infinite ${r % 2 ? 'reverse' : 'normal'}`,
              animationPlayState: play,
            }}
          />
        ))}
      </div>

      {type === 'petals' &&
        petals.map((p, i) => (
          <span
            key={i}
            className="absolute top-0"
            style={
              {
                left: p.left,
                width: p.size,
                height: p.size * 0.8,
                background: `radial-gradient(circle at 30% 30%, #FFFFFF 0%, ${theme.glowColor} 45%, ${theme.accentColor} 100%)`,
                borderRadius: '80% 0 80% 0',
                opacity: 0,
                '--drift': p.drift,
                animation: `vx-petal-fall ${p.duration}s linear ${p.delay}s infinite`,
                animationPlayState: play,
              } as React.CSSProperties
            }
          />
        ))}

      {type === 'film' && (
        <>
          <div
            className="absolute -inset-[10%]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.9'/></svg>\")",
              mixBlendMode: 'overlay',
              animation: 'vx-grain 0.8s steps(4) infinite, vx-flicker 3s ease-in-out infinite',
              animationPlayState: play,
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)' }}
          />
          <div
            className="absolute inset-x-0 top-0 h-px opacity-30"
            style={{ background: `linear-gradient(90deg, transparent, ${theme.accentColor}, transparent)` }}
          />
        </>
      )}

    </>
  );
}
