import React from 'react';
import { Footprints, Shield, Eye, Egg, Sparkles } from 'lucide-react';
import { PetCompanion } from '../types';
import { EvolvedPetSprite, getElementAuraColors } from './EvolvedPetSprite';

interface StealthPathTrackerProps {
  currentStep: number;
  totalSteps: number;
  activePet?: PetCompanion;
  alertLevel: number;
  onStepClick?: (step: number) => void;
}

const StealthPathTrackerComponent: React.FC<StealthPathTrackerProps> = ({
  currentStep,
  totalSteps,
  activePet,
  alertLevel,
}) => {
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div id="stealth-path-tracker" className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Footprints className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Con Đường Trộm Trứng Rồng (Stealth Path & Steps)
            </h4>
            <p className="text-[11px] text-slate-400">
              Bước đi số {currentStep} / {totalSteps} — Khoảng cách tới ổ trứng: {Math.max(0, totalSteps - currentStep)} bước
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activePet && (
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800">
              <div className="w-7 h-7 flex items-center justify-center overflow-hidden">
                <EvolvedPetSprite pet={activePet} size="sm" />
              </div>
              <span className="text-xs font-bold text-amber-200">{activePet.name}</span>
            </div>
          )}
          <div className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${
            alertLevel > 70
              ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
              : alertLevel > 40
              ? 'bg-amber-950 text-amber-300 border-amber-600'
              : 'bg-emerald-950 text-emerald-300 border-emerald-600'
          }`}>
            Cảnh báo: {alertLevel}%
          </div>
        </div>
      </div>

      {/* Visual Path Grid with Steps */}
      <div className="relative pt-2 pb-1">
        {/* Background Progress Rail */}
        <div className="absolute top-1/2 left-4 right-4 h-2 bg-slate-950 rounded-full -translate-y-1/2 border border-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checkpoint Nodes */}
        <div className="relative z-10 flex items-center justify-between px-2">
          {Array.from({ length: totalSteps + 1 }).map((_, idx) => {
            const isPassed = idx < currentStep;
            const isCurrent = idx === currentStep;
            const isLast = idx === totalSteps;

            return (
              <div key={idx} className="flex flex-col items-center group relative">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-md ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 scale-125 border-2 border-white ring-4 ring-amber-500/40 animate-pulse'
                      : isPassed
                      ? 'bg-emerald-500 text-slate-950 border border-emerald-300'
                      : isLast
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 border border-yellow-200'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {isLast ? (
                    <Egg className="w-3.5 h-3.5 animate-bounce" />
                  ) : isPassed ? (
                    '✓'
                  ) : (
                    idx + 1
                  )}
                </div>

                <span className={`text-[10px] mt-1.5 font-semibold transition-colors ${
                  isCurrent ? 'text-amber-300 font-bold' : isPassed ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {idx === 0 ? 'Cổng' : isLast ? 'Trứng' : `Bước ${idx}`}
                </span>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-950 text-slate-200 text-[10px] px-2 py-1 rounded-md border border-slate-800 whitespace-nowrap z-30 shadow-lg">
                  {idx === 0 ? 'Điểm xuất phát hầm mộ' : isLast ? 'Ổ Trứng Rồng Thần' : `Bước số ${idx} trên đường trộm`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const StealthPathTracker = React.memo(StealthPathTrackerComponent);

