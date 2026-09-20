import { UNITS_DATA } from '../data/unitsData';
import {
  DailyMissionData,
  DailyMissionTask,
  DailyVocabularyTaskItem,
  MeaningQuizQuestion,
  SentenceClozeQuestion,
  SpellScrambleQuestion,
} from '../types';

const STORAGE_KEY = 'egg_thief_daily_mission_progress';

/**
 * Deterministic hash function for date string (e.g., "2026-09-20")
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Seeded PRNG (Mulberry32)
 */
function createSeededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Get current 24-hour date key (YYYY-MM-DD)
 */
export function getCurrentDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get timestamp of the next 24-hour reset (midnight)
 */
export function getNextResetTimestamp(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return tomorrow.getTime();
}

/**
 * Calculate human-readable countdown to next reset
 */
export function getRemainingTimeUntilReset(): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const diff = Math.max(0, getNextResetTimestamp() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return { hours, minutes, seconds, formatted };
}

/**
 * Collect and deduplicate all vocabulary items across all 40 units
 */
export function getAllCuratedVocabulary(): DailyVocabularyTaskItem[] {
  const list: DailyVocabularyTaskItem[] = [];
  const seenWords = new Set<string>();

  for (const unit of UNITS_DATA) {
    if (!unit.vocabulary || unit.vocabulary.length === 0) continue;
    for (const v of unit.vocabulary) {
      const cleanWord = v.word.trim();
      if (!cleanWord || seenWords.has(cleanWord.toLowerCase())) continue;
      seenWords.add(cleanWord.toLowerCase());

      list.push({
        id: v.id,
        word: cleanWord,
        phonetic: v.phonetic || '',
        meaningVi: v.meaningVi || '',
        exampleEn: v.exampleEn || `We often study the word "${cleanWord}" in English class.`,
        exampleVi: v.exampleVi || `Chúng ta thường học từ "${cleanWord}" trong tiết tiếng Anh.`,
        keySound: v.keySound || '',
        distractors: v.distractors || [],
        unitTitle: unit.title,
      });
    }
  }

  return list;
}

/**
 * Shuffle array using seeded RNG
 */
function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generate 3 unique tasks for the given date
 */
