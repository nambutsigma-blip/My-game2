import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Check,
  RotateCcw,
  BookOpen,
  Globe,
  Trash2,
  AlertTriangle,
  Play,
  Square,
  Award,
  ArrowRight,
  TrendingUp,
  Sliders,
  RefreshCw,
  Lightbulb,
  Headphones,
  Calendar,
  MessageSquare,
  ExternalLink,
  Key,
  Zap,
} from 'lucide-react';
import {
  ForeignPersona,
  ConversationMessage,
  SavedConversationSession,
  ConversationGrammarCorrection,
} from '../types';
import { playSuccessChime, playLaser, playStealthStep } from '../utils/soundEffects';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getAiHeaders, hasCustomApiKey } from '../utils/aiClientHelper';

interface AiForeignConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitContext?: string;
  onOpenApiKeyModal?: () => void;
}

const STORAGE_SAVED_SESSIONS_KEY = 'egg_thief_saved_foreign_conversations';

// Preset Native Speaker Personas (Diverse backgrounds, countries, and accents)
const PRESET_PERSONAS: ForeignPersona[] = [
  {
    id: 'persona_alex_usa',
    name: 'Alex Carter',
    avatar: '🏄‍♂️',
    nationality: 'Hoa Kỳ (USA)',
    countryCode: 'US',
    voiceLang: 'en-US',
    accentName: 'California American Accent',
    roleTitle: 'Sinh viên Stanford & Đam mê Gaming & Thể thao',
    personality: 'Nhiệt tình, hài hước, dùng tiếng lóng tự nhiên của giới trẻ Mỹ',
    targetLevel: 'B1',
    topic: 'Cuộc sống học đường, sở thích chơi game và thể thao',
    greeting: "Hey there! I'm Alex from sunny California. Great to meet you! How's your day going so far?",
  },
  {
    id: 'persona_emma_uk',
    name: 'Emma Watson',
    avatar: '👩‍🏫',
    nationality: 'Vương Quốc Anh (UK)',
    countryCode: 'GB',
    voiceLang: 'en-GB',
    accentName: 'British RP Accent (Chuẩn London)',
    roleTitle: 'Cử nhân Ngôn ngữ học Oxford & Yêu sách',
    personality: 'Lịch sự, phát âm tròn vành rõ chữ, phát hiện bẫy ngữ pháp tinh tế',
    targetLevel: 'B1',
    topic: 'Văn hóa Anh quốc, đọc sách, du lịch và thói quen học tập',
    greeting: "Hello! It is a pleasure to meet you. I am Emma from London. What topic would you like to explore together today?",
  },
  {
    id: 'persona_liam_aus',
    name: 'Liam O’Connor',
    avatar: '🦘',
    nationality: 'Úc (Australia)',
    countryCode: 'AU',
    voiceLang: 'en-AU',
    accentName: 'Sydney Australian Accent',
    roleTitle: 'Nhà thám hiểm động vật hoang dã & Nhiếp ảnh gia',
    personality: 'Thân thiện, phóng khoáng, dùng các từ ngữ đặc trưng nước Úc',
    targetLevel: 'B1',
    topic: 'Bảo vệ thiên nhiên, động vật hoang dã và du lịch mạo hiểm',
    greeting: "G'day mate! Liam here from Sydney. Ready to practice some English with a wild Aussie twist?",
  },
  {
    id: 'persona_chloe_can',
    name: 'Chloe Tremblay',
    avatar: '🍁',
    nationality: 'Canada',
    countryCode: 'CA',
    voiceLang: 'en-CA',
    accentName: 'Canadian Accent',
    roleTitle: 'Barista & Ca sĩ nhạc Indie tại Toronto',
    personality: 'Nhẹ nhàng, kiên nhẫn, khuyến khích người học nói không sợ sai',
    targetLevel: 'A2',
    topic: 'Âm nhạc, cà phê, mùa đông tuyết trắng và ẩm thực',
    greeting: "Hi there! I'm Chloe from Toronto. Don't worry about making mistakes at all, we're just having a friendly chat! What kind of music do you like?",
  },
  {
    id: 'persona_sarah_sg',
    name: 'Sarah Lin',
    avatar: '💼',
    nationality: 'Singapore',
    countryCode: 'SG',
    voiceLang: 'en-US',
    accentName: 'International English (Singapore)',
    roleTitle: 'Thành viên đội tuyển Tranh biện & Công nghệ',
    personality: 'Sắc sảo, tư duy logic, phản xạ câu hỏi nhanh và học thuật',
    targetLevel: 'B2',
    topic: 'Công nghệ AI, chuẩn bị thi vào cấp 3 và kỹ năng tranh biện',
    greeting: "Hello! Sarah here. Let's discuss exciting ideas and level up your English communication skills. What are your thoughts on modern technology?",
  },
];

