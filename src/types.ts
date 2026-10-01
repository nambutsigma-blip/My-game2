export type StageType = 'stage1_eye' | 'stage2_grammar' | 'stage3_speaking' | 'stage4_chase';

export type WordStatus = 'green' | 'yellow' | 'red';

export interface WordScore {
  word: string;
  status: WordStatus;
  note?: string;
}

export interface SpeechAnalysisResult {
  grammarCorrect: boolean;
  grammarFeedback: string;
  pronunciationFeedback: string;
  pronunciationTip: string;
  score: number;
  dragonStirs: boolean;
  wordScores: WordScore[];
}

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  meaningVi: string;
  exampleEn: string;
  exampleVi: string;
  keySound: string; // e.g. "/f/", "/s/", "/i:/"
  distractors: string[]; // for the Eye Monster laser game
  examTip?: string;
  questionType?: string;
}

export interface GrammarTrapItem {
  id: string;
  instruction: string;
  sentencePrompt: string; // Sentence with blank or scrambled
  options: string[];
  correctAnswer: string;
  grammarRuleExplaining: string;
  scrambledWords?: string[];
  examTip?: string;
  questionType?: string;
  difficulty?: 'standard' | 'advanced_chuyen';
  underlinedParts?: { key: 'A' | 'B' | 'C' | 'D'; text: string; isError: boolean; correction: string }[];
}

export interface SpeakingCipher {
  id: string;
  title: string;
  targetPhrase: string;
  phonetic: string;
  meaningVi: string;
  targetSounds: string[]; // e.g. ["/f/", "/s/", "/t/"]
  expectedGrammarRule: string;
  dragonGatekeeperPrompt: {
    question: string;
    suggestedPattern: string;
    sampleAnswers: string[];
  };
}

export interface ReviewQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  unitOrigin: string; // e.g. "Unit 1", "Unit 2", "Unit 3", "Tri-Unit Review"
}

export type EggTierType = 'common' | 'silver' | 'golden' | 'king' | 'titan' | 'deity' | 'god' | 'king_of_god' | 'secret';

export interface UnitData {
  id: string;
  unitNumber: number;
  title: string;
  subtitle: string;
  gradeLevel: string;
  eggName: string;
  eggType: EggTierType;
  eggImage: string;
  description: string;
  themeColor: string;
  vocabulary: VocabularyItem[];
  grammarTraps: GrammarTrapItem[];
  speakingCipher: SpeakingCipher;
  isReviewUnit?: boolean;
  reviewQuestions?: ReviewQuestion[]; // for Tri-Unit Review Checkpoint
}

export type CreatureRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythical'
  | 'ultimate'
  | 'eternal'
  | 'cosmic'
  | 'secret'
  | 'king'
  | 'titan'
  | 'deity'
  | 'god'
  | 'king_of_god';

export type CreatureClassification = 'living' | 'extinct' | 'mythical' | 'divine';

export type PetArchetype =
  | 'dragon'
  | 'ancient_dragon'
  | 'wolf'
  | 'phoenix'
  | 'shadow_phoenix'
  | 'tiger'
  | 'divine_lion'
  | 'serpent'
  | 'leviathan'
  | 'kitsune'
  | 'turtle'
  | 'pegasus'
  | 'behemoth'
  | 'mecha'
  | 'celestial'
  | 'void_fiend'
  | 'crystal_golem';

export type PetPattern =
  | 'none'
  | 'stripes'
  | 'runes'
  | 'scales'
  | 'stars'
  | 'lightning_circuit'
  | 'cosmic_nebula'
  | 'divine_crest'
  | 'tiger_stripes_gold'
  | 'sacred_lotus'
  | 'dragon_scale_armor';

export type PetHeadAccessory =
  | 'none'
  | 'crown'
  | 'dragon_horns'
  | 'horns'
  | 'valkyrie_helm'
  | 'pharaoh_crown'
  | 'cyber_headset'
  | 'cyber_visor'
  | 'ninja_band'
  | 'wizard_hat'
  | 'fox_mask'
  | 'halo'
  | 'flame_tiara'
  | 'flower_wreath'
  | 'warlord_helm'
  | 'astral_circlet';

