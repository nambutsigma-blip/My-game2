import { PokemonBattleMove, PetCompanion } from '../types';

export interface PokemonTypeEffectiveness {
  [attackerType: string]: {
    strongAgainst: string[]; // 2.0x
    weakAgainst: string[];   // 0.5x
  };
}

export const POKEMON_TYPE_CHART: PokemonTypeEffectiveness = {
  fire: {
    strongAgainst: ['nature', 'frost'],
    weakAgainst: ['fire', 'thunder'],
  },
  frost: {
    strongAgainst: ['nature', 'wind', 'fire'],
    weakAgainst: ['frost'],
  },
  thunder: {
    strongAgainst: ['frost', 'wind'],
    weakAgainst: ['nature', 'thunder'],
  },
  nature: {
    strongAgainst: ['thunder', 'gold'],
    weakAgainst: ['fire', 'frost'],
  },
  wind: {
    strongAgainst: ['nature', 'thunder'],
    weakAgainst: ['frost'],
  },
  shadow: {
    strongAgainst: ['cosmic', 'divine', 'gold'],
    weakAgainst: ['void'],
  },
  void: {
    strongAgainst: ['shadow', 'cosmic'],
    weakAgainst: ['divine'],
  },
  cosmic: {
    strongAgainst: ['void', 'shadow'],
    weakAgainst: ['divine'],
  },
  gold: {
    strongAgainst: ['wind', 'frost'],
    weakAgainst: ['nature', 'shadow'],
  },
  divine: {
    strongAgainst: ['shadow', 'void', 'fire'],
    weakAgainst: [],
  },
};

export const calculateTypeMultiplier = (moveType: string, defenderElement: string): number => {
  const chart = POKEMON_TYPE_CHART[moveType.toLowerCase()];
  if (!chart) return 1.0;
  if (chart.strongAgainst.includes(defenderElement.toLowerCase())) return 2.0;
  if (chart.weakAgainst.includes(defenderElement.toLowerCase())) return 0.65;
  return 1.0;
};

