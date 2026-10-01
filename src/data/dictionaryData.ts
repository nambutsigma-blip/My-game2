// Comprehensive English-Vietnamese Dictionary for School & Entrance Exams (Luyện thi vào 10)
// Provides 0ms instant lookup for hundreds of core vocabulary words, irregular verbs, idioms, and phrases.

export interface DictEntry {
  type: 'word' | 'phrase' | 'idiom' | 'sentence' | 'grammar_structure';
  typeLabel: string;
  phonetic: string;
  meaningVi: string;
  detailedExplanation?: string;
  grammarBreakdown?: string;
  examples: { en: string; vi: string }[];
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  examTip?: string;
  difficultyLevel?: string;
}

export const IRREGULAR_VERB_MAP: Record<string, string> = {
  slept: 'sleep',
  sleeping: 'sleep',
  sleeps: 'sleep',
  went: 'go',
  gone: 'go',
  goes: 'go',
  going: 'go',
  came: 'come',
  coming: 'come',
  comes: 'come',
  ate: 'eat',
  eaten: 'eat',
  eating: 'eat',
  eats: 'eat',
  drank: 'drink',
  drunk: 'drink',
  drinking: 'drink',
  drinks: 'drink',
  bought: 'buy',
  buying: 'buy',
  buys: 'buy',
  sold: 'sell',
  selling: 'sell',
  sells: 'sell',
  thought: 'think',
  thinking: 'think',
  thinks: 'think',
  taught: 'teach',
  teaching: 'teach',
  teaches: 'teach',
  caught: 'catch',
  catching: 'catch',
  catches: 'catch',
  brought: 'bring',
  bringing: 'bring',
  brings: 'bring',
  felt: 'feel',
  feeling: 'feel',
  feels: 'feel',
  found: 'find',
  finding: 'find',
  finds: 'find',
  gave: 'give',
  given: 'give',
  giving: 'give',
  gives: 'give',
  got: 'get',
  gotten: 'get',
  getting: 'get',
  gets: 'get',
  knew: 'know',
  known: 'know',
  knowing: 'know',
  knows: 'know',
  made: 'make',
  making: 'make',
  makes: 'make',
  ran: 'run',
  running: 'run',
  runs: 'run',
  said: 'say',
  saying: 'say',
  says: 'say',
  saw: 'see',
  seen: 'see',
  seeing: 'see',
  sees: 'see',
  spoke: 'speak',
  spoken: 'speak',
  speaking: 'speak',
  speaks: 'speak',
  took: 'take',
  taken: 'take',
  taking: 'take',
  takes: 'take',
  told: 'tell',
  telling: 'tell',
  tells: 'tell',
  wrote: 'write',
  written: 'write',
  writing: 'write',
  writes: 'write',
  built: 'build',
  building: 'build',
  builds: 'build',
  chose: 'choose',
  chosen: 'choose',
  choosing: 'choose',
  chooses: 'choose',
  drove: 'drive',
  driven: 'drive',
  driving: 'drive',
  drives: 'drive',
  flew: 'fly',
  flown: 'fly',
  flying: 'fly',
  flies: 'fly',
  forgot: 'forget',
  forgotten: 'forget',
  forgetting: 'forget',
  forgets: 'forget',
  heard: 'hear',
  hearing: 'hear',
  hears: 'hear',
  held: 'hold',
  holding: 'hold',
  holds: 'hold',
  kept: 'keep',
  keeping: 'keep',
  keeps: 'keep',
  left: 'leave',
  leaving: 'leave',
  leaves: 'leave',
  lost: 'lose',
  losing: 'lose',
  loses: 'lose',
  met: 'meet',
  meeting: 'meet',
  meets: 'meet',
  paid: 'pay',
  paying: 'pay',
  pays: 'pay',
  read: 'read',
  reading: 'read',
  reads: 'read',
  sent: 'send',
  sending: 'send',
  sends: 'send',
  sat: 'sit',
  sitting: 'sit',
  sits: 'sit',
  stood: 'stand',
  standing: 'stand',
  stands: 'stand',
  swam: 'swim',
  swum: 'swim',
  swimming: 'swim',
  swims: 'swim',
  understood: 'understand',
  understanding: 'understand',
  understands: 'understand',
  woke: 'wake',
  woken: 'wake',
  waking: 'wake',
  wakes: 'wake',
  wore: 'wear',
  worn: 'wear',
  wearing: 'wear',
  wears: 'wear',
  won: 'win',
  winning: 'win',
  wins: 'win',
};

