/**
 * Smart Accent Color Extractor:
 * Samples an image on an HTML5 Canvas (client-side, with user consent)
 * and extracts a dominant surface shade, a vibrant primary accent, and a secondary accent.
 */
export async function extractPaletteFromImage(imageSrc: string): Promise<{
  primaryAccent: string;
  secondaryAccent: string;
  surfaceBase: string;
}> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({
        primaryAccent: '#D4AF37',
        secondaryAccent: '#7928CA',
        surfaceBase: '#050508',
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        if (!ctx) throw new Error('Canvas unavailable');

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let bestSat = -1;
        let primary = [212, 175, 55];
        let secondary = [121, 40, 202];

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          const lum = (max + min) / 2;

          if (sat > bestSat && lum > 45 && lum < 225) {
            secondary = [...primary];
            primary = [r, g, b];
            bestSat = sat;
          }
        }

        const toHex = (rgb: number[]) =>
          '#' +
          rgb
            .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
            .join('');

        const surface = [
          Math.floor(primary[0] * 0.08),
          Math.floor(primary[1] * 0.08),
          Math.floor(primary[2] * 0.1),
        ];

        resolve({
          primaryAccent: toHex(primary),
          secondaryAccent: toHex(secondary),
          surfaceBase: toHex(surface),
        });
      } catch {
        resolve({
          primaryAccent: '#D4AF37',
          secondaryAccent: '#7928CA',
          surfaceBase: '#050508',
        });
      }
    };
    img.onerror = () => {
      resolve({
        primaryAccent: '#D4AF37',
        secondaryAccent: '#7928CA',
        surfaceBase: '#050508',
      });
    };
    img.src = imageSrc;
  });
}

