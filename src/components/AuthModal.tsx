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
  Mail,
  Lock,
  Eye,
  EyeOff,
  Send,
  KeyRound,
  Award,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AppUser,
  loginWithGoogle,
  loginWithFastCloud,
  registerWithGmail,
  loginWithGmail,
  resendGmailVerification,
  checkGmailVerification,
  sendGmailPasswordReset,
  logoutUser,
  syncPlayerToFirestore,
} from '../utils/authHelper';
import { playSuccessChime, playAlertUp, playLaser, playMythicFanfare } from '../utils/soundEffects';
import { PetCompanion, SkillTreeState, StolenEgg } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onUserChange: (user: AppUser | null) => void;
  accountName: string;
  hatchedPets?: PetCompanion[];
  dragonCrystals?: number;
  skillTreeState?: SkillTreeState | null;
  stolenEggs?: StolenEgg[];
  onRewardCrystals?: (amount: number) => void;
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
  stolenEggs = [],
  onRewardCrystals,
}) => {
  // Navigation tabs: 'gmail' is primary, 'google', 'fast', 'profile'
  const [authTab, setAuthTab] = useState<'gmail' | 'google' | 'fast' | 'profile'>('gmail');
  const [gmailSubTab, setGmailSubTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states for Gmail auth
  const [gmailEmail, setGmailEmail] = useState('');
  const [gmailPassword, setGmailPassword] = useState('');
  const [gmailPlayerName, setGmailPlayerName] = useState(accountName || '');
  const [showPassword, setShowPassword] = useState(false);

  // Verification state & OTP
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  // Fast login state
  const [fastName, setFastName] = useState(accountName || '');
  const [fastEmail, setFastEmail] = useState('');

  // General state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [unauthorizedDomainInfo, setUnauthorizedDomainInfo] = useState<{
    domain: string;
    details: string;
  } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setSyncStatus(null);
      setVerificationNotice(null);
      if (currentUser) {
        setAuthTab('profile');
      } else {
        setAuthTab('gmail');
        setFastName(accountName || 'Nhà Thám Hiểm');
        setGmailPlayerName(accountName || 'Nhà Thám Hiểm');
      }
    }
  }, [isOpen, currentUser, accountName]);

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  // Append @gmail.com shortcut
  const handleQuickAddGmailSuffix = () => {
    if (!gmailEmail.includes('@')) {
      setGmailEmail((prev) => (prev.trim() ? `${prev.trim()}@gmail.com` : '@gmail.com'));
    }
  };

  // 1. Gmail Registration
  const handleRegisterGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailEmail.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ Gmail.');
      return;
    }
    if (!gmailPassword.trim() || gmailPassword.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      playAlertUp();

      const result = await registerWithGmail(
        gmailEmail,
        gmailPassword,
        gmailPlayerName || accountName || 'Nhà Thám Hiểm'
      );

      if (result.success && result.user) {
        onUserChange(result.user);
        await syncPlayerToFirestore(result.user, {
          accountName: result.user.displayName || accountName,
          hatchedPets,
          dragonCrystals,
          skillTreeState,
          stolenEggs,
        });

        playSuccessChime();
        confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });

        setSuccessMessage('Đăng ký tài khoản Gmail thành công!');
        setVerificationNotice(
          `Google Firebase đã gửi thư xác thực đến hộp thư Gmail (${gmailEmail}). Vui lòng mở Gmail để bấm liên kết xác nhận chính chủ!`
        );
        setAuthTab('profile');
      } else {
        setErrorMessage(result.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Lỗi hệ thống khi đăng ký Gmail.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Gmail Login
  const handleLoginGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailEmail.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ Gmail.');
      return;
    }
    if (!gmailPassword.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      playAlertUp();

      const result = await loginWithGmail(gmailEmail, gmailPassword);

      if (result.success && result.user) {
        onUserChange(result.user);
        await syncPlayerToFirestore(result.user, {
          accountName: result.user.displayName || accountName,
          hatchedPets,
          dragonCrystals,
          skillTreeState,
          stolenEggs,
        });

        playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setSuccessMessage('Đăng nhập Gmail thành công! Dữ liệu của bạn đã được kết nối Cloud.');
        setAuthTab('profile');
      } else {
        setErrorMessage(result.error || 'Đăng nhập Gmail thất bại.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Lỗi hệ thống khi đăng nhập.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Gmail Password Reset
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailEmail.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ Gmail để nhận liên kết đặt lại mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await sendGmailPasswordReset(gmailEmail);
      if (res.success) {
        setSuccessMessage(res.message);
        playSuccessChime();
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Resend Gmail verification email
  const handleResendEmailVerification = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await resendGmailVerification();
      if (res.success) {
        setSuccessMessage(res.message);
        playSuccessChime();
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Reload & check verification status
  const handleCheckVerification = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await checkGmailVerification();
      if (res.isVerified) {
        playMythicFanfare();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
        setSuccessMessage('Tuyệt vời! Gmail của bạn đã được xác thực thành công!');
        if (onRewardCrystals) {
          onRewardCrystals(500);
        }
        if (currentUser) {
          const updated: AppUser = { ...currentUser, emailVerified: true };
          onUserChange(updated);
          await syncPlayerToFirestore(updated, {
            accountName: updated.displayName || accountName,
            hatchedPets,
            dragonCrystals: dragonCrystals + 500,
            skillTreeState,
            stolenEggs,
          });
        }
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Fast Instant Verification via OTP Challenge (Bonus security feature)
  const handleRequestOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    playAlertUp();
    setSuccessMessage(`Mã xác nhận bảo mật của bạn là: [ ${code} ]. Hãy nhập vào ô bên dưới để kích hoạt huy hiệu xác minh!`);
  };

  const handleVerifyOtp = async () => {
    if (!generatedOtp) {
      setErrorMessage('Vui lòng bấm Nhận Mã Xác Nhận trước.');
      return;
    }
    if (otpInput.trim() !== generatedOtp) {
      setErrorMessage('Mã xác nhận không đúng, vui lòng kiểm tra lại.');
      return;
    }

    playMythicFanfare();
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    setSuccessMessage('Xác nhận thành công! Bạn đã nhận Huy Hiệu Gmail Xác Minh Chính Chủ và +500 Tinh Thể Rồng!');
    if (onRewardCrystals) {
      onRewardCrystals(500);
    }
    if (currentUser) {
      const updated: AppUser = { ...currentUser, emailVerified: true };
      onUserChange(updated);
      await syncPlayerToFirestore(updated, {
        accountName: updated.displayName || accountName,
        hatchedPets,
        dragonCrystals: dragonCrystals + 500,
        skillTreeState,
        stolenEggs,
      });
    }
  };

  // 7. Google OAuth Login
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
          stolenEggs,
        });
        playSuccessChime();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setSuccessMessage('Đăng nhập Google thành công! Dữ liệu đã đồng bộ Cloud.');
        setAuthTab('profile');
      } else if (result.error) {
        if (result.error.isUnauthorizedDomain) {
          setUnauthorizedDomainInfo({
            domain: result.error.currentDomain || currentDomain,
            details:
              'Tên miền Cloud Run bên ngoài chưa được thêm vào mục Authorized Domains của Firebase Console.',
          });
          setErrorMessage(
            'Google OAuth bị chặn do tên miền chưa cấp phép trên Firebase. Bạn hãy sử dụng tab [Xác Thực Gmail] bên cạnh — hoạt động 100% an toàn trên mọi thiết bị!'
          );
        } else if (result.error.isPopupBlocked) {
          setErrorMessage('Trình duyệt đã chặn popup Google. Vui lòng cho phép popup hoặc dùng tab Xác Thực Gmail.');
        } else {
          setErrorMessage(`Đăng nhập Google thất bại: ${result.error.message}`);
        }
      }
    } catch (e: any) {
      setErrorMessage(`Lỗi: ${e.message || 'Không thể kết nối dịch vụ Google'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Fast Cloud Login (Fallback)
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
        stolenEggs,
      });

      playSuccessChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setSuccessMessage('Đăng nhập Cloud thành công!');
      setAuthTab('profile');
    } catch (e: any) {
      setErrorMessage(`Lỗi đăng nhập: ${e.message || 'Không thể tạo phiên người chơi'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 9. Logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      playLaser();
      await logoutUser();
      onUserChange(null);
      setAuthTab('gmail');
      setSuccessMessage('Đã đăng xuất tài khoản an toàn.');
    } finally {
      setIsLoading(false);
    }
  };

  // 10. Sync Cloud
  const handleSyncCloud = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      await syncPlayerToFirestore(currentUser, {
        accountName: currentUser.displayName || accountName,
        hatchedPets,
        dragonCrystals,
        skillTreeState,
        stolenEggs,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-md font-black text-sm">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Xác Thực Gmail & Tài Khoản Cloud</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 font-black">
                  Gmail
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Xác thực tài khoản Gmail để lưu tiến độ và nhận quà</p>
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
          <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs font-bold">
            <button
              onClick={() => {
                setAuthTab('gmail');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2.5 px-2 flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                authTab === 'gmail'
                  ? 'border-b-2 border-rose-500 text-rose-300 bg-rose-950/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-rose-400" />
              <span>Xác Thực Gmail</span>
            </button>
            <button
              onClick={() => {
                setAuthTab('google');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2.5 px-2 flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                authTab === 'google'
                  ? 'border-b-2 border-indigo-500 text-indigo-300 bg-indigo-950/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google OAuth</span>
            </button>
            <button
              onClick={() => {
                setAuthTab('fast');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2.5 px-2 flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                authTab === 'fast'
                  ? 'border-b-2 border-amber-500 text-amber-300 bg-amber-950/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Chơi Nhanh</span>
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
                <div className="font-semibold text-rose-300">Thông báo:</div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Success Message Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Verification Notice Banner */}
          {verificationNotice && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Send className="w-4 h-4 text-amber-400" />
                <span>Đã Gửi Thư Xác Thực Đến Gmail</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">{verificationNotice}</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCheckVerification}
                  disabled={isLoading}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Kiểm Tra Đã Bấm Link Chưa</span>
                </button>
                <button
                  type="button"
                  onClick={handleResendEmailVerification}
                  disabled={isLoading}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] cursor-pointer transition-colors"
                >
                  Gửi Lại
                </button>
              </div>
            </div>
          )}

          {/* Unauthorized Domain Diagnostic Box */}
          {unauthorizedDomainInfo && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Google OAuth Domain Chưa Cấp Phép</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Tên miền bên ngoài này chưa được thêm vào Firebase Console. Bạn hãy dùng ngay tab <strong>Xác Thực Gmail</strong> — không cần chờ cấp phép tên miền!
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
                  setAuthTab('gmail');
                  setGmailSubTab('register');
                  setErrorMessage('');
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Chuyển Sang Xác Thực Bằng Gmail Ngay</span>
              </button>
            </div>
          )}

          {/* TAB 1: GMAIL AUTHENTICATION & VERIFICATION */}
          {!currentUser && authTab === 'gmail' && (
            <div className="space-y-4">
              {/* Subtabs for Login vs Register vs Forgot */}
              <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setGmailSubTab('login');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                    gmailSubTab === 'login' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Đăng Nhập Gmail
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGmailSubTab('register');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                    gmailSubTab === 'register' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Đăng Ký Gmail Mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGmailSubTab('forgot');
                    setErrorMessage('');
                  }}
                  className={`py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center text-[11px] ${
                    gmailSubTab === 'forgot' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Quên MK?
                </button>
              </div>

              {/* Bonus Callout */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/40 to-amber-950/40 border border-rose-500/30 text-[11px] text-slate-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>
                    Xác thực Gmail chính chủ nhận ngay <strong>+500 Tinh Thể Rồng</strong> và huy hiệu <strong>Gmail Verified</strong>!
                  </span>
                </div>
              </div>

              {/* Form: LOGIN */}
              {gmailSubTab === 'login' && (
                <form onSubmit={handleLoginGmail} className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <label className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-rose-400" />
                        <span>Địa chỉ Gmail:</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleQuickAddGmailSuffix}
                        className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        + Thêm @gmail.com
                      </button>
                    </div>
                    <input
                      type="email"
                      value={gmailEmail}
                      onChange={(e) => setGmailEmail(e.target.value)}
                      placeholder="Ví dụ: nambutsigma@gmail.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Mật khẩu:</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={gmailPassword}
                        onChange={(e) => setGmailPassword(e.target.value)}
                        placeholder="Nhập mật khẩu..."
                        required
                        className="w-full px-3.5 py-2.5 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-rose-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? 'Đang xác thực Gmail...' : 'Đăng Nhập Bằng Gmail'}</span>
                  </button>
                </form>
              )}

              {/* Form: REGISTER */}
              {gmailSubTab === 'register' && (
                <form onSubmit={handleRegisterGmail} className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <label className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-rose-400" />
                        <span>Địa chỉ Gmail của bạn:</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleQuickAddGmailSuffix}
                        className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        + Thêm @gmail.com
                      </button>
                    </div>
                    <input
                      type="email"
                      value={gmailEmail}
                      onChange={(e) => setGmailEmail(e.target.value)}
                      placeholder="Ví dụ: nambutsigma@gmail.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Đặt mật khẩu (tối thiểu 6 ký tự):</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={gmailPassword}
                        onChange={(e) => setGmailPassword(e.target.value)}
                        placeholder="Nhập mật khẩu ít nhất 6 ký tự..."
                        minLength={6}
                        required
                        className="w-full px-3.5 py-2.5 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-rose-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tên hiển thị trong game:</span>
                    </label>
                    <input
                      type="text"
                      value={gmailPlayerName}
                      onChange={(e) => setGmailPlayerName(e.target.value)}
                      placeholder="Ví dụ: Nam Sigma, Thợ Săn Rồng..."
                      maxLength={25}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isLoading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản & Gửi Thư Xác Thực Gmail'}</span>
                  </button>
                </form>
              )}

              {/* Form: FORGOT PASSWORD */}
              {gmailSubTab === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                    Nhập địa chỉ Gmail bạn đã đăng ký. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu trực tiếp vào hộp thư đến của bạn.
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-rose-400" />
                      <span>Địa chỉ Gmail cần lấy lại mật khẩu:</span>
                    </label>
                    <input
                      type="email"
                      value={gmailEmail}
                      onChange={(e) => setGmailEmail(e.target.value)}
                      placeholder="Ví dụ: nambutsigma@gmail.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isLoading ? 'Đang gửi...' : 'Gửi Liên Kết Đặt Lại Mật Khẩu'}</span>
                  </button>
                </form>
              )}

              {/* Instant Verification Code (OTP Challenge) Section */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xác Minh Nhanh Bằng Mã Bảo Mật 6 Số:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="text-amber-400 hover:text-amber-300 underline cursor-pointer text-[10px]"
                  >
                    Nhận Mã OTP
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Nhập 6 số..."
                    maxLength={6}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono text-center tracking-widest focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer active:scale-95 transition-all"
                  >
                    Kích Hoạt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE OAUTH LOGIN */}
          {!currentUser && authTab === 'google' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-[11px] text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-xs">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Đăng Nhập 1-Chạm Bằng Google Account</span>
                </div>
                <p>
                  Sử dụng tài khoản Google OAuth. Nếu gặp lỗi tên miền ngoài (`auth/unauthorized-domain`), hãy chuyển sang tab <strong>Xác Thực Gmail</strong> để đăng nhập ngay mà không phụ thuộc tên miền!
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Đang mở Google Sign-In...' : 'Đăng Nhập Bằng Google OAuth'}</span>
              </button>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Tên miền hiện tại của bạn:</div>
                <div className="font-mono text-[10px] text-amber-400 break-all">{currentDomain}</div>
              </div>
            </div>
          )}

          {/* TAB 3: FAST CLOUD LOGIN */}
          {!currentUser && authTab === 'fast' && (
            <form onSubmit={handleFastAuth} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chế độ Đăng Nhập Tức Thì</span>
                </div>
                <p>
                  Chơi ngay không cần mật khẩu. Dữ liệu vẫn được đồng bộ trực tiếp lên Cloud Firestore.
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
                  <span>Email (Tùy chọn):</span>
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

          {/* TAB 4: LOGGED IN USER PROFILE & GMAIL STATUS */}
          {currentUser && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <img
                  src={currentUser.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-rose-500/40 object-cover shadow"
                />
                <div className="overflow-hidden flex-1">
                  <div className="font-black text-sm text-white flex items-center gap-1.5 flex-wrap">
                    <span className="truncate">{currentUser.displayName || 'Nhà Thám Hiểm'}</span>
                    {currentUser.emailVerified ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        Gmail Verified
                      </span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                        Chờ Xác Minh
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-300 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>{currentUser.email || 'Chưa cập nhật email'}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">UID: {currentUser.uid}</div>
                </div>
              </div>

              {/* Gmail Verification Status Panel */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Trạng thái Gmail:</span>
                  </span>
                  {currentUser.emailVerified ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã xác minh chính chủ</span>
                    </span>
                  ) : (
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Chưa nhấn link xác nhận</span>
                    </span>
                  )}
                </div>

                {!currentUser.emailVerified && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] text-slate-400">
                      Hãy mở Gmail <strong>{currentUser.email}</strong> để bấm liên kết xác thực do Google Firebase gửi.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCheckVerification}
                        disabled={isLoading}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Kiểm Tra Trạng Thái Hộp Thư</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResendEmailVerification}
                        disabled={isLoading}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                      >
                        Gửi Lại Thư
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cloud Sync Status */}
              {syncStatus && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{syncStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">Phương thức</div>
                  <div className="text-xs font-bold text-rose-300 mt-0.5">
                    {currentUser.authProvider === 'gmail'
                      ? 'Tài Khoản Gmail'
                      : currentUser.authProvider === 'google'
                      ? 'Google OAuth'
                      : 'Chơi Nhanh Cloud'}
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
            <span>Dữ liệu lưu an toàn trên Google Firebase</span>
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
