import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Shield,
  Zap,
  Sparkles,
  Trophy,
  Users,
  LogIn,
  LogOut,
  Swords,
  Globe,
  RefreshCw,
  CheckCircle,
  ArrowRightLeft,
  Send,
  Heart,
  Flame,
  Mail,
  Inbox,
  Clock,
  Search,
  Gift,
  Check,
  Egg as EggIcon,
  AlertCircle,
  Award,
  Package,
  RotateCcw,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
  addDoc,
  deleteDoc,
  User,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { PetCompanion, StolenEgg } from '../types';
import { playSuccessChime, playLaser, playAlertUp } from '../utils/soundEffects';
import { PokemonPetVisual } from './PokemonPetVisual';
import {
  AppUser,
  loginWithGoogle,
  loginWithFastCloud,
  logoutUser,
  getStoredUser,
} from '../utils/authHelper';

interface OnlineMultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dragonCrystals: number;
  setDragonCrystals: React.Dispatch<React.SetStateAction<number>>;
  hatchedPets: PetCompanion[];
  setHatchedPets: React.Dispatch<React.SetStateAction<PetCompanion[]>>;
  stolenEggs: StolenEgg[];
  setStolenEggs?: React.Dispatch<React.SetStateAction<StolenEgg[]>>;
  skillTreeState: any;
  setSkillTreeState: React.Dispatch<React.SetStateAction<any>>;
  onUpdatePendingGiftsCount?: (count: number) => void;
  onResetAllAccounts?: () => void;
  accountName?: string;
  onOpenSetAccountName?: () => void;
  currentUser?: AppUser | null;
  onUserChange?: (user: AppUser | null) => void;
  onOpenAuth?: () => void;
}

export interface OnlinePlayer {
  uid: string;
  displayName: string;
  email?: string;
  photoURL: string;
  crystals: number;
  wins: number;
  activePetName: string;
  activePetPower: number;
  lastActive: any;
}

export interface UserAccount {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  crystals?: number;
  wins?: number;
  activePetName?: string;
  activePetPower?: number;
  isOnline?: boolean;
  lastActive?: any;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  crystals: number;
  wins: number;
}

