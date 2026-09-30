import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Highlighter,
  Volume2,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Search,
  Brain,
  Trash2,
  BookOpen,
  Lightbulb,
  Tag,
  RefreshCw,
  Layers,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';
import { AiHighlightResult, HighlightColor, SavedHighlightItem } from '../types';
import { playSuccessChime, playLaser } from '../utils/soundEffects';
import { getAiHeaders } from '../utils/aiClientHelper';

interface AiHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  contextSentence?: string;
  unitContext?: string;
  onOpenAiThinkingAssistant?: (initialPrompt?: string) => void;
}

const STORAGE_KEY = 'egg_thief_saved_highlights';

const COLOR_CONFIG: Record<
  HighlightColor,
  {
    label: string;
    dotClass: string;
    bgClass: string;
    borderClass: string;
    accentClass: string;
  }
> = {
  yellow: {
    label: 'Vàng Neon',
    dotClass: 'bg-amber-400',
    bgClass: 'bg-amber-950/40',
    borderClass: 'border-amber-500/50',
    accentClass: 'text-amber-300',
  },
  green: {
    label: 'Xanh Mint',
    dotClass: 'bg-emerald-400',
    bgClass: 'bg-emerald-950/40',
    borderClass: 'border-emerald-500/50',
    accentClass: 'text-emerald-300',
  },
  pink: {
    label: 'Hồng Dâu',
    dotClass: 'bg-pink-400',
    bgClass: 'bg-pink-950/40',
    borderClass: 'border-pink-500/50',
    accentClass: 'text-pink-300',
  },
  cyan: {
    label: 'Xanh Cyan',
    dotClass: 'bg-cyan-400',
    bgClass: 'bg-cyan-950/40',
    borderClass: 'border-cyan-500/50',
    accentClass: 'text-cyan-300',
  },
  purple: {
    label: 'Tím Cyber',
    dotClass: 'bg-purple-400',
    bgClass: 'bg-purple-950/40',
    borderClass: 'border-purple-500/50',
    accentClass: 'text-purple-300',
  },
};

