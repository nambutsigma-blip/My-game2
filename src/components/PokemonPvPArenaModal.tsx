import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Swords,
  Shield,
  Zap,
  Flame,
  Sparkles,
  RefreshCw,
  Trophy,
  ArrowRight,
  Heart,
  ChevronLeft,
  Award,
  Star,
  Users,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetCompanion, PokemonBattleMove, BattleHistoryRecord } from '../types';
import { PokemonPetVisual, getDefaultAppearance } from './PokemonPetVisual';
import { BattleHistoryModal } from './BattleHistoryModal';
import {
  addBattleRecord,
  getBattleHistory,
  getBattleStats,
} from '../utils/battleHistoryManager';
import {
  GYM_LEADERS,
  PokemonGymLeader,
  generatePetPokemonMoves,
  calculateTypeMultiplier,
} from '../data/pokemonMoves';
import {
  playPokemonAttackSound,
  playSuperEffectiveSound,
  playPokemonFaintSound,
  playSuccessChime,
  playLaser,
} from '../utils/soundEffects';

interface PokemonPvPArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets?: PetCompanion[];
  hatchedPets?: PetCompanion[];
  playerCrystals?: number;
  dragonCrystals?: number;
  onAddCrystals?: (amount: number) => void;
  onAddDragonCrystals?: (amount: number) => void;
  onPetGainExp?: (petId: string, expAmount: number) => void;
  onOpenHatchery?: () => void;
  onOpenAppearanceStudio?: (petId?: string) => void;
}

