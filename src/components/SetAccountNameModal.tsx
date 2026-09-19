import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Edit3,
  Sparkles,
  Check,
  Dice5,
  Award,
  Save,
  Shield,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime, playLaser } from '../utils/soundEffects';
import { PetCompanion } from '../types';

interface SetAccountNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSaveName: (newName: string) => Promise<void> | void;
  userEmail?: string;
  photoURL?: string;
  dragonCrystals?: number;
  bestPet?: PetCompanion | null;
}

const COOL_NICKNAMES = [
  'Nam Sigma',
  'Bậc Thầy Trộm Trứng',
  'Thợ Săn Rồng Thiêng',
  'Shadow Thief',
  'Dragon Slayer',
  'Apex Explorer',
  'Phoenix Master',
  'Mystic Whisperer',
  'Chiến Binh Lửa',
  'Huyền Thoại B1',
  'Dragon Whisperer',
  'Vua Trộm Trứng',
  'Cosmic Ranger',
  'Storm Bringer',
];

const TITLES = [
  { id: 'explorer', name: 'Nhà Thám Hiểm', icon: '🧭', color: 'text-amber-300 border-amber-500/40 bg-amber-950/40' },
  { id: 'master', name: 'Bậc Thầy B1', icon: '🎓', color: 'text-indigo-300 border-indigo-500/40 bg-indigo-950/40' },
  { id: 'hunter', name: 'Thợ Săn Rồng', icon: '🐉', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40' },
  { id: 'thief', name: 'Trộm Trứng Huyền Thoại', icon: '🥚', color: 'text-rose-300 border-rose-500/40 bg-rose-950/40' },
  { id: 'champion', name: 'Quán Quân Võ Đài', icon: '⚔️', color: 'text-purple-300 border-purple-500/40 bg-purple-950/40' },
];

export const SetAccountNameModal: React.FC<SetAccountNameModalProps> = ({
  isOpen,
  onClose,
  currentName,
  onSaveName,
  userEmail,
  photoURL,
  dragonCrystals = 450,
  bestPet,
}) => {
  const [nameInput, setNameInput] = useState(currentName || 'Nhà Thám Hiểm');
  const [selectedTitle, setSelectedTitle] = useState(TITLES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNameInput(currentName || 'Nhà Thám Hiểm');
      setErrorMsg('');
      setIsSaving(false);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleRandomize = () => {
    const randomName = COOL_NICKNAMES[Math.floor(Math.random() * COOL_NICKNAMES.length)];
    setNameInput(randomName);
    setErrorMsg('');
    playLaser();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setErrorMsg('Vui lòng nhập tên tài khoản.');
      return;
    }
    if (trimmed.length < 2) {
      setErrorMsg('Tên tài khoản phải có ít nhất 2 ký tự.');
      return;
    }
    if (trimmed.length > 25) {
      setErrorMsg('Tên tài khoản không được vượt quá 25 ký tự.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg('');
      await onSaveName(trimmed);
      playSuccessChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi lưu tên tài khoản.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden">
        {/* Header decoration glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-amber-500/20 to-transparent blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-1.5">
                <span>Đặt Tên Tài Khoản</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Tên hiển thị hồ sơ, đấu trường PvP và danh sách trực tuyến
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 my-4 relative z-10">
          {/* Input field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Nhập Tên / Biệt Danh Nhà Thám Hiểm</span>
              </label>
              <button
                type="button"
                onClick={handleRandomize}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors bg-amber-950/40 hover:bg-amber-900/50 px-2 py-0.5 rounded-lg border border-amber-500/30"
              >
                <Dice5 className="w-3.5 h-3.5" />
                <span>Gợi ý tên</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                maxLength={25}
                placeholder="Ví dụ: Nam Sigma, DragonMaster..."
                className="w-full bg-slate-950 text-white font-bold text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all placeholder:text-slate-500 pr-12"
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-500">
                {nameInput.length}/25
              </span>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <span>⚠️ {errorMsg}</span>
              </p>
            )}
          </div>

          {/* Title / Badge selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Danh Hiệu Danh Dự</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
              {TITLES.map((title) => (
                <button
                  type="button"
                  key={title.id}
                  onClick={() => setSelectedTitle(title)}
                  className={`p-2 rounded-xl text-left text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    selectedTitle.id === title.id
                      ? `${title.color} ring-1 ring-amber-400 shadow-sm`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{title.icon}</span>
                  <span className="truncate">{title.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Hồ Sơ Của Bạn Trong Game:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sẵn Sàng
              </span>
            </div>

            <div className="flex items-center gap-3">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Avatar"
                  className="w-11 h-11 rounded-full border-2 border-amber-500 object-cover shadow"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-lg flex items-center justify-center shadow">
                  {(nameInput.trim() || 'N').charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white truncate">
                    {nameInput.trim() || 'Nhà Thám Hiểm'}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full border bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold shrink-0 flex items-center gap-0.5">
                    {selectedTitle.icon} {selectedTitle.name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-purple-300 font-semibold flex items-center gap-0.5">
                    💎 {dragonCrystals.toLocaleString()}
                  </span>
                  {bestPet && (
                    <span className="text-slate-300 font-medium truncate">
                      • Pet: {bestPet.name} (Lv.{bestPet.level || 1})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {userEmail && (
              <div className="text-[10px] text-slate-500 truncate border-t border-slate-900 pt-1">
                Liên kết tài khoản Google: {userEmail}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang Lưu...' : 'Lưu Tên Tài Khoản'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