export function generateDailyTasks(dateKey: string): DailyMissionTask[] {
  const allVocab = getAllCuratedVocabulary();
  if (allVocab.length < 15) {
    return [];
  }

  const seed = hashString(`daily_vocab_${dateKey}`);
  const rng = createSeededRandom(seed);

  // Shuffle all vocabulary deterministically
  const shuffledVocab = seededShuffle(allVocab, rng);

  // Take 4 words for Task 1, 4 words for Task 2, 4 words for Task 3
  const task1Words = shuffledVocab.slice(0, 4);
  const task2Words = shuffledVocab.slice(4, 8);
  const task3Words = shuffledVocab.slice(8, 12);

  // Helper to pick distractors from pool excluding current word
  const getDistractorWords = (targetWord: string, count: number): string[] => {
    const pool = allVocab.filter((v) => v.word.toLowerCase() !== targetWord.toLowerCase());
    const shuffledPool = seededShuffle(pool, rng);
    return shuffledPool.slice(0, count).map((v) => v.word);
  };

  const getDistractorMeanings = (targetWord: string, count: number): string[] => {
    const pool = allVocab.filter((v) => v.word.toLowerCase() !== targetWord.toLowerCase());
    const shuffledPool = seededShuffle(pool, rng);
    return shuffledPool.slice(0, count).map((v) => v.meaningVi);
  };

  // --- Task 1: Meaning & Collocation Match (4 questions) ---
  const meaningQuestions: MeaningQuizQuestion[] = task1Words.map((item, idx) => {
    const askForMeaning = idx % 2 === 0;
    if (askForMeaning) {
      const distractors = getDistractorMeanings(item.word, 3);
      const options = seededShuffle([item.meaningVi, ...distractors], rng);
      return {
        id: `m-q-${idx}-${item.id}`,
        wordItem: item,
        prompt: `Nghĩa tiếng Việt chuẩn của từ "${item.word}" ${item.phonetic ? `(${item.phonetic})` : ''} là gì?`,
        options,
        correctAnswer: item.meaningVi,
        explanation: `"${item.word}" có nghĩa là: ${item.meaningVi}.\nVí dụ: "${item.exampleEn}" (${item.exampleVi})`,
      };
    } else {
      const distractors = getDistractorWords(item.word, 3);
      const options = seededShuffle([item.word, ...distractors], rng);
      return {
        id: `m-q-${idx}-${item.id}`,
        wordItem: item,
        prompt: `Từ vựng tiếng Anh nào mang nghĩa: "${item.meaningVi}"?`,
        options,
        correctAnswer: item.word,
        explanation: `"${item.word}" ${item.phonetic} mang nghĩa "${item.meaningVi}".\nVí dụ: "${item.exampleEn}"`,
      };
    }
  });

  const task1: DailyMissionTask = {
    id: 'daily_task_1_meaning',
    type: 'meaning_match',
    title: 'Thám Tử Định Nghĩa & Cụm Từ',
    subtitle: 'Nhận diện nghĩa và ngữ nghĩa 4 từ vựng mục tiêu',
    description: 'Vượt qua 4 câu hỏi nhận diện ý nghĩa từ vựng và chọn đáp án chính xác.',
    badge: 'Định Nghĩa',
    iconName: 'Search',
    crystalReward: 80,
    totalQuestions: 4,
    completedQuestions: 0,
    isCompleted: false,
    isClaimed: false,
    meaningQuestions,
  };

  // --- Task 2: Sentence Cloze Mastery (4 questions) ---
  const clozeQuestions: SentenceClozeQuestion[] = task2Words.map((item, idx) => {
    // Regex replace target word in sentence with blank
    const escapedWord = item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
    let sentenceWithBlank = item.exampleEn;

    if (regex.test(sentenceWithBlank)) {
      sentenceWithBlank = sentenceWithBlank.replace(regex, '_______');
    } else {
      // If multi-word or exact match not found, substitute whole phrase
      sentenceWithBlank = sentenceWithBlank.replace(item.word, '_______');
      if (!sentenceWithBlank.includes('_______')) {
        sentenceWithBlank = `Fill in the blank: "We need to understand _______ in this context."`;
      }
    }

    const distractors = getDistractorWords(item.word, 3);
    const options = seededShuffle([item.word, ...distractors], rng);

    return {
      id: `c-q-${idx}-${item.id}`,
      wordItem: item,
      sentenceWithBlank,
      options,
      correctWord: item.word,
      hintPhonetic: item.phonetic,
      hintMeaning: item.meaningVi,
      explanation: `Câu hoàn chỉnh: "${item.exampleEn}"\nDịch nghĩa: "${item.exampleVi}"\nTừ cần điền: "${item.word}" (${item.meaningVi}).`,
    };
  });

  const task2: DailyMissionTask = {
    id: 'daily_task_2_cloze',
    type: 'sentence_cloze',
    title: 'Cao Thủ Điền Ngữ Cảnh Đề Thi',
    subtitle: 'Áp dụng từ vựng chuẩn vào câu đề thi tuyển sinh 10',
    description: 'Đọc kỹ câu văn ngữ cảnh và điền từ vựng chuẩn xác nhất vào chỗ trống.',
    badge: 'Điền Câu',
    iconName: 'FileText',
    crystalReward: 100,
    totalQuestions: 4,
    completedQuestions: 0,
    isCompleted: false,
    isClaimed: false,
    clozeQuestions,
  };

  // --- Task 3: Word Spell & Sound Scramble (4 questions) ---
  const spellQuestions: SpellScrambleQuestion[] = task3Words.map((item, idx) => {
    // Break word into letters (lowercase)
    const cleanWord = item.word.toLowerCase();
    const letters = cleanWord.split('').filter((c) => c !== ' ' && c !== '-' && c !== "'");
    const scrambled = seededShuffle(letters, rng);

    // Make sure scrambled is not accidentally the same as original if length > 2
    if (scrambled.join('') === letters.join('') && letters.length > 2) {
      const temp = scrambled[0];
      scrambled[0] = scrambled[1];
      scrambled[1] = temp;
    }

    return {
      id: `s-q-${idx}-${item.id}`,
      wordItem: item,
      scrambledLetters: scrambled,
      targetWord: cleanWord,
      hintPhonetic: item.phonetic,
      hintMeaning: item.meaningVi,
    };
  });

  const task3: DailyMissionTask = {
    id: 'daily_task_3_spell',
    type: 'spell_scramble',
    title: 'Bậc Thầy Đánh Vần & Phát Âm',
    subtitle: 'Sắp xếp chữ cái & luyện phát âm chuẩn người bản xứ',
    description: 'Lắng nghe phát âm, nhìn phiên âm IPA và sắp xếp lại các chữ cái tạo thành từ vựng hoàn chỉnh.',
    badge: 'Đánh Vần & Âm',
    iconName: 'SpellCheck',
    crystalReward: 120,
    totalQuestions: 4,
    completedQuestions: 0,
    isCompleted: false,
    isClaimed: false,
    spellQuestions,
  };

  return [task1, task2, task3];
}

