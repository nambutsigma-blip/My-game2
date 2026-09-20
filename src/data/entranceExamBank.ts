import { VocabularyItem, GrammarTrapItem, SpeakingCipher } from '../types';

export interface EntranceExamQuestionItem {
  id: string;
  unitTopicId: string; // e.g. 'unit-1', 'unit-2', etc.
  topicName: string;
  questionType: 'multiple_choice' | 'error_identification' | 'sentence_transformation' | 'phonetics_stress';
  instruction: string;
  sentencePrompt: string;
  options: string[];
  correctAnswer: string;
  grammarRuleExplaining: string;
  examTip: string;
  difficulty: 'standard' | 'advanced_chuyen';
  stageTarget: 'stage1' | 'stage2';
  // Optional extra metadata
  underlinedParts?: { key: 'A' | 'B' | 'C' | 'D'; text: string; isError: boolean; correction: string }[];
  originalSentence?: string;
  keySound?: string;
}

// Comprehensive Bank of Authentic Grade 10 High School Entrance Exam Questions categorized by Unit Topics
export const ENTRANCE_EXAM_BANK: EntranceExamQuestionItem[] = [
  // ==========================================
  // CHUYÊN ĐỀ 1: PRESENT TENSES & STATIVE VERBS (UNIT 1)
  // ==========================================
  {
    id: 'ex-u1-1',
    unitTopicId: 'unit-1',
    topicName: 'Thì Hiện Tại & Động Từ Chỉ Trạng Thái (Stative Verbs)',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer to complete the sentence.',
    sentencePrompt: 'This strawberry cake _______ delicious, but my mother _______ another one for my birthday party.',
    options: ['tastes / is baking', 'is tasting / bakes', 'tastes / bakes', 'is tasting / is baking'],
    correctAnswer: 'tastes / is baking',
    grammarRuleExplaining: '"Taste" là động từ chỉ giác quan/trạng thái (Stative verb) nên không chia tiếp diễn: "tastes delicious". Vế sau diễn tả hành động đang diễn ra nên dùng hiện tại tiếp diễn: "is baking".',
    examTip: 'Bẫy đề thi vào 10: Các động từ chỉ giác quan (taste, smell, look, feel, seem) dùng thì hiện tại đơn khi mang nghĩa trạng thái tính chất.',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u1-2',
    unitTopicId: 'unit-1',
    topicName: 'Động Từ Chỉ Sở Thích (Verbs of Liking / Disliking)',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'Although Nick is fond _______ outdoor activities, he detests _______ soccer in the scorching summer heat.',
    options: ['of / playing', 'on / to play', 'at / playing', 'about / play'],
    correctAnswer: 'of / playing',
    grammarRuleExplaining: 'Cấu trúc "fond of + V-ing" (thích thú) và động từ "detest + V-ing" (cực ghét).',
    examTip: 'Ghi nhớ công thức collocations vào 10: be fond of / be keen on / be interested in + V-ing/Noun.',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u1-3',
    unitTopicId: 'unit-1',
    topicName: 'Tìm Lỗi Sai: Thì Hiện Tại Đơn & Tiếp Diễn',
    questionType: 'error_identification',
    instruction: 'Mark the letter A, B, C, or D to indicate the underlined part that needs correction.',
    sentencePrompt: 'Look! The students (A) are seeming very (B) excited because their team (C) is winning the championship (D) match.',
    options: ['(A) are seeming', '(B) excited', '(C) is winning', '(D) match'],
    correctAnswer: '(A) are seeming',
    grammarRuleExplaining: '"seem" là động từ trạng thái (stative verb), không được chia ở thì tiếp diễn kể cả khi có dấu hiệu "Look!". Phải sửa thành "seem".',
    examTip: 'Đề thi vào 10 rất hay cho bẫy: dấu hiệu "Look! / Listen!" nhưng động từ lại là "seem / hear / understand" để lừa học sinh vội chia V-ing!',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u1-4',
    unitTopicId: 'unit-1',
    topicName: 'Viết Lại Câu Tương Đương (Sentence Transformation)',
    questionType: 'sentence_transformation',
    instruction: 'Choose the sentence that is closest in meaning to the original sentence.',
    sentencePrompt: '"My sister is much more interested in making handmade crafts than watching television."',
    options: [
      'My sister prefers making handmade crafts to watching television.',
      'My sister would rather make handmade crafts than to watch television.',
      'My sister likes watching television more than to make crafts.',
      'My sister detests watching television and handmade crafts.',
    ],
    correctAnswer: 'My sister prefers making handmade crafts to watching television.',
    grammarRuleExplaining: 'Công thức tương đương chuẩn thi vào 10: "prefer V-ing to V-ing" = "like V-ing more than V-ing" = "be more interested in V-ing than V-ing".',
    examTip: 'Chú ý giới từ sau prefer là "to", không dùng "than". Cấu trúc prefer V-ing to V-ing xuất hiện trong 85% đề tuyển sinh 10.',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u1-5',
    unitTopicId: 'unit-1',
    topicName: 'Ngữ Âm: Phát Âm Nguyên Âm & Phụ Âm Đề Thi Vào 10',
    questionType: 'phonetics_stress',
    instruction: 'Choose the word whose underlined part is pronounced differently from the others.',
    sentencePrompt: 'Which word has the underlined sound pronounced differently? A. leisure / B. pleasure / C. ensure / D. treasure',
    options: ['ensure', 'leisure', 'pleasure', 'treasure'],
    correctAnswer: 'ensure',
    grammarRuleExplaining: '"ensure" phát âm là /ɪnˈʃʊər/ (âm /ʃ/), trong khi "leisure" /ˈleʒ.ər/, "pleasure" /ˈpleʒ.ər/, "treasure" /ˈtreʒ.ər/ đều phát âm là âm /ʒ/.',
    examTip: 'Cặp âm /ʃ/ và /ʒ/ là bẫy phân hóa điểm 9-10 trong câu phát âm của đề thi Sở GD&ĐT.',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage1',
  },
  {
    id: 'ex-u1-6',
    unitTopicId: 'unit-1',
    topicName: 'Trọng Âm: Từ 2 Âm Tiết Chủ Đề Thời Gian Rảnh & Động Từ',
    questionType: 'phonetics_stress',
    instruction: 'Choose the word that differs from the other three in the position of primary stress.',
    sentencePrompt: 'Identify the word with a different stress pattern: A. adore / B. detest / C. leisure / D. connect',
    options: ['leisure', 'adore', 'detest', 'connect'],
    correctAnswer: 'leisure',
    grammarRuleExplaining: '\'leisure có trọng âm rơi vào âm tiết thứ 1. Các từ còn lại là động từ 2 âm tiết có trọng âm rơi vào âm tiết thứ 2: a\'dore, de\'test, con\'nect.',
    examTip: 'Quy tắc vàng thi vào 10: Danh từ 2 âm tiết thường nhấn âm 1, động từ 2 âm tiết thường nhấn âm 2.',
    difficulty: 'standard',
    stageTarget: 'stage1',
  },

  // ==========================================
  // CHUYÊN ĐỀ 2: PAST TENSES & WHEN/WHILE (UNIT 2)
  // ==========================================
  {
    id: 'ex-u2-1',
    unitTopicId: 'unit-2',
    topicName: 'Phối Hợp Thì Quá Khứ Đơn & Quá Khứ Tiếp Diễn',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'While the villagers _______ their cattle onto the vast pasture, a sudden lightning bolt _______ the ancient banyan tree.',
    options: ['were herding / struck', 'herded / was striking', 'were herding / was striking', 'herded / struck'],
    correctAnswer: 'were herding / struck',
    grammarRuleExplaining: 'Hành động đang diễn ra kéo dài trong quá khứ chia Quá khứ tiếp diễn (were herding), hành động ngắn xen vào chia Quá khứ đơn (struck - cột 2 của strike).',
    examTip: 'Công thức trọng tâm: While + S + was/were + V-ing, S + V2/ed. "Strike" là động từ bất quy tắc (strike - struck - struck).',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u2-2',
    unitTopicId: 'unit-2',
    topicName: 'Tìm Lỗi Sai: Cấu Trúc Used to / Be used to',
    questionType: 'error_identification',
    instruction: 'Mark the letter A, B, C, or D to indicate the underlined part that needs correction.',
    sentencePrompt: 'My grandfather (A) used to living (B) in a quiet (C) cottage without electricity (D) when he was young.',
    options: ['(A) used to living', '(B) cottage', '(C) without', '(D) when he was'],
    correctAnswer: '(A) used to living',
    grammarRuleExplaining: 'Cấu trúc diễn tả thói quen trong quá khứ đã chấm dứt là "used to + V-infinitive". Phải sửa thành "used to live". "Be used to + V-ing" mới dùng V-ing mang nghĩa quen với việc gì.',
    examTip: 'Phân biệt sống còn trong đề thi vào 10: "used to + V-inf" (đã từng làm gì) vs "be/get used to + V-ing" (quen với việc gì).',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u2-3',
    unitTopicId: 'unit-2',
    topicName: 'Viết Lại Câu Với When / While',
    questionType: 'sentence_transformation',
    instruction: 'Choose the sentence that best rewrites the original sentence.',
    sentencePrompt: '"During our dinner yesterday, the telephone rang loudly three times."',
    options: [
      'While we were having dinner yesterday, the telephone rang loudly three times.',
      'When we had dinner yesterday, the telephone was ringing loudly.',
      'We were having dinner yesterday after the telephone rang.',
      'As soon as the telephone was ringing, we had dinner.',
    ],
    correctAnswer: 'While we were having dinner yesterday, the telephone rang loudly three times.',
    grammarRuleExplaining: 'Chuyển đổi "During + Noun phrase" (trong suốt bữa tối) sang mệnh đề trạng ngữ chỉ thời gian "While + S + was/were V-ing".',
    examTip: 'Dạng bài biến đổi "During + Noun" thành "While + S + were V-ing" là câu hỏi kinh điển trong phần viết lại câu đề vào 10.',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u2-4',
    unitTopicId: 'unit-2',
    topicName: 'Ngữ Âm: Đuôi -ed Trong Thì Quá Khứ Đơn',
    questionType: 'phonetics_stress',
    instruction: 'Choose the word whose underlined part is pronounced differently.',
    sentencePrompt: 'Pronunciation of "-ed": A. plowed / B. gathered / C. harvested / D. herded',
    options: ['plowed', 'gathered', 'harvested', 'herded'],
    correctAnswer: 'plowed',
    grammarRuleExplaining: '"harvested" (/ɪd/) và "herded" (/ɪd/) phát âm /ɪd/. "gathered" (/d/) và "plowed" (/d/). Cần tìm từ khác biệt: "harvested" kết thúc bằng /t/ nên đọc /ɪd/.',
    examTip: 'Ghi nhớ câu thần chú thi vào 10: Tận cùng bằng /t/, /d/ đọc là /ɪd/ (tiền đô). Tận cùng bằng các âm vô thanh đọc là /t/. Còn lại đọc là /d/.',
    difficulty: 'standard',
    stageTarget: 'stage1',
  },

  // ==========================================
  // CHUYÊN ĐỀ 3: COMPARISONS & ADVERBS (UNIT 3)
  // ==========================================
  {
    id: 'ex-u3-1',
    unitTopicId: 'unit-3',
    topicName: 'So Sánh Trạng Từ & Bất Quy Tắc',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'Modern harvesters can cut and thresh paddy grain much _______ and _______ than traditional methods.',
    options: ['faster / more efficiently', 'more fast / efficientlier', 'fast / efficient', 'faster / most efficiently'],
    correctAnswer: 'faster / more efficiently',
    grammarRuleExplaining: '"fast" là trạng từ ngắn bất quy tắc (không có fastly) -> so sánh hơn là "faster". "efficiently" là trạng từ dài kết thúc bằng -ly -> "more efficiently". Dùng "much" để nhấn mạnh cấp so sánh.',
    examTip: 'Bẫy vào 10: "fast, hard, early, late" vừa là tính từ vừa là trạng từ, KHÔNG thêm -ly khi so sánh hơn!',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u3-2',
    unitTopicId: 'unit-3',
    topicName: 'So Sánh Kép Càng... Càng... (Double Comparative)',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'The closer teenagers get to their entrance exams, _______ pressure they seem to feel from family expectations.',
    options: ['the more', 'the most', 'more', 'the much'],
    correctAnswer: 'the more',
    grammarRuleExplaining: 'Cấu trúc so sánh kép (The more... the more...): The + comparative adj/adv + S + V, the + comparative adj/adv + S + V.',
    examTip: 'Công thức câu điểm 10: "The + so sánh hơn..., the + so sánh hơn...". Cả hai vế bắt buộc phải có mạo từ "The".',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u3-3',
    unitTopicId: 'unit-3',
    topicName: 'Tìm Lỗi Sai: So Sánh Tính Từ / Trạng Từ',
    questionType: 'error_identification',
    instruction: 'Mark the letter A, B, C, or D to indicate the underlined part that needs correction.',
    sentencePrompt: 'Living in the countryside (A) is considered (B) far more peacefuller (C) than residing in crowded (D) metropolitan cities.',
    options: ['(A) Living in', '(B) is considered', '(C) far more peacefuller', '(D) metropolitan'],
    correctAnswer: '(C) far more peacefuller',
    grammarRuleExplaining: '"peaceful" là tính từ 2 âm tiết, dạng so sánh hơn là "more peaceful". Không được vừa dùng "more" vừa thêm đuôi "-er" ("more peacefuller" là lỗi sai ngữ pháp kép).',
    examTip: 'Đề thi vào 10 thường gài bẫy so sánh thừa: "more better", "more cheaper", "more easier" -> Đây luôn là vị trí sai!',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u3-4',
    unitTopicId: 'unit-3',
    topicName: 'Trọng Âm: Từ 3 Âm Tiết Đuôi -ful, -ous, -ly',
    questionType: 'phonetics_stress',
    instruction: 'Choose the word that differs from the other three in the position of primary stress.',
    sentencePrompt: 'Stress pattern: A. nomadic / B. generous / C. peacefulness / D. hospitable',
    options: ['nomadic', 'generous', 'peacefulness', 'hospitable'],
    correctAnswer: 'nomadic',
    grammarRuleExplaining: 'no\'madic có hậu tố -ic nên trọng âm rơi vào âm tiết trước nó (âm 2). \'generous, \'peacefulness, \'hospitable đều có trọng âm rơi vào âm tiết 1.',
    examTip: 'Quy tắc đuôi thi vào 10: Các từ tận cùng là -ic, -tion, -sion, -ian có trọng âm rơi ngay vào âm tiết liền trước nó.',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage1',
  },

  // ==========================================
  // CHUYÊN ĐỀ 4: PASSIVE VOICE & CAUSATIVES (UNIT 4 - UNIT 11)
  // ==========================================
  {
    id: 'ex-u4-1',
    unitTopicId: 'unit-4',
    topicName: 'Bị Động Khách Quan (Impersonal Passive: It is reported that...)',
    questionType: 'sentence_transformation',
    instruction: 'Choose the sentence that is closest in meaning to the given sentence.',
    sentencePrompt: '"People believe that ancient dragons guarded sacred eggs in this cavern for centuries."',
    options: [
      'Ancient dragons are believed to have guarded sacred eggs in this cavern for centuries.',
      'It was believed that ancient dragons have guarded sacred eggs in this cavern.',
      'Ancient dragons were believed to guard sacred eggs in this cavern for centuries.',
      'Sacred eggs are believed to be guarded by people in this cavern.',
    ],
    correctAnswer: 'Ancient dragons are believed to have guarded sacred eggs in this cavern for centuries.',
    grammarRuleExplaining: 'Chuyển đổi câu bị động kép: People believe (hiện tại) that ancient dragons guarded (quá khứ). Vì hành động "guarded" xảy ra trước "believe" nên khi đưa chủ ngữ S2 lên đầu phải dùng "are believed to HAVE guarded".',
    examTip: 'Đỉnh cao phân hóa điểm 9.5-10 đề thi vào 10: S2 + be V3 + to HAVE V3/ed khi động từ mệnh đề sau xảy ra trước động từ tường thuật.',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u4-2',
    unitTopicId: 'unit-4',
    topicName: 'Thể Nhờ Vả (Causative Form: Have / Get sth done)',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'The security system was breached yesterday, so the museum director had a technician _______ all the laser alarms.',
    options: ['reinstall', 'reinstalled', 'to reinstall', 'reinstalling'],
    correctAnswer: 'reinstall',
    grammarRuleExplaining: 'Cấu trúc sai khiến chủ động với HAVE: "have somebody DO something" (nguyên mẫu không to). Đối với GET thì dùng "get somebody TO DO something".',
    examTip: 'Công thức thuộc lòng: Have sb DO sth = Get sb TO DO sth = Have/Get sth DONE (V3/ed) by sb.',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u4-3',
    unitTopicId: 'unit-4',
    topicName: 'Tìm Lỗi Sai: Bị Động Với Động Từ Make / See / Hear',
    questionType: 'error_identification',
    instruction: 'Mark the letter A, B, C, or D to indicate the underlined part that needs correction.',
    sentencePrompt: 'The suspicious thief (A) was seen enter (B) the dragon nest (C) around midnight (D) yesterday.',
    options: ['(B) enter', '(A) was seen', '(C) around midnight', '(D) yesterday'],
    correctAnswer: '(B) enter',
    grammarRuleExplaining: 'Khi chuyển sang thể bị động, các động từ tri giác (see, hear, notice, make) phải đi kèm "to-V": "was seen TO enter" hoặc "was seen ENTERING". Không được để V-inf trần trong câu bị động.',
    examTip: 'Quy tắc bị động vào 10: Chủ động "make sb DO sth" -> Bị động "sb be MADE TO DO sth". Tương tự với "see / hear sb do sth".',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage2',
  },

  // ==========================================
  // CHUYÊN ĐỀ 5: CONDITIONALS & WISH / IF ONLY (UNIT 6 - UNIT 7)
  // ==========================================
  {
    id: 'ex-u5-1',
    unitTopicId: 'unit-5',
    topicName: 'Câu Điều Kiện Kết Hợp (Mixed Conditional Type 3 & 2)',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'If Linda _______ her English pronunciation diligently last semester, she _______ capable of deciphering the dragon code right now.',
    options: ['had practiced / would be', 'practiced / will be', 'had practiced / would have been', 'would practice / was'],
    correctAnswer: 'had practiced / would be',
    grammarRuleExplaining: 'Mệnh đề If diễn tả điều kiện trái với quá khứ (last semester -> Had + V3), mệnh đề chính diễn tả kết quả ở hiện tại (right now -> would + V-inf). Đây là câu điều kiện kết hợp loại 3 và loại 2.',
    examTip: 'Dấu hiệu câu điều kiện hỗn hợp trong đề vào 10: Mệnh đề If có thời gian quá khứ (yesterday, last year), mệnh đề chính có "now / right now / today".',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u5-2',
    unitTopicId: 'unit-5',
    topicName: 'Câu Ước Trái Thực Tế Ở Quá Khứ (Wish / If only)',
    questionType: 'sentence_transformation',
    instruction: 'Choose the sentence that is closest in meaning to the original sentence.',
    sentencePrompt: '"What a pity! Peter forgot to bring his protective dragon boots on the raid."',
    options: [
      'Peter wishes he had not forgotten to bring his protective dragon boots.',
      'Peter wishes he did not forget to bring his protective dragon boots.',
      'If only Peter brought his protective dragon boots yesterday.',
      'Peter wishes he brings his protective boots now.',
    ],
    correctAnswer: 'Peter wishes he had not forgotten to bring his protective dragon boots.',
    grammarRuleExplaining: 'Sự việc đã xảy ra trong quá khứ ("forgot"). Khi ước một điều trái ngược với quá khứ, ta dùng: S + wish(es) + S + Had (not) + V3/ed.',
    examTip: 'Biến đổi "What a pity / I am sorry that..." trong quá khứ -> S + wish + Had V3/ed.',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u5-3',
    unitTopicId: 'unit-5',
    topicName: 'Đảo Ngữ Câu Điều Kiện (Inversion in Conditionals)',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: '_______ more caution during the heist, they would not have triggered the dragon alarm.',
    options: ['Had they exercised', 'Were they to exercise', 'Did they exercise', 'If they exercise'],
    correctAnswer: 'Had they exercised',
    grammarRuleExplaining: 'Đảo ngữ câu điều kiện loại 3: "Had + S + V3/ed" thay cho "If + S + had + V3/ed". "Had they exercised" = "If they had exercised".',
    examTip: 'Đảo ngữ câu điều kiện loại 3 là câu phân loại học sinh thi chuyên Anh vào 10. Luôn bắt đầu bằng HAD + S + V3.',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage2',
  },

  // ==========================================
  // CHUYÊN ĐỀ 6: REPORTED SPEECH (UNIT 12 - UNIT 13)
  // ==========================================
  {
    id: 'ex-u6-1',
    unitTopicId: 'unit-6',
    topicName: 'Câu Gián Tiếp Với Động Từ Tường Thuật Đặc Biệt (warn, suggest, accuse)',
    questionType: 'sentence_transformation',
    instruction: 'Choose the sentence that is closest in meaning to the original statement.',
    sentencePrompt: '"You should never step on the red runes under any circumstances," the master warned his apprentices.',
    options: [
      'The master warned his apprentices not to step on the red runes under any circumstances.',
      'The master advised his apprentices step on the red runes.',
      'The master ordered his apprentices that they should step on the runes.',
      'The master insisted on his apprentices not stepping on runes.',
    ],
    correctAnswer: 'The master warned his apprentices not to step on the red runes under any circumstances.',
    grammarRuleExplaining: 'Cấu trúc tường thuật cảnh báo: "warn somebody (not) TO DO something".',
    examTip: 'Trong đề thi tuyển sinh 10, giám khảo thích kiểm tra các động từ tường thuật đặc biệt: warn sb against / warn sb not to V, accuse sb of V-ing, apologize to sb for V-ing.',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u6-2',
    unitTopicId: 'unit-6',
    topicName: 'Câu Gián Tiếp Dạng Câu Hỏi Yes/No & Wh-',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'The dragon asked the intruder _______ to obtain the secret golden egg.',
    options: ['why he wanted', 'why did he want', 'why he wants', 'that why he wanted'],
    correctAnswer: 'why he wanted',
    grammarRuleExplaining: 'Quy tắc đổi câu hỏi sang gián tiếp: S + asked + (O) + Wh-word + S + V (lùi thì). Tuyệt đối không đảo trợ động từ "did he want" và không dùng "that why".',
    examTip: 'Bẫy kinh điển: Trong câu gián tiếp, thứ tự từ luôn là CHỦ TỪ + ĐỘNG TỪ, không bao giờ dùng trật tự nghi vấn (trợ từ + S + V).',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },

  // ==========================================
  // CHUYÊN ĐỀ 7: RELATIVE CLAUSES & REDUCTIONS (UNIT 9 - UNIT 16)
  // ==========================================
  {
    id: 'ex-u7-1',
    unitTopicId: 'unit-7',
    topicName: 'Rút Gọn Mệnh Đề Quan Hệ (Reduced Relative Clauses: V-ing vs V3/ed)',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'The ancient scroll _______ in the deepest dragon vault contains spells _______ back to the fourteenth century.',
    options: ['discovered / dating', 'discovering / dated', 'which discovered / which date', 'discovered / dated'],
    correctAnswer: 'discovered / dating',
    grammarRuleExplaining: '"scroll" được tìm thấy (bị động) -> rút gọn thành V3 "discovered" (= which was discovered). "spells" có niên đại (chủ động) -> rút gọn thành V-ing "dating" (= which date back to...).',
    examTip: 'Quy tắc giản lược: Chủ động rút gọn thành V-ing, Bị động rút gọn thành V3/ed. Xuất hiện trong 100% đề thi tuyển sinh vào 10 chuyên & công lập.',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u7-2',
    unitTopicId: 'unit-7',
    topicName: 'Mệnh Đề Quan Hệ Có Giới Từ Đi Kèm (Whom / Which)',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'The dragon sanctuary has over fifty emerald nests, most of _______ are guarded by ancient fire drakes.',
    options: ['which', 'whom', 'them', 'that'],
    correctAnswer: 'which',
    grammarRuleExplaining: 'Sau lượng từ + giới từ (most of, all of, neither of, both of...) chỉ vật, bắt buộc phải dùng đại từ quan hệ "which", không dùng "that" hay "them".',
    examTip: 'Công thức độc quyền thi vào 10: One of / Most of / Neither of + WHOM (người) / WHICH (vật). Tuyệt đối không dùng THAT sau dấu phẩy và giới từ.',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage2',
  },

  // ==========================================
  // CHUYÊN ĐỀ 8: CONJUNCTIONS & LINKERS (UNIT 15)
  // ==========================================
  {
    id: 'ex-u8-1',
    unitTopicId: 'unit-8',
    topicName: 'Chuyển Đổi Although / Despite / In spite of',
    questionType: 'sentence_transformation',
    instruction: 'Choose the sentence that best rewrites the original sentence.',
    sentencePrompt: '"Although the stealth boots were extremely heavy, the scout climbed up the dragon cliff effortlessly."',
    options: [
      'Despite the extreme heaviness of the stealth boots, the scout climbed up the dragon cliff effortlessly.',
      'In spite of the stealth boots were heavy, the scout climbed up the cliff.',
      'Although being heavy, but the scout climbed up the dragon cliff effortlessly.',
      'Because the stealth boots were heavy, the scout climbed up easily.',
    ],
    correctAnswer: 'Despite the extreme heaviness of the stealth boots, the scout climbed up the dragon cliff effortlessly.',
    grammarRuleExplaining: 'Cấu trúc: "Although + Clause (S + V)" = "Despite / In spite of + Noun Phrase / V-ing". Trong tiếng Anh không dùng cả "Although" và "But" cùng lúc.',
    examTip: 'Bẫy vào 10: "In spite of" phải có "of", còn "Despite" tuyệt đối KHÔNG có "of".',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u8-2',
    unitTopicId: 'unit-8',
    topicName: 'Cấu Trúc So... that / Such... that',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'The dragon released _______ fierce fire breath _______ all the surrounding trees instantly turned into ashes.',
    options: ['such a / that', 'so a / that', 'so / that', 'such / that'],
    correctAnswer: 'such a / that',
    grammarRuleExplaining: '"such + (a/an) + Adj + Noun + that". Vì "fierce fire breath" có danh từ "breath" (ở đây mang nghĩa một luồng hơi thở cụ thể) dùng "such a fierce fire breath that".',
    examTip: 'Phân biệt vào 10: "So + Adj/Adv + that" vs "Such + (a/an) + Adj + Noun + that".',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },

  // ==========================================
  // CHUYÊN ĐỀ 9: PHRASAL VERBS & COLLOCATIONS (UNIT 17 - UNIT 18)
  // ==========================================
  {
    id: 'ex-u9-1',
    unitTopicId: 'unit-9',
    topicName: 'Cụm Động Từ Vào 10 Trọng Điểm (carry out, call off, come down with)',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'Due to unexpected dragon movements, the expedition team had to _______ their raid until next month.',
    options: ['call off', 'carry on', 'take after', 'look forward'],
    correctAnswer: 'call off',
    grammarRuleExplaining: '"call off" có nghĩa là hủy bỏ hoặc hoãn lại cuộc hành trình. "carry on" là tiếp tục, "take after" là giống ai đó.',
    examTip: 'Bộ tứ Phrasal Verbs hay gặp nhất đề thi vào 10: call off (hủy), put off (trì hoãn), give up (từ bỏ), look after (chăm sóc).',
    difficulty: 'standard',
    stageTarget: 'stage2',
  },
  {
    id: 'ex-u9-2',
    unitTopicId: 'unit-9',
    topicName: 'Thành Ngữ & Collocations Điểm 10 (Take into account / Make allowance for)',
    questionType: 'multiple_choice',
    instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
    sentencePrompt: 'When calculating stealth routes, explorers must take the dragon’s sharp hearing into _______ .',
    options: ['account', 'view', 'mind', 'thought'],
    correctAnswer: 'account',
    grammarRuleExplaining: 'Cụm thành ngữ cố định (idiom/collocation): "take something into account" = "take account of something" nghĩa là cân nhắc, tính đến yếu tố nào đó.',
    examTip: 'Thành ngữ kinh điển trong đề thi Chuyên 10: "take into account" / "make allowances for" / "bear in mind".',
    difficulty: 'advanced_chuyen',
    stageTarget: 'stage2',
  },
];

