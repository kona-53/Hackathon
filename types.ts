
export enum TaskType {
  STUDY = 'study',
  EXERCISE = 'exercise',
  WORK = 'work'
}

export interface Task {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  type: TaskType;
  reward: number;
  done: boolean;
  isSabori?: boolean; // Added for Rest missions
}

export interface PoolMission {
  id: string;
  title: string;
  type: TaskType;
  reward: number;
  isSabori: boolean; // True if it's a slacking/rest mission
  isUsed: boolean;
}

export interface Stats {
  study: number;
  exercise: number;
  work: number;
}

export interface UserProfile {
  hobbies: string;
  recentActivities: string;
  weeklyGoal?: string; // Added field for raw weekly goal text
}

export interface LevelInfo {
  level: number;
  current: number; // Current EXP in this level
  progress: number; // Percentage 0-100
}

export interface StreakInfo {
  currentStreak: number;
  bonusExp: number;
  daysToNextBigBonus: number;
  isBonusDay: boolean;
}

// Legacy Pet Data (kept for type compatibility)
export interface PetData {
  currentExp: number;
  hatchThreshold: number;
  status: 'egg' | 'hatched';
  expDistribution: {
    study: number;
    exercise: number;
    work: number;
  };
  type: 'owl' | 'lion' | 'fox' | 'slime';
  generation: number;
}

// Idle Generator System & Shop Data
export interface GeneratorData {
  lastCollected: string; // ISO Date String
  potionCount?: number;   // Number of potions bought this month
  skipTicketCount?: number; // Number of skip tickets owned (Inventory)
  skipTicketBoughtCount?: number; // Number of tickets bought this month (for price scaling)
  lastShopMonth?: string; // YYYY-MM string to track monthly resets
}

// Boss Battle Types
export type BossType = 'dragon' | 'demon' | 'kraken' | 'golem';

export interface Boss {
  id: string;
  name: string; // Target Goal Name
  description?: string;
  hp: number;
  maxHp: number;
  rewardGold: number;
  expReward: number;
  deadline?: string;
  type: BossType;
  status: 'active' | 'defeated';
}

// Shop Types
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  effectType: 'heal_stats' | 'gain_exp' | 'skin' | 'item';
  effectValue: number;
  targetType?: TaskType; // for exp gain or specific stat heal
}

// Rank Titles Configuration
export const RANK_TITLES: Record<TaskType, string[]> = {
  [TaskType.STUDY]: [
    "見習い読書家", "知識の探求者", "街の物知り", "博識な学者", "王宮の賢者", 
    "真理の解明者", "アカシックリーダー", "全知の予言者", "知の神", "全知全能"
  ],
  [TaskType.EXERCISE]: [
    "駆け出し冒険者", "鍛錬する戦士", "熟練の闘士", "一騎当千の英雄", "伝説の武人", 
    "武神の化身", "アースシェイカー", "星を砕く者", "力の神", "破壊神"
  ],
  [TaskType.WORK]: [
    "新米日雇い", "熟練の職人", "ギルドの親方", "街の有力者", "財閥の長", 
    "王国の宰相", "世界の支配者", "時空の管理者", "仕事の神", "創造神"
  ]
};

export const getTitleForLevel = (type: TaskType, level: number): string => {
  const titles = RANK_TITLES[type];
  // Change title every 10 levels. Index 0 for 1-9, Index 1 for 10-19...
  const index = Math.min(Math.floor((level) / 10), titles.length - 1);
  return titles[index];
};

// Level Calculation Logic
// Base cost: 100. Increases by 10% each level.
const BASE_EXP = 100;
const GROWTH_RATE = 1.1;

export const getLevelInfo = (totalExp: number) => {
  let level = 1;
  let required = BASE_EXP;
  let current = totalExp;

  // Subtract required exp for each level until we find the current level
  while (current >= required) {
    current -= required;
    level++;
    required = Math.floor(required * GROWTH_RATE);
  }

  return {
    level,
    currentLevelExp: Math.floor(current),
    nextLevelReq: required,
    progress: (current / required) * 100
  };
};

export const getTotalExpForLevelStart = (targetLevel: number): number => {
  let total = 0;
  let required = BASE_EXP;
  for (let i = 1; i < targetLevel; i++) {
    total += required;
    required = Math.floor(required * GROWTH_RATE);
  }
  return total;
};

export const TASK_CONFIG = {
  [TaskType.STUDY]: {
    label: '勉強 (知識)',
    icon: '📘',
    color: 'bg-blue-600',
    barColor: 'bg-gradient-to-r from-blue-600 to-cyan-400',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-900/50',
    bgLight: 'bg-blue-950/30',
    glowColor: 'shadow-blue-500/50'
  },
  [TaskType.EXERCISE]: {
    label: '運動 (体力)',
    icon: '💪',
    color: 'bg-red-600',
    barColor: 'bg-gradient-to-r from-red-600 to-orange-400',
    textColor: 'text-red-400',
    borderColor: 'border-red-900/50',
    bgLight: 'bg-red-950/30',
    glowColor: 'shadow-red-500/50'
  },
  [TaskType.WORK]: {
    label: '作業 (集中力)',
    icon: '🛠',
    color: 'bg-emerald-600',
    barColor: 'bg-gradient-to-r from-emerald-600 to-green-400',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-900/50',
    bgLight: 'bg-emerald-950/30',
    glowColor: 'shadow-emerald-500/50'
  }
};