export interface TradeRequest {
  id: string;
  senderUid: string;
  senderName: string;
  senderPhoto: string;
  targetUid: string;
  targetName: string;
  offeredPet: PetCompanion;
  requestedPetName: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface GiftItem {
  id: string;
  senderUid: string;
  senderName: string;
  senderEmail: string;
  senderPhoto?: string;
  targetUid?: string;
  targetEmail: string;
  targetName?: string;
  giftType: 'crystals' | 'pet' | 'egg';
  crystals?: number;
  petData?: PetCompanion | null;
  eggData?: StolenEgg | null;
  message?: string;
  status: 'pending' | 'claimed';
  createdAt?: any;
}

export const OnlineMultiplayerModal: React.FC<OnlineMultiplayerModalProps> = ({
  isOpen,
  onClose,
  dragonCrystals,
  setDragonCrystals,
  hatchedPets,
  setHatchedPets,
  stolenEggs,
  setStolenEggs,
  skillTreeState,
  setSkillTreeState,
  onUpdatePendingGiftsCount,
  onResetAllAccounts,
  accountName,
  onOpenSetAccountName,
  currentUser: propUser,
  onUserChange,
  onOpenAuth,
}) => {
  const [user, setUser] = useState<User | AppUser | null>(propUser || getStoredUser() || null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<'lobby' | 'trade' | 'donate' | 'leaderboard'>('lobby');
  const [donateSubTab, setDonateSubTab] = useState<'send' | 'inbox' | 'sent'>('send');

  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [incomingGifts, setIncomingGifts] = useState<GiftItem[]>([]);
  const [sentGifts, setSentGifts] = useState<GiftItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isLoadingGifts, setIsLoadingGifts] = useState(false);
  const [isSubmittingGift, setIsSubmittingGift] = useState(false);
  const [claimingGiftIds, setClaimingGiftIds] = useState<string[]>([]);
  const [isClaimingAll, setIsClaimingAll] = useState(false);

  // Universal Donate State (Online & Offline)
  const [targetAccountMode, setTargetAccountMode] = useState<'select' | 'manual'>('select');
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [selectedRecipientAccount, setSelectedRecipientAccount] = useState<UserAccount | null>(null);
  const [manualRecipientEmail, setManualRecipientEmail] = useState('');
  const [donateType, setDonateType] = useState<'crystals' | 'pet' | 'egg'>('crystals');
  const [donateAmount, setDonateAmount] = useState<number>(500);
  const [selectedDonatePet, setSelectedDonatePet] = useState<PetCompanion | null>(null);
  const [selectedDonateEgg, setSelectedDonateEgg] = useState<StolenEgg | null>(null);
  const [donateMessage, setDonateMessage] = useState('Chúc bạn phiêu lưu vui vẻ và trộm được nhiều trứng quý!');

  // Turn-based PvP Battle Arena State
  const [isPvPActive, setIsPvPActive] = useState(false);
  const [pvpOpponent, setPvpOpponent] = useState<OnlinePlayer | null>(null);
  const [playerBattleHp, setPlayerBattleHp] = useState(1000);
  const [playerMaxHp, setPlayerMaxHp] = useState(1000);
  const [playerRage, setPlayerRage] = useState(0);
  const [enemyBattleHp, setEnemyBattleHp] = useState(1000);
  const [enemyMaxHp, setEnemyMaxHp] = useState(1000);
  const [pvpTurn, setPvpTurn] = useState<'player' | 'enemy'>('player');
  const [pvpLogs, setPvpLogs] = useState<string[]>([]);
  const [pvpResult, setPvpResult] = useState<'victory' | 'defeat' | null>(null);
  const [isAnimatingAttack, setIsAnimatingAttack] = useState(false);

  // Trade Proposal state
  const [selectedMyPet, setSelectedMyPet] = useState<PetCompanion | null>(null);
  const [selectedTargetPlayer, setSelectedTargetPlayer] = useState<OnlinePlayer | null>(null);
  const [requestedPetQuery, setRequestedPetQuery] = useState('');

  // Filtered accounts for search
  const filteredAccounts = useMemo(() => {
    const q = accountSearchQuery.trim().toLowerCase();
    if (!q) return allAccounts.filter((a) => a.uid !== user?.uid);
    return allAccounts.filter((a) => {
      if (a.uid === user?.uid) return false;
      const matchName = (a.displayName || '').toLowerCase().includes(q);
      const matchEmail = (a.email || '').toLowerCase().includes(q);
      return matchName || matchEmail;
    });
  }, [allAccounts, accountSearchQuery, user]);

  // Sync propUser if changed
  useEffect(() => {
    if (propUser !== undefined) {
      setUser(propUser);
      if (propUser) {
        fetchAllData(propUser);
      }
    }
  }, [propUser]);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (gUser) => {
      if (gUser) {
        const mapped: AppUser = {
          uid: gUser.uid,
          displayName: gUser.displayName || 'Nhà Thám Hiểm',
          email: gUser.email,
          photoURL: gUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(gUser.uid)}`,
          authProvider: 'google',
        };
        setUser(mapped);
        onUserChange?.(mapped);
        await syncUserToFirestore(mapped);
        fetchAllData(mapped);
      } else {
        const stored = getStoredUser();
        if (stored && stored.authProvider === 'cloud_fast') {
          setUser(stored);
          onUserChange?.(stored);
          fetchAllData(stored);
        } else if (!propUser) {
          setUser(null);
          onUserChange?.(null);
          fetchAllData();
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync on modal open
  useEffect(() => {
    if (isOpen) {
      fetchAllData(user || undefined);
    }
  }, [isOpen]);

  const fetchAllData = async (currentUser?: User | AppUser | null) => {
    const u = currentUser || user;
    await Promise.allSettled([
      fetchRegisteredAccounts(),
      fetchLeaderboard(),
      u ? fetchTradeRequests(u.uid) : Promise.resolve(),
      u ? fetchGifts(u.email || '', u.uid) : Promise.resolve(),
    ]);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoadingAuth(true);
      playAlertUp();
      const result = await loginWithGoogle();

      if (result.success && result.user) {
        setUser(result.user);
        onUserChange?.(result.user);
        await syncUserToFirestore(result.user);
        playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        await fetchAllData(result.user);
      } else if (result.error) {
        if (result.error.isUnauthorizedDomain || result.error.isPopupBlocked) {
          // Seamless fallback to Fast Cloud Login so user is NEVER blocked!
          const fastUser = await loginWithFastCloud(accountName || 'Nhà Thám Hiểm');
          setUser(fastUser);
          onUserChange?.(fastUser);
          await syncUserToFirestore(fastUser);
          playSuccessChime();
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          await fetchAllData(fastUser);
          setSyncStatus('⚡ Đã kích hoạt Đăng Nhập Nhanh (do tên miền chưa cấp phép Google OAuth)');
        } else {
          alert('Đăng nhập Google: ' + (result.error.message || 'Lỗi'));
        }
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      // Fallback
      const fastUser = await loginWithFastCloud(accountName || 'Nhà Thám Hiểm');
      setUser(fastUser);
      onUserChange?.(fastUser);
      await syncUserToFirestore(fastUser);
      await fetchAllData(fastUser);
      setSyncStatus('⚡ Đã đăng nhập nhanh qua Cloud ID');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleFastCloudLoginDirect = async () => {
    try {
      setLoadingAuth(true);
      playAlertUp();
      const fastUser = await loginWithFastCloud(accountName || 'Nhà Thám Hiểm');
      setUser(fastUser);
      onUserChange?.(fastUser);
      await syncUserToFirestore(fastUser);
      playSuccessChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      await fetchAllData(fastUser);
      setSyncStatus('⚡ Đã đăng nhập Cloud thành công!');
    } catch (err: any) {
      console.error('Fast Cloud Login Error:', err);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      onUserChange?.(null);
      setIncomingGifts([]);
      setSentGifts([]);
      onUpdatePendingGiftsCount?.(0);
      setSyncStatus('Đã đăng xuất');
      playLaser();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const syncUserToFirestore = async (currentUser: User | AppUser) => {
    if (!currentUser) return;
    try {
      const bestPet = hatchedPets.length > 0 ? hatchedPets[0] : null;
      const petPower = bestPet ? (bestPet.level || 1) * 150 : 100;

      const userDocRef = doc(db, 'users', currentUser.uid);
      const onlineDocRef = doc(db, 'onlinePlayers', currentUser.uid);
      const leaderDocRef = doc(db, 'leaderboard', currentUser.uid);

      const finalDisplayName = accountName || currentUser.displayName || 'Nhà Thám Hiểm';

      const userData = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: finalDisplayName,
        photoURL: currentUser.photoURL || '',
        crystals: dragonCrystals,
        wins: skillTreeState?.arenaWins || 0,
        activePetName: bestPet ? bestPet.name : 'Chưa có Pet',
        activePetPower: petPower,
        hatchedPetsCount: hatchedPets.length,
        lastActive: serverTimestamp(),
      };

      await setDoc(userDocRef, userData, { merge: true });
      await setDoc(onlineDocRef, userData, { merge: true });
      await setDoc(
        leaderDocRef,
        {
          uid: currentUser.uid,
          displayName: finalDisplayName,
          photoURL: currentUser.photoURL || '',
          crystals: dragonCrystals,
          wins: skillTreeState?.arenaWins || 0,
        },
        { merge: true }
      );

      setSyncStatus('☁️ Đồng bộ Cloud thành công!');
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
      setSyncStatus('⚠️ Lỗi đồng bộ Cloud');
    }
  };

  const fetchRegisteredAccounts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const accounts: UserAccount[] = [];
      const now = Date.now();

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let isOnline = false;
        if (data.lastActive) {
          let lastActiveMs = 0;
          if (typeof data.lastActive.toMillis === 'function') lastActiveMs = data.lastActive.toMillis();
          else if (data.lastActive.seconds) lastActiveMs = data.lastActive.seconds * 1000;
          isOnline = now - lastActiveMs < 10 * 60 * 1000;
        }

        accounts.push({
          uid: docSnap.id,
          displayName: data.displayName || 'Nhà Thám Hiểm',
          email: data.email || '',
          photoURL: data.photoURL || '',
          crystals: data.crystals || 0,
          wins: data.wins || 0,
          activePetName: data.activePetName || 'Chưa có Pet',
          activePetPower: data.activePetPower || 100,
          isOnline,
          lastActive: data.lastActive,
        });
      });

      setAllAccounts(accounts);

      // Populate online list for lobby PvP
      const onlineOnly: OnlinePlayer[] = accounts
        .filter((a) => a.uid !== user?.uid && a.isOnline)
        .map((a) => ({
          uid: a.uid,
          displayName: a.displayName,
          email: a.email,
          photoURL: a.photoURL || '',
          crystals: a.crystals || 0,
          wins: a.wins || 0,
          activePetName: a.activePetName || 'Chưa có Pet',
          activePetPower: a.activePetPower || 100,
          lastActive: a.lastActive,
        }));
      setOnlinePlayers(onlineOnly);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'leaderboard'));
      const list: LeaderboardEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as LeaderboardEntry);
      });
      list.sort((a, b) => b.crystals - a.crystals || b.wins - a.wins);
      setLeaderboard(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'leaderboard');
    }
  };

  const fetchTradeRequests = async (uid: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tradeRequests'));
      const list: TradeRequest[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as TradeRequest;
        if (data.targetUid === uid || data.senderUid === uid) {
          list.push({ ...data, id: docSnap.id });
        }
      });
      setTradeRequests(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'tradeRequests');
    }
  };

  const fetchGifts = async (myEmail?: string, myUid?: string) => {
    const emailToMatch = (myEmail || user?.email || '').toLowerCase().trim();
    const uidToMatch = myUid || user?.uid;

    if (!emailToMatch && !uidToMatch) return;

    try {
      setIsLoadingGifts(true);
      const querySnapshot = await getDocs(collection(db, 'gifts'));
      const incoming: GiftItem[] = [];
      const sent: GiftItem[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as GiftItem;
        const gift: GiftItem = { ...data, id: docSnap.id };

        const targetEmail = (gift.targetEmail || '').toLowerCase().trim();
        const isForMe =
          (emailToMatch && targetEmail === emailToMatch) ||
          (uidToMatch && gift.targetUid === uidToMatch);

        if (isForMe && gift.status === 'pending') {
          incoming.push(gift);
        }

        if (uidToMatch && gift.senderUid === uidToMatch) {
          sent.push(gift);
        }
      });

      setIncomingGifts(incoming);
      setSentGifts(sent);
      onUpdatePendingGiftsCount?.(incoming.length);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'gifts');
    } finally {
      setIsLoadingGifts(false);
    }
  };

  // ================= UNIVERSAL DONATE LOGIC =================
  const handleSendUniversalGift = async () => {
    if (isSubmittingGift) return;
    if (!user) {
      alert('Vui lòng đăng nhập Google để sử dụng tính năng donate!');
      return;
    }

    let targetEmail = '';
    let targetUid = '';
    let targetName = '';

    if (targetAccountMode === 'select') {
      if (!selectedRecipientAccount) {
        alert('Vui lòng chọn một tài khoản người nhận trong danh sách!');
        return;
      }
      targetEmail = selectedRecipientAccount.email.toLowerCase().trim();
      targetUid = selectedRecipientAccount.uid;
      targetName = selectedRecipientAccount.displayName;
    } else {
      const cleanEmail = manualRecipientEmail.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        alert('Vui lòng nhập địa chỉ Email hợp lệ của người nhận (Ví dụ: banbe@gmail.com)!');
        return;
      }
      targetEmail = cleanEmail;
      // Check if this email exists in allAccounts
      const matched = allAccounts.find((a) => a.email.toLowerCase().trim() === cleanEmail);
      if (matched) {
        targetUid = matched.uid;
        targetName = matched.displayName;
      } else {
        targetUid = '';
        targetName = cleanEmail.split('@')[0];
      }
    }

    if (targetEmail === (user.email || '').toLowerCase().trim()) {
      alert('Bạn không thể tự gửi quà cho chính mình!');
      return;
    }

    // Validate gift payload
    if (donateType === 'crystals') {
      if (donateAmount <= 0) {
        alert('Số lượng Dragon Crystals phải lớn hơn 0!');
        return;
      }
      if (dragonCrystals < donateAmount) {
        alert(`Bạn không đủ Dragon Crystals! Hiện có: ${dragonCrystals} 💎, cần: ${donateAmount} 💎.`);
        return;
      }
    } else if (donateType === 'pet') {
      if (!selectedDonatePet) {
        alert('Vui lòng chọn một Pet trong đội hình để tặng!');
        return;
      }
      if (selectedDonatePet.id === 'publisher-lord-infinite' || selectedDonatePet.name.includes('Chúa Tể Nhà Phát Hành')) {
        alert('Chúa Tể Nhà Phát Hành là linh thú tối cao độc quyền, không thể donate!');
        return;
      }
    } else if (donateType === 'egg') {
      if (!selectedDonateEgg) {
        alert('Vui lòng chọn một Trứng Rồng đã trộm để tặng!');
        return;
      }
    }

    try {
      setIsSubmittingGift(true);

      const giftPayload = {
        senderUid: user.uid,
        senderName: accountName || user.displayName || 'Nhà Thám Hiểm',
        senderEmail: user.email || '',
        senderPhoto: user.photoURL || '',
        targetUid,
        targetEmail,
        targetName,
        giftType: donateType,
        crystals: donateType === 'crystals' ? donateAmount : 0,
        petData: donateType === 'pet' ? selectedDonatePet : null,
        eggData: donateType === 'egg' ? selectedDonateEgg : null,
        message: donateMessage.trim() || 'Quà tặng bí mật từ người bạn thám hiểm!',
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      // Deduct from sender balance
      if (donateType === 'crystals') {
        setDragonCrystals((prev) => Math.max(0, prev - donateAmount));
      } else if (donateType === 'pet' && selectedDonatePet) {
        setHatchedPets((prev) => prev.filter((p) => p.id !== selectedDonatePet.id));
      } else if (donateType === 'egg' && selectedDonateEgg) {
        setStolenEggs?.((prev) => prev.filter((e) => e.id !== selectedDonateEgg.id));
      }

      // Add to Firestore gifts collection
      await addDoc(collection(db, 'gifts'), giftPayload);

      playSuccessChime();
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });

      alert(
        `🎁 ĐÃ GỬI DONATE THÀNH CÔNG!\n\n` +
          `• Người nhận: ${targetName} (${targetEmail})\n` +
          `• Món quà: ${
            donateType === 'crystals'
              ? `${donateAmount} Dragon Crystals 💎`
              : donateType === 'pet'
              ? `Pet ${selectedDonatePet?.name} 🐾`
              : `Trứng Rồng ${selectedDonateEgg?.eggType || ''} 🥚`
          }\n\n` +
          `✨ Người nhận dù đang ONLINE hay OFFLINE đều sẽ nhận được thông báo trong Hòm Thư khi đăng nhập!`
      );

      // Reset selection
      setSelectedDonatePet(null);
      setSelectedDonateEgg(null);
      setManualRecipientEmail('');

      // Refresh data
      fetchGifts(user.email || '', user.uid);
      setDonateSubTab('sent');
    } catch (err: any) {
      console.error('Send gift error:', err);
      handleFirestoreError(err, OperationType.CREATE, 'gifts');
      alert('Lỗi gửi quà: ' + (err.message || 'Không thể kết nối đến máy chủ Cloud'));
    } finally {
      setIsSubmittingGift(false);
    }
  };

  // Claim single gift with atomic deletion and anti-duplication lock
  const handleClaimGift = async (gift: GiftItem) => {
    if (claimingGiftIds.includes(gift.id) || isClaimingAll) return;

    try {
      setClaimingGiftIds((prev) => [...prev, gift.id]);

      // Strictly delete from Firestore FIRST before granting rewards
      await deleteDoc(doc(db, 'gifts', gift.id));

      let rewardDescription = '';

      if (gift.giftType === 'crystals' && gift.crystals) {
        setDragonCrystals((prev) => prev + gift.crystals!);
        rewardDescription = `+${gift.crystals} Dragon Crystals 💎`;
      } else if (gift.giftType === 'pet' && gift.petData) {
        const receivedPet: PetCompanion = {
          ...gift.petData,
          id: `gifted-pet-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          hatchedAt: `🎁 Quà tặng từ ${gift.senderName}`,
        };
        setHatchedPets((prev) => [...prev, receivedPet]);
        rewardDescription = `Pet "${receivedPet.name}" (Cấp ${receivedPet.level || 1}) 🐾`;
      } else if (gift.giftType === 'egg' && gift.eggData) {
        const receivedEgg: StolenEgg = {
          ...gift.eggData,
          id: `gifted-egg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          stolenAt: `🎁 Quà tặng từ ${gift.senderName}`,
          isHatched: false,
        };
        setStolenEggs?.((prev) => [receivedEgg, ...prev]);
        rewardDescription = `Trứng Rồng "${receivedEgg.eggType || 'Thần Thoại'}" 🥚`;
      }

      playSuccessChime();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });

      setIncomingGifts((prev) => {
        const next = prev.filter((g) => g.id !== gift.id);
        onUpdatePendingGiftsCount?.(next.length);
        return next;
      });

      alert(`🎉 BẠN ĐÃ NHẬN QUÀ THÀNH CÔNG!\n\n• Người gửi: ${gift.senderName}\n• Quà: ${rewardDescription}`);
    } catch (err: any) {
      console.error('Claim gift error:', err);
      handleFirestoreError(err, OperationType.DELETE, `gifts/${gift.id}`);
      alert('Lỗi nhận quà: ' + (err.message || 'Lỗi xử lý'));
    } finally {
      setClaimingGiftIds((prev) => prev.filter((id) => id !== gift.id));
    }
  };

  // Claim all gifts in one click with anti-spam concurrency lock
  const handleClaimAllGifts = async () => {
    if (isClaimingAll || incomingGifts.length === 0) return;

    try {
      setIsClaimingAll(true);

      let totalCrystals = 0;
      const newPets: PetCompanion[] = [];
      const newEggs: StolenEgg[] = [];
      const successfullyDeletedIds: string[] = [];

      for (const gift of incomingGifts) {
        try {
          await deleteDoc(doc(db, 'gifts', gift.id));
          successfullyDeletedIds.push(gift.id);

          if (gift.giftType === 'crystals' && gift.crystals) {
            totalCrystals += gift.crystals;
          } else if (gift.giftType === 'pet' && gift.petData) {
            newPets.push({
              ...gift.petData,
              id: `gifted-pet-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              hatchedAt: `🎁 Quà tặng từ ${gift.senderName}`,
            });
          } else if (gift.giftType === 'egg' && gift.eggData) {
            newEggs.push({
              ...gift.eggData,
              id: `gifted-egg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              stolenAt: `🎁 Quà tặng từ ${gift.senderName}`,
              isHatched: false,
            });
          }
        } catch (e) {
          console.error('Error deleting gift', gift.id, e);
        }
      }

      if (totalCrystals > 0) {
        setDragonCrystals((prev) => prev + totalCrystals);
      }
      if (newPets.length > 0) {
        setHatchedPets((prev) => [...prev, ...newPets]);
      }
      if (newEggs.length > 0 && setStolenEggs) {
        setStolenEggs((prev) => [...newEggs, ...prev]);
      }

      const count = successfullyDeletedIds.length;
      setIncomingGifts((prev) => {
        const next = prev.filter((g) => !successfullyDeletedIds.includes(g.id));
        onUpdatePendingGiftsCount?.(next.length);
        return next;
      });

      if (count > 0) {
        playSuccessChime();
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
        });

        alert(
          `🎉 ĐÃ NHẬN TOÀN BỘ ${count} PHẦN QUÀ!\n\n` +
            (totalCrystals > 0 ? `• +${totalCrystals} Dragon Crystals 💎\n` : '') +
            (newPets.length > 0 ? `• +${newPets.length} Thú Cưng mới 🐾\n` : '') +
            (newEggs.length > 0 ? `• +${newEggs.length} Trứng Rồng mới 🥚\n` : '')
        );
      }
    } catch (err: any) {
      console.error('Claim all error:', err);
      alert('Lỗi nhận toàn bộ quà: ' + (err.message || 'Lỗi xử lý'));
    } finally {
      setIsClaimingAll(false);
    }
  };

  // Trade handlers
  const sendTradeProposal = async () => {
    if (!user || !selectedMyPet || !selectedTargetPlayer) {
      alert('Vui lòng chọn Pet của bạn và người chơi muốn trade!');
      return;
    }
    try {
      const tradeData = {
        senderUid: user.uid,
        senderName: accountName || user.displayName || 'Nhà Thám Hiểm',
        senderPhoto: user.photoURL || '',
        targetUid: selectedTargetPlayer.uid,
        targetName: selectedTargetPlayer.displayName,
        offeredPet: selectedMyPet,
        requestedPetName: requestedPetQuery || 'Bất kỳ Pet nào tương xứng',
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'tradeRequests'), tradeData);
      playSuccessChime();
      alert(`Đã gửi kèo trade thành công tới ${selectedTargetPlayer.displayName}! Hãy đợi họ đồng ý.`);
      setSelectedMyPet(null);
      setSelectedTargetPlayer(null);
      setRequestedPetQuery('');
      fetchTradeRequests(user.uid);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'tradeRequests');
      alert('Gửi kèo trade thất bại: ' + err.message);
    }
  };

  const acceptTradeRequest = async (req: TradeRequest) => {
    try {
      const acceptedPet: PetCompanion = {
        ...req.offeredPet,
        id: `traded-in-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        hatchedAt: `Trade với ${req.senderName}`,
      };

      setHatchedPets((prev) => [...prev, acceptedPet]);
      playSuccessChime();
      alert(`🎉 Giao dịch thành công! Bạn đã nhận được ${acceptedPet.name} từ ${req.senderName}!`);

      await deleteDoc(doc(db, 'tradeRequests', req.id));
      if (user) fetchTradeRequests(user.uid);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `tradeRequests/${req.id}`);
      alert('Lỗi chấp nhận trade: ' + err.message);
    }
  };

  const declineTradeRequest = async (reqId: string) => {
    try {
      await deleteDoc(doc(db, 'tradeRequests', reqId));
      playLaser();
      if (user) fetchTradeRequests(user.uid);
      alert('Đã từ chối kèo trade.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tradeRequests/${reqId}`);
    }
  };

  // Turn-based PvP Battle Engine
  const startPvPBattle = (opponent: OnlinePlayer | null) => {
    playLaser();
    const activePet = hatchedPets[0] || {
      name: 'Thần Long Sơ Cấp',
      level: 10,
      avatarIcon: '🐲',
      element: 'fire',
    };

    const targetOp: OnlinePlayer = opponent || {
      uid: 'ai-bot',
      displayName: '🤖 Đấu Sĩ AI Huấn Luyện',
      photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=aibot',
      crystals: 5000,
      wins: 15,
      activePetName: 'Hỏa Long Tối Thượng',
      activePetPower: 800,
      lastActive: new Date(),
    };

    const myMaxHp = (activePet.level || 1) * 150 + 800;
    const opMaxHp = (targetOp.activePetPower || 500) + 500;

    setPvpOpponent(targetOp);
    setPlayerMaxHp(myMaxHp);
    setPlayerBattleHp(myMaxHp);
    setPlayerRage(20);
    setEnemyMaxHp(opMaxHp);
    setEnemyBattleHp(opMaxHp);
    setIsPvPActive(true);
    setPvpResult(null);
    setPvpTurn('player');
    setPvpLogs([
      `⚔️ BẮT ĐẦU TRẬN ĐẤU PVP TRỰC TIẾP!`,
      `🐾 ${user?.displayName || 'Bạn'} (${activePet.name}) VS ${targetOp.displayName} (${targetOp.activePetName})!`,
      `👉 Lượt của bạn! Hãy chọn đòn tấn công.`,
    ]);
  };

  const handlePlayerAttack = (skillType: 'normal' | 'elemental' | 'ultimate') => {
    if (pvpTurn !== 'player' || pvpResult || isAnimatingAttack) return;

    const activePet = hatchedPets[0] || { level: 10 };
    const petLevel = activePet.level || 1;

    let baseDmg = petLevel * 35;
    let skillName = 'Đòn Đánh Thường';
    let rageCost = 0;

    if (skillType === 'elemental') {
      baseDmg = petLevel * 60;
      skillName = 'Kỹ Năng Nguyên Tố';
      rageCost = 25;
      if (playerRage < rageCost) {
        alert('Không đủ nộ khí (Rage) để dùng kỹ năng nguyên tố!');
        return;
      }
      setPlayerRage((prev) => Math.max(0, prev - rageCost));
    } else if (skillType === 'ultimate') {
      baseDmg = petLevel * 100;
      skillName = 'Tuyệt Kỹ Tối Thượng';
      rageCost = 60;
      if (playerRage < rageCost) {
        alert('Cần ít nhất 60 Nộ Khí để tung Tuyệt Kỹ!');
        return;
      }
      setPlayerRage((prev) => Math.max(0, prev - rageCost));
    }

    setIsAnimatingAttack(true);
    playLaser();

    setTimeout(() => {
      const finalDmg = Math.round(baseDmg * (0.85 + Math.random() * 0.3));
      setPlayerRage((prev) => Math.min(100, prev + 25));

      setEnemyBattleHp((prevEnemyHp) => {
        const newEnemyHp = Math.max(0, prevEnemyHp - finalDmg);
        setIsAnimatingAttack(false);

        setPvpLogs((prevLogs) => [
          `💥 Pet của bạn dùng [${skillName}] gây <span class="text-amber-300 font-bold">-${finalDmg} HP</span> sát thương cho đối thủ!`,
          ...prevLogs,
        ]);

        if (newEnemyHp <= 0) {
          setPvpResult('victory');
          setDragonCrystals((prev) => prev + 250);
          playSuccessChime();
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
          setPvpLogs((prevLogs) => [
            `🏆 CHIẾN THẮNG VANG DỘI! Bạn đã hạ gục ${pvpOpponent?.displayName}! Nhận +250 Dragon Crystals!`,
            ...prevLogs,
          ]);
        } else {
          setPvpTurn('enemy');
          setTimeout(executeEnemyTurn, 1200);
        }
        return newEnemyHp;
      });
    }, 500);
  };

  const executeEnemyTurn = () => {
    if (pvpResult) return;
    const opPower = pvpOpponent?.activePetPower || 500;
    const enemyDmg = Math.round(opPower * (0.18 + Math.random() * 0.22));

    setPlayerBattleHp((prevPlayerHp) => {
      const newPlayerHp = Math.max(0, prevPlayerHp - enemyDmg);
      playAlertUp();

      setPvpLogs((prevLogs) => [
        `⚡ ${pvpOpponent?.displayName} phản công gây <span class="text-rose-400 font-bold">-${enemyDmg} HP</span> lên pet của bạn!`,
        ...prevLogs,
      ]);

      if (newPlayerHp <= 0) {
        setPvpResult('defeat');
        setPvpLogs((prevLogs) => [
          `💥 THẤT BẠI! Pet của bạn đã gục ngã trước đòn tấn công chí mạng của đối thủ.`,
          ...prevLogs,
        ]);
      } else {
        setPvpTurn('player');
      }
      return newPlayerHp;
    });
  };

  if (!isOpen) return null;

  const incomingRequests = tradeRequests.filter((r) => r.targetUid === user?.uid && r.status === 'pending');
  const outgoingRequests = tradeRequests.filter((r) => r.senderUid === user?.uid && r.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-indigo-500/60 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-950/60">
              🌐
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Đấu Trường PvP & Hệ Thống Donate Quà Tặng</span>
                <span className="text-indigo-400 font-bold hidden md:inline">• Cloud Multiplayer</span>
              </h3>
              <p className="text-xs text-slate-400">
                Giao lưu trực tuyến, tặng quà cho bất kỳ ai (Online & Offline) và giao tranh 2 pet.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Bar */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover"
              />
              <div>
                <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>{accountName || user.displayName || 'Nhà Thám Hiểm'}</span>
                  {onOpenSetAccountName && (
                    <button
                      onClick={onOpenSetAccountName}
                      className="text-amber-400 hover:text-amber-300 p-1 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer border border-amber-500/30 bg-amber-950/30 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5"
                      title="Đổi tên tài khoản"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Đổi Tên</span>
                    </button>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{user.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-base flex items-center justify-center shadow">
                {(accountName || 'N').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>{accountName || 'Nhà Thám Hiểm'}</span>
                  {onOpenSetAccountName && (
                    <button
                      onClick={onOpenSetAccountName}
                      className="text-amber-400 hover:text-amber-300 p-1 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer border border-amber-500/30 bg-amber-950/30 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5"
                      title="Đặt tên tài khoản"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Đặt Tên</span>
                    </button>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Khách Cục Bộ
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Chưa đăng nhập Google (Dữ liệu lưu trên máy)</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            {syncStatus && <span className="text-xs text-amber-300 animate-pulse">{syncStatus}</span>}
            {onResetAllAccounts && (
              <button
                onClick={onResetAllAccounts}
                className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
                title="Reset toàn bộ tài khoản và xóa sạch dữ liệu người chơi"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset All Accounts</span>
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    syncUserToFirestore(user);
                    fetchAllData(user);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đồng Bộ Cloud</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {onOpenAuth && (
                  <button
                    onClick={onOpenAuth}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 hover:from-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/40 cursor-pointer active:scale-95 transition-all"
                    title="Xác thực tài khoản Gmail chính chủ để lưu tiến độ và nhận quà"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Xác Thực Gmail</span>
                  </button>
                )}
                <button
                  onClick={handleFastCloudLoginDirect}
                  disabled={loadingAuth}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                  title="Đăng nhập ngay lập tức - Hoạt động 100% trên bản ngoài mà không cần Google OAuth"
                >
                  <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="hidden sm:inline">Chơi Nhanh</span>
                </button>
                <button
                  onClick={handleGoogleLogin}
                  disabled={loadingAuth}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                  title="Đăng nhập bằng tài khoản Google"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Google</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-4 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('lobby');
              fetchRegisteredAccounts();
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'lobby'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Đấu Trường PvP ({onlinePlayers.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('donate');
              if (user) fetchGifts(user.email || '', user.uid);
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer relative whitespace-nowrap ${
              activeTab === 'donate'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-4 h-4 text-emerald-400" />
            <span>🎁 Donate & Quà Tặng</span>
            {incomingGifts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-bounce">
                {incomingGifts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('trade');
              if (user) fetchTradeRequests(user.uid);
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer relative whitespace-nowrap ${
              activeTab === 'trade'
                ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Kèo Trade Pet</span>
            {incomingRequests.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('leaderboard');
              fetchLeaderboard();
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Bảng Xếp Hạng</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: LOBBY & PVP */}
          {activeTab === 'lobby' ? (
            <div className="space-y-4">
              {/* Turn-Based Battle Screen */}
              {isPvPActive ? (
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border-2 border-indigo-500/80 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Swords className="w-5 h-5 text-rose-500 animate-pulse" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">Đang Giao Đấu PvP</span>
                    </div>
                    <button
                      onClick={() => setIsPvPActive(false)}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                    >
                      Rời Đấu Trường
                    </button>
                  </div>

                  {/* Battle Arena Canvas */}
                  <div className="relative rounded-2xl bg-gradient-to-b from-indigo-950/70 via-slate-950 to-slate-950 border border-slate-800 p-4 min-h-[220px] flex items-center justify-between overflow-hidden">
                    {/* Player Pet */}
                    <div className={`flex flex-col items-center gap-2 ${isAnimatingAttack ? 'scale-110' : ''} transition-all`}>
                      <div className="text-xs font-black text-amber-300">{hatchedPets[0]?.name || 'Pet của bạn'}</div>
                      <div className="w-20 h-20 sm:w-24 sm:h-24">
                        {hatchedPets[0] ? (
                          <PokemonPetVisual pet={hatchedPets[0]} size="md" facing="front" combatState={isAnimatingAttack ? 'attack' : 'idle'} />
                        ) : (
                          <div className="text-4xl">🐾</div>
                        )}
                      </div>
                      <div className="w-28 sm:w-36 bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                          style={{ width: `${Math.max(0, (playerBattleHp / playerMaxHp) * 100)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-300 font-bold">
                        {playerBattleHp} / {playerMaxHp} HP
                      </div>
                    </div>

                    {/* VS Badge */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-rose-950 border-2 border-rose-400 animate-pulse">
                        VS
                      </div>
                      <div className="text-[10px] uppercase font-black text-indigo-400">
                        {pvpTurn === 'player' ? '👉 Lượt của bạn' : '⏳ Đối thủ ra đòn'}
                      </div>
                    </div>

                    {/* Opponent Pet */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xs font-black text-rose-300">{pvpOpponent?.activePetName}</div>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-4xl">
                        {pvpOpponent?.uid === 'ai-bot' ? '🤖' : '🐲'}
                      </div>
                      <div className="w-28 sm:w-36 bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                          style={{ width: `${Math.max(0, (enemyBattleHp / enemyMaxHp) * 100)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-300 font-bold">
                        {enemyBattleHp} / {enemyMaxHp} HP
                      </div>
                    </div>
                  </div>

                  {/* Battle Logs */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 max-h-24 overflow-y-auto">
                    {pvpLogs.map((log, idx) => (
                      <div key={idx} dangerouslySetInnerHTML={{ __html: log }} />
                    ))}
                  </div>

                  {/* Controls */}
                  {pvpResult ? (
                    <div className="text-center py-2 space-y-2">
                      <div className={`text-sm font-black ${pvpResult === 'victory' ? 'text-amber-300' : 'text-rose-400'}`}>
                        {pvpResult === 'victory' ? '🎉 CHIẾN THẮNG TRẬN ĐẤU!' : '💥 BẠN ĐÃ THẤT BẠI TRONG TRẬN ĐẤU!'}
                      </div>
                      <button
                        onClick={() => setIsPvPActive(false)}
                        className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
                      >
                        Hoàn Thành Trận Đấu & Nhận Thưởng
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => handlePlayerAttack('normal')}
                        disabled={pvpTurn !== 'player' || isAnimatingAttack}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                      >
                        <span>⚔️ Đòn Thường</span>
                      </button>
                      <button
                        onClick={() => handlePlayerAttack('elemental')}
                        disabled={pvpTurn !== 'player' || isAnimatingAttack || playerRage < 25}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-black text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                      >
                        <span>⚡ Kỹ Năng (25 Nộ)</span>
                      </button>
                      <button
                        onClick={() => handlePlayerAttack('ultimate')}
                        disabled={pvpTurn !== 'player' || isAnimatingAttack || playerRage < 60}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 text-slate-950 font-black text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                      >
                        <span>🔥 Tuyệt Kỹ (60 Nộ)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quick AI Match button */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-950 border border-indigo-500/40 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-black text-indigo-200">🤖 Luyện Tập Giao Đấu Với AI Bot</h4>
                      <p className="text-[11px] text-slate-400">Không cần chờ người chơi khác, bắt đầu giao đấu pet ngay lập tức để nhận thưởng 250 Crystals!</p>
                    </div>
                    <button
                      onClick={() => startPvPBattle(null)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Đấu Ngay Với AI</span>
                    </button>
                  </div>

                  {/* Online Players Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Người Chơi Đang Trực Tuyến ({onlinePlayers.length})
                      </h4>
                      <button
                        onClick={fetchRegisteredAccounts}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Làm mới</span>
                      </button>
                    </div>

                    {onlinePlayers.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                        <div className="text-3xl">👥💤</div>
                        <div className="text-xs">Hiện tại chưa có người chơi nào khác online trong sảnh. Hãy bấm <b>Đấu Ngay Với AI</b> ở trên!</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {onlinePlayers.map((player) => (
                          <div
                            key={player.uid}
                            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between gap-3 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={player.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=dummy'}
                                alt={player.displayName}
                                className="w-11 h-11 rounded-full border border-indigo-500 object-cover"
                              />
                              <div>
                                <div className="font-bold text-xs text-white">{player.displayName}</div>
                                <div className="text-[10px] text-slate-400">
                                  🐾 Pet: <span className="text-amber-300 font-bold">{player.activePetName}</span>
                                </div>
                                <div className="text-[10px] text-indigo-400">
                                  💎 Crystals: {player.crystals} | Thắng: {player.wins}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => startPvPBattle(player)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                            >
                              <Swords className="w-3.5 h-3.5" />
                              <span>Thách Đấu</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'donate' ? (
            /* TAB 2: UNIVERSAL DONATE & GIFTS (ONLINE & OFFLINE) */
            <div className="space-y-4">
              {/* Donate Sub-Tabs */}
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setDonateSubTab('send')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    donateSubTab === 'send'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Quà Tặng (Donate)</span>
                </button>

                <button
                  onClick={() => setDonateSubTab('inbox')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
                    donateSubTab === 'inbox'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Hòm Thư Nhận Quà</span>
                  {incomingGifts.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black animate-bounce">
                      {incomingGifts.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setDonateSubTab('sent')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    donateSubTab === 'sent'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Lịch Sử Đã Gửi ({sentGifts.length})</span>
                </button>
              </div>

              {/* SUBTAB 1: SEND GIFT */}
              {donateSubTab === 'send' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
                      <h4 className="text-xs font-black text-emerald-300">
                        🎁 Donate Quà Tới Bất Kỳ Tài Khoản Nào (Online Hoặc Offline)
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400">Không cần người nhận phải online</span>
                  </div>

                  {/* Mode switch: Select from accounts or enter Email */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-300 font-bold">1. Chọn người nhận donate:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTargetAccountMode('select')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          targetAccountMode === 'select'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        📋 Danh Sách Tài Khoản ({allAccounts.length})
                      </button>
                      <button
                        onClick={() => setTargetAccountMode('manual')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          targetAccountMode === 'manual'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        ✉️ Nhập Email Tài Khoản Nhận
                      </button>
                    </div>

                    {targetAccountMode === 'select' ? (
                      <div className="space-y-2 pt-1">
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="🔍 Tìm kiếm theo tên hoặc email tài khoản người chơi..."
                            value={accountSearchQuery}
                            onChange={(e) => setAccountSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Account Selector Grid */}
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                          {filteredAccounts.length === 0 ? (
                            <div className="text-center py-4 text-xs text-slate-500 bg-slate-900/60 rounded-xl">
                              Không tìm thấy tài khoản phù hợp. Hãy thử chuyển sang "Nhập Email Tài Khoản Nhận".
                            </div>
                          ) : (
                            filteredAccounts.map((acc) => {
                              const isSelected = selectedRecipientAccount?.uid === acc.uid;
                              return (
                                <div
                                  key={acc.uid}
                                  onClick={() => setSelectedRecipientAccount(acc)}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                    isSelected
                                      ? 'bg-emerald-950/60 border-emerald-500 shadow-md'
                                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={acc.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + acc.uid}
                                      alt={acc.displayName}
                                      className="w-8 h-8 rounded-full border border-slate-700 object-cover shrink-0"
                                    />
                                    <div className="truncate">
                                      <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                                        <span>{acc.displayName}</span>
                                        {acc.isOnline ? (
                                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                                            Online 🟢
                                          </span>
                                        ) : (
                                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-bold">
                                            Offline ⚪
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-400 truncate">{acc.email || 'Chưa liên kết email'}</div>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <div className="text-[10px] text-amber-300 font-bold">💎 {acc.crystals || 0}</div>
                                    <div className="text-[9px] text-slate-500">Pet: {acc.activePetName}</div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 pt-1">
                        <input
                          type="email"
                          placeholder="Nhập địa chỉ email người nhận (Ví dụ: banbe@gmail.com)"
                          value={manualRecipientEmail}
                          onChange={(e) => setManualRecipientEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                        <p className="text-[10px] text-slate-400 italic">
                          💡 Dù người nhận đang offline hay chưa mở game, chỉ cần họ có hoặc đăng nhập bằng Email này là sẽ nhận được quà trong Hòm Thư!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selected target summary indicator */}
                  {(selectedRecipientAccount || (targetAccountMode === 'manual' && manualRecipientEmail)) && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
                      <span className="text-emerald-300">
                        🎯 Người nhận: <b>{targetAccountMode === 'select' ? selectedRecipientAccount?.displayName : manualRecipientEmail}</b>
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        {targetAccountMode === 'select' && selectedRecipientAccount?.isOnline ? '🟢 Đang Online' : '⚪ Nhận khi Online'}
                      </span>
                    </div>
                  )}

                  {/* Choose Gift Type */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-300 font-bold">2. Loại quà tặng muốn donate:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setDonateType('crystals')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          donateType === 'crystals'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        <span>💎 Crystals</span>
                      </button>
                      <button
                        onClick={() => setDonateType('pet')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          donateType === 'pet'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        <span>🐾 Tặng Pet ({hatchedPets.length})</span>
                      </button>
                      <button
                        onClick={() => setDonateType('egg')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          donateType === 'egg'
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        <span>🥚 Trứng Rồng ({stolenEggs.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Gift Payload Selector */}
                  {donateType === 'crystals' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-400 font-bold">Số lượng Dragon Crystals:</label>
                        <span className="text-[10px] text-purple-300">
                          Ví của bạn: <b>{dragonCrystals} 💎</b>
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {[100, 500, 1000, 5000, 10000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setDonateAmount(amt)}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                              donateAmount === amt
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            {amt} 💎
                          </button>
                        ))}
                        <button
                          onClick={() => setDonateAmount(dragonCrystals)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 text-xs font-bold cursor-pointer"
                        >
                          Tất cả
                        </button>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={dragonCrystals}
                        value={donateAmount}
                        onChange={(e) => setDonateAmount(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ) : donateType === 'pet' ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold">Chọn Pet muốn donate tặng bạn bè:</label>
                      {hatchedPets.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-500 bg-slate-900 rounded-xl">
                          Bạn chưa ấp nở chú Pet nào để tặng!
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                          {hatchedPets.map((p) => {
                            const isSelected = selectedDonatePet?.id === p.id;
                            return (
                              <div
                                key={p.id}
                                onClick={() => setSelectedDonatePet(p)}
                                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-amber-950/70 border-amber-400 shadow-md ring-1 ring-amber-400'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="w-12 h-12 flex items-center justify-center">
                                  <PokemonPetVisual pet={p} size="sm" facing="front" />
                                </div>
                                <div className="text-xs font-bold text-white text-center truncate w-full">{p.name}</div>
                                <div className="text-[10px] text-amber-300">Cấp {p.level || 1} • {p.element}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold">Chọn Trứng Rồng đã trộm để tặng:</label>
                      {stolenEggs.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-500 bg-slate-900 rounded-xl">
                          Bạn chưa trộm được quả Trứng Rồng nào để tặng!
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                          {stolenEggs.map((egg) => {
                            const isSelected = selectedDonateEgg?.id === egg.id;
                            return (
                              <div
                                key={egg.id}
                                onClick={() => setSelectedDonateEgg(egg)}
                                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-rose-950/70 border-rose-400 shadow-md ring-1 ring-rose-400'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="text-2xl">🥚</div>
                                <div className="text-xs font-bold text-white text-center truncate w-full">{egg.eggType || 'Trứng Rồng'}</div>
                                <div className="text-[10px] text-slate-400">{egg.unitTitle || 'Grade 8 Mission'}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Message */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">3. Lời chúc / Lời nhắn gửi kèm theo:</label>
                    <input
                      type="text"
                      placeholder="Lời nhắn (Ví dụ: Tặng bạn cày Unit 15 nhé!)"
                      value={donateMessage}
                      onChange={(e) => setDonateMessage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSendUniversalGift}
                    disabled={isSubmittingGift}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 text-white font-black text-xs shadow-lg cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingGift ? 'Đang gửi quà...' : 'Xác Nhận Gửi Donate Quà Tặng 🎁'}</span>
                  </button>
                </div>
              )}

              {/* SUBTAB 2: INBOX GIFTS */}
              {donateSubTab === 'inbox' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <span>📬 Hòm Thư Quà Tặng Của Bạn</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-500/30">
                        {incomingGifts.length} phần quà
                      </span>
                    </h4>

                    {incomingGifts.length > 0 && (
                      <button
                        onClick={handleClaimAllGifts}
                        disabled={isClaimingAll}
                        className={`px-3.5 py-1.5 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 transition-all ${
                          isClaimingAll
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-70'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white cursor-pointer hover:from-emerald-500'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isClaimingAll ? 'Đang nhận tất cả...' : `Nhận Tất Cả (${incomingGifts.length})`}</span>
                      </button>
                    )}
                  </div>

                  {incomingGifts.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-3">
                      <div className="text-4xl">📭</div>
                      <div className="text-xs font-bold text-slate-300">Hòm thư của bạn đang trống!</div>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        Hãy chia sẻ Email hoặc tên của bạn cho bạn bè trong lớp để nhận Dragon Crystals, Pet hoặc Trứng Rồng nhé!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {incomingGifts.map((gift) => (
                        <div
                          key={gift.id}
                          className="p-4 rounded-2xl bg-slate-950 border-2 border-purple-500/40 flex flex-wrap items-center justify-between gap-4 shadow-lg"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={gift.senderPhoto || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + gift.senderUid}
                              alt={gift.senderName}
                              className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover shrink-0"
                            />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{gift.senderName}</span>
                                <span className="text-[10px] text-purple-400">({gift.senderEmail})</span>
                              </div>
                              <div className="text-xs font-black text-amber-300 mt-0.5 flex items-center gap-1.5">
                                {gift.giftType === 'crystals' ? (
                                  <span>💎 Tặng bạn {gift.crystals} Dragon Crystals</span>
                                ) : gift.giftType === 'pet' && gift.petData ? (
                                  <span>🐾 Tặng bạn Pet: {gift.petData.name} (Cấp {gift.petData.level || 1})</span>
                                ) : (
                                  <span>🥚 Tặng bạn Trứng: {gift.eggData?.eggType || 'Trứng Thần'}</span>
                                )}
                              </div>
                              {gift.message && (
                                <div className="text-[11px] text-slate-400 italic mt-0.5">
                                  💬 "{gift.message}"
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleClaimGift(gift)}
                              disabled={claimingGiftIds.includes(gift.id) || isClaimingAll}
                              className={`px-4 py-2 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 transition-all ${
                                claimingGiftIds.includes(gift.id) || isClaimingAll
                                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-70'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white cursor-pointer active:scale-95'
                              }`}
                            >
                              <Gift className="w-3.5 h-3.5" />
                              <span>{claimingGiftIds.includes(gift.id) ? 'Đang nhận...' : 'Nhận Quà'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 3: SENT HISTORY */}
              {donateSubTab === 'sent' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    📜 Lịch Sử Quà Bạn Đã Tặng ({sentGifts.length})
                  </h4>

                  {sentGifts.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800 text-xs">
                      Bạn chưa gửi món quà nào cho ai. Hãy bấm "Gửi Quà Tặng" ở trên!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sentGifts.map((gift) => (
                        <div
                          key={gift.id}
                          className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="text-slate-300">
                              Gửi tới: <b className="text-white">{gift.targetName || gift.targetEmail}</b>
                            </div>
                            <div className="text-[11px] text-amber-300 font-bold">
                              {gift.giftType === 'crystals'
                                ? `💎 ${gift.crystals} Crystals`
                                : gift.giftType === 'pet'
                                ? `🐾 Pet ${gift.petData?.name}`
                                : `🥚 Trứng ${gift.eggData?.eggType}`}
                            </div>
                            {gift.message && <div className="text-[10px] text-slate-500 italic">"{gift.message}"</div>}
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                              Đã lưu trên Cloud
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'trade' ? (
            /* TAB 3: PET TRADE */
            <div className="space-y-6">
              {/* Send Trade Proposal Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3">
                <h4 className="text-xs font-black text-amber-300 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                  <span>Gửi Kèo Trade Pet Cho Người Chơi Khác</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">1. Chọn Pet của bạn mang đi trade:</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      value={selectedMyPet ? selectedMyPet.id : ''}
                      onChange={(e) => {
                        const found = hatchedPets.find((p) => p.id === e.target.value);
                        setSelectedMyPet(found || null);
                      }}
                    >
                      <option value="">-- Chọn Pet của bạn --</option>
                      {hatchedPets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.avatarIcon} {p.name} (Cấp {p.level || 1})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">2. Chọn người chơi muốn gửi kèo:</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      value={selectedTargetPlayer ? selectedTargetPlayer.uid : ''}
                      onChange={(e) => {
                        const found = allAccounts.find((p) => p.uid === e.target.value);
                        if (found) {
                          setSelectedTargetPlayer({
                            uid: found.uid,
                            displayName: found.displayName,
                            photoURL: found.photoURL || '',
                            crystals: found.crystals || 0,
                            wins: found.wins || 0,
                            activePetName: found.activePetName || 'Chưa có',
                            activePetPower: found.activePetPower || 100,
                            lastActive: found.lastActive,
                          });
                        } else {
                          setSelectedTargetPlayer(null);
                        }
                      }}
                    >
                      <option value="">-- Chọn người chơi nhận --</option>
                      {allAccounts
                        .filter((p) => p.uid !== user?.uid)
                        .map((p) => (
                          <option key={p.uid} value={p.uid}>
                            {p.displayName} ({p.isOnline ? 'Online' : 'Offline'})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold">3. Pet bạn muốn đối phương đổi lại (Ghi chú):</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cần pet hệ Băng hoặc Cấp > 15..."
                    value={requestedPetQuery}
                    onChange={(e) => setRequestedPetQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={sendTradeProposal}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Xác Nhận Gửi Lời Mời Trade Pet</span>
                </button>
              </div>

              {/* Incoming Trade Requests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>📥 Kèo Trade Người Khác Gửi Tới Bạn</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                    {incomingRequests.length}
                  </span>
                </h4>

                {incomingRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/80 text-xs">
                    Không có kèo trade nào đang chờ bạn phê duyệt.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/50 flex flex-wrap items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={req.senderPhoto || 'https://api.dicebear.com/7.x/bottts/svg?seed=sender'}
                            alt={req.senderName}
                            className="w-10 h-10 rounded-full border border-amber-500 object-cover"
                          />
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1">
                              <span>{req.senderName}</span>
                              <span className="text-[10px] text-amber-400">muốn trade:</span>
                            </div>
                            <div className="text-xs font-black text-amber-200 flex items-center gap-1.5 mt-0.5">
                              <span>
                                {req.offeredPet.avatarIcon} {req.offeredPet.name}
                              </span>
                              <span className="text-[10px] font-normal text-slate-400">
                                (Cấp {req.offeredPet.level || 1})
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 italic">Yêu cầu: "{req.requestedPetName}"</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => acceptTradeRequest(req)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Đồng Ý</span>
                          </button>
                          <button
                            onClick={() => declineTradeRequest(req.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                          >
                            Từ Chối
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Trade Requests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  📤 Kèo Trade Bạn Đang Gửi Đi ({outgoingRequests.length})
                </h4>
                {outgoingRequests.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/80 text-xs">
                    Bạn chưa gửi kèo trade nào.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {outgoingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="text-slate-300">
                            Gửi tới: <b className="text-white">{req.targetName}</b> | Đề xuất đổi:{' '}
                            <span className="text-amber-300 font-bold">{req.offeredPet.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Trạng thái: Đang chờ phản hồi...</div>
                        </div>
                        <button
                          onClick={() => declineTradeRequest(req.id)}
                          className="px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30 text-[11px] font-bold cursor-pointer hover:bg-rose-900"
                        >
                          Thu Hồi
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 4: LEADERBOARD */
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Bảng Xếp Hạng Top Đấu Sĩ & Sưu Tầm Kim Cương
              </h4>

              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.uid}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      entry.uid === user?.uid
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          index === 0
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50'
                            : index === 1
                            ? 'bg-slate-300 text-slate-950'
                            : index === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <img
                        src={entry.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=lb'}
                        alt={entry.displayName}
                        className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <span>{entry.displayName}</span>
                          {entry.uid === user?.uid && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">Trận thắng PvP: {entry.wins}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-xs sm:text-sm text-amber-400 flex items-center gap-1 justify-end">
                        <span>💎 {entry.crystals}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Dragon Crystals</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
