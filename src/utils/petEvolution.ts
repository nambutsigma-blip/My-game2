import { CreatureRarity, PetCompanion } from '../types';
import { RARITY_TIERS, getRarityConfig } from '../data/creaturesData';
import { calculatePetStats } from '../data/arenaData';

export const RARITY_PROGRESSION: CreatureRarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythical',
  'ultimate',
  'eternal',
  'cosmic',
  'secret',
  'king',
  'titan',
  'deity',
  'god',
  'king_of_god',
];

export interface EvolutionRequirements {
  levelMet: boolean;
  isLevelMet: boolean;
  currentLevel: number;
  targetLevel: number;
  levelNeeded: number;
  enchantMet: boolean;
  isEnchantmentMet: boolean;
  currentEnchant: number;
  currentEnchantment: number;
  targetEnchant: number;
  enchantmentNeeded: number;
  canEvolve: boolean;
  nextRarity: CreatureRarity;
  isMaxTier: boolean;
}

/**
 * Returns the next higher rarity tier in the progression.
 */
export function getNextRarity(currentRarity: CreatureRarity): CreatureRarity {
  const currentIndex = RARITY_PROGRESSION.indexOf(currentRarity);
  if (currentIndex === -1 || currentIndex >= RARITY_PROGRESSION.length - 1) {
    return 'king_of_god';
  }
  return RARITY_PROGRESSION[currentIndex + 1];
}

/**
 * Calculates the next tier rank (1 to 15) corresponding to the new rarity.
 */
export function getNextTierRank(currentTierRank: number, nextRarity: CreatureRarity): number {
  const meta = RARITY_TIERS.find((t) => t.tier === nextRarity);
  if (meta) {
    return Math.max(meta.rank, currentTierRank + 1);
  }
  return Math.min(15, currentTierRank + 1);
}

/**
 * Generates a unique, prestigious evolved icon based on the pet's existing icon and element.
 */
export function getEvolvedIcon(pet: PetCompanion, nextRarity: CreatureRarity): string {
  const icon = pet.avatarIcon || '🐾';
  const element = pet.element || 'fire';

  // Dedicated evolved icons map for known species
  const speciesEvolvedIcons: Record<string, string> = {
    '🐺': '🌌🐺⚡', // Astral Fenrir Thunder Wolf
    '🦊': '👑🦊✨', // Celestial Nine-Tailed Kitsune
    '🔥': '👑🔥🐉', // Sovereign Solar Drake
    '🐉': '👑🐉🌌', // Cosmic Void Dragon God
    '🦁': '👑🦁⚜️', // Imperial Solar Lion Sovereign
    '🐯': '👑🐯⚡', // Heavenly Byakko Thunder Tiger
    '🦅': '🪽🦅⚡', // Storm Sovereign Thunder Hawk
    '🐍': '🐉🐍💎', // Ouroboros Celestial Serpent
    '🦈': '🌊🦈⚡', // Abyssal Leviathan Megalodon
    '🦖': '🌋🦖⚡', // Primal Apex Rex Titan
    '🐢': '🗿🐢🛡️', // World Pillar Genbu Turtle
    '🐼': '👑🐼⚡', // Grandmaster Astral Panda
    '🐻': '👑🐻🗿', // Behemoth Earth Titan
    '🦉': '🔮🦉✨', // Omniscient Starlight Archon
    '🦄': '👑🦄🌈', // Rainbow Empyrean Alicorn
    '🦍': '👑🦍🌋', // Volcanic King Kong Titan
    '🕊️': '🕊️💫🪽', // Seraphim Archangel Bird
    '🐙': '🌌🐙🔮', // Cosmic Void Eldritch Kraken
    '🦚': '🪽🦚💫', // Celestial Rainbow Phoenix
    '🦋': '✨🦋🪽', // Prismatic Morpho Deity
    '🦂': '👑🦂🔥', // Underworld Magma Serket
    '🐊': '👑🐊🌊', // Sobek Nile Colossus
    '🐘': '👑🐘🗿', // Ancient Colossus Mammoth
    '🦣': '👑🦣❄️', // Glacial Mastodon Emperor
    '🐲': '👑🐲🌌', // Sovereign Void Dragon King
    '⚡': '👑⚡🌌', // Zeus Overlord Bolt
    '❄️': '👑❄️💎', // Absolute Zero Glacial Diamond
  };

  if (speciesEvolvedIcons[icon]) {
    return speciesEvolvedIcons[icon];
  }

  // If already contains a multi-emoji icon, add majesty
  if (icon.includes('👑') || icon.includes('🌌') || icon.includes('✨')) {
    return `⚡${icon}🌟`;
  }

  // Element-based ascending prefixes/suffixes
  const elementAscendancy: Record<string, string> = {
    fire: `👑${icon}🔥`,
    frost: `👑${icon}❄️`,
    thunder: `👑${icon}⚡`,
    nature: `👑${icon}🌿`,
    shadow: `👑${icon}🌑`,
    gold: `👑${icon}⚜️`,
    wind: `👑${icon}🪽`,
    cosmic: `👑${icon}🌌`,
    void: `👑${icon}🌀`,
    divine: `👑${icon}💫`,
  };

  return elementAscendancy[element] || `👑${icon}✨`;
}

