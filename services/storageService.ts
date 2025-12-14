
import { Task, Stats, TaskType, PoolMission, StreakInfo, GeneratorData, Boss, UserProfile } from '../types';

const STORAGE_KEY_TASKS = 'mammon_king_tasks';
const STORAGE_KEY_STATS = 'mammon_king_stats';
const STORAGE_KEY_POOL = 'mammon_king_mission_pool';
const STORAGE_KEY_LAST_WEEK = 'mammon_king_last_week';
const STORAGE_KEY_LAST_VISIT_DATE = 'mammon_king_last_visit_date';
const STORAGE_KEY_STREAK = 'mammon_king_streak_data';
const STORAGE_KEY_GENERATOR = 'mammon_king_generator_data';
const STORAGE_KEY_BOSSES = 'mammon_king_bosses';
const STORAGE_KEY_GOLD = 'mammon_king_gold';
const STORAGE_KEY_PROFILE = 'mammon_king_user_profile';

export const loadTasks = (): Task[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load tasks", e);
    return [];
  }
};

export const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks", e);
  }
};

export const loadStats = (): Stats => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load stats", e);
  }
  
  return {
    [TaskType.STUDY]: 0,
    [TaskType.EXERCISE]: 0,
    [TaskType.WORK]: 0,
  };
};

export const saveStats = (stats: Stats) => {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save stats", e);
  }
};

export const loadMissionPool = (): PoolMission[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_POOL);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load pool", e);
    return [];
  }
};

export const saveMissionPool = (pool: PoolMission[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_POOL, JSON.stringify(pool));
  } catch (e) {
    console.error("Failed to save pool", e);
  }
};

export const getLastVisitWeek = (): string | null => {
  return localStorage.getItem(STORAGE_KEY_LAST_WEEK);
};

export const saveLastVisitWeek = (weekId: string) => {
  localStorage.setItem(STORAGE_KEY_LAST_WEEK, weekId);
};

// New functions for daily visit tracking
export const loadLastVisitDate = (): string | null => {
  return localStorage.getItem(STORAGE_KEY_LAST_VISIT_DATE);
};

export const saveLastVisitDate = (date: string) => {
  localStorage.setItem(STORAGE_KEY_LAST_VISIT_DATE, date);
};

// Generator (Idle Income) Storage
export const loadGenerator = (): GeneratorData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GENERATOR);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load generator", e);
  }
  
  // Default Generator Data
  return {
    lastCollected: new Date().toISOString()
  };
};

export const saveGenerator = (data: GeneratorData) => {
  try {
    localStorage.setItem(STORAGE_KEY_GENERATOR, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save generator", e);
  }
};

// Boss Storage
export const loadBosses = (): Boss[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BOSSES);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load bosses", e);
    return [];
  }
};

export const saveBosses = (bosses: Boss[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_BOSSES, JSON.stringify(bosses));
  } catch (e) {
    console.error("Failed to save bosses", e);
  }
};

// Gold Storage
export const loadGold = (): number => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GOLD);
    return saved ? Number(saved) : 0;
  } catch (e) {
    console.error("Failed to load gold", e);
    return 0;
  }
};

export const saveGold = (gold: number) => {
  try {
    localStorage.setItem(STORAGE_KEY_GOLD, String(gold));
  } catch (e) {
    console.error("Failed to save gold", e);
  }
};

// User Profile Storage
export const loadUserProfile = (): UserProfile => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load profile", e);
  }
  return { hobbies: '', recentActivities: '' };
};

export const saveUserProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
};

// Streak Logic
interface StreakData {
  lastLoginDate: string;
  count: number;
}

export const getAndUpdateStreak = (): StreakInfo => {
  const today = new Date().toISOString().split('T')[0];
  let data: StreakData = { lastLoginDate: '', count: 0 };
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY_STREAK);
    if (saved) data = JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load streak", e);
  }

  // Check logic
  let newCount = data.count;
  
  if (data.lastLoginDate === today) {
    // Already logged in today, return current state without increment
    // do nothing to count
  } else {
    const lastDate = new Date(data.lastLoginDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (data.lastLoginDate && diffDays === 1) {
      // Consecutive day
      newCount++;
    } else if (data.lastLoginDate && diffDays > 1) {
      // Streak broken
      newCount = 1;
    } else {
      // First time or data missing
      newCount = 1;
    }
    
    // Save updated streak
    localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify({
      lastLoginDate: today,
      count: newCount
    }));
  }

  // Calculate Bonus
  // Cycle of 7 days. 
  // Day 3: Small Bonus (30 EXP)
  // Day 7: Big Bonus (100 EXP)
  // Daily: Tiny Bonus (10 EXP)
  
  const cycleDay = newCount % 7;
  let bonusExp = 10; // Base daily bonus
  let isBonusDay = false;
  
  if (cycleDay === 3) {
    bonusExp = 30;
    isBonusDay = true;
  } else if (cycleDay === 0) { // Day 7, 14, 21...
    bonusExp = 100;
    isBonusDay = true;
  }

  // Days to next big bonus (Day 7 of cycle)
  const daysToNextBigBonus = cycleDay === 0 ? 7 : (7 - cycleDay);

  return {
    currentStreak: newCount,
    bonusExp,
    daysToNextBigBonus,
    isBonusDay
  };
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY_TASKS);
  localStorage.removeItem(STORAGE_KEY_STATS);
  localStorage.removeItem(STORAGE_KEY_POOL);
  localStorage.removeItem(STORAGE_KEY_LAST_WEEK);
  localStorage.removeItem(STORAGE_KEY_LAST_VISIT_DATE);
  localStorage.removeItem(STORAGE_KEY_STREAK);
  localStorage.removeItem(STORAGE_KEY_GENERATOR);
  localStorage.removeItem(STORAGE_KEY_BOSSES);
  localStorage.removeItem(STORAGE_KEY_GOLD);
  localStorage.removeItem(STORAGE_KEY_PROFILE);
};

// Helper to get current week ID (e.g., "2023-W45")
export const getCurrentWeekId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNum}`;
};