export type PetBackWing =
  | 'none'
  | 'dragon_wings'
  | 'phoenix_flame_wings'
  | 'angel_feathers'
  | 'void_shadow_cape'
  | 'celestial_mech_thrusters'
  | 'energy_blades'
  | 'butterfly_prism_wings'
  | 'fairy_wings'
  | 'golden_rings_wing'
  | 'cosmic_nebula_wings';

export type PetAuraEffect =
  | 'none'
  | 'flames'
  | 'frost'
  | 'sparks'
  | 'void'
  | 'starlight'
  | 'supernova'
  | 'divine_matrix'
  | 'ice_crystals'
  | 'dark_matter'
  | 'nature_leaves'
  | 'rainbow_chakra'
  | 'plasma_storm';

export type PetParticleStyle =
  | 'none'
  | 'sparks'
  | 'feathers'
  | 'petals'
  | 'stars'
  | 'lightning'
  | 'bubbles'
  | 'embers'
  | 'golden_coins'
  | 'sakura_blossom'
  | 'ancient_glyphs';

export type PetAuraIntensity = 'subtle' | 'radiant' | 'hyper' | 'godlike';

export type PetHeldArtifact =
  | 'none'
  | 'divine_sword' // Thánh Kiếm Hoàng Kim
  | 'orb_of_elements' // Ngọc Nguyên Tố
  | 'magic_staff' // Quyền Trượng Ma Pháp
  | 'dragon_pearl' // Thần Châu Long Tộc
  | 'thunder_hammer' // Búa Sét Thần
  | 'holy_shield'; // Khiên Thánh Quang

export type PetIdleAnimation = 'breathe' | 'float' | 'bounce' | 'flapping' | 'hyper_pulse';

export type PetVisualMode = '3d_art' | 'vector';

export interface PetAppearance {
  archetype: PetArchetype;
  primaryColor: string; // e.g. '#ef4444' or custom hex
  secondaryColor: string; // accent color
  pattern?: PetPattern;
  headAccessory?: PetHeadAccessory;
  backWing?: PetBackWing;
  auraEffect?: PetAuraEffect;
  customSkinName?: string;
  // Enhanced Appearance Upgrades
  eyeGlowColor?: string; // Eye iris color with glow filter
  auraIntensity?: PetAuraIntensity; // Visual radiance power
  particleStyle?: PetParticleStyle; // Floating particle atmospheric effects
  costumeTitle?: string; // Floating mythical title badge
  // 3.0 Ultra Upgrades
  heldArtifact?: PetHeldArtifact; // Floating magical weapon/artifact next to pet
  idleAnimation?: PetIdleAnimation; // Custom animation motion (float, breathe, bounce, etc.)
  shinyShimmer?: boolean; // Ultra rare shiny iridescent metallic overlay
  visualMode?: PetVisualMode; // '3d_art' for Ultra-HD CGI Fantasy Creature or 'vector' for SVG
  customArtworkUrl?: string; // High-res creature portrait / artwork
}

export interface PokemonBattleMove {
  id: string;
  name: string;
  type: 'normal' | 'fire' | 'frost' | 'thunder' | 'nature' | 'wind' | 'shadow' | 'cosmic';
  category: 'physical' | 'special' | 'status';
  power: number;
  accuracy: number; // e.g. 100, 90
  pp: number;
  currentPp?: number;
  description: string;
  statusEffect?: 'burn' | 'paralyze' | 'freeze' | 'shield' | 'attack_boost' | 'heal';
  statusChance?: number;
  animation: 'strike' | 'beam' | 'burst' | 'buff' | 'slash';
}

export interface CombatSkill {
  name: string;
  type: 'normal' | 'elemental' | 'ultimate';
  damageMultiplier: number;
  rageCost?: number;
  description: string;
  element: string;
}

