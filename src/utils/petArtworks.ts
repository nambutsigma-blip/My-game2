import dragonImg from '../assets/images/divine_dragon_pet_1790255326523.jpg';
import phoenixImg from '../assets/images/flame_phoenix_pet_1790255341848.jpg';
import kitsuneImg from '../assets/images/nine_tailed_fox_pet_1790255355171.jpg';
import voidDemonImg from '../assets/images/abyss_void_demon_1790255375556.jpg';
import crystalGolemImg from '../assets/images/crystal_titan_golem_1790255389852.jpg';
import pegasusImg from '../assets/images/celestial_pegasus_art_1790255404000.jpg';
import leviathanImg from '../assets/images/leviathan_serpent_art_1790255419184.jpg';
import mechaImg from '../assets/images/cyber_mecha_beast_1790255435624.jpg';
import celestialGodImg from '../assets/images/golden_celestial_god_1790255452779.jpg';
import turtleImg from '../assets/images/mystic_turtle_beast_1790255473611.jpg';
import wolfImg from '../assets/images/fantasy_wolf_pet_1790256249406.jpg';
import tigerImg from '../assets/images/royal_tiger_beast_1790256266034.jpg';
import eagleImg from '../assets/images/celestial_eagle_pet_1790256280158.jpg';
import dinosaurImg from '../assets/images/apex_dinosaur_pet_1790256293107.jpg';
import megalodonImg from '../assets/images/megalodon_beast_1790256309474.jpg';
import unicornImg from '../assets/images/holy_unicorn_deer_1790256325994.jpg';
import bearImg from '../assets/images/armored_bear_pet_1790256342471.jpg';
import voidOverlordImg from '../assets/images/void_overlord_god_1790256356064.jpg';

import { PetArchetype } from '../types';
import { DISTINCT_PET_ARTWORKS, getDistinctArtworkForPet } from './distinctSpeciesArtworks';

export interface CreatureArtworkPreset {
  id: string;
  name: string;
  archetype: PetArchetype;
  imageUrl: string;
  element: string;
  tag: string;
  description: string;
}

export const ARCHETYPE_ARTWORK_MAP: Record<PetArchetype, string> = {
  dragon: dragonImg,
  ancient_dragon: dragonImg,
  phoenix: phoenixImg,
  shadow_phoenix: eagleImg,
  kitsune: kitsuneImg,
  void_fiend: voidDemonImg,
  crystal_golem: crystalGolemImg,
  pegasus: pegasusImg,
  celestial: celestialGodImg,
  serpent: leviathanImg,
  leviathan: megalodonImg,
  mecha: mechaImg,
  turtle: turtleImg,
  behemoth: dinosaurImg,
  divine_lion: unicornImg,
  wolf: wolfImg,
  tiger: tigerImg,
};

