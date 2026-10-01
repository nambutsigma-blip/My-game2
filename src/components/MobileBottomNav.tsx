import React from 'react';
import { BookOpen, Mic, Globe, Brain, Egg, Key, Sparkles, Trophy } from 'lucide-react';
import { StageType } from '../types';

interface MobileBottomNavProps {
  activeStage: StageType;
  onSelectStage: (stage: StageType) => void;
  isChaseModeActive: boolean;
  onOpenForeignConversation: () => void;
  onOpenAiAssistant: () => void;
  onOpenHatchery: () => void;
  onOpenArena: () => void;
  onOpenApiKeyModal: () => void;
  stolenEggsCount: number;
  dragonCrystals: number;
  hasCustomKey: boolean;
  hasUnclaimedDailyRewards?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeStage,
  onSelectStage,
  isChaseModeActive,
  onOpenForeignConversation,
  onOpenAiAssistant,
  onOpenHatchery,
  onOpenArena,
  onOpenApiKeyModal,
  stolenEggsCount,
  dragonCrystals,
  hasCustomKey,
  hasUnclaimedDailyRewards = false,
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg pb-safe shadow-[0_-8px_25px_rgba(0,0,0,0.6)]"
    >
      <div className="grid grid-cols-5 items-center h-14 px-1 max-w-lg mx-auto">
        {/* 1. Đề Thi Vào 10 (Phần I & II) */}
        <button
          onClick={() => {
            if (activeStage === 'stage3_speaking') {
              onSelectStage('stage1_eye');
            } else if (activeStage === 'stage1_eye') {
              onSelectStage('stage2_grammar');
            } else {
              onSelectStage('stage1_eye');
            }
          }}
          className={`flex flex-col items-center justify-center h-full rounded-xl transition-all cursor-pointer ${
            !isChaseModeActive && (activeStage === 'stage1_eye' || activeStage === 'stage2_grammar')
              ? 'text-amber-400 font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-4 h-4 mb-0.5" />
            {hasUnclaimedDailyRewards && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <span className="text-[10px] leading-tight tracking-tight">Đề Vào 10</span>
        </button>

        {/* 2. Mật Mã Khẩu Ngữ (Stage 3 Speaking & AI Evaluation) */}
        <button
          onClick={() => onSelectStage('stage3_speaking')}
          className={`flex flex-col items-center justify-center h-full rounded-xl transition-all cursor-pointer relative ${
            !isChaseModeActive && activeStage === 'stage3_speaking'
              ? 'text-rose-400 font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Mic className="w-4 h-4 mb-0.5" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <span className="text-[10px] leading-tight tracking-tight">Luyện Nói</span>
        </button>

        {/* 3. Người Bản Xứ (AI Foreign Conversation) - Highlighted Center Button */}
        <button
          onClick={onOpenForeignConversation}
          className="flex flex-col items-center justify-center h-full rounded-xl transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-950/80 -mt-2 group-active:scale-90 transition-transform">
            <Globe className="w-4 h-4 text-cyan-100 animate-pulse" />
          </div>
          <span className="text-[9px] font-black text-cyan-300 leading-tight mt-0.5">Bản Xứ AI</span>
        </button>

        {/* 4. Rồng Trí Tuệ (AI Thinking Assistant) */}
        <button
          onClick={onOpenAiAssistant}
          className="flex flex-col items-center justify-center h-full rounded-xl text-slate-400 hover:text-purple-300 transition-all cursor-pointer"
        >
          <div className="relative">
            <Brain className="w-4 h-4 mb-0.5 text-pink-400" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] leading-tight tracking-tight">AI Trí Tuệ</span>
        </button>

        {/* 5. Ấp Trứng & Đấu Trường */}
        <button
          onClick={onOpenHatchery}
          className="flex flex-col items-center justify-center h-full rounded-xl text-slate-400 hover:text-amber-300 transition-all cursor-pointer relative"
        >
          <div className="relative">
            <Egg className="w-4 h-4 mb-0.5 text-amber-400" />
            {stolenEggsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-amber-500 text-slate-950 text-[8px] font-black rounded-full">
                {stolenEggsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight tracking-tight">Ấp Trứng</span>
        </button>
      </div>
    </nav>
  );
};