// Generate 4 moves for any Pet Companion based on their element and tier
export const generatePetPokemonMoves = (pet: PetCompanion): PokemonBattleMove[] => {
  const elem = pet.element || 'fire';

  // 1. Move 1: Physical signature attack
  const move1: PokemonBattleMove = {
    id: 'phys_1',
    name:
      elem === 'fire'
        ? 'Nanh Vuốt Hỏa Ngục'
        : elem === 'frost'
        ? 'Nanh Băng Cực Hàn'
        : elem === 'thunder'
        ? 'Cào Xé Lôi Điện'
        : elem === 'nature'
        ? 'Trảo Kích Thần Mộc'
        : elem === 'shadow' || elem === 'void'
        ? 'Vuốt Quỷ Hư Vô'
        : 'Cú Đấm Sấm Sét',
    type: 'normal',
    category: 'physical',
    power: 50,
    accuracy: 100,
    pp: 25,
    currentPp: 25,
    description: 'Đòn tấn công cận chiến tốc độ cao với độ chính xác tuyệt đối.',
    animation: 'strike',
  };

  // 2. Move 2: Elemental Special Beam (Khắc hệ)
  const move2: PokemonBattleMove = {
    id: 'spec_2',
    name:
      elem === 'fire'
        ? 'Hỏa Diễm Phun Trào (Flamethrower)'
        : elem === 'frost'
        ? 'Bão Tuyết Cực Hàn (Blizzard)'
        : elem === 'thunder'
        ? 'Lôi Đình 10 Vạn Vôn (Thunderbolt)'
        : elem === 'nature'
        ? 'Lá Cắt Thái Sơ (Leaf Blade)'
        : elem === 'shadow' || elem === 'void'
        ? 'Hắc Ám Ba Động (Dark Pulse)'
        : elem === 'wind'
        ? 'Cuồng Phong Lốc Xoáy (Hurricane)'
        : 'Phán Quyết Quang Minh (Solar Beam)',
    type: (['fire', 'frost', 'thunder', 'nature', 'wind', 'shadow', 'cosmic'].includes(elem)
      ? elem
      : 'fire') as PokemonBattleMove['type'],
    category: 'special',
    power: 85,
    accuracy: 95,
    pp: 15,
    currentPp: 15,
    description: 'Bắn tia năng lượng nguyên tố cực mạnh, gây sát thương x2 nếu khắc hệ đối thủ!',
    statusEffect: elem === 'fire' ? 'burn' : elem === 'thunder' ? 'paralyze' : elem === 'frost' ? 'freeze' : undefined,
    statusChance: 0.25,
    animation: 'beam',
  };

  // 3. Move 3: Strategic Buff or Heal or Status
  const move3: PokemonBattleMove = {
    id: 'stat_3',
    name:
      elem === 'fire' || elem === 'thunder'
        ? 'Vũ Điệu Long Thần (Dragon Dance)'
        : elem === 'frost' || elem === 'nature'
        ? 'Phục Sinh Trị Liệu (Synthesis)'
        : elem === 'shadow' || elem === 'void'
        ? 'Sương Mù Phân Thân (Shadow Clone)'
        : 'Thiết Giáp Bất Hoại (Iron Defense)',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 10,
    currentPp: 10,
    description:
      elem === 'frost' || elem === 'nature'
        ? 'Hồi phục ngay lập tức 35% lượng máu tối đa của bản thân.'
        : 'Tăng 45% sức tấn công và tăng tốc độ ra chiêu trong 3 lượt kế tiếp!',
    statusEffect: elem === 'frost' || elem === 'nature' ? 'heal' : 'attack_boost',
    animation: 'buff',
  };

  // 4. Move 4: Ultimate Z-Move / Finisher
  const move4: PokemonBattleMove = {
    id: 'ult_4',
    name:
      elem === 'fire'
        ? 'Hỏa Long Thiêu Thế (Inferno Overdrive)'
        : elem === 'frost'
        ? 'Tuyệt Đối Băng Phong (Subzero Slammer)'
        : elem === 'thunder'
        ? 'Gigavolt Lôi Thiên (Gigavolt Havoc)'
        : elem === 'shadow' || elem === 'void'
        ? 'Hố Đen Diệt Tuyệt (Black Hole Eclipse)'
        : 'Thiên Thạch Rơi (Draco Meteor)',
    type: (['fire', 'frost', 'thunder', 'nature', 'wind', 'shadow', 'cosmic'].includes(elem)
      ? elem
      : 'cosmic') as PokemonBattleMove['type'],
    category: 'special',
    power: 140,
    accuracy: 85,
    pp: 5,
    currentPp: 5,
    description: 'Tuyệt kỹ tối thượng mang sức hủy diệt diện rộng, tiêu hao nhiều năng lượng.',
    animation: 'burst',
  };

  return [move1, move2, move3, move4];
};

// 8 Pokemon Gym Leaders with authentic Pokemon Trainer teams
export interface PokemonGymLeader {
  id: string;
  name: string;
  title: string;
  badge: string;
  badgeIcon: string;
  trainerAvatar: string;
  dialogueIntro: string;
  dialogueVictory: string;
  rewardCrystals: number;
  rewardExp: number;
  pet: PetCompanion;
}

