import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  db,
  doc,
  setDoc,
  serverTimestamp,
} from '../lib/firebase';
import { PetCompanion, SkillTreeState, StolenEgg } from '../types';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  authProvider: 'google' | 'cloud_fast' | 'gmail';
  emailVerified?: boolean;
  createdAt?: string;
}

const STORAGE_KEY = 'egg_thief_cloud_user_session';

/**
 * Generate a deterministic or persistent UID for cloud fast login
 */
function generateFastUid(name: string, email?: string): string {
  const seed = (email || name).toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
  return `cloud_${cleanName || 'thief'}_${Math.abs(hash).toString(36)}`;
}

/**
 * Retrieve stored user session from localStorage
 */
export function getStoredUser(): AppUser | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as AppUser;
  } catch (e) {
    console.warn('Failed to parse stored user:', e);
    return null;
  }
}

/**
 * Persist user session to localStorage
 */
export function saveStoredUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to save user to storage:', e);
  }
}

/**
 * Create or log in with Fast Cloud account (fallback mode)
 */
export async function loginWithFastCloud(
  name: string,
  email?: string,
  avatarSeed?: string
): Promise<AppUser> {
  const trimmedName = name.trim() || 'Nhà Thám Hiểm';
  const trimmedEmail = email?.trim() || `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@eggthief.cloud`;
  const uid = generateFastUid(trimmedName, trimmedEmail);
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(avatarSeed || trimmedName)}`;

  const user: AppUser = {
    uid,
    displayName: trimmedName,
    email: trimmedEmail,
    photoURL: avatar,
    authProvider: 'cloud_fast',
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };

  saveStoredUser(user);
  localStorage.setItem('egg_thief_player_name', trimmedName);

  return user;
}

/**
 * Register a new account with Gmail / Email & Password, and immediately send verification email
 */
export async function registerWithGmail(
  email: string,
  pass: string,
  name: string
): Promise<{ success: boolean; user?: AppUser; error?: string; verificationSent?: boolean }> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPass = pass.trim();
  const trimmedName = name.trim() || 'Nhà Thám Hiểm';

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return { success: false, error: 'Vui lòng nhập địa chỉ Gmail / Email hợp lệ (ví dụ: yourname@gmail.com).' };
  }
  if (trimmedPass.length < 6) {
    return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
    const fbUser = cred.user;

    // Update display name
    await updateProfile(fbUser, { displayName: trimmedName });

    // Send official verification email via Firebase
    let verificationSent = false;
    try {
      await sendEmailVerification(fbUser);
      verificationSent = true;
    } catch (verErr) {
      console.warn('Could not auto-send verification email:', verErr);
    }

    const appUser: AppUser = {
      uid: fbUser.uid,
      displayName: trimmedName,
      email: trimmedEmail,
      photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`,
      authProvider: 'gmail',
      emailVerified: fbUser.emailVerified,
      createdAt: new Date().toISOString(),
    };

    saveStoredUser(appUser);
    localStorage.setItem('egg_thief_player_name', trimmedName);

    return {
      success: true,
      user: appUser,
      verificationSent,
    };
  } catch (err: any) {
    let msg = err?.message || 'Không thể đăng ký tài khoản Gmail';
    if (err?.code === 'auth/email-already-in-use') {
      msg = 'Địa chỉ Gmail này đã được đăng ký. Vui lòng chuyển sang tab Đăng Nhập hoặc chọn Quên Mật Khẩu.';
    } else if (err?.code === 'auth/weak-password') {
      msg = 'Mật khẩu quá yếu, vui lòng đặt mật khẩu ít nhất 6 ký tự.';
    } else if (err?.code === 'auth/invalid-email') {
      msg = 'Địa chỉ Gmail không hợp lệ.';
    }
    return { success: false, error: msg };
  }
}

/**
 * Log in with existing Gmail / Email & Password
 */
