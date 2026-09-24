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
  | 'celestial';

export type PetPattern =
  | 'none'
  | 'stripes'
  | 'runes'
  | 'scales'
  | 'stars'
  | 'lightning_circuit'
  | 'cosmic_nebula'
  | 'divine_crest'
  | 'tiger_stripes_gold';

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
  | 'flower_wreath';

export type PetBackWing =
  | 'none'
  | 'dragon_wings'
  | 'phoenix_flame_wings'
  | 'angel_feathers'
  | 'void_shadow_cape'
  | 'celestial_mech_thrusters'
  | 'energy_blades'
  | 'butterfly_prism_wings'
  | 'fairy_wings';

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
  | 'nature_leaves';

export type PetParticleStyle =
  | 'none'
  | 'sparks'
  | 'feathers'
  | 'petals'
  | 'stars'
  | 'lightning'
  | 'bubbles'
  | 'embers';

export type PetAuraIntensity = 'subtle' | 'radiant' | 'hyper' | 'godlike';

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
