import React, { useState, useEffect } from 'react';
import {
  X,
  Swords,
  Trophy,
  ShieldAlert,
  Sparkles,
  Clock,
  Trash2,
  Filter,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { BattleHistoryRecord } from '../types';
import {
  getBattleHistory,
  clearBattleHistory,
  getBattleStats,
  formatRelativeTime,
  addBattleRecord,
} from '../utils/battleHistoryManager';

interface BattleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBattle?: () => void;
  currentCrystals?: number;
}

export const BattleHistoryModal: React.FC<BattleHistoryModalProps> = ({
  isOpen,
  onClose,
  onStartBattle,
  currentCrystals,
}) => {
  const [history, setHistory] = useState<BattleHistoryRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'victory' | 'defeat'>('all');
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  const loadHistoryData = () => {
    const records = getBattleHistory();
    setHistory(records);
  };

  useEffect(() => {
    if (isOpen) {
      loadHistoryData();
      setIsConfirmingClear(false);
    }

    const handleUpdate = () => {
      loadHistoryData();
    };

    window.addEventListener('pokemon_battle_history_updated', handleUpdate);
    return () => {
      window.removeEventListener('pokemon_battle_history_updated', handleUpdate);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const stats = getBattleStats(history);

  const filteredHistory = history.filter((item) => {
    if (filter === 'victory') return item.outcome === 'victory';
    if (filter === 'defeat') return item.outcome === 'defeat';
    return true;
  });

  const handleClear = () => {
    clearBattleHistory();
    setIsConfirmingClear(false);
    loadHistoryData();
  };

  const handleAddSampleMatch = () => {
    addBattleRecord({
      outcome: 'victory',
      playerPetName: 'Hỏa Long Bạo Chúa',
      playerPetAvatar: '🐉',
      playerPetElement: 'fire',
      playerPetLevel: 15,
      opponentName: 'Thủ Lĩnh Brock',
      opponentTitle: 'Võ Đài Nham Thạch (Pewter Gym)',
      opponentPetName: 'Onix Nham Thạch',
      opponentPetAvatar: '🪨',
      opponentPetElement: 'nature',
      opponentPetLevel: 15,
      crystalDelta: 60,
      rewardExp: 100,
      badgeEarned: 'Huy Hiệu Đá (Boulder Badge)',
      badgeIcon: '🪨',
      turnsCount: 4,
    });
  };

  const getElementBadgeColor = (element: string) => {
    switch (element.toLowerCase()) {
      case 'fire':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'frost':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'thunder':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'nature':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'wind':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'shadow':
      case 'void':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'gold':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div
      id="battle-history-modal-overlay"
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        id="battle-history-modal-container"
        className="w-full max-w-3xl bg-slate-950 border-2 border-amber-500/50 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white relative"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Nhật Ký Chiến Đấu Võ Đài
                </h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  PVP BATTLE LOGS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lịch sử các hiệp đấu Pokémon PvP • Chi tiết linh thú tham chiến & biến động Tinh Thể Rồng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {typeof currentCrystals === 'number' && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-amber-300">
                <span>💎</span>
                <span>{currentCrystals}</span>
              </div>
            )}
            <button
              id="close-battle-history-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Analytics Stats Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 sm:p-4 bg-slate-900/70 border-b border-slate-800/80">
          {/* Stat 1: Total Engagements */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Tổng Trận</div>
              <div className="text-sm sm:text-base font-black text-white">{stats.total}</div>
            </div>
          </div>

          {/* Stat 2: Victories & Win Rate */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400">Chiến Thắng</div>
              <div className="text-sm sm:text-base font-black text-emerald-300 flex items-center gap-1">
                <span>{stats.wins}</span>
                <span className="text-[10px] font-bold text-slate-400">({stats.winRate}%)</span>
              </div>
            </div>
          </div>

          {/* Stat 3: Defeats */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-400">Thất Bại</div>
              <div className="text-sm sm:text-base font-black text-rose-300">{stats.losses}</div>
            </div>
          </div>

          {/* Stat 4: Net Crystals Delta */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400">Biến Động 💎</div>
              <div
                className={`text-sm sm:text-base font-black ${
                  stats.netCrystals > 0
                    ? 'text-emerald-300'
                    : stats.netCrystals < 0
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {stats.netCrystals > 0 ? `+${stats.netCrystals}` : stats.netCrystals}
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/90">
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
            <button
              id="filter-history-all-btn"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Tất Cả ({stats.total})
            </button>
            <button
              id="filter-history-victory-btn"
              onClick={() => setFilter('victory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filter === 'victory'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-emerald-400 hover:text-emerald-300 border border-slate-800'
              }`}
            >
              <Trophy className="w-3 h-3" />
              <span>Thắng Lợi ({stats.wins})</span>
            </button>
            <button
              id="filter-history-defeat-btn"
              onClick={() => setFilter('defeat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filter === 'defeat'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-900 text-rose-400 hover:text-rose-300 border border-slate-800'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Thất Bại ({stats.losses})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && !isConfirmingClear && (
              <button
                id="clear-battle-history-btn"
                onClick={() => setIsConfirmingClear(true)}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa Nhật Ký</span>
              </button>
            )}

            {isConfirmingClear && (
              <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/40 px-2 py-1 rounded-xl animate-fade-in">
                <span className="text-[11px] text-rose-200 font-bold">Xác nhận xóa?</span>
                <button
                  onClick={handleClear}
                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                >
                  Xóa Hết
                </button>
                <button
                  onClick={() => setIsConfirmingClear(false)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable History Log Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {filteredHistory.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl shadow">
                ⚔️
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm sm:text-base font-black text-amber-300">
                  {history.length === 0
                    ? 'Chưa Có Nhật Ký Trận Đấu Nào'
                    : 'Không Có Trận Đấu Phù Hợp Bộ Lọc'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {history.length === 0
                    ? 'Hãy bước vào Võ Đài và khiêu chiến các Thủ Lĩnh Võ Đài để lưu danh chiến tích của bạn và ghi lại biến động Tinh Thể Rồng!'
                    : 'Thử chuyển sang tab "Tất Cả" để xem toàn bộ lịch sử đấu.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {onStartBattle && (
                  <button
                    onClick={() => {
                      onClose();
                      onStartBattle();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/60 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Khiêu Chiến Ngay</span>
                  </button>
                )}

                {history.length === 0 && (
                  <button
                    onClick={handleAddSampleMatch}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Tạo Trận Đấu Tập Mẫu</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredHistory.map((record) => {
              const isWin = record.outcome === 'victory';
              return (
                <div
                  key={record.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-3 shadow-md ${
                    isWin
                      ? 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
                  }`}
                >
                  {/* Card Header: Outcome Pill, Time, Turns, Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {isWin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm">
                          <Trophy className="w-3 h-3" />
                          CHIẾN THẮNG
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-300 border border-rose-500/50 shadow-sm">
                          <ShieldAlert className="w-3 h-3" />
                          THẤT BẠI
                        </span>
                      )}

                      {record.badgeEarned && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <span>{record.badgeIcon || '🏆'}</span>
                          <span>{record.badgeEarned}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="text-[11px] font-medium bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                        ⚔️ {record.turnsCount || 3} lượt đấu
                      </span>
                      <span
                        className="text-[11px] flex items-center gap-1 text-slate-400"
                        title={record.dateFormatted}
                      >
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatRelativeTime(record.timestamp)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Pet Names and Confrontation (VS) */}
                  <div className="grid grid-cols-1 sm:grid-cols-11 items-center gap-3 py-1">
                    {/* Left: Player Pet */}
                    <div className="sm:col-span-5 flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0 shadow">
                        {record.playerPetAvatar || '🐾'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Linh Thú Xuất Trận
                        </div>
                        <div className="text-xs sm:text-sm font-black text-amber-400 truncate">
                          {record.playerPetName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-300">
                            Lv.{record.playerPetLevel || 1}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getElementBadgeColor(
                              record.playerPetElement
                            )}`}
                          >
                            Hệ {record.playerPetElement}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Center: VS Divider */}
                    <div className="sm:col-span-1 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-black text-amber-400 flex items-center justify-center shadow">
                        VS
                      </div>
                    </div>

                    {/* Right: Opponent Pet & Leader */}
                    <div className="sm:col-span-5 flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0 shadow">
                        {record.opponentPetAvatar || '🥊'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400 truncate">
                          {record.opponentName} ({record.opponentTitle})
                        </div>
                        <div className="text-xs sm:text-sm font-black text-cyan-300 truncate">
                          {record.opponentPetName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-300">
                            Lv.{record.opponentPetLevel || 1}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getElementBadgeColor(
                              record.opponentPetElement
                            )}`}
                          >
                            Hệ {record.opponentPetElement}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Crystals Won/Lost & Exp */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Biến Động Tinh Thể:</span>
                      {record.crystalDelta > 0 ? (
                        <span className="font-black text-emerald-300 flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-lg">
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                          <span>+{record.crystalDelta}</span>
                          <span className="text-[10px] text-amber-300">💎 Tinh Thể Rồng</span>
                        </span>
                      ) : record.crystalDelta < 0 ? (
                        <span className="font-black text-rose-400 flex items-center gap-1 bg-rose-950/60 border border-rose-500/40 px-2.5 py-0.5 rounded-lg">
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                          <span>{record.crystalDelta}</span>
                          <span className="text-[10px] text-slate-400">💎 Tinh Thể Rồng</span>
                        </span>
                      ) : (
                        <span className="font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                          0 💎
                        </span>
                      )}
                    </div>

                    {record.rewardExp && record.rewardExp > 0 && isWin && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                        <span>⭐ +{record.rewardExp} EXP</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tự động cập nhật sau mỗi trận đấu PvP</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