const CLIENT_HIGHLIGHT_DICT: Record<string, {
  type: 'word' | 'phrase' | 'idiom' | 'sentence' | 'grammar_structure';
  typeLabel: string;
  phonetic?: string;
  meaningVi: string;
  detailedExplanation?: string;
  grammarBreakdown?: string;
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  examples?: { en: string; vi: string }[];
  examTip?: string;
}> = {
  'fast asleep': {
    type: 'phrase',
    typeLabel: 'Cụm tính từ / Thành ngữ (Collocation)',
    phonetic: '/ˌfæst əˈsliːp/',
    meaningVi: 'Ngủ say, ngủ sâu giấc, chìm vào giấc ngủ say',
    detailedExplanation: 'Cụm từ cố định (collocation) dùng để miêu tả trạng thái một người đang ngủ rất sâu, khó bị đánh thức bởi âm thanh xung quanh. Từ "fast" ở đây đóng vai trò là trạng từ bổ nghĩa mang nghĩa "chặt chẽ, sâu đậm", hoàn toàn không mang nghĩa "nhanh".',
    grammarBreakdown: 'Thường đứng sau động từ liên kết: be fast asleep (đang ngủ rất say) hoặc fall fast asleep (chìm sâu vào giấc ngủ).',
    synonyms: ['sound asleep', 'deep in sleep', 'slumbering'],
    antonyms: ['wide awake', 'awake'],
    collocations: ['fall fast asleep', 'be fast asleep', 'remain fast asleep'],
    examples: [
      { en: 'The children were fast asleep after an exciting day at the park.', vi: 'Lũ trẻ đã ngủ say sưa sau một ngày vui chơi hào hứng ở công viên.' },
      { en: 'Don’t worry, the dragon is fast asleep in its lair.', vi: 'Đừng lo, con rồng đang ngủ rất say trong hang của nó.' }
    ],
    examTip: 'Trong đề thi vào 10: "fast asleep" là bẫy từ vựng kinh điển; đối nghĩa với "wide awake" (hoàn toàn tỉnh táo).'
  },
  asleep: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective - Predicate only)',
    phonetic: '/əˈsliːp/',
    meaningVi: 'Đang ngủ, trong trạng thái ngủ',
    detailedExplanation: 'Tính từ vị ngữ chỉ đứng sau động từ to be hoặc linking verbs (be asleep, fall asleep), tuyệt đối không đứng trước danh từ.',
    grammarBreakdown: 'Không dùng "an asleep boy", mà phải dùng "a sleeping boy" hoặc "The boy is asleep".',
    synonyms: ['sleeping', 'resting', 'in slumber'],
    antonyms: ['awake', 'conscious'],
    collocations: ['fall asleep', 'fast asleep', 'sound asleep', 'half asleep'],
    examples: [
      { en: 'He fell asleep with the book still open on his chest.', vi: 'Anh ấy đã ngủ thiếp đi khi cuốn sách vẫn còn mở trên ngực.' },
      { en: 'The baby has finally gone to sleep and is now asleep.', vi: 'Em bé cuối cùng đã chợp mắt và lúc này đang ngủ.' }
    ],
    examTip: 'Bẫy đề thi: "asleep" chỉ làm vị ngữ sau be/fall, không đứng trực tiếp trước danh từ.'
  },
  heritage: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈher.ɪ.tɪdʒ/',
    meaningVi: 'Di sản (văn hóa, lịch sử, truyền thống)',
    detailedExplanation: 'Chỉ các nét đẹp văn hóa, phong tục, công trình kiến trúc hoặc giá trị tinh thần được lưu truyền qua nhiều thế hệ.',
    grammarBreakdown: 'Danh từ không đếm được hoặc đếm được. Đi với tính từ: cultural heritage, natural heritage, architectural heritage.',
    synonyms: ['legacy', 'tradition', 'inheritance'],
    antonyms: ['novelty', 'modernity'],
    collocations: ['cultural heritage', 'world heritage site', 'preserve heritage'],
    examples: [
      { en: 'Trang An is a renowned World Cultural and Natural Heritage site in Vietnam.', vi: 'Tràng An là một quần thể Di sản Văn hóa và Thiên nhiên Thế giới nổi tiếng ở Việt Nam.' },
      { en: 'We must make concerted efforts to preserve our national heritage.', vi: 'Chúng ta phải nỗ lực phối hợp để gìn giữ di sản quốc gia.' }
    ],
    examTip: 'Trong đề thi vào 10, "heritage" thường đi với động từ "preserve" (bảo tồn) hoặc "pass down" (truyền lại).'
  },
  preserve: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/prɪˈzɜːv/',
    meaningVi: 'Bảo tồn, gìn giữ, giữ nguyên vẹn',
    detailedExplanation: 'Hành động bảo vệ điều gì đó khỏi sự hủy hoại, mai một hoặc suy thoái theo thời gian.',
    grammarBreakdown: 'Ngoại động từ: preserve something (from something). Danh từ tương ứng: preservation. Tính từ: preservative.',
    synonyms: ['protect', 'conserve', 'maintain', 'safeguard'],
    antonyms: ['destroy', 'damage', 'neglect'],
    collocations: ['preserve ancient monuments', 'preserve peace', 'well-preserved'],
    examples: [
      { en: 'The villagers work hard to preserve their traditional customs.', vi: 'Dân làng làm việc chăm chỉ để gìn giữ các phong tục truyền thống của họ.' },
      { en: 'Ancient manuscripts are carefully preserved in temperature-controlled rooms.', vi: 'Các bản thảo cổ được bảo quản cẩn thận trong phòng kiểm soát nhiệt độ.' }
    ],
    examTip: 'Phân biệt "preserve" (giữ nguyên hiện trạng không bị hỏng) với "conserve" (sử dụng tiết kiệm, tránh lãng phí tài nguyên).'
  },
  magnificent: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/mæɡˈnɪf.ə.sənt/',
    meaningVi: 'Tráng lệ, nguy nga, tráng tuyệt, cực kỳ ấn tượng',
    detailedExplanation: 'Mô tả vẻ đẹp lộng lẫy, kỳ vĩ của phong cảnh thiên nhiên, lâu đài hoặc một tác phẩm nghệ thuật đỉnh cao.',
    grammarBreakdown: 'Tính từ mô tả (Descriptive Adjective). Trạng từ: magnificently. Danh từ: magnificence.',
    synonyms: ['spectacular', 'breathtaking', 'splendid', 'grand'],
    antonyms: ['modest', 'ordinary', 'plain'],
    collocations: ['magnificent view', 'magnificent palace', 'magnificent achievement'],
    examples: [
      { en: 'From the mountain peak, visitors can admire a magnificent view of the sunrise.', vi: 'Từ đỉnh núi, du khách có thể chiêm ngưỡng quang cảnh bình minh tuyệt mỹ.' },
      { en: 'The cathedral is renowned for its magnificent stained-glass windows.', vi: 'Nhà thờ nổi tiếng với những ô cửa kính màu tráng lệ.' }
    ],
    examTip: 'Thường xuất hiện trong phần bài đọc hiểu mô tả danh lam thắng cảnh thế giới trong đề tuyển sinh 10.'
  },
  'look forward to': {
    type: 'phrase',
    typeLabel: 'Cụm động từ (Phrasal Verb)',
    phonetic: '/lʊk ˈfɔː.wəd tuː/',
    meaningVi: 'Rất mong chờ, háo hức đón đợi một sự việc trong tương lai',
    detailedExplanation: 'Diễn tả tâm trạng hào hứng, mong mỏi một sự kiện tốt đẹp sắp diễn ra. Chú ý rằng "to" ở đây là giới từ, do đó động từ đi sau bắt buộc phải chia ở dạng V-ing.',
    grammarBreakdown: 'Cấu trúc cốt lõi: S + look forward to + V-ing / Noun phrase.',
    synonyms: ['anticipate with pleasure', 'await eagerly'],
    collocations: ['look forward to hearing from you', 'look forward to seeing you'],
    examples: [
      { en: 'I am looking forward to attending the summer cultural exchange camp.', vi: 'Tôi rất mong chờ được tham gia trại giao lưu văn hóa mùa hè.' },
      { en: 'We look forward to receiving your favorable response soon.', vi: 'Chúng tôi rất mong sớm nhận được phản hồi thuận lợi từ bạn.' }
    ],
    examTip: 'BẪY KINH ĐIỂN VÀO 10: Sau "look forward to" luôn luôn là V-ING, tuyệt đối không dùng động từ nguyên thể!'
  },
  'give up': {
    type: 'phrase',
    typeLabel: 'Cụm động từ (Phrasal Verb)',
    phonetic: '/ɡɪv ʌp/',
    meaningVi: 'Từ bỏ, bỏ cuộc, ngừng làm việc gì đó',
    detailedExplanation: 'Ngừng cố gắng thực hiện một việc vì quá khó khăn hoặc từ bỏ một thói quen (như bỏ hút thuốc, bỏ thói quen xấu).',
    grammarBreakdown: 'Ngoại động từ: give up something / give up doing something.',
    synonyms: ['quit', 'abandon', 'surrender'],
    antonyms: ['persist', 'continue', 'persevere'],
    collocations: ['never give up', 'give up smoking', 'give up hope'],
    examples: [
      { en: 'You should never give up on your dreams of entering your top-choice high school.', vi: 'Bạn đừng bao giờ từ bỏ ước mơ thi đỗ vào ngôi trường cấp ba mơ ước của mình.' },
      { en: 'He decided to give up fast food to improve his overall health.', vi: 'Anh ấy quyết định từ bỏ đồ ăn nhanh để cải thiện sức khỏe tổng thể.' }
    ],
    examTip: 'Sau "give up" là V-ing: give up smoking, give up playing games.'
  },
  'in spite of': {
    type: 'grammar_structure',
    typeLabel: 'Cụm giới từ chỉ sự nhượng bộ (Concession)',
    phonetic: '/ɪn spaɪt əv/',
    meaningVi: 'Mặc dù, bất chấp',
    detailedExplanation: 'Biểu thị sự tương phản giữa hai tình huống, tương đương với "despite". Cần phân biệt rõ với Although/Even though.',
    grammarBreakdown: 'In spite of + Noun phrase / V-ing, S + V. (Không đi với một mệnh đề S + V trừ khi có "the fact that").',
    synonyms: ['despite', 'regardless of'],
    examples: [
      { en: 'In spite of the heavy rain, all students arrived at the exam hall on time.', vi: 'Mặc dù trời mưa rất to, tất cả các thí sinh đều đã đến phòng thi đúng giờ.' }
    ],
    examTip: 'DẠNG BÀI VIẾT LẠI CÂU VÀO 10: Although + S + V <=> In spite of / Despite + Noun/V-ing.'
  }
};

