import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Lock,
  CheckCircle2,
  Search,
  Swords,
  Shield,
  Heart,
  Flame,
  Zap,
  Star,
  ChevronRight,
  HelpCircle,
  EyeOff,
  Crown,
  Palette,
  Clock,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetCompanion, StolenEgg, CreatureRarity, CreatureClassification, EggTierType } from '../types';
import {
  CREATURES_CATALOG,
  RARITY_TIERS,
  CLASSIFICATION_INFO,
  ENCHANTMENT_CONFIGS,
  getRarityConfig,
  getClassificationConfig,
  getEnchantmentConfig,
} from '../data/creaturesData';
import { calculatePetStats } from '../data/arenaData';
import { playMythicFanfare, playEnchantSound, playLaser, playEvolutionSound } from '../utils/soundEffects';
import {
  getEvolutionRequirements,
  getEvolutionStatComparison,
  getEvolvedPetForm,
  getNextRarity,
  getEvolvedIcon,
} from '../utils/petEvolution';
import { EvolvedPetSprite } from './EvolvedPetSprite';
import { PetEvolutionModal } from './PetEvolutionModal';
import { CelestialEvolutionBurst } from './CelestialEvolutionBurst';

interface HatcheryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stolenEggs: StolenEgg[];
  hatchedPets: PetCompanion[];
  onEggHatched: (eggId: string, pet: PetCompanion) => void;
  onOpenArena?: () => void;
  onOpenSkillTree?: () => void;
  dragonCrystals: number;
  onEnchantPet: (petId: string) => boolean;
  hatchBonusRate?: number;
  hatchRebate?: number;
  onAddDragonCrystals?: (amount: number) => void;
  onSellPet?: (petId: string) => void;
  onClaimFreeGift?: () => void;
  hasClaimedFreeGift?: boolean;
  onOpenAppearanceStudio?: (petId?: string) => void;
  onOpenPokemonPvP?: () => void;
  onEvolvePet?: (petId: string) => PetCompanion | null;
  onLevelUpPet?: (petId: string, levels?: number) => void;
}

// Visual configuration and distinct aesthetics for each egg tier
export const getEggConfig = (type: EggTierType) => {
  switch (type) {
    case 'king_of_god':
      return {
        name: 'Trứng Vạn Thần Chi Vương',
        englishName: 'King of Gods Sovereign Egg',
        tierRank: 'Tier 15 (Đỉnh Phong Vô Thượng)',
        emoji: '👑🌌⚡',
        badgeBg: 'bg-gradient-to-r from-purple-700 via-amber-400 to-rose-600 text-slate-950 font-black',
        border: 'border-2 border-amber-300 shadow-2xl shadow-purple-600/70 ring-2 ring-purple-500/50',
        oddsHint: 'Tỉ Lệ: King of God (85%), God (15%)',
        accentColor: '#c084fc',
        gradientStyle: 'from-purple-950 via-slate-950 to-amber-700',
        description: 'Quả trứng cổ đại tối thượng kết tinh từ hỗn mang sơ khai và hư vô vĩnh hằng, mang ấn ký vương quyền của vạn vị thần.',
      };
    case 'god':
      return {
        name: 'Trứng Sáng Thế Tối Cao',
        englishName: 'Omniverse God Egg',
        tierRank: 'Tier 14 (Tối Cao)',
        emoji: '👑⚡🌌',
        badgeBg: 'bg-gradient-to-r from-amber-400 via-purple-600 to-cyan-400 text-slate-950 font-black',
        border: 'border-2 border-yellow-300 shadow-xl shadow-yellow-500/40',
        oddsHint: 'Tỉ Lệ: King of God (5%), God (52%), Deity (23%), Titan (10%), King (5%), Secret (5%)',
        accentColor: '#facc15',
        gradientStyle: 'from-amber-400 via-purple-700 to-cyan-500',
        description: 'Quả trứng đọng lại từ vụ nổ Big Bang sơ khai, bao quanh bởi trường hào quang vũ trụ vạn hoa.',
      };
    case 'deity':
      return {
        name: 'Trứng Thần Linh Thượng Giới',
        englishName: 'Empyrean Deity Egg',
        tierRank: 'Tier 13 (Thần Linh)',
        emoji: '🕊️💫🪽',
        badgeBg: 'bg-gradient-to-r from-cyan-400 via-indigo-600 to-purple-600 text-white font-black',
        border: 'border-2 border-cyan-300 shadow-lg shadow-cyan-500/40',
        oddsHint: 'Tỉ Lệ: Deity (45%), Titan (20%), Cosmic (18%), King (12%), Secret (3%), God (2%)',
        accentColor: '#38bdf8',
        gradientStyle: 'from-cyan-300 via-indigo-500 to-purple-800',
        description: 'Vỏ trứng tinh khiết như ngọc thượng giới, được bảo hộ bởi sáu đôi cánh thiên sứ tỏa bụi sao.',
      };
    case 'titan':
      return {
        name: 'Trứng Nham Thạch Cổ Đại',
        englishName: 'Ancient Titan Egg',
        tierRank: 'Tier 12 (Khổng Lồ)',
        emoji: '🗿🌋⚡',
        badgeBg: 'bg-gradient-to-r from-stone-900 via-amber-950 to-orange-950 text-orange-200 border border-orange-500',
        border: 'border-2 border-orange-500 shadow-lg shadow-orange-600/30',
        oddsHint: 'Tỉ Lệ: Titan (40%), Cosmic (22%), Eternal (17%), King (15%), Deity (3.5%), God (0.6%)',
        accentColor: '#f97316',
        gradientStyle: 'from-stone-800 via-amber-950 to-orange-900',
        description: 'Hóa thạch đá bazan ngàn năm với những vết nứt dung nham nóng chảy rực lửa và tia chớp địa chấn.',
      };
    case 'king':
      return {
        name: 'Trứng Vương Giả Hoàng Triều',
        englishName: 'Imperial King Egg',
        tierRank: 'Tier 11 (Đế Vương)',
        emoji: '👑🦁⚜️',
        badgeBg: 'bg-gradient-to-r from-amber-600 via-red-600 to-yellow-500 text-yellow-100 border border-yellow-300',
        border: 'border-2 border-yellow-400 shadow-lg shadow-yellow-500/30',
        oddsHint: 'Tỉ Lệ: King (35%), Eternal (20%), Cosmic (18%), Ultimate (19%), Titan (5%), Deity (1.2%)',
        accentColor: '#eab308',
        gradientStyle: 'from-amber-400 via-red-700 to-yellow-600',
        description: 'Mang vương miện hoàng gia dát vàng nạm ngọc hồng lựu, biểu trưng cho quyền lực tối thượng của long tộc.',
      };
    case 'golden':
      return {
        name: 'Trứng Rồng Hoàng Kim',
        englishName: 'Golden Solar Egg',
        tierRank: 'Hoàn Hảo 10/10',
        emoji: '🥚🔥✨',
        badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/50',
        border: 'border-2 border-amber-500/70 shadow-lg shadow-amber-950/40',
        oddsHint: 'Cực Hiếm: God (0.1%), Deity (0.5%), Titan (1.5%), King (3.5%), Secret (1.0%), Cosmic/Eternal',
        accentColor: '#f59e0b',
        gradientStyle: 'from-yellow-300 via-amber-500 to-red-800',
        description: 'Tỏa ánh kim quang rực rỡ với vảy rồng dát vàng và cổ ngữ lửa rực cháy.',
      };
    case 'silver':
      return {
        name: 'Trứng Rồng Băng Ngân',
        englishName: 'Silver Frost Egg',
        tierRank: 'Thành Tích 8-9/10',
        emoji: '🥚❄️💎',
        badgeBg: 'bg-teal-500/20 text-teal-300 border border-teal-500/50',
        border: 'border-2 border-teal-500/60 shadow-md shadow-teal-950/30',
        oddsHint: 'Tỉ Lệ: Rare (48%), Uncommon (30%), Epic (20%), Legendary (2%)',
        accentColor: '#2dd4bf',
        gradientStyle: 'from-slate-200 via-cyan-400 to-teal-800',
        description: 'Được bao phủ bởi một lớp tinh thể băng vĩnh cửu ánh bạc lạnh giá tỏa khói sương.',
      };
    case 'common':
    default:
      return {
        name: 'Trứng Rồng Bích Ngọc',
        englishName: 'Speckled Jade Egg',
        tierRank: 'Nhập Môn',
        emoji: '🥚🌿🍃',
        badgeBg: 'bg-slate-800 text-slate-300 border border-slate-700',
        border: 'border-2 border-emerald-700/60 shadow-md shadow-emerald-950/30',
        oddsHint: 'Tỉ Lệ: Common (60%), Uncommon (35%), Rare (5%)',
        accentColor: '#10b981',
        gradientStyle: 'from-emerald-700 via-emerald-800 to-slate-900',
        description: 'Vỏ ngọc bích mịn màng lấm chấm đốm rêu rừng già, nhịp đập phôi thai nhẹ nhàng.',
      };
  }
};

