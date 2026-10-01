import React, { useState, useEffect } from 'react';
import { HelpCircle, Flame, Egg, Swords, ChevronLeft, ChevronRight, Sparkles, Zap, BookOpen, Globe, Palette, RotateCcw, Edit3, User, Brain, LogIn, Mail, Check, Target, Highlighter, Key } from 'lucide-react';
import { UnitData, StolenEgg } from '../types';
import { AppUser } from '../utils/authHelper';
import { hasCustomApiKey } from '../utils/aiClientHelper';

interface NavbarProps {
  units: UnitData[];
  currentUnitId: string;
  onSelectUnit: (unitId: string) => void;
  unlockedUnits: string[];
  stolenEggs: StolenEgg[];
  stealthBoots: number;
  onOpenHatchery: () => void;
  onOpenRules: () => void;
  onOpenArena: () => void;
  onOpenSkillTree: () => void;
  onOpenStudy: () => void;
  onOpenOnline: () => void;
  isChaseModeActive: boolean;
  onStartChaseMode: () => void;
  dragonCrystals?: number;
  activePerksCount?: number;
  onOpenAppearanceStudio?: () => void;
  onOpenPokemonPvP?: () => void;
  pendingGiftsCount?: number;
  onResetAllAccounts?: () => void;
  accountName?: string;
  onOpenSetAccountName?: () => void;
  onOpenAiAssistant?: () => void;
  onOpenHighlightModal?: () => void;
  isHighlighterPenActive?: boolean;
  onOpenForeignConversation?: () => void;
  onOpenApiKeyModal?: () => void;
  currentUser?: AppUser | null;
  onOpenAuth?: () => void;
  onOpenDailyMissions?: () => void;
  dailyMissionsCompleted?: number;
  hasUnclaimedDailyRewards?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  units,
  currentUnitId,
  onSelectUnit,
  unlockedUnits,
  stolenEggs,
  onOpenHatchery,
  onOpenRules,
  onOpenArena,
  onOpenSkillTree,
  onOpenStudy,
  onOpenOnline,
  isChaseModeActive,
  onStartChaseMode,
  dragonCrystals = 0,
  activePerksCount = 0,
  onOpenAppearanceStudio,
  onOpenPokemonPvP,
  pendingGiftsCount = 0,
  onResetAllAccounts,
  accountName,
  onOpenSetAccountName,
  onOpenAiAssistant,
  onOpenHighlightModal,
  isHighlighterPenActive = false,
  onOpenForeignConversation,
  onOpenApiKeyModal,
  currentUser,
  onOpenAuth,
  onOpenDailyMissions,
  dailyMissionsCompleted = 0,
  hasUnclaimedDailyRewards = false,
}) => {
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(() => hasCustomApiKey());

  useEffect(() => {
    const handleKeyUpdate = () => {
      setHasCustomKey(hasCustomApiKey());
    };
    window.addEventListener('egg_thief_api_key_updated', handleKeyUpdate);
    return () => window.removeEventListener('egg_thief_api_key_updated', handleKeyUpdate);
  }, []);
  const currentIndex = units.findIndex((u) => u.id === currentUnitId);
  const prevUnit = currentIndex > 0 ? units[currentIndex - 1] : null;
  const nextUnit = currentIndex < units.length - 1 ? units[currentIndex + 1] : null;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800 backdrop-blur-md px-2.5 sm:px-4 py-2 space-y-2">
      {/* Top Row: Brand Logo, Unit Selector, and Quick Wallet/Auth/Key status */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0" onClick={() => onSelectUnit('unit-1')}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-base sm:text-xl shadow-lg shadow-amber-950/50 shrink-0">
            🥚🔥
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-[11px] xs:text-xs sm:text-base font-black tracking-tight text-white flex items-center gap-1">
                <span>Egg Thief</span>
                <span className="text-amber-400 font-extrabold hidden md:inline">• Master English Heist</span>
              </h1>
            </div>
            <div className="hidden xs:flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400">
              <span className="bg-amber-500/20 text-amber-300 font-bold px-1 py-0.2 rounded text-[8px] sm:text-[9px] border border-amber-500/30">
                40 UNITS
              </span>
              <span className="hidden sm:inline">Vào 10</span>
            </div>
          </div>
        </div>

        {/* Unit Selector Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/90 p-0.5 sm:p-1 rounded-xl border border-slate-800 flex-1 min-w-[110px] max-w-[150px] xs:max-w-[180px] sm:max-w-[260px] md:max-w-[340px]">
          {/* Previous Unit Button */}
          <button
            id="nav-prev-unit-btn"
            onClick={() => prevUnit && unlockedUnits.includes(prevUnit.id) && onSelectUnit(prevUnit.id)}
            disabled={!prevUnit || !unlockedUnits.includes(prevUnit?.id || '')}
            className={`p-1 sm:p-1.5 rounded-lg text-slate-400 transition-colors ${
              prevUnit && unlockedUnits.includes(prevUnit.id)
                ? 'hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
            title={prevUnit ? `Previous: ${prevUnit.title}` : 'No previous unit'}
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Unit Dropdown Selector */}
          <select
            id="nav-unit-select"
            value={isChaseModeActive ? 'chase' : currentUnitId}
            onChange={(e) => {
              if (e.target.value === 'chase') {
                onStartChaseMode();
              } else {
                onSelectUnit(e.target.value);
              }
            }}
            className="bg-slate-950 text-slate-200 text-[11px] sm:text-xs font-bold py-1 px-1.5 rounded-lg border border-slate-700 hover:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer w-full truncate"
          >
            <optgroup label="Tier 1: Units 1-10 (Tenses & Comparisons)">
              {units.slice(0, 10).map((u) => (
                <option key={u.id} value={u.id} disabled={!unlockedUnits.includes(u.id)}>
                  {unlockedUnits.includes(u.id) ? '✓ ' : '🔒 '}
                  {u.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="Tier 2: Units 11-20 (Passive, Conditionals & Reported Speech)">
              {units.slice(10, 20).map((u) => (
                <option key={u.id} value={u.id} disabled={!unlockedUnits.includes(u.id)}>
                  {unlockedUnits.includes(u.id) ? '✓ ' : '🔒 '}
                  {u.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="Tier 3: Units 21-30 (Articles, Prepositions & Word Formation)">
              {units.slice(20, 30).map((u) => (
                <option key={u.id} value={u.id} disabled={!unlockedUnits.includes(u.id)}>
                  {unlockedUnits.includes(u.id) ? '✓ ' : '🔒 '}
                  {u.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="Tier 4: Units 31-40 (Entrance Examination Mastery)">
              {units.slice(30, 40).map((u) => (
                <option key={u.id} value={u.id} disabled={!unlockedUnits.includes(u.id)}>
                  {unlockedUnits.includes(u.id) ? '✓ ' : '🔒 '}
                  {u.title}
                </option>
              ))}
            </optgroup>
            <option value="chase">🔥 Special Boss: Dragon Chase Escape</option>
          </select>

          {/* Next Unit Button */}
          <button
            id="nav-next-unit-btn"
            onClick={() => nextUnit && unlockedUnits.includes(nextUnit.id) && onSelectUnit(nextUnit.id)}
            disabled={!nextUnit || !unlockedUnits.includes(nextUnit?.id || '')}
            className={`p-1 sm:p-1.5 rounded-lg text-slate-400 transition-colors ${
              nextUnit && unlockedUnits.includes(nextUnit.id)
                ? 'hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
            title={nextUnit ? `Next: ${nextUnit.title}` : 'No next unit'}
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Quick Top Controls (Crystals, API Key badge, Account/Login) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Dragon Crystals Wallet */}
          <div
            onClick={onOpenHatchery}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/40 text-xs font-black text-purple-300 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Dragon Crystals - Bấm để vào Khu Ấp Trứng & Khảm Ngọc"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>{dragonCrystals}</span>
            <span className="text-[10px] text-purple-400 font-semibold">💎</span>
          </div>

          {/* Quick API Key shortcut in top bar */}
          {onOpenApiKeyModal && (
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl border text-xs font-black cursor-pointer transition-all active:scale-95 shadow-sm ${
                hasCustomKey
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900 border-amber-500/50 text-amber-300'
              }`}
              title="Cấu hình Google Gemini API Key cá nhân"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Key</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasCustomKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400'
                }`}
              />
            </button>
          )}

          {/* Cloud Auth / User Profile */}
          {onOpenAuth && (
            currentUser ? (
              <button
                id="nav-user-profile-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-900/95 hover:bg-slate-850 border border-rose-500/40 hover:border-rose-400 text-xs font-bold text-rose-200 cursor-pointer transition-all active:scale-95 shadow-sm"
                title="Tài khoản của bạn - Bấm để quản lý"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentUser.emailVerified ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span className="max-w-[42px] xs:max-w-[65px] sm:max-w-[90px] truncate text-white text-[10px] sm:text-xs">
                  {currentUser.displayName || accountName || 'Tài Khoản'}
                </span>
              </button>
            ) : (
              <button
                id="nav-auth-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 text-white font-black text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-950/50"
                title="Đăng nhập Cloud / Gmail"
              >
                <Mail className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Gmail</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Row 2: Touch-Smooth Horizontal Action Ribbon for all devices */}
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs touch-pan-x flex-nowrap">
        {/* Account Name Edit Button */}
        {onOpenSetAccountName && (
          <button
            id="nav-account-name-btn"
            onClick={onOpenSetAccountName}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/40 hover:border-amber-400 text-xs font-bold text-amber-200 cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
            title="Đặt / Đổi tên tài khoản của bạn"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
              {(accountName || 'N').charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[70px] truncate">{accountName || 'Tên'}</span>
            <Edit3 className="w-3 h-3 text-amber-400 opacity-70 shrink-0" />
          </button>
        )}

        {/* API Key Modal Button */}
        {onOpenApiKeyModal && (
          <button
            id="nav-api-key-ribbon-btn"
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black cursor-pointer transition-all active:scale-95 shadow-sm shrink-0 ${
              hasCustomKey
                ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/60 text-emerald-200'
                : 'bg-slate-900/90 hover:bg-slate-800 border-amber-500/50 text-amber-200'
            }`}
            title="Cấu hình Google Gemini API Key cá nhân"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>API Key</span>
            <span
              className={`w-2 h-2 rounded-full ${
                hasCustomKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400/80'
              }`}
            />
          </button>
        )}

        {/* AI Native Speaker Conversation Button */}
        {onOpenForeignConversation && (
          <button
            id="nav-foreign-conversation-btn"
            onClick={onOpenForeignConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-cyan-950/80 shrink-0 group"
            title="Trò chuyện trực tiếp cùng Người Nước Ngoài do AI tạo"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span>Luyện Nói Bản Xứ</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
          </button>
        )}

        {/* AI Thinking Assistant Button */}
        {onOpenAiAssistant && (
          <button
            id="nav-ai-assistant-btn"
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-indigo-950/80 shrink-0 animate-pulse"
            title="Hỏi đáp cùng Rồng Trí Tuệ AI (Thinking Mode)"
          >
            <Brain className="w-3.5 h-3.5 text-pink-200" />
            <span>AI Suy Nghĩ</span>
          </button>
        )}

        {/* Highlight AI Explainer Button */}
        {onOpenHighlightModal && (
          <button
            id="nav-highlight-ai-btn"
            onClick={onOpenHighlightModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black cursor-pointer transition-all active:scale-95 shadow-sm shrink-0 ${
              isHighlighterPenActive
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 border-amber-400 ring-2 ring-amber-400/50'
                : 'bg-gradient-to-r from-amber-950/70 to-slate-900 border-amber-500/50 text-amber-200 hover:border-amber-400'
            }`}
            title="Highlight AI - Bôi đen chữ hoặc câu bất kỳ để AI giải nghĩa chi tiết"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Highlight AI</span>
            {isHighlighterPenActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
            )}
          </button>
        )}

        {/* Study & AI Tutor Button */}
        <button
          id="nav-study-btn"
          onClick={onOpenStudy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/90 to-purple-950/90 hover:from-indigo-900 border border-indigo-500/50 text-xs font-bold text-indigo-200 cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
          title="Open Study System & AI Tutor"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Học Bài</span>
        </button>

        {/* Daily Missions 24h Button */}
        {onOpenDailyMissions && (
          <button
            id="nav-daily-missions-btn"
            onClick={onOpenDailyMissions}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black cursor-pointer transition-all active:scale-95 shadow-sm shrink-0 ${
              hasUnclaimedDailyRewards
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 animate-pulse'
                : dailyMissionsCompleted === 3
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-gradient-to-r from-amber-950/70 to-slate-900 border-amber-500/40 text-amber-200 hover:border-amber-400'
            }`}
            title="Nhiệm Vụ Từ Vựng Hàng Ngày"
          >
            <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Nhiệm Vụ Ngày</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/80 text-amber-300 font-bold border border-amber-500/30">
              {hasUnclaimedDailyRewards ? '🎁' : `${dailyMissionsCompleted}/3`}
            </span>
          </button>
        )}

        {/* Online Multiplayer & Google Auth Button */}
        <button
          id="nav-online-btn"
          onClick={onOpenOnline}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-950/90 to-amber-950/90 hover:from-red-900 border border-red-500/50 text-xs font-bold text-red-200 cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
          title="Online Multiplayer & Tặng Quà"
        >
          <Globe className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>Online & Quà</span>
          {pendingGiftsCount > 0 && (
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 px-1.5 py-0.5 rounded-full text-[10px] font-black border border-emerald-300 shadow-sm animate-bounce flex items-center gap-0.5">
              🎁 {pendingGiftsCount}
            </span>
          )}
        </button>

        {/* Pet PvP Arena Button */}
        {onOpenPokemonPvP && (
          <button
            id="nav-pet-pvp-btn"
            onClick={onOpenPokemonPvP}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 text-white font-black text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-950/60 shrink-0"
            title="Đấu Trường Pet PvP"
          >
            <Swords className="w-3.5 h-3.5 text-yellow-300" />
            <span>Pet PvP</span>
          </button>
        )}

        {/* Pet Appearance Studio Button */}
        {onOpenAppearanceStudio && (
          <button
            id="nav-appearance-btn"
            onClick={onOpenAppearanceStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/90 to-purple-950/90 hover:from-indigo-900 border border-indigo-500/50 text-xs font-bold text-indigo-200 cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
            title="Ngoại Hình Pet"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ngoại Hình</span>
          </button>
        )}

        {/* Arena Button */}
        <button
          id="nav-arena-btn"
          onClick={onOpenArena}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/80 to-slate-900 hover:from-rose-900/80 border border-rose-500/40 text-xs font-bold text-rose-300 cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
          title="Open Companion Arena"
        >
          <Swords className="w-3.5 h-3.5 text-rose-400" />
          <span>Arena</span>
        </button>

        {/* Pet Skill Tree Button */}
        <button
          id="nav-skill-tree-btn"
          onClick={onOpenSkillTree}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/90 to-slate-900 hover:from-purple-900/90 border border-purple-500/50 text-xs font-bold text-purple-300 cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
          title="Open Pet Skill Tree"
        >
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>Passives</span>
          {activePerksCount > 0 && (
            <span className="bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded-full text-[9px] font-black border border-purple-400/40">
              {activePerksCount}
            </span>
          )}
        </button>

        {/* Hatchery Quick Button */}
        <button
          id="nav-hatchery-btn"
          onClick={onOpenHatchery}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 text-xs font-bold text-amber-300 cursor-pointer transition-all active:scale-95 shrink-0"
          title="Khu Ấp Trứng"
        >
          <Egg className="w-3.5 h-3.5 text-amber-400" />
          <span>Trứng ({stolenEggs.length})</span>
        </button>

        {/* Rules Guide Modal button */}
        <button
          id="nav-rules-btn"
          onClick={onOpenRules}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white cursor-pointer shrink-0"
          title="Luật Chơi"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Reset All Accounts Button */}
        {onResetAllAccounts && (
          <button
            id="nav-reset-accounts-btn"
            onClick={onResetAllAccounts}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/70 text-rose-300 hover:text-white text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
            title="Đặt lại toàn bộ tài khoản và dữ liệu"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </header>
  );
};