export async function loginWithGmail(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPass = pass.trim();

  if (!trimmedEmail) {
    return { success: false, error: 'Vui lòng nhập địa chỉ Gmail.' };
  }
  if (!trimmedPass) {
    return { success: false, error: 'Vui lòng nhập mật khẩu.' };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
    const fbUser = cred.user;

    // Reload to get fresh emailVerified status
    try {
      await fbUser.reload();
    } catch {}

    const appUser: AppUser = {
      uid: fbUser.uid,
      displayName: fbUser.displayName || 'Nhà Thám Hiểm',
      email: fbUser.email,
      photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`,
      authProvider: 'gmail',
      emailVerified: auth.currentUser?.emailVerified ?? fbUser.emailVerified,
      createdAt: new Date().toISOString(),
    };

    saveStoredUser(appUser);
    if (appUser.displayName) {
      localStorage.setItem('egg_thief_player_name', appUser.displayName);
    }

    return {
      success: true,
      user: appUser,
    };
  } catch (err: any) {
    let msg = err?.message || 'Đăng nhập Gmail thất bại';
    if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
      msg = 'Gmail hoặc mật khẩu không chính xác. Nếu chưa có tài khoản, vui lòng chọn Đăng Ký Gmail.';
    } else if (err?.code === 'auth/wrong-password') {
      msg = 'Mật khẩu không chính xác. Hãy bấm Quên Mật Khẩu để lấy lại.';
    } else if (err?.code === 'auth/too-many-requests') {
      msg = 'Quá nhiều lần thử thất bại. Vui lòng thử lại sau vài phút hoặc đặt lại mật khẩu.';
    }
    return { success: false, error: msg };
  }
}

/**
 * Resend official Firebase verification email to current user's Gmail
 */
export async function resendGmailVerification(): Promise<{ success: boolean; message: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { success: false, message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập Gmail trước.' };
  }

  try {
    await sendEmailVerification(currentUser);
    return {
      success: true,
      message: `Đã gửi thư xác thực đến hộp thư Gmail (${currentUser.email}). Vui lòng mở Gmail để nhấp vào liên kết xác nhận!`,
    };
  } catch (err: any) {
    if (err?.code === 'auth/too-many-requests') {
      return { success: false, message: 'Vừa gửi email gần đây. Vui lòng đợi 1-2 phút trước khi gửi lại.' };
    }
    return { success: false, message: 'Không thể gửi email xác thực: ' + (err?.message || 'Lỗi mạng') };
  }
}

/**
 * Reload and check if user has clicked the verification link in their Gmail
 */
export async function checkGmailVerification(): Promise<{ isVerified: boolean; message: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { isVerified: false, message: 'Chưa có người dùng đăng nhập.' };
  }

  try {
    await currentUser.reload();
    const isVerified = currentUser.emailVerified;

    // Update stored user
    const stored = getStoredUser();
    if (stored && stored.uid === currentUser.uid) {
      stored.emailVerified = isVerified;
      saveStoredUser(stored);
    }

    return {
      isVerified,
      message: isVerified
        ? 'Tuyệt vời! Tài khoản Gmail của bạn đã được xác minh chính chủ thành công!'
        : 'Hộp thư Gmail chưa được xác nhận. Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam) và nhấn vào liên kết xác thực.',
    };
  } catch (err: any) {
    return { isVerified: false, message: 'Lỗi kiểm tra xác thực: ' + err?.message };
  }
}

/**
 * Send password reset email to Gmail
 */
export async function sendGmailPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return { success: false, message: 'Vui lòng nhập địa chỉ Gmail hợp lệ.' };
  }

  try {
    await sendPasswordResetEmail(auth, trimmedEmail);
    return {
      success: true,
      message: `Đã gửi liên kết đặt lại mật khẩu đến ${trimmedEmail}. Vui lòng kiểm tra hộp thư Gmail của bạn!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Không thể gửi yêu cầu đặt lại: ' + (err?.message || 'Kiểm tra lại email'),
    };
  }
}

export interface GoogleLoginResult {
  success: boolean;
  user?: AppUser;
  error?: {
    code: string;
    message: string;
    isUnauthorizedDomain: boolean;
    isPopupBlocked: boolean;
    currentDomain: string;
  };
}

