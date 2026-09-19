import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Palette,
  Crown,
  Dices,
  RotateCcw,
  Eye,
  Check,
  Zap,
  Flame,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PetCompanion,
  PetAppearance,
  PetArchetype,
  PetPattern,
  PetHeadAccessory,
  PetBackWing,
  PetAuraEffect,
} from '../types';
import { PokemonPetVisual, getDefaultAppearance } from './PokemonPetVisual';
import { playSuccessChime, playEnchantSound } from '../utils/soundEffects';

interface PetAppearanceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets?: PetCompanion[];
  hatchedPets?: PetCompanion[];
  onSaveAppearance?: (petId: string, appearance: PetAppearance) => void;
  onUpdatePetAppearance?: (petId: string, appearance: PetAppearance) => void;
  initialPetId?: string;
  initialSelectedPetId?: string;
  onOpenPvP?: () => void;
}

const PRESET_PALETTES = [
  { name: '🔥 Hỏa Diễm Rực Rỡ', primary: '#ef4444', secondary: '#f59e0b', aura: 'flames' as PetAuraEffect },
  { name: '❄️ Lam Băng Cực Hàn', primary: '#0284c7', secondary: '#38bdf8', aura: 'frost' as PetAuraEffect },
  { name: '⚡ Lôi Điện Hoàng Kim', primary: '#eab308', secondary: '#facc15', aura: 'sparks' as PetAuraEffect },
  { name: '🟣 Hư Vô Thần Bí', primary: '#7c3aed', secondary: '#c084fc', aura: 'void' as PetAuraEffect },
  { name: '🌿 Lục Bảo Rừng Thiêng', primary: '#059669', secondary: '#34d399', aura: 'nature_leaves' as PetAuraEffect },
  { name: '🌌 Tinh Vân Vũ Trụ', primary: '#ec4899', secondary: '#8b5cf6', aura: 'starlight' as PetAuraEffect },
  { name: '👑 Thần Thánh Hoàng Kim', primary: '#d97706', secondary: '#fde047', aura: 'starlight' as PetAuraEffect },
  { name: '🌑 Hắc Ám Dạ Xoa', primary: '#1e293b', secondary: '#64748b', aura: 'void' as PetAuraEffect },
  { name: '🌊 Thủy Tinh Hải Thần', primary: '#0284c7', secondary: '#67e8f9', aura: 'frost' as PetAuraEffect },
];

