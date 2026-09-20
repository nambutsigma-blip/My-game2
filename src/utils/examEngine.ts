import { VocabularyItem, GrammarTrapItem, SpeakingCipher } from '../types';
import { getExamQuestionsForUnit, ENTRANCE_EXAM_BANK } from '../data/entranceExamBank';

export interface ExamPaper {
  id: string;
  unitId: string;
  examTitle: string;
  examCode: string;
  topicName: string;
  difficulty: 'standard' | 'advanced_chuyen';
  difficultyLabel: string;
  stage1Vocabulary: VocabularyItem[];
  stage2GrammarTraps: GrammarTrapItem[];
  speakingCipher: SpeakingCipher;
  generatedAt: string;
  isAiGenerated: boolean;
  totalUniqueSeenCount: number;
}

const STORAGE_SEEN_KEY = 'egg_thief_seen_questions_v2';
const STORAGE_EXAM_CACHE_PREFIX = 'egg_thief_active_exam_';

export function getSeenSignatures(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordSeenQuestions(signatures: string[]) {
  try {
    const existing = new Set(getSeenSignatures());
    for (const sig of signatures) {
      if (sig && typeof sig === 'string') {
        existing.add(sig.trim().toLowerCase());
      }
    }
    localStorage.setItem(STORAGE_SEEN_KEY, JSON.stringify(Array.from(existing)));
  } catch (err) {
    console.warn('Failed to record seen questions:', err);
  }
}

export function clearSeenQuestions() {
  try {
    localStorage.removeItem(STORAGE_SEEN_KEY);
  } catch {}
}

export async function fetchExamForUnit(
  unitId: string,
  unitTitle: string,
  unitSubtitle: string,
  difficulty: 'standard' | 'advanced_chuyen' = 'standard',
  forceRegenerate: boolean = false
): Promise<ExamPaper> {
  const seenSignatures = getSeenSignatures();
  const cacheKey = `${STORAGE_EXAM_CACHE_PREFIX}${unitId}_${difficulty}`;

  // If not forcing regenerate, check if we have a valid cached exam paper for this session
  if (!forceRegenerate) {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as ExamPaper;
        if (parsed && Array.isArray(parsed.stage2GrammarTraps) && parsed.stage2GrammarTraps.length > 0) {
          return {
            ...parsed,
            totalUniqueSeenCount: seenSignatures.length,
          };
        }
      }
    } catch {}
  }

  // Attempt server-side Gemini AI generation
  try {
    const res = await fetch('/api/generate-exam-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitId,
        unitTitle,
        unitSubtitle,
        topic: unitTitle,
        difficulty,
        excludeSignatures: seenSignatures.slice(-60), // send last 60 seen to prevent duplicates
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.stage2Questions) && data.stage2Questions.length > 0) {
        const newPaper: ExamPaper = {
          id: `exam-${unitId}-${Date.now()}`,
          unitId,
          examTitle: data.examTitle || `Đề Thi Tuyển Sinh Vào 10: ${unitTitle}`,
          examCode: data.examCode || `10-THPT-${unitId.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          topicName: data.topicName || unitTitle,
          difficulty,
          difficultyLabel:
            difficulty === 'advanced_chuyen'
              ? 'Đề Thi Chuyên 10 & HSG (Target 9.5 - 10đ)'
              : 'Chuẩn Đề Thi Tuyển Sinh 10 (Target 8.0 - 9.0đ)',
          stage1Vocabulary: data.stage1Questions || [],
          stage2GrammarTraps: data.stage2Questions || [],
          speakingCipher: data.speakingCipher || {
            id: `sp-${unitId}`,
            title: `Mật Mã Đề Thi Vào 10: ${unitTitle}`,
            targetPhrase: 'I will master every intricate grammar trap to achieve maximum scores in the entrance examination.',
            phonetic: '/aɪ wɪl ˈmɑːstə ˈevri ˈɪntrɪkət ˈɡræmə træp tuː əˈtʃiːv ˈmæksɪməm skɔːz/',
            meaningVi: 'Tôi sẽ làm chủ mọi bẫy ngữ pháp tinh vi để đạt điểm tuyệt đối trong kỳ thi vào 10.',
            targetSounds: ['/tr/', '/æ/', '/m/'],
            expectedGrammarRule: 'Quy tắc ngữ pháp nâng cao đề thi vào 10.',
            dragonGatekeeperPrompt: {
              question: 'Explain how you will avoid grammatical traps in this entrance exam topic.',
              suggestedPattern: 'I will carefully analyze [grammar points] and verify [conditions] before answering.',
              sampleAnswers: [
                'I will carefully analyze the time markers and verify whether the verb expresses a temporary action or a state.',
              ],
            },
          },
          generatedAt: new Date().toLocaleTimeString('vi-VN'),
          isAiGenerated: true,
          totalUniqueSeenCount: seenSignatures.length + data.stage2Questions.length,
        };

        // Record questions as seen
        const newSigs = [
          ...newPaper.stage2GrammarTraps.map((q) => q.sentencePrompt),
          ...newPaper.stage1Vocabulary.map((v) => v.word),
        ];
        recordSeenQuestions(newSigs);

        // Cache for smooth session navigation
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(newPaper));
        } catch {}

        return newPaper;
      }
    }
  } catch (err) {
    console.warn('[Exam Engine] Server AI generation failed/offline, using rich local entrance exam bank:', err);
  }

  // Seamless fallback to our rich Entrance Exam Bank (strictly filtered against seen questions)
  const localFallback = getExamQuestionsForUnit(unitId, difficulty, seenSignatures);
  const fallbackPaper: ExamPaper = {
    id: `exam-fallback-${unitId}-${Date.now()}`,
    unitId,
    examTitle: `Đề Thi Tuyển Sinh Vào 10 (Chuyên Đề): ${unitTitle}`,
    examCode: `10-THPT-${unitId.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    topicName: unitTitle,
    difficulty,
    difficultyLabel:
      difficulty === 'advanced_chuyen'
        ? 'Đề Thi Chuyên 10 & HSG (Target 9.5 - 10đ)'
        : 'Chuẩn Đề Thi Tuyển Sinh 10 (Target 8.0 - 9.0đ)',
    stage1Vocabulary: localFallback.stage1,
    stage2GrammarTraps: localFallback.stage2,
    speakingCipher: localFallback.speaking,
    generatedAt: new Date().toLocaleTimeString('vi-VN'),
    isAiGenerated: false,
    totalUniqueSeenCount: seenSignatures.length + localFallback.stage2.length,
  };

  const newSigs = [
    ...fallbackPaper.stage2GrammarTraps.map((q) => q.sentencePrompt),
    ...fallbackPaper.stage1Vocabulary.map((v) => v.word),
  ];
  recordSeenQuestions(newSigs);

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(fallbackPaper));
  } catch {}

  return fallbackPaper;
}