export interface PetCompanion {
  id: string;
  name: string;
  title: string;
  rarity: CreatureRarity;
  classification: CreatureClassification; // living, extinct, mythical, divine
  element: 'fire' | 'frost' | 'thunder' | 'shadow' | 'gold' | 'nature' | 'wind' | 'cosmic' | 'void' | 'divine';
  buffDescription: string;
  hatchedAt: string;
  description: string;
  avatarIcon: string;
  tierRank: number; // 1 to 15 (10 = Secret, 11 = King, 12 = Titan, 13 = Deity, 14 = God, 15 = King of God)
  habitat?: string;
  dietOrPower?: string;
  enchantmentLevel?: number; // 0 to 5 stars
  level?: number;
  exp?: number;
  maxExp?: number;
  skills?: CombatSkill[];
  isFavorite?: boolean; // Pinned to top of companion list
  appearance?: PetAppearance;
  moves?: PokemonBattleMove[];
  isEvolved?: boolean; // True when pet has undergone rarity evolution
  evolutionStage?: number; // 1 for first evolution, 2 for second, etc.
  originalName?: string; // Pre-evolution base name
  originalRarity?: CreatureRarity; // Pre-evolution original rarity
  originalAvatarIcon?: string; // Pre-evolution icon
}

export interface StolenEgg {
  id: string;
  unitId: string;
  unitTitle: string;
  eggType: EggTierType;
  obtainedScore: number;
  stolenAt: string;
  isHatched: boolean;
  petHatched?: PetCompanion;
}

export interface GameState {
  currentUnitId: string;
  activeStage: StageType;
  alertLevel: number; // 0% to 100%
  stealthSteps: number; // 0 to 10 steps towards the nest pedestal
  totalStepsNeeded: number;
  stealthBoots: number; // inventory items (can be used to drop -10% alert)
  scoreTotal: number;
  scoreMax: number;
  completedUnits: string[];
  unlockedUnits: string[];
  stolenEggs: StolenEgg[];
  hatchedPets: PetCompanion[];
  dragonCrystals: number;
  activeRescueModal: boolean;
  missionFinished: boolean;
  lastMissionResult?: {
    unitId: string;
    score: number;
    maxScore: number;
    eggType: EggTierType | null;
    success: boolean;
  };
}

export type SkillBranchId = 'stealth' | 'economy' | 'combat' | 'hatching';

export interface PetSkillNode {
  id: string;
  name: string;
  vietnameseTitle: string;
  branch: SkillBranchId;
  tier: number; // 1, 2, 3, 4
  icon: string;
  maxLevel: number;
  costs: number[]; // Crystal costs for level 1, level 2, etc.
  prerequisites: string[]; // IDs of prerequisite skill nodes
  descriptions: string[]; // Detail effect text for each level
  shortEffect: string;
  statBonusType:
    | 'alert_cooldown'
    | 'mistake_mitigation'
    | 'enhanced_boots'
    | 'phantom_veil'
    | 'crystal_multiplier'
    | 'scholar_bounty'
    | 'arena_plunder'
    | 'hatch_rebate'
    | 'pet_hp_bonus'
    | 'rage_and_damage'
    | 'divine_shield';
}

export type SkillTreeState = Record<string, number>; // { [skillId]: currentLevel }

export type DailyTaskType = 'meaning_match' | 'sentence_cloze' | 'spell_scramble';

export interface DailyVocabularyTaskItem {
  id: string;
  word: string;
  phonetic: string;
  meaningVi: string;
  exampleEn: string;
  exampleVi: string;
  keySound: string;
  distractors: string[];
  unitTitle: string;
}