/**
 * Computes an epic, evolved name for the companion form.
 */
export function getEvolvedName(baseName: string, element: string, nextRarity: CreatureRarity): string {
  // Clean existing markers
  let cleanName = baseName
    .replace(/^Thần Thú\s+/i, '')
    .replace(/^Awakened\s+/i, '')
    .replace(/^Vạn Cổ\s+/i, '')
    .replace(/\s*\(Tiến Hóa.*?\)/gi, '')
    .trim();

  const elementPrefixes: Record<string, string> = {
    fire: 'Thần Hỏa',
    frost: 'Băng Thần',
    thunder: 'Lôi Đế',
    nature: 'Linh Mộc',
    shadow: 'Dạ Thần',
    gold: 'Thánh Hoàng',
    wind: 'Phong Thần',
    cosmic: 'Tinh Vân',
    void: 'Hư Vô',
    divine: 'Chí Tôn',
  };

  const prefix = elementPrefixes[element] || 'Thần Thú';
  const rarityMeta = getRarityConfig(nextRarity);

  return `${prefix} ${cleanName} (${rarityMeta.nameEn} Awakened)`;
}

/**
 * Checks all conditions required for a pet to evolve:
 * 1. Must be Level 20 or higher
 * 2. Must be Maximum Enchantment (5 Stars)
 */
export function getEvolutionRequirements(pet: PetCompanion | null): EvolutionRequirements {
  if (!pet) {
    return {
      levelMet: false,
      isLevelMet: false,
      currentLevel: 0,
      targetLevel: 20,
      levelNeeded: 20,
      enchantMet: false,
      isEnchantmentMet: false,
      currentEnchant: 0,
      currentEnchantment: 0,
      targetEnchant: 5,
      enchantmentNeeded: 5,
      canEvolve: false,
      nextRarity: 'uncommon',
      isMaxTier: false,
    };
  }

  const currentLevel = pet.level || 1;
  const currentEnchant = pet.enchantmentLevel || 0;
  const levelMet = currentLevel >= 20;
  const enchantMet = currentEnchant >= 5;
  const nextRarity = getNextRarity(pet.rarity);
  const isMaxTier = pet.rarity === 'king_of_god';

  return {
    levelMet,
    isLevelMet: levelMet,
    currentLevel,
    targetLevel: 20,
    levelNeeded: Math.max(0, 20 - currentLevel),
    enchantMet,
    isEnchantmentMet: enchantMet,
    currentEnchant,
    currentEnchantment: currentEnchant,
    targetEnchant: 5,
    enchantmentNeeded: Math.max(0, 5 - currentEnchant),
    canEvolve: levelMet && enchantMet,
    nextRarity,
    isMaxTier,
  };
}

