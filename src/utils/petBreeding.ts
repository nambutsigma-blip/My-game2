import { PetCompanion, CreatureRarity, EggTierType, StolenEgg } from '../types';

export const RARITY_RANK_MAP: Record<CreatureRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
  mythical: 6,
  ultimate: 7,
  eternal: 8,
  cosmic: 9,
  secret: 10,
  king: 11,
  titan: 12,
  deity: 13,
  god: 14,
  king_of_god: 15,
};

export const RARITY_BASE_COST: Record<CreatureRarity, number> = {
  common: 15,
  uncommon: 25,
  rare: 45,
  epic: 70,
  legendary: 110,
  mythical: 160,
  ultimate: 220,
  eternal: 290,
  cosmic: 370,
  secret: 420,
  king: 450,
  titan: 520,
  deity: 600,
  god: 720,
  king_of_god: 850,
};

export interface BreedingOddsItem {
  eggType: EggTierType;
  nameVi: string;
  probability: number; // 0 to 100%
  color: string;
  badgeStyle: string;
}

export interface BreedingAnalysis {
  cost: number;
  originalCost: number;
  rebateDiscount: number;
  geneticScore: number;
  synergyTitle: string;
  synergyDescription: string;
  synergyBonus: number;
  mutationChance: number; // e.g. 20%
  odds: BreedingOddsItem[];
  dominantElement: string;
  canBreed: boolean;
  reason?: string;
}

// Calculate element and trait synergy between parents
export function calculateElementSynergy(
  parent1: PetCompanion,
  parent2: PetCompanion
): { title: string; desc: string; bonus: number; dominantElement: string } {
  const e1 = parent1.element || 'nature';
  const e2 = parent2.element || 'nature';

  // Same elemental resonance
  if (e1 === e2) {
    return {
      title: `Đồng Nguyên Tố (${e1.toUpperCase()})`,
      desc: 'Hai thú cưng cùng chung bản nguyên, kích phát cộng hưởng huyết thống thuần khiết +1.0 điểm!',
      bonus: 1.0,
      dominantElement: e1,
    };
  }

  // Divine / God combo
  if (
    (e1 === 'divine' || parent1.rarity === 'god' || parent1.rarity === 'king_of_god') &&
    (e2 === 'divine' || parent2.rarity === 'god' || parent2.rarity === 'king_of_god')
  ) {
    return {
      title: 'Hợp Nhất Thần Thánh (Omniverse Genesis)',
      desc: 'Cộng hưởng nguồn năng lượng sáng thế đỉnh phong, tăng mạnh cơ hội sinh trứng Vạn Thần Chi Vương!',
      bonus: 1.8,
      dominantElement: 'divine',
    };
  }

  // Fire + Frost (Steam & Thermal Dynamic)
  if ((e1 === 'fire' && e2 === 'frost') || (e1 === 'frost' && e2 === 'fire')) {
    return {
      title: 'Nhiệt Hạch Âm Dương (Thermal Steam Fusion)',
      desc: 'Lửa dung nham và băng vĩnh cửu hòa quyện tạo nên dòng năng lượng nhiệt hạch đột phá +1.2 điểm!',
      bonus: 1.2,
      dominantElement: 'cosmic',
    };
  }

  // Thunder + Void / Shadow
  if (
    (e1 === 'thunder' && (e2 === 'shadow' || e2 === 'void')) ||
    ((e1 === 'shadow' || e1 === 'void') && e2 === 'thunder')
  ) {
    return {
      title: 'Lôi Đình Hư Không (Void Thunder)',
      desc: 'Sấm sét xé toạc màn đêm hư không, khơi dậy tiềm năng thần bí cổ đại +1.4 điểm!',
      bonus: 1.4,
      dominantElement: 'thunder',
    };
  }

  // Gold + Cosmic
  if ((e1 === 'gold' && e2 === 'cosmic') || (e1 === 'cosmic' && e2 === 'gold')) {
    return {
      title: 'Kim Quang Tinh Tú (Solar Astral)',
      desc: 'Kim loại vũ trụ hấp thụ ánh sáng tinh vân, tăng cường kết tinh vỏ trứng hoàng kim +1.3 điểm!',
      bonus: 1.3,
      dominantElement: 'cosmic',
    };
  }

  // Secret entity crossover
  if (parent1.rarity === 'secret' || parent2.rarity === 'secret') {
    return {
      title: 'Ấn Ký Thần Bí (Primordial Paradox)',
      desc: 'Dấu ấn của thực thể bí mật tạo ra khe nứt không gian, kích hoạt cơ hội đột biến trứng hiếm!',
      bonus: 1.5,
      dominantElement: 'void',
    };
  }

  // Default cross-breed
  return {
    title: 'Giao Thoa Đa Nguyên Tố (Cross-Breed Harmony)',
    desc: 'Hòa trộn tinh hoa giữa hai loài sinh vật dị chủng, mang lại tính đa dạng di truyền +0.6 điểm.',
    bonus: 0.6,
    dominantElement: Math.random() < 0.5 ? e1 : e2,
  };
}