export interface MeaningQuizQuestion {
  id: string;
  wordItem: DailyVocabularyTaskItem;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface SentenceClozeQuestion {
  id: string;
  wordItem: DailyVocabularyTaskItem;
  sentenceWithBlank: string;
  options: string[];
  correctWord: string;
  hintPhonetic: string;
  hintMeaning: string;
  explanation: string;
}

export interface SpellScrambleQuestion {
  id: string;
  wordItem: DailyVocabularyTaskItem;
  scrambledLetters: string[];
  targetWord: string;
  hintPhonetic: string;
  hintMeaning: string;
}

export interface DailyMissionTask {
  id: string;
  type: DailyTaskType;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  iconName: string;
  crystalReward: number;
  totalQuestions: number;
  completedQuestions: number;
  isCompleted: boolean;
  isClaimed: boolean;
  meaningQuestions?: MeaningQuizQuestion[];
  clozeQuestions?: SentenceClozeQuestion[];
  spellQuestions?: SpellScrambleQuestion[];
}

export interface DailyMissionData {
  dateKey: string;
  resetTimestamp: number;
  tasks: DailyMissionTask[];
  grandRewardCrystals: number;
  isGrandRewardClaimed: boolean;
  streakDays: number;
  lastCompletedDate?: string;
}

export interface BattleHistoryRecord {
  id: string;
  timestamp: number;
  dateFormatted: string;
  outcome: 'victory' | 'defeat';
  playerPetName: string;
  playerPetAvatar: string;
  playerPetElement: string;
  playerPetLevel: number;
  opponentName: string;
  opponentTitle: string;
  opponentPetName: string;
  opponentPetAvatar: string;
  opponentPetElement: string;
  opponentPetLevel: number;
  crystalDelta: number; // Positive (+60) for victory, negative (-20) for defeat
  rewardExp?: number;
  badgeEarned?: string;
  badgeIcon?: string;
  turnsCount: number;
}

export type HighlightColor = 'yellow' | 'green' | 'pink' | 'purple' | 'cyan';

export interface AiHighlightResult {
  originalText: string;
  type: 'word' | 'phrase' | 'idiom' | 'sentence' | 'grammar_structure';
  typeLabel: string; // e.g. "Từ vựng (Noun)", "Cụm động từ (Phrasal Verb)", "Mẫu câu đảo ngữ"
  phonetic?: string; // e.g. "/prəˌnʌn.siˈeɪ.ʃən/"
  vietnameseMeaning: string; // Nghĩa tiếng Việt chuẩn ngữ cảnh
  detailedExplanation: string; // Giải thích chi tiết, nguồn gốc, sắc thái
  grammarBreakdown?: string; // Phân tích thành phần câu / loại từ
  collocations?: string[]; // Các cụm từ liên quan hay gặp trong đề thi vào 10
  synonyms?: string[]; // Từ đồng nghĩa
  antonyms?: string[]; // Từ trái nghĩa
  examples: { en: string; vi: string }[]; // Ví dụ song ngữ
  examTip?: string; // Mẹo thi vào 10
  difficultyLevel?: string;
  sourceContext?: string;

  // 🌟 Cốt lõi yêu cầu người dùng: Thể hiện rõ Ý NGHĨA CỦA CẢ CÂU và TỪ VỰNG HIGHLIGHT
  highlightedWord?: string; // Từ vựng / Cụm từ được highlight
  highlightedWordMeaning?: string; // Ý nghĩa chuẩn xác của riêng từ vựng được highlight
  highlightedWordRole?: string; // Vai trò ngữ pháp của từ vựng trong câu
  fullSentence?: string; // Câu tiếng Anh trọn vẹn chứa từ vựng này
  fullSentenceMeaning?: string; // Ý nghĩa tiếng Việt hoàn chỉnh của cả câu
  sentenceStructureAnalysis?: string; // Phân tích cấu trúc cả câu (Chủ ngữ, Vị ngữ, Thì...)
  keyVocabularyInSentence?: { word: string; phonetic?: string; type?: string; meaning: string }[]; // Các từ vựng trọng tâm trong câu
}

export interface SavedHighlightItem {
  id: string;
  text: string;
  vietnameseMeaning: string;
  phonetic?: string;
  typeLabel: string;
  createdAt: number;
  unitContext?: string;
  color: HighlightColor;
  notes?: string;
  examples?: { en: string; vi: string }[];
  examTip?: string;