/**
 * Transforms a qualifying pet into its stronger, higher-tier rarity form with a unique icon.
 */
export function getEvolvedPetForm(pet: PetCompanion): PetCompanion {
  const nextRarity = getNextRarity(pet.rarity);
  const nextTierRank = getNextTierRank(pet.tierRank || 1, nextRarity);
  const uniqueIcon = getEvolvedIcon(pet, nextRarity);
  const evolvedName = getEvolvedName(pet.name, pet.element, nextRarity);
  const rarityMeta = getRarityConfig(nextRarity);

  // Boost combat skills
  const upgradedSkills = pet.skills?.map((skill) => ({
    ...skill,
    damageMultiplier: Math.round(skill.damageMultiplier * 1.45 * 10) / 10,
    description: `[Tiến Hóa] ${skill.description}`,
  })) || [
    {
      name: `${evolvedName} Nộ Long Kích`,
      type: 'ultimate' as const,
      damageMultiplier: 2.8,
      rageCost: 40,
      description: `Chiêu thức thức tỉnh giải phóng năng lượng bậc ${rarityMeta.nameEn}!`,
      element: pet.element,
    },
  ];

  // Upgraded buff description with +50% enhancement
  const evolvedBuff = `[Tiến Hóa Bậc ${rarityMeta.nameEn}] ${pet.buffDescription} • Thần Uy tăng thêm +50% sức mạnh chiến đấu!`;

  return {
    ...pet,
    name: evolvedName,
    title: `Thần Thú Thức Tỉnh • Bậc ${rarityMeta.nameEn} (Rank ${nextTierRank})`,
    rarity: nextRarity,
    tierRank: nextTierRank,
    avatarIcon: uniqueIcon,
    classification: nextTierRank >= 12 ? 'divine' : nextTierRank >= 8 ? 'mythical' : pet.classification,
    // Keep level at 20 or higher, with fresh exp bar for continued progression
    level: Math.max(20, pet.level || 20),
    exp: 0,
    maxExp: Math.round((pet.maxExp || 300) * 1.5),
    // Reset enchantment level to 0 so the evolved pet can be enchanted 5 more times in the new tier!
    enchantmentLevel: 0,
    buffDescription: evolvedBuff,
    skills: upgradedSkills,
    isEvolved: true,
    evolutionStage: ((pet as any).evolutionStage || 0) + 1,
    originalName: pet.originalName || pet.name,
    originalRarity: pet.originalRarity || pet.rarity,
    originalAvatarIcon: pet.originalAvatarIcon || pet.avatarIcon,
    hatchedAt: `${pet.hatchedAt} • Thức Tỉnh ${new Date().toLocaleDateString()}`,
  };
}

/**
 * Preview stat comparison between current pet and evolved pet form
 */
export function getEvolutionStatComparison(pet: PetCompanion) {
  const currentStats = calculatePetStats(pet);
  const previewEvolved = getEvolvedPetForm(pet);
  const evolvedBaseStats = calculatePetStats(previewEvolved);
  // Max stats when fully enchanted at the new tier
  const evolvedMaxStats = calculatePetStats({ ...previewEvolved, enchantmentLevel: 5 });

  return {
    current: currentStats,
    evolvedBase: evolvedBaseStats,
    evolvedMax: evolvedMaxStats,
    hpGain: evolvedBaseStats.maxHp - currentStats.maxHp,
    atkGain: evolvedBaseStats.atk - currentStats.atk,
    defGain: evolvedBaseStats.def - currentStats.def,
    nextRarity: previewEvolved.rarity,
    nextTierRank: previewEvolved.tierRank,
    evolvedIcon: previewEvolved.avatarIcon,
    evolvedName: previewEvolved.name,
  };
}
