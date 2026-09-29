import React, { useState, useEffect, useRef } from 'react';
import {
  Highlighter,
  Sparkles,
  BookOpen,
  Volume2,
  Check,
  Copy,
  ExternalLink,
  X,
  Bookmark,
  BookmarkCheck,
  Zap,
  Info,
} from 'lucide-react';
import { AiHighlightResult, HighlightColor, SavedHighlightItem } from '../types';

interface HighlightTextDetectorProps {
  onTriggerHighlight: (selectedText: string, contextSentence?: string) => void;
  isHighlighterPenActive: boolean;
  onToggleHighlighterPen: (active: boolean) => void;
  highlightColor: HighlightColor;
  onChangeHighlightColor: (color: HighlightColor) => void;
  onOpenNotebook: () => void;
  unitContext?: string;
  savedCount?: number;
}

const STORAGE_KEY = 'egg_thief_saved_highlights';

// Color themes for highlight pen & popover accents
const COLOR_MAP: Record<
  HighlightColor,
  {
    label: string;
    dot: string;
    glow: string;
    pillBorder: string;
    pillBg: string;
    badgeBg: string;
    badgeText: string;
    accentBorder: string;
  }
> = {
  yellow: {
    label: 'Vàng Neon',
    dot: 'bg-amber-400',
    glow: 'rgba(251, 191, 36, 0.45)',
    pillBorder: 'border-amber-400',
    pillBg: 'bg-amber-950/95 text-amber-200',
    badgeBg: 'bg-amber-400/20',
    badgeText: 'text-amber-300',
    accentBorder: 'border-amber-400/50',
  },
  green: {
    label: 'Xanh Mint',
    dot: 'bg-emerald-400',
    glow: 'rgba(52, 211, 153, 0.45)',
    pillBorder: 'border-emerald-400',
    pillBg: 'bg-emerald-950/95 text-emerald-200',
    badgeBg: 'bg-emerald-400/20',
    badgeText: 'text-emerald-300',
    accentBorder: 'border-emerald-400/50',
  },
  pink: {
    label: 'Hồng Dâu',
    dot: 'bg-pink-400',
    glow: 'rgba(244, 114, 182, 0.45)',
    pillBorder: 'border-pink-400',
    pillBg: 'bg-pink-950/95 text-pink-200',
    badgeBg: 'bg-pink-400/20',
    badgeText: 'text-pink-300',
    accentBorder: 'border-pink-400/50',
  },
  cyan: {
    label: 'Xanh Cyan',
    dot: 'bg-cyan-400',
    glow: 'rgba(34, 211, 238, 0.45)',
    pillBorder: 'border-cyan-400',
    pillBg: 'bg-cyan-950/95 text-cyan-200',
    badgeBg: 'bg-cyan-400/20',
    badgeText: 'text-cyan-300',
    accentBorder: 'border-cyan-400/50',
  },
  purple: {
    label: 'Tím Cyber',
    dot: 'bg-purple-400',
    glow: 'rgba(192, 132, 252, 0.45)',
    pillBorder: 'border-purple-400',
    pillBg: 'bg-purple-950/95 text-purple-200',
    badgeBg: 'bg-purple-400/20',
    badgeText: 'text-purple-300',
    accentBorder: 'border-purple-400/50',
  },
};

// Instant client dictionary (0ms latency for core vocabulary & grammar)
const INSTANT_CLIENT_DICT: Record<
  string,
  {
    type: 'word' | 'phrase' | 'idiom' | 'sentence' | 'grammar_structure';
    typeLabel: string;
    phonetic?: string;
    meaningVi: string;
    exampleEn?: string;
    exampleVi?: string;
  }
