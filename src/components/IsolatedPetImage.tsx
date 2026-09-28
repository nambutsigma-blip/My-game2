import React, { useState, useEffect, useId } from 'react';

interface IsolatedPetImageProps {
  src: string;
  alt?: string;
  boxSize?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

// Memory cache for processed cutout data URLs
const CUTOUT_CACHE = new Map<string, string>();

/**
 * IsolatedPetImage
 * Displays ONLY the pet mascot character sprite:
 * - 100% Free of square/rectangular photo frames or borders
 * - Automatically cuts out corner backgrounds and feathers edges
 * - Smooth radial gradient transparency mask removes any rectangular photo boundaries
 * - Natural character contour drop-shadow (conforms to pet shape, not a box)
 */
export const IsolatedPetImage: React.FC<IsolatedPetImageProps> = ({
  src,
  alt = 'Pet Mascot',
  boxSize = 120,
  primaryColor = '#f59e0b',
  secondaryColor = '#ec4899',
  className = '',
}) => {
  const [cutoutSrc, setCutoutSrc] = useState<string>(() => CUTOUT_CACHE.get(src) || src);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    if (CUTOUT_CACHE.has(src)) {
      setCutoutSrc(CUTOUT_CACHE.get(src)!);
      setIsLoaded(true);
      return;
    }

    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      if (isCancelled) return;
      try {
        const canvas = document.createElement('canvas');
        const origW = img.naturalWidth || 512;
        const origH = img.naturalHeight || 512;
        const size = Math.min(origW, origH);

        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setCutoutSrc(src);
          setIsLoaded(true);
          return;
        }

        // Center-crop to square
        const sx = Math.max(0, (origW - size) / 2);
        const sy = Math.max(0, (origH - size) / 2);
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;
        const cx = size / 2;
        const cy = size / 2;
        const maxRadius = size / 2;

        // Sample 4 corner backgrounds
        const samplePixel = (px: number, py: number) => {
          const idx = (py * size + px) * 4;
          return [data[idx], data[idx + 1], data[idx + 2]];
        };

        const corners = [
          samplePixel(3, 3),
          samplePixel(size - 4, 3),
          samplePixel(3, size - 4),
          samplePixel(size - 4, size - 4),
          samplePixel(Math.floor(size / 2), 2),
          samplePixel(Math.floor(size / 2), size - 3),
        ];

        const bgR = corners.reduce((acc, c) => acc + c[0], 0) / corners.length;
        const bgG = corners.reduce((acc, c) => acc + c[1], 0) / corners.length;
        const bgB = corners.reduce((acc, c) => acc + c[2], 0) / corners.length;

        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const idx = (y * size + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const dx = x - cx;
            const dy = y - cy;
            const distRatio = Math.sqrt(dx * dx + dy * dy) / maxRadius;

            // Difference from outer background
            const colorDist = Math.sqrt(
              (r - bgR) * (r - bgR) +
              (g - bgG) * (g - bgG) +
              (b - bgB) * (b - bgB)
            );

            // Hard boundary cutoff at edges (eliminates all rectangular photo corners)
            if (distRatio > 0.88) {
              data[idx + 3] = 0;
            } else if (distRatio > 0.62) {
              // Edge feathering
              const radialFade = Math.max(0, (0.88 - distRatio) / (0.88 - 0.62));
              if (colorDist < 60 || (r + g + b < 85)) {
                const colorFade = Math.min(1, colorDist / 60);
                data[idx + 3] = Math.round(data[idx + 3] * radialFade * colorFade);
              } else {
                data[idx + 3] = Math.round(data[idx + 3] * radialFade);
              }
            } else if (distRatio > 0.40 && colorDist < 25) {
              data[idx + 3] = Math.round(data[idx + 3] * (colorDist / 25));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        CUTOUT_CACHE.set(src, dataUrl);
        setCutoutSrc(dataUrl);
        setIsLoaded(true);
      } catch (err) {
        // Fallback for CORS or canvas restriction
        setCutoutSrc(src);
        setIsLoaded(true);
      }
    };

    img.onerror = () => {
      setCutoutSrc(src);
      setIsLoaded(true);
    };

    return () => {
      isCancelled = true;
    };
  }, [src]);

  return (
    <div
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{
        width: `${boxSize}px`,
        height: `${boxSize}px`,
      }}
    >
      {/* Soft Elemental Backlight directly behind creature silhouette (NO box borders) */}
      <div
        className="absolute inset-2 rounded-full pointer-events-none -z-10 animate-pulse"
        style={{
          background: `radial-gradient(circle at center, ${primaryColor}40 0%, ${secondaryColor}25 45%, transparent 70%)`,
          filter: 'blur(12px)',
        }}
      />

      {/* The Pure Isolated Pet Character */}
      <img
        src={cutoutSrc}
        alt={alt}
        className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300"
        style={{
          // Dual mask ensures no sharp square photo edge can ever show:
          WebkitMaskImage: 'radial-gradient(ellipse 70% 74% at 50% 50%, black 44%, rgba(0,0,0,0.85) 60%, transparent 74%)',
          maskImage: 'radial-gradient(ellipse 70% 74% at 50% 50%, black 44%, rgba(0,0,0,0.85) 60%, transparent 74%)',
          // Drop-shadow conforms to the pet silhouette:
          filter: `drop-shadow(0 10px 18px rgba(0,0,0,0.65)) drop-shadow(0 0 16px ${primaryColor}60)`,
        }}
      />
    </div>
  );
};