export const CREATURE_ARTWORK_GALLERY: CreatureArtworkPreset[] = [
  {
    id: 'divine_golden_dragon',
    name: 'Thần Long Hoàng Kim Bất Diệt',
    archetype: 'ancient_dragon',
    imageUrl: dragonImg,
    element: 'divine',
    tag: '👑 Thần Tộc',
    description: 'Chân long viễn cổ mang vảy rồng hoàng kim rực sáng, sừng ngọc và lôi điện thái sơ.',
  },
  {
    id: 'flame_infernal_phoenix',
    name: 'Hỏa Phượng Hoàng Niết Bàn',
    archetype: 'phoenix',
    imageUrl: phoenixImg,
    element: 'fire',
    tag: '🔥 Hỏa Ngục',
    description: 'Bá vương bầu trời tái sinh từ ngọn lửa niết bàn bất tử, lông vũ rực cháy ngút trời.',
  },
  {
    id: 'nine_tailed_celestial_kitsune',
    name: 'Cửu Vĩ Linh Hồ Tiên Cảnh',
    archetype: 'kitsune',
    imageUrl: kitsuneImg,
    element: 'nature',
    tag: '🌸 Tiên Giới',
    description: 'Linh hồ chín đuôi ảo mộng toả tiên khí và ngọc bội linh hồn hộ mệnh.',
  },
  {
    id: 'fantasy_timber_wolf',
    name: 'Hàn Băng Nguyệt Lang Cổ Đại',
    archetype: 'wolf',
    imageUrl: wolfImg,
    element: 'frost',
    tag: '🐺 Nguyệt Lang',
    description: 'Thủ lĩnh bầy sói hoang nguyên tuyết trắng với ánh mắt sáng rực và móng vuốt băng lam.',
  },
  {
    id: 'royal_thunder_tiger',
    name: 'Bạch Hổ Hoàng Gia Lôi Điện',
    archetype: 'tiger',
    imageUrl: tigerImg,
    element: 'thunder',
    tag: '🐯 Vương Thú',
    description: 'Bá chủ rừng sâu với vằn lông phát sáng tia chớp hoàng kim và tiếng gầm chấn động.',
  },
  {
    id: 'celestial_solar_eagle',
    name: 'Thiên Hạc Thái Dương Kim Bằng',
    archetype: 'shadow_phoenix',
    imageUrl: eagleImg,
    element: 'wind',
    tag: '🦅 Phi Thiên',
    description: 'Thần điêu sải cánh rẽ mây với ánh sáng mặt trời soi rọi mọi ngõ ngách trần gian.',
  },
  {
    id: 'apex_tyranno_dinosaur',
    name: 'Bạo Long Cổ Đại Titan',
    archetype: 'behemoth',
    imageUrl: dinosaurImg,
    element: 'nature',
    tag: '🦖 Viễn Cổ',
    description: 'Chúa tể săn mồi kỷ Phấn Trắng với lớp giáp sừng kiên cố và lực cắn nghiền nát đá tảng.',
  },
  {
    id: 'abyss_megalodon_beast',
    name: 'Thủy Quái Megalodon Vực Thẳm',
    archetype: 'leviathan',
    imageUrl: megalodonImg,
    element: 'frost',
    tag: '🦈 Hải Hoàng',
    description: 'Cự thú thống trị biển sâu với hàm răng gai sắc bén và dòng xoáy ngầm cuồng bạo.',
  },
  {
    id: 'holy_unicorn_celestial_deer',
    name: 'Kỳ Lân Thánh Thần Ánh Sáng',
    archetype: 'divine_lion',
    imageUrl: unicornImg,
    element: 'divine',
    tag: '🦄 Thánh Quang',
    description: 'Thần thú hộ mệnh ban phước lành với sừng pha lê tỏa hào quang thanh tẩy tà khí.',
  },
  {
    id: 'armored_colossus_bear',
    name: 'Hắc Hùng Chiến Giáp Băng Sơn',
    archetype: 'crystal_golem',
    imageUrl: bearImg,
    element: 'frost',
    tag: '🐻 Cự Lực',
    description: 'Gấu thần bọc giáp thép băng giá, sức mạnh ngàn cân trấn giữ biên giới bắc vực.',
  },
  {
    id: 'void_overlord_god_king',
    name: 'Vạn Thần Chi Vương Hư Vô Tối Cao',
    archetype: 'celestial',
    imageUrl: voidOverlordImg,
    element: 'void',
    tag: '👑 Tối Thượng',
    description: 'Thực thể vô thượng ngự trị trên đỉnh phong hỗn mang, nắm giữ quyền năng sáng thế và hủy diệt.',
  },
  {
    id: 'abyss_void_demon_lord',
    name: 'Ma Thần Vực Thẳm Hư Vô',
    archetype: 'void_fiend',
    imageUrl: voidDemonImg,
    element: 'void',
    tag: '😈 Hư Vô',
    description: 'Chúa tể hắc ám thức tỉnh từ đáy vực hư không với sừng quỷ và đôi cánh bóng tối.',
  },
  {
    id: 'crystal_titan_ancient_golem',
    name: 'Cự Thần Tinh Thể Băng Lôi',
    archetype: 'crystal_golem',
    imageUrl: crystalGolemImg,
    element: 'frost',
    tag: '💎 Thái Cổ',
    description: 'Thần hộ vệ bằng đá pha lê xanh khổng lồ tích tụ năng lượng ngàn năm.',
  },
  {
    id: 'celestial_starlight_pegasus',
    name: 'Thiên Mã Tinh Tú Bạch Kim',
    archetype: 'pegasus',
    imageUrl: pegasusImg,
    element: 'cosmic',
    tag: '✨ Vũ Trụ',
    description: 'Ngựa thần có cánh lướt qua dải ngân hà với cánh cầu vồng quang phổ thần thánh.',
  },
  {
    id: 'deep_sea_leviathan_serpent',
    name: 'Hải Thần Leviathan Bích Ngọc',
    archetype: 'serpent',
    imageUrl: leviathanImg,
    element: 'frost',
    tag: '🌊 Biển Sâu',
    description: 'Mãng xà thủy quái đại dương với vảy bích ngọc lân tinh phát sáng rực rỡ.',
  },
  {
    id: 'cyber_mecha_beast_titan',
    name: 'Chiến Giáp Mecha Tân Thế Giới',
    archetype: 'mecha',
    imageUrl: mechaImg,
    element: 'thunder',
    tag: '🤖 Cơ Khí',
    description: 'Chiến thú công nghệ cao với giáp titan lượng tử và động cơ đẩy plasma tối tân.',
  },
  {
    id: 'supreme_celestial_godhead',
    name: 'Sáng Thế Thần Vương Vô Cực',
    archetype: 'celestial',
    imageUrl: celestialGodImg,
    element: 'gold',
    tag: '⭐ Tối Cao',
    description: 'Hiện thân của trật tự vũ trụ với vương miện hoàng kim và hào quang đa sắc.',
  },
  {
    id: 'mystic_mountain_turtle_beast',
    name: 'Huyền Vũ Thần Quy Thạch Sơn',
    archetype: 'turtle',
    imageUrl: turtleImg,
    element: 'nature',
    tag: '🛡️ Trấn Thủ',
    description: 'Thần thú hộ sơn mang trên lưng cổ thạch ngàn năm, phòng thủ bất khả xâm phạm.',
  },
];