export const PokemonPvPArenaModal: React.FC<PokemonPvPArenaModalProps> = ({
  isOpen,
  onClose,
  pets,
  hatchedPets,
  playerCrystals,
  dragonCrystals,
  onAddCrystals,
  onAddDragonCrystals,
  onPetGainExp,
  onOpenHatchery,
  onOpenAppearanceStudio,
}) => {
  const petList = pets || hatchedPets || [];
  const crystalsCount = dragonCrystals ?? playerCrystals ?? 0;

  // Game Modes: 'select_gym' | 'battle' | 'victory' | 'defeat'
  const [battlePhase, setBattlePhase] = useState<'select_gym' | 'battle' | 'victory' | 'defeat'>('select_gym');
  const [selectedGymLeader, setSelectedGymLeader] = useState<PokemonGymLeader>(GYM_LEADERS[0]);

  // Selected Player Battler
  const [activePlayerPetId, setActivePlayerPetId] = useState<string>(() => petList[0]?.id || '');
  const activePlayerPet = petList.find((p) => p.id === activePlayerPetId) || petList[0];

  // Battle State
  const [playerMaxHp, setPlayerMaxHp] = useState<number>(200);
  const [playerHp, setPlayerHp] = useState<number>(200);
  const [playerStatus, setPlayerStatus] = useState<string | null>(null);
  const [playerAttackBuff, setPlayerAttackBuff] = useState<number>(1.0);

  const [opponentMaxHp, setOpponentMaxHp] = useState<number>(200);
  const [opponentHp, setOpponentHp] = useState<number>(200);
  const [opponentStatus, setOpponentStatus] = useState<string | null>(null);
  const [opponentAttackBuff, setOpponentAttackBuff] = useState<number>(1.0);

  // Moves
  const [playerMoves, setPlayerMoves] = useState<PokemonBattleMove[]>([]);
  const [opponentMoves, setOpponentMoves] = useState<PokemonBattleMove[]>([]);

  // Turn & Anim States
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [battleMenuTab, setBattleMenuTab] = useState<'main' | 'moves' | 'party' | 'bag'>('main');

  // Animation states for visuals
  const [playerAnimState, setPlayerAnimState] = useState<'idle' | 'attack' | 'hit' | 'special' | 'victory' | 'faint'>('idle');
  const [opponentAnimState, setOpponentAnimState] = useState<'idle' | 'attack' | 'hit' | 'special' | 'victory' | 'faint'>('idle');
  const [playerActionClass, setPlayerActionClass] = useState<string>('');
  const [opponentActionClass, setOpponentActionClass] = useState<string>('');
  const [floatingDamage, setFloatingDamage] = useState<{
    target: 'player' | 'opponent';
    text: string;
    isCrit?: boolean;
    isHeal?: boolean;
  } | null>(null);
  const [combatFx, setCombatFx] = useState<{ type: string; text: string; x: number; y: number } | null>(null);

  // Battle Dialogue Text
  const [battleLog, setBattleLog] = useState<string>('Trận đấu bắt đầu! Bạn muốn làm gì?');
  const [bagPotions, setBagPotions] = useState<number>(3);
  const [bagFullRestores, setBagFullRestores] = useState<number>(1);

  // Track Won Badges
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('remix_pokemon_badges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Battle History State & Analytics
  const [isBattleHistoryOpen, setIsBattleHistoryOpen] = useState<boolean>(false);
  const [battleHistory, setBattleHistory] = useState<BattleHistoryRecord[]>(() => getBattleHistory());
  const [battleTurns, setBattleTurns] = useState<number>(1);
  const [lastDefeatLoss, setLastDefeatLoss] = useState<number>(0);

  // Sync battle history when modal opens or records update
  useEffect(() => {
    const handleHistoryUpdate = () => {
      setBattleHistory(getBattleHistory());
    };
    window.addEventListener('pokemon_battle_history_updated', handleHistoryUpdate);
    return () => {
      window.removeEventListener('pokemon_battle_history_updated', handleHistoryUpdate);
    };
  }, []);

  const arenaStats = getBattleStats(battleHistory);

  // Calculate HP based on level and tier
  const calculateHp = (pet: PetCompanion) => {
    const level = pet.level || 1;
    const tier = pet.tierRank || 1;
    return Math.floor(120 + level * 8 + tier * 15);
  };

  // Auto clear floating damage badges
  useEffect(() => {
    if (floatingDamage) {
      const timer = setTimeout(() => setFloatingDamage(null), 950);
      return () => clearTimeout(timer);
    }
  }, [floatingDamage]);

  // Start Battle with selected Gym Leader
  const handleStartGymBattle = (leader: PokemonGymLeader) => {
    setSelectedGymLeader(leader);
    const pMax = calculateHp(activePlayerPet);
    const oMax = calculateHp(leader.pet);

    setPlayerMaxHp(pMax);
    setPlayerHp(pMax);
    setPlayerStatus(null);
    setPlayerAttackBuff(1.0);

    setOpponentMaxHp(oMax);
    setOpponentHp(oMax);
    setOpponentStatus(null);
    setOpponentAttackBuff(1.0);

    setPlayerMoves(generatePetPokemonMoves(activePlayerPet));
    setOpponentMoves(generatePetPokemonMoves(leader.pet));

    setPlayerAnimState('idle');
    setOpponentAnimState('idle');
    setPlayerActionClass('');
    setOpponentActionClass('');
    setFloatingDamage(null);
    setBattleMenuTab('main');
    setIsPlayerTurn(true);
    setIsBusy(false);
    setBattleTurns(1);
    setLastDefeatLoss(0);

    setBattleLog(`Huấn luyện viên ${leader.name} đã cử ${leader.pet.name} ra sân! Bạn hãy chọn chiêu thức!`);
    setBattlePhase('battle');
    playLaser();
  };

  // Switch pet during battle
  const handleSwitchPetInBattle = (newPet: PetCompanion) => {
    if (newPet.id === activePlayerPet.id) return;
    setIsBusy(true);
    setBattleMenuTab('main');

    setBattleLog(`Trở về, ${activePlayerPet.name}! Ra trận đi, ${newPet.name}!`);
    setActivePlayerPetId(newPet.id);

    const newMaxHp = calculateHp(newPet);
    setPlayerMaxHp(newMaxHp);
    setPlayerHp(newMaxHp);
    setPlayerMoves(generatePetPokemonMoves(newPet));
    setPlayerAnimState('idle');
    setPlayerActionClass('');
    setOpponentActionClass('');

    playSuccessChime();

    // Enemy attacks during switch turn
    setTimeout(() => {
      triggerOpponentTurn();
    }, 1200);
  };

  // Player uses a move
  const handleExecutePlayerMove = (move: PokemonBattleMove) => {
    if (!isPlayerTurn || isBusy) return;
    setIsBusy(true);
    setBattleTurns((prev) => prev + 1);
    setBattleMenuTab('main');

    // 1. Move announce
    setBattleLog(`${activePlayerPet.name} sử dụng ${move.name}!`);

    // 2. Play attack animation - trigger attackLunge
    setPlayerAnimState(move.category === 'special' ? 'special' : 'attack');
    setPlayerActionClass('attackLunge');
    playPokemonAttackSound(move.category === 'special' ? 'special' : 'physical');

    setTimeout(() => {
      setPlayerAnimState('idle');
      setPlayerActionClass('');

      if (move.category === 'status') {
        if (move.statusEffect === 'heal') {
          const healAmount = Math.floor(playerMaxHp * 0.35);
          setPlayerHp((prev) => Math.min(playerMaxHp, prev + healAmount));
          playSuccessChime();
          setBattleLog(`${activePlayerPet.name} đã hồi phục ${healAmount} HP!`);
          setFloatingDamage({ target: 'player', text: `+${healAmount}`, isHeal: true });
        } else {
          setPlayerAttackBuff((prev) => prev + 0.45);
          playSuccessChime();
          setBattleLog(`Sức tấn công của ${activePlayerPet.name} tăng mạnh vọt lên!`);
          setFloatingDamage({ target: 'player', text: 'TĂNG CÔNG!', isHeal: true });
        }
      } else {
        // Attack calculation
        const typeMult = calculateTypeMultiplier(move.type, selectedGymLeader.pet.element);
        const isCrit = Math.random() < 0.15;
        const critMult = isCrit ? 1.5 : 1.0;
        const baseDmg = Math.floor((move.power * 0.9 + (activePlayerPet.level || 1) * 3) * playerAttackBuff * typeMult * critMult);

        // Flash opponent hit - trigger hitFlash
        setOpponentAnimState('hit');
        setOpponentActionClass('hitFlash');
        setFloatingDamage({
          target: 'opponent',
          text: `${isCrit ? '💥 CRIT ' : '-'}${baseDmg}`,
          isCrit,
        });

        if (typeMult > 1.2) {
          playSuperEffectiveSound();
        } else {
          playPokemonAttackSound('super');
        }

        const newOppHp = Math.max(0, opponentHp - baseDmg);
        setOpponentHp(newOppHp);

        // Feedback log
        let extraNote = '';
        if (typeMult > 1.2) extraNote += ' Siêu hiệu quả (Super Effective)!';
        else if (typeMult < 0.8) extraNote += ' Không hiệu quả lắm...';
        if (isCrit) extraNote += ' Đòn đánh chí mạng!';

        setBattleLog(`Gây ${baseDmg} sát thương lên ${selectedGymLeader.pet.name}!${extraNote}`);

        // Reset hitFlash after animation duration
        setTimeout(() => {
          setOpponentActionClass('');
          setOpponentAnimState('idle');
        }, 550);

        // Check if opponent fainted
        if (newOppHp <= 0) {
          setTimeout(() => {
            handleOpponentFaint();
          }, 1200);
          return;
        }
      }

      // Transition to Opponent Turn
      setTimeout(() => {
        setOpponentAnimState('idle');
        triggerOpponentTurn();
      }, 1400);
    }, 600);
  };

  // Opponent AI turn
  const triggerOpponentTurn = () => {
    setIsPlayerTurn(false);

    // AI selects a move
    const moves = opponentMoves.length > 0 ? opponentMoves : generatePetPokemonMoves(selectedGymLeader.pet);
    const chosenMove = moves[Math.floor(Math.random() * moves.length)];

    setBattleLog(`Đối thủ ${selectedGymLeader.pet.name} sử dụng ${chosenMove.name}!`);
    // Trigger opponent attackLunge
    setOpponentAnimState(chosenMove.category === 'special' ? 'special' : 'attack');
    setOpponentActionClass('attackLunge');
    playPokemonAttackSound(chosenMove.category === 'special' ? 'special' : 'physical');

    setTimeout(() => {
      setOpponentAnimState('idle');
      setOpponentActionClass('');

      if (chosenMove.category === 'status') {
        if (chosenMove.statusEffect === 'heal') {
          const healAmount = Math.floor(opponentMaxHp * 0.3);
          setOpponentHp((prev) => Math.min(opponentMaxHp, prev + healAmount));
          setBattleLog(`Đối thủ ${selectedGymLeader.pet.name} đã hồi phục ${healAmount} HP!`);
          setFloatingDamage({ target: 'opponent', text: `+${healAmount}`, isHeal: true });
        } else {
          setOpponentAttackBuff((prev) => prev + 0.35);
          setBattleLog(`Sức mạnh của đối thủ ${selectedGymLeader.pet.name} tăng lên!`);
          setFloatingDamage({ target: 'opponent', text: 'TĂNG CÔNG!', isHeal: true });
        }
      } else {
        const typeMult = calculateTypeMultiplier(chosenMove.type, activePlayerPet.element);
        const isCrit = Math.random() < 0.12;
        const critMult = isCrit ? 1.5 : 1.0;
        const baseDmg = Math.floor(
          (chosenMove.power * 0.75 + (selectedGymLeader.pet.level || 1) * 2.8) * opponentAttackBuff * typeMult * critMult
        );

        // Trigger player hitFlash
        setPlayerAnimState('hit');
        setPlayerActionClass('hitFlash');
        setFloatingDamage({
          target: 'player',
          text: `${isCrit ? '💥 CRIT ' : '-'}${baseDmg}`,
          isCrit,
        });
        playPokemonAttackSound('physical');

        const newPlayerHp = Math.max(0, playerHp - baseDmg);
        setPlayerHp(newPlayerHp);

        let extraNote = '';
        if (typeMult > 1.2) extraNote += ' Đòn đánh siêu hiệu quả!';
        if (isCrit) extraNote += ' Đòn chí mạng!';

        setBattleLog(`${selectedGymLeader.pet.name} gây ${baseDmg} sát thương lên ${activePlayerPet.name}!${extraNote}`);

        // Reset hitFlash after animation duration
        setTimeout(() => {
          setPlayerActionClass('');
          setPlayerAnimState('idle');
        }, 550);

        if (newPlayerHp <= 0) {
          setTimeout(() => {
            handlePlayerFaint();
          }, 1200);
          return;
        }
      }

      setTimeout(() => {
        setPlayerAnimState('idle');
        setIsPlayerTurn(true);
        setIsBusy(false);
        setBattleLog('Lượt của bạn! Hãy ra lệnh chiến đấu!');
      }, 1200);
    }, 600);
  };

  // Player uses item
  const handleUsePotion = () => {
    if (bagPotions <= 0 || !isPlayerTurn || isBusy) return;
    setIsBusy(true);
    setBagPotions((prev) => prev - 1);
    const healVal = 80;
    setPlayerHp((prev) => Math.min(playerMaxHp, prev + healVal));
    playSuccessChime();
    setBattleLog(`Bạn dùng Potion! ${activePlayerPet.name} hồi phục 80 HP!`);

    setTimeout(() => {
      triggerOpponentTurn();
    }, 1200);
  };

  const handleUseFullRestore = () => {
    if (bagFullRestores <= 0 || !isPlayerTurn || isBusy) return;
    setIsBusy(true);
    setBagFullRestores((prev) => prev - 1);
    setPlayerHp(playerMaxHp);
    playSuccessChime();
    setBattleLog(`Bạn dùng Tinh Thể Sáng Thế! ${activePlayerPet.name} hồi phục đầy 100% HP!`);

    setTimeout(() => {
      triggerOpponentTurn();
    }, 1200);
  };

  // Opponent Faints (Victory)
  const handleOpponentFaint = () => {
    playPokemonFaintSound();
    setOpponentAnimState('faint');
    setBattleLog(`Đối thủ ${selectedGymLeader.pet.name} đã ngã gục! Bạn đã giành CHIẾN THẮNG!`);

    setTimeout(() => {
      setBattlePhase('victory');
      if (onAddDragonCrystals) {
        onAddDragonCrystals(selectedGymLeader.rewardCrystals);
      }
      if (onAddCrystals) {
        onAddCrystals(selectedGymLeader.rewardCrystals);
      }
      if (onPetGainExp && activePlayerPet) {
        onPetGainExp(activePlayerPet.id, selectedGymLeader.rewardExp);
      }

      // Unlock badge
      if (!unlockedBadges.includes(selectedGymLeader.badge)) {
        const updated = [...unlockedBadges, selectedGymLeader.badge];
        setUnlockedBadges(updated);
        try {
          localStorage.setItem('remix_pokemon_badges', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }

      // Record victory in Battle History
      addBattleRecord({
        outcome: 'victory',
        playerPetName: activePlayerPet.name,
        playerPetAvatar: activePlayerPet.avatarIcon,
        playerPetElement: activePlayerPet.element,
        playerPetLevel: activePlayerPet.level || 1,
        opponentName: selectedGymLeader.name,
        opponentTitle: selectedGymLeader.title,
        opponentPetName: selectedGymLeader.pet.name,
        opponentPetAvatar: selectedGymLeader.pet.avatarIcon,
        opponentPetElement: selectedGymLeader.pet.element,
        opponentPetLevel: selectedGymLeader.pet.level || 1,
        crystalDelta: selectedGymLeader.rewardCrystals,
        rewardExp: selectedGymLeader.rewardExp,
        badgeEarned: selectedGymLeader.badge,
        badgeIcon: selectedGymLeader.badgeIcon,
        turnsCount: Math.max(1, battleTurns),
      });
      setBattleHistory(getBattleHistory());

      playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
      });
    }, 1500);
  };

  // Player Faints (Defeat)
  const handlePlayerFaint = () => {
    playPokemonFaintSound();
    setPlayerAnimState('faint');
    setBattleLog(`${activePlayerPet.name} đã ngã gục... Bạn đã thua trận!`);

    // Calculate crystal loss penalty (e.g. 25% of reward, minimum 10, capped by current crystals)
    const crystalLoss = Math.min(crystalsCount, Math.max(10, Math.floor(selectedGymLeader.rewardCrystals * 0.25)));
    setLastDefeatLoss(crystalLoss);

    setTimeout(() => {
      setBattlePhase('defeat');

      if (crystalLoss > 0) {
        if (onAddDragonCrystals) {
          onAddDragonCrystals(-crystalLoss);
        }
        if (onAddCrystals) {
          onAddCrystals(-crystalLoss);
        }
      }

      // Record defeat in Battle History
      addBattleRecord({
        outcome: 'defeat',
        playerPetName: activePlayerPet.name,
        playerPetAvatar: activePlayerPet.avatarIcon,
        playerPetElement: activePlayerPet.element,
        playerPetLevel: activePlayerPet.level || 1,
        opponentName: selectedGymLeader.name,
        opponentTitle: selectedGymLeader.title,
        opponentPetName: selectedGymLeader.pet.name,
        opponentPetAvatar: selectedGymLeader.pet.avatarIcon,
        opponentPetElement: selectedGymLeader.pet.element,
        opponentPetLevel: selectedGymLeader.pet.level || 1,
        crystalDelta: -crystalLoss,
        turnsCount: Math.max(1, battleTurns),
      });
      setBattleHistory(getBattleHistory());
    }, 1500);
  };

  if (!isOpen) return null;

  if (petList.length === 0 || !activePlayerPet) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-center space-y-4 text-white shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
            ⚔️
          </div>
          <h3 className="text-lg font-bold text-amber-300">Chưa Có Linh Thú Xuất Trận</h3>
          <p className="text-xs text-slate-300">
            Bạn cần có ít nhất 1 linh thú đồng hành để tham gia Đấu Trường Thủ Lĩnh Pet! Hãy ấp trứng tại Nhà Ấp để mở khóa thú cưng.
          </p>
          <div className="flex flex-col gap-2">
            {onOpenHatchery && (
              <button
                onClick={onOpenHatchery}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Mở Nhà Ấp Trứng
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-950 border-2 border-red-500/60 rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden text-white relative">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-lg shadow-md">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-white">Đấu Trường Pet PvP</span>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  PET BATTLE LEAGUE
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Khiêu chiến các Thủ Lĩnh Võ Đài & Huấn Luyện Viên Huyền Thoại
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="header-open-battle-history-btn"
              onClick={() => setIsBattleHistoryOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Xem Lịch Sử Chiến Đấu Võ Đài"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Lịch Sử Đấu</span>
              {battleHistory.length > 0 && (
                <span className="bg-amber-500/30 text-amber-200 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                  {battleHistory.length}
                </span>
              )}
            </button>

            {onOpenAppearanceStudio && (
              <button
                onClick={() => onOpenAppearanceStudio(activePlayerPet?.id)}
                className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-purple-200 text-xs font-bold items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <span>🎨 Đổi Ngoại Hình</span>
              </button>
            )}
            <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <span>💎</span>
              <span>{crystalsCount}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- VIEW 1: SELECT GYM LEADER --- */}
        {battlePhase === 'select_gym' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Active Battler Pet selector */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden">
                  <PokemonPetVisual pet={activePlayerPet} size="sm" showAura={false} showShadow={false} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Pet Xuất Trận Chính:</div>
                  <div className="text-base font-black text-amber-400 flex items-center gap-1.5">
                    <span>{activePlayerPet.name}</span>
                    <span className="text-xs text-slate-300 font-bold">Lv.{activePlayerPet.level || 1}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Hệ: <span className="text-cyan-300 font-bold uppercase">{activePlayerPet.element}</span> • HP: {calculateHp(activePlayerPet)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Đổi Pet:</span>
                <select
                  value={activePlayerPetId}
                  onChange={(e) => setActivePlayerPetId(e.target.value)}
                  className="bg-slate-950 text-amber-300 font-bold text-xs py-2 px-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {petList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.avatarIcon} {p.name} (Lv.{p.level || 1} • {p.element.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Badges Collection Showcase */}
            {unlockedBadges.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-amber-500/30 flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-amber-400 whitespace-nowrap flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> Huy Hiệu Đã Đạt ({unlockedBadges.length}/8):
                </span>
                <div className="flex items-center gap-2">
                  {unlockedBadges.map((b, idx) => (
                    <span key={idx} className="bg-slate-950 border border-amber-500/40 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-300 shadow">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Battle History & Performance Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow">
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold flex-shrink-0">
                  📜
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-white">Thành Tích Võ Đài:</span>
                    <span className="font-bold text-emerald-400">{arenaStats.wins} Thắng</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-bold text-rose-400">{arenaStats.losses} Thua</span>
                    <span className="text-slate-400 text-[11px]">({arenaStats.winRate}% Thắng)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>Biến động Tinh Thể ròng:</span>
                    <span className={`font-black ${arenaStats.netCrystals >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {arenaStats.netCrystals > 0 ? `+${arenaStats.netCrystals}` : arenaStats.netCrystals} 💎
                    </span>
                  </div>
                </div>
              </div>

              <button
                id="arena-open-battle-history-banner-btn"
                onClick={() => setIsBattleHistoryOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer hover:border-amber-500/50 active:scale-95"
              >
                <History className="w-3.5 h-3.5" />
                <span>Xem Nhật Ký Đấu ({battleHistory.length})</span>
              </button>
            </div>

            {/* Gym Leader Cards Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Chọn Thủ Lĩnh Võ Đài Để Khiêu Chiến:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {GYM_LEADERS.map((leader) => {
                  const hasWon = unlockedBadges.includes(leader.badge);
                  return (
                    <div
                      key={leader.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        hasWon
                          ? 'bg-slate-900/80 border-amber-500/40 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl shadow">
                            {leader.trainerAvatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-white">{leader.name}</span>
                              {hasWon && (
                                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/40">
                                  ĐÃ THẮNG 🏆
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-bold">{leader.title}</div>
                            <div className="text-[11px] text-amber-400 flex items-center gap-1 mt-0.5">
                              <span>{leader.badgeIcon}</span>
                              <span>{leader.badge}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pet Preview */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                            <PokemonPetVisual pet={leader.pet} size="xs" showAura={false} showShadow={false} />
                          </div>
                          <span className="text-[10px] font-black text-cyan-300 mt-1">
                            Lv.{leader.pet.level}
                          </span>
                        </div>
                      </div>

                      {/* Dialogue quote */}
                      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs italic text-slate-300">
                        "{leader.dialogueIntro}"
                      </div>

                      {/* Action / Rewards */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3 text-xs font-bold">
                          <span className="text-amber-400 flex items-center gap-1">
                            💎 +{leader.rewardCrystals}
                          </span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            ⭐ +{leader.rewardExp} EXP
                          </span>
                        </div>

                        <button
                          onClick={() => handleStartGymBattle(leader)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-black text-xs shadow-md shadow-red-950 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <span>THÁCH ĐẤU</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 2: ACTIVE POKEMON BATTLE FIELD --- */}
        {battlePhase === 'battle' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* The 3D Battle Arena Stage */}
            <div className="flex-1 min-h-[300px] relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none">
              {/* Stadium lines & ambient lighting */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent pointer-events-none" />

              {/* 1. TOP-RIGHT: OPPONENT PET & HUD CARD */}
              <div className="flex justify-end items-start w-full relative z-10">
                {/* Opponent Pokemon HUD Card */}
                <div className="w-64 sm:w-72 bg-slate-950/90 backdrop-blur-md rounded-2xl border-2 border-slate-700/80 p-3 shadow-xl space-y-1.5 mr-2 sm:mr-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm text-white">{selectedGymLeader.pet.name}</span>
                      <span className="text-[10px] bg-red-950 text-red-300 font-extrabold px-1.5 py-0.2 rounded uppercase border border-red-700/50">
                        {selectedGymLeader.pet.element}
                      </span>
                    </div>
                    <span className="text-xs font-black text-amber-400">Lv.{selectedGymLeader.pet.level}</span>
                  </div>

                  {/* HP Bar */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>HP</span>
                      <span>
                        {opponentHp} / {opponentMaxHp}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          opponentHp / opponentMaxHp > 0.5
                            ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                            : opponentHp / opponentMaxHp > 0.2
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                        }`}
                        style={{ width: `${Math.max(0, (opponentHp / opponentMaxHp) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Opponent Sprite Stage Platform */}
                <div
                  id="pvp-opponent-stage"
                  data-combatant="opponent"
                  className={`relative flex flex-col items-center justify-center opponent-stage ${opponentActionClass}`}
                >
                  {/* Impact Slash / Burst when hitFlash */}
                  {opponentActionClass === 'hitFlash' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      <div className="w-24 h-24 rounded-full border-4 border-rose-500 animate-ping opacity-80" />
                      <span className="text-3xl animate-bounce">💥</span>
                    </div>
                  )}

                  {/* Floating Combat Text */}
                  {floatingDamage && floatingDamage.target === 'opponent' && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 animate-float-damage whitespace-nowrap pointer-events-none">
                      <div className={`px-3 py-1 rounded-xl font-black text-xs shadow-2xl flex items-center gap-1 border ${
                        floatingDamage.isHeal
                          ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/60'
                          : floatingDamage.isCrit
                          ? 'bg-rose-950/95 text-rose-200 border-rose-500 text-sm scale-110 shadow-rose-900/50'
                          : 'bg-amber-950/95 text-amber-300 border-amber-500/50'
                      }`}>
                        <span>{floatingDamage.isHeal ? '💚 +' : '⚡'}</span>
                        <span>{floatingDamage.text}</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute -bottom-2 w-32 h-10 rounded-[100%] bg-emerald-900/40 border border-emerald-500/30 blur-[1px]" />
                  <PokemonPetVisual
                    pet={selectedGymLeader.pet}
                    size="battle-front"
                    facing="front"
                    combatState={opponentAnimState}
                    className={opponentActionClass}
                    showAura={true}
                    showShadow={false}
                  />
                </div>
              </div>

              {/* 2. BOTTOM-LEFT: PLAYER PET (BACK-VIEW) & HUD CARD */}
              <div className="flex justify-between items-end w-full relative z-10">
                {/* Player Sprite Stage Platform (Back-View Pokemon) */}
                <div
                  id="pvp-player-stage"
                  data-combatant="player"
                  className={`relative flex flex-col items-center justify-center ml-2 sm:ml-6 player-stage ${playerActionClass}`}
                >
                  {/* Impact Slash / Burst when hitFlash */}
                  {playerActionClass === 'hitFlash' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      <div className="w-24 h-24 rounded-full border-4 border-rose-500 animate-ping opacity-80" />
                      <span className="text-3xl animate-bounce">💥</span>
                    </div>
                  )}

                  {/* Floating Combat Text */}
                  {floatingDamage && floatingDamage.target === 'player' && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 animate-float-damage whitespace-nowrap pointer-events-none">
                      <div className={`px-3 py-1 rounded-xl font-black text-xs shadow-2xl flex items-center gap-1 border ${
                        floatingDamage.isHeal
                          ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/60'
                          : floatingDamage.isCrit
                          ? 'bg-rose-950/95 text-rose-200 border-rose-500 text-sm scale-110 shadow-rose-900/50'
                          : 'bg-rose-950/95 text-rose-300 border-rose-500/50'
                      }`}>
                        <span>{floatingDamage.isHeal ? '💚 +' : '⚡'}</span>
                        <span>{floatingDamage.text}</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute -bottom-2 w-36 h-12 rounded-[100%] bg-blue-900/40 border border-cyan-500/30 blur-[1px]" />
                  <PokemonPetVisual
                    pet={activePlayerPet}
                    size="battle-back"
                    facing="back"
                    combatState={playerAnimState}
                    className={playerActionClass}
                    showAura={true}
                    showShadow={false}
                  />
                </div>

                {/* Player Pokemon HUD Card */}
                <div className="w-64 sm:w-72 bg-slate-950/90 backdrop-blur-md rounded-2xl border-2 border-cyan-500/40 p-3 shadow-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm text-white">{activePlayerPet.name}</span>
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 font-extrabold px-1.5 py-0.2 rounded uppercase border border-cyan-700/50">
                        {activePlayerPet.element}
                      </span>
                    </div>
                    <span className="text-xs font-black text-amber-400">Lv.{activePlayerPet.level || 1}</span>
                  </div>

                  {/* HP Bar */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>HP</span>
                      <span className="text-white font-mono">
                        {playerHp} / {playerMaxHp}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          playerHp / playerMaxHp > 0.5
                            ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                            : playerHp / playerMaxHp > 0.2
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                        }`}
                        style={{ width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {playerAttackBuff > 1.0 && (
                    <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> +{Math.round((playerAttackBuff - 1) * 100)}% Sức Công
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. CLASSIC POKEMON BOTTOM BATTLE CONSOLE */}
            <div className="bg-slate-950 p-3 sm:p-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[140px]">
              {/* Battle Dialogue Text Box (7 cols) */}
              <div className="md:col-span-6 bg-slate-900/90 rounded-2xl border-2 border-slate-800 p-3 sm:p-4 flex flex-col justify-between shadow-inner">
                <div className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed min-h-[48px]">
                  {battleLog}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    {isPlayerTurn ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LƯỢT CỦA BẠN
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> ĐỐI THỦ ĐANG RA CHIÊU...
                      </span>
                    )}
                  </span>

                  {battleMenuTab !== 'main' && (
                    <button
                      onClick={() => setBattleMenuTab('main')}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Quay Lại Menu
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Commands Panel (6 cols) */}
              <div className="md:col-span-6 flex flex-col justify-center">
                {/* MENU MODE 1: MAIN 4 COMMANDS */}
                {battleMenuTab === 'main' && (
                  <div className="grid grid-cols-2 gap-2 h-full">
                    <button
                      disabled={!isPlayerTurn || isBusy}
                      onClick={() => setBattleMenuTab('moves')}
                      className="p-3 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 text-white font-black text-xs sm:text-sm shadow-md shadow-red-950/60 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-red-400/40"
                    >
                      <Swords className="w-4 h-4" />
                      <span>CHIẾN ĐẤU (FIGHT)</span>
                    </button>

                    <button
                      disabled={!isPlayerTurn || isBusy}
                      onClick={() => setBattleMenuTab('party')}
                      className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-950/60 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-emerald-400/40"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>ĐỔI PET (POKÉMON)</span>
                    </button>

                    <button
                      disabled={!isPlayerTurn || isBusy}
                      onClick={() => setBattleMenuTab('bag')}
                      className="p-3 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-700 hover:from-amber-500 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-950/60 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-amber-400/40"
                    >
                      <Heart className="w-4 h-4" />
                      <span>TÚI ĐỒ (BAG)</span>
                    </button>

                    <button
                      disabled={!isPlayerTurn || isBusy}
                      onClick={() => setBattlePhase('select_gym')}
                      className="p-3 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm shadow cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <span>RÚT LUI (RUN)</span>
                    </button>
                  </div>
                )}

                {/* MENU MODE 2: 4 POKEMON MOVES */}
                {battleMenuTab === 'moves' && (
                  <div className="grid grid-cols-2 gap-2 h-full">
                    {playerMoves.map((m) => {
                      const typeMult = calculateTypeMultiplier(m.type, selectedGymLeader.pet.element);
                      return (
                        <button
                          key={m.id}
                          disabled={!isPlayerTurn || isBusy}
                          onClick={() => handleExecutePlayerMove(m)}
                          className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 text-left cursor-pointer transition-all active:scale-95 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white truncate">{m.name}</span>
                            <span className="text-[9px] font-mono text-slate-400">PP {m.pp}</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] mt-1">
                            <span className="font-black uppercase text-amber-400">
                              {m.category === 'status' ? 'Hiệu ứng' : `Uy lực: ${m.power}`}
                            </span>
                            {typeMult > 1.2 && (
                              <span className="bg-red-500 text-white font-black text-[9px] px-1 rounded animate-pulse">
                                x2 KHẮC HỆ
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* MENU MODE 3: SWITCH PET PARTY */}
                {battleMenuTab === 'party' && (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {petList.map((p) => (
                      <button
                        key={p.id}
                        disabled={p.id === activePlayerPet.id || isBusy}
                        onClick={() => handleSwitchPetInBattle(p)}
                        className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          p.id === activePlayerPet.id
                            ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 opacity-60'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-600 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{p.avatarIcon}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{p.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Lv.{p.level || 1} • Hệ {p.element.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        {p.id === activePlayerPet.id ? (
                          <span className="text-[10px] font-bold text-cyan-400">Đang Ra Trận</span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-400">Đổi Ra Sân ➔</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* MENU MODE 4: BAG (ITEMS) */}
                {battleMenuTab === 'bag' && (
                  <div className="grid grid-cols-2 gap-2 h-full">
                    <button
                      disabled={bagPotions <= 0 || !isPlayerTurn || isBusy}
                      onClick={handleUsePotion}
                      className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-left transition-all cursor-pointer disabled:opacity-40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">🧪 Potion</span>
                        <span className="text-xs font-mono font-bold text-white">x{bagPotions}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Hồi 80 HP cho thú cưng</div>
                    </button>

                    <button
                      disabled={bagFullRestores <= 0 || !isPlayerTurn || isBusy}
                      onClick={handleUseFullRestore}
                      className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-left transition-all cursor-pointer disabled:opacity-40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">💎 Sáng Thế</span>
                        <span className="text-xs font-mono font-bold text-white">x{bagFullRestores}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Hồi phục đầy 100% HP</div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 3: VICTORY SCREEN --- */}
        {battlePhase === 'victory' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/50 animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-amber-400">CHIẾN THẮNG HUY HOÀNG!</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Bạn đã đánh bại {selectedGymLeader.title} và hoàn thành thử thách!
              </p>
            </div>

            {/* Rewards Card */}
            <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-4 w-full max-w-sm space-y-2.5 shadow-xl">
              <div className="text-xs font-black text-slate-400 uppercase">Phần Thưởng Nhận Được</div>
              <div className="flex items-center justify-around py-2 border-y border-slate-800">
                <div className="text-center">
                  <div className="text-xl font-black text-amber-400">+{selectedGymLeader.rewardCrystals}</div>
                  <div className="text-[10px] text-slate-400">💎 Tinh Thể Rồng</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-emerald-400">+{selectedGymLeader.rewardExp}</div>
                  <div className="text-[10px] text-slate-400">⭐ EXP Linh Thú</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                <span className="text-2xl">{selectedGymLeader.badgeIcon}</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-amber-300">{selectedGymLeader.badge}</div>
                  <div className="text-[10px] text-slate-400">Huy hiệu đã được thêm vào bộ sưu tập!</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="victory-open-battle-history-btn"
                onClick={() => setIsBattleHistoryOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Xem Nhật Ký Trận Đấu</span>
              </button>

              <button
                onClick={() => setBattlePhase('select_gym')}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/60 cursor-pointer active:scale-95"
              >
                TIẾP TỤC ĐẤU TRƯỜNG ➔
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW 4: DEFEAT SCREEN --- */}
        {battlePhase === 'defeat' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl shadow">
              💔
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-red-400">THẤT BẠI TRONG TRẬN ĐẤU</h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Linh thú của bạn đã hết sinh lực. Hãy rèn luyện thêm cấp độ hoặc đổi sang hệ khắc chế đối thủ!
              </p>
            </div>

            {/* Defeat Loss Penalty card */}
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-3.5 w-full max-w-sm flex items-center justify-between text-xs shadow">
              <span className="text-slate-400 font-medium">Tổn thất Tinh Thể sau thất bại:</span>
              <span className="font-black text-rose-400 flex items-center gap-1">
                {lastDefeatLoss > 0 ? `-${lastDefeatLoss} 💎 Tinh Thể Rồng` : '0 💎'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                id="defeat-open-battle-history-btn"
                onClick={() => setIsBattleHistoryOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Xem Nhật Ký Đấu</span>
              </button>

              <button
                onClick={() => handleStartGymBattle(selectedGymLeader)}
                className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow cursor-pointer active:scale-95"
              >
                ĐẤU LẠI
              </button>

              <button
                onClick={() => setBattlePhase('select_gym')}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs shadow cursor-pointer"
              >
                CHỌN ĐỐI THỦ KHÁC
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Battle History Logs Modal */}
      <BattleHistoryModal
        isOpen={isBattleHistoryOpen}
        onClose={() => setIsBattleHistoryOpen(false)}
        onStartBattle={() => {
          setIsBattleHistoryOpen(false);
          setBattlePhase('select_gym');
        }}
        currentCrystals={crystalsCount}
      />
    </div>
  );
};