function generateClientFallbackExplanation(targetText: string, context?: string): AiHighlightResult {
  const clean = targetText.trim();
  const lower = clean.toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean);

  // Check direct local dictionary hit
  if (CLIENT_HIGHLIGHT_DICT[lower]) {
    const item = CLIENT_HIGHLIGHT_DICT[lower];
    return {
      originalText: clean,
      ...item,
      vietnameseMeaning: item.meaningVi,
      detailedExplanation: item.detailedExplanation || item.meaningVi,
      examples: item.examples || [],
      sourceContext: context,
    };
  }

  // Check substring hit
  for (const [key, item] of Object.entries(CLIENT_HIGHLIGHT_DICT)) {
    if (lower.includes(key)) {
      return {
        originalText: clean,
        ...item,
        vietnameseMeaning: item.meaningVi,
        detailedExplanation: item.detailedExplanation || item.meaningVi,
        examples: item.examples || [],
        sourceContext: context,
      };
    }
  }

  // Heuristic for sleep phrases
  if (lower.includes('asleep') || lower.includes('sleep')) {
    return {
      originalText: clean,
      type: 'phrase',
      typeLabel: 'Cụm từ chỉ trạng thái ngủ (Sleep Collocation)',
      phonetic: `/${lower}/`,
      vietnameseMeaning: 'Trạng thái ngủ, ngủ sâu giấc hoặc chợp mắt',
      detailedExplanation: `Cụm từ "${clean}" thường liên quan đến giấc ngủ. Trong tiếng Anh, phân biệt: "be asleep" (đang ngủ), "fall asleep" (bắt đầu ngủ thiếp đi), "fast asleep" (ngủ rất say).`,
      grammarBreakdown: 'Đi cùng các động từ liên kết như be, fall, stay.',
      examples: [
        { en: `She was ${lower} when the phone rang.`, vi: `Cô ấy đang ngủ thì điện thoại reo.` }
      ],
      examTip: 'Bẫy đề thi: "asleep" là tính từ vị ngữ, không đứng trước danh từ.',
      difficultyLevel: 'Chuẩn Vào 10',
      sourceContext: context,
    };
  }

  // Sentence heuristic
  if (words.length >= 4 || clean.includes('.') || clean.includes('?') || clean.includes('!')) {
    return {
      originalText: clean,
      type: 'sentence',
      typeLabel: 'Cấu trúc câu hoàn chỉnh',
      vietnameseMeaning: `Ý nghĩa câu: "${clean}" (Diễn đạt một mệnh đề/tình huống trọn vẹn).`,
      detailedExplanation: `Câu gồm ${words.length} từ. Cần chú ý sự hòa hợp giữa chủ ngữ và vị ngữ cũng như thì của động từ chính.`,
      examples: [
        { en: clean, vi: 'Câu nguyên văn đang được phân tích trong ngữ cảnh bài thi.' }
      ],
      examTip: 'Xác định rõ chủ ngữ và động từ chính để tránh nhầm lẫn các mệnh đề phụ bổ nghĩa.',
      difficultyLevel: 'Chuẩn Vào 10',
      sourceContext: context,
    };
  }

  // Generic word / short phrase
  return {
    originalText: clean,
    type: words.length > 1 ? 'phrase' : 'word',
    typeLabel: words.length > 1 ? 'Cụm từ tiếng Anh (Phrase)' : 'Từ vựng (Vocabulary)',
    phonetic: `/${lower}/`,
    vietnameseMeaning: `Từ/Cụm từ: "${clean}"`,
    detailedExplanation: `Mục từ "${clean}" là một điểm kiến thức trong bài. Hãy chú ý vị trí đứng trong câu và từ loại đi cùng để chia đúng dạng ngữ pháp.`,
    examples: [
      { en: `It is essential to understand how "${clean}" is used in examinations.`, vi: `Hiểu rõ cách dùng "${clean}" trong các kỳ thi là điều vô cùng cần thiết.` }
    ],
    examTip: 'Ghi nhớ dạng từ (Word Formation) và các giới từ đi kèm nếu có.',
    difficultyLevel: 'Chuẩn Vào 10',
    sourceContext: context,
  };
}