export const PetAppearanceStudioModal: React.FC<PetAppearanceStudioModalProps> = ({
  isOpen,
  onClose,
  pets,
  hatchedPets,
  onSaveAppearance,
  onUpdatePetAppearance,
  initialPetId,
  initialSelectedPetId,
  onOpenPvP,
}) => {
  const petList = pets || hatchedPets || [];
  const targetInitId = initialPetId || initialSelectedPetId;

  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    if (targetInitId && petList.some((p) => p.id === targetInitId)) {
      return targetInitId;
    }
    return petList[0]?.id || '';
  });

  const activePet = petList.find((p) => p.id === selectedPetId) || petList[0];

  // Active Draft Appearance
  const [draftApp, setDraftApp] = useState<PetAppearance>(() => {
    if (!activePet) {
      return {
        archetype: 'dragon',
        primaryColor: '#ef4444',
        secondaryColor: '#f59e0b',
        pattern: 'none',
        headAccessory: 'none',
        backWing: 'none',
        auraEffect: 'none',
      };
    }
    return activePet.appearance || getDefaultAppearance(activePet);
  });

  // Track changes when pet changes
  const handleSelectPet = (petId: string) => {
    setSelectedPetId(petId);
    const p = petList.find((item) => item.id === petId);
    if (p) {
      setDraftApp(p.appearance || getDefaultAppearance(p));
    }
  };

  // Preview options
  const [previewFacing, setPreviewFacing] = useState<'front' | 'back'>('front');
  const [previewCombatState, setPreviewCombatState] = useState<'idle' | 'attack' | 'hit' | 'special' | 'victory'>('idle');
  const [activeTab, setActiveTab] = useState<'archetype' | 'colors' | 'patterns' | 'accessories' | 'wings' | 'aura'>('archetype');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  if (!isOpen) return null;

  if (petList.length === 0 || !activePet) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-center space-y-4 text-white shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
            🥚
          </div>
          <h3 className="text-lg font-bold text-amber-300">Chưa Có Linh Thú Để Tùy Biến</h3>
          <p className="text-xs text-slate-300">
            Bạn chưa ấp nở linh thú nào. Hãy hoàn thành các màn trộm trứng và ấp trứng trong Nhà Ấp để sở hữu linh thú đầu tiên!
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer"
          >
            Đã Hiểu & Quay Lại
          </button>
        </div>
      </div>
    );
  }

  // Randomize generator
  const handleRandomize = () => {
    const archetypes: PetArchetype[] = ['dragon', 'wolf', 'phoenix', 'tiger', 'kitsune', 'turtle', 'serpent', 'mecha', 'celestial'];
    const patterns: PetPattern[] = ['none', 'stripes', 'runes', 'scales', 'stars'];
    const heads: PetHeadAccessory[] = ['none', 'crown', 'horns', 'ninja_band', 'wizard_hat', 'cyber_visor', 'halo', 'flower_wreath'];
    const wings: PetBackWing[] = ['none', 'dragon_wings', 'angel_feathers', 'energy_blades', 'fairy_wings'];
    const auras: PetAuraEffect[] = ['none', 'flames', 'frost', 'sparks', 'void', 'starlight', 'nature_leaves'];

    const randomPalette = PRESET_PALETTES[Math.floor(Math.random() * PRESET_PALETTES.length)];
    const randomArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    const randomHead = heads[Math.floor(Math.random() * heads.length)];
    const randomWing = wings[Math.floor(Math.random() * wings.length)];
    const randomAura = auras[Math.floor(Math.random() * auras.length)];

    setDraftApp({
      archetype: randomArchetype,
      primaryColor: randomPalette.primary,
      secondaryColor: randomPalette.secondary,
      pattern: randomPattern,
      headAccessory: randomHead,
      backWing: randomWing,
      auraEffect: randomAura,
      customSkinName: randomPalette.name,
    });
    playSuccessChime();
  };

  const handleSave = () => {
    if (!activePet) return;
    if (onSaveAppearance) {
      onSaveAppearance(activePet.id, draftApp);
    }
    if (onUpdatePetAppearance) {
      onUpdatePetAppearance(activePet.id, draftApp);
    }
    playEnchantSound();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
    }, 2500);
  };

  const handleResetToDefault = () => {
    if (!activePet) return;
    setDraftApp(getDefaultAppearance(activePet));
    playSuccessChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-rose-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-950/60">
              🎨
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Xưởng Tạo Ngoại Hình Pet</span>
                <span className="text-amber-400 font-bold hidden md:inline">• Pet Visual Studio</span>
              </h3>
              <p className="text-xs text-slate-400">
                Tùy biến hình dáng, màu sắc, hoa văn, mũ nón và hiệu ứng hào quang cho thú cưng chiến đấu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPvP && (
              <button
                onClick={onOpenPvP}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>⚔️ Vào Đấu Trường Pet</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pet Selection Bar */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Chọn Pet:</span>
            <select
              value={selectedPetId}
              onChange={(e) => handleSelectPet(e.target.value)}
              className="bg-slate-900 text-amber-300 font-bold text-xs py-1 px-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {petList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.avatarIcon} {p.name} (Lv. {p.level || 1} • {p.element.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
              title="Tạo ngẫu nhiên phong cách siêu ngầu"
            >
              <Dices className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Ngẫu Nhiên</span>
            </button>

            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Mặc Định</span>
            </button>
          </div>
        </div>

        {/* Main Body: Stage (Left) & Controls (Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Live 3D Pokemon Preview Stage (5 cols) */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col items-center justify-between">
            {/* Stage Backdrop and Pet Graphic */}
            <div className="w-full flex-1 min-h-[260px] flex flex-col items-center justify-center relative rounded-2xl bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950 border border-slate-800/80 p-4 overflow-hidden">
              {/* Stadium platform ring */}
              <div className="absolute bottom-6 w-48 h-16 rounded-[100%] bg-gradient-to-t from-emerald-950/60 to-slate-800/80 border-2 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] pointer-events-none" />

              {/* The Pokemon Creature */}
              <div className="relative z-10">
                <PokemonPetVisual
                  pet={activePet}
                  overrideAppearance={draftApp}
                  size="battle-front"
                  facing={previewFacing}
                  combatState={previewCombatState}
                  showAura={true}
                  showShadow={true}
                />
              </div>

              {/* Pet Info Tag Badge */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/80 text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                <span>{activePet.avatarIcon}</span>
                <span className="text-white">{activePet.name}</span>
                <span className="text-amber-400 font-extrabold">Lv.{activePet.level || 1}</span>
              </div>

              {/* Facing angle toggle badge */}
              <button
                onClick={() => setPreviewFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
                className="absolute top-3 right-3 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-xl border border-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow"
              >
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>{previewFacing === 'front' ? 'Góc Nhìn Trước' : 'Góc Chiến Đấu (Sau)'}</span>
              </button>
            </div>

            {/* Animation testing strip */}
            <div className="w-full mt-3 space-y-1.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                Thử Nghiệm Động Tác Chiến Đấu
              </div>
              <div className="grid grid-cols-5 gap-1">
                {(['idle', 'attack', 'hit', 'special', 'victory'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setPreviewCombatState(st)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer capitalize ${
                      previewCombatState === st
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st === 'idle' ? 'Thở' : st === 'attack' ? 'Tấn Công' : st === 'hit' ? 'Bị Đánh' : st === 'special' ? 'Vận Công' : 'Thắng'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Customization Tabs (7 cols) */}
          <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between space-y-4">
            {/* Tabs Row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab('archetype')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                  activeTab === 'archetype'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🐲 Dáng Thú
              </button>
              <button
                onClick={() => setActiveTab('colors')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                  activeTab === 'colors'
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎨 Màu Sắc
              </button>
              <button
                onClick={() => setActiveTab('patterns')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                  activeTab === 'patterns'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ✨ Hoa Văn
              </button>
              <button
                onClick={() => setActiveTab('accessories')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                  activeTab === 'accessories'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                👑 Mũ Nón
              </button>
              <button
                onClick={() => setActiveTab('wings')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                  activeTab === 'wings'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🪽 Đôi Cánh
              </button>
              <button
                onClick={() => setActiveTab('aura')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                  activeTab === 'aura'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Hào Quang
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-3 min-h-[260px]">
              {/* TAB 1: ARCHETYPE (DÁNG THÚ) */}
              {activeTab === 'archetype' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold flex items-center justify-between">
                    <span>Chọn mô hình hình thể gốc (Pet Species Form):</span>
                    <span className="text-amber-400 uppercase font-black text-[10px]">{draftApp.archetype}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'dragon' as PetArchetype, name: 'Hỏa Long', icon: '🐉', desc: 'Rồng dũng mãnh, sừng nhọn' },
                      { id: 'wolf' as PetArchetype, name: 'Sói Lôi', icon: '🐺', desc: 'Sói nhanh nhẹn, tai nhọn' },
                      { id: 'phoenix' as PetArchetype, name: 'Phượng Hoàng', icon: '🦅', desc: 'Chim lửa mào rực rỡ' },
                      { id: 'tiger' as PetArchetype, name: 'Bạch Hổ', icon: '🐅', desc: 'Hổ uy quyền, tai tròn' },
                      { id: 'kitsune' as PetArchetype, name: 'Cáo Kitsune', icon: '🦊', desc: 'Cáo ma thuật, ấn ngọc' },
                      { id: 'turtle' as PetArchetype, name: 'Huyền Vũ', icon: '🐢', desc: 'Thần quy phòng ngự' },
                      { id: 'serpent' as PetArchetype, name: 'Rắn Thần', icon: '🐍', desc: 'Giao long biển cả' },
                      { id: 'mecha' as PetArchetype, name: 'Cơ Khí Mecha', icon: '🤖', desc: 'Robot giáp tương lai' },
                      { id: 'celestial' as PetArchetype, name: 'Sáng Thế', icon: '👑', desc: 'Vương giả tối cao' },
                    ].map((arch) => (
                      <button
                        key={arch.id}
                        onClick={() => setDraftApp((prev) => ({ ...prev, archetype: arch.id }))}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          draftApp.archetype === arch.id
                            ? 'bg-amber-500/20 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">{arch.icon}</div>
                        <div className="text-xs font-bold text-white">{arch.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{arch.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: COLORS & PALETTES (MÀU SẮC) */}
              {activeTab === 'colors' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold">1. Bảng màu nguyên tố mẫu (Presets):</div>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_PALETTES.map((pal, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          setDraftApp((prev) => ({
                            ...prev,
                            primaryColor: pal.primary,
                            secondaryColor: pal.secondary,
                            auraEffect: pal.aura,
                            customSkinName: pal.name,
                          }))
                        }
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 text-left transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="text-[11px] font-bold text-white truncate">{pal.name}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow" style={{ backgroundColor: pal.primary }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow" style={{ backgroundColor: pal.secondary }} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-xs text-slate-300 font-bold mb-2">2. Tùy chỉnh mã màu thủ công (Hex):</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Màu Thân Chính</div>
                          <div className="font-mono text-xs font-bold text-white">{draftApp.primaryColor}</div>
                        </div>
                        <input
                          type="color"
                          value={draftApp.primaryColor}
                          onChange={(e) => setDraftApp((prev) => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Màu Điểm Nhấn / Bụng</div>
                          <div className="font-mono text-xs font-bold text-white">{draftApp.secondaryColor}</div>
                        </div>
                        <input
                          type="color"
                          value={draftApp.secondaryColor}
                          onChange={(e) => setDraftApp((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PATTERNS (HOA VĂN) */}
              {activeTab === 'patterns' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold">Chọn hoa văn in trên thân thú:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'none' as PetPattern, name: 'Tinh Khiết (None)', icon: '⚪', desc: 'Mặt phẳng mượt mà' },
                      { id: 'stripes' as PetPattern, name: 'Vằn Hổ Sấm Sét', icon: '🐅', desc: 'Vết vằn hoang dã' },
                      { id: 'runes' as PetPattern, name: 'Cổ Ngữ Phát Sáng', icon: '✨', desc: 'Vòng ký tự ma thuật' },
                      { id: 'scales' as PetPattern, name: 'Vảy Rồng Thần', icon: '🛡️', desc: 'Lớp vảy xếp tầng' },
                      { id: 'stars' as PetPattern, name: 'Tinh Tú Vũ Trụ', icon: '⭐', desc: 'Chấm sao ngân hà' },
                    ].map((pat) => (
                      <button
                        key={pat.id}
                        onClick={() => setDraftApp((prev) => ({ ...prev, pattern: pat.id }))}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          draftApp.pattern === pat.id
                            ? 'bg-indigo-500/20 border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xl mb-1">{pat.icon}</div>
                        <div className="text-xs font-bold text-white">{pat.name}</div>
                        <div className="text-[10px] text-slate-400">{pat.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: HEAD ACCESSORIES (MŨ NÓN) */}
              {activeTab === 'accessories' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold">Trang bị phụ kiện đầu & nón:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'none' as PetHeadAccessory, name: 'Không Đội', icon: '❌' },
                      { id: 'crown' as PetHeadAccessory, name: 'Vương Miện Quán Quân', icon: '👑' },
                      { id: 'horns' as PetHeadAccessory, name: 'Sừng Rồng Hoàng Kim', icon: '🪸' },
                      { id: 'ninja_band' as PetHeadAccessory, name: 'Băng Đeo Shinobi', icon: '🥋' },
                      { id: 'wizard_hat' as PetHeadAccessory, name: 'Nón Phù Thủy Tối Cao', icon: '🧙' },
                      { id: 'cyber_visor' as PetHeadAccessory, name: 'Kính Cyber Neon', icon: '🕶️' },
                      { id: 'halo' as PetHeadAccessory, name: 'Vòng Hào Quang Thần', icon: '💫' },
                      { id: 'flower_wreath' as PetHeadAccessory, name: 'Vòng Hoa Thần Rừng', icon: '🌸' },
                    ].map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setDraftApp((prev) => ({ ...prev, headAccessory: acc.id }))}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          draftApp.headAccessory === acc.id
                            ? 'bg-amber-500/20 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">{acc.icon}</div>
                        <div className="text-[11px] font-bold text-white truncate">{acc.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: WINGS (ĐÔI CÁNH) */}
              {activeTab === 'wings' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold">Trang bị đôi cánh bay lượn:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'none' as PetBackWing, name: 'Không Cánh', icon: '🐾', desc: 'Đấu sĩ di chuyển mặt đất' },
                      { id: 'dragon_wings' as PetBackWing, name: 'Cánh Rồng Thần Uy', icon: '🪽', desc: 'Màng cánh rồng to lớn vẫy' },
                      { id: 'angel_feathers' as PetBackWing, name: 'Cánh Thiên Sứ Tuyết', icon: '🕊️', desc: 'Lông vũ trắng tinh khiết' },
                      { id: 'energy_blades' as PetBackWing, name: 'Lưỡi Dao Plasma', icon: '⚡', desc: 'Cánh năng lượng công nghệ' },
                      { id: 'fairy_wings' as PetBackWing, name: 'Cánh Bướm Tinh Linh', icon: '🦋', desc: 'Cánh tiên nữ lấp lánh' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        onClick={() => setDraftApp((prev) => ({ ...prev, backWing: w.id }))}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          draftApp.backWing === w.id
                            ? 'bg-cyan-500/20 border-cyan-500 shadow-md ring-2 ring-cyan-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">{w.icon}</div>
                        <div className="text-xs font-bold text-white">{w.name}</div>
                        <div className="text-[10px] text-slate-400">{w.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: AURA (HÀO QUANG) */}
              {activeTab === 'aura' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold">Hiệu ứng hào quang tỏa sáng xung quanh:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'none' as PetAuraEffect, name: 'Tắt Hào Quang', icon: '⚪', desc: 'Không tỏa hạt năng lượng' },
                      { id: 'flames' as PetAuraEffect, name: 'Lửa Hỏa Ngục', icon: '🔥', desc: 'Tàn lửa bốc cháy cuồn cuộn' },
                      { id: 'frost' as PetAuraEffect, name: 'Hàn Băng Tinh Thể', icon: '❄️', desc: 'Bông tuyết băng giá xoay quanh' },
                      { id: 'sparks' as PetAuraEffect, name: 'Tia Sét Lôi Điện', icon: '⚡', desc: 'Chùm điện cao thế giật liên hồi' },
                      { id: 'void' as PetAuraEffect, name: 'Lốc Xoáy Hư Vô', icon: '🟣', desc: 'Sương mù bóng tối sâu thẳm' },
                      { id: 'starlight' as PetAuraEffect, name: 'Bụi Sao Ngân Hà', icon: '✨', desc: 'Bụi kim cương phát sáng' },
                      { id: 'nature_leaves' as PetAuraEffect, name: 'Lá Rừng Thái Sơ', icon: '🍃', desc: 'Lá phong linh thiêng xoay vòng' },
                    ].map((aur) => (
                      <button
                        key={aur.id}
                        onClick={() => setDraftApp((prev) => ({ ...prev, auraEffect: aur.id }))}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          draftApp.auraEffect === aur.id
                            ? 'bg-purple-500/20 border-purple-500 shadow-md ring-2 ring-purple-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">{aur.icon}</div>
                        <div className="text-xs font-bold text-white">{aur.name}</div>
                        <div className="text-[10px] text-slate-400">{aur.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                {saveSuccessNotice ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-bounce">
                    <Check className="w-4 h-4" /> Đã lưu ngoại hình cho {activePet.name}!
                  </span>
                ) : (
                  <span>Ngoại hình này sẽ hiển thị ở Đấu trường PvP, Ổ Trứng và Sảnh Chính.</span>
                )}
              </div>

              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/60 cursor-pointer active:scale-95 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>LƯU NGOẠI HÌNH PET 💾</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
