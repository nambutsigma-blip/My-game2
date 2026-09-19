import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Zap,
  Sparkles,
  ExternalLink,
  Globe,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AppUser,
  loginWithGoogle,
  loginWithFastCloud,
  logoutUser,
  syncPlayerToFirestore,
} from '../utils/authHelper';
import { playSuccessChime, playAlertUp, playLaser } from '../utils/soundEffects';
import { PetCompanion, SkillTreeState } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onUserChange: (user: AppUser | null) => void;
  accountName: string;
  hatchedPets?: PetCompanion[];
  dragonCrystals?: number;
  skillTreeState?: SkillTreeState | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  accountName,
  hatchedPets = [],
  dragonCrystals = 0,
  skillTreeState = null,
}) => {
  const [authTab, setAuthTab] = useState<'fast' | 'google' | 'profile'>('fast');
  const [fastName, setFastName] = useState(accountName || '');
  const [fastEmail, setFastEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [unauthorizedDomainInfo, setUnauthorizedDomainInfo] = useState<{
    domain: string;
    details: string;
  } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSyncStatus(null);
      if (currentUser) {
        setAuthTab('profile');
      } else {
        setFastName(accountName || 'Nhà Thám Hiểm');
        // If external domain, default to fast login tab
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
        if (currentDomain.includes('run.app') || currentDomain.includes('asia-east1')) {
          setAuthTab('fast');
        }
      }
    }
  }, [isOpen, currentUser, accountName]);

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setUnauthorizedDomainInfo(null);
      playAlertUp();

      const result = await loginWithGoogle();

      if (result.success && result.user) {
        onUserChange(result.user);
        await syncPlayerToFirestore(result.user, {
          accountName: result.user.displayName || accountName,
          hatchedPets,
          dragonCrystals,
          skillTreeState,
        });
        playSuccessChime();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setSyncStatus('Đăng nhập Google thành công! Dữ liệu đã đồng bộ Cloud.');
        setAuthTab('profile');
      } else if (result.error) {
        if (result.error.isUnauthorizedDomain) {
          setUnauthorizedDomainInfo({
            domain: result.error.currentDomain || currentDomain,
            details:
              'Tên miền triển khai bên ngoài này chưa được thêm vào mục Authorized Domains của dự án Firebase Console.',
          });
          setErrorMessage(
            'Không thể dùng Google OAuth trên tên miền ngoài do Firebase chặn origin. Vui lòng sử dụng Đăng Nhập Nhanh bên dưới để vào game ngay lập tức!'
          );
        } else if (result.error.isPopupBlocked) {
          setErrorMessage(
            'Trình duyệt đã chặn cửa sổ bật lên (popup) của Google. Vui lòng cho phép popup hoặc sử dụng Đăng Nhập Nhanh.'
          );
        } else {
          setErrorMessage(`Đăng nhập Google thất bại: ${result.error.message}`);
        }
      }
    } catch (e: any) {
      setErrorMessage(`Lỗi: ${e.message || 'Không thể kết nối dịch vụ xác thực'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = fastName.trim();
    if (!trimmedName) {
      setErrorMessage('Vui lòng nhập tên tài khoản hoặc biệt danh.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      playAlertUp();

      const user = await loginWithFastCloud(trimmedName, fastEmail || undefined);
      onUserChange(user);

      await syncPlayerToFirestore(user, {
        accountName: trimmedName,
        hatchedPets,
        dragonCrystals,
        skillTreeState,
      });

      playSuccessChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setSyncStatus('Đăng nhập Cloud thành công! Bạn có thể chơi Online và nhận/gửi quà.');
      setAuthTab('profile');
    } catch (e: any) {
      setErrorMessage(`Lỗi đăng nhập: ${e.message || 'Không thể tạo phiên người chơi'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      playLaser();
      await logoutUser();
      onUserChange(null);
      setAuthTab('fast');
      setSyncStatus('Đã đăng xuất tài khoản.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncCloud = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      await syncPlayerToFirestore(currentUser, {
        accountName: currentUser.displayName || accountName,
        hatchedPets,
        dragonCrystals,
        skillTreeState,
      });
      playSuccessChime();
      setSyncStatus('Đồng bộ Cloud Firestore thành công lúc ' + new Date().toLocaleTimeString());
    } catch (e: any) {
      setErrorMessage('Lỗi đồng bộ: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCurrentDomain = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md font-black text-sm">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xác Thực & Tài Khoản Cloud</h3>
              <p className="text-[11px] text-slate-400">Đăng nhập để lưu tiến độ, chơi Online và tặng quà</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        {!currentUser && (
          <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/30 text-xs font-bold">
            <button
              onClick={() => {
                setAuthTab('fast');
                setErrorMessage('');
              }}
              className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                authTab === 'fast'
                  ? 'border-b-2 border-amber-500 text-amber-300 bg-amber-950/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Đăng Nhập Nhanh (100% OK)</span>
            </button>
            <button
              onClick={() => {
                setAuthTab('google');
                setErrorMessage('');
              }}
              className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                authTab === 'google'
                  ? 'border-b-2 border-indigo-500 text-indigo-300 bg-indigo-950/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google OAuth</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Active Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-600/50 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-rose-300">Thông báo đăng nhập:</div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Unauthorized Domain Diagnostic Box */}
          {unauthorizedDomainInfo && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Giải thích kỹ thuật (auth/unauthorized-domain):</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Khi triển khai ứng dụng trên Cloud Run (`run.app`), Firebase yêu cầu người quản trị phải cấp quyền cho domain này trong Firebase Console.
              </p>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-amber-500/30 text-[11px]">
                <code className="text-amber-300 truncate">{unauthorizedDomainInfo.domain}</code>
                <button
                  onClick={copyCurrentDomain}
                  className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center gap-1 font-bold shrink-0 transition-colors"
                >
                  {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDomain ? 'Đã sao chép' : 'Copy Domain'}</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setAuthTab('fast');
                  setErrorMessage('');
                  handleFastAuth();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Đăng Nhập Nhanh Bằng Tên Của Bạn Ngay (Không cần chờ Google)</span>
              </button>
            </div>
          )}

          {/* Sync Status Banner */}
          {syncStatus && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* TAB 1: FAST CLOUD LOGIN */}
          {!currentUser && authTab === 'fast' && (
            <form onSubmit={handleFastAuth} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chế độ Đăng Nhập Tức Thì (Không bị lỗi popup hay tên miền)</span>
                </div>
                <p>
                  Hoạt động 100% ổn định trên mọi thiết bị, điện thoại và bản chia sẻ ngoài (`.run.app`). Dữ liệu được đồng bộ trực tiếp lên Cloud Firestore.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tên người chơi / Biệt danh:</span>
                </label>
                <input
                  type="text"
                  value={fastName}
                  onChange={(e) => setFastName(e.target.value)}
                  placeholder="Ví dụ: Nam Sigma, Thợ Săn B1..."
                  maxLength={25}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Email (Tùy chọn - để bạn bè gửi quà qua email):</span>
                  <span className="text-[10px] text-slate-500 font-normal">Không bắt buộc</span>
                </label>
                <input
                  type="email"
                  value={fastEmail}
                  onChange={(e) => setFastEmail(e.target.value)}
                  placeholder="Ví dụ: player@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{isLoading ? 'Đang đồng bộ Cloud...' : 'Đăng Nhập Ngay & Kích Hoạt Cloud'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: GOOGLE OAUTH LOGIN */}
          {!currentUser && authTab === 'google' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-[11px] text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-xs">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Đăng Nhập Bằng Google Account</span>
                </div>
                <p>
                  Sử dụng tài khoản Google chính chủ. Lưu ý: Phiên bản mở ngoài (`.run.app`) cần được cấp quyền trong Firebase Console, nếu lỗi hãy dùng Đăng Nhập Nhanh.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Đang mở Google Sign-In...' : 'Đăng Nhập Bằng Tài Khoản Google'}</span>
              </button>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Tên miền hiện tại:</div>
                <div className="font-mono text-[10px] text-amber-400 break-all">{currentDomain}</div>
              </div>
            </div>
          )}

          {/* TAB 3: LOGGED IN USER PROFILE */}
          {currentUser && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <img
                  src={currentUser.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-amber-500/40 object-cover shadow"
                />
                <div className="overflow-hidden">
                  <div className="font-black text-sm text-white flex items-center gap-1.5">
                    <span className="truncate">{currentUser.displayName || 'Nhà Thám Hiểm'}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
                      Cloud Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser.email || 'Cloud Player'}</div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">UID: {currentUser.uid}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">Phương thức</div>
                  <div className="text-xs font-bold text-amber-300 mt-0.5">
                    {currentUser.authProvider === 'google' ? 'Google OAuth' : 'Cloud Fast Login'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">Trạng thái Cloud</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Đã kết nối</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSyncCloud}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Đồng Bộ Cloud</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="py-2.5 px-4 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700/40 text-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dữ liệu lưu an toàn trên Firestore</span>
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