interface StoredDailyProgress {
  dateKey: string;
  tasksProgress: Record<
    string,
    {
      completedQuestions: number;
      isCompleted: boolean;
      isClaimed: boolean;
    }
  >;
  isGrandRewardClaimed: boolean;
  streakDays: number;
  lastCompletedDate?: string;
}

/**
 * Retrieve saved progress or initialize fresh daily data
 */
export function getDailyMissionData(): DailyMissionData {
  const currentDateKey = getCurrentDateKey();
  const resetTimestamp = getNextResetTimestamp();
  const defaultTasks = generateDailyTasks(currentDateKey);

  let stored: StoredDailyProgress | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      stored = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse daily mission progress:', e);
  }

  let streakDays = 0;
  let lastCompletedDate: string | undefined = undefined;

  if (stored) {
    streakDays = stored.streakDays || 0;
    lastCompletedDate = stored.lastCompletedDate;

    // Check if yesterday was completed to preserve or break streak
    if (lastCompletedDate && lastCompletedDate !== currentDateKey) {
      const lastDate = new Date(lastCompletedDate);
      const today = new Date(currentDateKey);
      const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays > 1) {
        // Missed more than 1 day, streak resets
        streakDays = 0;
      }
    }
  }

  // If stored progress matches today's dateKey, overlay progress
  if (stored && stored.dateKey === currentDateKey) {
    const updatedTasks = defaultTasks.map((t) => {
      const taskSaved = stored?.tasksProgress?.[t.id];
      if (taskSaved) {
        return {
          ...t,
          completedQuestions: taskSaved.completedQuestions,
          isCompleted: taskSaved.isCompleted,
          isClaimed: taskSaved.isClaimed,
        };
      }
      return t;
    });

    return {
      dateKey: currentDateKey,
      resetTimestamp,
      tasks: updatedTasks,
      grandRewardCrystals: 250,
      isGrandRewardClaimed: stored.isGrandRewardClaimed || false,
      streakDays,
      lastCompletedDate,
    };
  }

  // Fresh day! Return newly seeded tasks
  return {
    dateKey: currentDateKey,
    resetTimestamp,
    tasks: defaultTasks,
    grandRewardCrystals: 250,
    isGrandRewardClaimed: false,
    streakDays,
    lastCompletedDate,
  };
}

/**
 * Save current mission progress to localStorage
 */
export function saveDailyMissionProgress(missionData: DailyMissionData): void {
  try {
    const tasksProgress: StoredDailyProgress['tasksProgress'] = {};
    for (const t of missionData.tasks) {
      tasksProgress[t.id] = {
        completedQuestions: t.completedQuestions,
        isCompleted: t.isCompleted,
        isClaimed: t.isClaimed,
      };
    }

    const payload: StoredDailyProgress = {
      dateKey: missionData.dateKey,
      tasksProgress,
      isGrandRewardClaimed: missionData.isGrandRewardClaimed,
      streakDays: missionData.streakDays,
      lastCompletedDate: missionData.lastCompletedDate,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to save daily mission progress:', e);
  }
}
