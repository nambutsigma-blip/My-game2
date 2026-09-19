import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  serverTimestamp,
} from '../lib/firebase';
import { PetCompanion, SkillTreeState } from '../types';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  authProvider: 'google' | 'cloud_fast';
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
 * Create or log in with Fast Cloud account (no OAuth restrictions)
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
    createdAt: new Date().toISOString(),
  };

  saveStoredUser(user);
  localStorage.setItem('egg_thief_player_name', trimmedName);

  return user;
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
 * Log out from both Firebase Google Auth and Fast Cloud session
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
  } = {}
): Promise<void> {
  if (!user || !user.uid) return;

  const { accountName, hatchedPets = [], dragonCrystals = 0, skillTreeState } = options;
  const displayName = accountName || user.displayName || 'Nhà Thám Hiểm';
  const bestPet = hatchedPets.length > 0 ? hatchedPets[0] : null;
  const petPower = bestPet ? (bestPet.level || 1) * 150 : 100;
  const arenaWins = skillTreeState?.arenaWins || 0;

  const userData = {
    uid: user.uid,
    displayName,
    email: user.email || '',
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`,
    crystals: dragonCrystals,
    wins: arenaWins,
    activePetName: bestPet ? bestPet.name : 'Chưa có Pet',
    activePetPower: petPower,
    hatchedPetsCount: hatchedPets.length,
    authProvider: user.authProvider,
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
          crystals: dragonCrystals,
          wins: arenaWins,
          activePetPower: petPower,
          hatchedPetsCount: hatchedPets.length,
          lastActive: serverTimestamp(),
        },
        { merge: true }
      ),
    ]);
  } catch (err) {
    console.warn('Could not sync player to Firestore:', err);
  }
}