// Rich Visual Illustration for Eggs of Different Tiers
export const EggVisualGraphic: React.FC<{
  type: EggTierType;
  size?: 'sm' | 'md' | 'lg';
  isCracking?: boolean;
}> = ({ type, size = 'md', isCracking = false }) => {
  const cfg = getEggConfig(type);

  const sizeClasses = {
    sm: 'w-11 h-14 text-lg',
    md: 'w-16 h-20 text-2xl',
    lg: 'w-24 h-32 text-4xl',
  }[size];

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      {/* Outer Glow Halo */}
      <div
        className={`absolute inset-0 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] blur-md opacity-70 transition-all ${
          type === 'god' || type === 'deity' ? 'animate-pulse' : ''
        }`}
        style={{ backgroundColor: cfg.accentColor }}
      />

      {/* Main Egg Shell */}
      <div
        className={`relative ${sizeClasses} rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] bg-gradient-to-b ${cfg.gradientStyle} border-2 ${
          cfg.border
        } flex items-center justify-center overflow-hidden transition-transform shadow-xl ${
          isCracking ? 'animate-bounce scale-105' : 'hover:scale-105'
        }`}
      >
        {/* Tier-Specific Shell Textures & Glyphs */}
        {type === 'king_of_god' && (
          <>
            {/* Imperial Divine Crown & Cosmic Singularity */}
            <div className="absolute -top-1.5 text-[15px] sm:text-[18px] z-20 drop-shadow-lg animate-bounce">
              👑
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,215,0,0.9),transparent_65%)] mix-blend-overlay animate-pulse" />
            <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent top-1/2 -rotate-45 blur-[0.5px] animate-spin" />
            <span className="relative z-10 text-xl drop-shadow-md select-none">🌌</span>
          </>
        )}

        {type === 'god' && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_60%)] mix-blend-overlay" />
            <div className="absolute w-full h-0.5 bg-yellow-300/80 top-1/2 -rotate-12 blur-[1px] animate-spin" />
            <span className="relative z-10 drop-shadow-md select-none">🌌</span>
          </>
        )}

        {type === 'deity' && (
          <>
            <div className="absolute -top-1 w-8 h-2 rounded-full border border-cyan-200/90 bg-cyan-300/30 blur-[0.5px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.7),transparent_70%)]" />
            <span className="relative z-10 drop-shadow-md select-none">🪽</span>
          </>
        )}

        {type === 'titan' && (
          <>
            {/* Magma Fissures */}
            <div className="absolute inset-0 opacity-80 pointer-events-none">
              <div className="w-full h-full bg-[linear-gradient(45deg,transparent_45%,#ea580c_50%,transparent_55%)] opacity-90 animate-pulse" />
              <div className="w-full h-full bg-[linear-gradient(-45deg,transparent_40%,#ef4444_48%,transparent_56%)] opacity-80" />
            </div>
            <span className="relative z-10 drop-shadow-md select-none">🌋</span>
          </>
        )}

        {type === 'king' && (
          <>
            {/* Imperial Crown on Egg Crest */}
            <div className="absolute top-1 text-[13px] sm:text-[15px] z-20 drop-shadow">👑</div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(254,240,138,0.6),transparent_60%)]" />
            <span className="relative z-10 mt-2 drop-shadow-md select-none">🦁</span>
          </>
        )}

        {type === 'golden' && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(255,255,255,0.7),transparent_50%)]" />
            <span className="relative z-10 drop-shadow-md select-none">🔥</span>
          </>
        )}

        {type === 'silver' && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_60%)]" />
            <span className="relative z-10 drop-shadow-md select-none">❄️</span>
          </>
        )}

        {type === 'common' && (
          <>
            {/* Speckles */}
            <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-950/60 top-3 left-2" />
            <div className="absolute w-2 h-2 rounded-full bg-emerald-950/50 bottom-4 right-3" />
            <div className="absolute w-1 h-1 rounded-full bg-emerald-950/60 top-6 right-2" />
            <span className="relative z-10 drop-shadow-md select-none">🌿</span>
          </>
        )}

        {/* Cracking Fracture Lines Overlay */}
        {isCracking && (
          <div className="absolute inset-0 bg-white/30 backdrop-invert-20 flex items-center justify-center animate-pulse z-30">
            <span className="text-white font-black text-xl">⚡</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const HatcheryModal: React.FC<HatcheryModalProps> = ({
  isOpen,
  onClose,
  stolenEggs,
  hatchedPets,
  onEggHatched,
  onOpenArena,
  onOpenSkillTree,
  dragonCrystals,
  onEnchantPet,
  hatchBonusRate = 0,
  hatchRebate = 0,
  onAddDragonCrystals,
  onAdminUnlockAllPets,
  onSellPet,
  onClaimFreeGift,
  hasClaimedFreeGift = false,
  onOpenAppearanceStudio,
  onOpenPokemonPvP,
  onEvolvePet,
  onLevelUpPet,
}) => {
  const [activeTab, setActiveTab] = useState<'eggs' | 'pets' | 'enchant' | 'evolve' | 'bestiary'>('eggs');
  const [selectedEgg, setSelectedEgg] = useState<StolenEgg | null>(null);
  const [isHatching, setIsHatching] = useState(false);
  const [justHatchedPet, setJustHatchedPet] = useState<PetCompanion | null>(null);
  const [inspectPet, setInspectPet] = useState<PetCompanion | null>(null);
  const [confirmSellId, setConfirmSellId] = useState<string | null>(null);

  // Enchantment Shrine State
  const [selectedEnchantPetId, setSelectedEnchantPetId] = useState<string>(
    hatchedPets[0]?.id || ''
  );
  const [enchantSuccessFlash, setEnchantSuccessFlash] = useState(false);

  // Evolution State (Rarity Evolution & 5-Star Transcendence)
  const [selectedEvolvePetId, setSelectedEvolvePetId] = useState<string>(
    hatchedPets[0]?.id || ''
  );
  const [preEvolutionPet, setPreEvolutionPet] = useState<PetCompanion | null>(null);
  const [isRarityEvolutionActive, setIsRarityEvolutionActive] = useState<boolean>(false);
  const [evolutionPet, setEvolutionPet] = useState<PetCompanion | null>(null);
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [isPetEvolving, setIsPetEvolving] = useState(false);
  const [evolvingPet, setEvolvingPet] = useState<PetCompanion | null>(null);

  // Bestiary filters
  const [bestiaryFilterClass, setBestiaryFilterClass] = useState<CreatureClassification | 'all'>('all');
  const [bestiaryFilterRarity, setBestiaryFilterRarity] = useState<string>('all');
  const [bestiarySearch, setBestiarySearch] = useState<string>('');

  if (!isOpen) return null;

  // Track which creatures in catalog have been unlocked
  const hatchedIdsSet = new Set(hatchedPets.map((p) => p.name));
  const hasHatchedAnySecret = hatchedPets.some((p) => p.rarity === 'secret');

  // Filtered creatures for Bestiary view:
  // USER INTENT: "bây gioằ mấy con cấp secret ẩn hết đi, nó là bí mật mà"
  // If a creature is secret or the Secret Entity and the user hasn't hatched it, it is 100% HIDDEN from the bestiary!
  const filteredBestiary = CREATURES_CATALOG.filter((c) => {
    if ((c.rarity === 'secret' || c.name === 'Secret Entity') && !hatchedIdsSet.has(c.name)) {
      return false; // Conceal unhatched secret creatures and Secret Entity entirely!
    }
    if (bestiaryFilterClass !== 'all' && c.classification !== bestiaryFilterClass) {
      return false;
    }
    if (bestiaryFilterRarity !== 'all' && c.rarity !== bestiaryFilterRarity) {
      return false;
    }
    if (bestiarySearch.trim() !== '') {
      const q = bestiarySearch.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchBuff = c.buffDescription.toLowerCase().includes(q);
      const matchHabitat = (c.habitat || '').toLowerCase().includes(q);
      const matchElement = (c.element || '').toLowerCase().includes(q);
      const matchSkill = (c.skills || []).some(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
      if (!matchName && !matchTitle && !matchBuff && !matchHabitat && !matchElement && !matchSkill) {
        return false;
      }
    }
    return true;
  });

  // Egg Hatching Execution
  // USER INTENT: "làm tỉ lệ ra mấy con cấp cao hiếm hơn", "cấp cuối cùng là king of god"
  // Hierarchy: Secret (10) -> King (11) -> Titan (12) -> Deity (13) -> God (14) -> King of God (15)
  const handleStartHatch = (egg: StolenEgg) => {
    if (egg.isHatched || isHatching) return;

    setSelectedEgg(egg);
    setIsHatching(true);
    playLaser();

    setTimeout(() => {
      let pool: PetCompanion[] = [];

      // Balanced drop rates making high-tier creatures rare and prestigious:
      if (egg.eggType === 'king_of_god') {
        const rand = Math.random();
        let targetRarity: CreatureRarity = 'king_of_god';
        if (rand < 0.85) targetRarity = 'king_of_god';
        else targetRarity = 'god';
        pool = CREATURES_CATALOG.filter((c) => c.rarity === targetRarity);
        if (pool.length === 0) {
          pool = CREATURES_CATALOG.filter((c) => c.rarity === 'king_of_god');
        }
      } else if (egg.eggType === 'god') {
        const rand = Math.random();
        let targetRarity: CreatureRarity = 'god';
        if (rand < 0.05) targetRarity = 'king_of_god'; // 5% ultimate King of God!
        else if (rand < 0.55) targetRarity = 'god';
        else if (rand < 0.78) targetRarity = 'deity';
        else if (rand < 0.88) targetRarity = 'titan';
        else if (rand < 0.94) targetRarity = 'king';
        else targetRarity = 'secret';
        pool = CREATURES_CATALOG.filter((c) => c.rarity === targetRarity);
      } else if (egg.eggType === 'deity') {
        const rand = Math.random();
        let targetRarity: CreatureRarity = 'deity';
        if (rand < 0.005) targetRarity = 'king_of_god';
        else if (rand < 0.025) targetRarity = 'god';
        else if (rand < 0.47) targetRarity = 'deity';
        else if (rand < 0.67) targetRarity = 'titan';
        else if (rand < 0.79) targetRarity = 'king';
        else if (rand < 0.82) targetRarity = 'secret';
        else targetRarity = 'cosmic';
        pool = CREATURES_CATALOG.filter((c) => c.rarity === targetRarity);
      } else if (egg.eggType === 'titan') {
        const rand = Math.random();
        let targetRarity: CreatureRarity = 'titan';
        if (rand < 0.006) targetRarity = 'god';
        else if (rand < 0.04) targetRarity = 'deity';
        else if (rand < 0.44) targetRarity = 'titan';
        else if (rand < 0.59) targetRarity = 'king';
        else if (rand < 0.61) targetRarity = 'secret';
        else if (rand < 0.83) targetRarity = 'cosmic';
        else targetRarity = 'eternal';
        pool = CREATURES_CATALOG.filter((c) => c.rarity === targetRarity);
      } else if (egg.eggType === 'king') {
        const rand = Math.random();
        let targetRarity: CreatureRarity = 'king';
        if (rand < 0.002) targetRarity = 'god';
        else if (rand < 0.015) targetRarity = 'deity';
        else if (rand < 0.065) targetRarity = 'titan';
        else if (rand < 0.415) targetRarity = 'king';
        else if (rand < 0.435) targetRarity = 'secret';
        else if (rand < 0.615) targetRarity = 'cosmic';
        else if (rand < 0.815) targetRarity = 'eternal';
        else targetRarity = 'ultimate';
        pool = CREATURES_CATALOG.filter((c) => c.rarity === targetRarity);
      } else if (egg.eggType === 'golden') {
        // High tiers made significantly rarer!
        const bonus = Math.min(0.05, hatchBonusRate);
        const rand = Math.random();
        let targetRarity: CreatureRarity = 'ultimate';

        if (rand < 0.0003 * (1 + bonus * 5)) {
          // 0.03% King of God (Vạn Thần Chi Vương)
          targetRarity = 'king_of_god';
        } else if (rand < 0.001 * (1 + bonus * 5)) {
          // 0.1% God (Tối Cao)
          targetRarity = 'god';
        } else if (rand < 0.006 * (1 + bonus * 3)) {
          // 0.5% Deity (Thần Linh)
          targetRarity = 'deity';
        } else if (rand < 0.021 * (1 + bonus * 2)) {
          // 1.5% Titan (Khổng Lồ)
          targetRarity = 'titan';
        } else if (rand < 0.056) {
          // 3.5% King (Vương Giả)
          targetRarity = 'king';
        } else if (rand < 0.066) {
          // 1.0% Secret (Bí Ẩn)
          targetRarity = 'secret';
        } else if (rand < 0.13) {
          // 6.4% Cosmic
          targetRarity = 'cosmic';
        } else if (rand < 0.27) {
          // 14.0% Eternal
          targetRarity = 'eternal';
        } else if (rand < 0.52) {
          // 25.0% Ultimate
          targetRarity = 'ultimate';
        } else if (rand < 0.80) {
          // 28.0% Mythical
          targetRarity = 'mythical';
        } else {
          // 20.0% Legendary
          targetRarity = 'legendary';
        }

        pool = CREATURES_CATALOG.filter((c) => c.rarity === targetRarity);
        if (pool.length === 0) {
          pool = CREATURES_CATALOG.filter(
            (c) => c.rarity === 'ultimate' || c.rarity === 'eternal' || c.rarity === 'king' || c.rarity === 'titan' || c.rarity === 'deity' || c.rarity === 'god' || c.rarity === 'king_of_god'
          );
        }
      } else if (egg.eggType === 'silver') {
        const bonus = Math.min(0.05, hatchBonusRate);
        const rand = Math.random();
        let targetRarity: CreatureRarity = 'epic';

        if (rand < 0.02 * (1 + bonus)) targetRarity = 'legendary';
        else if (rand < 0.22) targetRarity = 'epic';
        else if (rand < 0.70) targetRarity = 'rare';
        else targetRarity = 'uncommon';

        pool = CREATURES_CATALOG.filter((c) => c.rarity === targetRarity);
        if (pool.length === 0) {
          pool = CREATURES_CATALOG.filter((c) => c.rarity === 'epic' || c.rarity === 'rare');
        }
      } else {
        // Common Egg
        const rand = Math.random();
        let targetRarity: CreatureRarity = 'common';

        if (rand < 0.05) targetRarity = 'rare';
        else if (rand < 0.40) targetRarity = 'uncommon';
        else targetRarity = 'common';

        pool = CREATURES_CATALOG.filter((c) => c.rarity === targetRarity);
        if (pool.length === 0) {
          pool = CREATURES_CATALOG.filter((c) => c.rarity === 'common');
        }
      }

      const randomPetTemplate = pool[Math.floor(Math.random() * pool.length)] || CREATURES_CATALOG[0];

      const newPet: PetCompanion = {
        ...randomPetTemplate,
        id: `hatched-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        hatchedAt: `${egg.unitTitle} (${new Date().toLocaleTimeString('en-US')})`,
        enchantmentLevel: 0,
      };

      onEggHatched(egg.id, newPet);
      setJustHatchedPet(newPet);
      setSelectedEgg(null);
      setIsHatching(false);

      if (hatchRebate > 0 && onAddDragonCrystals) {
        onAddDragonCrystals(hatchRebate);
      }

      if (!selectedEnchantPetId) {
        setSelectedEnchantPetId(newPet.id);
      }

      playMythicFanfare();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });
    }, 1900);
  };

  // Currently selected pet for enchantment shrine
  const currentEnchantPet =
    hatchedPets.find((p) => p.id === selectedEnchantPetId) || hatchedPets[0] || null;

  const currentLevel = currentEnchantPet?.enchantmentLevel || 0;
  const nextConfig = getEnchantmentConfig(currentLevel + 1);
  const isMaxEnchanted = currentLevel >= 5;

  const currentStats = currentEnchantPet
    ? calculatePetStats(currentEnchantPet)
    : { maxHp: 100, atk: 20, def: 10, enchantMultiplier: 1.0 };

  const nextStats = currentEnchantPet && nextConfig
    ? calculatePetStats({ ...currentEnchantPet, enchantmentLevel: currentLevel + 1 })
    : currentStats;

  // Selected pet for Rarity Evolution Sanctuary
  const readyToEvolveCount = hatchedPets.filter(
    (p) => (p.level || 1) >= 20 && (p.enchantmentLevel || 0) >= 5
  ).length;

  const currentEvolvePet =
    hatchedPets.find((p) => p.id === selectedEvolvePetId) ||
    hatchedPets.find((p) => (p.level || 1) >= 20 && (p.enchantmentLevel || 0) >= 5) ||
    hatchedPets[0] ||
    null;

  const triggerEvolution = (pet: PetCompanion) => {
    setIsPetEvolving(true);
    setEvolvingPet(pet);
    setIsRarityEvolutionActive(false);
    playEvolutionSound();
    playMythicFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#facc15', '#38bdf8', '#c084fc', '#ffffff', '#f59e0b', '#34d399'],
    });

    setTimeout(() => {
      setEvolutionPet(pet);
      setIsEvolutionModalOpen(true);
    }, 1800);

    setTimeout(() => {
      setIsPetEvolving(false);
    }, 4500);
  };

  const handleTriggerRarityEvolution = (pet: PetCompanion) => {
    const reqs = getEvolutionRequirements(pet);
    if (!reqs.canEvolve) return;

    setPreEvolutionPet({ ...pet });
    setIsRarityEvolutionActive(true);

    let evolved: PetCompanion | null = null;
    if (onEvolvePet) {
      evolved = onEvolvePet(pet.id);
    } else {
      evolved = getEvolvedPetForm(pet);
    }

    if (evolved) {
      setSelectedEvolvePetId(evolved.id);
      setSelectedEnchantPetId(evolved.id);
      setIsPetEvolving(true);
      setEvolvingPet(evolved);
      playEvolutionSound();
      playMythicFanfare();
      confetti({
        particleCount: 160,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#facc15', '#ec4899', '#38bdf8', '#c084fc', '#ffffff', '#f59e0b', '#10b981'],
      });

      setTimeout(() => {
        setEvolutionPet(evolved);
        setIsEvolutionModalOpen(true);
      }, 1800);

      setTimeout(() => {
        setIsPetEvolving(false);
      }, 4500);
    }
  };

  const handleQuickLevelUp = (petId: string, levels: number = 1, costCrystals: number = 0) => {
    if (costCrystals > 0 && onAddDragonCrystals) {
      if (dragonCrystals < costCrystals) return;
      onAddDragonCrystals(-costCrystals);
    }
    if (onLevelUpPet) {
      onLevelUpPet(petId, levels);
      playLaser();
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleEnchant = (petId: string) => {
    const targetPet = hatchedPets.find((p) => p.id === petId);
    const prevLevel = targetPet?.enchantmentLevel || 0;
    const success = onEnchantPet(petId);
    if (success) {
      setEnchantSuccessFlash(true);
      playEnchantSound();
      playMythicFanfare();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => setEnchantSuccessFlash(false), 800);

      // Check if pet reached 5 stars
      if (prevLevel === 4 && targetPet) {
        const petAtFive: PetCompanion = { ...targetPet, enchantmentLevel: 5 };
        // If pet has also reached Level 20, trigger the full Rarity Evolution!
        if ((petAtFive.level || 1) >= 20) {
          handleTriggerRarityEvolution(petAtFive);
        } else {
          // Trigger 5-star celestial awakening
          triggerEvolution(petAtFive);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white relative">
        {/* Header with Title and Dragon Crystals Counter */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-950/60">
              🥚✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Sanctuary Hatchery & Bestiary</span>
                  <span className="text-amber-400 font-bold hidden md:inline">• 14 Tiers of Discovery (Tối Cao Vô Thượng)</span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Hatch stolen dragon eggs, inspect companion combat skills, and enchant pets with Dragon Crystals!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Free Gift Giveaway Button (Strictly ONE-TIME ONLY) */}
            {onClaimFreeGift && (
              hasClaimedFreeGift ? (
                <div
                  className="px-3 py-1.5 rounded-xl font-bold text-xs shadow flex items-center gap-1.5 bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed select-none"
                  title="Bạn đã nhận quà này rồi. Quà chỉ nhận 1 lần duy nhất cho mỗi tài khoản!"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
                  <span>✓ Đã Nhận Quà (1 Lần)</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onClaimFreeGift();
                  }}
                  className="px-3 py-1.5 rounded-xl font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition-all bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 animate-pulse shadow-emerald-500/20 active:scale-95"
                  title="Nhận ngay Gói Quà Khởi Đầu (Chỉ nhận được 1 lần duy nhất)!"
                >
                  <Gift className="w-3.5 h-3.5 text-slate-950" />
                  <span>🎁 Quà Tặng (1 Lần)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
                </button>
              )
            )}

            {/* Dragon Crystals Wallet Display */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/50 text-xs font-black text-purple-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{dragonCrystals}</span>
              <span className="text-[10px] text-purple-400 font-bold hidden sm:inline">Crystals</span>
            </div>

            {/* Quick Pet PvP Shortcut */}
            {onOpenPokemonPvP && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPokemonPvP();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-xs font-black text-rose-200 transition-all cursor-pointer shadow-sm animate-pulse"
                title="Đấu Trường Pet PvP & Thủ Lĩnh Võ Đài"
              >
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Pet PvP</span>
              </button>
            )}

            {/* Quick Appearance Studio Shortcut */}
            {onOpenAppearanceStudio && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAppearanceStudio();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-xs font-black text-indigo-200 transition-all cursor-pointer shadow-sm"
                title="Studio Tùy Biến Ngoại Hình Pokémon Pet"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Ngoại Hình</span>
              </button>
            )}

            {/* Quick Skill Tree Shortcut */}
            {onOpenSkillTree && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSkillTree();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/40 text-xs font-bold text-purple-200 transition-all cursor-pointer shadow-sm"
                title="Open Pet Skill Tree & Passives"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Skill Tree</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-5 gap-1 bg-slate-950/80 p-1.5 rounded-2xl my-3 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('eggs')}
            className={`py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'eggs'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🥚 Eggs</span>
            <span className="text-[9px] opacity-80">({stolenEggs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pets')}
            className={`py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'pets'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🐾 Pets</span>
            <span className="text-[9px] opacity-80">({hatchedPets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enchant')}
            className={`py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'enchant'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <span>✨ Enchant</span>
          </button>

          <button
            onClick={() => setActiveTab('evolve')}
            className={`py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
              activeTab === 'evolve'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-yellow-500/20'
                : 'text-amber-300/80 hover:text-amber-200'
            }`}
          >
            <span>⚡ Tiến Hóa</span>
            {readyToEvolveCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black animate-pulse shadow-sm shadow-rose-500/50">
                {readyToEvolveCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bestiary')}
            className={`py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'bestiary'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📖 Bestiary</span>
          </button>
        </div>

        {/* Dynamic Egg Cracking Shell In-Progress Overlay */}
        {isHatching && selectedEgg && (
          <div className="shrink-0 mb-3 bg-gradient-to-r from-amber-950 via-slate-950 to-purple-950 border-2 border-amber-400 p-5 rounded-2xl text-center relative overflow-hidden animate-pulse shadow-2xl">
            <div className="flex flex-col items-center justify-center gap-3">
              <EggVisualGraphic type={selectedEgg.eggType} size="lg" isCracking={true} />
              <div>
                <span className="text-xs uppercase font-black tracking-widest text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/50">
                  ⚡ VỎ TRỨNG ĐANG NỨT TỪNG VẾT NỨT... ⚡
                </span>
                <h4 className="text-base font-black text-white mt-1">
                  Đang giải phóng linh hồn: {getEggConfig(selectedEgg.eggType).name}
                </h4>
                <p className="text-xs text-slate-400 italic mt-0.5">
                  Năng lượng cổ đại đang bùng nổ, sẵn sàng chào đón chiến binh rồng mới!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Just Hatched Showcase Celebration Banner */}
        {justHatchedPet && (
          <div className="shrink-0 mb-3 bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-400 p-4 rounded-2xl text-center relative overflow-hidden animate-fade-in shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-amber-400/60 flex items-center justify-center text-4xl shadow-lg shrink-0 animate-bounce">
                {justHatchedPet.avatarIcon}
              </div>
              <div className="text-left flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  {(() => {
                    const rarityMeta = getRarityConfig(justHatchedPet.rarity);
                    const classMeta = getClassificationConfig(justHatchedPet.classification);
                    return (
                      <>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${rarityMeta.badgeBg} ${rarityMeta.badgeText} border ${rarityMeta.borderColor}`}>
                          {rarityMeta.icon} {rarityMeta.nameEn.toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${classMeta.badgeStyle}`}>
                          {classMeta.icon} {classMeta.title}
                        </span>
                        <span className="text-[10px] text-amber-300 font-mono">
                          {rarityMeta.starsDisplay}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <h4 className="text-xl font-black text-amber-300">{justHatchedPet.name}</h4>
                <p className="text-xs text-slate-300 italic">{justHatchedPet.title}</p>
                <p className="text-xs text-emerald-300 font-semibold mt-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-700/40 inline-block">
                  ⚡ Special Perk: {justHatchedPet.buffDescription}
                </p>
              </div>
              <div className="flex sm:flex-col gap-2">
                <button
                  onClick={() => {
                    setSelectedEnchantPetId(justHatchedPet.id);
                    setActiveTab('enchant');
                    setJustHatchedPet(null);
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md active:scale-95"
                >
                  ✨ Enchant Now
                </button>
                <button
                  onClick={() => setJustHatchedPet(null)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-md active:scale-95"
                >
                  Add to Squad
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* ================= TAB 1: STOLEN EGGS ================= */}
          {activeTab === 'eggs' && (
            <div>
              <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-amber-300">💡 Hatching Guide: </span>
                  Complete each Unit with a score of 8/10 or higher to bring back Silver Eggs. Score a perfect 10/10 for Golden Dragon Eggs with high chances of hatching Prehistoric Titans, Cosmic Entities, and Supreme Gods!
                </div>
              </div>

              {stolenEggs.length === 0 ? (
                <div className="text-center py-14 text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="text-5xl mb-3 opacity-60">🥚💤</div>
                  <h4 className="font-bold text-base text-slate-200">Chưa có quả trứng rồng nào trong tổ!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Hãy đột kích Hang Rồng (Dragon&apos;s Lair) và hoàn thành các Unit đạt ít nhất 8/10 điểm để đoạt trứng về ấp.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stolenEggs.map((egg) => {
                    const eggCfg = getEggConfig(egg.eggType);

                    return (
                      <div
                        key={egg.id}
                        className={`p-3.5 rounded-2xl border bg-slate-950/90 flex flex-col justify-between gap-3 relative overflow-hidden ${eggCfg.border}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <EggVisualGraphic type={egg.eggType} size="sm" isCracking={isHatching && selectedEgg?.id === egg.id} />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${eggCfg.badgeBg}`}>
                                  {eggCfg.name}
                                </span>
                                <span className="text-[9px] text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/30">
                                  {eggCfg.tierRank}
                                </span>
                              </div>
                              <h5 className="font-bold text-sm text-white mt-1">{egg.unitTitle}</h5>
                              <p className="text-[11px] text-slate-400">Điểm Đạt Được: {egg.obtainedScore}/10</p>
                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{eggCfg.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <span className="text-[10px] text-slate-400 italic">{eggCfg.oddsHint}</span>
                          {egg.isHatched ? (
                            <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/70 px-2.5 py-1 rounded-xl border border-emerald-800 flex items-center gap-1 shrink-0 self-end sm:self-auto">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã Nở
                            </span>
                          ) : (
                            <button
                              onClick={() => handleStartHatch(egg)}
                              disabled={isHatching}
                              className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-md active:scale-95 transition-all shrink-0 self-end sm:self-auto ${
                                egg.eggType === 'god'
                                  ? 'bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 text-slate-950 animate-pulse'
                                  : egg.eggType === 'deity'
                                  ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950'
                                  : egg.eggType === 'titan'
                                  ? 'bg-gradient-to-r from-stone-800 to-orange-600 text-white'
                                  : egg.eggType === 'king'
                                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950'
                                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950'
                              }`}
                            >
                              {isHatching && selectedEgg?.id === egg.id ? 'Đang Phá Vỏ Trứng...' : 'Ấp Nở Ngay!'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: MY HATCHED PETS ================= */}
          {activeTab === 'pets' && (
            <div>
              {hatchedPets.length === 0 ? (
                <div className="text-center py-14 text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="text-5xl mb-3 opacity-60">🐲🐾</div>
                  <h4 className="font-bold text-base text-slate-200">No companions hatched yet!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Return to the &quot;Dragon Eggs&quot; tab and hatch your stolen eggs to build your team.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hatchedPets.map((pet, idx) => {
                    const rarityMeta = getRarityConfig(pet.rarity);
                    const classMeta = getClassificationConfig(pet.classification);
                    const enchantLvl = pet.enchantmentLevel || 0;
                    const stats = calculatePetStats(pet);

                    return (
                      <div
                        key={idx}
                        onClick={() => setInspectPet(pet)}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-3 cursor-pointer group relative overflow-hidden"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-4xl p-2.5 rounded-2xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform shrink-0 relative">
                            {pet.avatarIcon}
                            {enchantLvl > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-purple-600 border border-purple-300 text-[9px] font-black text-white shadow-md">
                                ★{enchantLvl}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${rarityMeta.badgeBg} ${rarityMeta.badgeText} border ${rarityMeta.borderColor}`}>
                                {rarityMeta.icon} {rarityMeta.nameEn}
                              </span>
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                                Lv.{pet.level || 1}
                              </span>
                              {pet.isEvolved && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-purple-500 text-slate-950 shadow-sm border border-yellow-300">
                                  👑 Thần Thú Tiến Hóa
                                </span>
                              )}
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${classMeta.badgeStyle}`}>
                                {classMeta.icon} {classMeta.type}
                              </span>
                              {enchantLvl > 0 && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-600 flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                                  {enchantLvl}/5 Stars
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                              {pet.name}
                            </h5>
                            <p className="text-[11px] text-slate-400 truncate">{pet.title}</p>
                            <p className="text-[11px] text-emerald-300 mt-1 font-medium line-clamp-2">
                              ⚡ {pet.buffDescription}
                            </p>
                          </div>
                        </div>

                        {/* Pet Combat Stats preview */}
                        <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[10px]">
                          <div className="flex items-center gap-1 text-rose-300">
                            <Heart className="w-3 h-3 text-rose-400" />
                            <span>HP: {stats.maxHp}</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-300">
                            <Swords className="w-3 h-3 text-amber-400" />
                            <span>ATK: {stats.atk}</span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-300">
                            <Shield className="w-3 h-3 text-blue-400" />
                            <span>DEF: {stats.def}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                          {((pet.level || 1) >= 20 && enchantLvl >= 5) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvolvePetId(pet.id);
                                setActiveTab('evolve');
                              }}
                              className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500 hover:from-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-yellow-500/30 animate-pulse active:scale-95 transition-all"
                              title="Linh thú đã đạt Cấp 20 & 5 Sao Cực Hạn! Nhấn để Tiến Hóa Rarity ngay"
                            >
                              <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                              <span>⚡ Tiến Hóa Rarity!</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvolvePetId(pet.id);
                                setActiveTab('evolve');
                              }}
                              className="py-1.5 px-2.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                              title="Xem điều kiện và tiến trình Tiến Hóa Rarity (Cấp 20 + 5 Sao)"
                            >
                              <Zap className="w-3 h-3 text-amber-400" />
                              <span>Tiến Hóa</span>
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEnchantPetId(pet.id);
                              setActiveTab('enchant');
                            }}
                            className="flex-1 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Enchant ({enchantLvl}/5)</span>
                          </button>

                          {onOpenAppearanceStudio && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                                onOpenAppearanceStudio(pet.id);
                              }}
                              className="py-1.5 px-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                              title="Tùy biến ngoại hình Pokémon Pet"
                            >
                              <Palette className="w-3 h-3 text-indigo-400" />
                              <span>Ngoại Hình</span>
                            </button>
                          )}

                          {onOpenArena && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                                onOpenArena();
                              }}
                              className="flex-1 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <Swords className="w-3 h-3 text-rose-400" />
                              <span>Arena</span>
                            </button>
                          )}

                          {onSellPet && (
                            confirmSellId === pet.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSellPet(pet.id);
                                    setConfirmSellId(null);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] cursor-pointer hover:bg-rose-500 transition-all shadow-md"
                                >
                                  Xác nhận bán?
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmSellId(null);
                                  }}
                                  className="px-2 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-[11px] cursor-pointer hover:bg-slate-700 transition-all"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmSellId(pet.id);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                                title="Bán Pet"
                              >
                                💰 Bán
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: CRYSTAL ENCHANTMENT SHRINE ================= */}
          {activeTab === 'enchant' && (
            <div className="space-y-4">
              {/* Shrine Explanation Header */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-amber-950/60 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/60 flex items-center justify-center text-xl shrink-0">
                    💎
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-purple-200">
                      Dragon Crystal Enchantment Shrine
                    </h4>
                    <p className="text-xs text-slate-300">
                      Infuse Dragon Crystals into hatched companions to raise their star rank (up to 5 Stars). Each star permanently grants massive +25% HP, +25% ATK, and +15% DEF!
                    </p>
                  </div>
                </div>

                <div className="px-3.5 py-2 rounded-xl bg-purple-950 border border-purple-400/50 flex items-center gap-2 shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
                  <div>
                    <div className="text-[10px] text-purple-300 font-semibold uppercase">Your Crystals</div>
                    <div className="text-base font-black text-white">{dragonCrystals}</div>
                  </div>
                </div>
              </div>

              {hatchedPets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="text-5xl mb-3 opacity-60">🔮💤</div>
                  <h4 className="font-bold text-base text-slate-200">No companions available to enchant!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Hatch at least one dragon egg from the &quot;Dragon Eggs&quot; tab first to awaken your first companion.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left Column: Companion Picker */}
                  <div className="lg:col-span-5 space-y-2">
                    <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Select Companion ({hatchedPets.length})
                    </h5>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {hatchedPets.map((p) => {
                        const isSelected = p.id === currentEnchantPet?.id;
                        const rMeta = getRarityConfig(p.rarity);
                        const lvl = p.enchantmentLevel || 0;

                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedEnchantPetId(p.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                              isSelected
                                ? 'bg-purple-950/90 border-purple-400 shadow-md shadow-purple-950/50'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-2xl p-1 rounded-lg bg-slate-900 shrink-0">
                                {p.avatarIcon}
                              </span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{p.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{rMeta.nameEn} • Rank {p.tierRank}</div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-black text-amber-300">
                                {'★'.repeat(Math.min(5, Math.max(0, lvl)))}{'☆'.repeat(Math.max(0, 5 - lvl))}
                              </span>
                              <div className="text-[9px] text-purple-300 font-semibold">{Math.min(5, lvl)}/5 Stars</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Enchantment Ritual Altar */}
                  {currentEnchantPet && (
                    <div className={`lg:col-span-7 p-4 rounded-2xl bg-slate-950 border-2 transition-all ${
                      enchantSuccessFlash
                        ? 'border-yellow-400 bg-purple-950/90 shadow-2xl shadow-yellow-400/50 scale-[1.01]'
                        : 'border-purple-500/50'
                    }`}>
                      {/* Pet Showcase Header */}
                      <div className="flex items-center gap-3.5 pb-3 border-b border-slate-800 relative">
                        <div className={`w-16 h-16 rounded-2xl bg-slate-900 border-2 flex items-center justify-center text-4xl shadow-lg relative ${
                          currentLevel >= 5
                            ? 'border-yellow-400 shadow-yellow-400/60 ring-4 ring-yellow-400/20'
                            : currentLevel >= 3
                            ? 'border-purple-400 shadow-purple-500/50 ring-2 ring-purple-400/20'
                            : 'border-slate-700'
                        }`}>
                          {currentEnchantPet.avatarIcon}
                          {/* Celestial Burst & Glowing Particles Altar Effect */}
                          {isPetEvolving && evolvingPet?.id === currentEnchantPet.id && (
                            <CelestialEvolutionBurst
                              isActive={true}
                              petName={evolvingPet.name}
                              element={evolvingPet.element}
                              size="md"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black uppercase text-amber-300">
                              {getRarityConfig(currentEnchantPet.rarity).nameEn}
                            </span>
                            <span className="text-xs font-mono text-purple-300">
                              {'★'.repeat(Math.min(5, Math.max(0, currentLevel)))}{'☆'.repeat(Math.max(0, 5 - currentLevel))}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-white flex items-center gap-2">
                            <span>{currentEnchantPet.name}</span>
                            {currentLevel >= 5 && (
                              <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400 text-yellow-300 text-[10px] font-black uppercase tracking-wider">
                                👑 Transcended
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-400 italic">{currentEnchantPet.title}</p>
                        </div>
                      </div>

                      {/* Stat Comparison Card */}
                      <div className="grid grid-cols-3 gap-2 my-3.5">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-rose-400 font-bold mb-1">
                            <Heart className="w-3.5 h-3.5" /> HP
                          </div>
                          <div className="text-sm font-black text-white">{currentStats.maxHp}</div>
                          {!isMaxEnchanted && (
                            <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                              ➜ {nextStats.maxHp} (+25%)
                            </div>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-bold mb-1">
                            <Swords className="w-3.5 h-3.5" /> ATK
                          </div>
                          <div className="text-sm font-black text-white">{currentStats.atk}</div>
                          {!isMaxEnchanted && (
                            <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                              ➜ {nextStats.atk} (+25%)
                            </div>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-blue-400 font-bold mb-1">
                            <Shield className="w-3.5 h-3.5" /> DEF
                          </div>
                          <div className="text-sm font-black text-white">{currentStats.def}</div>
                          {!isMaxEnchanted && (
                            <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                              ➜ {nextStats.def} (+15%)
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Next Tier Upgrade Info */}
                      {!isMaxEnchanted && nextConfig ? (
                        <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-600/40 text-xs mb-3.5 space-y-1">
                          <div className="flex items-center justify-between text-purple-200 font-bold">
                            <span>Next Tier: {nextConfig.name}</span>
                            <span className="text-amber-300 font-mono">{nextConfig.starDisplay}</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{nextConfig.description}</p>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-purple-500/25 to-cyan-500/25 border-2 border-yellow-400 text-xs mb-3.5 text-center relative overflow-hidden shadow-xl shadow-yellow-500/20">
                          <div className="text-sm font-black text-yellow-300 flex items-center justify-center gap-2">
                            <Crown className="w-4 h-4 text-yellow-400 animate-spin" />
                            <span>👑 VẠN CỔ THẦN THÚ • TRANSCENDED (5/5 STARS)</span>
                          </div>
                          {(currentEnchantPet.level || 1) >= 20 ? (
                            <div className="mt-2 space-y-2">
                              <p className="text-emerald-300 text-xs font-bold">
                                🌟 Linh thú đã đạt Cấp {currentEnchantPet.level || 1} &amp; 5/5 Sao! Đã sẵn sàng TIẾN HÓA RARITY sang bậc cao hơn với Icon Độc Nhất!
                              </p>
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedEvolvePetId(currentEnchantPet.id);
                                    setActiveTab('evolve');
                                  }}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500 hover:from-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all hover:scale-105"
                                >
                                  <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                                  <span>⚡ Chuyển Đến Bệ Thờ Tiến Hóa Rarity</span>
                                </button>
                                <button
                                  onClick={() => handleTriggerRarityEvolution(currentEnchantPet)}
                                  className="px-3 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                  <span>Tiến Hóa Ngay</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 space-y-2">
                              <p className="text-slate-300 text-[11px]">
                                Đã đạt cực hạn 5 Sao! Hãy nâng cấp Linh thú lên <strong className="text-cyan-300">Cấp 20</strong> (Hiện tại: Cấp {currentEnchantPet.level || 1}/20) để kích hoạt <strong className="text-amber-300">TIẾN HÓA RARITY</strong> với Icon Độc Nhất!
                              </p>
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                <button
                                  onClick={() => handleQuickLevelUp(currentEnchantPet.id, 1)}
                                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow active:scale-95"
                                >
                                  <span>⚡ Tăng Cấp (+1 Lv)</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const needed = Math.max(0, 20 - (currentEnchantPet.level || 1));
                                    handleQuickLevelUp(currentEnchantPet.id, needed);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer transition-all shadow active:scale-95 hover:scale-105"
                                >
                                  <span>🔥 Đột Phá Lên Cấp 20 Ngay</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Enchant Action Button */}
                      {!isMaxEnchanted && nextConfig ? (
                        <div>
                          {dragonCrystals >= nextConfig.crystalCost ? (
                            <button
                              onClick={() => handleEnchant(currentEnchantPet.id)}
                              className={`w-full py-2.5 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 transition-all ${
                                currentLevel === 4
                                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-purple-600 text-slate-950 shadow-yellow-500/40 hover:scale-[1.01]'
                                  : 'bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 hover:from-purple-500 hover:to-amber-400 shadow-purple-950/60'
                              }`}
                            >
                              {currentLevel === 4 ? (
                                <>
                                  <Crown className="w-4 h-4 text-slate-950 animate-bounce" />
                                  <span>🔥 TIẾN HÓA THẦN THÚ CẤP 5 (Kích hoạt Celestial Burst)</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                                  <span>Enchant with {nextConfig.crystalCost} Dragon Crystals</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="space-y-1 text-center">
                              <button
                                disabled
                                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700"
                              >
                                <Lock className="w-4 h-4" />
                                <span>Need {nextConfig.crystalCost} Crystals (Have {dragonCrystals})</span>
                              </button>
                              <p className="text-[11px] text-amber-300/80">
                                💡 Win Arena PvP battles or score 8+/10 on Unit quests to earn more Dragon Crystals!
                              </p>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* Quick Celestial Burst Test Button */}
                      <div className="flex items-center justify-center mt-3 pt-2.5 border-t border-slate-800/80">
                        <button
                          onClick={() => triggerEvolution(currentEnchantPet)}
                          className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer font-bold active:scale-95"
                          title="Kích hoạt hiệu ứng Celestial Burst và glowing particles để kiểm tra phản hồi"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                          <span>⚡ Thử Nghiệm Celestial Burst Animation</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: RARITY EVOLUTION SANCTUARY ================= */}
          {activeTab === 'evolve' && (
            <div className="space-y-3">
              {/* Header Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-amber-950/80 border border-yellow-400/40 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/20 shrink-0">
                      ⚡👑
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-amber-300">
                          Bệ Thờ Thức Tỉnh &amp; Tiến Hóa Thần Thú (Ascension Sanctuary)
                        </h4>
                        {readyToEvolveCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-bounce shadow-md">
                            {readyToEvolveCount} Sẵn Sàng!
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                        Điều kiện tiến hóa: <strong>Đạt Cấp Độ 20</strong> + <strong>Cực Hạn Cường Hóa 5 Sao</strong>. Thần thú sẽ lột xác sang <strong>Bậc Rarity cao hơn</strong> với <strong>Icon Độc Nhất</strong>, chỉ số vượt bậc và mở khóa tiềm năng cường hóa ở bậc mới!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {hatchedPets.length === 0 ? (
                <div className="text-center py-14 text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="text-5xl mb-3 opacity-60">🥚🐾</div>
                  <h4 className="font-bold text-base text-slate-200">Chưa có linh thú nào trong lồng ấp!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Hãy vào tab &quot;Dragon Eggs&quot; để ấp nở trứng rồng trước khi tiến hóa.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                  {/* Left Column: Pet Selector list */}
                  <div className="lg:col-span-4 p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col max-h-[500px]">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 shrink-0">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Danh Sách Thú Cưng ({hatchedPets.length})</span>
                      </span>
                      {readyToEvolveCount > 0 && (
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                          {readyToEvolveCount} Đủ ĐK
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                      {hatchedPets.map((pet) => {
                        const isSelected = (currentEvolvePet?.id === pet.id);
                        const pLevel = pet.level || 1;
                        const pEnchant = pet.enchantmentLevel || 0;
                        const isReady = pLevel >= 20 && pEnchant >= 5;
                        const petRarity = getRarityConfig(pet.rarity);

                        return (
                          <div
                            key={pet.id}
                            onClick={() => setSelectedEvolvePetId(pet.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                              isSelected
                                ? 'bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-yellow-400 shadow-md ring-1 ring-yellow-400/50'
                                : isReady
                                ? 'bg-slate-900/90 border-emerald-500/60 hover:border-emerald-400 hover:bg-emerald-950/20'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0 relative">
                                {pet.avatarIcon}
                                {pet.isEvolved && (
                                  <span className="absolute -top-1 -right-1 text-[9px] bg-amber-500 text-slate-950 font-black rounded-full px-1 shadow">
                                    👑
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full ${petRarity.badgeBg} ${petRarity.badgeText}`}>
                                    {petRarity.nameEn}
                                  </span>
                                  <span className="text-[9px] font-mono text-cyan-300 font-bold">
                                    Lv.{pLevel}
                                  </span>
                                </div>
                                <h5 className="font-bold text-xs text-white truncate">{pet.name}</h5>
                                <div className="text-[10px] text-purple-300 font-semibold flex items-center gap-1">
                                  <span>★{pEnchant}/5</span>
                                  {isReady && (
                                    <span className="text-emerald-400 font-black text-[9px] bg-emerald-950/80 px-1 rounded animate-pulse">
                                      SẴN SÀNG!
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              {isReady ? (
                                <span className="px-2 py-1 rounded-lg text-[9px] font-black bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-sm animate-pulse">
                                  TIẾN HÓA ➔
                                </span>
                              ) : pet.isEvolved ? (
                                <span className="text-[9px] text-amber-300/80 font-bold">
                                  Đã Evolve
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-500 font-semibold">
                                  Chưa Đủ ĐK
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Metamorphosis Altar */}
                  {currentEvolvePet ? (() => {
                    const reqs = getEvolutionRequirements(currentEvolvePet);
                    const comparison = getEvolutionStatComparison(currentEvolvePet);
                    const currentRarityMeta = getRarityConfig(currentEvolvePet.rarity);
                    const nextRarityMeta = getRarityConfig(comparison.nextRarity);
                    const isPetReady = reqs.canEvolve;

                    return (
                      <div className="lg:col-span-8 p-4 rounded-2xl bg-slate-950 border-2 border-amber-500/50 flex flex-col justify-between gap-3 relative overflow-hidden shadow-2xl">
                        {/* Altar Background Glow */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                        <div>
                          {/* Altar Header */}
                          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                                Bệ Thờ Chuyển Hóa Cảnh Giới
                              </span>
                              {currentEvolvePet.isEvolved && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-600 text-[10px] font-black">
                                  Đã Tiến Hóa Giai Đoạn {currentEvolvePet.evolutionStage || 1}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Rank {currentEvolvePet.tierRank} ➔ Rank {comparison.nextTierRank}
                            </span>
                          </div>

                          {/* Dual Transformation Display: Current vs Evolved Preview */}
                          <div className="grid grid-cols-1 md:grid-cols-11 gap-2.5 my-3 items-center">
                            {/* Form 1: Current Form */}
                            <div className="md:col-span-5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center relative overflow-hidden">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                DẠNG HIỆN TẠI
                              </div>
                              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-4xl my-2 shadow-inner">
                                {currentEvolvePet.avatarIcon}
                              </div>
                              <div className="flex items-center justify-center gap-1.5 mb-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${currentRarityMeta.badgeBg} ${currentRarityMeta.badgeText}`}>
                                  {currentRarityMeta.nameEn}
                                </span>
                                <span className="text-[10px] font-bold text-cyan-300">
                                  Cấp {currentEvolvePet.level || 1}
                                </span>
                              </div>
                              <h5 className="text-sm font-black text-white truncate">{currentEvolvePet.name}</h5>
                              <div className="text-[10px] text-purple-300 font-semibold mt-0.5">
                                Cường hóa: ★{currentEvolvePet.enchantmentLevel || 0}/5
                              </div>

                              <div className="grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                                <div className="text-rose-300">HP {comparison.current.maxHp}</div>
                                <div className="text-amber-300">ATK {comparison.current.atk}</div>
                                <div className="text-blue-300">DEF {comparison.current.def}</div>
                              </div>
                            </div>

                            {/* Center Gateway / Transformation Arrow */}
                            <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-1">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-yellow-500/30 animate-pulse">
                                ➔
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-amber-300 mt-1">
                                EVOLVE
                              </span>
                            </div>

                            {/* Form 2: Ascended Evolved Form Preview with Unique Icon */}
                            <div className="md:col-span-5 p-3 rounded-2xl bg-gradient-to-b from-amber-500/10 via-purple-900/20 to-slate-900 border-2 border-yellow-400/80 text-center relative overflow-hidden shadow-xl shadow-yellow-500/10">
                              <div className="absolute top-1.5 right-1.5">
                                <span className="px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-black text-[8px] uppercase tracking-wider border border-yellow-400">
                                  BẬC MỚI
                                </span>
                              </div>
                              <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                                <Sparkles className="w-3 h-3 text-yellow-400 animate-spin" />
                                <span>THẦN THÚ SAU TIẾN HÓA</span>
                              </div>

                              {/* Unique Evolved Icon Preview with Celestial Aura */}
                              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-950 via-slate-900 to-amber-950 border-2 border-yellow-400 flex items-center justify-center text-4xl my-2 shadow-lg shadow-yellow-400/40 relative">
                                <span className="animate-bounce">{comparison.evolvedIcon}</span>
                                <span className="absolute -top-1 -right-1 text-xs">✨</span>
                              </div>

                              <div className="flex items-center justify-center gap-1.5 mb-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${nextRarityMeta.badgeBg} ${nextRarityMeta.badgeText} ring-1 ring-yellow-400/60`}>
                                  {nextRarityMeta.nameEn}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-300">
                                  Cấp {Math.max(20, currentEvolvePet.level || 20)}
                                </span>
                              </div>
                              <h5 className="text-sm font-black text-yellow-300 truncate">
                                {comparison.evolvedName}
                              </h5>
                              <div className="text-[10px] text-amber-200/90 font-semibold mt-0.5">
                                Tiềm năng mới: ★0/5 (Tiếp tục cường hóa)
                              </div>

                              <div className="grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                                <div className="text-rose-300 font-bold">
                                  HP {comparison.evolvedBase.maxHp} <span className="text-emerald-400 text-[9px]">(+{comparison.hpGain})</span>
                                </div>
                                <div className="text-amber-300 font-bold">
                                  ATK {comparison.evolvedBase.atk} <span className="text-emerald-400 text-[9px]">(+{comparison.atkGain})</span>
                                </div>
                                <div className="text-blue-300 font-bold">
                                  DEF {comparison.evolvedBase.def} <span className="text-emerald-400 text-[9px]">(+{comparison.defGain})</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Evolution Requirements Checklist */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                            {/* Requirement 1: Level 20+ */}
                            <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 ${
                              reqs.isLevelMet
                                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                                : 'bg-slate-950/80 border-amber-500/40 text-slate-300'
                            }`}>
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 font-bold">
                                  {reqs.isLevelMet ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                                  )}
                                  <span>1. Đạt Cấp Độ 20+</span>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  reqs.isLevelMet
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-400'
                                }`}>
                                  {reqs.currentLevel}/20
                                </span>
                              </div>

                              <p className="text-[10px] text-slate-400">
                                {reqs.isLevelMet
                                  ? '✓ Đã hội tụ đủ cấp độ tối thiểu để mở khóa cảnh giới mới.'
                                  : `Cần thêm ${reqs.levelNeeded} cấp độ nữa để mở khóa bệ thờ.`}
                              </p>

                              {/* Level Up Helper Buttons */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  onClick={() => handleQuickLevelUp(currentEvolvePet.id, 1)}
                                  className="flex-1 py-1 px-2 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                                  title="Tăng 1 cấp độ cho thần thú"
                                >
                                  <span>⚡ +1 Cấp</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const needed = Math.max(0, 20 - (currentEvolvePet.level || 1));
                                    handleQuickLevelUp(currentEvolvePet.id, needed);
                                  }}
                                  className="flex-1 py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                                  title="Đột phá cấp độ lên thẳng Cấp 20 để trải nghiệm tính năng Tiến Hóa"
                                >
                                  <span>🔥 Lên Lv.20</span>
                                </button>
                              </div>
                            </div>

                            {/* Requirement 2: 5/5 Stars Enchantment */}
                            <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 ${
                              reqs.isEnchantmentMet
                                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                                : 'bg-slate-950/80 border-amber-500/40 text-slate-300'
                            }`}>
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 font-bold">
                                  {reqs.isEnchantmentMet ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                                  )}
                                  <span>2. Cường Hóa 5/5 Sao Cực Hạn</span>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  reqs.isEnchantmentMet
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                                    : 'bg-purple-500/20 text-purple-300 border border-purple-400'
                                }`}>
                                  {reqs.currentEnchantment}/5 ★
                                </span>
                              </div>

                              <p className="text-[10px] text-slate-400">
                                {reqs.isEnchantmentMet
                                  ? '✓ Đã đạt cực hạn 5 sao. Tinh hoa thức tỉnh đã sẵn sàng giải phóng!'
                                  : `Cần cường hóa lên 5 sao (còn thiếu ${reqs.enchantmentNeeded} sao).`}
                              </p>

                              {/* Enchant Helper Buttons */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  onClick={() => {
                                    setSelectedEnchantPetId(currentEvolvePet.id);
                                    setActiveTab('enchant');
                                  }}
                                  className="flex-1 py-1 px-2 rounded-lg bg-purple-950/90 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                                >
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                  <span>Đến Đền Cường Hóa</span>
                                </button>
                                {!reqs.isEnchantmentMet && (
                                  <button
                                    onClick={() => handleEnchant(currentEvolvePet.id)}
                                    className="flex-1 py-1 px-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                                    title="Cường hóa nhanh +1 Sao nếu đủ Crystals"
                                  >
                                    <span>💎 Enchant +1★</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Main Evolution Action Button */}
                        <div className="pt-2">
                          {isPetReady ? (
                            <button
                              id="execute-rarity-evolution-btn"
                              onClick={() => handleTriggerRarityEvolution(currentEvolvePet)}
                              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 hover:from-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-2xl shadow-yellow-500/40 hover:scale-[1.01] active:scale-98 transition-all ring-2 ring-yellow-400 animate-pulse"
                            >
                              <Crown className="w-5 h-5 text-slate-950" />
                              <span>⚡ KÍCH HOẠT TIẾN HÓA RARITY • THỨC TỈNH BẬC {nextRarityMeta.nameEn.toUpperCase()} ⚡</span>
                              <Sparkles className="w-5 h-5 text-slate-950" />
                            </button>
                          ) : (
                            <div className="space-y-1 text-center">
                              <button
                                disabled
                                className="w-full py-3 px-5 rounded-2xl bg-slate-900 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-800"
                              >
                                <Lock className="w-4 h-4 text-slate-600" />
                                <span>
                                  Chưa Đủ Điều Kiện: Cần Cấp 20 ({reqs.currentLevel}/20) và Cường Hóa 5 Sao ({reqs.currentEnchantment}/5★)
                                </span>
                              </button>
                              <p className="text-[11px] text-amber-400/80">
                                💡 Nhấn vào các nút trợ giúp ở trên để tăng cấp và cường hóa thần thú nhanh chóng!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="lg:col-span-8 p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400">
                      Vui lòng chọn một thần thú ở danh sách bên trái để xem bệ thờ tiến hóa.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}



          {/* ================= TAB 4: BESTIARY ENCYCLOPEDIA ================= */}
          {activeTab === 'bestiary' && (
            <div>
              {/* Classification filter pills including divine */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <button
                  onClick={() => setBestiaryFilterClass('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    bestiaryFilterClass === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Tất Cả ({filteredBestiary.length})
                </button>
                <button
                  onClick={() => setBestiaryFilterClass('living')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    bestiaryFilterClass === 'living'
                      ? 'bg-emerald-600 text-white font-black'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🌿 Modern Wildlife</span>
                  <span className="text-[10px] opacity-75">(Tier 1-4)</span>
                </button>
                <button
                  onClick={() => setBestiaryFilterClass('extinct')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    bestiaryFilterClass === 'extinct'
                      ? 'bg-amber-600 text-white font-black'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🦴 Prehistoric Fossils</span>
                  <span className="text-[10px] opacity-75">(Tier 5-7)</span>
                </button>
                <button
                  onClick={() => setBestiaryFilterClass('mythical')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    bestiaryFilterClass === 'mythical'
                      ? 'bg-purple-600 text-white font-black'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>✨ Mythical & Kings</span>
                  <span className="text-[10px] opacity-75">(Tier 8-11)</span>
                </button>
                <button
                  onClick={() => setBestiaryFilterClass('divine')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    bestiaryFilterClass === 'divine'
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-amber-300 hover:text-white'
                  }`}
                >
                  <span>👑 Titans, Gods & King of God</span>
                  <span className="text-[10px] opacity-85">(Tier 12-15)</span>
                </button>
              </div>

              {/* Rarity and search controls */}
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, skill, lore, habitat..."
                    value={bestiarySearch}
                    onChange={(e) => setBestiarySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  {bestiarySearch && (
                    <button
                      onClick={() => setBestiarySearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Rarity filter select */}
                <select
                  value={bestiaryFilterRarity}
                  onChange={(e) => setBestiaryFilterRarity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">Tất cả 15 Bậc Độ Hiếm</option>
                  {RARITY_TIERS.filter((tier) => tier.tier !== 'secret' || hasHatchedAnySecret).map((tier) => (
                    <option key={tier.tier} value={tier.tier}>
                      {tier.icon} {tier.nameEn} (Rank {tier.rank})
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid of creatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredBestiary.map((creature) => {
                  const rarityMeta = getRarityConfig(creature.rarity);
                  const classMeta = getClassificationConfig(creature.classification);
                  const isUnlocked = hatchedIdsSet.has(creature.name);

                  return (
                    <div
                      key={creature.id}
                      onClick={() => setInspectPet(creature)}
                      className={`p-3 rounded-2xl bg-slate-950/90 border transition-all cursor-pointer group flex flex-col justify-between ${
                        isUnlocked
                          ? 'border-slate-700 hover:border-amber-400/70 shadow-sm'
                          : 'border-slate-800/80 opacity-85 hover:opacity-100 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1.5 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                            {creature.avatarIcon}
                          </div>
                          <div className="text-right">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${rarityMeta.badgeBg} ${rarityMeta.badgeText} border ${rarityMeta.borderColor}`}>
                              {rarityMeta.icon} {rarityMeta.nameEn}
                            </span>
                            <div className="text-[9px] text-amber-300 font-mono mt-0.5">
                              {rarityMeta.starsDisplay}
                            </div>
                          </div>
                        </div>

                        <h5 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                          {creature.name}
                        </h5>
                        <p className="text-[11px] text-slate-400 italic line-clamp-1">{creature.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                          {creature.description}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                        <span className={`font-semibold ${classMeta.badgeStyle} px-1.5 py-0.5 rounded-md text-[9px]`}>
                          {classMeta.icon} {classMeta.title}
                        </span>
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> Undiscovered
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mysterious Secret Tier Notice */}
              <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-950 to-indigo-950/60 border border-purple-500/30 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-900/50 border border-purple-500/40 text-purple-300 shrink-0">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-black text-purple-300 uppercase tracking-wider">👁️ Cấp Độ Bí Mật (Secret Tier): </span>
                  Các sinh linh và cổ vật cấp Secret hoàn toàn được ẩn giấu khỏi thư tịch Bestiary! Bạn chỉ có thể khám phá danh tính và sức mạnh của chúng khi may mắn ấp nở thành công từ các quả trứng rồng cấp cao.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Creature Profile & Attack Moves Modal Overlay */}
        {inspectPet && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl text-white relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setInspectPet(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center pb-4 border-b border-slate-800">
                <div className="text-6xl mb-2">{inspectPet.avatarIcon}</div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1.5">
                  {(() => {
                    const rarityMeta = getRarityConfig(inspectPet.rarity);
                    const classMeta = getClassificationConfig(inspectPet.classification);
                    return (
                      <>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${rarityMeta.badgeBg} ${rarityMeta.badgeText} border ${rarityMeta.borderColor}`}>
                          {rarityMeta.icon} {rarityMeta.nameEn.toUpperCase()} (Rank {rarityMeta.rank})
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${classMeta.badgeStyle}`}>
                          {classMeta.icon} {classMeta.title}
                        </span>
                        {inspectPet.enchantmentLevel ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900 text-purple-200 border border-purple-500">
                            ★ {inspectPet.enchantmentLevel}/5 Stars
                          </span>
                        ) : null}
                      </>
                    );
                  })()}
                </div>
                <h4 className="text-2xl font-black text-amber-300">{inspectPet.name}</h4>
                <p className="text-xs text-slate-300 italic">{inspectPet.title}</p>
              </div>

              <div className="py-3.5 space-y-3 text-xs">
                {/* Lair Infiltration Perk */}
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/40">
                  <span className="font-bold text-emerald-300 block mb-1">
                    ⚡ Lair Infiltration Perk:
                  </span>
                  <p className="text-slate-200">{inspectPet.buffDescription}</p>
                </div>

                {/* Attack Moves (Combat Skills) */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-400 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5 text-amber-400" />
                      Combat Attack Moves
                    </span>
                    <span className="text-[10px] text-slate-400">PvP Arena Skills</span>
                  </div>

                  <div className="space-y-1.5">
                    {(inspectPet.skills || []).map((skill, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start justify-between gap-2 text-[11px]"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black ${
                              skill.type === 'ultimate'
                                ? 'text-amber-300'
                                : skill.type === 'elemental'
                                ? 'text-cyan-300'
                                : 'text-slate-200'
                            }`}>
                              {skill.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                              {skill.type}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[10px] mt-0.5">{skill.description}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-amber-400 font-black">{skill.damageMultiplier}x DMG</span>
                          {skill.rageCost ? (
                            <div className="text-[9px] text-rose-400 font-bold">-{skill.rageCost} Rage</div>
                          ) : (
                            <div className="text-[9px] text-emerald-400 font-bold">+15 Rage</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ecology and Lore */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">Habitat / Realm:</span>
                    <span className="font-semibold text-slate-200">{inspectPet.habitat || inspectPet.hatchedAt || 'Primeval Sanctuary'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">Element / Affinity:</span>
                    <span className="font-semibold text-slate-200 uppercase">{inspectPet.element || 'Wind'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Ecology & Lore:</span>
                  <p className="text-slate-300 leading-relaxed">{inspectPet.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedEnchantPetId(inspectPet.id);
                    setActiveTab('enchant');
                    setInspectPet(null);
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
                >
                  ✨ Open in Enchantment Shrine
                </button>
                {((inspectPet.level || 1) >= 20 && (inspectPet.enchantmentLevel || 0) >= 5) ? (
                  <button
                    onClick={() => {
                      setSelectedEvolvePetId(inspectPet.id);
                      setActiveTab('evolve');
                      setInspectPet(null);
                    }}
                    className="py-2 px-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500 hover:from-yellow-300 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-lg animate-pulse"
                  >
                    ⚡ Tiến Hóa Rarity
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedEvolvePetId(inspectPet.id);
                      setActiveTab('evolve');
                      setInspectPet(null);
                    }}
                    className="py-2 px-3 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    ⚡ Bệ Thờ Tiến Hóa
                  </button>
                )}
                <button
                  onClick={() => setInspectPet(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Cinematic Pet Evolution Modal with Celestial Burst & Awakening Sequence */}
        <PetEvolutionModal
          isOpen={isEvolutionModalOpen}
          pet={evolutionPet}
          preEvolutionPet={preEvolutionPet}
          isRarityEvolution={isRarityEvolutionActive}
          onClose={() => {
            setIsEvolutionModalOpen(false);
            setPreEvolutionPet(null);
            setIsRarityEvolutionActive(false);
          }}
        />
      </div>
    </div>
  );
};