export const getExclusiveArtworkForCreature = (creature?: {
  id?: string;
  templateId?: string;
  name?: string;
  title?: string;
  description?: string;
  element?: string;
  rarity?: string;
  tierRank?: number;
  imageUrl?: string;
  appearance?: { customArtworkUrl?: string; archetype?: PetArchetype };
}): string => {
  if (!creature) return dragonImg;

  // 1. Direct templateId or id match in 100% individual artworks registry
  if (creature.templateId && DISTINCT_PET_ARTWORKS[creature.templateId]) {
    return DISTINCT_PET_ARTWORKS[creature.templateId];
  }
  if (creature.id && DISTINCT_PET_ARTWORKS[creature.id]) {
    return DISTINCT_PET_ARTWORKS[creature.id];
  }

  // 2. Direct custom artwork URL if specifically provided
  if (creature.appearance?.customArtworkUrl && creature.appearance.customArtworkUrl.trim().length > 0) {
    return creature.appearance.customArtworkUrl;
  }
  if (creature.imageUrl && creature.imageUrl.trim().length > 0) {
    return creature.imageUrl;
  }

  // 2. Archetype map if defined
  if (creature.appearance?.archetype && ARCHETYPE_ARTWORK_MAP[creature.appearance.archetype]) {
    return ARCHETYPE_ARTWORK_MAP[creature.appearance.archetype];
  }

  // 3. ID and species based exclusive assignment
  const id = (creature.templateId || creature.id || '').toLowerCase();
  const text = `${creature.name || ''} ${creature.title || ''} ${creature.description || ''} ${id}`.toLowerCase();

  // Distinct species mappings
  if (id.includes('wolf') || text.includes('wolf') || text.includes('sói') || text.includes('hound') || text.includes('canine')) {
    return wolfImg;
  }
  if (id.includes('fox') || id.includes('kitsune') || text.includes('fox') || text.includes('cáo') || text.includes('kitsune') || text.includes('hồ ly')) {
    return kitsuneImg;
  }
  if (id.includes('tiger') || id.includes('leopard') || id.includes('smilodon') || id.includes('cat') || text.includes('tiger') || text.includes('hổ') || text.includes('báo') || text.includes('mèo')) {
    return tigerImg;
  }
  if (id.includes('bear') || text.includes('bear') || text.includes('gấu')) {
    return bearImg;
  }
  if (id.includes('owl') || id.includes('eagle') || id.includes('falcon') || id.includes('quetzal') || id.includes('titanis') || id.includes('dodo') || text.includes('eagle') || text.includes('hạc') || text.includes('cú') || text.includes('chim') || text.includes('dodo')) {
    return eagleImg;
  }
  if (id.includes('phoenix') || text.includes('phoenix') || text.includes('phượng hoàng')) {
    return phoenixImg;
  }
  if (id.includes('hare') || id.includes('deer') || id.includes('elk') || id.includes('unicorn') || text.includes('unicorn') || text.includes('kỳ lân') || text.includes('hươu') || text.includes('thỏ') || text.includes('hare') || text.includes('rabbit') || text.includes('elk')) {
    return unicornImg;
  }
  if (id.includes('turtle') || id.includes('ankylosaurus') || text.includes('turtle') || text.includes('rùa') || text.includes('quy')) {
    return turtleImg;
  }
  if (id.includes('megalodon') || id.includes('orca') || id.includes('whale') || text.includes('megalodon') || text.includes('cá mập') || text.includes('cá voi')) {
    return megalodonImg;
  }
  if (id.includes('serpent') || id.includes('cobra') || id.includes('leviathan') || id.includes('jaekelopterus') || text.includes('leviathan') || text.includes('rắn') || text.includes('mãng xà')) {
    return leviathanImg;
  }
  if (id.includes('trex') || id.includes('spinosaurus') || id.includes('argentino') || id.includes('mammoth') || id.includes('elephant') || id.includes('dinosaur') || text.includes('dinosaur') || text.includes('khủng long') || text.includes('mammoth')) {
    return dinosaurImg;
  }
  if (id.includes('pegasus') || id.includes('astral') || text.includes('pegasus') || text.includes('thiên mã')) {
    return pegasusImg;
  }
  if (id.includes('demon') || id.includes('void-king') || id.includes('cerberus') || id.includes('ouroboros') || text.includes('demon') || text.includes('quỷ') || text.includes('hư vô')) {
    return voidDemonImg;
  }
  if (id.includes('golem') || id.includes('atlas') || id.includes('ymir') || text.includes('golem') || text.includes('tinh thể')) {
    return crystalGolemImg;
  }
  if (id.includes('mecha') || id.includes('chimera') || text.includes('mecha') || text.includes('robot')) {
    return mechaImg;
  }
  if (id.includes('chaos-colossus') || id.includes('secret-entity') || id.includes('quantum') || (creature.rarity === 'king_of_god')) {
    return voidOverlordImg;
  }
  if (id.includes('solaris') || id.includes('deus') || id.includes('aether') || id.includes('chronos') || id.includes('prometheus') || id.includes('osiris') || creature.rarity === 'god') {
    return celestialGodImg;
  }
  if (id.includes('dragon') || id.includes('bahamut') || id.includes('azure') || text.includes('dragon') || text.includes('rồng') || text.includes('long')) {
    return dragonImg;
  }

  // Element fallback
  if (creature.element === 'fire') return phoenixImg;
  if (creature.element === 'frost') return wolfImg;
  if (creature.element === 'thunder') return tigerImg;
  if (creature.element === 'wind') return eagleImg;
  if (creature.element === 'void' || creature.element === 'shadow') return voidDemonImg;
  if (creature.element === 'nature') return kitsuneImg;
  if (creature.element === 'divine' || creature.element === 'holy') return unicornImg;
  if (creature.element === 'cosmic' || creature.element === 'gold') return celestialGodImg;

  return dragonImg;
};

export const getArtworkForPet = (
  archetype?: PetArchetype,
  customUrl?: string,
  petImageUrl?: string,
  petName?: string
): string => {
  if (customUrl && customUrl.trim().length > 0) return customUrl;
  if (petImageUrl && petImageUrl.trim().length > 0) return petImageUrl;
  if (archetype && ARCHETYPE_ARTWORK_MAP[archetype]) {
    return ARCHETYPE_ARTWORK_MAP[archetype];
  }
  if (petName) {
    return getExclusiveArtworkForCreature({ name: petName });
  }
  return dragonImg;
};