// Calculate the full breeding analysis & cost
export function analyzeBreedingPair(
  parent1: PetCompanion | null,
  parent2: PetCompanion | null,
  hatchBonusRate: number = 0,
  hatchRebate: number = 0
): BreedingAnalysis {
  if (!parent1 || !parent2) {
    return {
      cost: 0,
      originalCost: 0,
      rebateDiscount: 0,
      geneticScore: 0,
      synergyTitle: 'Chưa Đủ Cặp Phối Ngẫu',
      synergyDescription: 'Hãy chọn 2 thú cưng khác nhau để phân tích huyết thống và ước tính trứng con.',
      synergyBonus: 0,
      mutationChance: 0,
      odds: [],
      dominantElement: 'nature',
      canBreed: false,
      reason: 'Vui lòng chọn đủ 2 thú cưng.',
    };
  }

  if (parent1.id === parent2.id) {
    return {
      cost: 0,
      originalCost: 0,
      rebateDiscount: 0,
      geneticScore: 0,
      synergyTitle: 'Trùng Lặp Thú Cưng',
      synergyDescription: 'Không thể phối giống một thú cưng với chính nó. Cần chọn 2 thú cưng riêng biệt!',
      synergyBonus: 0,
      mutationChance: 0,
      odds: [],
      dominantElement: 'nature',
      canBreed: false,
      reason: 'Cần chọn 2 thú cưng khác nhau.',
    };
  }

  const rank1 = RARITY_RANK_MAP[parent1.rarity] || 1;
  const rank2 = RARITY_RANK_MAP[parent2.rarity] || 1;

  const stars1 = parent1.enchantmentLevel || 0;
  const stars2 = parent2.enchantmentLevel || 0;

  const lvl1 = parent1.level || 1;
  const lvl2 = parent2.level || 1;

  const synergy = calculateElementSynergy(parent1, parent2);

  // Cost calculation
  const baseCost1 = RARITY_BASE_COST[parent1.rarity] || 20;
  const baseCost2 = RARITY_BASE_COST[parent2.rarity] || 20;
  const rawAvgCost = (baseCost1 + baseCost2) / 2;
  const enchantCostMultiplier = 1 + (stars1 + stars2) * 0.06;
  const levelCostMultiplier = 1 + ((lvl1 + lvl2) / 40) * 0.05;

  const originalCost = Math.round(rawAvgCost * enchantCostMultiplier * levelCostMultiplier);
  const rebateDiscount = Math.round(originalCost * Math.min(0.5, Math.max(0, hatchRebate)));
  const finalCost = Math.max(15, originalCost - rebateDiscount);

  // Genetic score:
  // Base tier average (1-15)
  const baseTierAvg = (rank1 + rank2) / 2;
  // Star bonuses: up to 10 stars * 0.4 = +4.0 points!
  const starBonus = (stars1 + stars2) * 0.42;
  // Level bonuses: up to +1.2 points
  const levelBonus = ((lvl1 + lvl2) / 40) * 0.8;
  // Synergy bonus: +0.6 to +1.8
  const synBonus = synergy.bonus;

  const geneticScore = Number((baseTierAvg + starBonus + levelBonus + synBonus).toFixed(2));

  // Mutation chance: base 15% + stars * 1.5% + hatchBonus * 100%
  const mutationChance = Math.min(
    45,
    Math.round(15 + (stars1 + stars2) * 1.5 + hatchBonusRate * 50)
  );

  // Compute odds for egg tiers based on genetic score
  const odds: BreedingOddsItem[] = [];

  const addOdd = (
    eggType: EggTierType,
    nameVi: string,
    prob: number,
    color: string,
    badgeStyle: string
  ) => {
    if (prob > 0) {
      odds.push({ eggType, nameVi, probability: Math.round(prob), color, badgeStyle });
    }
  };

  const hasSecretGene = parent1.rarity === 'secret' || parent2.rarity === 'secret';

  if (geneticScore >= 14.5) {
    // Supreme tier (King of Gods / God)
    addOdd('king_of_god', 'Trứng Vạn Thần Chi Vương', 70, '#c084fc', 'bg-purple-900/80 text-amber-300 border-amber-400');
    addOdd('god', 'Trứng Sáng Thế Tối Cao', 25, '#facc15', 'bg-amber-900/80 text-yellow-300 border-yellow-400');
    addOdd('deity', 'Trứng Thần Linh Thượng Giới', 5, '#38bdf8', 'bg-cyan-900/80 text-cyan-200 border-cyan-400');
  } else if (geneticScore >= 13.0) {
    addOdd('king_of_god', 'Trứng Vạn Thần Chi Vương', 35, '#c084fc', 'bg-purple-900/80 text-amber-300 border-amber-400');
    addOdd('god', 'Trứng Sáng Thế Tối Cao', 45, '#facc15', 'bg-amber-900/80 text-yellow-300 border-yellow-400');
    addOdd('deity', 'Trứng Thần Linh Thượng Giới', 15, '#38bdf8', 'bg-cyan-900/80 text-cyan-200 border-cyan-400');
    addOdd('titan', 'Trứng Nham Thạch Cổ Đại', 5, '#f97316', 'bg-orange-950/80 text-orange-200 border-orange-500');
  } else if (geneticScore >= 11.5) {
    addOdd('king_of_god', 'Trứng Vạn Thần Chi Vương', 12, '#c084fc', 'bg-purple-900/80 text-amber-300 border-amber-400');
    addOdd('god', 'Trứng Sáng Thế Tối Cao', 30, '#facc15', 'bg-amber-900/80 text-yellow-300 border-yellow-400');
    addOdd('deity', 'Trứng Thần Linh Thượng Giới', 35, '#38bdf8', 'bg-cyan-900/80 text-cyan-200 border-cyan-400');
    addOdd('titan', 'Trứng Nham Thạch Cổ Đại', 18, '#f97316', 'bg-orange-950/80 text-orange-200 border-orange-500');
    if (hasSecretGene) {
      addOdd('secret', 'Trứng Thần Bí Nguyên Bản', 5, '#a855f7', 'bg-purple-950/80 text-purple-300 border-purple-500');
    }
  } else if (geneticScore >= 10.0) {
    addOdd('god', 'Trứng Sáng Thế Tối Cao', 10, '#facc15', 'bg-amber-900/80 text-yellow-300 border-yellow-400');
    addOdd('deity', 'Trứng Thần Linh Thượng Giới', 30, '#38bdf8', 'bg-cyan-900/80 text-cyan-200 border-cyan-400');
    addOdd('titan', 'Trứng Nham Thạch Cổ Đại', 35, '#f97316', 'bg-orange-950/80 text-orange-200 border-orange-500');
    addOdd('king', 'Trứng Vương Giả Hoàng Triều', 20, '#eab308', 'bg-yellow-950/80 text-yellow-200 border-yellow-500');
    if (hasSecretGene) {
      addOdd('secret', 'Trứng Thần Bí Nguyên Bản', 5, '#a855f7', 'bg-purple-950/80 text-purple-300 border-purple-500');
    }
  } else if (geneticScore >= 8.5) {
    addOdd('deity', 'Trứng Thần Linh Thượng Giới', 12, '#38bdf8', 'bg-cyan-900/80 text-cyan-200 border-cyan-400');
    addOdd('titan', 'Trứng Nham Thạch Cổ Đại', 30, '#f97316', 'bg-orange-950/80 text-orange-200 border-orange-500');
    addOdd('king', 'Trứng Vương Giả Hoàng Triều', 35, '#eab308', 'bg-yellow-950/80 text-yellow-200 border-yellow-500');
    addOdd('golden', 'Trứng Rồng Hoàng Kim', 23, '#f59e0b', 'bg-amber-950/80 text-amber-200 border-amber-500');
  } else if (geneticScore >= 6.5) {
    addOdd('titan', 'Trứng Nham Thạch Cổ Đại', 10, '#f97316', 'bg-orange-950/80 text-orange-200 border-orange-500');
    addOdd('king', 'Trứng Vương Giả Hoàng Triều', 25, '#eab308', 'bg-yellow-950/80 text-yellow-200 border-yellow-500');
    addOdd('golden', 'Trứng Rồng Hoàng Kim', 45, '#f59e0b', 'bg-amber-950/80 text-amber-200 border-amber-500');
    addOdd('silver', 'Trứng Rồng Băng Ngân', 20, '#2dd4bf', 'bg-teal-950/80 text-teal-200 border-teal-500');
  } else if (geneticScore >= 4.5) {
    addOdd('king', 'Trứng Vương Giả Hoàng Triều', 8, '#eab308', 'bg-yellow-950/80 text-yellow-200 border-yellow-500');
    addOdd('golden', 'Trứng Rồng Hoàng Kim', 32, '#f59e0b', 'bg-amber-950/80 text-amber-200 border-amber-500');
    addOdd('silver', 'Trứng Rồng Băng Ngân', 45, '#2dd4bf', 'bg-teal-950/80 text-teal-200 border-teal-500');
    addOdd('common', 'Trứng Rồng Bích Ngọc', 15, '#10b981', 'bg-emerald-950/80 text-emerald-200 border-emerald-500');
  } else {
    // Beginner tier
    addOdd('golden', 'Trứng Rồng Hoàng Kim', 10, '#f59e0b', 'bg-amber-950/80 text-amber-200 border-amber-500');
    addOdd('silver', 'Trứng Rồng Băng Ngân', 40, '#2dd4bf', 'bg-teal-950/80 text-teal-200 border-teal-500');
    addOdd('common', 'Trứng Rồng Bích Ngọc', 50, '#10b981', 'bg-emerald-950/80 text-emerald-200 border-emerald-500');
  }

  // Normalize probability so sum is 100%
  const totalProb = odds.reduce((sum, item) => sum + item.probability, 0);
  if (totalProb > 0 && totalProb !== 100) {
    odds[0].probability += 100 - totalProb;
  }

  return {
    cost: finalCost,
    originalCost,
    rebateDiscount,
    geneticScore,
    synergyTitle: synergy.title,
    synergyDescription: synergy.desc,
    synergyBonus: synergy.bonus,
    mutationChance,
    odds,
    dominantElement: synergy.dominantElement,
    canBreed: true,
  };
}

