import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Sparkles,
  Clock,
  Flame,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Volume2,
  Search,
  FileText,
  Check,
  RotateCcw,
  Award,
  Zap,
  BookOpen,
  Sparkle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playSuccessChime,
  playMythicFanfare,
  speakEnglish,
} from '../utils/soundEffects';
import {
  DailyMissionData,
  DailyMissionTask,
  MeaningQuizQuestion,
  SentenceClozeQuestion,
  SpellScrambleQuestion,
} from '../types';
import {
  getDailyMissionData,
  saveDailyMissionProgress,
  getRemainingTimeUntilReset,
} from '../utils/dailyMissionManager';

interface DailyMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dragonCrystals: number;
  onRewardCrystals: (amount: number) => void;
  onMissionProgressUpdate?: (completedCount: number, totalCount: number) => void;
}

export const DailyMissionModal: React.FC<DailyMissionModalProps> = ({
  isOpen,
  onClose,
  dragonCrystals,
  onRewardCrystals,
  onMissionProgressUpdate,
}) => {
  const [missionData, setMissionData] = useState<DailyMissionData>(() => getDailyMissionData());
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Question interaction states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);

  // Spell Scramble state
  const [constructedWord, setConstructedWord] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{ id: string; letter: string; used: boolean }[]>([]);

  // 24-hour reset countdown timer state
  const [countdown, setCountdown] = useState(getRemainingTimeUntilReset().formatted);

  // Synchronize timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getRemainingTimeUntilReset();
      setCountdown(remaining.formatted);

      // If midnight reached (formatted === '00:00:00'), re-fetch daily data
      if (remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        const fresh = getDailyMissionData();
        setMissionData(fresh);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // When modal opens, refresh from storage
  useEffect(() => {
    if (isOpen) {
      const current = getDailyMissionData();
      setMissionData(current);
      setActiveTaskId(null);
      setCurrentQuestionIndex(0);
      resetQuestionState();
    }
  }, [isOpen]);

  // Notify parent of progress
  useEffect(() => {
    const completedTasks = missionData.tasks.filter((t) => t.isCompleted).length;
    onMissionProgressUpdate?.(completedTasks, missionData.tasks.length);
  }, [missionData, onMissionProgressUpdate]);

  const resetQuestionState = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrectAnswer(null);
    setConstructedWord([]);
    setAvailableLetters([]);
  };

  const activeTask = missionData.tasks.find((t) => t.id === activeTaskId);

  // Initialize Spell Question state when moving to a spell question
  useEffect(() => {
    if (activeTask && activeTask.type === 'spell_scramble' && activeTask.spellQuestions) {
      const q = activeTask.spellQuestions[currentQuestionIndex];
      if (q) {
        setConstructedWord([]);
        setAvailableLetters(
          q.scrambledLetters.map((letter, idx) => ({
            id: `letter-${idx}-${letter}`,
            letter,
            used: false,
          }))
        );
        setSelectedOption(null);
        setIsAnswerChecked(false);
        setIsCorrectAnswer(null);
      }
    }
  }, [activeTaskId, currentQuestionIndex]);

  if (!isOpen) return null;

  // Handler for selecting an option in Task 1 or Task 2
  const handleSelectOption = (option: string, correctAnswer: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(option);
    setIsAnswerChecked(true);

    const correct = option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setIsCorrectAnswer(correct);

    if (correct) {
      playSuccessChime();
    }
  };

  // Handler for letter click in Task 3 (Spell Scramble)
  const handleLetterClick = (letterObj: { id: string; letter: string; used: boolean }) => {
    if (letterObj.used || isAnswerChecked) return;

    setConstructedWord((prev) => [...prev, letterObj.letter]);
    setAvailableLetters((prev) =>
      prev.map((item) => (item.id === letterObj.id ? { ...item, used: true } : item))
    );
  };

  // Handler to remove a letter in Task 3
  const handleRemoveLetter = (indexToRemove: number) => {
    if (isAnswerChecked) return;
    const letterToRestore = constructedWord[indexToRemove];

    setConstructedWord((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    // Unmark the first matching used letter in availableLetters
    setAvailableLetters((prev) => {
      let restored = false;
      return prev.map((item) => {
        if (!restored && item.letter === letterToRestore && item.used) {
          restored = true;
          return { ...item, used: false };
        }
        return item;
      });
    });
  };

  // Check spelling in Task 3
  const handleCheckSpelling = (targetWord: string) => {
    if (constructedWord.length === 0 || isAnswerChecked) return;
    const userWord = constructedWord.join('').toLowerCase();
    // Compare letters ignoring spaces/hyphens
    const cleanTarget = targetWord.toLowerCase().replace(/[^a-z]/g, '');
    const correct = userWord === cleanTarget;

    setIsAnswerChecked(true);
    setIsCorrectAnswer(correct);

    if (correct) {
      playSuccessChime();
    }
  };

  // Move to next question or finish task
  const handleNextQuestion = () => {
    if (!activeTask) return;

    const totalQ = activeTask.totalQuestions;
    const nextIdx = currentQuestionIndex + 1;

    // Update completed count in state
    const newCompletedCount = Math.max(activeTask.completedQuestions, nextIdx);
    const isNowFinished = newCompletedCount >= totalQ;

    const updatedTasks = missionData.tasks.map((t) => {
      if (t.id === activeTask.id) {
        return {
          ...t,
          completedQuestions: newCompletedCount,
          isCompleted: isNowFinished,
        };
      }
      return t;
    });

    const updatedData: DailyMissionData = {
      ...missionData,
      tasks: updatedTasks,
    };

    setMissionData(updatedData);
    saveDailyMissionProgress(updatedData);

    if (nextIdx < totalQ) {
      setCurrentQuestionIndex(nextIdx);
      resetQuestionState();
    } else {
      // Finished all questions for this task!
      playSuccessChime();
    }
  };

  // Retry current question if wrong
  const handleRetryQuestion = () => {
    resetQuestionState();
    if (activeTask && activeTask.type === 'spell_scramble' && activeTask.spellQuestions) {
      const q = activeTask.spellQuestions[currentQuestionIndex];
      if (q) {
        setConstructedWord([]);
        setAvailableLetters(
          q.scrambledLetters.map((letter, idx) => ({
            id: `letter-${idx}-${letter}`,
            letter,
            used: false,
          }))
        );
      }
    }
  };

  // Claim single task reward
  const handleClaimTaskReward = (taskId: string) => {
    const task = missionData.tasks.find((t) => t.id === taskId);
    if (!task || !task.isCompleted || task.isClaimed) return;

    onRewardCrystals(task.crystalReward);
    playSuccessChime();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    const updatedTasks = missionData.tasks.map((t) =>
      t.id === taskId ? { ...t, isClaimed: true } : t
    );

    const updatedData: DailyMissionData = {
      ...missionData,
      tasks: updatedTasks,
    };

    setMissionData(updatedData);
    saveDailyMissionProgress(updatedData);
  };

  // Claim Grand Bounty for all 3 tasks completed
  const handleClaimGrandBounty = () => {
    const allTasksCompleted = missionData.tasks.every((t) => t.isCompleted);
    if (!allTasksCompleted || missionData.isGrandRewardClaimed) return;

    const newStreak = missionData.lastCompletedDate === missionData.dateKey
      ? missionData.streakDays
      : missionData.streakDays + 1;

    onRewardCrystals(missionData.grandRewardCrystals);
    playMythicFanfare();
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });

    const updatedData: DailyMissionData = {
      ...missionData,
      isGrandRewardClaimed: true,
      streakDays: newStreak,
      lastCompletedDate: missionData.dateKey,
    };

    setMissionData(updatedData);
    saveDailyMissionProgress(updatedData);
  };

  const completedTasksCount = missionData.tasks.filter((t) => t.isCompleted).length;
  const allTasksCompleted = completedTasksCount === missionData.tasks.length;

  return (
    <div
      id="daily-mission-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="daily-mission-modal-card"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-amber-950/20 overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-amber-500/20 shrink-0">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>Nhiệm Vụ Từ Vựng Hàng Ngày</span>
                  <span className="text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    24h Reset
                  </span>
                </h2>
                {/* Streak Badge */}
                <div
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-300 text-xs font-black shadow-sm"
                  title="Chuỗi ngày hoàn thành nhiệm vụ liên tiếp"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse" />
                  <span>Chuỗi: {missionData.streakDays} ngày</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                3 thử thách từ vựng độc nhất mỗi 24 giờ • Luyện thi lớp 10 & Destination B1 • Nhận thưởng Tinh Thể Rồng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* 24h Countdown Timer */}
            <div
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 shadow-inner"
              title="Thời gian còn lại trước khi nhiệm vụ được làm mới sang ngày tiếp theo"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 leading-none">Đổi mới sau</span>
                <span className="font-mono font-bold text-amber-300 text-xs leading-tight">{countdown}</span>
              </div>
            </div>

            {/* Crystals Wallet */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs font-black text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{dragonCrystals}</span>
              <span className="text-[10px] text-purple-400">💎</span>
            </div>

            {/* Close Modal Button */}
            <button
              id="close-daily-mission-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!activeTaskId ? (
            /* --- DASHBOARD VIEW: OVERVIEW OF 3 TASKS & GRAND BOUNTY --- */
            <div className="space-y-6">
              {/* Grand Daily Bounty Banner */}
              <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-amber-950/70 via-slate-900 to-purple-950/70 border border-amber-500/40 shadow-xl">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40 uppercase tracking-wider">
                        Đại Thưởng Hàng Ngày
                      </span>
                      <span className="text-xs text-slate-400">
                        Hoàn thành 3/3 thử thách hôm nay
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                      <span>Rương Kho Báu Rồng Hoàng Kim</span>
                      <span className="text-amber-400 font-extrabold flex items-center gap-1">
                        +{missionData.grandRewardCrystals} <Sparkles className="w-4 h-4" />
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl">
                      Mỗi 24 giờ, hệ thống chọn ngẫu nhiên 3 nhóm từ vựng độc nhất từ 40 Unit đề thi. Hoàn tất cả 3 nhiệm vụ để duy trì Chuỗi Ngày và nhận ngay 250 Tinh Thể Rồng!
                    </p>

                    {/* Progress Bar */}
                    <div className="pt-2 flex items-center gap-3 max-w-md">
                      <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                          style={{ width: `${(completedTasksCount / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-amber-300">
                        {completedTasksCount}/3 Nhiệm Vụ
                      </span>
                    </div>
                  </div>

                  {/* Bounty Action Button */}
                  <div className="shrink-0 flex items-center">
                    {missionData.isGrandRewardClaimed ? (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-black text-xs shadow-md">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Đã Nhận Thưởng Hôm Nay</span>
                      </div>
                    ) : allTasksCompleted ? (
                      <button
                        id="claim-grand-daily-bounty-btn"
                        onClick={handleClaimGrandBounty}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm cursor-pointer shadow-lg shadow-amber-500/30 transition-all active:scale-95 animate-bounce"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Mở Rương +{missionData.grandRewardCrystals} 💎</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs font-bold text-center">
                        Cần thêm {3 - completedTasksCount} nhiệm vụ
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Unique Task Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Danh Sách 3 Thử Thách Hôm Nay ({missionData.dateKey})</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    Tất cả câu hỏi đổi mới tự động sau 24h
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {missionData.tasks.map((task, index) => {
                    const isTaskDone = task.isCompleted;
                    const isClaimed = task.isClaimed;

                    return (
                      <div
                        key={task.id}
                        id={`daily-task-card-${index}`}
                        className={`rounded-2xl p-4.5 border transition-all flex flex-col justify-between relative overflow-hidden group ${
                          isClaimed
                            ? 'bg-slate-900/60 border-slate-800 opacity-90'
                            : isTaskDone
                            ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
                        }`}
                      >
                        {/* Task Top Bar */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                              Nhiệm Vụ #{index + 1} • {task.badge}
                            </span>
                            <span className="text-xs font-black text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              +{task.crystalReward} 💎
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {task.description}
                          </p>

                          {/* Words Preview Chips */}
                          <div className="mt-3 pt-3 border-t border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                              4 Từ Khóa Mục Tiêu:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {task.type === 'meaning_match' &&
                                task.meaningQuestions?.map((q) => (
                                  <span
                                    key={q.id}
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                                  >
                                    {q.wordItem.word}
                                  </span>
                                ))}
                              {task.type === 'sentence_cloze' &&
                                task.clozeQuestions?.map((q) => (
                                  <span
                                    key={q.id}
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                                  >
                                    {q.wordItem.word}
                                  </span>
                                ))}
                              {task.type === 'spell_scramble' &&
                                task.spellQuestions?.map((q) => (
                                  <span
                                    key={q.id}
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                                  >
                                    {q.wordItem.word}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Task Bottom Status & Action */}
                        <div className="mt-5 pt-3 border-t border-slate-800/80 space-y-2.5">
                          {/* Progress bar */}
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-400">Tiến độ câu hỏi:</span>
                            <span
                              className={
                                isTaskDone ? 'text-emerald-400' : 'text-amber-400'
                              }
                            >
                              {task.completedQuestions}/{task.totalQuestions}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isTaskDone
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{
                                width: `${(task.completedQuestions / task.totalQuestions) * 100}%`,
                              }}
                            />
                          </div>

                          {/* Action Button */}
                          {isClaimed ? (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Đã Nhận Thưởng
                              </span>
                              <button
                                onClick={() => {
                                  setActiveTaskId(task.id);
                                  setCurrentQuestionIndex(0);
                                  resetQuestionState();
                                }}
                                className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer"
                              >
                                Luyện Lại
                              </button>
                            </div>
                          ) : isTaskDone ? (
                            <button
                              id={`claim-task-btn-${index}`}
                              onClick={() => handleClaimTaskReward(task.id)}
                              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-950/40 cursor-pointer transition-all active:scale-95 animate-pulse"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Nhận Thưởng +{task.crystalReward} 💎</span>
                            </button>
                          ) : (
                            <button
                              id={`start-task-btn-${index}`}
                              onClick={() => {
                                setActiveTaskId(task.id);
                                setCurrentQuestionIndex(task.completedQuestions < task.totalQuestions ? task.completedQuestions : 0);
                                resetQuestionState();
                              }}
                              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-black shadow-md cursor-pointer transition-all active:scale-95 group"
                            >
                              <span>{task.completedQuestions > 0 ? 'Tiếp Tục Làm' : 'Bắt Đầu Làm'}</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* --- ACTIVE TASK PLAY VIEW --- */
            <div className="space-y-5">
              {/* Back to Overview Header */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <button
                  id="back-to-daily-missions-overview-btn"
                  onClick={() => {
                    setActiveTaskId(null);
                    resetQuestionState();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay Lại Danh Sách Nhiệm Vụ</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Phần Thưởng: +{activeTask?.crystalReward} 💎
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Câu {currentQuestionIndex + 1} / {activeTask?.totalQuestions}
                  </span>
                </div>
              </div>

              {/* TASK 1 INTERACTIVE VIEW: Meaning Detective */}
              {activeTask?.type === 'meaning_match' && activeTask.meaningQuestions && (
                (() => {
                  const q = activeTask.meaningQuestions[currentQuestionIndex];
                  if (!q) return null;

                  return (
                    <div className="space-y-5 max-w-2xl mx-auto">
                      {/* Question Card */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {q.wordItem.unitTitle}
                          </span>
                          <button
                            onClick={() => speakEnglish(q.wordItem.word)}
                            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer"
                            title="Nghe phát âm từ vựng"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Nghe Phát Âm</span>
                          </button>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                            {q.prompt}
                          </h3>
                          {q.wordItem.phonetic && (
                            <p className="text-xs font-mono text-amber-300 font-semibold">
                              Phiên âm: {q.wordItem.phonetic}
                            </p>
                          )}
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-2.5 pt-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedOption === opt;
                            const isCorrectOpt = opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                            let btnStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200';
                            if (isAnswerChecked) {
                              if (isCorrectOpt) {
                                btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                              } else if (isSelected && !isCorrectOpt) {
                                btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold';
                              } else {
                                btnStyle = 'bg-slate-900/60 border-slate-800/60 text-slate-500 opacity-60';
                              }
                            } else if (isSelected) {
                              btnStyle = 'bg-indigo-950 border-indigo-500 text-white font-bold';
                            }

                            return (
                              <button
                                key={oIdx}
                                id={`meaning-opt-${oIdx}`}
                                onClick={() => handleSelectOption(opt, q.correctAnswer)}
                                disabled={isAnswerChecked}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswerChecked && isCorrectOpt && (
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Box on Answer Checked */}
                        {isAnswerChecked && (
                          <div
                            className={`p-3.5 rounded-xl text-xs space-y-1 animate-fadeIn border ${
                              isCorrectAnswer
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                            }`}
                          >
                            <div className="font-black flex items-center gap-1.5">
                              {isCorrectAnswer ? '🎉 Chính xác!' : '⚠️ Chưa đúng!'}
                            </div>
                            <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Next / Retry Controls */}
                      {isAnswerChecked && (
                        <div className="flex items-center justify-end gap-3 pt-2">
                          {!isCorrectAnswer && (
                            <button
                              onClick={handleRetryQuestion}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Thử Lại</span>
                            </button>
                          )}
                          <button
                            id="meaning-next-btn"
                            onClick={handleNextQuestion}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-md transition-all active:scale-95"
                          >
                            <span>
                              {currentQuestionIndex + 1 < activeTask.totalQuestions
                                ? 'Câu Tiếp Theo'
                                : 'Hoàn Thành Nhiệm Vụ 1'}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* TASK 2 INTERACTIVE VIEW: Context Sentence Cloze */}
              {activeTask?.type === 'sentence_cloze' && activeTask.clozeQuestions && (
                (() => {
                  const q = activeTask.clozeQuestions[currentQuestionIndex];
                  if (!q) return null;

                  return (
                    <div className="space-y-5 max-w-2xl mx-auto">
                      <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {q.wordItem.unitTitle} • Điền Câu Ngữ Cảnh
                          </span>
                          <button
                            onClick={() => speakEnglish(q.correctWord)}
                            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer"
                            title="Nghe phát âm từ khóa"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Nghe Từ Cần Điền</span>
                          </button>
                        </div>

                        {/* Sentence with blank */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                          {q.sentenceWithBlank.split('_______').map((part, pIdx, arr) => (
                            <React.Fragment key={pIdx}>
                              <span>{part}</span>
                              {pIdx < arr.length - 1 && (
                                <span className="inline-block px-2 py-0.5 mx-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40">
                                  {isAnswerChecked ? q.correctWord : '______'}
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Clue Bar */}
                        <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 flex-wrap">
                          <span>💡 Gợi ý nghĩa: <strong className="text-amber-300">{q.hintMeaning}</strong></span>
                          {q.hintPhonetic && (
                            <span>• Phiên âm: <code className="text-purple-300 font-mono">{q.hintPhonetic}</code></span>
                          )}
                        </div>

                        {/* Multiple Choice Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedOption === opt;
                            const isCorrectOpt = opt.trim().toLowerCase() === q.correctWord.trim().toLowerCase();

                            let btnStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200';
                            if (isAnswerChecked) {
                              if (isCorrectOpt) {
                                btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                              } else if (isSelected && !isCorrectOpt) {
                                btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold';
                              } else {
                                btnStyle = 'bg-slate-900/60 border-slate-800/60 text-slate-500 opacity-60';
                              }
                            } else if (isSelected) {
                              btnStyle = 'bg-purple-950 border-purple-500 text-white font-bold';
                            }

                            return (
                              <button
                                key={oIdx}
                                id={`cloze-opt-${oIdx}`}
                                onClick={() => handleSelectOption(opt, q.correctWord)}
                                disabled={isAnswerChecked}
                                className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswerChecked && isCorrectOpt && (
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {isAnswerChecked && (
                          <div
                            className={`p-3.5 rounded-xl text-xs space-y-1 animate-fadeIn border ${
                              isCorrectAnswer
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                            }`}
                          >
                            <div className="font-black flex items-center gap-1.5">
                              {isCorrectAnswer ? '🎉 Chính xác!' : '⚠️ Chưa chính xác!'}
                            </div>
                            <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Next / Retry Controls */}
                      {isAnswerChecked && (
                        <div className="flex items-center justify-end gap-3 pt-2">
                          {!isCorrectAnswer && (
                            <button
                              onClick={handleRetryQuestion}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Thử Lại</span>
                            </button>
                          )}
                          <button
                            id="cloze-next-btn"
                            onClick={handleNextQuestion}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-md transition-all active:scale-95"
                          >
                            <span>
                              {currentQuestionIndex + 1 < activeTask.totalQuestions
                                ? 'Câu Tiếp Theo'
                                : 'Hoàn Thành Nhiệm Vụ 2'}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* TASK 3 INTERACTIVE VIEW: Spelling & Sound Scramble */}
              {activeTask?.type === 'spell_scramble' && activeTask.spellQuestions && (
                (() => {
                  const q = activeTask.spellQuestions[currentQuestionIndex];
                  if (!q) return null;

                  return (
                    <div className="space-y-5 max-w-2xl mx-auto">
                      <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {q.wordItem.unitTitle} • Đánh Vần & Phát Âm
                          </span>

                          <button
                            onClick={() => speakEnglish(q.targetWord)}
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4" />
                            <span>🔊 Nghe Phát Âm Từ</span>
                          </button>
                        </div>

                        {/* Clue text */}
                        <div className="text-center space-y-1">
                          <p className="text-xs text-slate-400">Gợi ý nghĩa tiếng Việt:</p>
                          <h4 className="text-base sm:text-lg font-black text-amber-300">
                            "{q.hintMeaning}"
                          </h4>
                          {q.hintPhonetic && (
                            <p className="text-xs font-mono text-purple-300 font-semibold">
                              IPA: {q.hintPhonetic}
                            </p>
                          )}
                        </div>

                        {/* Constructed Word Slots */}
                        <div className="flex flex-wrap items-center justify-center gap-2 min-h-[52px] p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          {constructedWord.length === 0 ? (
                            <span className="text-xs text-slate-500 italic">
                              Bấm vào các chữ cái bên dưới theo thứ tự để ghép từ...
                            </span>
                          ) : (
                            constructedWord.map((ch, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={() => handleRemoveLetter(cIdx)}
                                disabled={isAnswerChecked}
                                className="w-9 h-10 sm:w-11 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-lg sm:text-xl flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer border border-amber-300"
                                title="Bấm vào để bỏ chữ cái này"
                              >
                                {ch.toUpperCase()}
                              </button>
                            ))
                          )}
                        </div>

                        {/* Available Letter Tiles Bank */}
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
                            Ngân Hàng Chữ Cái (Bấm Để Ghép):
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {availableLetters.map((lObj) => (
                              <button
                                key={lObj.id}
                                onClick={() => handleLetterClick(lObj)}
                                disabled={lObj.used || isAnswerChecked}
                                className={`w-9 h-10 sm:w-10 sm:h-11 rounded-xl font-black text-base sm:text-lg flex items-center justify-center transition-all cursor-pointer border ${
                                  lObj.used
                                    ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-30'
                                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 hover:border-amber-400 active:scale-95 shadow-sm'
                                }`}
                              >
                                {lObj.letter.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Check Button for Spell Scramble */}
                        {!isAnswerChecked ? (
                          <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                              onClick={() => {
                                setConstructedWord([]);
                                setAvailableLetters((prev) => prev.map((item) => ({ ...item, used: false })));
                              }}
                              disabled={constructedWord.length === 0}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                            >
                              Xóa Làm Lại
                            </button>
                            <button
                              id="check-spelling-btn"
                              onClick={() => handleCheckSpelling(q.targetWord)}
                              disabled={constructedWord.length === 0}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-40"
                            >
                              Kiểm Tra Đánh Vần
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`p-3.5 rounded-xl text-xs space-y-1 animate-fadeIn border ${
                              isCorrectAnswer
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                            }`}
                          >
                            <div className="font-black flex items-center gap-1.5">
                              {isCorrectAnswer ? '🎉 Chính xác!' : '⚠️ Chưa đúng!'}
                            </div>
                            <p className="text-slate-300">
                              Từ chính xác: <strong className="text-amber-300 font-bold">{q.targetWord}</strong> {q.hintPhonetic && `(${q.hintPhonetic})`} — {q.hintMeaning}.
                            </p>
                            <p className="text-slate-400 italic">
                              "{q.wordItem.exampleEn}" ({q.wordItem.exampleVi})
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Next / Retry Controls */}
                      {isAnswerChecked && (
                        <div className="flex items-center justify-end gap-3 pt-2">
                          {!isCorrectAnswer && (
                            <button
                              onClick={handleRetryQuestion}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Thử Lại</span>
                            </button>
                          )}
                          <button
                            id="spell-next-btn"
                            onClick={handleNextQuestion}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-md transition-all active:scale-95"
                          >
                            <span>
                              {currentQuestionIndex + 1 < activeTask.totalQuestions
                                ? 'Câu Tiếp Theo'
                                : 'Hoàn Thành Nhiệm Vụ 3'}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-300">Hệ Thống Nhiệm Vụ Tự Động 24 Giờ</span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Hoàn thành mỗi ngày để tích lũy hàng ngàn Tinh Thể Rồng và ấp Pet thần thoại
          </span>
        </div>
      </div>
    </div>
  );
};
