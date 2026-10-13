import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  RefreshCw,
  FileText,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StolenEgg, EggTierType } from '../types';
import {
  OFFICIAL_50_MOCK_EXAMS,
  Official50MockExamPaper,
  MockExamQuestion,
} from '../data/official50MockExamData';
import { playMythicFanfare, playSuccessChime, isAudioMuted, toggleAudioMute } from '../utils/soundEffects';

interface OfficialMockExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStolenEgg?: (egg: StolenEgg) => void;
  onAddDragonCrystals?: (amount: number) => void;
  candidateName?: string;
}

export const OfficialMockExamModal: React.FC<OfficialMockExamModalProps> = ({
  isOpen,
  onClose,
  onAddStolenEgg,
  onAddDragonCrystals,
  candidateName = 'Thí Sinh Luyện Thi 10',
}) => {
  // Stage selection
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const currentExamPaper: Official50MockExamPaper = OFFICIAL_50_MOCK_EXAMS[selectedStageIdx] || OFFICIAL_50_MOCK_EXAMS[0];

  // Exam State: 'intro' | 'testing' | 'submitted'
  const [examStatus, setExamStatus] = useState<'intro' | 'testing' | 'submitted'>('intro');

  // Answers Map: questionId -> 'A' | 'B' | 'C' | 'D'
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});

  // Active question scroll target or current question
  const [activeQuestionNum, setActiveQuestionNum] = useState<number>(1);

  // 45-Minute Timer: 45 * 60 = 2700 seconds
  const TOTAL_SECONDS = 45 * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_SECONDS);

  // Reward state
  const [awardedEgg, setAwardedEgg] = useState<StolenEgg | null>(null);
  const [awardedCrystals, setAwardedCrystals] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  // Black & White Theme Mode: 'bw-light' (giấy trắng mực đen) or 'bw-dark' (giấy đen mực trắng)
  const [paperTheme, setPaperTheme] = useState<'bw-light' | 'bw-dark'>('bw-light');

  // Mute state
  const [muted, setMuted] = useState<boolean>(isAudioMuted());

  useEffect(() => {
    const handleMuteChange = () => setMuted(isAudioMuted());
    window.addEventListener('egg_thief_sound_mute_changed', handleMuteChange);
    return () => window.removeEventListener('egg_thief_sound_mute_changed', handleMuteChange);
  }, []);

  const timerRef = useRef<any>(null);

  // Start Exam Countdown
  useEffect(() => {
    if (examStatus === 'testing') {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStatus]);

  if (!isOpen) return null;

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start the 45-minute test
  const handleStartExam = () => {
    setUserAnswers({});
    setSecondsRemaining(TOTAL_SECONDS);
    setExamStatus('testing');
    setActiveQuestionNum(1);
    setAwardedEgg(null);
  };

  // Select an option
  const handleSelectAnswer = (questionNum: number, choice: 'A' | 'B' | 'C' | 'D') => {
    if (examStatus !== 'testing') return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionNum]: choice,
    }));
  };

  // Submit and Calculate Official Score
  const handleSubmitExam = () => {
    let correct = 0;
    currentExamPaper.questions.forEach((q) => {
      if (userAnswers[q.questionNumber] === q.correctAnswer) {
        correct++;
      }
    });

    const score = Number(((correct / currentExamPaper.questions.length) * 10).toFixed(2));
    setCorrectCount(correct);
    setFinalScore(score);
    setExamStatus('submitted');

    // Determine high-tier egg reward (Minimum King!)
    let rewardEggType: EggTierType = 'king';
    let crystalsReward = 100;

    if (score >= 9.0) {
      rewardEggType = Math.random() < 0.6 ? 'king_of_god' : 'god';
      crystalsReward = 300;
    } else if (score >= 8.0) {
      rewardEggType = 'deity';
      crystalsReward = 200;
    } else if (score >= 7.0) {
      rewardEggType = 'titan';
      crystalsReward = 150;
    } else {
      // Minimum King!
      rewardEggType = 'king';
      crystalsReward = 100;
    }

    const eggNameMap: Record<EggTierType, string> = {
      king_of_god: 'Trứng Vạn Thần Chi Vương (Tier 15)',
      god: 'Trứng Sáng Thế Tối Cao (Tier 14)',
      deity: 'Trứng Thần Linh Thượng Giới (Tier 13)',
      titan: 'Trứng Nham Thạch Cổ Đại (Tier 12)',
      king: 'Trứng Vương Giả Hoàng Triều (Tier 11)',
      golden: 'Trứng Rồng Hoàng Kim',
      silver: 'Trứng Rồng Băng Ngân',
      common: 'Trứng Rồng Bích Ngọc',
      secret: 'Trứng Thần Bí Nguyên Bản',
    };

    const newEgg: StolenEgg = {
      id: `egg_exam_50q_${Date.now()}`,
      unitId: `official_mock_50q_${currentExamPaper.stageId}`,
      unitTitle: `Phần Thưởng Thi Thử 10: ${score}đ (${eggNameMap[rewardEggType]})`,
      eggType: rewardEggType,
      obtainedScore: score,
      stolenAt: new Date().toISOString(),
      isHatched: false,
    };

    setAwardedEgg(newEgg);
    setAwardedCrystals(crystalsReward);

    if (onAddStolenEgg) {
      onAddStolenEgg(newEgg);
    }
    if (onAddDragonCrystals) {
      onAddDragonCrystals(crystalsReward);
    }

    playMythicFanfare();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#000000', '#ffffff', '#eab308', '#a855f7'],
    });
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      {/* Container: Black & White Academic Styling */}
      <div
        className={`w-full max-w-5xl h-[95vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden border-2 transition-colors ${
          paperTheme === 'bw-light'
            ? 'bg-[#faf8f5] text-neutral-900 border-neutral-700 font-serif'
            : 'bg-[#141414] text-neutral-100 border-neutral-600 font-serif'
        }`}
      >
        {/* ================= OFFICIAL TEST PAPER HEADER ================= */}
        <div
          className={`px-4 py-3 border-b-2 flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            paperTheme === 'bw-light'
              ? 'bg-[#f3f0ea] border-neutral-800'
              : 'bg-[#1c1c1c] border-neutral-700'
          }`}
        >
          {/* Official Seal & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center font-bold text-xs uppercase tracking-tighter shrink-0 text-center leading-none">
              BGD<br />ĐT
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest font-black opacity-80">
                BỘ GIÁO DỤC VÀ ĐÀO TẠO • KỲ THI TUYỂN SINH VÀO LỚP 10 THPT
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight uppercase">
                ĐỀ THI CHÍNH THỨC 50 CÂU — THỜI GIAN 45 PHÚT
              </h2>
            </div>
          </div>

          {/* Quick Header Controls (Theme, Sound Mute, Close) */}
          <div className="flex items-center gap-2 font-sans text-xs">
            {/* Theme Toggle: Giấy Sáng / Giấy Tối */}
            <button
              onClick={() => setPaperTheme((prev) => (prev === 'bw-light' ? 'bw-dark' : 'bw-light'))}
              className="px-2.5 py-1 rounded-lg border border-current text-[11px] font-bold hover:opacity-85 cursor-pointer"
              title="Đổi màu nền giấy thi đen trắng"
            >
              {paperTheme === 'bw-light' ? 'Giấy Tối 🌙' : 'Giấy Sáng ☀️'}
            </button>

            {/* Mute Button */}
            <button
              onClick={() => {
                const next = toggleAudioMute();
                setMuted(next);
              }}
              className="p-1.5 rounded-lg border border-current text-[11px] font-bold hover:opacity-85 cursor-pointer"
              title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-current hover:bg-neutral-500/20 transition-colors cursor-pointer"
              title="Đóng phòng thi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= INTRO VIEW: CHỌN GIAI ĐOẠN & THỂ LỆ ================= */}
        {examStatus === 'intro' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
            {/* Header Memo Box */}
            <div
              className={`p-5 rounded-xl border-2 space-y-3 ${
                paperTheme === 'bw-light'
                  ? 'bg-white border-neutral-800'
                  : 'bg-neutral-900 border-neutral-700'
              }`}
            >
              <div className="border-b pb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider">Hội đồng thi tuyển:</span>
                  <div className="font-black text-sm">Tuyển sinh Lớp 10 THPT Quốc Gia (Chuẩn Bộ GD&ĐT)</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs uppercase tracking-wider">Thí sinh:</span>
                  <div className="font-bold text-sm">{candidateName}</div>
                </div>
              </div>

              {/* Official 8-Section Specification Table */}
              <div className="space-y-1.5 font-sans">
                <span className="font-bold text-xs uppercase tracking-wider font-serif">
                  Cấu Trúc Ma Trận Đề Thi Chuẩn 50 Câu (Thang Điểm 10.0 / 45 Phút):
                </span>
                <div className="overflow-x-auto text-[11px]">
                  <table className="w-full text-left border-collapse border border-current">
                    <thead>
                      <tr className="border-b border-current bg-neutral-500/10 font-bold">
                        <th className="p-1.5 border-r border-current text-center w-10">STT</th>
                        <th className="p-1.5 border-r border-current">Phần / Dạng bài</th>
                        <th className="p-1.5 border-r border-current text-center w-16">Số câu</th>
                        <th className="p-1.5 border-r border-current text-center w-16">Điểm</th>
                        <th className="p-1.5">Nội dung chính</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-current">
                        <td className="p-1.5 border-r border-current text-center">1</td>
                        <td className="p-1.5 border-r border-current font-bold">Phát âm phần gạch chân</td>
                        <td className="p-1.5 border-r border-current text-center">5</td>
                        <td className="p-1.5 border-r border-current text-center">1,0</td>
                        <td className="p-1.5">Chọn từ có phần gạch chân phát âm khác biệt</td>
                      </tr>
                      <tr className="border-b border-current">
                        <td className="p-1.5 border-r border-current text-center">2</td>
                        <td className="p-1.5 border-r border-current font-bold">Trọng âm</td>
                        <td className="p-1.5 border-r border-current text-center">5</td>
                        <td className="p-1.5 border-r border-current text-center">1,0</td>
                        <td className="p-1.5">Chọn từ có trọng âm chính ở vị trí khác biệt</td>
                      </tr>
                      <tr className="border-b border-current">
                        <td className="p-1.5 border-r border-current text-center">3</td>
                        <td className="p-1.5 border-r border-current font-bold">Từ vựng &amp; Ngữ pháp</td>
                        <td className="p-1.5 border-r border-current text-center">10</td>
                        <td className="p-1.5 border-r border-current text-center">2,0</td>
                        <td className="p-1.5">Hoàn thành câu: thì, cấu trúc, giới từ, cụm động từ</td>
                      </tr>
                      <tr className="border-b border-current">
                        <td className="p-1.5 border-r border-current text-center">4</td>
                        <td className="p-1.5 border-r border-current font-bold">Giao tiếp thường ngày</td>
                        <td className="p-1.5 border-r border-current text-center">5</td>
                        <td className="p-1.5 border-r border-current text-center">1,0</td>
                        <td className="p-1.5">Chọn câu trả lời chuẩn mực trong tình huống hội thoại</td>
                      </tr>
                      <tr className="border-b border-current">
                        <td className="p-1.5 border-r border-current text-center">5</td>
                        <td className="p-1.5 border-r border-current font-bold">Biển báo &amp; Thông báo</td>
                        <td className="p-1.5 border-r border-current text-center">5</td>
                        <td className="p-1.5 border-r border-current text-center">1,0</td>
                        <td className="p-1.5">Đọc hiểu ý nghĩa thông báo, biển hiệu đời sống thực tế</td>
                      </tr>
                      <tr className="border-b border-current">
                        <td className="p-1.5 border-r border-current text-center">6</td>
                        <td className="p-1.5 border-r border-current font-bold">Điền từ vào đoạn văn</td>
                        <td className="p-1.5 border-r border-current text-center">8</td>
                        <td className="p-1.5 border-r border-current text-center">1,6</td>
                        <td className="p-1.5">Đọc đoạn văn, chọn từ thích hợp điền vào chỗ trống</td>
                      </tr>
                      <tr className="border-b border-current">
                        <td className="p-1.5 border-r border-current text-center">7</td>
                        <td className="p-1.5 border-r border-current font-bold">Đọc hiểu văn bản</td>
                        <td className="p-1.5 border-r border-current text-center">10</td>
                        <td className="p-1.5 border-r border-current text-center">2,0</td>
                        <td className="p-1.5">Đọc 2 bài khóa: chi tiết, ý chính, từ vựng ngữ cảnh</td>
                      </tr>
                      <tr className="border-b border-current font-medium">
                        <td className="p-1.5 border-r border-current text-center">8</td>
                        <td className="p-1.5 border-r border-current font-bold">Viết — Câu đồng nghĩa</td>
                        <td className="p-1.5 border-r border-current text-center">2</td>
                        <td className="p-1.5 border-r border-current text-center">0,4</td>
                        <td className="p-1.5">Chọn câu có nghĩa gần nhất với câu đã cho</td>
                      </tr>
                      <tr className="font-black bg-neutral-500/15">
                        <td colSpan={2} className="p-1.5 border-r border-current text-right uppercase">
                          TỔNG CỘNG:
                        </td>
                        <td className="p-1.5 border-r border-current text-center">50 câu</td>
                        <td className="p-1.5 border-r border-current text-center">10,0 điểm</td>
                        <td className="p-1.5">Thời gian làm bài: 45 phút nghiêm túc</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guaranteed High-Tier Egg Rewards */}
              <div className="p-3 border border-current rounded-lg text-xs space-y-1">
                <span className="font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Chế Độ Thưởng Trứng Cao Cấp (Thấp Nhất Là King):</span>
                </span>
                <p className="leading-relaxed">
                  • <strong>Điểm 9.0 – 10.0:</strong> Trứng Vạn Thần Chi Vương (King of Gods) hoặc Trứng Sáng Thế (God) + 300 💎.
                  <br />
                  • <strong>Điểm 8.0 – 8.9:</strong> Trứng Thần Linh Thượng Giới (Deity) + 200 💎.
                  <br />
                  • <strong>Điểm 7.0 – 7.9:</strong> Trứng Nham Thạch Cổ Đại (Titan) + 150 💎.
                  <br />
                  • <strong>Dưới 7.0 điểm:</strong> Vẫn được trao tặng <strong>Trứng Vương Giả Hoàng Triều (King)</strong> + 100 💎!
                </p>
              </div>
            </div>

            {/* Stage Selector Pills */}
            <div className="space-y-2">
              <span className="font-bold text-xs uppercase tracking-wider block">
                Chọn Giai Đoạn Đề Thi:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 font-sans">
                {OFFICIAL_50_MOCK_EXAMS.map((exam, idx) => (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedStageIdx(idx)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedStageIdx === idx
                        ? 'border-current bg-neutral-500/20 font-bold'
                        : 'border-neutral-500/50 hover:border-current opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-black">{exam.examCode}</span>
                      <span className="text-[10px] uppercase font-semibold">45 Phút • 50 Câu</span>
                    </div>
                    <div className="text-sm font-black font-serif">{exam.stageName}</div>
                    <div className="text-[11px] opacity-75 mt-0.5 line-clamp-1">{exam.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Exam Button */}
            <div className="pt-2 text-center">
              <button
                onClick={handleStartExam}
                className={`px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider cursor-pointer transition-all shadow-lg active:scale-95 border-2 ${
                  paperTheme === 'bw-light'
                    ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'
                    : 'bg-white text-neutral-950 border-white hover:bg-neutral-200'
                }`}
              >
                BẮT ĐẦU TÍNH GIỜ 45 PHÚT &amp; LÀM BÀI THI CHÍNH THỨC ➔
              </button>
            </div>
          </div>
        )}

        {/* ================= TESTING VIEW: 45 MINUTES & 50 QUESTIONS ================= */}
        {examStatus === 'testing' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Main Scrollable: Official 50 Questions Paper */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Exam Subheader */}
              <div className="border-b-2 border-current pb-3 text-center space-y-1">
                <div className="text-xs uppercase font-bold tracking-wider">
                  MÃ ĐỀ THI: {currentExamPaper.examCode} • SỐ BÁO DANH: 010-88899
                </div>
                <div className="text-xs italic opacity-80">
                  (Thí sinh làm bài trực tiếp vào phiếu trả lời bên phải hoặc chọn đáp án bên dưới)
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {currentExamPaper.questions.map((q) => {
                  const selected = userAnswers[q.questionNumber];

                  return (
                    <div
                      key={q.id}
                      id={`question-card-${q.questionNumber}`}
                      className={`p-4 rounded-xl border transition-all ${
                        selected
                          ? 'border-current bg-neutral-500/10'
                          : 'border-neutral-500/40 hover:border-current'
                      }`}
                    >
                      {/* Section Banner Header (Shown on first question of each part) */}
                      {(q.questionNumber === 1 ||
                        q.questionNumber === 6 ||
                        q.questionNumber === 11 ||
                        q.questionNumber === 21 ||
                        q.questionNumber === 26 ||
                        q.questionNumber === 31 ||
                        q.questionNumber === 39 ||
                        q.questionNumber === 49) && (
                        <div className="mb-3.5 pb-2 border-b border-current/40">
                          <h4 className="font-black text-xs sm:text-sm uppercase tracking-wide">
                            {q.partTitle}
                          </h4>
                          <p className="text-xs italic opacity-80 mt-0.5">
                            {q.partInstruction}
                          </p>
                        </div>
                      )}

                      {/* Reading Passage or Signs if present */}
                      {q.passage && (q.questionNumber === 31 || q.questionNumber === 39 || q.questionNumber === 44) && (
                        <div className="p-3.5 mb-3.5 border border-current rounded-lg text-xs leading-relaxed bg-neutral-500/5 whitespace-pre-line font-serif">
                          {q.passage}
                        </div>
                      )}

                      {/* Sign Graphic if present */}
                      {q.signGraphic && (
                        <div className="max-w-md mx-auto my-3 p-3 border-2 border-current rounded-lg text-center font-sans space-y-1 bg-neutral-500/5">
                          <div className="text-xs font-black uppercase tracking-wider border-b border-current pb-1">
                            {q.signGraphic.header}
                          </div>
                          <div className="text-xs font-bold py-1">
                            {q.signGraphic.body}
                          </div>
                          {q.signGraphic.footer && (
                            <div className="text-[10px] italic border-t border-current pt-0.5">
                              {q.signGraphic.footer}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Question Text */}
                      <div className="font-bold text-sm mb-3 flex items-start gap-2">
                        <span className="underline whitespace-nowrap">Câu {q.questionNumber}:</span>
                        <span className="whitespace-pre-line">{q.questionText}</span>
                      </div>

                      {/* 4 Multiple Choice Options (A, B, C, D) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                          const isOptionSelected = selected === optKey;
                          return (
                            <div
                              key={optKey}
                              onClick={() => handleSelectAnswer(q.questionNumber, optKey)}
                              className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                                isOptionSelected
                                  ? 'border-current bg-neutral-500/25 font-black ring-1 ring-current'
                                  : 'border-neutral-500/40 hover:border-current hover:bg-neutral-500/5'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-black text-xs shrink-0 ${
                                  isOptionSelected ? 'border-current bg-current text-white font-bold' : 'border-current'
                                }`}
                                style={{
                                  backgroundColor: isOptionSelected ? (paperTheme === 'bw-light' ? '#000' : '#fff') : undefined,
                                  color: isOptionSelected ? (paperTheme === 'bw-light' ? '#fff' : '#000') : undefined,
                                }}
                              >
                                {optKey}
                              </div>
                              <span className="leading-snug">{q.options[optKey]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Scantron Bubble Answer Sheet & Timer HUD */}
            <div
              className={`w-full md:w-80 border-t-2 md:border-t-0 md:border-l-2 p-4 flex flex-col justify-between shrink-0 font-sans ${
                paperTheme === 'bw-light' ? 'bg-[#f4f1ea] border-neutral-800' : 'bg-[#181818] border-neutral-700'
              }`}
            >
              {/* Timer HUD */}
              <div className="p-3 rounded-xl border border-current space-y-1 mb-3 text-center">
                <div className="text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>THỜI GIAN CÒN LẠI</span>
                </div>
                <div className={`text-3xl font-black font-mono tracking-wider ${
                  secondsRemaining <= 300 ? 'text-rose-600 animate-pulse' : ''
                }`}>
                  {formatTime(secondsRemaining)}
                </div>
                <div className="text-[11px] opacity-80">
                  Đã làm: <strong>{answeredCount}</strong> / 50 câu
                </div>
              </div>

              {/* Bubble Sheet (1 to 50) */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-72 md:max-h-none border border-current/30 p-2 rounded-xl">
                <div className="text-[10px] font-black uppercase tracking-wider text-center border-b pb-1 mb-2">
                  PHIẾU TRẢ LỜI TRẮC NGHIỆM (1 – 50)
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  {currentExamPaper.questions.map((q) => {
                    const ans = userAnswers[q.questionNumber];
                    return (
                      <button
                        key={q.questionNumber}
                        onClick={() => {
                          const el = document.getElementById(`question-card-${q.questionNumber}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className={`p-1 rounded border text-[11px] font-bold cursor-pointer transition-colors flex flex-col items-center justify-center ${
                          ans
                            ? 'bg-current text-white font-black'
                            : 'border-current/40 hover:border-current'
                        }`}
                        style={{
                          backgroundColor: ans ? (paperTheme === 'bw-light' ? '#171717' : '#f5f5f5') : undefined,
                          color: ans ? (paperTheme === 'bw-light' ? '#fff' : '#000') : undefined,
                        }}
                      >
                        <span className="text-[9px] opacity-75">{q.questionNumber}</span>
                        <span>{ans || '•'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t mt-3 space-y-2">
                <button
                  onClick={handleSubmitExam}
                  className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md active:scale-95 border-2 ${
                    paperTheme === 'bw-light'
                      ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'
                      : 'bg-white text-neutral-950 border-white hover:bg-neutral-200'
                  }`}
                >
                  NỘP BÀI THI CHÍNH THỨC ({answeredCount}/50)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SUBMITTED VIEW: SCORECARD, HIGH-TIER EGG REWARD & ANSWER KEY ================= */}
        {examStatus === 'submitted' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
            {/* Certificate of Results */}
            <div
              className={`p-6 rounded-2xl border-2 text-center space-y-3 relative overflow-hidden ${
                paperTheme === 'bw-light' ? 'bg-white border-neutral-900' : 'bg-neutral-900 border-neutral-600'
              }`}
            >
              <div className="text-xs uppercase font-black tracking-widest opacity-80">
                KẾT QUẢ KHẢO THÍ CHÍNH THỨC — KỲ THI VÀO 10 THPT
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase">
                GIẤY CHỨNG NHẬN KẾT QUẢ THI
              </h3>
              <p className="text-xs italic opacity-75">
                Thí sinh: <strong>{candidateName}</strong> • Mã đề: <strong>{currentExamPaper.examCode}</strong>
              </p>

              {/* Score Display */}
              <div className="flex items-center justify-center gap-6 py-3 border-y border-current">
                <div>
                  <div className="text-xs uppercase font-bold">Số câu đúng</div>
                  <div className="text-2xl font-black">{correctCount} / 50</div>
                </div>
                <div className="w-px h-10 bg-current opacity-40" />
                <div>
                  <div className="text-xs uppercase font-bold">Điểm tổng kết</div>
                  <div className="text-4xl font-black text-amber-500 font-mono">
                    {finalScore} <span className="text-base text-current">/ 10.0</span>
                  </div>
                </div>
              </div>

              {/* Awarded High-Tier Egg Showcase (Minimum King!) */}
              {awardedEgg && (
                <div className="p-4 rounded-xl border border-current bg-neutral-500/10 space-y-2 text-left">
                  <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-amber-500">
                    <Sparkles className="w-4 h-4" />
                    <span>PHẦN THƯỞNG TUYỂN SINH ĐÃ ĐƯỢC TRAO (THẤP NHẤT LÀ TRỨNG KING):</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
                    <div>
                      <div className="font-black text-base">{awardedEgg.unitTitle}</div>
                      <div className="text-xs opacity-80">
                        Đã tự động cộng <strong>+{awardedCrystals} Pha Lê Rồng 💎</strong> vào tài khoản và chuyển quả trứng vào Lò Ấp!
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg border-2 border-current font-black text-xs shrink-0">
                      ĐÃ LƯU VÀO LÒ ẤP 🥚
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Answer Key & Full Grammar Breakdown Review */}
            <div className="space-y-4">
              <h4 className="font-black text-base uppercase border-b pb-1 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>ĐÁP ÁN CHI TIẾT &amp; GIẢI THÍCH NGỮ PHÁP 50 CÂU:</span>
              </h4>

              <div className="space-y-3 font-sans text-xs">
                {currentExamPaper.questions.map((q) => {
                  const userAns = userAnswers[q.questionNumber];
                  const isCorrect = userAns === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-xl border ${
                        isCorrect
                          ? 'border-emerald-600 bg-emerald-950/20'
                          : 'border-rose-600 bg-rose-950/20'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1 font-serif text-sm">
                        <span>Câu {q.questionNumber}:</span>
                        <span className={isCorrect ? 'text-emerald-500' : 'text-rose-500'}>
                          {isCorrect ? '✓ ĐÚNG (+0.2đ)' : `✗ SAI (Bạn chọn: ${userAns || 'Chưa chọn'} | Đáp án đúng: ${q.correctAnswer})`}
                        </span>
                      </div>
                      <div className="font-serif mb-1">{q.questionText}</div>
                      <div className="text-[11px] opacity-90 p-2 rounded bg-neutral-500/10 border border-current/20">
                        <strong>Giải thích:</strong> {q.explanationVi}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setExamStatus('intro')}
                className="px-6 py-2.5 rounded-xl border border-current font-bold text-xs uppercase cursor-pointer hover:bg-neutral-500/10 transition-colors"
              >
                Thi Lại / Đổi Giai Đoạn Khác
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border-2 border-current bg-current text-white font-black text-xs uppercase cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: paperTheme === 'bw-light' ? '#000' : '#fff',
                  color: paperTheme === 'bw-light' ? '#fff' : '#000',
                }}
              >
                Đóng &amp; Vào Lò Ấp Nhận Trứng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
