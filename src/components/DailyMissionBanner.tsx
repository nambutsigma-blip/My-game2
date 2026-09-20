import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flame,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Trophy,
  Target,
} from 'lucide-react';
import {
  getDailyMissionData,
  getRemainingTimeUntilReset,
} from '../utils/dailyMissionManager';
import { DailyMissionData } from '../types';

interface DailyMissionBannerProps {
  onOpenDailyMissions: () => void;
  refreshTrigger?: number;
}

export const DailyMissionBanner: React.FC<DailyMissionBannerProps> = ({
  onOpenDailyMissions,
  refreshTrigger,
}) => {
  const [missionData, setMissionData] = useState<DailyMissionData>(() => getDailyMissionData());
  const [countdown, setCountdown] = useState(getRemainingTimeUntilReset().formatted);

  useEffect(() => {
    const timer = setInterval(() => {
      const rem = getRemainingTimeUntilReset();
      setCountdown(rem.formatted);
      if (rem.hours === 0 && rem.minutes === 0 && rem.seconds === 0) {
        setMissionData(getDailyMissionData());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMissionData(getDailyMissionData());
  }, [refreshTrigger]);

  const completedCount = missionData.tasks.filter((t) => t.isCompleted).length;
  const allCompleted = completedCount === missionData.tasks.length;
  const hasUnclaimed =
    missionData.tasks.some((t) => t.isCompleted && !t.isClaimed) ||
    (allCompleted && !missionData.isGrandRewardClaimed);

  return (
    <div
      id="daily-mission-banner"
      onClick={onOpenDailyMissions}
      className="rounded-2xl p-3 sm:p-4 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-amber-950/10 cursor-pointer transition-all hover:scale-[1.008] active:scale-[0.995] group"
      title="Bấm để mở Hệ Thống Nhiệm Vụ Từ Vựng Hàng Ngày"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-lg shadow-md shadow-amber-500/30 shrink-0 group-hover:rotate-6 transition-transform">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>Nhiệm Vụ Từ Vựng 24 Giờ</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Mỗi Ngày 3 Thử Thách
                </span>
              </h3>
              {/* Streak Badge */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-950/70 border border-orange-500/40 text-orange-300 text-[10px] font-black">
                <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                <span>Chuỗi {missionData.streakDays} ngày</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Nhận đến <strong className="text-amber-300">+550 Tinh Thể Rồng</strong> hôm nay • 40 Unit Chuẩn Lớp 10
            </p>
          </div>
        </div>

        {/* Middle Tasks Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {missionData.tasks.map((t, idx) => (
            <div
              key={t.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                t.isCompleted
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400'
              }`}
            >
              {t.isCompleted ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
              <span>#{idx + 1}: {t.badge}</span>
              <span className="text-[10px] opacity-80">
                ({t.completedQuestions}/{t.totalQuestions})
              </span>
            </div>
          ))}
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block leading-none">Làm mới sau</span>
            <span className="font-mono text-xs font-bold text-amber-300 leading-tight flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3 text-amber-400" />
              {countdown}
            </span>
          </div>

          <button
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer ${
              hasUnclaimed
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/20 animate-pulse'
                : 'bg-slate-800 group-hover:bg-slate-750 text-slate-200'
            }`}
          >
            {hasUnclaimed ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nhận Quà 💎</span>
              </>
            ) : allCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hoàn Thành 3/3 ✓</span>
              </>
            ) : (
              <>
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Vào Làm Nhiệm Vụ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