  // 🌟 Lưu trữ kèm cả câu & từ vựng để ôn tập sổ tay
  highlightedWordMeaning?: string;
  fullSentence?: string;
  fullSentenceMeaning?: string;
}

// 🌍 Native Speaker / Foreigner AI Conversation Types
export interface ForeignPersona {
  id: string;
  name: string;
  avatar: string; // Emoji avatar or avatar icon
  nationality: string; // e.g. "Hoa Kỳ (USA)", "Vương Quốc Anh (UK)", "Úc (Australia)", "Canada", "Singapore"
  countryCode: string; // 'US' | 'GB' | 'AU' | 'CA' | 'SG' | 'IE' | 'NZ' | 'ZA' | 'IN' | 'JP' | 'FR'
  voiceLang: string; // 'en-US' | 'en-GB' | 'en-AU' | 'en-CA' | 'en-IE' | 'en-NZ' | 'en-ZA' | 'en-IN'
  accentName: string; // e.g. "California American Accent", "British RP Accent", "Dublin Irish Accent"
  roleTitle: string; // e.g. "Sinh viên Đại học Stanford & Gamer", "Giáo viên Văn học London"
  personality: string; // e.g. "Nhiệt tình, hài hước, thân thiện, dùng nhiều tiếng lóng tự nhiên"
  targetLevel: 'A2' | 'B1' | 'B2' | 'C1';
  topic: string; // e.g. "Cuộc sống học đường & Sở thích", "Luyện phỏng vấn", "Du lịch & Ẩm thực"
  greeting: string; // Opening line generated dynamically by AI
  isAiCustom?: boolean;

  // 🎙️ Specific voice customization by origin and character
  gender?: 'male' | 'female';
  voicePitch?: number; // 0.7 to 1.3 (0.85 = trầm ấm nam tính, 1.1 = trong trẻo nữ tính)
  voiceRate?: number; // 0.85 to 1.15
  voiceToneLabel?: string; // e.g. "Giọng nam trầm ấm, hào sảng", "Giọng nữ trong trẻo, thanh lịch"
  preferredVoiceNames?: string[]; // Hints for Web Speech API matching
  region?: 'north_america' | 'europe_uk' | 'oceania' | 'asia_other';
  samplePhrase?: string; // Catchphrase or sample audio snippet
}

export interface ConversationGrammarCorrection {
  originalSnippet: string; // Câu hoặc cụm từ học sinh nói có lỗi
  correctedSnippet: string; // Câu chuẩn người bản xứ nói
  errorType: string; // "Sai thì động từ", "Giới từ chưa chuẩn", "Hòa hợp chủ vị", "Diễn đạt gượng gạo (Vietnamese thinking)", "Thiếu mạo từ"
  explanationVi: string; // Giải thích chi tiết vì sao sai bằng tiếng Việt
  naturalAlternative: string; // Cách nói tự nhiên hơn của người bản xứ
  memoryTip: string; // Mẹo nhớ nhanh để không lặp lại lỗi
}

export interface ConversationMessage {
  id: string;
  sender: 'user' | 'foreign_ai';
  text: string;
  audioBlobUrl?: string; // Recorded audio blob URL for playback
  audioDataUrl?: string; // Base64 data for persistence
  audioDurationSeconds?: number;
  timestamp: number;
  vietnameseSub?: string; // Dịch phụ đề tiếng Việt
  suggestedReplies?: string[]; // 2-3 gợi ý câu phản hồi nhanh
  corrections?: ConversationGrammarCorrection[]; // Phân tích lỗi ngữ pháp cho câu này
  praise?: string; // Lời khen nếu câu chuẩn
  grammarScore?: number; // Điểm ngữ pháp câu /10
}

export interface SavedConversationSession {
  id: string;
  userId?: string;
  persona: ForeignPersona;
  topic: string;
  createdAt: number;
  dateFormatted: string;
  messagesCount: number;
  messages: {
    id: string;
    sender: 'user' | 'foreign_ai';
    text: string;
    vietnameseSub?: string;
    audioDataUrl?: string;
    corrections?: ConversationGrammarCorrection[];
    praise?: string;
    grammarScore?: number;
    timestamp: number;
  }[];
  overallReview?: {
    fluencyScore: number;
    grammarScore: number;
    vocabularyScore: number;
    overallFeedback: string;
    keyGrammarMistakes: ConversationGrammarCorrection[];
    actionableRoadmap: string[]; // Hướng điều chỉnh cụ thể để tiến bộ
  };
}