export const AiHighlightModal: React.FC<AiHighlightModalProps> = ({
  isOpen,
  onClose,
  initialText = '',
  contextSentence = '',
  unitContext = '',
  onOpenAiThinkingAssistant,
}) => {
  const [activeTab, setActiveTab] = useState<'explain' | 'notebook'>('explain');
  const [inputText, setInputText] = useState(initialText);
  const [currentColor, setCurrentColor] = useState<HighlightColor>('yellow');
  const [result, setResult] = useState<AiHighlightResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Saved Notebook
  const [savedItems, setSavedItems] = useState<SavedHighlightItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [notebookFilter, setNotebookFilter] = useState('');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('all');

  const prevTextRef = useRef('');

  useEffect(() => {
    if (isOpen && initialText && initialText !== prevTextRef.current) {
      prevTextRef.current = initialText;
      setInputText(initialText);
      handleExplainText(initialText, contextSentence);
    }
  }, [isOpen, initialText, contextSentence]);

  // Persist saved items to localStorage
  const saveSavedItems = (items: SavedHighlightItem[]) => {
    setSavedItems(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const handleExplainText = async (targetText: string, context?: string) => {
    const textToExplain = targetText.trim();
    if (!textToExplain) return;

    setIsLoading(true);
    setErrorMsg(null);
    setCopied(false);

    try {
      const cleanKey = textToExplain.toLowerCase().trim();

      // 1. Direct local dictionary match (instant 0ms response)
      if (CLIENT_HIGHLIGHT_DICT[cleanKey]) {
        const item = CLIENT_HIGHLIGHT_DICT[cleanKey];
        setResult({
          originalText: textToExplain,
          ...item,
          vietnameseMeaning: item.meaningVi,
          detailedExplanation: item.detailedExplanation || item.meaningVi,
          examples: item.examples || [],
          sourceContext: context || contextSentence,
        });
        playSuccessChime();
        setIsLoading(false);
        return;
      }

      // 2. Fetch from backend API with AbortController timeout & non-JSON guard
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9000);

      let data: any = null;
      try {
        const res = await fetch('/api/ai-explain-highlight', {
          method: 'POST',
          headers: getAiHeaders(),
          body: JSON.stringify({
            text: textToExplain,
            context: context || contextSentence,
            unitContext,
          }),
          signal: controller.signal,
        });

        clearTimeout(timer);

        try {
          const rawText = await res.text();
          if (rawText && rawText.trim()) {
            try {
              data = JSON.parse(rawText.trim());
            } catch {
              const firstBrace = rawText.indexOf('{');
              const lastBrace = rawText.lastIndexOf('}');
              if (firstBrace !== -1 && lastBrace > firstBrace) {
                data = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
              }
            }
          }
        } catch {
          // If reading or parsing fails, use fallback
        }

        if (!data || (!res.ok && data.error)) {
          data = generateClientFallbackExplanation(textToExplain, context || contextSentence);
        }
      } catch (fetchErr: any) {
        clearTimeout(timer);
        console.warn('Highlight fetch error, applying fallback:', fetchErr?.message);
        data = generateClientFallbackExplanation(textToExplain, context || contextSentence);
      }

      if (data && (data.vietnameseMeaning || data.meaningVi)) {
        setResult({
          ...data,
          originalText: data.originalText || textToExplain,
          vietnameseMeaning: data.vietnameseMeaning || data.meaningVi,
          detailedExplanation: data.detailedExplanation || data.vietnameseMeaning || data.meaningVi,
          examples: Array.isArray(data.examples) ? data.examples : [],
          sourceContext: context || contextSentence,
        });
        playSuccessChime();
      } else {
        const fallback = generateClientFallbackExplanation(textToExplain, context || contextSentence);
        setResult(fallback);
        playSuccessChime();
      }
    } catch (err: any) {
      // Graceful fallback: never crash or display raw syntax errors
      const fallback = generateClientFallbackExplanation(targetText, context || contextSentence);
      setResult(fallback);
      playSuccessChime();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCurrentSaved = result ? savedItems.some((item) => item.text.toLowerCase() === result.originalText.toLowerCase()) : false;

  const toggleBookmark = () => {
    if (!result) return;
    const exists = savedItems.find((item) => item.text.toLowerCase() === result.originalText.toLowerCase());

    if (exists) {
      const updated = savedItems.filter((item) => item.id !== exists.id);
      saveSavedItems(updated);
    } else {
      const newItem: SavedHighlightItem = {
        id: `hl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        text: result.originalText,
        vietnameseMeaning: result.vietnameseMeaning,
        phonetic: result.phonetic,
        typeLabel: result.typeLabel,
        createdAt: Date.now(),
        unitContext,
        color: currentColor,
        examples: result.examples,
        examTip: result.examTip,
      };
      saveSavedItems([newItem, ...savedItems]);
      playSuccessChime();
    }
  };

  const handleDeleteSavedItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveSavedItems(savedItems.filter((item) => item.id !== id));
  };

  if (!isOpen) return null;

  const activeColor = COLOR_CONFIG[currentColor];

  const filteredNotebook = savedItems.filter((item) => {
    const matchesQuery =
      item.text.toLowerCase().includes(notebookFilter.toLowerCase()) ||
      item.vietnameseMeaning.toLowerCase().includes(notebookFilter.toLowerCase()) ||
      item.typeLabel.toLowerCase().includes(notebookFilter.toLowerCase());
    const matchesColor = selectedColorFilter === 'all' || item.color === selectedColorFilter;
    return matchesQuery && matchesColor;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-amber-500/70 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-xl shadow-lg shadow-amber-950/60 shrink-0">
              🖍️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Highlight AI</span>
                  <span className="text-amber-400 font-bold">• Bậc Thầy Giải Nghĩa</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hidden sm:inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Gemini Flash 3.8
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bôi đen từ/câu bất kỳ trên màn hình để AI phân tích nghĩa, ngữ pháp & mẹo thi vào 10!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveTab('explain')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'explain'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Giải Nghĩa</span>
              </button>
              <button
                onClick={() => setActiveTab('notebook')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'notebook'
                    ? 'bg-indigo-600 text-white font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Sổ Tay ({savedItems.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'explain' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
            {/* Quick Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExplainText(inputText);
              }}
              className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 focus-within:border-amber-500/60 transition-all shadow-inner"
            >
              <div className="pl-2.5 text-amber-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập hoặc bôi đen từ vựng / câu tiếng Anh bất kỳ để AI giải nghĩa..."
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-2 font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md shadow-amber-950/40"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Tra Nghĩa</span>
              </button>
            </form>

            {/* Quick Sample Tags */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                Từ/câu mẫu:
              </span>
              {[
                'heritage',
                'preserve',
                'magnificent',
                'look forward to',
                'give up',
                'in spite of',
                'If I were you, I would study harder.',
                'The temple was constructed in 1070.',
              ].map((sample) => (
                <button
                  key={sample}
                  onClick={() => {
                    setInputText(sample);
                    handleExplainText(sample);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] cursor-pointer transition-all hover:scale-105"
                >
                  {sample.length > 25 ? sample.substring(0, 22) + '...' : sample}
                </button>
              ))}
            </div>

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl animate-spin">
                  ⏳
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-bold text-slate-200">
                    Rồng Trí Tuệ AI đang suy nghĩ và tra cứu nghĩa...
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Đang phân tích cấu trúc ngữ pháp, ngữ cảnh và mẹo thi tuyển sinh vào 10
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && !isLoading && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-600/50 text-rose-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
                <button
                  onClick={() => handleExplainText(inputText)}
                  className="px-2.5 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-bold cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Result Card */}
            {result && !isLoading && (
              <div className="space-y-4 animate-fade-in">
                {/* Highlighted Word / Sentence Neon Display Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {result.typeLabel}
                      </span>
                      {result.difficultyLevel && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {result.difficultyLevel}
                        </span>
                      )}
                    </div>

                    {/* Color Marker Selector */}
                    <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">Màu bút:</span>
                      {(['yellow', 'green', 'pink', 'cyan', 'purple'] as HighlightColor[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => setCurrentColor(c)}
                          className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${COLOR_CONFIG[c].dotClass} ${
                            currentColor === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-60 hover:opacity-100'
                          }`}
                          title={`Bút highlight ${COLOR_CONFIG[c].label}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Main Highlighted Box */}
                  <div className={`p-4 rounded-2xl ${activeColor.bgClass} border ${activeColor.borderClass} transition-all`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h2 className="text-lg sm:text-xl font-black text-white tracking-wide font-sans">
                          {result.originalText}
                        </h2>
                        {result.phonetic && (
                          <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
                            <span className="text-amber-400 font-semibold">{result.phonetic}</span>
                            <button
                              onClick={() => handleSpeak(result.originalText)}
                              className={`p-1 rounded-lg hover:bg-white/10 text-amber-400 transition-colors cursor-pointer ${
                                isPlayingAudio ? 'animate-bounce text-amber-300' : ''
                              }`}
                              title="Nghe phát âm chuẩn (US)"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleSpeak(result.originalText)}
                          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-700 hover:border-amber-400/50 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Phát âm âm thanh chuẩn"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopy(`${result.originalText} - ${result.vietnameseMeaning}`)}
                          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Sao chép từ & nghĩa"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={toggleBookmark}
                          className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 ${
                            isCurrentSaved
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-950/50'
                              : 'bg-slate-900/80 hover:bg-slate-800 text-amber-400 border-slate-700'
                          }`}
                          title={isCurrentSaved ? 'Đã lưu trong sổ tay (Bấm để gỡ)' : 'Lưu vào sổ tay từ vựng'}
                        >
                          {isCurrentSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Vietnamese Core Meaning */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nghĩa tiếng Việt chuẩn:</div>
                      <div className="text-base sm:text-lg font-bold text-white leading-snug">
                        {result.vietnameseMeaning}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Explanation & Grammar Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Giải Thích Ngữ Nghĩa & Cách Dùng</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {result.detailedExplanation}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Phân Tích Cấu Trúc Ngữ Pháp</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {result.grammarBreakdown || 'Áp dụng theo quy tắc ngữ pháp trọng điểm của chương trình thi vào lớp 10.'}
                      </p>
                    </div>
                  </div>

                  {/* Collocations & Synonyms */}
                  {((result.collocations && result.collocations.length > 0) || (result.synonyms && result.synonyms.length > 0)) && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                      {result.collocations && result.collocations.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Cụm từ đi kèm (Collocations hay gặp trong đề thi):</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {result.collocations.map((col, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setInputText(col);
                                  handleExplainText(col);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium cursor-pointer transition-colors"
                              >
                                {col}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.synonyms && result.synonyms.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <span>Từ đồng nghĩa (Synonyms):</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {result.synonyms.map((syn, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setInputText(syn);
                                  handleExplainText(syn);
                                }}
                                className="px-2 py-0.5 rounded-lg bg-teal-950 text-teal-300 border border-teal-700/50 text-xs cursor-pointer hover:bg-teal-900 transition-colors"
                              >
                                {syn}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bilingual Examples */}
                  {result.examples && result.examples.length > 0 && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Ví Dụ Câu Thực Tế</span>
                      </div>
                      <div className="space-y-2">
                        {result.examples.map((ex, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-slate-100">{ex.en}</span>
                              <button
                                onClick={() => handleSpeak(ex.en)}
                                className="text-slate-400 hover:text-amber-400 p-1 cursor-pointer"
                                title="Nghe câu ví dụ"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-slate-400 text-[11px] italic">{ex.vi}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Entrance Exam Tip */}
                  {result.examTip && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 to-orange-950/60 border border-amber-500/40 text-xs flex items-start gap-2.5">
                      <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-amber-300 text-xs mb-0.5">
                          Mẹo làm bài thi tuyển sinh vào 10 (Exam Tip):
                        </div>
                        <div className="text-slate-200 text-xs leading-relaxed">
                          {result.examTip}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Quick Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleBookmark}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                        isCurrentSaved
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-950/40'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isCurrentSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{isCurrentSaved ? 'Đã lưu sổ tay' : 'Lưu vào sổ tay'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(`${result.originalText}\n- Nghĩa: ${result.vietnameseMeaning}\n- Giải thích: ${result.detailedExplanation}`)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  {onOpenAiThinkingAssistant && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAiThinkingAssistant(
                          `Hãy giải thích cặn kẽ hơn về "${result.originalText}" (nghĩa: ${result.vietnameseMeaning}), các bẫy ngữ pháp liên quan và 3 câu hỏi trắc nghiệm hay gặp trong đề thi tuyển sinh vào lớp 10.`
                        );
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md shadow-purple-950/60"
                    >
                      <Brain className="w-3.5 h-3.5 text-pink-200" />
                      <span>Hỏi sâu hơn với Rồng Trí Tuệ AI</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Notebook Tab */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
            {/* Filter and search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={notebookFilter}
                  onChange={(e) => setNotebookFilter(e.target.value)}
                  placeholder="Tìm kiếm trong sổ tay highlight..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Color filter buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setSelectedColorFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedColorFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tất cả ({savedItems.length})
                </button>
                {(['yellow', 'green', 'pink', 'cyan', 'purple'] as HighlightColor[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColorFilter(c)}
                    className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${COLOR_CONFIG[c].dotClass} ${
                      selectedColorFilter === c ? 'scale-125 ring-2 ring-white' : 'opacity-50 hover:opacity-100'
                    }`}
                    title={COLOR_CONFIG[c].label}
                  />
                ))}
              </div>
            </div>

            {/* List of Saved Items */}
            {filteredNotebook.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-2">
                <div className="text-3xl">📖</div>
                <div className="font-bold text-sm text-slate-300">
                  {savedItems.length === 0
                    ? 'Chưa có từ hoặc câu nào được lưu trong sổ tay'
                    : 'Không tìm thấy mục nào khớp với bộ lọc'}
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hãy dùng tính năng bôi đen hoặc tra cứu để bấm &quot;Lưu vào sổ tay&quot; và ôn luyện từ vựng hàng ngày!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotebook.map((item) => {
                  const itemColor = COLOR_CONFIG[item.color] || COLOR_CONFIG.yellow;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setInputText(item.text);
                        setActiveTab('explain');
                        handleExplainText(item.text);
                      }}
                      className="p-4 rounded-2xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`w-2.5 h-2.5 rounded-full ${itemColor.dotClass}`} />
                          <span className="font-black text-sm text-white group-hover:text-amber-400 transition-colors">
                            {item.text}
                          </span>
                          {item.phonetic && (
                            <span className="text-xs font-mono text-slate-400">{item.phonetic}</span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                            {item.typeLabel}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium">
                          {item.vietnameseMeaning}
                        </div>
                        {item.examTip && (
                          <div className="text-[11px] text-amber-300/90 italic flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate max-w-md">{item.examTip}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(item.text);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 transition-colors cursor-pointer"
                          title="Phát âm"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSavedItem(item.id, e)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-600 transition-colors cursor-pointer"
                          title="Xóa khỏi sổ tay"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