> = {
  heritage: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈher.ɪ.tɪdʒ/',
    meaningVi: 'Di sản (văn hóa, lịch sử, truyền thống dân tộc)',
    exampleEn: 'Trang An is a World Cultural and Natural Heritage site.',
    exampleVi: 'Tràng An là di sản văn hóa và thiên nhiên thế giới.',
  },
  preserve: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/prɪˈzɜːv/',
    meaningVi: 'Bảo tồn, gìn giữ, giữ nguyên vẹn',
    exampleEn: 'We must preserve our ancient architectural heritage.',
    exampleVi: 'Chúng ta phải gìn giữ di sản kiến trúc cổ kính của mình.',
  },
  magnificent: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/mæɡˈnɪf.ɪ.sənt/',
    meaningVi: 'Tráng lệ, lộng lẫy, nguy nga, tuyệt đẹp',
    exampleEn: 'The palace was a truly magnificent architectural masterpiece.',
    exampleVi: 'Cung điện là một kiệt tác kiến trúc thực sự tráng lệ.',
  },
  breathtaking: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/ˈbreθˌteɪ.kɪŋ/',
    meaningVi: 'Đẹp ngoạn mục, nghẹt thở, kỳ vĩ',
    exampleEn: 'The view from the mountain peak was breathtaking.',
    exampleVi: 'Khung cảnh nhìn từ đỉnh núi đẹp đến nghẹt thở.',
  },
  'fast asleep': {
    type: 'phrase',
    typeLabel: 'Cụm tính từ (Collocation)',
    phonetic: '/ˌfæst əˈsliːp/',
    meaningVi: 'Ngủ say, ngủ sâu giấc, chìm vào giấc ngủ say',
    exampleEn: 'The children were fast asleep after an exciting day.',
    exampleVi: 'Lũ trẻ đã ngủ rất say sau một ngày vui chơi thú vị.',
  },
  asleep: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective - Predicate only)',
    phonetic: '/əˈsliːp/',
    meaningVi: 'Đang ngủ, trong trạng thái ngủ',
    exampleEn: 'The baby has finally fallen asleep.',
    exampleVi: 'Em bé cuối cùng đã ngủ thiếp đi.',
  },
  destination: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˌdes.tɪˈneɪ.ʃən/',
    meaningVi: 'Điểm đến, đích đến du lịch',
    exampleEn: 'Da Nang is a popular tourist destination in Vietnam.',
    exampleVi: 'Đà Nẵng là điểm đến du lịch nổi tiếng ở Việt Nam.',
  },
  environment: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ɪnˈvaɪ.rən.mənt/',
    meaningVi: 'Môi trường sống, hoàn cảnh xung quanh',
    exampleEn: 'Everyone should take action to protect our living environment.',
    exampleVi: 'Mọi người nên hành động để bảo vệ môi trường sống của chúng ta.',
  },
  sustainable: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/səˈsteɪ.nə.bəl/',
    meaningVi: 'Bền vững, thân thiện lâu dài với hệ sinh thái',
    exampleEn: 'We should develop sustainable tourism practices.',
    exampleVi: 'Chúng ta nên phát triển các phương thức du lịch bền vững.',
  },
  'eco-friendly': {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/ˈiː.kəʊˌfrend.li/',
    meaningVi: 'Thân thiện với môi trường',
    exampleEn: 'Using eco-friendly products reduces plastic pollution.',
    exampleVi: 'Dùng sản phẩm thân thiện môi trường giúp giảm ô nhiễm nhựa.',
  },
  pollution: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/pəˈluː.ʃən/',
    meaningVi: 'Sự ô nhiễm (không khí, nguồn nước, tiếng ồn)',
    exampleEn: 'Air pollution is becoming a severe issue in big cities.',
    exampleVi: 'Ô nhiễm không khí đang trở thành vấn đề nghiêm trọng ở đô thị.',
  },
  biodiversity: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/',
    meaningVi: 'Đa dạng sinh học',
    exampleEn: 'National parks help protect wildlife biodiversity.',
    exampleVi: 'Các vườn quốc gia giúp bảo vệ sự đa dạng sinh học của muôn loài.',
  },
  endangered: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/ɪnˈdeɪn.dʒəd/',
    meaningVi: 'Có nguy cơ tuyệt chủng (động thực vật quý hiếm)',
    exampleEn: 'Tigers and rhinos are severely endangered species.',
    exampleVi: 'Hổ và tê giác là những loài động vật bị đe dọa tuyệt chủng nghiêm trọng.',
  },
  tradition: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/trəˈdɪʃ.ən/',
    meaningVi: 'Truyền thống, phong tục tập quán lâu đời',
    exampleEn: 'It is a long-standing tradition to celebrate Tet with family.',
    exampleVi: 'Đó là truyền thống lâu đời đón Tết sum vầy cùng gia đình.',
  },
  custom: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈkʌs.təm/',
    meaningVi: 'Phong tục, tập quán xã hội',
    exampleEn: 'Different ethnic groups have unique customs and habits.',
    exampleVi: 'Các nhóm dân tộc khác nhau có những phong tục tập quán độc đáo.',
  },
  celebrate: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/ˈsel.ə.breɪt/',
    meaningVi: 'Kỷ niệm, ăn mừng, tôn vinh ngày lễ',
    exampleEn: 'Villagers celebrate the spring festival with traditional music.',
    exampleVi: 'Dân làng tổ chức lễ hội mùa xuân với âm nhạc truyền thống.',
  },
  festival: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈfes.tɪ.vəl/',
    meaningVi: 'Lễ hội, ngày hội truyền thống',
    exampleEn: 'The Hung Kings Temple Festival attracts millions of pilgrims.',
    exampleVi: 'Lễ hội Đền Hùng thu hút hàng triệu đồng bào hành hương.',
  },
  monument: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈmɒn.jə.mənt/',
    meaningVi: 'Đài tưởng niệm, di tích lịch sử',
    exampleEn: 'The monument commemorates the national heroes of independence.',
    exampleVi: 'Tượng đài tưởng niệm các anh hùng dân tộc trong công cuộc độc lập.',
  },
  ancient: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/ˈeɪn.ʃənt/',
    meaningVi: 'Cổ kính, cổ đại, ngàn năm tuổi',
    exampleEn: 'Hoi An is famous for its ancient houses and lantern streets.',
    exampleVi: 'Hội An nổi tiếng với những ngôi nhà cổ và phố đèn lồng rực rỡ.',
  },
  historic: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/hɪˈstɒr.ɪk/',
    meaningVi: 'Mang tính lịch sử, có ý nghĩa lịch sử trọng đại',
    exampleEn: 'The reunification in 1975 was a historic victory for Vietnam.',
    exampleVi: 'Thống nhất năm 1975 là thắng lợi lịch sử mang tính bước ngoặt.',
  },
  historical: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/hɪˈstɒr.ɪ.kəl/',
    meaningVi: 'Thuộc về lịch sử, liên quan đến quá khứ',
    exampleEn: 'Students should read historical documents about our ancestors.',
    exampleVi: 'Học sinh nên đọc các tài liệu lịch sử về cha ông ta.',
  },
  craftsman: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈkrɑːfts.mən/',
    meaningVi: 'Nghệ nhân, thợ thủ công lành nghề',
    exampleEn: 'Skilled craftsmen hand-make every single ceramic piece.',
    exampleVi: 'Các nghệ nhân lành nghề tự tay chế tác từng món đồ gốm.',
  },
  artisan: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈɑː.tɪ.zæn/',
    meaningVi: 'Nghệ nhân thủ công mỹ nghệ',
    exampleEn: 'Local artisans keep the silk weaving craft alive.',
    exampleVi: 'Các nghệ nhân địa phương gìn giữ nghề dệt lụa truyền thống.',
  },
  pottery: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈpɒt.ər.i/',
    meaningVi: 'Nghề làm gốm, đồ gốm sứ',
    exampleEn: 'Bat Trang is Vietnam’s most renowned pottery village.',
    exampleVi: 'Bát Tràng là làng gốm nổi tiếng bậc nhất Việt Nam.',
  },
  handicraft: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˈhæn.dɪ.krɑːft/',
    meaningVi: 'Sản phẩm thủ công mỹ nghệ',
    exampleEn: 'Tourists enjoy purchasing local handicraft souvenirs.',
    exampleVi: 'Khách du lịch thích mua quà lưu niệm thủ công mỹ nghệ.',
  },
  spectacular: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/spekˈtæk.jə.lər/',
    meaningVi: 'Hùng vĩ, ngoạn mục, tráng lệ',
    exampleEn: 'Ha Long Bay features spectacular limestone karst islands.',
    exampleVi: 'Vịnh Hạ Long có các hòn đảo đá vôi vô cùng ngoạn mục.',
  },
  impressive: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/ɪmˈpres.ɪv/',
    meaningVi: 'Gây ấn tượng sâu sắc, đáng nể',
    exampleEn: 'She scored an impressive 10 in the entrance exam.',
    exampleVi: 'Cô ấy đạt điểm 10 ấn tượng trong kỳ thi tuyển sinh.',
  },
  valuable: {
    type: 'word',
    typeLabel: 'Tính từ (Adjective)',
    phonetic: '/ˈvæl.jʊ.bəl/',
    meaningVi: 'Quý giá, có giá trị lớn',
    exampleEn: 'Folk songs are a valuable spiritual treasure.',
    exampleVi: 'Dân ca là kho báu tinh thần vô cùng quý giá.',
  },
  community: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/kəˈmjuː.nə.ti/',
    meaningVi: 'Cộng đồng, tập thể xã hội',
    exampleEn: 'We need community engagement to clean up the river.',
    exampleVi: 'Chúng ta cần sự chung tay của cộng đồng để làm sạch dòng sông.',
  },
  generation: {
    type: 'word',
    typeLabel: 'Danh từ (Noun)',
    phonetic: '/ˌdʒen.əˈreɪ.ʃən/',
    meaningVi: 'Thế hệ, đời người',
    exampleEn: 'Values are passed down from generation to generation.',
    exampleVi: 'Các giá trị tốt đẹp được truyền từ thế hệ này sang thế hệ khác.',
  },
  protect: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/prəˈtekt/',
    meaningVi: 'Bảo vệ, che chở, gìn giữ',
    exampleEn: 'Laws protect historical buildings from demolition.',
    exampleVi: 'Luật pháp bảo vệ các tòa nhà lịch sử khỏi nguy cơ bị phá hủy.',
  },
  prevent: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/prɪˈvent/',
    meaningVi: 'Ngăn chặn, phòng ngừa (+ from V-ing)',
    exampleEn: 'Measures were taken to prevent soil erosion.',
    exampleVi: 'Các biện pháp đã được triển khai để ngăn ngừa xói mòn đất.',
  },
  participate: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/pɑːˈtɪs.ɪ.peɪt/',
    meaningVi: 'Tham gia, góp mặt (+ in)',
    exampleEn: 'Many teenagers participate in volunteer activities.',
    exampleVi: 'Nhiều bạn trẻ tham gia vào các hoạt động tình nguyện.',
  },
  encourage: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/ɪnˈkʌr.ɪdʒ/',
    meaningVi: 'Khuyến khích, động viên ai làm gì (+ to V)',
    exampleEn: 'Teachers encourage students to read English books daily.',
    exampleVi: 'Thầy cô khuyến khích học sinh đọc sách tiếng Anh mỗi ngày.',
  },
  suggest: {
    type: 'word',
    typeLabel: 'Động từ (Verb)',
    phonetic: '/səˈdʒest/',
    meaningVi: 'Gợi ý, đề xuất (+ V-ing / that S + should V)',
    exampleEn: 'I suggest going cycling this Sunday.',
    exampleVi: 'Tôi đề xuất đi đạp xe vào Chủ nhật này.',
  },
  'look forward to': {
    type: 'phrase',
    typeLabel: 'Cụm động từ (Phrasal Verb)',
    phonetic: '/lʊk ˈfɔː.wəd tuː/',
    meaningVi: 'Rất mong đợi, háo hức đón chờ (+ V-ing)',
    exampleEn: 'I am looking forward to hearing from you soon.',
    exampleVi: 'Tôi rất mong sớm nhận được tin từ bạn.',
  },
  'used to': {
    type: 'phrase',
    typeLabel: 'Cấu trúc quen thuộc',
    phonetic: '/juːst tuː/',
    meaningVi: 'Đã từng (thói quen trong quá khứ nay không còn nữa)',
    exampleEn: 'There used to be an ancient banyan tree in the village.',
    exampleVi: 'Từng có một cây đa cổ thụ ở đầu làng.',
  },
  'be used to': {
    type: 'phrase',
    typeLabel: 'Cấu trúc quen thuộc',
    phonetic: '/biː juːst tuː/',
    meaningVi: 'Đã quen với việc gì đó (+ V-ing / Danh từ)',
    exampleEn: 'She is used to waking up early for school.',
    exampleVi: 'Cô ấy đã quen với việc thức dậy sớm để đến trường.',
  },
  'run out of': {
    type: 'phrase',
    typeLabel: 'Cụm động từ (Phrasal Verb)',
    phonetic: '/rʌn aʊt əv/',
    meaningVi: 'Hết, cạn kiệt (năng lượng, tiền bạc, thời gian)',
    exampleEn: 'We will run out of fossil fuels in the near future.',
    exampleVi: 'Chúng ta sẽ cạn kiệt nhiên liệu hóa thạch trong tương lai gần.',
  },
  'carry out': {
    type: 'phrase',
    typeLabel: 'Cụm động từ (Phrasal Verb)',
    phonetic: '/ˈkær.i aʊt/',
    meaningVi: 'Tiến hành, thực hiện (nhiệm vụ, nghiên cứu)',
    exampleEn: 'Scientists carried out an extensive field research.',
    exampleVi: 'Các nhà khoa học đã tiến hành một cuộc nghiên cứu thực địa kỹ lưỡng.',
  },
  'pass down': {
    type: 'phrase',
    typeLabel: 'Cụm động từ (Phrasal Verb)',
    phonetic: '/pɑːs daʊn/',
    meaningVi: 'Truyền lại cho đời sau, lưu truyền',
    exampleEn: 'Traditional folk songs are passed down orally.',
    exampleVi: 'Các bài dân ca cổ được truyền miệng qua nhiều thế hệ.',
  },
  'take care of': {
    type: 'phrase',
    typeLabel: 'Cụm động từ (Phrasal Verb)',
    phonetic: '/teɪk keər əv/',
    meaningVi: 'Chăm sóc, giữ gìn, trông nom (= look after)',
    exampleEn: 'We must take care of historic sites.',
    exampleVi: 'Chúng ta phải giữ gìn và chăm sóc các di tích lịch sử.',
  },
  although: {
    type: 'grammar_structure',
    typeLabel: 'Liên từ nhượng bộ (Concession)',
    phonetic: '/ɔːlˈðəʊ/',
    meaningVi: 'Mặc dù, dẫu cho (+ Mệnh đề S + V)',
    exampleEn: 'Although it rained heavily, we still attended the ceremony.',
    exampleVi: 'Mặc dù trời mưa to, chúng tôi vẫn đến tham dự buổi lễ.',
  },
  despite: {
    type: 'grammar_structure',
    typeLabel: 'Giới từ nhượng bộ (Concession)',
    phonetic: '/dɪˈspaɪt/',
    meaningVi: 'Mặc dù, bất chấp (+ Cụm danh từ / V-ing)',
    exampleEn: 'Despite the bad weather, the tour was a success.',
    exampleVi: 'Bất chấp thời tiết xấu, chuyến tham quan vẫn thành công.',
  },
};

