import React, { useEffect, useRef } from 'react';
import { Award, Sparkles, ArrowRight, RotateCcw, AlertTriangle, CheckCircle, Flame, Star, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime, playLaser } from '../utils/soundEffects';

interface MissionCompleteModalProps {
  isOpen: boolean;
  score: number;
  maxScore: number;
  unitTitle: string;
  eggName: string;
  onOpenHatchery: () => void;
  onNextUnit: () => void;
  onRetry: () => void;
}

export const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  isOpen,
  score,
  maxScore,
  unitTitle,
  eggName,
  onOpenHatchery,
  onNextUnit,
  onRetry,
}) => {
  const validMax = maxScore && maxScore > 0 ? maxScore : 10;
  const percentage = Math.round(((score || 0) / validMax) * 100);
  const isPerfect = score === 10 || (score >= validMax && validMax === 10) || (score === maxScore && score >= 10);
  const isPassed = score >= 8; // >= 80% -> Unlocked

  const activeTimersRef = useRef<number[]>([]);

  const clearAllTimers = () => {
    activeTimersRef.current.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    activeTimersRef.current = [];
  };

  // Spectacular multi-wave particle confetti explosion effect for a perfect score of 10
  const triggerPerfectConfettiExplosion = () => {
    clearAllTimers();

    // Wave 1: Immediate grand center explosion
    confetti({
      particleCount: 160,
      spread: 100,
      startVelocity: 48,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FFD700', '#FFA500', '#F59E0B', '#F43F5E', '#8B5CF6', '#10B981', '#38BDF8'],
      scalar: 1.25,
      ticks: 200,
    });

    // Wave 2: Left angled cannon blast
    const timer1 = window.setTimeout(() => {
      confetti({
        particleCount: 110,
        angle: 60,
        spread: 75,
        startVelocity: 58,
        origin: { x: 0.05, y: 0.75 },
        colors: ['#FFD700', '#FBBF24', '#F59E0B', '#FFFFFF', '#6366F1'],
        scalar: 1.15,
      });
    }, 200);
    activeTimersRef.current.push(timer1);

    // Wave 3: Right angled cannon blast
    const timer2 = window.setTimeout(() => {
      confetti({
        particleCount: 110,
        angle: 120,
        spread: 75,
        startVelocity: 58,
        origin: { x: 0.95, y: 0.75 },
        colors: ['#FFD700', '#FBBF24', '#EC4899', '#FFFFFF', '#10B981'],
        scalar: 1.15,
      });
    }, 400);
    activeTimersRef.current.push(timer2);

    // Wave 4: Continuous celebratory firework bursts across the screen
    const end = Date.now() + 2800;
    const intervalId = window.setInterval(() => {
      if (Date.now() > end) {
        window.clearInterval(intervalId);
        return;
      }
      const xPos = Math.random() * 0.8 + 0.1;
      const yPos = Math.random() * 0.45 + 0.1;
      confetti({
        particleCount: 50,
        startVelocity: 35,
        spread: 360,
        ticks: 80,
        origin: { x: xPos, y: yPos },
        colors: ['#FFD700', '#FFA500', '#FF3366', '#00FFFF', '#A855F7', '#34D399', '#FFFFFF'],
        scalar: 1.0,
      });
    }, 280);
    activeTimersRef.current.push(intervalId);

    // Wave 5: Cascading golden shower finale
    const timer3 = window.setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 130,
        startVelocity: 32,
        decay: 0.92,
        origin: { x: 0.5, y: 0.2 },
        colors: ['#FFD700', '#FDE047', '#F59E0B', '#FEF08A', '#FFFFFF'],
        scalar: 1.35,
        ticks: 250,
      });
    }, 1300);
    activeTimersRef.current.push(timer3);
  };

  useEffect(() => {
    if (!isOpen) {
      clearAllTimers();
      return;
    }

    if (isPerfect) {
      // Trigger full multi-stage particle explosion for a perfect score of 10
      triggerPerfectConfettiExplosion();
      playSuccessChime();
    } else if (isPassed) {
      // Standard passing celebratory confetti
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      playSuccessChime();
    } else {
      playLaser();
    }

    return () => {
      clearAllTimers();
    };
  }, [isOpen, isPassed, isPerfect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg bg-slate-900 border-2 rounded-3xl p-6 sm:p-7 shadow-2xl text-white text-center relative overflow-hidden transition-all ${
          isPerfect
            ? 'border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.35)] ring-2 ring-yellow-400/40'
            : 'border-amber-500/50'
        }`}
      >
        {/* Perfect score background celebratory radiance */}
        {isPerfect && (
          <>
            <div className="absolute -top-24 -left-24 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
          </>
        )}

        {/* Visual Badge */}
        <div className={`text-6xl mb-3 ${isPerfect ? 'animate-bounce' : isPassed ? 'animate-bounce' : ''}`}>
          {isPerfect ? '🥚👑✨' : isPassed ? '🥚🥈🎉' : '🐉❌'}
        </div>

        {/* Perfect Score Special Banner */}
        {isPerfect && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-xs uppercase tracking-wider mb-2 shadow-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>🎉 PARTICLE EXPLOSION • PERFECT 10/10 🎉</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black">
          {isPerfect
            ? 'LEGENDARY HEIST FLAWLESS VICTORY (10/10)!'
            : isPassed
            ? 'DRAGON EGG RETRIEVED SAFELY!'
            : 'INFILTRATION FAILED (BELOW 80%)'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">{unitTitle}</p>

        {/* Score Display */}
        <div className={`my-4 sm:my-5 p-4 rounded-2xl bg-slate-950 border ${
          isPerfect ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-950' : 'border-slate-800'
        }`}>
          <div className="text-xs font-bold text-slate-400 uppercase">Mission Score</div>
          <div className="text-4xl font-black text-amber-400 mt-1 flex items-center justify-center gap-2">
            <span>{score}/{maxScore}</span>
            <span className="text-lg text-slate-300 font-medium">({percentage}%)</span>
            {isPerfect && <CrownIcon className="w-6 h-6 text-amber-400 animate-spin" />}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
            {isPerfect ? (
              <div className="space-y-1">
                <p className="text-amber-300 font-bold flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>PERFECT 10/10: Awarded Mythical Golden Dragon Egg!</span>
                </p>
                <button
                  type="button"
                  onClick={triggerPerfectConfettiExplosion}
                  className="mt-1 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold text-amber-300 cursor-pointer transition-all inline-flex items-center gap-1.5 active:scale-95"
                  title="Kích hoạt lại hiệu ứng pháo hoa confetti nổ tung"
                >
                  <PartyPopper className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bắn Lại Pháo Hoa Confetti 💥</span>
                </button>
              </div>
            ) : isPassed ? (
              <p className="text-emerald-300 font-semibold">
                ✨ Scored over 80% (8/10)! Awarded Silver Dragon Egg and unlocked the next unit!
              </p>
            ) : (
              <p className="text-rose-400 font-semibold">
                ⚠️ Need at least 8/10 (80%) to retrieve the egg and unlock the next lesson.
              </p>
            )}
          </div>
        </div>

        {/* Reward card if passed */}
        {isPassed && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 mb-4 sm:mb-5 text-left flex items-center gap-3">
            <div className="text-3xl">
              {isPerfect ? '🥚✨' : '🥚'}
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase">Reward Added to Inventory:</div>
              <div className="text-sm font-bold text-white">
                {isPerfect ? 'Mythical Golden Dragon Egg' : eggName}
              </div>
              <div className="text-xs text-slate-400">Can be hatched into rare companions in the Sanctuary Hatchery!</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {isPassed ? (
            <>
              <button
                id="modal-next-unit-btn"
                onClick={onNextUnit}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-950/40 active:scale-98 transition-all"
              >
                Unlock & Begin Next Unit ➔
              </button>
              <button
                id="modal-hatch-btn"
                onClick={onOpenHatchery}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 text-xs font-bold cursor-pointer active:scale-98 transition-all"
              >
                Go to Hatchery Now
              </button>
            </>
          ) : (
            <button
              id="modal-retry-btn"
              onClick={onRetry}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 text-white font-black text-sm uppercase tracking-wider cursor-pointer shadow-lg active:scale-98 transition-all"
            >
              Retry Mission (Need 8/10)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}

