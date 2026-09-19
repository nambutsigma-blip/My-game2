import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Brain,
  ChevronDown,
  ChevronUp,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Mic,
  MicOff,
  Lightbulb,
  MessageSquare,
  Flame,
  BookOpen,
} from 'lucide-react';
import { playSuccessChime, playLaser } from '../utils/soundEffects';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  thinking?: string;
  answer?: string;
  suggestedFollowUps?: string[];
  timestamp: string;
  isThinkingExpanded?: boolean;
}

interface AiThinkingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUnitTitle?: string;
}

const QUICK_PROMPTS = [
  'Giải thích chi tiết thì Hiện Tại Hoàn Thành và Quá Khứ Đơn',
  'Phân biệt "used to V", "be used to V-ing" và "get used to V-ing"',
  'Mẹo làm bài trắc nghiệm phát âm đuôi -ed và -s/-es',
  'Các cấu trúc bẫy ngữ pháp dễ mất điểm nhất trong đề thi vào 10',
  'Cho tôi 3 câu ví dụ câu điều kiện loại 2 kèm giải thích',
  'Làm sao để ấp ra rồng Thần Thoại trong game Egg Thief?',
];

export const AiThinkingAssistantModal: React.FC<AiThinkingAssistantModalProps> = ({
  isOpen,
  onClose,
  currentUnitTitle = 'Tiếng Anh Lớp 8 & Vào 10',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      thinking: 'Khởi động hệ thống tư duy Rồng Trí Tuệ AI. Sẵn sàng phân tích câu hỏi người học, suy luận logic ngữ pháp, từ vựng và chiến thuật thi cử mà không sử dụng câu trả lời mẫu.',
      answer: `Xin chào! Tôi là **Rồng Trí Tuệ AI (Dragon Sage AI)**.\n\nTôi có thể **suy nghĩ sâu sắc**, phân tích bản chất câu hỏi và giải đáp mọi thắc mắc của bạn về:\n- 📖 **Ngữ pháp & Từ vựng** tiếng Anh Lớp 8 (Global Success, Destination B1, đề thi vào 10)\n- 🎯 **Mẹo tránh bẫy đề thi**, cách đặt câu, dịch thuật, phát âm\n- 🐉 **Bí quyết đột nhập sào huyệt rồng**, ấp pet huyền thoại và vượt ải game\n- 💡 Bất kỳ câu hỏi nào bạn muốn tìm hiểu!\n\nHãy đặt câu hỏi bằng văn bản hoặc bấm micro để nói nhé!`,
      suggestedFollowUps: [
        'Phân biệt "although" và "in spite of"',
        'Mẹo chia động từ theo sau Gerund và To-Infinitive',
        'Cách dịch câu bị động tự nhiên nhất',
      ],
      timestamp: 'Vừa xong',
      isThinkingExpanded: false,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechLang, setSpeechLang] = useState<'vi-VN' | 'en-US'>('vi-VN');
  const [thinkingStage, setThinkingStage] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Animated thinking stage messages
  const thinkingStages = [
    '⚡ Đang tiếp nhận và mổ xẻ cấu trúc câu hỏi...',
    '🧠 Đang suy luận logic, phân tích ngữ cảnh & các quy tắc cốt lõi...',
    '🔍 Đang so sánh các phương án giải thích tối ưu & ví dụ thực tế...',
    '💡 Đang đúc kết câu trả lời chính xác và sinh động nhất...',
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setThinkingStage(0);
      interval = setInterval(() => {
        setThinkingStage((prev) => (prev + 1) % thinkingStages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || isLoading) return;

    setInput('');
    const userMsgId = 'user-' + Date.now();
    const newUserMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: question,
          history: messages,
          unitContext: currentUnitTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi từ server AI');
      }

      const aiMsgId = 'ai-' + Date.now();
      const newAiMsg: Message = {
        id: aiMsgId,
        sender: 'ai',
        thinking: data.thinking || 'Đã phân tích toàn diện yêu cầu và cấu trúc tri thức tương ứng.',
        answer: data.answer || 'Tôi đã tiếp nhận câu hỏi của bạn nhưng phản hồi bị trống.',
        suggestedFollowUps: Array.isArray(data.suggestedFollowUps) ? data.suggestedFollowUps : [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isThinkingExpanded: true, // Auto-expand thinking so user sees the AI thought process!
      };

      setMessages((prev) => [...prev, newAiMsg]);
      playSuccessChime();
    } catch (err: any) {
      playLaser();
      const errorMsgId = 'err-' + Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: errorMsgId,
          sender: 'ai',
          thinking: 'Lỗi phát sinh trong quá trình kết nối tới mô hình AI.',
          answer: `⚠️ **Không thể kết nối đến mô hình AI**: ${err.message || 'Lỗi mạng hoặc tải cao'}.\n\nVui lòng thử lại sau vài giây hoặc kiểm tra GEMINI_API_KEY trong Settings > Secrets!`,
          suggestedFollowUps: ['Thử lại câu hỏi vừa rồi', 'Hỏi câu hỏi khác'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isThinkingExpanded: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleThinking = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, isThinkingExpanded: !msg.isThinkingExpanded } : msg
      )
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(cleanText);
      utterance.lang = hasVietnamese ? 'vi-VN' : 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói qua Web Speech API.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = speechLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Bạn có chắc muốn làm mới cuộc trò chuyện với AI?')) {
      setMessages([
        {
          id: 'welcome-reset-' + Date.now(),
          sender: 'ai',
          thinking: 'Đã thiết lập lại phiên tư duy mới.',
          answer: 'Phiên trò chuyện đã được làm mới. Tôi sẵn sàng lắng nghe câu hỏi tiếp theo của bạn!',
          suggestedFollowUps: QUICK_PROMPTS.slice(0, 3),
          timestamp: 'Vừa xong',
          isThinkingExpanded: false,
        },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-indigo-500/80 rounded-3xl shadow-2xl shadow-indigo-950/80 flex flex-col h-[90vh] overflow-hidden text-white relative">
        {/* Top Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/90 gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-950/60 animate-pulse">
                🧠
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Rồng Trí Tuệ AI</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 font-extrabold text-xs sm:text-sm">
                    • Thinking Mode
                  </span>
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Gemini 3.8 Flash • Không Hardcode
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>Trí tuệ nhân tạo tư duy độc lập, suy nghĩ cặn kẽ trước khi trả lời.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Làm mới cuộc trò chuyện"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 bg-slate-950/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base shrink-0 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-amber-500 to-rose-600 text-white font-bold'
                    : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? '🧑‍🎓' : '🐉'}
              </div>

              {/* Bubble Content */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${
                  msg.sender === 'user' ? 'items-end text-right' : 'items-start text-left'
                }`}
              >
                {/* User Message */}
                {msg.sender === 'user' && (
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3.5 rounded-2xl rounded-tr-none text-xs sm:text-sm font-medium leading-relaxed shadow-lg">
                    {msg.text}
                    <div className="text-[10px] text-indigo-200 mt-1 text-right font-normal">
                      {msg.timestamp}
                    </div>
                  </div>
                )}

                {/* AI Message with Thinking Accordion */}
                {msg.sender === 'ai' && (
                  <div className="space-y-2">
                    {/* Thinking Accordion (Chain of Thought) */}
                    {msg.thinking && (
                      <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => toggleThinking(msg.id)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-950/60 to-indigo-950/40 hover:bg-purple-900/40 transition-colors cursor-pointer text-[11px] font-bold text-purple-300"
                        >
                          <div className="flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                            <span>Quá trình suy nghĩ của AI (Chain-of-Thought)</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-purple-400">
                            <span>{msg.isThinkingExpanded ? 'Thu gọn' : 'Xem suy nghĩ'}</span>
                            {msg.isThinkingExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </button>

                        {msg.isThinkingExpanded && (
                          <div className="p-3 bg-slate-950/70 border-t border-purple-500/20 text-xs text-purple-200/90 leading-relaxed font-mono whitespace-pre-wrap animate-fade-in border-l-2 border-l-purple-400">
                            {msg.thinking}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Official Answer */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs sm:text-sm text-slate-100 leading-relaxed shadow-xl space-y-2">
                      <div className="whitespace-pre-wrap">{msg.answer}</div>

                      {/* Footer Actions: Copy, Speak, Time */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSpeak(msg.answer || '')}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                            title="Nghe phát âm / đọc to câu trả lời"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopy(msg.answer || '', msg.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1"
                            title="Sao chép nội dung"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Suggested Follow-Ups */}
                    {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestedFollowUps.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(suggestion)}
                            className="px-2.5 py-1 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-[11px] text-indigo-300 hover:text-white transition-all cursor-pointer text-left flex items-center gap-1 active:scale-95"
                          >
                            <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Real-time Thinking Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-base shrink-0 shadow-lg animate-bounce">
                🧠
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-indigo-500/50 text-indigo-300 text-xs sm:text-sm space-y-2 shadow-2xl">
                <div className="flex items-center gap-2 font-bold text-indigo-400">
                  <Brain className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Rồng Trí Tuệ đang suy nghĩ logic...</span>
                </div>
                <div className="text-xs text-slate-300 font-mono flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
                  <span>{thinkingStages[thinkingStage]}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts Bar */}
        <div className="px-3 sm:px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            Gợi ý:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950 hover:border-indigo-500/50 border border-slate-800 text-[11px] text-slate-300 hover:text-indigo-200 transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
        >
          {/* Voice Input Button & Language Selector */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isRecording ? 'Đang lắng nghe... bấm để dừng' : `Bấm để nói (${speechLang === 'vi-VN' ? 'Tiếng Việt' : 'English'})`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setSpeechLang((prev) => (prev === 'vi-VN' ? 'en-US' : 'vi-VN'))}
              className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer transition-all"
              title="Đổi ngôn ngữ nhận diện giọng nói"
            >
              {speechLang === 'vi-VN' ? '🇻🇳 VN' : '🇬🇧 EN'}
            </button>
          </div>

          {/* Text Input */}
          <input
            type="text"
            placeholder="Hỏi AI bất kỳ điều gì (ngữ pháp, từ vựng, mẹo thi, chiến thuật game...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-950/60 active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Hỏi AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
