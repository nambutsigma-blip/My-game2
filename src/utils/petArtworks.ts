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

import { PetArchetype } from '../types';

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
  shadow_phoenix: phoenixImg,
  kitsune: kitsuneImg,
  void_fiend: voidDemonImg,
  crystal_golem: crystalGolemImg,
  pegasus: pegasusImg,
  celestial: celestialGodImg,
  serpent: leviathanImg,
  leviathan: leviathanImg,
  mecha: mechaImg,
  turtle: turtleImg,
  behemoth: crystalGolemImg,
  divine_lion: celestialGodImg,
  wolf: voidDemonImg,
  tiger: dragonImg,
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

export const getArtworkForPet = (
  archetype?: PetArchetype,
  customUrl?: string,
  petImageUrl?: string
): string => {
  if (customUrl && customUrl.trim().length > 0) return customUrl;
  if (petImageUrl && petImageUrl.trim().length > 0) return petImageUrl;
  if (archetype && ARCHETYPE_ARTWORK_MAP[archetype]) {
    return ARCHETYPE_ARTWORK_MAP[archetype];
  }
  return dragonImg;
};
