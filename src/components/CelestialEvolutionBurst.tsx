import React, { useId } from 'react';
import { Sparkles, Crown } from 'lucide-react';

interface CelestialEvolutionBurstProps {
  isActive: boolean;
  petName?: string;
  element?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  className?: string;
}

// Pre-computed particles with organic trajectories for radial burst
const BURST_PARTICLES = [
  { id: 1, angle: 0, distance: 95, color: '#facc15', size: 10, delay: '0.05s', scale: 0.9 },
  { id: 2, angle: 30, distance: 110, color: '#38bdf8', size: 8, delay: '0.1s', scale: 1.1 },
  { id: 3, angle: 60, distance: 85, color: '#c084fc', size: 11, delay: '0.15s', scale: 0.8 },
  { id: 4, angle: 90, distance: 125, color: '#ffffff', size: 7, delay: '0.08s', scale: 1.2 },
  { id: 5, angle: 120, distance: 100, color: '#f59e0b', size: 9, delay: '0.12s', scale: 1.0 },
  { id: 6, angle: 150, distance: 90, color: '#38bdf8', size: 8, delay: '0.18s', scale: 0.85 },
  { id: 7, angle: 180, distance: 115, color: '#facc15', size: 12, delay: '0.06s', scale: 1.15 },
  { id: 8, angle: 210, distance: 95, color: '#ec4899', size: 8, delay: '0.14s', scale: 0.9 },
  { id: 9, angle: 240, distance: 120, color: '#c084fc', size: 10, delay: '0.1s', scale: 1.05 },
  { id: 10, angle: 270, distance: 130, color: '#ffffff', size: 9, delay: '0.07s', scale: 1.3 },
  { id: 11, angle: 300, distance: 105, color: '#34d399', size: 8, delay: '0.16s', scale: 0.8 },
  { id: 12, angle: 330, distance: 115, color: '#facc15', size: 11, delay: '0.09s', scale: 1.1 },
];

// Pre-computed floating particles drifting upwards
const FLOATING_PARTICLES = [
  { id: 'f1', left: '18%', bottom: '20%', driftX: '-22px', delay: '0s', duration: '2.5s', color: '#facc15', size: 8 },
  { id: 'f2', left: '32%', bottom: '15%', driftX: '18px', delay: '0.4s', duration: '2.8s', color: '#38bdf8', size: 6 },
  { id: 'f3', left: '50%', bottom: '10%', driftX: '-12px', delay: '0.2s', duration: '2.2s', color: '#ffffff', size: 9 },
  { id: 'f4', left: '68%', bottom: '18%', driftX: '24px', delay: '0.6s', duration: '2.7s', color: '#c084fc', size: 7 },
  { id: 'f5', left: '82%', bottom: '22%', driftX: '-16px', delay: '0.3s', duration: '3.0s', color: '#f59e0b', size: 8 },
  { id: 'f6', left: '26%', bottom: '30%', driftX: '15px', delay: '0.8s', duration: '2.4s', color: '#34d399', size: 6 },
  { id: 'f7', left: '74%', bottom: '28%', driftX: '-20px', delay: '0.5s', duration: '2.6s', color: '#facc15', size: 9 },
  { id: 'f8', left: '44%', bottom: '25%', driftX: '12px', delay: '0.9s', duration: '2.9s', color: '#38bdf8', size: 7 },
];

// Twinkling celestial star symbols
const TWINKLE_STARS = [
  { id: 's1', top: '15%', left: '22%', char: '✦', color: '#facc15', delay: '0.1s', size: 'text-xl' },
  { id: 's2', top: '20%', right: '20%', char: '✧', color: '#38bdf8', delay: '0.4s', size: 'text-lg' },
  { id: 's3', bottom: '25%', left: '15%', char: '✨', color: '#fde047', delay: '0.2s', size: 'text-base' },
  { id: 's4', bottom: '22%', right: '16%', char: '✦', color: '#c084fc', delay: '0.6s', size: 'text-xl' },
  { id: 's5', top: '10%', left: '50%', char: '🌟', color: '#ffffff', delay: '0.3s', size: 'text-lg' },
];

