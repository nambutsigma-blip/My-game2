import { BattleHistoryRecord } from '../types';

const STORAGE_KEY = 'remix_pokemon_battle_history';
const MAX_HISTORY_ITEMS = 100;

/**
 * Format relative time in Vietnamese
 */
export const formatRelativeTime = (timestamp: number): string => {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) return 'Hôm qua';
  if (diffDay < 7) return `${diffDay} ngày trước`;

  const d = new Date(timestamp);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

/**
 * Format full date and time
 */
export const formatDateTime = (timestamp: number): string => {
  const d = new Date(timestamp);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

/**
 * Load battle history from localStorage
 */
export const getBattleHistory = (): BattleHistoryRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error('Failed to load battle history:', err);
    return [];
  }
};

/**
 * Add a new battle engagement record
 */
export const addBattleRecord = (
  data: Omit<BattleHistoryRecord, 'id' | 'timestamp' | 'dateFormatted'>
): BattleHistoryRecord => {
  const timestamp = Date.now();
  const newRecord: BattleHistoryRecord = {
    ...data,
    id: `battle_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp,
    dateFormatted: formatDateTime(timestamp),
  };

  try {
    const current = getBattleHistory();
    const updated = [newRecord, ...current].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pokemon_battle_history_updated'));
  } catch (err) {
    console.error('Failed to save battle record:', err);
  }

  return newRecord;
};

/**
 * Clear all battle history
 */
export const clearBattleHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('pokemon_battle_history_updated'));
  } catch (err) {
    console.error('Failed to clear battle history:', err);
  }
};

export interface BattleStatsSummary {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  netCrystals: number;
  totalWonCrystals: number;
  totalLostCrystals: number;
  mostUsedPet: string | null;
}

/**
 * Calculate summary analytics from battle history
 */
export const getBattleStats = (history: BattleHistoryRecord[]): BattleStatsSummary => {
  const total = history.length;
  if (total === 0) {
    return {
      total: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      netCrystals: 0,
      totalWonCrystals: 0,
      totalLostCrystals: 0,
      mostUsedPet: null,
    };
  }

  let wins = 0;
  let losses = 0;
  let netCrystals = 0;
  let totalWonCrystals = 0;
  let totalLostCrystals = 0;
  const petUsageCount: Record<string, number> = {};

  history.forEach((record) => {
    if (record.outcome === 'victory') {
      wins += 1;
      if (record.crystalDelta > 0) {
        totalWonCrystals += record.crystalDelta;
      }
    } else {
      losses += 1;
      if (record.crystalDelta < 0) {
        totalLostCrystals += Math.abs(record.crystalDelta);
      }
    }
    netCrystals += record.crystalDelta;

    if (record.playerPetName) {
      petUsageCount[record.playerPetName] = (petUsageCount[record.playerPetName] || 0) + 1;
    }
  });

  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  let mostUsedPet: string | null = null;
  let highestCount = 0;
  Object.entries(petUsageCount).forEach(([name, count]) => {
    if (count > highestCount) {
      highestCount = count;
      mostUsedPet = name;
    }
  });

  return {
    total,
    wins,
    losses,
    winRate,
    netCrystals,
    totalWonCrystals,
    totalLostCrystals,
    mostUsedPet,
  };
};