// Execute the breeding procedure and produce a new egg
export function executeBreedingPair(
  parent1: PetCompanion,
  parent2: PetCompanion,
  hatchBonusRate: number = 0,
  hatchRebate: number = 0
): { newEgg: StolenEgg; isMutated: boolean; chosenOdds: BreedingOddsItem } {
  const analysis = analyzeBreedingPair(parent1, parent2, hatchBonusRate, hatchRebate);

  // Check lucky mutation roll
  const mutationRoll = Math.random() * 100;
  const isMutated = mutationRoll < analysis.mutationChance;

  // Weighted random roll from odds table
  const roll = Math.random() * 100;
  let accumulated = 0;
  let chosenOdds: BreedingOddsItem = analysis.odds[0];

  for (const item of analysis.odds) {
    accumulated += item.probability;
    if (roll <= accumulated) {
      chosenOdds = item;
      break;
    }
  }

  // If mutated, elevate the egg tier by 1 step if not already king_of_god
  let finalEggType: EggTierType = chosenOdds.eggType;
  if (isMutated) {
    const tierOrder: EggTierType[] = ['common', 'silver', 'golden', 'king', 'titan', 'deity', 'god', 'king_of_god'];
    const currIdx = tierOrder.indexOf(finalEggType);
    if (currIdx >= 0 && currIdx < tierOrder.length - 1) {
      finalEggType = tierOrder[currIdx + 1];
    }
  }

  const eggId = `egg_bred_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const newEgg: StolenEgg = {
    id: eggId,
    unitId: `breeding_${parent1.id.slice(0, 4)}_${parent2.id.slice(0, 4)}`,
    unitTitle: `Lai Tạo: ${parent1.name} × ${parent2.name}`,
    eggType: finalEggType,
    obtainedScore: 10,
    stolenAt: new Date().toISOString(),
    isHatched: false,
    isBredEgg: true,
    parent1Name: parent1.name,
    parent1Avatar: parent1.avatarIcon,
    parent2Name: parent2.name,
    parent2Avatar: parent2.avatarIcon,
    mutationBonus: isMutated,
  };

  return {
    newEgg,
    isMutated,
    chosenOdds,
  };
}