export const CelestialEvolutionBurst: React.FC<CelestialEvolutionBurstProps> = ({
  isActive,
  petName,
  size = 'md',
  className = '',
}) => {
  const rayId = useId();

  if (!isActive) return null;

  const isFullscreen = size === 'fullscreen';

  return (
    <div
      aria-label="Celestial Evolution Burst"
      className={`pointer-events-none select-none z-30 ${
        isFullscreen
          ? 'fixed inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]'
          : 'absolute inset-0 flex items-center justify-center overflow-visible'
      } ${className}`}
    >
      {/* 1. Celestial Nova Flash: Sudden radiant flash at moment of evolution */}
      <div className="absolute inset-0 bg-radial from-amber-200/40 via-purple-300/20 to-transparent animate-celestial-nova" />

      {/* 2. Rotating Celestial Starburst Rays */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center animate-celestial-rays">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full opacity-85 filter drop-shadow-[0_0_20px_rgba(250,204,21,0.85)]"
        >
          <defs>
            <radialGradient id={`celestial-grad-${rayId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#facc15" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="85%" stopColor="#c084fc" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* 16-pointed divine celestial corona */}
          {[...Array(16)].map((_, i) => {
            const angle = (i * 360) / 16;
            const isMajor = i % 2 === 0;
            const length = isMajor ? 96 : 74;
            const width = isMajor ? 7 : 4;
            return (
              <polygon
                key={i}
                points={`100,100 ${100 - width},${100 - length * 0.4} 100,${100 - length} ${100 + width},${100 - length * 0.4}`}
                fill={`url(#celestial-grad-${rayId})`}
                transform={`rotate(${angle} 100 100)`}
              />
            );
          })}
        </svg>
      </div>

      {/* 3. Expanding Concentric Celestial Shockwave Rings */}
      <div className="absolute w-36 h-36 rounded-full border-4 border-amber-300 shadow-[0_0_35px_rgba(250,204,21,0.9)] animate-celestial-ring-1" />
      <div className="absolute w-44 h-44 rounded-full border-2 border-cyan-300 shadow-[0_0_40px_rgba(56,189,248,0.85)] animate-celestial-ring-2" />
      <div className="absolute w-52 h-52 rounded-full border border-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.7)] animate-celestial-ring-2" style={{ animationDelay: '0.45s' }} />

      {/* 4. Core Celestial Burst Orb */}
      <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-cyan-300 blur-sm animate-celestial-burst" />
      <div className="absolute w-20 h-20 rounded-full bg-white blur-md animate-celestial-burst" />

      {/* 5. Radial Bursting Glowing Particles (360 Degree Outward Dispersion) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {BURST_PARTICLES.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          const burstX = Math.round(Math.cos(rad) * p.distance);
          const burstY = Math.round(Math.sin(rad) * p.distance);
          return (
            <div
              key={p.id}
              className="absolute rounded-full animate-celestial-particle-burst"
              style={
                {
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  boxShadow: `0 0 14px ${p.color}, 0 0 24px ${p.color}`,
                  animationDelay: p.delay,
                  '--burst-x': `${burstX}px`,
                  '--burst-y': `${burstY}px`,
                  '--burst-scale': p.scale,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>

      {/* 6. Floating Ambient Glowing Particles (Rising & Swaying) */}
      {FLOATING_PARTICLES.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full animate-celestial-particle-float"
          style={
            {
              left: f.left,
              bottom: f.bottom,
              width: `${f.size}px`,
              height: `${f.size}px`,
              backgroundColor: f.color,
              boxShadow: `0 0 10px ${f.color}, 0 0 20px ${f.color}`,
              animationDelay: f.delay,
              animationDuration: f.duration,
              '--drift-x': f.driftX,
            } as React.CSSProperties
          }
        />
      ))}

      {/* 7. Twinkling Celestial Star Glyphs */}
      {TWINKLE_STARS.map((s) => (
        <div
          key={s.id}
          className={`absolute ${s.size} font-black animate-celestial-stardust`}
          style={{
            top: s.top,
            bottom: s.bottom,
            left: s.left,
            right: s.right,
            color: s.color,
            animationDelay: s.delay,
          }}
        >
          {s.char}
        </div>
      ))}

      {/* 8. Triumphant Floating Celestial Evolution Banner (if petName provided) */}
      {petName && (
        <div className="absolute -top-14 sm:-top-16 z-40 animate-fade-in flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-widest shadow-2xl shadow-yellow-500/50 border border-yellow-200 animate-bounce">
            <Crown className="w-3.5 h-3.5 text-slate-950 animate-spin" />
            <span>CELESTIAL BURST • THẦN THÚ TIẾN HOÁ!</span>
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          </div>
          <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-white drop-shadow-[0_2px_8px_rgba(250,204,21,0.9)] mt-1">
            {petName} Vạn Cổ Thức Tỉnh (5★ Transcended)
          </span>
        </div>
      )}
    </div>
  );
};