export const CORE_DICTIONARY: Record<string, DictEntry> = {
  // --- SLEEP & REST FAMILY ---
  sleep: {
    type: 'word',
    typeLabel: 'Động từ / Danh từ (Verb / Noun)',
    phonetic: '/sliːp/',
    meaningVi: 'Ngủ, giấc ngủ, đi ngủ',
    detailedExplanation: 'Động từ chỉ trạng thái nghỉ ngơi tự nhiên của cơ thể và tâm trí. Là danh từ chỉ một giấc ngủ.',
    grammarBreakdown: 'Động từ bất quy tắc: sleep - slept - slept. Cụm từ thông dụng: go to sleep (đi ngủ), get to sleep (chợp mắt), deep sleep (giấc ngủ sâu).',
    synonyms: ['rest', 'slumber', 'nap', 'doze'],
    antonyms: ['wake', 'stay awake'],
    collocations: ['get enough sleep', 'fall asleep', 'go to sleep', 'lack of sleep', 'deep sleep'],
    examples: [
      { en: 'Teenagers need at least eight hours of sleep every night.', vi: 'Thanh thiếu niên cần ngủ ít nhất tám tiếng mỗi đêm.' },
      { en: 'I was so tired that I could hardly sleep last night.', vi: 'Tôi mệt đến mức đêm qua hầu như không ngủ được.' }
    ],
    examTip: 'Chú ý các dạng phân từ: sleep (V) -> asleep (Adj vị ngữ) -> sleepy (Adj trước N) -> sleepless (Adj mất ngủ).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  asleep: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective - vị ngữ)',
    phonetic: '/əˈsliːp/',
    meaningVi: 'Đang ngủ, trong trạng thái ngủ',
    detailedExplanation: 'Tính từ vị ngữ chỉ đứng sau động từ to be hoặc linking verbs (fall asleep, be asleep), KHÔNG đứng trước danh từ.',
    grammarBreakdown: 'Bắt buộc làm vị ngữ: The boy is asleep (Đúng). KHÔNG dùng: an asleep boy (Sai, phải dùng a sleeping boy).',
    synonyms: ['sleeping', 'resting', 'in slumber'],
    antonyms: ['awake', 'conscious'],
    collocations: ['fall asleep', 'fast asleep', 'sound asleep', 'half asleep'],
    examples: [
      { en: 'He was so exhausted that he fell asleep immediately.', vi: 'Anh ấy kiệt sức đến nỗi ngủ thiếp đi ngay lập tức.' },
      { en: 'The baby is fast asleep in the cradle.', vi: 'Em bé đang ngủ rất say trong nôi.' }
    ],
    examTip: 'Bẫy đề thi: "asleep" chỉ đứng sau be/fall/feel, không bao giờ đứng trước danh từ!',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  'fast asleep': {
    type: 'phrase',
    typeLabel: 'Cụm tính từ (Collocation)',
    phonetic: '/ˌfæst əˈsliːp/',
    meaningVi: 'Ngủ say, ngủ sâu giấc',
    detailedExplanation: 'Thành ngữ miêu tả người đang ngủ rất sâu, khó bị đánh thức bởi tiếng ồn xung quanh.',
    grammarBreakdown: 'Thường đi với: be fast asleep hoặc fall fast asleep. "Fast" ở đây là trạng từ chỉ mức độ sâu sắc.',
    synonyms: ['sound asleep', 'deep in sleep'],
    antonyms: ['wide awake', 'lightly sleeping'],
    collocations: ['fall fast asleep', 'be fast asleep'],
    examples: [
      { en: 'The dragon was fast asleep in its dark cave.', vi: 'Con rồng đang ngủ rất say trong hang tối của nó.' },
      { en: 'By midnight, everyone in the village was fast asleep.', vi: 'Đến nửa đêm, mọi người trong làng đều đã ngủ say.' }
    ],
    examTip: 'Trái nghĩa với "fast asleep" là "wide awake" (hoàn toàn tỉnh táo).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  wake: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/weɪk/',
    meaningVi: 'Thức dậy, đánh thức',
    detailedExplanation: 'Thức giấc sau khi ngủ hoặc làm cho ai đó thức dậy.',
    grammarBreakdown: 'Bất quy tắc: wake - woke - woken. Cụm động từ: wake up (thức dậy).',
    synonyms: ['awaken', 'get up', 'arouse'],
    antonyms: ['sleep', 'fall asleep'],
    collocations: ['wake up early', 'wake someone up'],
    examples: [
      { en: 'I usually wake up at 6 AM to prepare for school.', vi: 'Tôi thường thức dậy lúc 6 giờ sáng để chuẩn bị đi học.' }
    ],
    examTip: 'Phân biệt "wake up" (mở mắt thức giấc) và "get up" (rời khỏi giường đứng dậy).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  awake: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective - vị ngữ)',
    phonetic: '/əˈweɪk/',
    meaningVi: 'Tỉnh táo, thức, không ngủ',
    detailedExplanation: 'Trạng thái tỉnh táo, không trong giấc ngủ. Giống asleep, awake chỉ làm vị ngữ sau to be/stay/keep.',
    grammarBreakdown: 'To be awake / stay awake. Tránh dùng trực tiếp trước danh từ.',
    synonyms: ['conscious', 'alert'],
    antonyms: ['asleep'],
    collocations: ['wide awake', 'stay awake', 'keep awake'],
    examples: [
      { en: 'I drank coffee to stay awake during the revision session.', vi: 'Tôi đã uống cà phê để tỉnh táo trong suốt buổi ôn tập.' }
    ],
    examTip: 'Cụm "wide awake" = hoàn toàn tỉnh táo.',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  dream: {
    type: 'word',
    typeLabel: 'Động từ / Danh từ (Verb / Noun)',
    phonetic: '/driːm/',
    meaningVi: 'Mơ, giấc mơ, ước mơ',
    detailedExplanation: 'Trải nghiệm hình ảnh trong giấc ngủ hoặc hoài bão, ước vọng tương lai.',
    grammarBreakdown: 'Dream of / about + V-ing/Noun (mơ về điều gì). Quá khứ: dreamed hoặc dreamt.',
    synonyms: ['aspiration', 'ambition', 'vision'],
    collocations: ['dream come true', 'have a dream', 'dream of becoming'],
    examples: [
      { en: 'Her dream of entering the gifted high school came true.', vi: 'Ước mơ thi đỗ vào trường THPT chuyên của cô ấy đã trở thành hiện thực.' }
    ],
    examTip: 'Cấu trúc: dream of + V-ing (mơ ước làm việc gì).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  tired: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/ˈtaɪəd/',
    meaningVi: 'Mệt mỏi, kiệt sức, chán ngấy',
    detailedExplanation: 'Cảm giác hao hụt năng lượng thể chất hoặc chán ngấy một điều gì đó lặp đi lặp lại.',
    grammarBreakdown: 'Tired from (mệt vì lao động thể lực), tired of (chán ngấy điều gì = bored with).',
    synonyms: ['exhausted', 'fatigued', 'weary'],
    antonyms: ['energetic', 'fresh'],
    collocations: ['tired of waiting', 'feel tired', 'extremely tired'],
    examples: [
      { en: 'I am tired of doing repetitive grammar drills every day.', vi: 'Tôi chán ngấy việc làm những bài tập ngữ pháp lặp đi lặp lại mỗi ngày.' }
    ],
    examTip: 'Bẫy giới từ: "tired OF" = chán ngấy; "tired FROM" = mệt mỏi do vận động.',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  rest: {
    type: 'word',
    typeLabel: 'Động từ / Danh từ (Verb / Noun)',
    phonetic: '/rest/',
    meaningVi: 'Nghỉ ngơi, sự nghỉ ngơi, phần còn lại',
    detailedExplanation: 'Dừng hoạt động để hồi phục sức lực hoặc chỉ phần còn lại của một tổng thể (the rest of).',
    grammarBreakdown: 'Take a rest / have a rest (nghỉ ngơi). The rest of + Noun.',
    synonyms: ['relax', 'break', 'pause'],
    collocations: ['take a rest', 'have a rest', 'the rest of the day'],
    examples: [
      { en: 'You should take a short rest after studying for two hours.', vi: 'Bạn nên nghỉ ngơi một lát sau khi đã học hai tiếng đồng hồ.' }
    ],
    examTip: 'Cụm "the rest of" chia động từ theo danh từ đi sau: the rest of students ARE, the rest of time IS.',
    difficultyLevel: 'Chuẩn Vào 10'
  },

  // --- CORE VERBS & SCHOOL VOCABULARY ---
  study: {
    type: 'word',
    typeLabel: 'Động từ / Danh từ (Verb / Noun)',
    phonetic: '/ˈstʌd.i/',
    meaningVi: 'Học tập, nghiên cứu, phòng học',
    detailedExplanation: 'Quá trình tiếp thu kiến thức một cách bài bản thông qua sách vở hoặc trường lớp.',
    grammarBreakdown: 'Quá khứ: studied. Đi với: study for an exam (ôn thi).',
    synonyms: ['learn', 'revise', 'research'],
    collocations: ['study hard', 'study abroad', 'study for the entrance exam'],
    examples: [
      { en: 'Students must study hard to pass the high school entrance exam.', vi: 'Học sinh phải học tập chăm chỉ để đỗ kỳ thi tuyển sinh vào lớp 10.' }
    ],
    examTip: 'Phân biệt "study" (học tập, nghiên cứu có phương pháp) và "learn" (học được một kỹ năng/kiến thức cụ thể).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  learn: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/lɜːn/',
    meaningVi: 'Học hỏi, tiếp thu, ghi nhớ',
    detailedExplanation: 'Tiếp nhận kiến thức, kỹ năng hoặc bài học qua trải nghiệm và rèn luyện.',
    grammarBreakdown: 'Learn to + V (học cách làm gì), learn by heart (học thuộc lòng).',
    synonyms: ['acquire', 'master'],
    collocations: ['learn by heart', 'learn from mistakes', 'learn a new language'],
    examples: [
      { en: 'You should learn English vocabulary by heart every day.', vi: 'Bạn nên học thuộc lòng từ vựng tiếng Anh mỗi ngày.' }
    ],
    examTip: 'Cụm thành ngữ "learn by heart" = học thuộc lòng.',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  teach: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/tiːtʃ/',
    meaningVi: 'Dạy học, giảng dạy, dạy bảo',
    detailedExplanation: 'Truyền đạt kiến thức hoặc kỹ năng cho người khác.',
    grammarBreakdown: 'Bất quy tắc: teach - taught - taught. Cấu trúc: teach someone to do something.',
    synonyms: ['instruct', 'educate', 'train'],
    collocations: ['teach English', 'teach someone a lesson'],
    examples: [
      { en: 'Our teacher taught us useful exam strategies yesterday.', vi: 'Thầy giáo đã dạy chúng tôi các chiến thuật làm bài thi bổ ích vào ngày hôm qua.' }
    ],
    examTip: 'Dạng bị động: We were taught by our teacher.',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  eat: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/iːt/',
    meaningVi: 'Ăn, dùng bữa',
    detailedExplanation: 'Hành động tiêu thụ thức ăn vào cơ thể.',
    grammarBreakdown: 'Bất quy tắc: eat - ate - eaten. Cụm từ: eat out (ăn ngoài hàng).',
    synonyms: ['consume', 'dine'],
    collocations: ['eat out', 'eat healthy', 'eat balanced meals'],
    examples: [
      { en: 'Eating healthy food helps you concentrate better in class.', vi: 'Ăn thực phẩm lành mạnh giúp bạn tập trung tốt hơn trong lớp học.' }
    ],
    examTip: 'Thành ngữ: eat out (đi ăn nhà hàng).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  drink: {
    type: 'word',
    typeLabel: 'Động từ / Danh từ (Verb / Noun)',
    phonetic: '/drɪŋk/',
    meaningVi: 'Uống, đồ uống, thức uống',
    detailedExplanation: 'Tiêu thụ chất lỏng hoặc các loại đồ uống.',
    grammarBreakdown: 'Bất quy tắc: drink - drank - drunk.',
    synonyms: ['beverage', 'sip'],
    collocations: ['drink plenty of water', 'soft drink'],
    examples: [
      { en: 'Drink plenty of water before taking the physical test.', vi: 'Hãy uống nhiều nước trước khi tham gia bài kiểm tra thể lực.' }
    ],
    examTip: 'Quá khứ: drank; Phân từ hai: drunk.',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  read: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/riːd/',
    meaningVi: 'Đọc (sách, báo, tài liệu)',
    detailedExplanation: 'Nhìn vào chữ và hiểu nội dung được viết ra.',
    grammarBreakdown: 'Bất quy tắc: read /riːd/ - read /red/ - read /red/ (viết giống nhau, phát âm khác nhau ở thì quá khứ).',
    synonyms: ['peruse', 'scan', 'skim'],
    collocations: ['read books', 'reading comprehension'],
    examples: [
      { en: 'Reading English newspapers improves your vocabulary rapidly.', vi: 'Đọc báo tiếng Anh giúp bạn nâng cao vốn từ vựng một cách nhanh chóng.' }
    ],
    examTip: 'Đề thi hay kiểm tra phát âm đuôi: hiện tại phát âm /iː/, quá khứ phát âm /e/.',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  write: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/raɪt/',
    meaningVi: 'Viết, sáng tác, ghi chép',
    detailedExplanation: 'Tạo ra các ký tự hoặc bài văn bằng bút hay bàn phím.',
    grammarBreakdown: 'Bất quy tắc: write - wrote - written.',
    synonyms: ['compose', 'pen', 'draft'],
    collocations: ['write an essay', 'write down notes'],
    examples: [
      { en: 'Candidates must write their answers clearly in ink.', vi: 'Thí sinh phải viết câu trả lời rõ ràng bằng mực.' }
    ],
    examTip: 'Bị động: The letter was written by Tom.',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  speak: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/spiːk/',
    meaningVi: 'Nói, phát biểu, giao tiếp bằng lời',
    detailedExplanation: 'Diễn đạt ý nghĩ bằng âm thanh lời nói hoặc sử dụng một ngôn ngữ.',
    grammarBreakdown: 'Bất quy tắc: speak - spoke - spoken. Speak to/with someone; speak English.',
    synonyms: ['talk', 'converse'],
    collocations: ['speak English fluently', 'speak in public'],
    examples: [
      { en: 'She can speak both English and French fluently.', vi: 'Cô ấy có thể nói trôi chảy cả tiếng Anh và tiếng Pháp.' }
    ],
    examTip: 'Phân biệt: speak (nói một thứ tiếng), talk (trò chuyện), say (nói lời cụ thể), tell (kể/bảo ai làm gì).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  listen: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/ˈlɪs.ən/',
    meaningVi: 'Lắng nghe, chú ý nghe',
    detailedExplanation: 'Chủ động tập trung thính giác để nghe và tiếp nhận thông tin.',
    grammarBreakdown: 'BẮT BUỘC có giới từ: listen TO someone/something.',
    synonyms: ['hear', 'pay attention', 'heed'],
    collocations: ['listen to music', 'listen carefully to the teacher'],
    examples: [
      { en: 'Listen carefully to the instructions before starting the exam.', vi: 'Hãy lắng nghe kỹ các hướng dẫn trước khi bắt đầu bài thi.' }
    ],
    examTip: 'LỖI SAI KINH ĐIỂN: Rất nhiều thí sinh quên giới từ "TO" sau "listen". Luôn nhớ: LISTEN TO!',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  understand: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/ˌʌn.dəˈstænd/',
    meaningVi: 'Hiểu, thấu hiểu, nắm bắt',
    detailedExplanation: 'Nhận thức được ý nghĩa, nguyên nhân hoặc bản chất của sự việc.',
    grammarBreakdown: 'Bất quy tắc: understand - understood - understood. Không dùng ở thì tiếp diễn (stative verb).',
    synonyms: ['comprehend', 'grasp', 'figure out'],
    antonyms: ['misunderstand'],
    collocations: ['understand the question', 'fully understand'],
    examples: [
      { en: 'Do you understand the grammar rule explained on the blackboard?', vi: 'Bạn có hiểu quy tắc ngữ pháp được giải thích trên bảng không?' }
    ],
    examTip: 'Động từ chỉ nhận thức (Stative Verbs) như understand KHÔNG chia thì tiếp diễn (-ing).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  remember: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/rɪˈmem.bər/',
    meaningVi: 'Nhớ, ghi nhớ, nhớ lại',
    detailedExplanation: 'Lưu giữ thông tin trong trí nhớ hoặc nhớ ra điều cần làm.',
    grammarBreakdown: 'Remember to V (nhớ phải làm việc gì trong tương lai) vs Remember V-ing (nhớ đã làm việc gì trong quá khứ).',
    synonyms: ['recall', 'recollect'],
    antonyms: ['forget'],
    collocations: ['remember to lock the door', 'remember meeting him'],
    examples: [
      { en: 'Remember to check your answers before submitting the test paper.', vi: 'Hãy nhớ kiểm tra lại các câu trả lời trước khi nộp bài thi.' }
    ],
    examTip: 'CỰC KỲ QUAN TRỌNG VÀO 10: remember to V (nhớ việc chưa làm) khác remember V-ing (nhớ việc đã làm).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  forget: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/fəˈɡet/',
    meaningVi: 'Quên, không nhớ',
    detailedExplanation: 'Không còn giữ lại thông tin trong trí nhớ hoặc bỏ sót điều cần làm.',
    grammarBreakdown: 'Bất quy tắc: forget - forgot - forgotten. Forget to V (quên phải làm gì) vs Forget V-ing (quên đã làm gì).',
    synonyms: ['overlook', 'neglect'],
    antonyms: ['remember'],
    collocations: ['forget to bring homework', 'never forget'],
    examples: [
      { en: 'Don’t forget to turn off the lights before leaving the classroom.', vi: 'Đừng quên tắt đèn trước khi rời khỏi lớp học nhé.' }
    ],
    examTip: 'Cấu trúc vào 10: Don’t forget to do something = Remember to do something.',
    difficultyLevel: 'Chuẩn Vào 10'
  },

  // --- UNIT 1 - 12 SPECIALIZED EXAM TERMS ---
  heritage: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈher.ɪ.tɪdʒ/',
    meaningVi: 'Di sản (văn hóa, lịch sử, truyền thống dân tộc)',
    detailedExplanation: 'Những giá trị văn hóa, kiến trúc hay truyền thống được lưu truyền từ đời trước sang đời sau.',
    grammarBreakdown: 'Danh từ không đếm được hoặc đếm được. Đi với: cultural heritage, world heritage.',
    synonyms: ['legacy', 'tradition'],
    collocations: ['cultural heritage', 'preserve heritage', 'world heritage site'],
    examples: [
      { en: 'Trang An is a renowned World Cultural and Natural Heritage site.', vi: 'Tràng An là quần thể Di sản Văn hóa và Thiên nhiên Thế giới nổi tiếng.' }
    ],
    examTip: 'Thường đi liền với động từ "preserve" (bảo tồn) hoặc "pass down" (truyền lại).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  preserve: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/prɪˈzɜːv/',
    meaningVi: 'Bảo tồn, gìn giữ, giữ nguyên vẹn',
    detailedExplanation: 'Bảo vệ điều gì khỏi bị hư hỏng, mai một theo thời gian.',
    grammarBreakdown: 'Ngoại động từ: preserve sth. Danh từ: preservation. Tính từ: preservative.',
    synonyms: ['protect', 'conserve', 'maintain'],
    antonyms: ['destroy', 'damage'],
    collocations: ['preserve ancient monuments', 'preserve traditional customs'],
    examples: [
      { en: 'The villagers work hard to preserve their traditional customs.', vi: 'Dân làng làm việc chăm chỉ để gìn giữ các phong tục truyền thống của họ.' }
    ],
    examTip: 'Phân biệt "preserve" (giữ nguyên hiện trạng) và "conserve" (dùng tiết kiệm để tránh cạn kiệt tài nguyên).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  magnificent: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/mæɡˈnɪf.ɪ.sənt/',
    meaningVi: 'Tráng lệ, nguy nga, lộng lẫy, kỳ vĩ',
    detailedExplanation: 'Mô tả vẻ đẹp lộng lẫy của phong cảnh tự nhiên hoặc công trình kiến trúc đồ sộ.',
    grammarBreakdown: 'Tính từ mô tả. Trạng từ: magnificently. Danh từ: magnificence.',
    synonyms: ['spectacular', 'breathtaking', 'splendid'],
    collocations: ['magnificent view', 'magnificent palace'],
    examples: [
      { en: 'From the mountain peak, visitors can admire a magnificent sunrise.', vi: 'Từ đỉnh núi, du khách có thể chiêm ngưỡng bình minh tráng lệ.' }
    ],
    difficultyLevel: 'Chuẩn Vào 10'
  },
  stealth: {
    type: 'word',
    typeLabel: 'Danh từ / Tính từ (Noun / Adjective)',
    phonetic: '/stelθ/',
    meaningVi: 'Sự lén lút, tàng hình, hành động êm ái bí mật',
    detailedExplanation: 'Hành động di chuyển cẩn trọng, không gây ra bất kỳ tiếng động nào để tránh bị phát hiện.',
    grammarBreakdown: 'Cụm từ cố định: by stealth (một cách lén lút). Tính từ: stealthy; trạng từ: stealthily.',
    synonyms: ['secrecy', 'sneakiness'],
    collocations: ['stealth mode', 'operate by stealth'],
    examples: [
      { en: 'The thief entered the dragon lair with extreme stealth.', vi: 'Kẻ trộm đột nhập vào ổ rồng với sự khéo léo và êm ái tột độ.' }
    ],
    difficultyLevel: 'Chuyên Anh'
  },
  biodiversity: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/',
    meaningVi: 'Đa dạng sinh học',
    detailedExplanation: 'Sự phong phú về các loài động thực vật và hệ sinh thái trong môi trường tự nhiên.',
    grammarBreakdown: 'Tiền tố bio- (sinh học) + diversity (sự đa dạng).',
    synonyms: ['ecological diversity'],
    collocations: ['rich biodiversity', 'loss of biodiversity', 'conserve biodiversity'],
    examples: [
      { en: 'Deforestation causes severe loss of biodiversity.', vi: 'Nạn phá rừng gây ra sự suy giảm đa dạng sinh học nghiêm trọng.' }
    ],
    difficultyLevel: 'Chuẩn Vào 10'
  },

  // --- COMMON SCHOOL & EXAM VERBS ---
  go: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/ɡəʊ/',
    meaningVi: 'Đi, di chuyển, tới',
    detailedExplanation: 'Di chuyển từ nơi này đến nơi khác.',
    grammarBreakdown: 'Bất quy tắc: go - went - gone. Cụm từ: go on (tiếp tục), go off (reo chuông, nổ tung), go out (mất điện, ra ngoài).',
    examples: [{ en: 'We go to school by bicycle every morning.', vi: 'Chúng tôi đi học bằng xe đạp mỗi sáng.' }],
    examTip: 'Cụm phrasal verb: go off (chuông reo/thức ăn ôi thiu), go on (tiếp tục).',
  },
  come: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/kʌm/',
    meaningVi: 'Đến, tới nơi, xuất hiện',
    detailedExplanation: 'Di chuyển đến vị trí của người nói hoặc một địa điểm xác định.',
    grammarBreakdown: 'Bất quy tắc: come - came - come. Cụm: come across (tình cờ gặp), come up with (nảy ra ý tưởng).',
    examples: [{ en: 'She came up with a creative solution for the grammar puzzle.', vi: 'Cô ấy đã nảy ra một giải pháp sáng tạo cho câu đố ngữ pháp.' }],
    examTip: 'Cụm "come up with" = nảy ra sáng kiến/ý tưởng (rất hay gặp trong đề thi vào 10).',
  },
  do: {
    type: 'word',
    typeLabel: 'Động từ (Verb / Trợ động từ)',
    phonetic: '/duː/',
    meaningVi: 'Làm, thực hiện, hành động',
    detailedExplanation: 'Thực hiện một hành động, nhiệm vụ hoặc bổn phận.',
    grammarBreakdown: 'Bất quy tắc: do - did - done. Phân biệt "do homework / do chores" với "make a cake / make a mistake".',
    examples: [{ en: 'You must do your homework before playing games.', vi: 'Bạn phải làm bài tập về nhà trước khi chơi game.' }],
    examTip: 'BẪY PHÂN BIỆT DO & MAKE: do homework/research/harm vs make mistake/decision/effort.',
  },
  make: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/meɪk/',
    meaningVi: 'Làm, chế tạo, khiến cho, tạo nên',
    detailedExplanation: 'Tạo ra sản phẩm mới hoặc khiến ai đó làm/cảm thấy điều gì.',
    grammarBreakdown: 'Make + O + V-bare (bắt/khiến ai làm gì). Make + O + Adj (khiến ai cảm thấy thế nào).',
    examples: [{ en: 'His inspiring words made me feel confident.', vi: 'Những lời động viên của thầy đã khiến tôi cảm thấy tự tin.' }],
    examTip: 'Cấu trúc vào 10: make someone DO something (dùng V-nguyên thể không "to").',
  },
  take: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/teɪk/',
    meaningVi: 'Cầm, lấy, đưa đi, tốn thời gian',
    detailedExplanation: 'Cầm nắm, mang theo hoặc mất bao nhiêu thời gian để làm việc gì.',
    grammarBreakdown: 'It takes/took + O + time + to V = S + spend + time + V-ing.',
    examples: [{ en: 'It takes me twenty minutes to cycle to school.', vi: 'Tôi mất 20 phút đạp xe đến trường.' }],
    examTip: 'BÀI TẬP VIẾT LẠI CÂU KINH ĐIỂN: It takes someone time to V = S spend time V-ing.',
  },
  give: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/ɡɪv/',
    meaningVi: 'Cho, tặng, trao, cung cấp',
    detailedExplanation: 'Chuyển giao quyền sở hữu hoặc sự hỗ trợ cho người khác.',
    grammarBreakdown: 'Give someone something = Give something TO someone. Bất quy tắc: give - gave - given.',
    examples: [{ en: 'She gave me an English dictionary on my birthday.', vi: 'Cô ấy đã tặng tôi một cuốn từ điển tiếng Anh vào ngày sinh nhật.' }],
  },
  get: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/ɡet/',
    meaningVi: 'Nhận được, đạt được, trở nên',
    detailedExplanation: 'Tiếp nhận, mua hoặc biến chuyển trạng thái.',
    grammarBreakdown: 'Get + Adj (trở nên...: get cold, get tired). Phrasal verbs: get over (vượt qua), get along with (hòa hợp).',
    examples: [{ en: 'He got high marks in the English midterm examination.', vi: 'Anh ấy đã đạt điểm cao trong kỳ thi giữa kỳ môn tiếng Anh.' }],
  },
  environment: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ɪnˈvaɪ.rən.mənt/',
    meaningVi: 'Môi trường (tự nhiên, sống, sinh thái)',
    detailedExplanation: 'Thế giới tự nhiên bao gồm đất, nước, không khí và hệ sinh thái xung quanh con người.',
    grammarBreakdown: 'Tính từ: environmental; Trạng từ: environmentally; Nhà bảo vệ môi trường: environmentalist.',
    examples: [{ en: 'We must protect the natural environment from pollution.', vi: 'Chúng ta phải bảo vệ môi trường tự nhiên khỏi ô nhiễm.' }],
    examTip: 'Chủ điểm Môi trường chiếm 15% câu hỏi trong đề thi tuyển sinh vào 10.',
  },
  pollution: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/pəˈluː.ʃən/',
    meaningVi: 'Sự ô nhiễm (không khí, nước, tiếng ồn)',
    detailedExplanation: 'Tình trạng môi trường bị nhiễm bẩn bởi các chất độc hại do con người thải ra.',
    grammarBreakdown: 'Động từ: pollute; Tính từ: polluted (bị ô nhiễm), polluting (gây ô nhiễm); Chất gây ô nhiễm: pollutant.',
    examples: [{ en: 'Air pollution is a major concern in large modern cities.', vi: 'Ô nhiễm không khí là mối quan tâm hàng đầu ở các đô thị lớn hiện đại.' }],
    examTip: 'Dạng bài Word Formation: phân biệt pollutant (chất gây ô nhiễm) và pollution (sự ô nhiễm).',
  },
  custom: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈkʌs.təm/',
    meaningVi: 'Phong tục, tập quán, thói quen truyền thống',
    detailedExplanation: 'Thói quen hoặc lối hành xử được chấp nhận và duy trì qua nhiều thế hệ trong cộng đồng.',
    grammarBreakdown: 'There is a custom of + V-ing. Khác với "customs" (thuế hải quan).',
    examples: [{ en: 'It is a custom in Vietnam to visit relatives during Tet holiday.', vi: 'Đó là một phong tục ở Việt Nam đến thăm hỏi họ hàng vào dịp Tết.' }],
    examTip: 'Thường đi với cấu trúc: follow the custom of / break with custom.',
  },
  tradition: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/trəˈdɪʃ.ən/',
    meaningVi: 'Truyền thống (văn hóa, gia đình, dân tộc)',
    detailedExplanation: 'Niềm tin, tập tục hoặc lối sống được truyền từ đời này sang đời khác.',
    grammarBreakdown: 'Tính từ: traditional; Trạng từ: traditionally. Cụm: by tradition (theo truyền thống).',
    examples: [{ en: 'Vietnamese people have a long tradition of honoring teachers.', vi: 'Người Việt Nam có truyền thống tôn sư trọng đạo lâu đời.' }],
  },
  nomadic: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/nəʊˈmæd.ɪk/',
    meaningVi: 'Du mục, nay đây mai đó',
    detailedExplanation: 'Lối sống di chuyển thường xuyên cùng đàn gia súc để tìm đồng cỏ mới, không định cư một chỗ.',
    grammarBreakdown: 'Danh từ: nomad (người du mục). Cụm: nomadic life / nomadic lifestyle.',
    examples: [{ en: 'The Mongolian herders still maintain a traditional nomadic life.', vi: 'Những người chăn gia súc Mông Cổ vẫn duy trì lối sống du mục truyền thống.' }],
    examTip: 'Từ vựng trọng tâm Unit 2: Life in the countryside (Tiếng Anh 8).',
  },
  harvest: {
    type: 'word',
    typeLabel: 'Danh từ / Động từ (Noun / Verb)',
    phonetic: '/ˈhɑː.vɪst/',
    meaningVi: 'Vụ thu hoạch, vụ mùa gặt; gặt hái',
    detailedExplanation: 'Thời gian hoặc hành động thu hoạch lúa, hoa màu trên đồng ruộng.',
    grammarBreakdown: 'Harvest season (mùa gặt), harvest festival (lễ hội mừng lúa mới).',
    examples: [{ en: 'Farmers are busy cutting rice during the autumn harvest season.', vi: 'Nông dân bận rộn gặt lúa trong mùa thu hoạch mùa thu.' }],
  },
  commute: {
    type: 'word',
    typeLabel: 'Động từ / Danh từ (Verb / Noun)',
    phonetic: '/kəˈmjuːt/',
    meaningVi: 'Đi lại hàng ngày (giữa nhà và nơi làm/học)',
    detailedExplanation: 'Hành trình di chuyển đều đặn mỗi ngày từ nhà tới trường hoặc công sở bằng phương tiện.',
    grammarBreakdown: 'Commute by bus/train. Danh từ chỉ người đi lại: commuter.',
    examples: [{ en: 'Thousands of commuters travel to the city center every morning.', vi: 'Hàng ngàn người đi làm di chuyển vào trung tâm thành phố mỗi sáng.' }],
  },
  congestion: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/kənˈdʒes.tʃən/',
    meaningVi: 'Sự ùn tắc, sự tắc nghẽn (giao thông)',
    detailedExplanation: 'Tình trạng đường phố quá đông xe cộ dẫn đến kẹt xe kéo dài.',
    grammarBreakdown: 'Traffic congestion = Traffic jam. Tính từ: congested (bị ùn tắc).',
    examples: [{ en: 'Traffic congestion is a severe challenge during rush hours.', vi: 'Ùn tắc giao thông là một thách thức nghiêm trọng trong giờ cao điểm.' }],
    examTip: 'Đồng nghĩa với "traffic jam".',
  },
  craft: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/krɑːft/',
    meaningVi: 'Thủ công mỹ nghệ, nghề thủ công',
    detailedExplanation: 'Kỹ năng làm đồ bằng tay đòi hỏi sự khéo léo và nghệ thuật.',
    grammarBreakdown: 'Traditional craft village (làng nghề truyền thống). Thợ thủ công: artisan / craftsman.',
    examples: [{ en: 'Bat Trang is a famous traditional pottery craft village in Hanoi.', vi: 'Bát Tràng là làng nghề thủ công gốm sứ truyền thống nổi tiếng ở Hà Nội.' }],
    examTip: 'Từ vựng Unit 1 Tiếng Anh 9 (Local Environment / Traditional Crafts).',
  },
  pottery: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈpɒt.ər.i/',
    meaningVi: 'Đồ gốm, nghề làm gốm sứ',
    detailedExplanation: 'Các vật dụng làm từ đất sét nung như bát, đĩa, bình hoa nghệ thuật.',
    examples: [{ en: 'Tourists can try making pottery under the guidance of artisans.', vi: 'Du khách có thể trải nghiệm tự tay làm gốm dưới sự hướng dẫn của nghệ nhân.' }],
  },
  artisan: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˌɑː.tɪˈzæn/',
    meaningVi: 'Nghệ nhân, thợ thủ công lành nghề',
    detailedExplanation: 'Người thợ có tay nghề cao, chuyên tạo ra các sản phẩm thủ công tinh xảo.',
    examples: [{ en: 'Skilled artisans carve delicate patterns on wooden furniture.', vi: 'Các nghệ nhân lành nghề chạm khắc hoa văn tinh xảo trên đồ gỗ.' }],
  },
  // --- KEY PHRASES & IDIOMS ---
  'look forward to': {
    type: 'phrase',
    typeLabel: 'Cụm động từ (Phrasal Verb)',
    phonetic: '/lʊk ˈfɔː.wəd tuː/',
    meaningVi: 'Rất mong chờ, háo hức chờ đợi điều gì',
    detailedExplanation: 'Bày tỏ cảm xúc vui mừng và mong mỏi về một sự kiện sắp diễn ra trong tương lai gần.',
    grammarBreakdown: 'BẮT BUỘC: look forward to + V-ing / Noun (Giới từ "to" là preposition, KHÔNG PHẢI to-V).',
    synonyms: ['anticipate', 'await eagerly'],
    collocations: ['look forward to seeing you', 'look forward to the holiday'],
    examples: [
      { en: 'I look forward to hearing from you soon.', vi: 'Tôi rất mong sớm nhận được hồi âm từ bạn.' }
    ],
    examTip: 'BẪY VÀNG VÀO 10: 90% học sinh chọn nhầm V-nguyên thể. Hãy luôn nhớ: LOOK FORWARD TO + V-ING!',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  'give up': {
    type: 'phrase',
    typeLabel: 'Cụm động từ (Phrasal Verb)',
    phonetic: '/ɡɪv ʌp/',
    meaningVi: 'Từ bỏ, bỏ cuộc, dừng thói quen',
    detailedExplanation: 'Ngừng làm điều gì đó hoặc từ bỏ hy vọng vì quá khó khăn.',
    grammarBreakdown: 'Give up + V-ing / Noun. Quá khứ: gave up; phân từ: given up.',
    synonyms: ['quit', 'abandon'],
    collocations: ['never give up', 'give up smoking'],
    examples: [
      { en: 'Never give up your dreams no matter the difficulty.', vi: 'Đừng bao giờ từ bỏ ước mơ bất kể khó khăn thế nào.' }
    ],
    examTip: 'Cấu trúc chuyển đổi: stop doing sth = give up doing sth.',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  'in spite of': {
    type: 'phrase',
    typeLabel: 'Cụm giới từ (Prepositional Phrase)',
    phonetic: '/ɪn spaɪt əv/',
    meaningVi: 'Mặc dù, bất chấp',
    detailedExplanation: 'Biểu thị sự đối lập tương phản giữa hai sự việc, hành động vẫn diễn ra bất chấp trở ngại.',
    grammarBreakdown: 'In spite of + Noun / V-ing = Despite + Noun / V-ing = Although / Even though + S + V.',
    synonyms: ['despite', 'regardless of'],
    collocations: ['in spite of the rain', 'in spite of being tired'],
    examples: [
      { en: 'In spite of the bad weather, we finished the race.', vi: 'Bất chấp thời tiết xấu, chúng tôi đã hoàn thành cuộc đua.' }
    ],
    examTip: 'CỰC KỲ QUAN TRỌNG: Đề thi vào 10 năm nào cũng có câu chuyển đổi giữa Although (S+V) và In spite of (N/V-ing).',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  'piece of cake': {
    type: 'idiom',
    typeLabel: 'Thành ngữ (Idiom)',
    phonetic: '/piːs əv keɪk/',
    meaningVi: 'Dễ như ăn bánh, việc cực kỳ dễ dàng',
    detailedExplanation: 'Thành ngữ miêu tả việc gì đó vô cùng đơn giản, không tốn nhiều công sức.',
    synonyms: ['as easy as ABC', 'a breeze'],
    examples: [
      { en: 'That English test was a piece of cake for him.', vi: 'Bài kiểm tra tiếng Anh đó dễ như ăn bánh đối với anh ấy.' }
    ],
    examTip: 'Hay xuất hiện trong các câu đối thoại giao tiếp thường ngày của đề thi vào 10.',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  'keen on': {
    type: 'phrase',
    typeLabel: 'Cụm tính từ (Collocation)',
    phonetic: '/kiːn ɒn/',
    meaningVi: 'Thích thú, say mê, ham thích',
    detailedExplanation: 'Chỉ niềm yêu thích, đam mê đối với một hoạt động hoặc sở thích.',
    grammarBreakdown: 'Be keen on + V-ing / Noun = Be fond of = Be interested in = Like/Love.',
    synonyms: ['fond of', 'interested in', 'passionate about'],
    collocations: ['keen on sports', 'keen on learning languages'],
    examples: [
      { en: 'My brother is keen on playing badminton after school.', vi: 'Em trai tôi rất thích chơi cầu lông sau giờ học.' }
    ],
    examTip: 'Đi thi nhớ giới từ đi kèm: keen ON, fond OF, interested IN, good AT.',
    difficultyLevel: 'Chuẩn Vào 10'
  },
  'fond of': {
    type: 'phrase',
    typeLabel: 'Cụm tính từ (Collocation)',
    phonetic: '/fɒnd əv/',
    meaningVi: 'Yêu thích, tha thiết thích',
    detailedExplanation: 'Bày tỏ tình cảm yêu mến một người hoặc say mê làm việc gì.',
    grammarBreakdown: 'Be fond of + V-ing / Noun.',
    synonyms: ['keen on', 'attached to'],
    examples: [
      { en: 'She is very fond of reading historical novels.', vi: 'Cô ấy rất thích đọc tiểu thuyết lịch sử.' }
    ],
    examTip: 'Fond đi với giới từ OF.',
    difficultyLevel: 'Chuẩn Vào 10'
  }
};

// Intelligent word lookup with morphological and irregular forms support
export function lookupDictionaryWord(rawText: string): DictEntry | null {
  if (!rawText) return null;
  const stripped = rawText
    .replace(/^[\s“"‘'(\[]+|[\s”"’')\].,;:!?]+$/g, '')
    .trim()
    .toLowerCase();

  if (!stripped) return null;

  // 1. Direct match
  if (CORE_DICTIONARY[stripped]) {
    return CORE_DICTIONARY[stripped];
  }

  // 2. Check irregular verb map (slept -> sleep, went -> go, etc.)
  if (IRREGULAR_VERB_MAP[stripped] && CORE_DICTIONARY[IRREGULAR_VERB_MAP[stripped]]) {
    const baseEntry = CORE_DICTIONARY[IRREGULAR_VERB_MAP[stripped]];
    return {
      ...baseEntry,
      typeLabel: `${baseEntry.typeLabel} (Dạng: ${stripped})`,
      meaningVi: `${baseEntry.meaningVi} (Dạng biến thể của "${IRREGULAR_VERB_MAP[stripped]}")`,
    };
  }

  // 3. Trailing 's' or 'es' plural/third-person singular
  if (stripped.endsWith('es') && CORE_DICTIONARY[stripped.slice(0, -2)]) {
    return CORE_DICTIONARY[stripped.slice(0, -2)];
  }
  if (stripped.endsWith('s') && CORE_DICTIONARY[stripped.slice(0, -1)]) {
    return CORE_DICTIONARY[stripped.slice(0, -1)];
  }

  // 4. Trailing 'ing'
  if (stripped.endsWith('ing')) {
    const base1 = stripped.slice(0, -3); // e.g. sleep -> sleeping
    if (CORE_DICTIONARY[base1]) return CORE_DICTIONARY[base1];
    const base2 = base1 + 'e'; // e.g. make -> making
    if (CORE_DICTIONARY[base2]) return CORE_DICTIONARY[base2];
  }

  // 5. Trailing 'ed'
  if (stripped.endsWith('ed')) {
    const base1 = stripped.slice(0, -2);
    if (CORE_DICTIONARY[base1]) return CORE_DICTIONARY[base1];
    const base2 = stripped.slice(0, -1);
    if (CORE_DICTIONARY[base2]) return CORE_DICTIONARY[base2];
  }

  // 6. Multi-word phrase partial match
  for (const [key, entry] of Object.entries(CORE_DICTIONARY)) {
    if (key.includes(' ') && (stripped === key || stripped.includes(key))) {
      return entry;
    }
  }

  return null;
}