/**
 * Authenticate with Google OAuth, with detailed error analysis
 */
export async function loginWithGoogle(): Promise<GoogleLoginResult> {
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const gUser = result.user;
    const user: AppUser = {
      uid: gUser.uid,
      displayName: gUser.displayName || 'Nhà Thám Hiểm',
      email: gUser.email,
      photoURL: gUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(gUser.uid)}`,
      authProvider: 'google',
      emailVerified: gUser.emailVerified,
    };

    saveStoredUser(user);
    if (user.displayName) {
      localStorage.setItem('egg_thief_player_name', user.displayName);
    }

    return {
      success: true,
      user,
    };
  } catch (err: any) {
    const code = err?.code || '';
    const message = err?.message || 'Lỗi không xác định khi đăng nhập';
    const isUnauthorizedDomain =
      code === 'auth/unauthorized-domain' ||
      message.toLowerCase().includes('unauthorized domain') ||
      message.toLowerCase().includes('not authorized for oauth');
    const isPopupBlocked =
      code === 'auth/popup-blocked' ||
      message.toLowerCase().includes('popup-blocked') ||
      code === 'auth/cancelled-popup-request';

    console.warn('[Google Auth] Failed:', { code, message, currentDomain });

    return {
      success: false,
      error: {
        code,
        message,
        isUnauthorizedDomain,
        isPopupBlocked,
        currentDomain,
      },
    };
  }
}

/**
 * Log out from both Firebase and local session
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Firebase signOut notice:', e);
  }
  saveStoredUser(null);
}

/**
 * Sync player data into Firestore (users, onlinePlayers, leaderboard)
 */
export async function syncPlayerToFirestore(
  user: AppUser,
  options: {
    accountName?: string;
    hatchedPets?: PetCompanion[];
    dragonCrystals?: number;
    skillTreeState?: SkillTreeState | null;
    stolenEggs?: StolenEgg[];
  } = {}
): Promise<void> {
  if (!user || !user.uid) return;

  const { accountName, hatchedPets = [], dragonCrystals = 0, skillTreeState, stolenEggs = [] } = options;
  const displayName = accountName || user.displayName || 'Nhà Thám Hiểm';
  const bestPet = hatchedPets.length > 0 ? hatchedPets[0] : null;
  const petPower = bestPet ? (bestPet.level || 1) * 150 : 100;
  const arenaWins = skillTreeState?.arenaWins || 0;
  const eggCount = stolenEggs.length;
  const isVerified = user.emailVerified ?? (auth.currentUser?.emailVerified ?? false);

  const userData = {
    uid: user.uid,
    displayName,
    email: user.email || '',
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`,
    crystals: dragonCrystals,
    diamonds: dragonCrystals,
    wins: arenaWins,
    stolenEggsCount: eggCount,
    dragonEggsCount: eggCount,
    activePetName: bestPet ? bestPet.name : 'Chưa có Pet',
    activePetPower: petPower,
    hatchedPetsCount: hatchedPets.length,
    authProvider: user.authProvider,
    emailVerified: isVerified,
    isGmailVerified: isVerified,
    lastActive: serverTimestamp(),
  };

  try {
    await Promise.allSettled([
      setDoc(doc(db, 'users', user.uid), userData, { merge: true }),
      setDoc(doc(db, 'onlinePlayers', user.uid), userData, { merge: true }),
      setDoc(
        doc(db, 'leaderboard', user.uid),
        {
          uid: user.uid,
          displayName,
          photoURL: userData.photoURL,
          email: user.email || '',
          crystals: dragonCrystals,
          diamonds: dragonCrystals,
          stolenEggsCount: eggCount,
          dragonEggsCount: eggCount,
          wins: arenaWins,
          activePetPower: petPower,
          hatchedPetsCount: hatchedPets.length,
          emailVerified: isVerified,
          isGmailVerified: isVerified,
          lastActive: serverTimestamp(),
        },
        { merge: true }
      ),
    ]);
  } catch (err) {
    console.warn('Could not sync player to Firestore:', err);
  }
}
