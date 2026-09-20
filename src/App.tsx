/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Sparkles, Volume2, Eye, Zap, Mic, Flame, Award, Footprints, RotateCcw, Egg, ArrowRight, HelpCircle, Brain } from 'lucide-react';
import { StageType, UnitData, StolenEgg, PetCompanion, GameState, SkillTreeState, CreatureRarity, PetAppearance, EggTierType } from './types';
import { UNITS_DATA } from './data/unitsData';
import { getEnchantmentConfig, CREATURES_CATALOG } from './data/creaturesData';
import { getEvolvedPetForm } from './utils/petEvolution';
import { PET_SKILL_NODES, getPassiveBonuses, calculateTotalSpentCrystals } from './data/skillTreeData';
import { Navbar } from './components/Navbar';
import { AlertGauge } from './components/AlertGauge';
import { EmergencyRescueModal } from './components/EmergencyRescueModal';
import { Stage1EyeMonster } from './components/Stage1EyeMonster';
import { Stage2GrammarTrap } from './components/Stage2GrammarTrap';
import { Stage3VoiceCode } from './components/Stage3VoiceCode';
import { Stage4DragonChase } from './components/Stage4DragonChase';
import { HatcheryModal } from './components/HatcheryModal';
import { PetArenaModal } from './components/PetArenaModal';
import { PetSkillTreeModal } from './components/PetSkillTreeModal';
import { MissionCompleteModal } from './components/MissionCompleteModal';
import { RulesModal } from './components/RulesModal';
import { StudySystemModal } from './components/StudySystemModal';
import { OnlineMultiplayerModal } from './components/OnlineMultiplayerModal';
import { StealthPathTracker } from './components/StealthPathTracker';
import { PetAppearanceStudioModal } from './components/PetAppearanceStudioModal';
import { PokemonPvPArenaModal } from './components/PokemonPvPArenaModal';
import { SetAccountNameModal } from './components/SetAccountNameModal';
import { AiThinkingAssistantModal } from './components/AiThinkingAssistantModal';
import { AuthModal } from './components/AuthModal';
import { DailyMissionModal } from './components/DailyMissionModal';
import { DailyMissionBanner } from './components/DailyMissionBanner';
import { getDailyMissionData } from './utils/dailyMissionManager';
import { auth, onAuthStateChanged, signOut, updateProfile, User, db, collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from './lib/firebase';
import { AppUser, getStoredUser } from './utils/authHelper';
import { playAlarmSiren, playDragonGrowl, playBootsBonus, playSuccessChime } from './utils/soundEffects';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentUnitId, setCurrentUnitId] = useState<string>('unit-1');
  const [activeStage, setActiveStage] = useState<StageType>('stage1_eye');
  const [alertLevel, setAlertLevel] = useState<number>(0);
  const [stealthSteps, setStealthSteps] = useState<number>(0);
  const totalStepsNeeded = 10;
  const [stealthBoots, setStealthBoots] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('egg_thief_stealth_boots');
      const val = saved ? parseInt(saved, 10) : 1;
      return Number.isNaN(val) ? 1 : val;
    } catch {
      return 1;
    }
  });

  const [unlockedUnits, setUnlockedUnits] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('egg_thief_unlocked_units');
      return saved ? JSON.parse(saved) : ['unit-1', 'unit-2'];
    } catch {
      return ['unit-1', 'unit-2'];
    }
  });

  const [completedUnits, setCompletedUnits] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('egg_thief_completed_units');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stolenEggs, setStolenEggs] = useState<StolenEgg[]>(() => {
    try {
      const saved = localStorage.getItem('egg_thief_stolen_eggs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hatchedPets, setHatchedPets] = useState<PetCompanion[]>(() => {
    const starterDragon: PetCompanion = {
      id: 'starter-dragon-1',
      name: 'Pyra Junior',
      title: 'Young Flame Drake',
      rarity: 'rare',
      classification: 'living',
      element: 'fire',
      buffDescription: 'Tăng tốc độ tìm kiếm kho báu lửa.',
      hatchedAt: new Date().toISOString(),
      description: 'A loyal young wolf eager to assist explorers in their quest through the dragon sanctuary.',
      avatarIcon: '🔥',
      tierRank: 2,
      level: 1,
      exp: 0,
      maxExp: 100,
      enchantmentLevel: 0,
    };

    try {
      const saved = localStorage.getItem('egg_thief_hatched_pets');
      let parsed: PetCompanion[] = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [starterDragon];
      }
      // Remove any previously injected publisher/admin pets
      parsed = parsed.filter((p) => p.id !== 'publisher-lord-infinite' && !p.name.includes('Chúa Tể'));
      return parsed.length > 0 ? parsed : [starterDragon];
    } catch {
      return [starterDragon];
    }
  });

  const [dragonCrystals, setDragonCrystals] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('egg_thief_crystals');
      const val = saved ? parseInt(saved, 10) : 450;
      return Number.isNaN(val) ? 450 : val;
    } catch {
      return 450;
    }
  });

  // Skill Tree State & Persistence
  const [skillTreeState, setSkillTreeState] = useState<SkillTreeState>(() => {
    try {
      const saved = localStorage.getItem('egg_thief_skill_tree');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // One-Time Free Starter Gift Tracking (Strictly 1 time per account / player)
  const [hasClaimedFreeGift, setHasClaimedFreeGift] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('egg_thief_has_claimed_free_gift');
      if (saved === 'true') return true;
      const legacyTime = localStorage.getItem('egg_thief_last_daily_gift_timestamp');
      if (legacyTime && parseInt(legacyTime, 10) > 0) return true;
      return false;
    } catch {
      return false;
    }
  });

  // Calculate active passive modifiers
  const passiveBonuses = useMemo(() => getPassiveBonuses(skillTreeState), [skillTreeState]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('egg_thief_crystals', dragonCrystals.toString());
    } catch {}
  }, [dragonCrystals]);

  useEffect(() => {
    try {
      localStorage.setItem('egg_thief_skill_tree', JSON.stringify(skillTreeState));
    } catch {}
  }, [skillTreeState]);

  useEffect(() => {
    try {
      localStorage.setItem('egg_thief_unlocked_units', JSON.stringify(unlockedUnits));
    } catch {}
  }, [unlockedUnits]);

  useEffect(() => {
    try {
      localStorage.setItem('egg_thief_completed_units', JSON.stringify(completedUnits));
    } catch {}
  }, [completedUnits]);

  useEffect(() => {
    try {
      localStorage.setItem('egg_thief_stolen_eggs', JSON.stringify(stolenEggs));
    } catch {}
  }, [stolenEggs]);

  useEffect(() => {
    try {
      localStorage.setItem('egg_thief_hatched_pets', JSON.stringify(hatchedPets));
    } catch {}
  }, [hatchedPets]);

  useEffect(() => {
    try {
      localStorage.setItem('egg_thief_stealth_boots', stealthBoots.toString());
    } catch {}
  }, [stealthBoots]);

  // Mission scoring (out of 10 points: Stage 1 = 4 pts, Stage 2 = 3 pts, Stage 3 = 3 pts)
  const [stage1Score, setStage1Score] = useState(0);
  const [stage2Score, setStage2Score] = useState(0);
  const [stage3Score, setStage3Score] = useState(0);

  // Modals
  const [isRescueOpen, setIsRescueOpen] = useState(false);
  const [isHatcheryOpen, setIsHatcheryOpen] = useState(false);
  const [isArenaOpen, setIsArenaOpen] = useState(false);
  const [isSkillTreeOpen, setIsSkillTreeOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [isOnlineOpen, setIsOnlineOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isMissionCompleteOpen, setIsMissionCompleteOpen] = useState(false);
  const [isAppearanceStudioOpen, setIsAppearanceStudioOpen] = useState(false);
  const [selectedAppearancePetId, setSelectedAppearancePetId] = useState<string | null>(null);
  const [isPokemonPvPOpen, setIsPokemonPvPOpen] = useState(false);
  const [pendingGiftsCount, setPendingGiftsCount] = useState(0);

  // Daily Mission System State
  const [isDailyMissionOpen, setIsDailyMissionOpen] = useState(false);
  const [dailyMissionsCompleted, setDailyMissionsCompleted] = useState(0);
  const [hasUnclaimedDailyRewards, setHasUnclaimedDailyRewards] = useState(false);
  const [dailyMissionRefreshTrigger, setDailyMissionRefreshTrigger] = useState(0);

  useEffect(() => {
    try {
      const data = getDailyMissionData();
      const completed = data.tasks.filter((t) => t.isCompleted).length;
      const allDone = completed === data.tasks.length;
      const unclaimed =
        data.tasks.some((t) => t.isCompleted && !t.isClaimed) ||
        (allDone && !data.isGrandRewardClaimed);
      setDailyMissionsCompleted(completed);
      setHasUnclaimedDailyRewards(unclaimed);
    } catch {}
  }, [dailyMissionRefreshTrigger, isDailyMissionOpen]);

  const handleSavePetAppearance = (petId: string, appearance: PetAppearance) => {
    setHatchedPets((prev) =>
      prev.map((pet) => {
        if (pet.id === petId) {
          return {
            ...pet,
            appearance,
          };
        }
        return pet;
      })
    );
  };

  // User Authentication & Account Name State
  const [currentUser, setCurrentUser] = useState<AppUser | User | null>(() => getStoredUser() || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [accountName, setAccountName] = useState<string>(() => {
    try {
      const stored = getStoredUser();
      if (stored?.displayName) return stored.displayName;
      return localStorage.getItem('egg_thief_player_name') || 'Nhà Thám Hiểm';
    } catch {
      return 'Nhà Thám Hiểm';
    }
  });
  const [isSetAccountNameOpen, setIsSetAccountNameOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const mapped: AppUser = {
          uid: user.uid,
          displayName: user.displayName || 'Nhà Thám Hiểm',
          email: user.email,
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`,
          authProvider: 'google',
        };
        setCurrentUser(mapped);
        const saved = localStorage.getItem('egg_thief_player_name');
        if ((!saved || saved === 'Nhà Thám Hiểm') && user.displayName) {
          setAccountName(user.displayName);
          localStorage.setItem('egg_thief_player_name', user.displayName);
        }
      } else {
        const stored = getStoredUser();
        if (stored && stored.authProvider === 'cloud_fast') {
          setCurrentUser(stored);
        } else {
          setCurrentUser(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Save / Update Account Name (Local & Cloud Firestore)
  const handleSaveAccountName = async (newName: string) => {
    setAccountName(newName);
    localStorage.setItem('egg_thief_player_name', newName);

    if (currentUser) {
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: newName });
        } catch (e) {
          console.warn('Failed to update Firebase Auth profile displayName:', e);
        }
      }

      try {
        const bestPet = hatchedPets.length > 0 ? hatchedPets[0] : null;
        const petPower = bestPet ? (bestPet.level || 1) * 150 : 100;

        const userData = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: newName,
          photoURL: currentUser.photoURL || '',
          crystals: dragonCrystals,
          wins: skillTreeState?.arenaWins || 0,
          activePetName: bestPet ? bestPet.name : 'Chưa có Pet',
          activePetPower: petPower,
          hatchedPetsCount: hatchedPets.length,
          lastActive: serverTimestamp(),
        };

        await setDoc(doc(db, 'users', currentUser.uid), userData, { merge: true });
        await setDoc(doc(db, 'onlinePlayers', currentUser.uid), userData, { merge: true });
        await setDoc(
          doc(db, 'leaderboard', currentUser.uid),
          {
            uid: currentUser.uid,
            displayName: newName,
            photoURL: currentUser.photoURL || '',
            crystals: dragonCrystals,
            wins: skillTreeState?.arenaWins || 0,
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error syncing account name to Firestore:', err);
      }
    }
  };

  // Background gift counter check
  useEffect(() => {
    if (!currentUser) {
      setPendingGiftsCount(0);
      return;
    }

    const checkGifts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'gifts'));
        const myEmail = (currentUser.email || '').toLowerCase().trim();
        const myUid = currentUser.uid;
        let count = 0;
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const targetEmail = (data.targetEmail || '').toLowerCase().trim();
          if (
            data.status === 'pending' &&
            ((myEmail && targetEmail === myEmail) || (myUid && data.targetUid === myUid))
          ) {
            count++;
          }
        });
        setPendingGiftsCount(count);
      } catch (err) {
        // Silently handle error
      }
    };

    checkGifts();
    const interval = setInterval(checkGifts, 20000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Dragon Chase Special Review Mode
  const [isChaseModeActive, setIsChaseModeActive] = useState(false);

  const currentUnit = UNITS_DATA.find((u) => u.id === currentUnitId) || UNITS_DATA[0];

  // Natural Alert Cooldown passive (Dragon Repose)
  useEffect(() => {
    if (isChaseModeActive || passiveBonuses.alertCooldownSeconds <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setAlertLevel((prev) => {
        if (prev <= 0) return 0;
        return Math.max(0, prev - passiveBonuses.alertCooldownAmount);
      });
    }, passiveBonuses.alertCooldownSeconds * 1000);

    return () => clearInterval(interval);
  }, [isChaseModeActive, passiveBonuses.alertCooldownSeconds, passiveBonuses.alertCooldownAmount]);

  // Check alert level threshold
  useEffect(() => {
    if (alertLevel >= 100 && !isRescueOpen) {
      playAlarmSiren();
      playDragonGrowl();
      setIsRescueOpen(true);
    }
  }, [alertLevel, isRescueOpen]);

  // Handle wrong answer -> alert penalty modified by Silent Infiltration & Phantom Veil
  const handleWrongAnswer = () => {
    // Phantom Veil: chance to evade alert increase completely
    if (passiveBonuses.phantomVeilChance > 0 && Math.random() < passiveBonuses.phantomVeilChance) {
      return;
    }
    const penalty = passiveBonuses.mistakePenalty;
    setAlertLevel((prev) => Math.min(100, prev + penalty));
  };

  // Handle correct answer in Stage 1
  const handleStage1Correct = () => {
    setStealthSteps((prev) => Math.min(totalStepsNeeded, prev + 1));
    setStage1Score((prev) => prev + 1);
  };

  // Handle Stage 1 complete -> proceed to Stage 2
  const handleStage1Complete = () => {
    setActiveStage('stage2_grammar');
  };

  // Handle Stage 2 correct
  const handleStage2Correct = (awardedBoots: boolean) => {
    setStealthSteps((prev) => Math.min(totalStepsNeeded, prev + 1));
    setStage2Score((prev) => prev + 1);
    if (awardedBoots) {
      setStealthBoots((prev) => prev + 1);
      // Immediately cool down alert by -10% as well
      setAlertLevel((prev) => Math.max(0, prev - 10));
    }
  };

  // Handle Stage 2 complete -> proceed to Stage 3
  const handleStage2Complete = () => {
    setActiveStage('stage3_speaking');
  };

  // Handle Stage 3 correct
  const handleStage3Correct = () => {
    setStealthSteps((prev) => Math.min(totalStepsNeeded, prev + 1));
    setStage3Score((prev) => Math.min(3, prev + 1));
  };

  // Handle Stage 3 Egg Stolen - Strictly prevents infinite duplicate eggs
  const handleEggStolenSuccess = (voiceScore: number) => {
    const finalScore = Math.min(10, Math.max(0, stage1Score + stage2Score + 3));
    const is10 = finalScore === 10;
    const isUnlocked = finalScore >= 8;

    if (isUnlocked) {
      let eggType: 'golden' | 'silver' | 'common' = 'common';
      if (currentUnit.id === 'unit-1') {
        eggType = is10 ? 'silver' : 'common';
      } else if (currentUnit.id === 'unit-2') {
        eggType = is10 ? (Math.random() < 0.15 ? 'golden' : 'silver') : 'common';
      } else {
        eggType = is10 ? 'golden' : 'silver';
      }

      setStolenEggs((prev) => {
        const existingIdx = prev.findIndex((e) => e.unitId === currentUnit.id);
        if (existingIdx !== -1) {
          // If already earned egg for this unit, upgrade if score improved, never duplicate
          const existing = prev[existingIdx];
          if (finalScore > existing.obtainedScore) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...existing,
              obtainedScore: finalScore,
              eggType: is10 ? 'golden' : existing.eggType,
            };
            return updated;
          }
          return prev;
        }

        const newEgg: StolenEgg = {
          id: `egg-${currentUnit.id}`,
          unitId: currentUnit.id,
          unitTitle: currentUnit.title,
          eggType,
          obtainedScore: finalScore,
          stolenAt: new Date().toLocaleTimeString('en-US'),
          isHatched: false,
        };
        return [newEgg, ...prev];
      });

      setCompletedUnits((prev) => (prev.includes(currentUnit.id) ? prev : [...prev, currentUnit.id]));

      // Award Dragon Crystals for academic accomplishment with passives
      const baseEarned = is10 ? 150 : 75;
      const multipliedEarned = Math.round(baseEarned * (1 + (passiveBonuses?.crystalMultiplier || 0)));
      const totalEarned = multipliedEarned + (is10 ? (passiveBonuses?.scholarBonus || 0) : 0);
      setDragonCrystals((prev) => (Number.isNaN(prev) ? 450 : prev + totalEarned));

      // Unlock next unit if available
      const nextIdx = UNITS_DATA.findIndex((u) => u.id === currentUnit.id) + 1;
      if (nextIdx < UNITS_DATA.length) {
        const nextId = UNITS_DATA[nextIdx].id;
        setUnlockedUnits((prev) => (prev.includes(nextId) ? prev : [...prev, nextId]));
      }
    }

    setIsMissionCompleteOpen(true);
  };

  // Use stealth boots from inventory
  const handleUseBoots = () => {
    if (stealthBoots > 0 && alertLevel > 0) {
      setStealthBoots((prev) => prev - 1);
      setAlertLevel((prev) => Math.max(0, prev - passiveBonuses.bootsAlertReduction));
    }
  };

  // Rescue Success handler
  const handleRescueSuccess = () => {
    setIsRescueOpen(false);
    setAlertLevel(50); // cooled down to 50%
  };

  // Rescue Fail handler
  const handleRescueFail = () => {
    setIsRescueOpen(false);
    setAlertLevel(75);
  };

  // Select a unit to start fresh mission
  const handleSelectUnit = (unitId: string) => {
    setCurrentUnitId(unitId);
    setActiveStage('stage1_eye');
    setAlertLevel(0);
    setStealthSteps(0);
    setStealthBoots(passiveBonuses.startingBootsCount);
    setStage1Score(0);
    setStage2Score(0);
    setStage3Score(0);
    setIsChaseModeActive(false);
    setIsMissionCompleteOpen(false);
  };

  // Restart current mission
  const handleRetryMission = () => {
    handleSelectUnit(currentUnitId);
  };

  // Upgrade a pet skill in the skill tree
  const handleUpgradeSkill = (skillId: string): boolean => {
    const node = PET_SKILL_NODES.find((n) => n.id === skillId);
    if (!node) return false;

    const currentLevel = skillTreeState[skillId] || 0;
    if (currentLevel >= node.maxLevel) return false;

    const cost = node.costs[currentLevel];
    if (dragonCrystals < cost) return false;

    // Verify prerequisites
    const prereqsMet = node.prerequisites.every((preId) => (skillTreeState[preId] || 0) > 0);
    if (!prereqsMet) return false;

    setDragonCrystals((prev) => Math.max(0, prev - cost));
    setSkillTreeState((prev) => ({
      ...prev,
      [skillId]: (prev[skillId] || 0) + 1,
    }));
    return true;
  };

  // Reset skill tree with 100% refund
  const handleResetSkills = () => {
    const refund = calculateTotalSpentCrystals(skillTreeState);
    setDragonCrystals((prev) => prev + refund);
    setSkillTreeState({});
  };

  // Proceed to next unit
  const handleNextUnit = () => {
    const nextIdx = UNITS_DATA.findIndex((u) => u.id === currentUnitId) + 1;
    if (nextIdx < UNITS_DATA.length) {
      handleSelectUnit(UNITS_DATA[nextIdx].id);
    } else {
      setIsChaseModeActive(true);
      setIsMissionCompleteOpen(false);
    }
  };

  // Egg hatched in Hatchery
  const handleEggHatched = (eggId: string, pet: PetCompanion) => {
    setStolenEggs((prev) =>
      prev.map((e) => (e.id === eggId ? { ...e, isHatched: true, petHatched: pet } : e))
    );
    setHatchedPets((prev) => [...prev, pet]);
  };

  // Enchant a pet companion with Dragon Crystals
  const handleEnchantPet = (petId: string): boolean => {
    const targetPet = hatchedPets.find((p) => p.id === petId);
    if (!targetPet) return false;
    const currentLvl = targetPet.enchantmentLevel || 0;
    if (currentLvl >= 5) return false;

    const nextTierConfig = getEnchantmentConfig(currentLvl + 1);
    if (!nextTierConfig || dragonCrystals < nextTierConfig.crystalCost) {
      return false;
    }

    setDragonCrystals((prev) => Math.max(0, prev - nextTierConfig.crystalCost));
    setHatchedPets((prev) =>
      prev.map((p) => (p.id === petId ? { ...p, enchantmentLevel: currentLvl + 1 } : p))
    );
    return true;
  };

  const handleAwardPetExp = (petId: string, expAmount: number) => {
    setHatchedPets((prev) =>
      prev.map((p) => {
        if (p.id !== petId) return p;
        const currentExp = (p.exp || 0) + expAmount;
        const currentMaxExp = p.maxExp || 100;
        let currentLevel = p.level || 1;
        let newExp = currentExp;
        let newMaxExp = currentMaxExp;
        if (newExp >= newMaxExp) {
          currentLevel += 1;
          newExp -= newMaxExp;
          newMaxExp = Math.round(newMaxExp * 1.35);
        }
        return {
          ...p,
          level: currentLevel,
          exp: newExp,
          maxExp: newMaxExp,
        };
      })
    );
  };

  const handleEvolvePet = (petId: string): PetCompanion | null => {
    const targetPet = hatchedPets.find((p) => p.id === petId);
    if (!targetPet) return null;
    const currentLevel = targetPet.level || 1;
    const currentEnchant = targetPet.enchantmentLevel || 0;
    if (currentLevel < 20 || currentEnchant < 5) return null;

    const evolvedPet = getEvolvedPetForm(targetPet);
    setHatchedPets((prev) =>
      prev.map((p) => (p.id === petId ? evolvedPet : p))
    );
    return evolvedPet;
  };

  const handleLevelUpPet = (petId: string, levelAmount: number = 1) => {
    setHatchedPets((prev) =>
      prev.map((p) => {
        if (p.id !== petId) return p;
        const currentLvl = p.level || 1;
        return {
          ...p,
          level: currentLvl + levelAmount,
          exp: 0,
        };
      })
    );
  };

  // Automatic migration: purge any previous admin session or publisher pets from localStorage
  useEffect(() => {
    const adminSession = localStorage.getItem('egg_thief_admin_session_active');
    const savedPets = localStorage.getItem('egg_thief_hatched_pets');
    if (adminSession || (savedPets && savedPets.includes('publisher-lord-infinite'))) {
      localStorage.removeItem('egg_thief_admin_session_active');
      localStorage.removeItem('egg_thief_hatched_pets');
      localStorage.removeItem('egg_thief_crystals');
      setDragonCrystals(450);
      setHatchedPets([{
        id: 'starter-dragon-1',
        name: 'Pyra Junior',
        title: 'Young Flame Drake',
        rarity: 'rare',
        classification: 'living',
        element: 'fire',
        buffDescription: 'Tăng tốc độ tìm kiếm kho báu lửa.',
        hatchedAt: new Date().toISOString(),
        description: 'A loyal young wolf eager to assist explorers in their quest through the dragon sanctuary.',
        avatarIcon: '🔥',
        tierRank: 2,
        level: 1,
        exp: 0,
        maxExp: 100,
        enchantmentLevel: 0,
      }]);
    }
  }, []);

  // Function to completely reset all accounts and game data (Local + Firestore Cloud)
  const handleResetAllAccounts = async () => {
    const confirmed = window.confirm(
      '⚠️ XÁC NHẬN RESET TOÀN BỘ TÀI KHOẢN VÀ DỮ LIỆU?\n\n' +
      'Thao tác này sẽ:\n' +
      '• Xóa toàn bộ tài khoản người chơi trên Cloud Firestore\n' +
      '• Xóa sạch xếp hạng, lịch sử giao dịch và hòm quà tặng\n' +
      '• Đặt lại toàn bộ dữ liệu game về mặc định (Pyra Junior, 450 Kim cương, Unit 1 & 2)\n' +
      '• Đăng xuất phiên đăng nhập hiện tại\n\n' +
      'Bạn có chắc chắn muốn thực hiện không?'
    );
    if (!confirmed) return;

    try {
      // 1. Wipe Firestore Collections: users, onlinePlayers, leaderboard, tradeRequests, gifts
      const collectionsToWipe = ['users', 'onlinePlayers', 'leaderboard', 'tradeRequests', 'gifts'];
      for (const colName of collectionsToWipe) {
        try {
          const snap = await getDocs(collection(db, colName));
          const deletePromises = snap.docs.map((docSnap) => deleteDoc(doc(db, colName, docSnap.id)));
          await Promise.allSettled(deletePromises);
        } catch (colErr) {
          console.warn(`Could not wipe collection ${colName}:`, colErr);
        }
      }

      // 2. Sign out if currently authenticated
      try {
        await signOut(auth);
      } catch (authErr) {
        // ignore
      }

      // 3. Clear all egg_thief keys from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('egg_thief_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();

      // 4. Reset React State to clean starting state
      const starterDragon: PetCompanion = {
        id: 'starter-dragon-1',
        name: 'Pyra Junior',
        title: 'Young Flame Drake',
        rarity: 'rare',
        classification: 'living',
        element: 'fire',
        buffDescription: 'Tăng tốc độ tìm kiếm kho báu lửa.',
        hatchedAt: new Date().toISOString(),
        description: 'A loyal young wolf eager to assist explorers in their quest through the dragon sanctuary.',
        avatarIcon: '🔥',
        tierRank: 2,
        level: 1,
        exp: 0,
        maxExp: 100,
        enchantmentLevel: 0,
      };

      setCurrentUnitId('unit-1');
      setActiveStage('stage1_eye');
      setAlertLevel(0);
      setStealthSteps(0);
      setStealthBoots(1);
      setUnlockedUnits(['unit-1', 'unit-2']);
      setCompletedUnits([]);
      setStolenEggs([]);
      setHatchedPets([starterDragon]);
      setDragonCrystals(450);
      setSkillTreeState({});
      setStage1Score(0);
      setStage2Score(0);
      setStage3Score(0);
      setIsChaseModeActive(false);
      setPendingGiftsCount(0);
      setAccountName('Nhà Thám Hiểm');
      setHasClaimedFreeGift(false);

      playSuccessChime();
      alert('✅ ĐÃ RESET TOÀN BỘ TÀI KHOẢN VÀ DỮ LIỆU THÀNH CÔNG!\nGame đã được đưa về trạng thái khởi đầu sạch sẽ.');
    } catch (err) {
      console.error('Reset all accounts error:', err);
      alert('Đã xóa dữ liệu cục bộ thành công. Đang tải lại trang...');
      window.location.reload();
    }
  };

  const handleClaimFreeGift = () => {
    if (hasClaimedFreeGift) {
      alert(
        `⚠️ BẠN ĐÃ NHẬN GÓI QUÀ NÀY RỒI!\n\n` +
          `• Gói quà tặng khởi đầu chỉ được nhận đúng 1 lần duy nhất cho mỗi tài khoản.\n` +
          `• Bạn đã nhận phần quà này trước đó rồi.\n\n` +
          `Hãy tiếp tục vượt qua các Ải Tiếng Anh để đoạt thêm Trứng Rồng và nâng cấp Thú Cưng nhé!`
      );
      return;
    }

    // Save one-time claim status immediately to prevent any duplication
    try {
      localStorage.setItem('egg_thief_has_claimed_free_gift', 'true');
    } catch (e) {
      console.error(e);
    }
    setHasClaimedFreeGift(true);

    // Balanced reward package
    const randomCreature = CREATURES_CATALOG[Math.floor(Math.random() * CREATURES_CATALOG.length)];
    const newPet: PetCompanion = {
      ...randomCreature,
      id: `free-gift-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      hatchedAt: `🎁 Quà Tặng Khởi Đầu (${new Date().toLocaleDateString('vi-VN')})`,
      level: 10,
      exp: 0,
      maxExp: 250,
      enchantmentLevel: 1,
    };
    setHatchedPets((prev) => [newPet, ...prev]);

    const eggTiers: EggTierType[] = ['common', 'silver', 'golden', 'king'];
    const chosenTier = eggTiers[Math.floor(Math.random() * eggTiers.length)];

    const freeEgg: StolenEgg = {
      id: `free-egg-${Date.now()}`,
      unitId: 'unit-free-gift',
      unitTitle: `🎁 Trứng Quà Tặng (${chosenTier.toUpperCase()})`,
      eggType: chosenTier,
      obtainedScore: 10,
      stolenAt: 'Quà Tặng Khởi Đầu (Chỉ 1 Lần Duy Nhất)',
      isHatched: false,
    };
    setStolenEggs((prev) => [freeEgg, ...prev]);

    const crystalReward = 250;
    setDragonCrystals((prev) => prev + crystalReward);

    playSuccessChime();
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    alert(
      `🎁 NHẬN GÓI QUÀ THÀNH CÔNG (CHỈ 1 LẦN DUY NHẤT)!\n\n` +
        `• Nhận Pet Đồng Hành: ${newPet.name} (Lv.10, ★1)\n` +
        `• Nhận Trứng: ${freeEgg.unitTitle}\n` +
        `• Nhận +${crystalReward} Dragon Crystals 💎\n\n` +
        `✨ Gói quà này đã hoàn tất (nhận 1 lần duy nhất). Chúc bạn phiêu lưu vui vẻ!`
    );
  };

  const handleSellPet = (petId: string) => {
    const pet = hatchedPets.find((p) => p.id === petId);
    if (!pet) return;
    const rarityValues: Record<string, number> = {
      common: 25,
      uncommon: 60,
      rare: 150,
      epic: 350,
      legendary: 800,
      mythical: 1500,
      ultimate: 2500,
      eternal: 4000,
      cosmic: 6000,
      secret: 8000,
      king: 10000,
      titan: 15000,
      deity: 25000,
      god: 40000,
      king_of_god: 80000,
    };
    const price = rarityValues[pet.rarity] || 50;
    setDragonCrystals((prev) => prev + price);
    setHatchedPets((prev) => prev.filter((p) => p.id !== petId));
  };



  const currentTotalScore = Math.min(10, stage1Score + stage2Score + stage3Score);
  const activePerksCount = (Object.values(skillTreeState) as number[]).reduce((acc, lvl) => acc + (lvl || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        units={UNITS_DATA}
        currentUnitId={currentUnitId}
        onSelectUnit={handleSelectUnit}
        unlockedUnits={unlockedUnits}
        stolenEggs={stolenEggs}
        stealthBoots={stealthBoots}
        onOpenHatchery={() => setIsHatcheryOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenArena={() => setIsArenaOpen(true)}
        onOpenSkillTree={() => setIsSkillTreeOpen(true)}
        onOpenStudy={() => setIsStudyOpen(true)}
        onOpenOnline={() => setIsOnlineOpen(true)}
        activePerksCount={activePerksCount}
        isChaseModeActive={isChaseModeActive}
        onStartChaseMode={() => setIsChaseModeActive(true)}
        dragonCrystals={dragonCrystals}
        onResetAllAccounts={handleResetAllAccounts}
        onOpenAppearanceStudio={() => {
          setSelectedAppearancePetId(hatchedPets[0]?.id || null);
          setIsAppearanceStudioOpen(true);
        }}
        onOpenPokemonPvP={() => setIsPokemonPvPOpen(true)}
        pendingGiftsCount={pendingGiftsCount}
        accountName={accountName}
        onOpenSetAccountName={() => setIsSetAccountNameOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        currentUser={currentUser as AppUser | null}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenDailyMissions={() => setIsDailyMissionOpen(true)}
        dailyMissionsCompleted={dailyMissionsCompleted}
        hasUnclaimedDailyRewards={hasUnclaimedDailyRewards}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Daily Mission 24h Interactive Banner */}
        <DailyMissionBanner
          onOpenDailyMissions={() => setIsDailyMissionOpen(true)}
          refreshTrigger={dailyMissionRefreshTrigger}
        />

        {/* Mission Status Bar (Only in Unit Missions) */}
        {!isChaseModeActive && (
          <div className="space-y-4">
            {/* Alert Level Gauge & Stealth Progress */}
            <AlertGauge
              alertLevel={alertLevel}
              stealthSteps={stealthSteps}
              totalStepsNeeded={totalStepsNeeded}
              stealthBoots={stealthBoots}
              onUseBoots={handleUseBoots}
              eggName={currentUnit.eggName}
              activePassives={passiveBonuses}
              bootsReductionAmount={passiveBonuses.bootsAlertReduction}
            />

            {/* Stages Stepper */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
              <button
                id="stage-tab-1"
                onClick={() => setActiveStage('stage1_eye')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeStage === 'stage1_eye'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Stage 1:</span>
                <span>The All-Seeing Eye</span>
              </button>

              <button
                id="stage-tab-2"
                onClick={() => setActiveStage('stage2_grammar')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeStage === 'stage2_grammar'
                    ? 'bg-indigo-500 text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Stage 2:</span>
                <span>Grammar Trap</span>
              </button>

              <button
                id="stage-tab-3"
                onClick={() => setActiveStage('stage3_speaking')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeStage === 'stage3_speaking'
                    ? 'bg-rose-600 text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Stage 3:</span>
                <span>Vocal Cipher</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Stage View */}
        {!isChaseModeActive && (
          <div className="mb-6">
            <StealthPathTracker
              currentStep={stealthSteps}
              totalSteps={totalStepsNeeded}
              activePet={hatchedPets[0]}
              alertLevel={alertLevel}
            />
          </div>
        )}

        {isChaseModeActive ? (
          <Stage4DragonChase
            onEscapeSuccess={(score, total) => {
              setStolenEggs((prev) => {
                if (prev.some((e) => e.unitId === 'review-units-1-3')) {
                  return prev;
                }
                const newEgg: StolenEgg = {
                  id: 'egg-chase-review-units-1-3',
                  unitId: 'review-units-1-3',
                  unitTitle: 'Dragon Chase: Review Units 1-3',
                  eggType: 'golden',
                  obtainedScore: 10,
                  stolenAt: new Date().toLocaleTimeString('en-US'),
                  isHatched: false,
                };
                return [newEgg, ...prev];
              });
            }}
            onReturnToNest={() => {
              setIsChaseModeActive(false);
              handleSelectUnit('unit-1');
            }}
          />
        ) : activeStage === 'stage1_eye' ? (
          <Stage1EyeMonster
            vocabularyList={currentUnit.vocabulary}
            unitTitle={currentUnit.title}
            onCorrectWord={handleStage1Correct}
            onWrongWord={handleWrongAnswer}
            onCompleteStage={handleStage1Complete}
          />
        ) : activeStage === 'stage2_grammar' ? (
          <Stage2GrammarTrap
            grammarTraps={currentUnit.grammarTraps}
            unitTitle={currentUnit.title}
            onCorrectAnswer={handleStage2Correct}
            onWrongAnswer={handleWrongAnswer}
            onCompleteStage={handleStage2Complete}
          />
        ) : (
          <Stage3VoiceCode
            speakingCipher={currentUnit.speakingCipher}
            unitTitle={currentUnit.title}
            onCorrectSpeaking={handleStage3Correct}
            onWrongSpeaking={handleWrongAnswer}
            onEggStolenSuccess={handleEggStolenSuccess}
          />
        )}
      </main>

      {/* Footer info */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Egg Thief — Grade 8 English High School Entrance Exam Mastery</span>
          <span>Speech Recognition & AI Evaluation Engine</span>
        </div>
      </footer>

      {/* Modals */}
      <EmergencyRescueModal
        isOpen={isRescueOpen}
        onRescueSuccess={handleRescueSuccess}
        onRescueFail={handleRescueFail}
      />

      <HatcheryModal
        isOpen={isHatcheryOpen}
        onClose={() => setIsHatcheryOpen(false)}
        stolenEggs={stolenEggs}
        hatchedPets={hatchedPets}
        onEggHatched={handleEggHatched}
        onOpenArena={() => {
          setIsHatcheryOpen(false);
          setIsArenaOpen(true);
        }}
        onOpenSkillTree={() => {
          setIsHatcheryOpen(false);
          setIsSkillTreeOpen(true);
        }}
        dragonCrystals={dragonCrystals}
        onEnchantPet={handleEnchantPet}
        hatchBonusRate={passiveBonuses.hatchBonusRate}
        hatchRebate={passiveBonuses.incubatorRebate}
        onAddDragonCrystals={(amt) => setDragonCrystals((prev) => prev + amt)}
        onSellPet={handleSellPet}
        onClaimFreeGift={handleClaimFreeGift}
        hasClaimedFreeGift={hasClaimedFreeGift}
        onOpenAppearanceStudio={(petId) => {
          if (petId) {
            setSelectedAppearancePetId(petId);
          }
          setIsHatcheryOpen(false);
          setIsAppearanceStudioOpen(true);
        }}
        onOpenPokemonPvP={() => {
          setIsHatcheryOpen(false);
          setIsPokemonPvPOpen(true);
        }}
        onEvolvePet={handleEvolvePet}
        onLevelUpPet={handleLevelUpPet}
      />

      <PetArenaModal
        isOpen={isArenaOpen}
        onClose={() => setIsArenaOpen(false)}
        hatchedPets={hatchedPets}
        onOpenHatchery={() => {
          setIsArenaOpen(false);
          setIsHatcheryOpen(true);
        }}
        onOpenSkillTree={() => {
          setIsArenaOpen(false);
          setIsSkillTreeOpen(true);
        }}
        passiveBonuses={passiveBonuses}
        onAddStolenEgg={(egg) => {
          setStolenEggs((prev) => {
            if (prev.some((e) => e.unitId === egg.unitId)) {
              return prev;
            }
            return [egg, ...prev];
          });
        }}
        dragonCrystals={dragonCrystals}
        onAddDragonCrystals={(amt) => setDragonCrystals((prev) => prev + amt)}
        onEnchantPet={handleEnchantPet}
        onAwardPetExp={handleAwardPetExp}
      />

      <PetSkillTreeModal
        isOpen={isSkillTreeOpen}
        onClose={() => setIsSkillTreeOpen(false)}
        dragonCrystals={dragonCrystals}
        skillTreeState={skillTreeState}
        onUpgradeSkill={handleUpgradeSkill}
        onResetSkills={handleResetSkills}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <StudySystemModal
        isOpen={isStudyOpen}
        onClose={() => setIsStudyOpen(false)}
        currentUnit={currentUnit}
        allUnits={UNITS_DATA}
      />

      <OnlineMultiplayerModal
        isOpen={isOnlineOpen}
        onClose={() => setIsOnlineOpen(false)}
        dragonCrystals={dragonCrystals}
        setDragonCrystals={setDragonCrystals}
        hatchedPets={hatchedPets}
        setHatchedPets={setHatchedPets}
        stolenEggs={stolenEggs}
        setStolenEggs={setStolenEggs}
        skillTreeState={skillTreeState}
        setSkillTreeState={setSkillTreeState}
        onUpdatePendingGiftsCount={setPendingGiftsCount}
        onResetAllAccounts={handleResetAllAccounts}
        accountName={accountName}
        onOpenSetAccountName={() => setIsSetAccountNameOpen(true)}
        currentUser={currentUser as AppUser | null}
        onUserChange={(u) => setCurrentUser(u)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Cloud Authentication & Account Diagnostics Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser as AppUser | null}
        onUserChange={(u) => setCurrentUser(u)}
        accountName={accountName}
        hatchedPets={hatchedPets}
        dragonCrystals={dragonCrystals}
        skillTreeState={skillTreeState}
        stolenEggs={stolenEggs}
        onRewardCrystals={(amt) => setDragonCrystals((prev) => prev + amt)}
      />

      {/* Set / Edit Account Name Modal */}
      <SetAccountNameModal
        isOpen={isSetAccountNameOpen}
        onClose={() => setIsSetAccountNameOpen(false)}
        currentName={accountName}
        onSaveName={handleSaveAccountName}
        userEmail={currentUser?.email || undefined}
        photoURL={currentUser?.photoURL || undefined}
        dragonCrystals={dragonCrystals}
        bestPet={hatchedPets[0] || null}
      />

      <MissionCompleteModal
        isOpen={isMissionCompleteOpen}
        score={currentTotalScore}
        maxScore={10}
        unitTitle={currentUnit.title}
        eggName={currentUnit.eggName}
        onOpenHatchery={() => {
          setIsMissionCompleteOpen(false);
          setIsHatcheryOpen(true);
        }}
        onNextUnit={handleNextUnit}
        onRetry={handleRetryMission}
      />

      {/* Pet Appearance Studio Modal (Pokemon-style customizer) */}
      <PetAppearanceStudioModal
        isOpen={isAppearanceStudioOpen}
        onClose={() => setIsAppearanceStudioOpen(false)}
        pets={hatchedPets}
        initialPetId={selectedAppearancePetId || undefined}
        onSaveAppearance={handleSavePetAppearance}
        onOpenPvP={() => {
          setIsAppearanceStudioOpen(false);
          setIsPokemonPvPOpen(true);
        }}
      />

      {/* Pokemon-style PvP Arena Modal */}
      <PokemonPvPArenaModal
        isOpen={isPokemonPvPOpen}
        onClose={() => setIsPokemonPvPOpen(false)}
        pets={hatchedPets}
        dragonCrystals={dragonCrystals}
        onAddDragonCrystals={(amt) => setDragonCrystals((prev) => prev + amt)}
        onOpenHatchery={() => {
          setIsPokemonPvPOpen(false);
          setIsHatcheryOpen(true);
        }}
        onOpenAppearanceStudio={(petId) => {
          if (petId) {
            setSelectedAppearancePetId(petId);
          }
          setIsPokemonPvPOpen(false);
          setIsAppearanceStudioOpen(true);
        }}
      />

      {/* Daily Vocabulary Mission 24-Hour System Modal */}
      <DailyMissionModal
        isOpen={isDailyMissionOpen}
        onClose={() => {
          setIsDailyMissionOpen(false);
          setDailyMissionRefreshTrigger((prev) => prev + 1);
        }}
        dragonCrystals={dragonCrystals}
        onRewardCrystals={(amt) => {
          setDragonCrystals((prev) => prev + amt);
          setDailyMissionRefreshTrigger((prev) => prev + 1);
        }}
        onMissionProgressUpdate={(completed, total) => {
          setDailyMissionsCompleted(completed);
          try {
            const data = getDailyMissionData();
            const allDone = completed === total;
            const unclaimed =
              data.tasks.some((t) => t.isCompleted && !t.isClaimed) ||
              (allDone && !data.isGrandRewardClaimed);
            setHasUnclaimedDailyRewards(unclaimed);
          } catch {}
        }}
      />

      {/* Thinking AI Assistant Modal (Gemini 3.8 Flash, Suy nghĩ độc lập, Không hardcode) */}
      <AiThinkingAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        currentUnitTitle={currentUnit.title}
      />

      {/* Floating AI Assistant Quick Trigger */}
      <button
        id="floating-ai-assistant-btn"
        onClick={() => setIsAiAssistantOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-950/80 border border-purple-400/40 cursor-pointer transition-all hover:scale-105 active:scale-95 group"
        title="Hỏi đáp cùng Rồng Trí Tuệ AI (Thinking Mode - Không hardcode)"
      >
        <div className="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center text-sm group-hover:rotate-12 transition-transform">
          🧠
        </div>
        <span className="hidden sm:inline">Hỏi AI Trí Tuệ</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-400"></span>
        </span>
      </button>
    </div>
  );
}