export const AiForeignConversationModal: React.FC<AiForeignConversationModalProps> = ({
  isOpen,
  onClose,
  unitContext = 'Chương trình Tiếng Anh Lớp 8 & Ôn thi vào 10 THPT',
  onOpenApiKeyModal,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'saved' | 'persona'>('chat');
  const [currentPersona, setCurrentPersona] = useState<ForeignPersona>(PRESET_PERSONAS[0]);

  // Messages state
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [autoplayAudio, setAutoplayAudio] = useState(true);

  // Speed rate control for native speaker speech (0.75x slow, 0.95x standard, 1.25x fast native)
  const [speechRate, setSpeechRate] = useState<number>(0.95);

  // Shadowing & Pronunciation Evaluation States
  const [shadowingPhrase, setShadowingPhrase] = useState<string | null>(null);
  const [pronounceReport, setPronounceReport] = useState<{ messageId: string; data: any } | null>(null);
  const [isPronounceEvaluating, setIsPronounceEvaluating] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(() => hasCustomApiKey());

  useEffect(() => {
    const handleKeyChange = () => setHasCustomKey(hasCustomApiKey());
    window.addEventListener('egg_thief_api_key_updated', handleKeyChange);
    return () => window.removeEventListener('egg_thief_api_key_updated', handleKeyChange);
  }, []);

  // Audio Recording with MediaRecorder
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Saved Sessions list
  const [savedSessions, setSavedSessions] = useState<SavedConversationSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Full Conversation Analysis Report
  const [fullAnalysis, setFullAnalysis] = useState<{
    fluencyScore: number;
    grammarScore: number;
    vocabularyScore: number;
    overallFeedback: string;
    keyGrammarMistakes: ConversationGrammarCorrection[];
    actionableRoadmap: string[];
  } | null>(null);
  const [isAnalyzingFull, setIsAnalyzingFull] = useState(false);

  // Custom AI Persona Generator Form
  const [customTopic, setCustomTopic] = useState('');
  const [customCountry, setCustomCountry] = useState('Hoa Kỳ (USA)');
  const [customLevel, setCustomLevel] = useState<'A2' | 'B1' | 'B2' | 'C1'>('B1');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);

  // Audio player state
  const [currentlyPlayingAudioId, setCurrentlyPlayingAudioId] = useState<string | null>(null);

  // In-app Modal Confirmation & Notification Toasts (No window.alert / window.confirm)
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [toastNotification, setToastNotification] = useState<{
    text: string;
    type: 'success' | 'info' | 'warn' | 'error';
  } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' | 'error' = 'success') => {
    clearTimeout(toastTimeoutRef.current);
    setToastNotification({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToastNotification(null);
    }, 3800);
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize conversation with persona's opening greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: `msg_init_${Date.now()}`,
          sender: 'foreign_ai',
          text: currentPersona.greeting,
          vietnameseSub: 'Xin chào! Rất vui được gặp bạn. Ngày hôm nay của bạn thế nào rồi?',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [isOpen, currentPersona]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const reco = new SpeechRecognition();
      reco.continuous = true;
      reco.interimResults = true;
      reco.lang = 'en-US';

      reco.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputVal(transcript);
        }
      };

      reco.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
      };

      recognitionRef.current = reco;
    }
  }, []);

  // Speak AI reply via SpeechSynthesis
  const speakText = (text: string, voiceLang: string, customRate?: number) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang || 'en-US';
    utterance.rate = customRate || speechRate || 0.95;

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.toLowerCase() === voiceLang.toLowerCase() || v.lang.startsWith('en')
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setCurrentlyPlayingAudioId('ai_voice');
    utterance.onend = () => setCurrentlyPlayingAudioId(null);
    utterance.onerror = () => setCurrentlyPlayingAudioId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Start Voice Recording (Mobile & Safari optimized)
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let options: MediaRecorderOptions | undefined = undefined;
      if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        }
      }

      const recorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start recognition if available
      try {
        recognitionRef.current?.start();
      } catch {}

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      showToast('Không thể truy cập Microphone. Vui lòng cấp quyền micro trên trình duyệt để ghi âm.', 'warn');
    }
  };

  // Stop Voice Recording
  const handleStopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    clearInterval(recordingTimerRef.current);
    try {
      recognitionRef.current?.stop();
    } catch {}

    const recorder = mediaRecorderRef.current;
    recorder.onstop = () => {
      const mime = recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mime });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Convert to base64 for permanent persistence
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        // If student transcribed text, auto-send or let student confirm
        if (inputVal.trim()) {
          handleSendMessage(inputVal.trim(), audioUrl, base64Data, recordingSeconds);
        } else {
          // Provide placeholder audio message
          handleSendMessage(
            'Hello! I just recorded a voice message.',
            audioUrl,
            base64Data,
            recordingSeconds
          );
        }
      };

      // Stop stream tracks
      recorder.stream.getTracks().forEach((track) => track.stop());
    };

    recorder.stop();
    setIsRecording(false);
  };

  // Shadowing Mode: Slow pronunciation modeling & repeating
  const handleStartShadowing = (phrase: string) => {
    setShadowingPhrase(phrase);
    setInputVal(phrase);
    speakText(phrase, currentPersona.voiceLang, 0.75);
    showToast('Đã bật Shadowing! Hãy nghe kỹ phát âm chậm (0.75x) và bấm micro để đọc lặp lại.', 'info');
  };

  // Evaluate Pronunciation on demand for any message
  const handleEvaluateMessageSpeech = async (msg: ConversationMessage) => {
    if (!msg.text) return;
    setIsPronounceEvaluating(true);
    try {
      const res = await fetch('/api/ai-pronounce-score', {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
          spokenText: msg.text,
          accent: currentPersona.accentName || 'American',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPronounceReport({ messageId: msg.id, data });
        playSuccessChime();
      } else {
        showToast('Không thể chấm phát âm lúc này.', 'warn');
      }
    } catch {
      showToast('Lỗi mạng khi chấm phát âm.', 'warn');
    } finally {
      setIsPronounceEvaluating(false);
    }
  };

  // Send message to Native Speaker AI & Get Grammar Feedback
  const handleSendMessage = async (
    textToSend: string,
    recordedAudioUrl?: string,
    recordedBase64?: string,
    audioDuration?: number
  ) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isAiReplying) return;

    const userMessageId = `msg_user_${Date.now()}`;
    const newUserMsg: ConversationMessage = {
      id: userMessageId,
      sender: 'user',
      text: cleanText,
      audioBlobUrl: recordedAudioUrl,
      audioDataUrl: recordedBase64,
      audioDurationSeconds: audioDuration,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputVal('');
    setShadowingPhrase(null);
    setIsAiReplying(true);
    playStealthStep();

    try {
      const res = await fetch('/api/ai-foreign-chat', {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
          persona: currentPersona,
          userMessage: cleanText,
          history: updatedMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          unitContext,
        }),
      });

      if (!res.ok) {
        throw new Error('API failed');
      }

      const data = await res.json();

      // Update user message with grammar check feedback if returned
      if (data.turnAnalysis) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMessageId
              ? {
                  ...m,
                  corrections: data.turnAnalysis.corrections || [],
                  praise: data.turnAnalysis.praise,
                  grammarScore: data.turnAnalysis.score,
                }
              : m
          )
        );
      }

      // Add Native Speaker reply
      const aiReplyMsg: ConversationMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'foreign_ai',
        text: data.reply,
        vietnameseSub: data.replyVietnameseSub,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiReplyMsg]);

      // Autoplay voice if enabled
      if (autoplayAudio) {
        speakText(data.reply, currentPersona.voiceLang, speechRate);
      }
    } catch (err: any) {
      console.warn('AI chat error:', err);
      // Fallback response
      const fallbackReply: ConversationMessage = {
        id: `msg_ai_fallback_${Date.now()}`,
        sender: 'foreign_ai',
        text: "That's wonderful! Could you tell me more about why you feel that way?",
        vietnameseSub: 'Thật tuyệt vời! Bạn có thể chia sẻ thêm lý do vì sao bạn cảm thấy như vậy không?',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsAiReplying(false);
    }
  };

  // Run Full Conversation Grammar Audit
  const handleRunFullAnalysis = async () => {
    if (messages.length <= 1) {
      showToast('Vui lòng trò chuyện ít nhất 2 câu để AI có đủ dữ liệu phân tích ngữ pháp toàn diện.', 'info');
      return;
    }

    setIsAnalyzingFull(true);
    setActiveTab('analysis');

    try {
      const res = await fetch('/api/ai-analyze-full-conversation', {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
          persona: currentPersona,
          messages: messages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to analyze');

      const data = await res.json();
      setFullAnalysis(data);
      playSuccessChime();
    } catch (err: any) {
      console.error(err);
      playLaser();
      showToast('Lỗi phân tích hội thoại: ' + (err.message || 'Vui lòng thử lại'), 'error');
    } finally {
      setIsAnalyzingFull(false);
    }
  };

  // Save conversation session & audio recordings permanently (localStorage + Cloud Firestore)
  const handleSaveSession = async () => {
    if (messages.length <= 1) {
      showToast('Hãy trò chuyện một vài câu trước khi lưu lại phiên học tập.', 'info');
      return;
    }

    const sessionData: SavedConversationSession = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: auth.currentUser?.uid || 'guest',
      persona: currentPersona,
      topic: currentPersona.topic,
      createdAt: Date.now(),
      dateFormatted: new Date().toLocaleString('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      messagesCount: messages.length,
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        vietnameseSub: m.vietnameseSub,
        audioDataUrl: m.audioDataUrl,
        corrections: m.corrections,
        praise: m.praise,
        grammarScore: m.grammarScore,
        timestamp: m.timestamp,
      })),
      overallReview: fullAnalysis || undefined,
    };

    // 1. Save to LocalStorage
    const updated = [sessionData, ...savedSessions];
    setSavedSessions(updated);
    try {
      localStorage.setItem(STORAGE_SAVED_SESSIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage limit reached', e);
    }

    // 2. Sync to Cloud Firestore if logged in
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, 'conversations'), {
          ...sessionData,
          serverCreated: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Could not sync conversation to Firestore:', err);
      }
    }

    playSuccessChime();
    showToast(
      `Đã lưu hội thoại thành công! (${messages.length} tin nhắn & bản ghi âm)`,
      'success'
    );
  };

  // Generate Custom Native Persona with AI
  const handleGenerateCustomPersona = async () => {
    setIsGeneratingPersona(true);
    try {
      const res = await fetch('/api/ai-generate-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopic.trim() || 'Trò chuyện tự do & Sở thích',
          country: customCountry,
          difficulty: customLevel,
          customPrompt: customPrompt.trim(),
        }),
      });

      if (!res.ok) throw new Error('API failed');

      const newPersona: ForeignPersona = await res.json();
      setCurrentPersona(newPersona);
      setMessages([
        {
          id: `msg_init_${Date.now()}`,
          sender: 'foreign_ai',
          text: newPersona.greeting,
          vietnameseSub: 'Chào bạn! Rất vui được gặp bạn trong buổi trò chuyện hôm nay!',
          timestamp: Date.now(),
        },
      ]);
      setFullAnalysis(null);
      setActiveTab('chat');
      playSuccessChime();
      showToast(`Đã tạo nhân vật mới: ${newPersona.name} (${newPersona.nationality})!`, 'success');
    } catch (err: any) {
      playLaser();
      showToast('Không thể tạo nhân vật lúc này: ' + err.message, 'warn');
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  // Restore a saved session
  const handleLoadSavedSession = (session: SavedConversationSession) => {
    setCurrentPersona(session.persona);
    setMessages(
      session.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        vietnameseSub: m.vietnameseSub,
        audioBlobUrl: m.audioDataUrl, // base64 URL can be played directly
        audioDataUrl: m.audioDataUrl,
        corrections: m.corrections,
        praise: m.praise,
        grammarScore: m.grammarScore,
        timestamp: m.timestamp,
      }))
    );
    if (session.overallReview) {
      setFullAnalysis(session.overallReview);
    }
    setActiveTab('chat');
    showToast(`Đã nạp lại cuộc trò chuyện cùng ${session.persona.name}!`, 'info');
  };

  // Delete a saved session
  const handleDeleteSession = (sessionId: string) => {
    const filtered = savedSessions.filter((s) => s.id !== sessionId);
    setSavedSessions(filtered);
    localStorage.setItem(STORAGE_SAVED_SESSIONS_KEY, JSON.stringify(filtered));
    showToast('Đã xóa bản ghi cuộc trò chuyện.', 'info');
  };

  // Request Reset Conversation
  const handleRequestReset = () => {
    if (messages.length > 1) {
      setShowResetConfirmModal(true);
    } else {
      executeResetConversation();
    }
  };

  // Execute Conversation Reset back to fresh start (Clean in-app, never blocked by iFrame)
  const executeResetConversation = () => {
    setShowResetConfirmModal(false);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (isRecording) {
      handleStopRecording();
    }

    setMessages([
      {
        id: `msg_init_${Date.now()}`,
        sender: 'foreign_ai',
        text: currentPersona.greeting,
        vietnameseSub: 'Xin chào! Rất vui được gặp bạn. Ngày hôm nay của bạn thế nào rồi?',
        timestamp: Date.now(),
      },
    ]);
    setFullAnalysis(null);
    setInputVal('');
    setActiveTab('chat');
    playSuccessChime();
    showToast(`Đã làm mới cuộc hội thoại! Hãy bắt đầu nói chuyện cùng ${currentPersona.name}.`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[880px] bg-slate-900 border-2 border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Reset Conversation In-App Modal Dialog (Never blocked by iFrame/browser popup blockers) */}
        {showResetConfirmModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <RotateCcw className="w-7 h-7 animate-spin-reverse" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white">Reset Cuộc Hội Thoại Này?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tất cả các tin nhắn trò chuyện và lượt thu âm hiện tại sẽ được dọn sạch để bạn bắt đầu lại cuộc trò chuyện từ đầu với{' '}
                  <strong className="text-amber-300 font-bold">{currentPersona.name}</strong>.
                </p>
                <p className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2">
                  💡 Bạn có thể bấm &ldquo;Lưu Bản Ghi&rdquo; trước khi reset nếu muốn lưu lại các câu nói vừa rồi vào Sổ Lưu Trữ.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowResetConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Giữ Lại
                </button>
                <button
                  onClick={executeResetConversation}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs cursor-pointer transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xác Nhận Reset</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-App Toast Notification Banner */}
        {toastNotification && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/95 border border-emerald-500/60 shadow-2xl text-xs font-bold text-emerald-300 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastNotification.text}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-950/60 shrink-0">
              {currentPersona.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                  <span>Trò Chuyện Cùng {currentPersona.name}</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {currentPersona.nationality}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  CEFR {currentPersona.targetLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md">
                {currentPersona.roleTitle} • Giọng: {currentPersona.accentName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenApiKeyModal && (
              <button
                onClick={onOpenApiKeyModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-black text-xs cursor-pointer transition-all active:scale-95 shadow-sm ${
                  hasCustomKey
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                    : 'bg-slate-800/80 border-amber-500/50 text-amber-200 hover:border-amber-400'
                }`}
                title="Cấu hình Google Gemini API Key cá nhân để tối ưu tốc độ & không bao giờ bị giới hạn"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">API Key</span>
                <span className={`w-1.5 h-1.5 rounded-full ${hasCustomKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </button>
            )}

            {/* Reset Conversation Button */}
            <button
              onClick={handleRequestReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500/50 text-slate-200 hover:text-rose-200 font-bold text-xs cursor-pointer transition-all active:scale-95 shadow-sm group"
              title="Reset và bắt đầu lại cuộc trò chuyện từ đầu với người bản xứ này"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400 group-hover:-rotate-90 transition-transform" />
              <span>Reset Hội Thoại</span>
            </button>

            <button
              onClick={handleSaveSession}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 font-bold text-xs cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Lưu lại toàn bộ cuộc hội thoại, bản ghi âm và phân tích lỗi ngữ pháp"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lưu Bản Ghi</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-slate-800 bg-slate-950/40 flex-wrap gap-2 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Hội Thoại & Thu Âm</span>
            </button>

            <button
              onClick={() => {
                if (!fullAnalysis) {
                  handleRunFullAnalysis();
                } else {
                  setActiveTab('analysis');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'analysis'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 shadow-md shadow-amber-950'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Phân Tích Lỗi & Hướng Sửa</span>
              {fullAnalysis && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sổ Bản Ghi ({savedSessions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('persona')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'persona'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Đổi / Tạo Người Nước Ngoài AI</span>
            </button>
          </div>

          {/* Quick Audio & Subtitle Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                showSubtitles
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-800/60 text-slate-500 border-slate-700'
              }`}
              title="Bật/Tắt dịch phụ đề tiếng Việt"
            >
              Phụ đề Vi: {showSubtitles ? 'BẬT' : 'TẮT'}
            </button>

            <button
              onClick={() => setAutoplayAudio(!autoplayAudio)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                autoplayAudio
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800/60 text-slate-500 border-slate-700'
              }`}
              title="Tự động phát âm thanh bản xứ sau mỗi câu trả lời"
            >
              Tự phát âm: {autoplayAudio ? 'BẬT' : 'TẮT'}
            </button>
          </div>
        </div>

        {/* Tab 1: Live Chat & Audio Recording */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/50">
            {/* Conversation Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                      <span>{isUser ? 'Bạn' : currentPersona.name}</span>
                      <span>•</span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-2xl rounded-2xl p-3.5 shadow-md ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                          : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {/* Spoken Text */}
                      <p className="text-sm sm:text-base font-medium leading-relaxed select-text">
                        {msg.text}
                      </p>

                      {/* Subtitle Translation */}
                      {!isUser && showSubtitles && msg.vietnameseSub && (
                        <p className="mt-2 pt-2 border-t border-slate-700/60 text-xs text-amber-200/90 italic font-sans">
                          ↳ {msg.vietnameseSub}
                        </p>
                      )}

                      {/* Voice Recording Player (If user recorded audio) */}
                      {isUser && msg.audioBlobUrl && (
                        <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2">
                          <audio
                            src={msg.audioBlobUrl}
                            controls
                            className="h-8 max-w-[220px] rounded-lg"
                          />
                          <span className="text-[10px] text-indigo-200 font-bold">
                            🎙️ Bản ghi âm ({msg.audioDurationSeconds || 0}s)
                          </span>
                        </div>
                      )}

                      {/* AI Audio Speaker Button for Native Speaker Message */}
                      {!isUser && (
                        <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                          <button
                            onClick={() => speakText(msg.text, currentPersona.voiceLang)}
                            className="flex items-center gap-1.5 text-indigo-300 hover:text-white transition-colors cursor-pointer font-bold text-[11px]"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Nghe giọng bản xứ ({currentPersona.accentName})</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Instant Grammar Feedback Pill (For User's Message) */}
                    {isUser && (
                      <div className="max-w-[85%] sm:max-w-2xl w-full">
                        {msg.corrections && msg.corrections.length > 0 ? (
                          <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3 text-xs space-y-2 mt-1 shadow-sm">
                            <div className="flex items-center justify-between text-amber-300 font-bold">
                              <span className="flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>Phát hiện {msg.corrections.length} lỗi ngữ pháp cần điều chỉnh:</span>
                              </span>
                              {msg.grammarScore && (
                                <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px] text-amber-200 border border-amber-500/30">
                                  Điểm: {msg.grammarScore}/10
                                </span>
                              )}
                            </div>

                            {msg.corrections.map((corr, idx) => (
                              <div
                                key={idx}
                                className="bg-slate-900/80 rounded-lg p-2.5 border border-amber-500/20 space-y-1.5 text-[11px]"
                              >
                                <div className="flex items-center gap-1.5 text-rose-300">
                                  <span className="font-bold">❌ Gốc:</span>
                                  <span className="line-through">{corr.originalSnippet}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                                  <span>✅ Sửa chuẩn:</span>
                                  <span className="text-emerald-200">{corr.correctedSnippet}</span>
                                </div>
                                <p className="text-slate-300">
                                  <span className="text-amber-300 font-semibold">[{corr.errorType}]:</span>{' '}
                                  {corr.explanationVi}
                                </p>
                                <div className="bg-indigo-950/40 rounded p-1.5 text-indigo-200 text-[10px]">
                                  <span className="font-bold text-indigo-300">💬 Bản xứ thường nói: </span>
                                  &ldquo;{corr.naturalAlternative}&rdquo;
                                </div>
                                <div className="text-[10px] text-amber-300/90 font-medium">
                                  💡 Mẹo nhớ: {corr.memoryTip}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : msg.praise ? (
                          <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-emerald-300 flex items-center justify-between mt-1">
                            <span className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{msg.praise}</span>
                            </span>
                            {msg.grammarScore && (
                              <span className="font-bold text-[10px]">
                                Chuẩn xác: {msg.grammarScore}/10
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* AI Thinking Animation Indicator */}
              {isAiReplying && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-indigo-300 animate-pulse max-w-sm">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  </div>
                  <span>{currentPersona.name} đang lắng nghe & suy nghĩ câu trả lời...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input & Recording Controls */}
            <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 space-y-2">
              {/* Recording Status Bar */}
              {isRecording && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-rose-950/90 border border-rose-500/60 text-xs text-rose-200 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold">Đang thu âm giọng nói của bạn... ({recordingSeconds}s)</span>
                  </div>
                  <button
                    onClick={handleStopRecording}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Dừng & Gửi</span>
                  </button>
                </div>
              )}

              {/* Input Form */}
              <div className="flex items-center gap-2">
                {/* Voice Record Button */}
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isAiReplying}
                  className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-lg ${
                    isRecording
                      ? 'bg-rose-600 text-white ring-4 ring-rose-500/30 animate-bounce'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700'
                  }`}
                  title={isRecording ? 'Bấm để dừng và gửi bản ghi âm' : 'Bấm mic để nói trực tiếp bằng tiếng Anh'}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Text Field */}
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputVal);
                    }
                  }}
                  placeholder="Nói bằng micro hoặc gõ tin nhắn tiếng Anh..."
                  disabled={isAiReplying || isRecording}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage(inputVal)}
                  disabled={!inputVal.trim() || isAiReplying}
                  className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-lg shadow-indigo-950/60"
                  title="Gửi câu nói"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Quick Tools */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="truncate max-w-[180px] sm:max-w-xs">
                    Chủ đề: <strong className="text-amber-300">{currentPersona.topic}</strong>
                  </span>
                  <button
                    onClick={handleRequestReset}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/80 border border-slate-700/80 hover:border-rose-500/50 text-slate-200 hover:text-rose-200 font-bold text-xs cursor-pointer transition-colors shadow-sm"
                    title="Xóa tin nhắn cũ và bắt đầu lại cuộc trò chuyện từ đầu"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset Hội Thoại</span>
                  </button>
                </div>
                <button
                  onClick={handleRunFullAnalysis}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  <span>Phân tích toàn diện hội thoại</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Linguistic Grammar Audit & Actionable Roadmap */}
        {activeTab === 'analysis' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-950/60">
            {isAnalyzingFull ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto animate-spin">
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-black text-white">AI Đang Rà Soát Toàn Bộ Ngữ Pháp & Lỗi Diễn Đạt...</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Đối chiếu với tiêu chuẩn ngữ pháp Tuyển sinh vào 10 và các thói quen nói tiếng Anh tự nhiên của người bản xứ.
                </p>
              </div>
            ) : fullAnalysis ? (
              <div className="space-y-6">
                {/* 3 Metric Scores Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 text-center space-y-1">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      Độ Trôi Chảy (Fluency)
                    </span>
                    <div className="text-3xl font-black text-white flex items-center justify-center gap-1">
                      <span>{fullAnalysis.fluencyScore}</span>
                      <span className="text-sm text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${fullAnalysis.fluencyScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Chuẩn Ngữ Pháp (Grammar)
                    </span>
                    <div className="text-3xl font-black text-white flex items-center justify-center gap-1">
                      <span>{fullAnalysis.grammarScore}</span>
                      <span className="text-sm text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${fullAnalysis.grammarScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-4 text-center space-y-1">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Từ Vựng (Vocabulary)
                    </span>
                    <div className="text-3xl font-black text-white flex items-center justify-center gap-1">
                      <span>{fullAnalysis.vocabularyScore}</span>
                      <span className="text-sm text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${fullAnalysis.vocabularyScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Overall Feedback */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Nhận Xét Tổng Quát Của Chuyên Gia AI</span>
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {fullAnalysis.overallFeedback}
                  </p>
                </div>

                {/* Actionable Roadmap (Hướng Điều Chỉnh Cụ Thể) */}
                <div className="bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-500/50 rounded-2xl p-5 space-y-3">
                  <h4 className="text-sm font-black text-indigo-200 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Hướng Điều Chỉnh & Chiến Lược Cải Thiện Dứt Điểm</span>
                  </h4>
                  <div className="space-y-2">
                    {fullAnalysis.actionableRoadmap.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-slate-950/60 border border-indigo-500/20 rounded-xl p-3 text-xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-indigo-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-slate-200 leading-relaxed font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Grammar Mistakes List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Chi Tiết Toàn Bộ Lỗi Ngữ Pháp Đã Phát Hiện ({fullAnalysis.keyGrammarMistakes.length})</span>
                  </h4>

                  {fullAnalysis.keyGrammarMistakes.length === 0 ? (
                    <div className="p-6 text-center text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs font-bold">
                      🎉 Tuyệt vời! Bạn không mắc lỗi ngữ pháp nghiêm trọng nào trong suốt cuộc trò chuyện!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fullAnalysis.keyGrammarMistakes.map((mistake, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="font-extrabold text-amber-300">
                              Lỗi #{idx + 1}: {mistake.errorType}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-2.5">
                              <span className="text-[10px] font-bold text-rose-300 uppercase block mb-1">
                                Câu gốc bạn nói:
                              </span>
                              <p className="text-rose-200 line-through">&ldquo;{mistake.originalSnippet}&rdquo;</p>
                            </div>

                            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5">
                              <span className="text-[10px] font-bold text-emerald-300 uppercase block mb-1">
                                Cách sửa chuẩn ngữ pháp:
                              </span>
                              <p className="text-emerald-200 font-bold">&ldquo;{mistake.correctedSnippet}&rdquo;</p>
                            </div>
                          </div>

                          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-1.5">
                            <p className="text-slate-300">
                              <strong className="text-white">Lý giải vì sao sai:</strong> {mistake.explanationVi}
                            </p>
                            <p className="text-indigo-200">
                              <strong className="text-indigo-300">Cách người bản xứ tự nhiên hay nói:</strong> &ldquo;{mistake.naturalAlternative}&rdquo;
                            </p>
                            <p className="text-amber-300 font-medium">
                              💡 Mẹo nhớ lâu: {mistake.memoryTip}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center space-y-4">
                <p className="text-slate-400 text-xs">Chưa có bảng phân tích nào cho phiên trò chuyện này.</p>
                <button
                  onClick={handleRunFullAnalysis}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-black text-xs cursor-pointer shadow-lg active:scale-95"
                >
                  🚀 Chạy Phân Tích Toàn Diện Ngay
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Sessions & Audio Recordings */}
        {activeTab === 'saved' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-emerald-400" />
                  <span>Sổ Lưu Trữ Bản Ghi & Cuộc Hội Thoại</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Nghe lại bản thu âm giọng nói, xem lại nhận xét và ôn tập các lỗi ngữ pháp đã được AI phân tích.
                </p>
              </div>

              <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                Tổng: {savedSessions.length} phiên
              </span>
            </div>

            {savedSessions.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-3xl">
                <Headphones className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">Bạn chưa lưu phiên trò chuyện nào.</p>
                <p className="text-xs text-slate-500">
                  Hãy trò chuyện cùng người nước ngoài và bấm nút &ldquo;Lưu Bản Ghi&rdquo; ở góc trên!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4.5 space-y-3 transition-all shadow-md group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                          {session.persona.avatar}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-white">
                            {session.persona.name} ({session.persona.nationality})
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{session.dateFormatted}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Xóa phiên này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-slate-950/80 rounded-xl p-2.5 text-xs text-slate-300 space-y-1">
                      <p className="truncate">
                        <strong className="text-amber-300">Chủ đề:</strong> {session.topic}
                      </p>
                      <p className="text-slate-400">
                        Số lượt trao đổi: <strong>{session.messagesCount}</strong> tin nhắn
                      </p>
                    </div>

                    {session.overallReview && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-bold">
                          Trôi chảy: {session.overallReview.fluencyScore}/100
                        </span>
                        <span className="bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                          Ngữ pháp: {session.overallReview.grammarScore}/100
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleLoadSavedSession(session)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Mở Lại & Nghe Giọng Thu</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Select Preset or Generate Custom Foreign Persona with AI */}
        {activeTab === 'persona' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-950/60">
            {/* Section 1: Preset Personas */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Người Bản Xứ Tiêu Biểu Sẵn Có</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRESET_PERSONAS.map((p) => {
                  const isSelected = currentPersona.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setCurrentPersona(p);
                        setMessages([
                          {
                            id: `msg_init_${Date.now()}`,
                            sender: 'foreign_ai',
                            text: p.greeting,
                            vietnameseSub: 'Chào bạn! Rất vui được gặp bạn trong buổi trò chuyện hôm nay!',
                            timestamp: Date.now(),
                          },
                        ]);
                        setFullAnalysis(null);
                        setActiveTab('chat');
                      }}
                      className={`rounded-2xl p-4 border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-400/30 shadow-lg'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{p.avatar}</span>
                          <div>
                            <h4 className="font-extrabold text-sm text-white">{p.name}</h4>
                            <span className="text-[11px] text-cyan-300 font-semibold">{p.nationality}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          {p.targetLevel}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                        {p.roleTitle} • {p.personality}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-300 font-medium truncate">
                        Chủ đề: {p.topic}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: AI Dynamic Persona Generator (100% Khởi Tạo Mới, Không Hardcode) */}
            <div className="bg-gradient-to-br from-cyan-950/60 via-slate-900 to-purple-950/60 border border-cyan-500/40 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xl text-cyan-300">
                  ✨
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Tạo Người Nước Ngoài Mới Bằng AI (Không Hardcode)</h3>
                  <p className="text-xs text-slate-400">
                    AI sẽ tự động khởi tạo nhân vật với tên, quốc tịch, giọng nói, tính cách và câu chào độc nhất vô nhị theo yêu cầu của bạn!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Quốc gia mong muốn</label>
                  <select
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Hoa Kỳ (USA)">Hoa Kỳ (Mỹ) - American</option>
                    <option value="Vương Quốc Anh (UK)">Vương Quốc Anh - British RP</option>
                    <option value="Úc (Australia)">Úc - Aussie Accent</option>
                    <option value="Canada">Canada - Canadian</option>
                    <option value="Singapore">Singapore - International</option>
                    <option value="Ireland">Ireland - Irish Accent</option>
                    <option value="New Zealand">New Zealand - Kiwi Accent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Trình độ CEFR</label>
                  <select
                    value={customLevel}
                    onChange={(e) => setCustomLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="A2">A2 - Dễ, nói chậm rãi, từ vựng cơ bản</option>
                    <option value="B1">B1 - Chuẩn thi vào 10, tự nhiên, đa dạng</option>
                    <option value="B2">B2 - Nâng cao, câu ghép, nhiều idioms</option>
                    <option value="C1">C1 - Thành thạo, tốc độ như người bản ngữ</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Chủ đề mong muốn</label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="VD: Phỏng vấn xin visa, Du lịch New York..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Yêu cầu đặc biệt về tính cách hoặc nghề nghiệp (tùy chọn)</label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="VD: Một phi công thích kể chuyện bay lượn, hoặc một đầu bếp nổi tiếng ở Paris..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleGenerateCustomPersona}
                  disabled={isGeneratingPersona}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-cyan-950/60 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingPersona ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingPersona ? 'AI Đang Khởi Tạo Nhân Vật...' : 'Tạo Nhân Vật AI & Bắt Đầu Trò Chuyện'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