export const HighlightTextDetector: React.FC<HighlightTextDetectorProps> = ({
  onTriggerHighlight,
  isHighlighterPenActive,
  onToggleHighlighterPen,
  highlightColor,
  onChangeHighlightColor,
  onOpenNotebook,
  unitContext = '',
  savedCount = 0,
}) => {
  // Floating Instant Popover State (Shows meaning IMMEDIATELY upon highlight)
  const [popover, setPopover] = useState<{
    x: number;
    y: number;
    text: string;
    context?: string;
    arrowPosition: 'top' | 'bottom';
  } | null>(null);

  // Result state for current highlighted text
  const [meaningResult, setMeaningResult] = useState<AiHighlightResult | null>(null);
  const [isLoadingMeaning, setIsLoadingMeaning] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // In-memory cache to make re-highlighting instant (0ms)
  const cacheRef = useRef<Map<string, AiHighlightResult>>(new Map());
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<any>(null);

  // Text Selection Listener across the whole document
  useEffect(() => {
    const handleSelectionEnd = () => {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const activeEl = document.activeElement;
        // Don't interfere if user is typing in regular input/textarea
        if (
          activeEl &&
          (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
          !(activeEl as HTMLElement).classList.contains('allow-highlight-selection')
        ) {
          return;
        }

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          return;
        }

        const rawText = selection.toString().trim();
        if (!rawText || rawText.length < 2 || rawText.length > 300) {
          return;
        }

        try {
          const range = selection.getRangeAt(0);

          // If the selection is inside the popover itself, do not reopen/reposition
          if (popoverRef.current && popoverRef.current.contains(range.commonAncestorContainer)) {
            return;
          }

          const rect = range.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return;

          let context = '';
          if (range.startContainer && range.startContainer.textContent) {
            context = range.startContainer.textContent.trim();
          }

          // Calculate popover coordinates (width is 340px)
          const popoverWidth = Math.min(350, window.innerWidth - 24);
          const popoverHeight = 220; // approximate height

          let popoverX = rect.left + rect.width / 2 - popoverWidth / 2;
          // Clamp inside viewport
          popoverX = Math.max(12, Math.min(window.innerWidth - popoverWidth - 12, popoverX));

          let popoverY = rect.top - popoverHeight - 12;
          let arrowPosition: 'bottom' | 'top' = 'bottom';

          // If not enough room above, place below
          if (rect.top < popoverHeight + 20) {
            popoverY = rect.bottom + 12;
            arrowPosition = 'top';
          }

          setPopover({
            x: popoverX + window.scrollX,
            y: popoverY + window.scrollY,
            text: rawText,
            context,
            arrowPosition,
          });

          // Fetch or resolve meaning immediately
          fetchInstantMeaning(rawText, context);
        } catch (e) {
          // Ignore selection range exceptions
        }
      }, 70);
    };

    const handleDocumentMouseDown = (e: MouseEvent) => {
      // If clicking inside the popover, don't dismiss
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }
      // If clicking outside and no current selection, dismiss popover
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPopover(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPopover(null);
      }
    };

    document.addEventListener('mouseup', handleSelectionEnd);
    document.addEventListener('touchend', handleSelectionEnd);
    document.addEventListener('mousedown', handleDocumentMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(debounceTimerRef.current);
      document.removeEventListener('mouseup', handleSelectionEnd);
      document.removeEventListener('touchend', handleSelectionEnd);
      document.removeEventListener('mousedown', handleDocumentMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [unitContext]);

  // Fetch or lookup meaning immediately
  const fetchInstantMeaning = async (text: string, context?: string) => {
    const rawClean = text.trim();
    // Clean out wrapping quotation marks or trailing punctuation for dictionary key
    const cleanKey = rawClean
      .toLowerCase()
      .replace(/^[\s“"‘'(\[]+|[\s”"’')\].,;:!?]+$/g, '')
      .trim();
    setIsCopied(false);

    // 1. Check in-memory cache for 0ms response
    if (cacheRef.current.has(cleanKey)) {
      const cached = cacheRef.current.get(cleanKey)!;
      setMeaningResult(cached);
      setIsLoadingMeaning(false);
      checkIfSaved(cached.originalText);
      return;
    }

    // 2. Check instant client dictionary for 0ms response
    if (INSTANT_CLIENT_DICT[cleanKey]) {
      const dictItem = INSTANT_CLIENT_DICT[cleanKey];
      const instantRes: AiHighlightResult = {
        originalText: rawClean,
        type: dictItem.type,
        typeLabel: dictItem.typeLabel,
        phonetic: dictItem.phonetic,
        vietnameseMeaning: dictItem.meaningVi,
        detailedExplanation: dictItem.meaningVi,
        examples: dictItem.exampleEn
          ? [{ en: dictItem.exampleEn, vi: dictItem.exampleVi || '' }]
          : [],
      };
      setMeaningResult(instantRes);
      cacheRef.current.set(cleanKey, instantRes);
      setIsLoadingMeaning(false);
      checkIfSaved(rawClean);
      return;
    }

    // Also check multi-word phrase matches in client dict
    for (const [key, dictItem] of Object.entries(INSTANT_CLIENT_DICT)) {
      if (key.includes(' ') && (cleanKey === key || cleanKey.includes(key))) {
        const instantRes: AiHighlightResult = {
          originalText: rawClean,
          type: dictItem.type,
          typeLabel: dictItem.typeLabel,
          phonetic: dictItem.phonetic,
          vietnameseMeaning: dictItem.meaningVi,
          detailedExplanation: dictItem.meaningVi,
          examples: dictItem.exampleEn
            ? [{ en: dictItem.exampleEn, vi: dictItem.exampleVi || '' }]
            : [],
        };
        setMeaningResult(instantRes);
        cacheRef.current.set(cleanKey, instantRes);
        setIsLoadingMeaning(false);
        checkIfSaved(rawClean);
        return;
      }
    }

    // 3. Request AI server endpoint for full dynamic analysis
    setIsLoadingMeaning(true);
    setMeaningResult(null);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9000);

      const res = await fetch('/api/ai-explain-highlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawClean,
          context,
          unitContext,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      let data: any = null;
      try {
        const rawBody = await res.text();
        if (rawBody && rawBody.trim()) {
          try {
            data = JSON.parse(rawBody.trim());
          } catch {
            // In case of any wrapping or non-json
            const firstBrace = rawBody.indexOf('{');
            const lastBrace = rawBody.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
              data = JSON.parse(rawBody.substring(firstBrace, lastBrace + 1));
            }
          }
        }
      } catch (parseErr) {
        console.warn('Highlight response parse notice:', parseErr);
      }

      if (!data || (!res.ok && data.error)) {
        throw new Error(data?.error || 'API failed');
      }

      const finalResult: AiHighlightResult = {
        originalText: data.originalText || rawClean,
        type: data.type || (cleanKey.includes(' ') ? 'phrase' : 'word'),
        typeLabel: data.typeLabel || (cleanKey.includes(' ') ? 'Cụm từ tiếng Anh' : 'Từ vựng tiếng Anh'),
        phonetic: data.phonetic,
        vietnameseMeaning: data.vietnameseMeaning || data.meaningVi || `Nghĩa: "${rawClean}"`,
        detailedExplanation: data.detailedExplanation || data.vietnameseMeaning || '',
        grammarBreakdown: data.grammarBreakdown,
        collocations: Array.isArray(data.collocations) ? data.collocations : undefined,
        synonyms: Array.isArray(data.synonyms) ? data.synonyms : undefined,
        antonyms: Array.isArray(data.antonyms) ? data.antonyms : undefined,
        examples: Array.isArray(data.examples) ? data.examples : [],
        examTip: data.examTip,
        difficultyLevel: data.difficultyLevel,
        sourceContext: context,
      };

      setMeaningResult(finalResult);
      cacheRef.current.set(cleanKey, finalResult);
      checkIfSaved(finalResult.originalText);
    } catch {
      // Graceful fallback display if network issue or offline
      const wordsCount = cleanKey.split(/\s+/).filter(Boolean).length;
      const fallback: AiHighlightResult = {
        originalText: rawClean,
        type: wordsCount >= 2 ? 'phrase' : 'word',
        typeLabel: wordsCount >= 2 ? 'Cụm từ tiếng Anh' : 'Từ vựng tiếng Anh',
        vietnameseMeaning: `Cụm từ / Từ vựng: "${rawClean}"`,
        detailedExplanation: `Bạn có thể bấm "Phân tích sâu" để xem chi tiết mẹo thi tuyển sinh vào 10 cho cấu trúc này.`,
        examples: [],
      };
      setMeaningResult(fallback);
    } finally {
      setIsLoadingMeaning(false);
    }
  };

  // Check if item is already in Saved Highlights
  const checkIfSaved = (word: string) => {
    if (!word) {
      setIsSaved(false);
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const target = word.toLowerCase().trim();
          const exists = parsed.some(
            (it) => it && typeof it.text === 'string' && it.text.toLowerCase().trim() === target
          );
          setIsSaved(exists);
          return;
        }
      }
    } catch {}
    setIsSaved(false);
  };

  // Toggle Save to Notebook directly from Instant Popover
  const handleToggleSave = () => {
    if (!meaningResult || !meaningResult.originalText) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let list: SavedHighlightItem[] = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) list = parsed;
        } catch {}
      }
      const target = meaningResult.originalText.toLowerCase().trim();
      const existsIndex = list.findIndex(
        (it) => it && typeof it.text === 'string' && it.text.toLowerCase().trim() === target
      );

      if (existsIndex !== -1) {
        list.splice(existsIndex, 1);
        setIsSaved(false);
      } else {
        const newItem: SavedHighlightItem = {
          id: `hl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          text: meaningResult.originalText,
          vietnameseMeaning: meaningResult.vietnameseMeaning,
          phonetic: meaningResult.phonetic,
          typeLabel: meaningResult.typeLabel,
          createdAt: Date.now(),
          unitContext,
          color: highlightColor,
          examples: meaningResult.examples,
          examTip: meaningResult.examTip,
        };
        list = [newItem, ...list];
        setIsSaved(true);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  // Speak pronunciation
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  // Copy meaning
  const handleCopyMeaning = () => {
    if (!meaningResult) return;
    const textToCopy = `${meaningResult.originalText} ${
      meaningResult.phonetic || ''
    }: ${meaningResult.vietnameseMeaning}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentColorConfig = COLOR_MAP[highlightColor] || COLOR_MAP.yellow;

  return (
    <>
      {/* 🌟 INSTANT MEANING POPOVER: Pops up immediately upon highlighting text! */}
      {popover && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            left: `${popover.x}px`,
            top: `${popover.y}px`,
            zIndex: 99999,
            boxShadow: `0 12px 36px -4px rgba(0, 0, 0, 0.8), 0 0 20px ${currentColorConfig.glow}`,
          }}
          className="w-[340px] max-w-[calc(100vw-24px)] rounded-2xl bg-slate-950/95 border-2 border-slate-700/80 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-slate-100 select-text p-3.5 space-y-2.5 transition-all"
        >
          {/* Header Row: Highlight Icon + Term + Audio + Close Button */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full ${currentColorConfig.dot} shrink-0 animate-pulse`}
              />
              <span className="font-extrabold text-sm text-white truncate" title={popover.text}>
                {popover.text}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleSpeak(popover.text)}
                disabled={isPlayingAudio}
                className="p-1 rounded-lg hover:bg-slate-800 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                title="Nghe phát âm chuẩn (US)"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-amber-400' : ''}`} />
              </button>
              <button
                onClick={() => setPopover(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meaning Body */}
          {isLoadingMeaning ? (
            <div className="py-4 space-y-2 animate-pulse text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-300">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>AI đang phân tích nghĩa tức thì...</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full w-4/5 mx-auto"></div>
              <div className="h-2.5 bg-slate-850 rounded-full w-3/5 mx-auto"></div>
            </div>
          ) : meaningResult ? (
            <div className="space-y-2">
              {/* Type Badge & Phonetic */}
              <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
                <span
                  className={`px-2 py-0.5 rounded-md font-bold ${currentColorConfig.badgeBg} ${currentColorConfig.badgeText} border ${currentColorConfig.accentBorder}`}
                >
                  {meaningResult.typeLabel || 'Từ vựng'}
                </span>
                {meaningResult.phonetic && (
                  <span className="font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {meaningResult.phonetic}
                  </span>
                )}
              </div>

              {/* VIETNAMESE MEANING (Direct, large, bold, crystal-clear!) */}
              <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-2.5 shadow-inner">
                <p className="text-sm font-extrabold text-amber-200 leading-snug">
                  {meaningResult.vietnameseMeaning}
                </p>
              </div>

              {/* Short Example if available */}
              {meaningResult.examples && meaningResult.examples.length > 0 && (
                <div className="text-[11px] text-slate-300 bg-slate-900/40 border border-slate-850 rounded-lg p-2 space-y-0.5">
                  <p className="italic text-slate-200">
                    &ldquo;{meaningResult.examples[0].en}&rdquo;
                  </p>
                  {meaningResult.examples[0].vi && (
                    <p className="text-slate-400 font-medium">
                      ↳ {meaningResult.examples[0].vi}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-2 text-xs text-slate-400 text-center">
              Chưa có dữ liệu giải nghĩa cho cụm từ này.
            </div>
          )}

          {/* Action Footer: Listen, Save, Copy, View Deep Analysis */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-1">
              {/* Quick Save Bookmark */}
              <button
                onClick={handleToggleSave}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                }`}
                title={isSaved ? 'Đã lưu trong sổ tay' : 'Lưu vào sổ tay từ vựng'}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã lưu</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Lưu</span>
                  </>
                )}
              </button>

              {/* Copy Meaning Button */}
              <button
                onClick={handleCopyMeaning}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 font-medium text-[11px] cursor-pointer transition-colors"
                title="Sao chép nghĩa"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Chép</span>
                  </>
                )}
              </button>
            </div>

            {/* Deep Analysis Modal Trigger */}
            <button
              onClick={() => {
                onTriggerHighlight(popover.text, popover.context);
                setPopover(null);
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer group"
              title="Mở phân tích chuyên sâu, bài tập & mẹo thi vào 10"
            >
              <span>Phân tích sâu</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Highlighter Pen Tool Dock (Bottom Right next to AI button) */}
      <div className="fixed bottom-20 right-5 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Active Pen Indicator Pill */}
        {isHighlighterPenActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/95 border-2 border-amber-400 text-amber-200 text-xs font-bold shadow-xl animate-bounce backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Chế độ Highlight AI: Bôi đen bất kỳ chữ nào là hiện nghĩa ngay lập tức!</span>
          </div>
        )}

        {/* Mini Highlighter Pen Widget */}
        <div className="flex items-center gap-1.5 bg-slate-950/95 border border-slate-800 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md">
          {/* Toggle Pen Button */}
          <button
            onClick={() => onToggleHighlighterPen(!isHighlighterPenActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all active:scale-95 shadow-sm ${
              isHighlighterPenActive
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 shadow-amber-950/60 ring-2 ring-amber-400'
                : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="Bật/Tắt chế độ Bút Highlight AI (Bôi đen là AI tự động hiện nghĩa ngay)"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlight AI</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                isHighlighterPenActive
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isHighlighterPenActive ? 'BẬT' : 'TẮT'}
            </span>
          </button>

          {/* Color Switcher */}
          {isHighlighterPenActive && (
            <div className="flex items-center gap-1 px-1.5 border-l border-slate-800">
              {(['yellow', 'green', 'pink', 'cyan', 'purple'] as HighlightColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onChangeHighlightColor(c)}
                  className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                    COLOR_MAP[c].dot
                  } ${
                    highlightColor === c
                      ? 'scale-125 ring-2 ring-white shadow-md'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                  title={COLOR_MAP[c].label}
                />
              ))}
            </div>
          )}

          {/* Quick Notebook Trigger */}
          <button
            onClick={onOpenNotebook}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer relative"
            title="Mở Sổ tay từ vựng đã highlight"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-amber-300 shadow">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