// Helper to get questions for a unit topic, ensuring strict anti-repetition filtering
export function getExamQuestionsForUnit(
  unitId: string,
  difficulty: 'standard' | 'advanced_chuyen' = 'standard',
  excludeSignatures: string[] = []
): {
  stage1: VocabularyItem[];
  stage2: GrammarTrapItem[];
  speaking: SpeakingCipher;
} {
  const normExcludes = new Set(excludeSignatures.map((s) => s.toLowerCase().trim()));

  // Filter pool matching unit and not excluded
  let eligibleQuestions = ENTRANCE_EXAM_BANK.filter((q) => {
    const isTopic = q.unitTopicId === unitId || q.unitTopicId.toLowerCase() === unitId.toLowerCase();
    const isExcluded = normExcludes.has(q.sentencePrompt.toLowerCase().trim()) || normExcludes.has(q.id.toLowerCase());
    return isTopic && !isExcluded;
  });

  // If pool exhausted for this specific unit, allow high-difficulty questions across the entrance exam bank
  if (eligibleQuestions.length < 4) {
    const generalEligible = ENTRANCE_EXAM_BANK.filter((q) => {
      return !normExcludes.has(q.sentencePrompt.toLowerCase().trim()) && !normExcludes.has(q.id.toLowerCase());
    });
    eligibleQuestions = [...eligibleQuestions, ...generalEligible];
  }

  // Separate into stage1 and stage2
  const stage2Candidates = eligibleQuestions.filter((q) => q.stageTarget === 'stage2');
  const stage1Candidates = eligibleQuestions.filter((q) => q.stageTarget === 'stage1');

  // Map to GrammarTrapItem
  const stage2Traps: GrammarTrapItem[] = (stage2Candidates.length > 0 ? stage2Candidates : ENTRANCE_EXAM_BANK)
    .slice(0, 4)
    .map((q) => ({
      id: q.id,
      instruction: q.instruction,
      sentencePrompt: q.sentencePrompt,
      options: q.options,
      correctAnswer: q.correctAnswer,
      grammarRuleExplaining: `${q.grammarRuleExplaining} • 💡 ${q.examTip}`,
    }));

  // Build high-difficulty vocabulary & phonetics items for Stage 1
  const stage1Vocab: VocabularyItem[] = [
    {
      id: `vocab-${unitId}-1`,
      word: 'stative verbs',
      phonetic: '/ˈsteɪtɪv vɜːbz/',
      meaningVi: 'Động từ chỉ trạng thái, nhận thức, cảm xúc (không chia tiếp diễn)',
      exampleEn: 'Stative verbs like know, love, and belong are not usually used in continuous tenses.',
      exampleVi: 'Động từ trạng thái như know, love và belong thường không dùng ở thì tiếp diễn.',
      keySound: '/eɪ/ & /v/',
      distractors: ['action verbs', 'modal verbs', 'phrasal verbs'],
    },
    {
      id: `vocab-${unitId}-2`,
      word: 'concession clause',
      phonetic: '/kənˈseʃ.ən klɔːz/',
      meaningVi: 'Mệnh đề nhượng bộ (Although, In spite of, Despite)',
      exampleEn: 'A concession clause shows an unexpected contrast between two actions.',
      exampleVi: 'Mệnh đề nhượng bộ thể hiện sự đối lập bất ngờ giữa hai hành động.',
      keySound: '/ʃ/ & /z/',
      distractors: ['purpose clause', 'result clause', 'reason clause'],
    },
    {
      id: `vocab-${unitId}-3`,
      word: 'collocation',
      phonetic: '/ˌkɒl.əˈkeɪ.ʃən/',
      meaningVi: 'Cụm từ cố định tự nhiên hay đi cùng nhau trong đề thi vào 10',
      exampleEn: 'Mastering collocations like "take into account" earns top scores in entrance exams.',
      exampleVi: 'Nắm vững các cụm cố định như "take into account" giúp đạt điểm tối đa trong kỳ thi vào 10.',
      keySound: '/k/ & /ʃən/',
      distractors: ['conjunction', 'preposition', 'abbreviation'],
    },
    {
      id: `vocab-${unitId}-4`,
      word: 'inversion',
      phonetic: '/ɪnˈvɜː.ʃən/',
      meaningVi: 'Đảo ngữ (đưa trợ từ/phó từ phủ định lên đầu câu nhằm nhấn mạnh)',
      exampleEn: 'Hardly had they entered the cavern when the dragon roared in fury.',
      exampleVi: 'Ngay khi họ vừa bước vào hang thì con rồng đã gầm lên giận dữ.',
      keySound: '/vɜː/ & /ʃən/',
      distractors: ['conversion', 'insertion', 'diversion'],
    },
  ];

  const speaking: SpeakingCipher = {
    id: `sp-${unitId}-exam`,
    title: `Mật Mã Đề Thi Vào 10: ${unitId.toUpperCase()}`,
    targetPhrase: 'I am thoroughly prepared to tackle complex grammar traps and achieve top scores in the entrance exam.',
    phonetic: '/aɪ æm ˈθʌrəli prɪˈpeəd tuː ˈtækl ˈkɒmpleks ˈɡræmə træps ænd əˈtʃiːv tɒp skɔːz ɪn ði ˈentrəns ɪɡˈzæm/',
    meaningVi: 'Tôi đã chuẩn bị kỹ lưỡng để giải quyết mọi bẫy ngữ pháp phức tạp và đạt điểm cao nhất trong kỳ thi vào 10.',
    targetSounds: ['/θ/', '/tr/', '/æ/'],
    expectedGrammarRule: 'Phối hợp thì & Cấu trúc nâng cao đề thi vào 10.',
    dragonGatekeeperPrompt: {
      question: 'Which grammatical structure in this entrance exam topic do students most easily make mistakes on, and why?',
      suggestedPattern: 'Students frequently make errors with [structure] because they confuse [A] with [B].',
      sampleAnswers: [
        'Students frequently make errors with stative verbs because they forget that verbs of senses cannot be used in continuous tenses.',
        'Students frequently make mistakes with reduced relative clauses because they confuse active V-ing with passive past participles.',
      ],
    },
  };

  return {
    stage1: stage1Vocab,
    stage2: stage2Traps,
    speaking,
  };
}
