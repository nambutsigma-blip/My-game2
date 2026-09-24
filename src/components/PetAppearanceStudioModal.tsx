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
  Award,
  Feather,
  Sun,
  Wand2,
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
  PetParticleStyle,
  PetAuraIntensity,
} from '../types';
import { PokemonPetVisual, getDefaultAppearance } from './PokemonPetVisual';
import { playSuccessChime, playEnchantSound, playEggHatch } from '../utils/soundEffects';

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

// Preset Element Palettes
const PRESET_PALETTES = [
  { name: '🔥 Hỏa Diễm Rực Rỡ', primary: '#ef4444', secondary: '#f59e0b', eye: '#fde047', aura: 'flames' as PetAuraEffect, particle: 'embers' as PetParticleStyle },
  { name: '❄️ Lam Băng Cực Hàn', primary: '#0284c7', secondary: '#38bdf8', eye: '#bae6fd', aura: 'ice_crystals' as PetAuraEffect, particle: 'stars' as PetParticleStyle },
  { name: '⚡ Lôi Điện Hoàng Kim', primary: '#eab308', secondary: '#facc15', eye: '#fef08a', aura: 'sparks' as PetAuraEffect, particle: 'lightning' as PetParticleStyle },
  { name: '🟣 Hư Vô Thần Bí', primary: '#6b21a8', secondary: '#c084fc', eye: '#e9d5ff', aura: 'dark_matter' as PetAuraEffect, particle: 'embers' as PetParticleStyle },
  { name: '🌿 Lục Bảo Rừng Thiêng', primary: '#059669', secondary: '#34d399', eye: '#a7f3d0', aura: 'nature_leaves' as PetAuraEffect, particle: 'petals' as PetParticleStyle },
  { name: '🌌 Tinh Vân Vũ Trụ', primary: '#7e22ce', secondary: '#ec4899', eye: '#f472b6', aura: 'supernova' as PetAuraEffect, particle: 'stars' as PetParticleStyle },
  { name: '👑 Thần Thánh Hoàng Kim', primary: '#d97706', secondary: '#fde047', eye: '#ffffff', aura: 'divine_matrix' as PetAuraEffect, particle: 'stars' as PetParticleStyle },
  { name: '🌑 Hắc Ám Dạ Xoa', primary: '#0f172a', secondary: '#475569', eye: '#f43f5e', aura: 'dark_matter' as PetAuraEffect, particle: 'embers' as PetParticleStyle },
  { name: '🌊 Thủy Tinh Hải Thần', primary: '#0284c7', secondary: '#67e8f9', eye: '#a5f3fc', aura: 'ice_crystals' as PetAuraEffect, particle: 'bubbles' as PetParticleStyle },
  { name: '🌸 Anh Đào Tinh Linh', primary: '#db2777', secondary: '#f472b6', eye: '#fbcfe8', aura: 'nature_leaves' as PetAuraEffect, particle: 'petals' as PetParticleStyle },
  { name: '🪶 Bạch Hạc Tiên Cảnh', primary: '#475569', secondary: '#e2e8f0', eye: '#38bdf8', aura: 'starlight' as PetAuraEffect, particle: 'feathers' as PetParticleStyle },
  { name: '☢️ Cyber Neon Matrix', primary: '#059669', secondary: '#22d3ee', eye: '#67e8f9', aura: 'sparks' as PetAuraEffect, particle: 'lightning' as PetParticleStyle },
];