export const GYM_LEADERS: PokemonGymLeader[] = [
  {
    id: 'gym_1',
    name: 'Thủ Lĩnh Brock',
    title: 'Thủ Lĩnh Võ Đài Nham Thạch (Pewter Arena)',
    badge: 'Huy Hiệu Đá (Boulder Badge)',
    badgeIcon: '🪨',
    trainerAvatar: '🧗‍♂️',
    dialogueIntro: 'Phòng ngự của ta kiên cố như bàn thạch! Hãy cho ta thấy sức mạnh của linh thú ngươi!',
    dialogueVictory: 'Ý chí rực cháy của ngươi đã xuyên thủng tảng đá kiên cố nhất! Xin hãy nhận huy hiệu này!',
    rewardCrystals: 60,
    rewardExp: 100,
    pet: {
      id: 'gym_pet_1',
      name: 'Onix Nham Thạch',
      title: 'Xà Vương Thạch Nham',
      rarity: 'rare',
      classification: 'living',
      element: 'nature',
      buffDescription: '+20% Giáp',
      hatchedAt: new Date().toISOString(),
      description: 'Cơ thể kết thành từ chuỗi đá hoa cương khổng lồ.',
      avatarIcon: '🪨',
      tierRank: 3,
      level: 15,
      appearance: {
        archetype: 'serpent',
        primaryColor: '#78716c',
        secondaryColor: '#a8a29e',
        pattern: 'scales',
        headAccessory: 'horns',
        backWing: 'none',
        auraEffect: 'none',
      },
    },
  },
  {
    id: 'gym_2',
    name: 'Thủ Lĩnh Misty',
    title: 'Nàng Tiên Thủy Tộc (Cerulean Arena)',
    badge: 'Huy Hiệu Thác Nước (Cascade Badge)',
    badgeIcon: '💧',
    trainerAvatar: '🧜‍♀️',
    dialogueIntro: 'Nước mềm mại nhưng có thể bào mòn kim loại! Thủy thú của ta sẽ dập tắt ngọn lửa của ngươi!',
    dialogueVictory: 'Tuyệt vời! Dòng nước của ta đã hoàn toàn bị chinh phục trước chiến thuật của ngươi!',
    rewardCrystals: 100,
    rewardExp: 180,
    pet: {
      id: 'gym_pet_2',
      name: 'Starmie Hải Tinh',
      title: 'Ngôi Sao Biển Huyền Bí',
      rarity: 'epic',
      classification: 'living',
      element: 'frost',
      buffDescription: '+30% Băng Sát',
      hatchedAt: new Date().toISOString(),
      description: 'Lõi hồng ngọc giữa thân phát sáng lấp lánh như 7 sắc cầu vồng.',
      avatarIcon: '⭐',
      tierRank: 5,
      level: 24,
      appearance: {
        archetype: 'turtle',
        primaryColor: '#0284c7',
        secondaryColor: '#38bdf8',
        pattern: 'stars',
        headAccessory: 'crown',
        backWing: 'fairy_wings',
        auraEffect: 'frost',
      },
    },
  },
  {
    id: 'gym_3',
    name: 'Trung Úy Surge',
    title: 'Tia Chớp Lôi Đình (Vermilion Arena)',
    badge: 'Huy Hiệu Sấm Sét (Thunder Badge)',
    badgeIcon: '⚡',
    trainerAvatar: '⚡',
    dialogueIntro: 'Tốc độ và dòng điện 10 vạn vôn sẽ làm tê liệt bất kỳ đối thủ nào dám bước vào sân đấu!',
    dialogueVictory: 'Cậu bé... ngươi thật sự có sức mạnh vượt qua cơn bão sấm sét!',
    rewardCrystals: 150,
    rewardExp: 260,
    pet: {
      id: 'gym_pet_3',
      name: 'Raichu Kim Lôi',
      title: 'Lôi Thú Hoàng Kim',
      rarity: 'legendary',
      classification: 'mythical',
      element: 'thunder',
      buffDescription: '+40% Tốc độ đánh',
      hatchedAt: new Date().toISOString(),
      description: 'Đuôi tích trữ lượng điện thế hàng ngàn vôn sẵn sàng phóng ra.',
      avatarIcon: '⚡',
      tierRank: 7,
      level: 35,
      appearance: {
        archetype: 'wolf',
        primaryColor: '#eab308',
        secondaryColor: '#facc15',
        pattern: 'stripes',
        headAccessory: 'ninja_band',
        backWing: 'energy_blades',
        auraEffect: 'sparks',
      },
    },
  },
  {
    id: 'gym_4',
    name: 'Thủ Lĩnh Erika',
    title: 'Quý Cô Rừng Thiêng (Celadon Arena)',
    badge: 'Huy Hiệu Cầu Vồng (Rainbow Badge)',
    badgeIcon: '🌈',
    trainerAvatar: '🌸',
    dialogueIntro: 'Hương thơm thảo mộc và sinh mệnh tự nhiên sẽ đưa linh thú của bạn vào giấc ngủ êm đềm...',
    dialogueVictory: 'Sức sống của bạn thật mãnh liệt, nở rộ như những đóa hoa rực rỡ nhất!',
    rewardCrystals: 220,
    rewardExp: 380,
    pet: {
      id: 'gym_pet_4',
      name: 'Vileplume Thần Dược',
      title: 'Hoa Thần Thái Sơ',
      rarity: 'legendary',
      classification: 'mythical',
      element: 'nature',
      buffDescription: '+50% Tự Hồi Phục',
      hatchedAt: new Date().toISOString(),
      description: 'Phấn hoa có khả năng chữa lành và điều khiển sinh mệnh vạn vật.',
      avatarIcon: '🌺',
      tierRank: 8,
      level: 45,
      appearance: {
        archetype: 'kitsune',
        primaryColor: '#059669',
        secondaryColor: '#34d399',
        pattern: 'runes',
        headAccessory: 'flower_wreath',
        backWing: 'fairy_wings',
        auraEffect: 'nature_leaves',
      },
    },
  },
  {
    id: 'gym_5',
    name: 'Thủ Lĩnh Blaine',
    title: 'Ngọn Lửa Cuồng Nhiệt (Cinnabar Arena)',
    badge: 'Huy Hiệu Núi Lửa (Volcano Badge)',
    badgeIcon: '🌋',
    trainerAvatar: '🔥',
    dialogueIntro: 'Núi lửa Cinnabar chuẩn bị phun trào! Ngươi có chịu nổi sức nóng 2000 độ C không?!',
    dialogueVictory: 'Nóng bỏng quá! Tinh thần chiến đấu của ngươi thậm chí còn nóng hơn cả dung nham!',
    rewardCrystals: 300,
    rewardExp: 500,
    pet: {
      id: 'gym_pet_5',
      name: 'Magmar Hỏa Ngục',
      title: 'Dung Nham Thao Thiết',
      rarity: 'secret',
      classification: 'mythical',
      element: 'fire',
      buffDescription: '+60% Thiêu Đốt',
      hatchedAt: new Date().toISOString(),
      description: 'Hơi thở mang theo tàn lửa dung nham có thể nung chảy đá hoa cương.',
      avatarIcon: '🔥',
      tierRank: 10,
      level: 56,
      appearance: {
        archetype: 'dragon',
        primaryColor: '#ef4444',
        secondaryColor: '#f97316',
        pattern: 'scales',
        headAccessory: 'horns',
        backWing: 'dragon_wings',
        auraEffect: 'flames',
      },
    },
  },
  {
    id: 'gym_6',
    name: 'Bậc Thầy Cynthia',
    title: 'Nhà Vô Địch Tối Cao (Champion Cynthia)',
    badge: 'Cúp Quán Quân Thế Giới (Champion Trophy)',
    badgeIcon: '🏆',
    trainerAvatar: '👑',
    dialogueIntro: 'Chào mừng người thách đấu cuối cùng! Ta và Garchomp Hoàng Gia đã đợi khoảnh khắc này rất lâu rồi!',
    dialogueVictory: 'Một trận đấu lịch sử! Ngươi chính là Bậc Thầy Huấn Luyện Pet Huyền Thoại mới của thế giới này!',
    rewardCrystals: 600,
    rewardExp: 1000,
    pet: {
      id: 'gym_pet_6',
      name: 'Garchomp Tối Thượng',
      title: 'Long Thần Chiến Trận',
      rarity: 'king_of_god',
      classification: 'divine',
      element: 'cosmic',
      buffDescription: '+100% Mọi Chỉ Số',
      hatchedAt: new Date().toISOString(),
      description: 'Linh thú thần thoại đứng trên đỉnh cao của chuỗi tiến hóa linh thú.',
      avatarIcon: '🐲',
      tierRank: 15,
      level: 75,
      appearance: {
        archetype: 'celestial',
        primaryColor: '#4f46e5',
        secondaryColor: '#ec4899',
        pattern: 'runes',
        headAccessory: 'crown',
        backWing: 'energy_blades',
        auraEffect: 'starlight',
      },
    },
  },
];
