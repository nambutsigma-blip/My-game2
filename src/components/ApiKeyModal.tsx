import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertCircle, X, ExternalLink, ShieldCheck, Eye, EyeOff, RefreshCw, Trash2, Sparkles, Cpu } from 'lucide-react';
import { getCustomApiKey, setCustomApiKey, validateApiKey } from '../utils/aiClientHelper';
import { playSuccessChime, playLaser } from '../utils/soundEffects';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: (hasKey: boolean) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid?: boolean; message?: string } | null>(null);
  const [currentActiveKey, setCurrentActiveKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = getCustomApiKey();
      setApiKeyInput(saved);
      setCurrentActiveKey(saved);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = apiKeyInput.trim();
    setCustomApiKey(trimmed);
    setCurrentActiveKey(trimmed);
    playSuccessChime();
    setTestResult({
      valid: true,
      message: trimmed
        ? 'Đã lưu API Key cá nhân thành công! Tất cả tính năng AI luyện nói, phân tích ngữ pháp sẽ dùng key này.'
        : 'Đã chuyển về sử dụng hệ thống AI mặc định của máy chủ.',
    });
    if (onKeySaved) {
      onKeySaved(!!trimmed);
    }
  };

  const handleClear = () => {
    setApiKeyInput('');
    setCustomApiKey('');
    setCurrentActiveKey('');
    playSuccessChime();
    setTestResult({
      valid: true,
      message: 'Đã xóa API Key cá nhân. Trò chơi sẽ sử dụng hệ thống AI Studio mặc định.',
    });
    if (onKeySaved) {
      onKeySaved(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await validateApiKey(apiKeyInput.trim() || undefined);
      setTestResult(res);
      if (res.valid) {
        playSuccessChime();
      } else {
        playLaser();
      }
    } catch (e: any) {
      setTestResult({
        valid: false,
        message: 'Lỗi kiểm tra kết nối: ' + (e?.message || 'Không thể gọi API'),
      });
      playLaser();
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-950/40 overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-950/50">
              <Key className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Cấu Hình API Keys AI</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
                  Gemini AI
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tối ưu hóa tốc độ, độ ổn định và hạn ngạch trên mọi thiết bị
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-sm">
          {/* Active Status Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              currentActiveKey
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                currentActiveKey ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
              }`}
            >
              {currentActiveKey ? <ShieldCheck className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider">
                {currentActiveKey ? 'Trạng Thái: Key Cá Nhân' : 'Trạng Thái: Hệ Thống Mặc Định'}
              </div>
              <div className="text-xs opacity-90 truncate">
                {currentActiveKey
                  ? `Đang sử dụng key cá nhân (${currentActiveKey.slice(0, 6)}••••${currentActiveKey.slice(-4)})`
                  : 'Đang kết nối qua proxy máy chủ (Sẵn sàng phục vụ miễn phí)'}
              </div>
            </div>
          </div>

          {/* Input field */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <span className="text-[11px] font-normal text-amber-400 lowercase">
                bắt đầu bằng AIzaSy...
              </span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Dán API Key cá nhân của bạn vào đây..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 pr-20 text-sm text-white placeholder-slate-500 font-mono transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showKey ? 'Ẩn key' : 'Hiện key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Key được mã hóa và lưu an toàn tại bộ nhớ thiết bị của bạn (localStorage), tự động gửi qua proxy bảo mật của máy chủ.
            </p>
          </div>

          {/* Test connection alert */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                testResult.valid
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}
            >
              {testResult.valid ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div className="leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm cursor-pointer transition-all active:scale-95 shadow-lg shadow-amber-950/50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu & Áp Dụng</span>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm Tra Kết Nối'}</span>
            </button>

            {currentActiveKey && (
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 font-bold text-xs cursor-pointer transition-all active:scale-95"
                title="Xóa key cá nhân và dùng lại mặc định"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa Key</span>
              </button>
            )}
          </div>

          {/* Guide & Free Key instructions */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Làm sao để lấy Gemini API Key miễn phí?</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
              <li>Truy cập cổng Google AI Studio: <code className="text-amber-300">aistudio.google.com/apikey</code></li>
              <li>Đăng nhập bằng tài khoản Google của bạn và nhấn <strong>Create API key</strong>.</li>
              <li>Sao chép mã Key và dán vào ô bên trên rồi nhấn <strong>Lưu & Áp Dụng</strong>.</li>
            </ol>
            <div className="pt-1">
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
              >
                <span>Mở Google AI Studio để lấy Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Hỗ trợ Gemini 3.1 Flash-Lite & Gemini Flash</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