// 1-Click Mythic Skin Sets
const MYTHIC_SKIN_SETS: {
  id: string;
  name: string;
  icon: string;
  desc: string;
  appearance: Partial<PetAppearance>;
}[] = [
  {
    id: 'sovereign_dragon_god',
    name: 'Long Thần Viễn Cổ',
    icon: '🐉',
    desc: 'Chúa tể loài rồng với cặp sừng hoàng kim và ma trận mặt trời',
    appearance: {
      archetype: 'ancient_dragon',
      primaryColor: '#b45309',
      secondaryColor: '#f59e0b',
      eyeGlowColor: '#fef08a',
      pattern: 'divine_crest',
      headAccessory: 'dragon_horns',
      backWing: 'dragon_wings',
      auraEffect: 'divine_matrix',
      auraIntensity: 'godlike',
      particleStyle: 'embers',
      costumeTitle: 'Long Thần Tối Cao',
    },
  },
  {
    id: 'cyberpunk_mech_striker',
    name: 'Chiến Thần Cơ Giáp',
    icon: '🤖',
    desc: 'Cơ giáp tương lai với động cơ phản lực plasma và mạch điện neon',
    appearance: {
      archetype: 'mecha',
      primaryColor: '#0284c7',
      secondaryColor: '#38bdf8',
      eyeGlowColor: '#22d3ee',
      pattern: 'lightning_circuit',
      headAccessory: 'cyber_visor',
      backWing: 'celestial_mech_thrusters',
      auraEffect: 'sparks',
      auraIntensity: 'hyper',
      particleStyle: 'lightning',
      costumeTitle: 'Cơ Giáp Lôi Thần',
    },
  },
  {
    id: 'celestial_kitsune_fairy',
    name: 'Cửu Vĩ Linh Hồ Tiên',
    icon: '🦊',
    desc: 'Cáo thần 9 đuôi khoác mặt nạ trừ tà và cánh bướm tinh linh lấp lánh',
    appearance: {
      archetype: 'kitsune',
      primaryColor: '#e11d48',
      secondaryColor: '#fb7185',
      eyeGlowColor: '#fda4af',
      pattern: 'stars',
      headAccessory: 'fox_mask',
      backWing: 'butterfly_prism_wings',
      auraEffect: 'starlight',
      auraIntensity: 'radiant',
      particleStyle: 'petals',
      costumeTitle: 'Cửu Vĩ Tiên Hồ',
    },
  },
  {
    id: 'immortal_solar_phoenix',
    name: 'Phượng Hoàng Bất Diệt',
    icon: '🔥',
    desc: 'Hoả điểu thái cổ với đôi cánh lửa bùng cháy và vương miện lửa thần',
    appearance: {
      archetype: 'phoenix',
      primaryColor: '#c2410c',
      secondaryColor: '#facc15',
      eyeGlowColor: '#fef08a',
      pattern: 'stripes',
      headAccessory: 'flame_tiara',
      backWing: 'phoenix_flame_wings',
      auraEffect: 'flames',
      auraIntensity: 'hyper',
      particleStyle: 'embers',
      costumeTitle: 'Bất Diệt Hỏa Phượng',
    },
  },
  {
    id: 'imperial_sun_lion',
    name: 'Hoàng Kim Sư Thần',
    icon: '🦁',
    desc: 'Sư tử hoàng tộc bờm vàng rực lửa, cánh thiên sứ và vương miện đế vương',
    appearance: {
      archetype: 'divine_lion',
      primaryColor: '#d97706',
      secondaryColor: '#fde047',
      eyeGlowColor: '#ffffff',
      pattern: 'divine_crest',
      headAccessory: 'crown',
      backWing: 'angel_feathers',
      auraEffect: 'supernova',
      auraIntensity: 'godlike',
      particleStyle: 'stars',
      costumeTitle: 'Hoàng Kim Sư Thần',
    },
  },
  {
    id: 'void_abyssal_overlord',
    name: 'Chúa Tể Hư Vô Vực Thẳm',
    icon: '🟣',
    desc: 'Thần thể vũ trụ khoác áo choàng bóng tối và lốc xoáy vật chất tối',
    appearance: {
      archetype: 'celestial',
      primaryColor: '#581c87',
      secondaryColor: '#3b82f6',
      eyeGlowColor: '#c084fc',
      pattern: 'cosmic_nebula',
      headAccessory: 'halo',
      backWing: 'void_shadow_cape',
      auraEffect: 'dark_matter',
      auraIntensity: 'godlike',
      particleStyle: 'embers',
      costumeTitle: 'Chúa Tể Hư Vô',
    },
  },
  {
    id: 'glacial_frostwyrm',
    name: 'Băng Long Bắc Cực',
    icon: '❄️',
    desc: 'Cực hàn băng long đội mũ chiến giáp Valkyrie và pha lê băng lơ lửng',
    appearance: {
      archetype: 'dragon',
      primaryColor: '#0284c7',
      secondaryColor: '#38bdf8',
      eyeGlowColor: '#bae6fd',
      pattern: 'scales',
      headAccessory: 'valkyrie_helm',
      backWing: 'butterfly_prism_wings',
      auraEffect: 'ice_crystals',
      auraIntensity: 'hyper',
      particleStyle: 'stars',
      costumeTitle: 'Băng Long Thần Vương',
    },
  },
  {
    id: 'radiant_pegasus_seraph',
    name: 'Thiên Mã Quang Minh',
    icon: '🪽',
    desc: 'Ngựa thần có sừng vàng phát quang, sải cánh thiên sứ trắng buốt và hào quang',
    appearance: {
      archetype: 'pegasus',
      primaryColor: '#4338ca',
      secondaryColor: '#818cf8',
      eyeGlowColor: '#c7d2fe',
      pattern: 'runes',
      headAccessory: 'halo',
      backWing: 'angel_feathers',
      auraEffect: 'starlight',
      auraIntensity: 'radiant',
      particleStyle: 'feathers',
      costumeTitle: 'Thiên Mã Thánh Sứ',
    },
  },
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

  // Active Draft Appearance State
  const [draftApp, setDraftApp] = useState<PetAppearance>(() => {
    if (!activePet) {
      return {
        archetype: 'dragon',
        primaryColor: '#ef4444',
        secondaryColor: '#f59e0b',
        eyeGlowColor: '#facc15',
        pattern: 'none',
        headAccessory: 'none',
        backWing: 'none',
        auraEffect: 'none',
        auraIntensity: 'radiant',
        particleStyle: 'none',
      };
    }
    return activePet.appearance || getDefaultAppearance(activePet);
  });

  // Track changes when selected pet changes
  const handleSelectPet = (petId: string) => {
    setSelectedPetId(petId);
    const p = petList.find((item) => item.id === petId);
    if (p) {
      setDraftApp(p.appearance || getDefaultAppearance(p));
      playEggHatch();
    }
  };

  // Preview controls
  const [previewFacing, setPreviewFacing] = useState<'front' | 'back'>('front');
  const [previewCombatState, setPreviewCombatState] = useState<'idle' | 'attack' | 'hit' | 'special' | 'victory'>('idle');
  const [activeTab, setActiveTab] = useState<'sets' | 'archetype' | 'colors' | 'accessories' | 'wings' | 'patterns' | 'aura' | 'title'>('sets');
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
    const archetypes: PetArchetype[] = [
      'ancient_dragon',
      'dragon',
      'divine_lion',
      'pegasus',
      'wolf',
      'phoenix',
      'shadow_phoenix',
      'tiger',
      'kitsune',
      'leviathan',
      'behemoth',
      'mecha',
      'celestial',
    ];
    const patterns: PetPattern[] = ['none', 'stripes', 'runes', 'scales', 'stars', 'lightning_circuit', 'cosmic_nebula', 'divine_crest', 'tiger_stripes_gold'];
    const heads: PetHeadAccessory[] = ['none', 'crown', 'dragon_horns', 'valkyrie_helm', 'pharaoh_crown', 'cyber_headset', 'cyber_visor', 'ninja_band', 'wizard_hat', 'fox_mask', 'halo', 'flame_tiara', 'flower_wreath'];
    const wings: PetBackWing[] = ['none', 'dragon_wings', 'phoenix_flame_wings', 'angel_feathers', 'void_shadow_cape', 'celestial_mech_thrusters', 'energy_blades', 'butterfly_prism_wings', 'fairy_wings'];
    const auras: PetAuraEffect[] = ['none', 'flames', 'frost', 'sparks', 'void', 'starlight', 'supernova', 'divine_matrix', 'ice_crystals', 'dark_matter', 'nature_leaves'];
    const particles: PetParticleStyle[] = ['none', 'sparks', 'feathers', 'petals', 'stars', 'lightning', 'bubbles', 'embers'];
    const intensities: PetAuraIntensity[] = ['subtle', 'radiant', 'hyper', 'godlike'];

    const randomPalette = PRESET_PALETTES[Math.floor(Math.random() * PRESET_PALETTES.length)];
    const randomArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    const randomHead = heads[Math.floor(Math.random() * heads.length)];
    const randomWing = wings[Math.floor(Math.random() * wings.length)];
    const randomAura = auras[Math.floor(Math.random() * auras.length)];
    const randomParticle = particles[Math.floor(Math.random() * particles.length)];
    const randomIntensity = intensities[Math.floor(Math.random() * intensities.length)];

    setDraftApp({
      archetype: randomArchetype,
      primaryColor: randomPalette.primary,
      secondaryColor: randomPalette.secondary,
      eyeGlowColor: randomPalette.eye,
      pattern: randomPattern,
      headAccessory: randomHead,
      backWing: randomWing,
      auraEffect: randomAura,
      auraIntensity: randomIntensity,
      particleStyle: randomParticle,
      customSkinName: randomPalette.name,
      costumeTitle: `Thần Thú ${activePet.name}`,
    });
    playSuccessChime();
  };

  // Apply Mythic Preset Set
  const handleApplyMythicSet = (set: typeof MYTHIC_SKIN_SETS[0]) => {
    setDraftApp((prev) => ({
      ...prev,
      ...set.appearance,
      customSkinName: set.name,
    }));
    playEnchantSound();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
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
      particleCount: 65,
      spread: 80,
      origin: { y: 0.6 },
    });
    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
    }, 2800);
  };

  const handleResetToDefault = () => {
    if (!activePet) return;
    setDraftApp(getDefaultAppearance(activePet));
    playSuccessChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border-2 border-amber-500/70 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 bg-slate-950/95">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-rose-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-950/60 ring-2 ring-amber-400/30">
              ✨
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Studio Nâng Cấp Ngoại Hình Pet</span>
                <span className="text-amber-400 font-extrabold hidden md:inline">• Visual Evolution 2.0</span>
              </h3>
              <p className="text-xs text-slate-400">
                Tùy biến hình thể, màu sắc, mắt thần, cánh thần, nón giáp, hoa văn và hiệu ứng hạt hào quang cho linh thú.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPvP && (
              <button
                onClick={onOpenPvP}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>⚔️ Vào Võ Đài PvP</span>
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
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Chọn Linh Thú:</span>
            <select
              value={selectedPetId}
              onChange={(e) => handleSelectPet(e.target.value)}
              className="bg-slate-900 text-amber-300 font-bold text-xs py-1.5 px-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {petList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.avatarIcon} {p.name} (Lv.{p.level || 1} • {p.element.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="px-3 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
              title="Tạo ngẫu nhiên phong cách thần thoại"
            >
              <Dices className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Phối Ngẫu Nhiên</span>
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
          {/* Left Column: Live Pet Preview Stage (5 cols) */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col items-center justify-between">
            {/* Stage Backdrop and Pet Graphic */}
            <div className="w-full flex-1 min-h-[280px] flex flex-col items-center justify-center relative rounded-2xl bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-950 border border-slate-800 p-4 overflow-hidden">
              {/* Stadium platform ring */}
              <div className="absolute bottom-6 w-52 h-16 rounded-[100%] bg-gradient-to-t from-emerald-950/70 via-slate-800/80 to-transparent border-2 border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.25)] pointer-events-none" />

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
                  showTitleBadge={true}
                />
              </div>

              {/* Pet Info Tag Badge */}
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/80 text-[11px] font-bold flex items-center gap-1.5 shadow-md">
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
                <span>{previewFacing === 'front' ? 'Góc Trước' : 'Góc Sau'}</span>
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
          <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between space-y-3.5">
            {/* Tabs Row */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              {[
                { id: 'sets', label: '🌟 Bộ Skin', color: 'from-amber-500 to-yellow-600' },
                { id: 'archetype', label: '🐲 Dáng Thú', color: 'from-amber-500 to-amber-600' },
                { id: 'colors', label: '🎨 Màu & Mắt', color: 'from-rose-500 to-rose-600' },
                { id: 'accessories', label: '👑 Mũ Nón', color: 'from-yellow-500 to-amber-600' },
                { id: 'wings', label: '🪽 Đôi Cánh', color: 'from-cyan-500 to-blue-600' },
                { id: 'patterns', label: '✨ Hoa Văn', color: 'from-indigo-500 to-purple-600' },
                { id: 'aura', label: '⚡ Hào Quang', color: 'from-purple-500 to-pink-600' },
                { id: 'title', label: '🏷️ Danh Hiệu', color: 'from-emerald-500 to-teal-600' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all text-center cursor-pointer ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-slate-950 font-black shadow`
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="space-y-3 min-h-[290px]">
              {/* TAB 0: 1-CLICK MYTHIC SKIN SETS */}
              {activeTab === 'sets' && (
                <div className="space-y-2.5">
                  <div className="text-xs text-slate-300 font-bold flex items-center justify-between">
                    <span>Áp dụng 1 chạm các Bộ Trang Phục Thần Thoại Độc Quyền:</span>
                    <span className="text-amber-400 font-extrabold text-[10px]">8 Sets</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {MYTHIC_SKIN_SETS.map((set) => (
                      <button
                        key={set.id}
                        onClick={() => handleApplyMythicSet(set)}
                        className="p-3 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 hover:from-slate-900 hover:to-slate-800 border border-slate-800 hover:border-amber-500/60 text-left transition-all cursor-pointer group shadow-sm flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {set.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black text-amber-300 group-hover:text-amber-200 truncate">
                            {set.name}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                            {set.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 1: ARCHETYPE (DÁNG THÚ) */}
              {activeTab === 'archetype' && (
                <div className="space-y-2.5">
                  <div className="text-xs text-slate-300 font-bold flex items-center justify-between">
                    <span>Chọn mô hình hình thể gốc (Species Archetype):</span>
                    <span className="text-amber-400 uppercase font-black text-[10px]">{draftApp.archetype}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {[
                      { id: 'ancient_dragon' as PetArchetype, name: 'Long Thần Cổ Đại', icon: '🐉', desc: 'Râu rồng, sừng rồng hoàng kim' },
                      { id: 'dragon' as PetArchetype, name: 'Hỏa Long', icon: '🐲', desc: 'Rồng dũng mãnh, sừng nhọn' },
                      { id: 'divine_lion' as PetArchetype, name: 'Sư Tử Hoàng Kim', icon: '🦁', desc: 'Bờm vàng rực lửa quyền uy' },
                      { id: 'pegasus' as PetArchetype, name: 'Thiên Mã', icon: '🪽', desc: 'Ngựa thần sừng vàng bay bổng' },
                      { id: 'phoenix' as PetArchetype, name: 'Phượng Hoàng', icon: '🦅', desc: 'Chim lửa mào rực rỡ' },
                      { id: 'shadow_phoenix' as PetArchetype, name: 'Hắc Phượng Hoàng', icon: '🐦‍⬛', desc: 'Lửa địa ngục u ám' },
                      { id: 'wolf' as PetArchetype, name: 'Sói Bão Lôi', icon: '🐺', desc: 'Sói nhanh nhẹn, tai nhọn' },
                      { id: 'tiger' as PetArchetype, name: 'Bạch Hổ Thần', icon: '🐅', desc: 'Hổ uy quyền, vuốt sắc' },
                      { id: 'kitsune' as PetArchetype, name: 'Cáo Kitsune', icon: '🦊', desc: 'Cáo ma thuật, ấn ngọc' },
                      { id: 'leviathan' as PetArchetype, name: 'Thủy Quái Hải Vương', icon: '🐋', desc: 'Giao long đáy biển sâu' },
                      { id: 'behemoth' as PetArchetype, name: 'Cự Thú Cổ Đại', icon: '🦣', desc: 'Khổng tượng ngà đá kiên cố' },
                      { id: 'turtle' as PetArchetype, name: 'Huyền Vũ', icon: '🐢', desc: 'Thần quy phòng ngự vững vàng' },
                      { id: 'serpent' as PetArchetype, name: 'Rắn Thần', icon: '🐍', desc: 'Mãng xà lướt nhẹ' },
                      { id: 'mecha' as PetArchetype, name: 'Cơ Khí Mecha', icon: '🤖', desc: 'Robot giáp tương lai' },
                      { id: 'celestial' as PetArchetype, name: 'Sáng Thế Tối Cao', icon: '👑', desc: 'Vương giả thần giới' },
                    ].map((arch) => (
                      <button
                        key={arch.id}
                        onClick={() => {
                          setDraftApp((prev) => ({ ...prev, archetype: arch.id }));
                          playEggHatch();
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          draftApp.archetype === arch.id
                            ? 'bg-amber-500/20 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xl mb-1">{arch.icon}</div>
                        <div className="text-xs font-bold text-white">{arch.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{arch.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: COLORS, EYE GLOW & PALETTES */}
              {activeTab === 'colors' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold">1. Bảng màu nguyên tố mẫu (Presets):</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {PRESET_PALETTES.map((pal, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDraftApp((prev) => ({
                            ...prev,
                            primaryColor: pal.primary,
                            secondaryColor: pal.secondary,
                            eyeGlowColor: pal.eye,
                            auraEffect: pal.aura,
                            particleStyle: pal.particle,
                            customSkinName: pal.name,
                          }));
                          playSuccessChime();
                        }}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 text-left transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="truncate">
                          <div className="text-[11px] font-bold text-white truncate">{pal.name}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-3 h-3 rounded-full border border-slate-700 shadow" style={{ backgroundColor: pal.primary }} />
                            <span className="w-3 h-3 rounded-full border border-slate-700 shadow" style={{ backgroundColor: pal.secondary }} />
                            <span className="w-3 h-3 rounded-full border border-slate-700 shadow" style={{ backgroundColor: pal.eye }} title="Mắt" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-xs text-slate-300 font-bold mb-2">2. Tùy chỉnh màu chi tiết & Mắt Thần:</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Màu Thân</div>
                          <div className="font-mono text-[11px] font-bold text-white">{draftApp.primaryColor}</div>
                        </div>
                        <input
                          type="color"
                          value={draftApp.primaryColor}
                          onChange={(e) => setDraftApp((prev) => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Màu Điểm Nhấn</div>
                          <div className="font-mono text-[11px] font-bold text-white">{draftApp.secondaryColor}</div>
                        </div>
                        <input
                          type="color"
                          value={draftApp.secondaryColor}
                          onChange={(e) => setDraftApp((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-amber-300 font-bold uppercase">Mắt Thần</div>
                          <div className="font-mono text-[11px] font-bold text-white">{draftApp.eyeGlowColor || '#facc15'}</div>
                        </div>
                        <input
                          type="color"
                          value={draftApp.eyeGlowColor || '#facc15'}
                          onChange={(e) => setDraftApp((prev) => ({ ...prev, eyeGlowColor: e.target.value }))}
                          className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: HEAD ACCESSORIES (MŨ NÓN & PHỤ KIỆN) */}
              {activeTab === 'accessories' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold">Trang bị phụ kiện đầu & nón chiến giáp:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {[
                      { id: 'none' as PetHeadAccessory, name: 'Không Đội', icon: '❌' },
                      { id: 'dragon_horns' as PetHeadAccessory, name: 'Sừng Rồng Thần', icon: '🪸' },
                      { id: 'crown' as PetHeadAccessory, name: 'Vương Miện Quán Quân', icon: '👑' },
                      { id: 'valkyrie_helm' as PetHeadAccessory, name: 'Mũ Giáp Valkyrie', icon: '🛡️' },
                      { id: 'pharaoh_crown' as PetHeadAccessory, name: 'Vương Miện Pharaoh', icon: '🏺' },
                      { id: 'flame_tiara' as PetHeadAccessory, name: 'Vương Miện Lửa Thần', icon: '🔥' },
                      { id: 'fox_mask' as PetHeadAccessory, name: 'Mặt Nạ Kitsune', icon: '🎭' },
                      { id: 'cyber_headset' as PetHeadAccessory, name: 'Tai Nghe Neon Cyber', icon: '🎧' },
                      { id: 'cyber_visor' as PetHeadAccessory, name: 'Kính Cyberpunk', icon: '🕶️' },
                      { id: 'ninja_band' as PetHeadAccessory, name: 'Băng Đeo Shinobi', icon: '🥋' },
                      { id: 'wizard_hat' as PetHeadAccessory, name: 'Nón Phù Thủy Tối Cao', icon: '🧙' },
                      { id: 'halo' as PetHeadAccessory, name: 'Vòng Hào Quang Thần', icon: '💫' },
                      { id: 'horns' as PetHeadAccessory, name: 'Sừng Quỷ Hoàng Kim', icon: '🤘' },
                      { id: 'flower_wreath' as PetHeadAccessory, name: 'Vòng Hoa Thần Rừng', icon: '🌸' },
                    ].map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setDraftApp((prev) => ({ ...prev, headAccessory: acc.id }));
                          playSuccessChime();
                        }}
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

              {/* TAB 4: WINGS & CAPES (ĐÔI CÁNH & ÁO CHOÀNG) */}
              {activeTab === 'wings' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold">Trang bị đôi cánh bay lượn & áo choàng thần thoại:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {[
                      { id: 'none' as PetBackWing, name: 'Không Cánh', icon: '🐾', desc: 'Đấu sĩ di chuyển mặt đất' },
                      { id: 'phoenix_flame_wings' as PetBackWing, name: 'Cánh Lửa Phượng Hoàng', icon: '🔥', desc: 'Lửa thần bùng cháy rực rỡ' },
                      { id: 'dragon_wings' as PetBackWing, name: 'Cánh Rồng Thần Uy', icon: '🪽', desc: 'Màng cánh rồng to lớn vẫy' },
                      { id: 'angel_feathers' as PetBackWing, name: 'Cánh Thiên Sứ Tuyết', icon: '🕊️', desc: 'Lông vũ trắng tinh khiết' },
                      { id: 'void_shadow_cape' as PetBackWing, name: 'Áo Choàng Hư Vô', icon: '🟣', desc: 'Áo choàng bóng tối bồng bềnh' },
                      { id: 'celestial_mech_thrusters' as PetBackWing, name: 'Động Cơ Phản Lực', icon: '🚀', desc: 'Ống phóng plasma tương lai' },
                      { id: 'butterfly_prism_wings' as PetBackWing, name: 'Cánh Bướm Pha Lê', icon: '💎', desc: 'Pha lê quang phổ óng ánh' },
                      { id: 'energy_blades' as PetBackWing, name: 'Lưỡi Dao Plasma', icon: '⚡', desc: 'Cánh năng lượng công nghệ' },
                      { id: 'fairy_wings' as PetBackWing, name: 'Cánh Tiên Nữ', icon: '🦋', desc: 'Cánh bướm mộng mơ nhẹ nhàng' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setDraftApp((prev) => ({ ...prev, backWing: w.id }));
                          playSuccessChime();
                        }}
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

              {/* TAB 5: PATTERNS (HOA VĂN & ẤN KÝ) */}
              {activeTab === 'patterns' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold">Chọn hoa văn & ấn ký cổ đại in trên thân thú:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {[
                      { id: 'none' as PetPattern, name: 'Tinh Khiết', icon: '⚪', desc: 'Mặt phẳng mượt mà thuần khiết' },
                      { id: 'lightning_circuit' as PetPattern, name: 'Mạch Điện Lôi Điệp', icon: '⚡', desc: 'Đường dẫn vi mạch neon' },
                      { id: 'divine_crest' as PetPattern, name: 'Ấn Ký Mặt Trời', icon: '☀️', desc: 'Biểu tượng thái dương thần thánh' },
                      { id: 'cosmic_nebula' as PetPattern, name: 'Tinh Vân Ngân Hà', icon: '🌌', desc: 'Bụi sao tinh cầu lấp lánh' },
                      { id: 'tiger_stripes_gold' as PetPattern, name: 'Vằn Hoàng Hổ', icon: '🐅', desc: 'Vết vằn hoàng kim phát quang' },
                      { id: 'runes' as PetPattern, name: 'Cổ Ngữ Ma Thuật', icon: '✨', desc: 'Vòng ký tự chú ấn thần bí' },
                      { id: 'scales' as PetPattern, name: 'Vảy Rồng Thần', icon: '🛡️', desc: 'Lớp vảy bảo giáp xếp tầng' },
                      { id: 'stripes' as PetPattern, name: 'Vằn Sọc Chiến Trận', icon: '🐾', desc: 'Sọc vằn đấu sĩ truyền thống' },
                      { id: 'stars' as PetPattern, name: 'Ngôi Sao Triệu Hồi', icon: '⭐', desc: 'Chòm sao hộ mệnh' },
                    ].map((pat) => (
                      <button
                        key={pat.id}
                        onClick={() => {
                          setDraftApp((prev) => ({ ...prev, pattern: pat.id }));
                          playSuccessChime();
                        }}
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

              {/* TAB 6: AURA, INTENSITY & PARTICLES (HÀO QUANG & HIỆU ỨNG HẠT) */}
              {activeTab === 'aura' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold">1. Hiệu ứng Hào Quang (Aura):</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {[
                      { id: 'none' as PetAuraEffect, name: 'Tắt Hào Quang', icon: '⚪' },
                      { id: 'supernova' as PetAuraEffect, name: 'Siêu Tân Tinh', icon: '🪐' },
                      { id: 'divine_matrix' as PetAuraEffect, name: 'Trận Pháp Thần', icon: '☀️' },
                      { id: 'ice_crystals' as PetAuraEffect, name: 'Pha Lê Hàn Băng', icon: '💎' },
                      { id: 'dark_matter' as PetAuraEffect, name: 'Vật Chất Tối', icon: '🕳️' },
                      { id: 'flames' as PetAuraEffect, name: 'Lửa Hỏa Ngục', icon: '🔥' },
                      { id: 'sparks' as PetAuraEffect, name: 'Tia Sét Lôi Điện', icon: '⚡' },
                      { id: 'nature_leaves' as PetAuraEffect, name: 'Lá Rừng Thái Sơ', icon: '🍃' },
                    ].map((aur) => (
                      <button
                        key={aur.id}
                        onClick={() => setDraftApp((prev) => ({ ...prev, auraEffect: aur.id }))}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          draftApp.auraEffect === aur.id
                            ? 'bg-purple-500/20 border-purple-500 shadow-md ring-2 ring-purple-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-lg mb-0.5">{aur.icon}</div>
                        <div className="text-[10px] font-bold text-white truncate">{aur.name}</div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3">
                    {/* Aura Intensity */}
                    <div>
                      <div className="text-xs text-slate-300 font-bold mb-1.5">2. Độ rực rỡ (Aura Intensity):</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['subtle', 'radiant', 'hyper', 'godlike'] as PetAuraIntensity[]).map((level) => (
                          <button
                            key={level}
                            onClick={() => setDraftApp((prev) => ({ ...prev, auraIntensity: level }))}
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              (draftApp.auraIntensity || 'radiant') === level
                                ? 'bg-amber-500 text-slate-950 font-black shadow'
                                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                            }`}
                          >
                            {level === 'subtle' ? 'Nhẹ Nhàng' : level === 'radiant' ? 'Rực Rỡ' : level === 'hyper' ? 'Cực Đại' : '👑 Thần Cấp'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Particle Style */}
                    <div>
                      <div className="text-xs text-slate-300 font-bold mb-1.5">3. Hạt khí bay (Particles):</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'none' as PetParticleStyle, name: 'Tắt', icon: '⚪' },
                          { id: 'petals' as PetParticleStyle, name: 'Cánh Hoa', icon: '🌸' },
                          { id: 'feathers' as PetParticleStyle, name: 'Lông Vũ', icon: '🪶' },
                          { id: 'stars' as PetParticleStyle, name: 'Bụi Sao', icon: '✨' },
                          { id: 'lightning' as PetParticleStyle, name: 'Tia Sét', icon: '⚡' },
                          { id: 'embers' as PetParticleStyle, name: 'Tàn Lửa', icon: '🔥' },
                        ].map((part) => (
                          <button
                            key={part.id}
                            onClick={() => setDraftApp((prev) => ({ ...prev, particleStyle: part.id }))}
                            className={`py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center ${
                              (draftApp.particleStyle || 'none') === part.id
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 border shadow'
                                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                            }`}
                          >
                            {part.icon} {part.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: COSTUME TITLE BADGE */}
              {activeTab === 'title' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-bold">Gắn danh hiệu huy hiệu nổi trên đầu linh thú:</div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Danh hiệu hiển thị:</label>
                    <input
                      type="text"
                      maxLength={30}
                      value={draftApp.costumeTitle || ''}
                      onChange={(e) => setDraftApp((prev) => ({ ...prev, costumeTitle: e.target.value }))}
                      placeholder="Ví dụ: Long Thần Tối Cao, Cơ Giáp Bão Lôi..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                    />
                    <div className="text-[10px] text-slate-500">
                      Danh hiệu này sẽ bay lơ lửng trên đầu Pet trong các trận đấu PvP và giao diện sảnh chính!
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-400 font-bold">Gợi ý danh hiệu huyền thoại:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '👑 Chúa Tể Hư Vô',
                        '🔥 Long Thần Viễn Cổ',
                        '⚡ Cơ Giáp Lôi Thần',
                        '🕊️ Thiên Mã Quang Minh',
                        '🦊 Cửu Vĩ Tiên Hồ',
                        '❄️ Băng Long Thần Vương',
                        '🦁 Hoàng Kim Sư Thần',
                        '🌸 Tinh Linh Rừng Thiêng',
                        '💎 Chiến Binh Thủy Quái',
                      ].map((presetTitle) => (
                        <button
                          key={presetTitle}
                          onClick={() => {
                            setDraftApp((prev) => ({ ...prev, costumeTitle: presetTitle }));
                            playSuccessChime();
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-[10px] font-bold text-amber-200 hover:text-white cursor-pointer transition-colors"
                        >
                          {presetTitle}
                        </button>
                      ))}
                      <button
                        onClick={() => setDraftApp((prev) => ({ ...prev, costumeTitle: undefined }))}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white cursor-pointer"
                      >
                        ❌ Gỡ Danh Hiệu
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400 truncate">
                {saveSuccessNotice ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-bounce">
                    <Check className="w-4 h-4" /> Đã lưu ngoại hình thần cấp cho {activePet.name}!
                  </span>
                ) : (
                  <span>Ngoại hình này sẽ hiển thị ở Đấu trường PvP, Võ Đài và Sảnh Chính.</span>
                )}
              </div>

              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/60 cursor-pointer active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
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
