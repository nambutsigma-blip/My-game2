import React from 'react';
import { HelpCircle, Flame, Egg, Swords, ChevronLeft, ChevronRight, Sparkles, Zap, BookOpen, Globe, Palette, RotateCcw, Edit3, User, Brain, LogIn, Mail, Check, Target } from 'lucide-react';
import { UnitData, StolenEgg } from '../types';
import { AppUser } from '../utils/authHelper';

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
  currentUser,
  onOpenAuth,
  onOpenDailyMissions,
  dailyMissionsCompleted = 0,
  hasUnclaimedDailyRewards = false,
}) => {
  const currentIndex = units.findIndex((u) => u.id === currentUnitId);
  const prevUnit = currentIndex > 0 ? units[currentIndex - 1] : null;
  const nextUnit = currentIndex < units.length - 1 ? units[currentIndex + 1] : null;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800 backdrop-blur-md px-3 md:px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectUnit('unit-1')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-xl shadow-lg shadow-amber-950/50">
            🥚🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Egg Thief</span>
                <span className="text-amber-400 font-extrabold hidden sm:inline">• Master English Heist</span>
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded text-[9px] border border-amber-500/30">
                HIGH SCHOOL ENTRANCE • 40 UNITS
              </span>
              <span className="hidden md:inline">Global Success & Destination B1</span>
            </div>
          </div>
        </div>

        {/* Unit Selector Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 max-w-full">
          {/* Previous Unit Button */}
          <button
            id="nav-prev-unit-btn"
            onClick={() => prevUnit && unlockedUnits.includes(prevUnit.id) && onSelectUnit(prevUnit.id)}
            disabled={!prevUnit || !unlockedUnits.includes(prevUnit?.id || '')}
            className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
              prevUnit && unlockedUnits.includes(prevUnit.id)
                ? 'hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
            title={prevUnit ? `Previous: ${prevUnit.title}` : 'No previous unit'}
          >
            <ChevronLeft className="w-4 h-4" />
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
            className="bg-slate-950 text-slate-200 text-xs font-bold py-1.5 px-2 rounded-lg border border-slate-700 hover:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer max-w-[200px] sm:max-w-[260px] md:max-w-[320px] truncate"
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
            className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
              nextUnit && unlockedUnits.includes(nextUnit.id)
                ? 'hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
            title={nextUnit ? `Next: ${nextUnit.title}` : 'No next unit'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions: Study & AI, Crystals, Arena, Hatchery & Rules */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cloud Auth / Login Button directly accessible from Navbar */}
          {onOpenAuth && (
            currentUser ? (
              <button
                id="nav-user-profile-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/95 hover:bg-slate-850 border border-rose-500/40 hover:border-rose-400 text-xs font-bold text-rose-200 cursor-pointer transition-all active:scale-95 shadow-sm"
                title={
                  currentUser.emailVerified
                    ? 'Tài khoản Gmail đã xác minh chính chủ - Bấm để quản lý'
                    : 'Tài khoản đang hoạt động - Bấm để kiểm tra xác thực Gmail'
                }
              >
                <div className="relative flex items-center justify-center">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentUser.emailVerified ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <div
                    className={`absolute w-2 h-2 rounded-full animate-ping opacity-75 ${
                      currentUser.emailVerified ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                </div>
                <span className="max-w-[70px] sm:max-w-[110px] truncate text-white">
                  {currentUser.displayName || accountName || 'Tài Khoản'}
                </span>
                {currentUser.emailVerified ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-black border border-emerald-500/40 flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" />
                    Gmail ✓
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-bold border border-rose-500/30 hidden sm:inline">
                    Gmail
                  </span>
                )}
              </button>
            ) : (
              <button
                id="nav-auth-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 hover:from-rose-500 hover:to-red-400 text-white font-black text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-950/50"
                title="Xác thực tài khoản Gmail chính chủ hoặc Đăng nhập Cloud"
              >
                <Mail className="w-3.5 h-3.5 text-white" />
                <span>Xác Thực Gmail</span>
              </button>
            )
          )}

          {/* Account Name / Profile Edit Button */}
          {onOpenSetAccountName && (
            <button
              id="nav-account-name-btn"
              onClick={onOpenSetAccountName}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/40 hover:border-amber-400 text-xs font-bold text-amber-200 cursor-pointer transition-all active:scale-95 shadow-sm group"
              title="Đặt / Đổi tên tài khoản của bạn"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-[11px] flex items-center justify-center shadow shrink-0">
                {(accountName || 'N').charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[70px] sm:max-w-[120px] truncate">{accountName || 'Đặt Tên'}</span>
              <Edit3 className="w-3 h-3 text-amber-400 opacity-70 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}

          {/* AI Thinking Assistant Button */}
          {onOpenAiAssistant && (
            <button
              id="nav-ai-assistant-btn"
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-indigo-950/80 animate-pulse"
              title="Hỏi đáp cùng Rồng Trí Tuệ AI (Thinking Mode - Suy nghĩ độc lập, Không hardcode)"
            >
              <Brain className="w-3.5 h-3.5 text-pink-200" />
              <span>AI Suy Nghĩ</span>
            </button>
          )}

          {/* Study & AI Tutor Button */}
          <button
            id="nav-study-btn"
            onClick={onOpenStudy}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/90 to-purple-950/90 hover:from-indigo-900 border border-indigo-500/50 text-xs font-bold text-indigo-200 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Open Study System & AI Tutor (Vocabulary, Grammar & AI Chat)"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Học Bài</span>
          </button>

          {/* Online Multiplayer & Google Auth Button */}
          <button
            id="nav-online-btn"
            onClick={onOpenOnline}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-950/90 to-amber-950/90 hover:from-red-900 border border-red-500/50 text-xs font-bold text-red-200 cursor-pointer transition-all active:scale-95 shadow-sm relative"
            title="Online Multiplayer, Tặng Quà Toàn Hệ Thống & Google Sign-In"
          >
            <Globe className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="hidden sm:inline">Online & Quà</span>
            {pendingGiftsCount > 0 && (
              <span className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 px-1.5 py-0.5 rounded-full text-[10px] font-black border border-emerald-300 shadow-sm animate-bounce flex items-center gap-0.5">
                🎁 {pendingGiftsCount}
              </span>
            )}
          </button>

          {/* Daily Missions 24h Button */}
          {onOpenDailyMissions && (
            <button
              id="nav-daily-missions-btn"
              onClick={onOpenDailyMissions}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-black cursor-pointer transition-all active:scale-95 shadow-sm ${
                hasUnclaimedDailyRewards
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 animate-pulse shadow-amber-950/50'
                  : dailyMissionsCompleted === 3
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-gradient-to-r from-amber-950/70 to-slate-900 border-amber-500/40 text-amber-200 hover:border-amber-400'
              }`}
              title="Nhiệm Vụ Từ Vựng Hàng Ngày (3 thử thách mỗi 24 giờ • Thưởng Tinh Thể Rồng)"
            >
              <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Nhiệm Vụ Ngày</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/80 text-amber-300 font-bold border border-amber-500/30">
                {hasUnclaimedDailyRewards ? '🎁 Nhận Quà' : `${dailyMissionsCompleted}/3`}
              </span>
            </button>
          )}

          {/* Dragon Crystals Wallet */}
          <div
            onClick={onOpenHatchery}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/40 text-xs font-black text-purple-300 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Dragon Crystals - Used to enchant pet companions in the Hatchery!"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>{dragonCrystals}</span>
            <span className="hidden md:inline text-[10px] text-purple-400 font-semibold">💎</span>
          </div>

          {/* Pet PvP Arena Button */}
          {onOpenPokemonPvP && (
            <button
              id="nav-pet-pvp-btn"
              onClick={onOpenPokemonPvP}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 text-white font-black text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-950/60 animate-pulse"
              title="Đấu Trường Pet PvP & Thủ Lĩnh Võ Đài"
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
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/90 to-purple-950/90 hover:from-indigo-900 border border-indigo-500/50 text-xs font-bold text-indigo-200 cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Tùy biến ngoại hình Pet (Màu lông, Cánh, Hào quang, Phụ kiện)"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Ngoại Hình</span>
            </button>
          )}

          {/* Pet PvP Arena Button */}
          <button
            id="nav-arena-btn"
            onClick={onOpenArena}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/80 to-slate-900 hover:from-rose-900/80 border border-rose-500/40 text-xs font-bold text-rose-300 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Open Companion Arena (PvP vs NPC Trainers)"
          >
            <Swords className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="hidden sm:inline">Arena</span>
          </button>

          {/* Pet Skill Tree Button */}
          <button
            id="nav-skill-tree-btn"
            onClick={onOpenSkillTree}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/90 to-slate-900 hover:from-purple-900/90 border border-purple-500/50 text-xs font-bold text-purple-300 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Open Pet Skill Tree (Unlock permanent passives with Dragon Crystals)"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
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
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 text-xs font-bold text-amber-300 cursor-pointer transition-all active:scale-95"
            title="Open Sanctuary Egg Hatchery"
          >
            <Egg className="w-3.5 h-3.5 text-amber-400" />
            <span>Eggs ({stolenEggs.length})</span>
          </button>

          {/* Rules Guide Modal button */}
          <button
            id="nav-rules-btn"
            onClick={onOpenRules}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Game Rules & Mission Mechanics"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Reset All Accounts Button */}
          {onResetAllAccounts && (
            <button
              id="nav-reset-accounts-btn"
              onClick={onResetAllAccounts}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/70 text-rose-300 hover:text-white text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Đặt lại toàn bộ tài khoản và dữ liệu (Reset All Accounts)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Reset Tài Khoản</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
