
import React, { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import jaLocale from '@fullcalendar/core/locales/ja';
import { Plus, RotateCcw, Zap, Coffee, LogOut, Cloud, CloudOff, Settings, Sparkles, Gift, Coins, ShoppingBag, Target, Lock, CheckCircle2, PlayCircle, HelpCircle, CloudRain, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Session } from '@supabase/supabase-js';

// MissionForm removed
// StatCorrectionForm removed
import { StatCard } from './components/StatCard';
import { LevelUpModal } from './components/LevelUpModal';
import { TaskContextMenu } from './components/TaskContextMenu';
import { DateContextMenu } from './components/DateContextMenu'; // New
import { WeeklySetupModal } from './components/WeeklySetupModal';
import { DailyGachaModal } from './components/DailyGachaModal';
import { EditTaskModal } from './components/EditTaskModal';
import { CreateTaskModal } from './components/CreateTaskModal'; // New
import { TaskCompletionModal } from './components/TaskCompletionModal';
import { MiningFarm } from './components/MiningFarm'; // NEW: Replaces PetCompanion
import { BossBattle } from './components/BossBattle';
import { ShopModal } from './components/ShopModal';
import { AnalyticsView } from './components/AnalyticsView';
// WeeklyGoalsPanel removed (logic integrated into App.tsx)
import { Auth } from './components/Auth';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';

import { Task, TaskType, Stats, TASK_CONFIG, PoolMission, StreakInfo, GeneratorData, getLevelInfo, UserProfile, Boss, ShopItem } from './types';
import { 
  loadTasks, saveTasks, loadStats, saveStats, clearAllData,
  loadMissionPool, saveMissionPool, getCurrentWeekId, getLastVisitWeek, saveLastVisitWeek,
  getAndUpdateStreak, loadGenerator, saveGenerator, loadLastVisitDate, saveLastVisitDate,
  loadBosses, saveBosses, loadGold, saveGold, loadUserProfile, saveUserProfile
} from './services/storageService';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { dbGetTasks, dbAddTask, dbUpdateTask, dbDeleteTask, dbGetStats, dbSaveStats, dbGetGenerator, dbSaveGenerator, dbGetUserProfile, dbSaveUserProfile, dbGetBosses, dbSaveBoss, dbDeleteBoss, dbGetMissionPool, dbResetMissionPool, dbUpdateMissionStatus } from './services/dbService';

const App: React.FC = () => {
  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCloudEnabled, setIsCloudEnabled] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({
    [TaskType.STUDY]: 0,
    [TaskType.EXERCISE]: 0,
    [TaskType.WORK]: 0,
  });
  
  // Idle Generator State (Replaces Pet)
  const [generatorData, setGeneratorData] = useState<GeneratorData>({
    lastCollected: new Date().toISOString(),
    potionCount: 0,
    skipTicketCount: 0,
    skipTicketBoughtCount: 0
  });

  const [bosses, setBosses] = useState<Boss[]>([]);
  const [gold, setGold] = useState<number>(0);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    hobbies: '',
    recentActivities: '',
    weeklyGoal: ''
  });

  const [missionPool, setMissionPool] = useState<PoolMission[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({
    currentStreak: 0,
    bonusExp: 0,
    daysToNextBigBonus: 0,
    isBonusDay: false
  });
  
  // Modals
  const [showWeeklySetup, setShowWeeklySetup] = useState(false);
  const [showDailyGacha, setShowDailyGacha] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showShop, setShowShop] = useState(false);
  
  // Create Task Modal via Context Menu
  const [showCreateTaskModal, setShowCreateTaskModal] = useState<{show: boolean, date: string}>({ show: false, date: '' });

  // Gacha availability state
  const [isGachaDone, setIsGachaDone] = useState(false);

  // Edit Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Completion Modal State
  const [completedTask, setCompletedTask] = useState<Task | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [levelUpState, setLevelUpState] = useState<{
    show: boolean;
    type: TaskType | null;
    level: number;
  }>({ show: false, type: null, level: 0 });

  // Task Context Menu (Existing)
  const [menuState, setMenuState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    taskId: number | null;
  }>({ visible: false, x: 0, y: 0, taskId: null });

  // Date Context Menu (New)
  const [dateMenuState, setDateMenuState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    dateStr: string | null;
  }>({ visible: false, x: 0, y: 0, dateStr: null });

  const calendarRef = useRef<FullCalendar>(null);

  // Initialize Auth
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoading(false);
      setIsCloudEnabled(false);
      return;
    }

    setIsCloudEnabled(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initial Data Load (Local or Cloud)
  useEffect(() => {
    const initData = async () => {
      // Common Local Data
      // Mission Pool is now loaded from DB if cloud is enabled, fallback to local otherwise later
      
      const sInfo = getAndUpdateStreak();
      setStreakInfo(sInfo);

      // Check Gacha Status on Init
      const todayStr = new Date().toISOString().split('T')[0];
      const lastVisitDate = loadLastVisitDate();
      setIsGachaDone(lastVisitDate === todayStr);

      if (session && isCloudEnabled) {
        // --- Cloud Mode ---
        try {
          const dbTasks = await dbGetTasks(session.user.id);
          const dbStats = await dbGetStats(session.user.id); // now returns gold too
          const dbGen = await dbGetGenerator(session.user.id);
          const dbProfile = await dbGetUserProfile(session.user.id);
          const dbBossesList = await dbGetBosses(session.user.id);
          const dbMissions = await dbGetMissionPool(session.user.id);

          setTasks(dbTasks);
          if (dbStats) {
             setStats({ study: dbStats.study, exercise: dbStats.exercise, work: dbStats.work });
             setGold(dbStats.gold || 0);
          }
          if (dbGen) setGeneratorData(prev => ({...prev, ...dbGen}));
          else setGeneratorData(loadGenerator()); // Fallback default

          if (dbProfile) {
            setUserProfile(dbProfile);
            // If profile is empty (hobbies/activities not set), force open profile settings first
            if (!dbProfile.hobbies && !dbProfile.recentActivities) {
              setShowProfileSettings(true);
            }
          }
          if (dbBossesList) setBosses(dbBossesList);
          
          // Use DB missions, or fallback to empty array (which will trigger weekly setup in the next effect)
          setMissionPool(dbMissions);
          
        } catch (e) {
          console.error("Cloud load error", e);
        }
      } else {
        // --- Local Mode ---
        setTasks(loadTasks());
        setStats(loadStats());
        setGeneratorData(loadGenerator());
        setBosses(loadBosses());
        setGold(loadGold());
        setMissionPool(loadMissionPool());
        
        const localProfile = loadUserProfile();
        setUserProfile(localProfile);
        // Local Mode: check if profile is empty
        if (!localProfile.hobbies && !localProfile.recentActivities) {
           setShowProfileSettings(true);
        }
      }
    };

    if (!authLoading) {
      initData();
    }
  }, [session, authLoading, isCloudEnabled]);

  // Dedicated Effect for Gacha/Weekly showing logic
  // Added showProfileSettings dependency to prevent overlap
  useEffect(() => {
    if (authLoading) return;
    
    // If Profile Settings is open, pause automatic flow
    if (showProfileSettings) return;

    // Tiny delay to ensure tasks state and pool are populated
    const timer = setTimeout(() => {
        const currentWeekId = getCurrentWeekId();
        const lastWeekId = getLastVisitWeek();
        
        const todayStr = new Date().toISOString().split('T')[0];
        const lastVisitDate = loadLastVisitDate();
        
        // 1. New Week Check
        if (currentWeekId !== lastWeekId) {
          setShowWeeklySetup(true);
          // When weekly setup finishes, it will trigger daily gacha for the first day
        } 
        // 2. Daily Check (if not triggered by weekly setup logic)
        else {
           // We need to check available missions from the current state `missionPool`
           // (which might have been loaded from DB or LocalStorage)
           const hasUnusedMissions = missionPool.some(p => !p.isUsed);

           // Only show if we haven't visited today AND we are not in setup/profile mode
           // Also ensures we have missions to draw from
           if (lastVisitDate !== todayStr && hasUnusedMissions && !showWeeklySetup) {
             setShowDailyGacha(true);
           }
        }
    }, 1000);
    return () => clearTimeout(timer);
  }, [authLoading, missionPool, showProfileSettings]); // Check whenever profile modal closes


  // Effect to visually disable Gacha button in FullCalendar
  useEffect(() => {
    // Hack to style FullCalendar custom buttons since they don't support dynamic classes natively
    const gachaBtn = document.querySelector('.fc-dailyGacha-button') as HTMLButtonElement;
    if (gachaBtn) {
        if (isGachaDone) {
            gachaBtn.disabled = true;
            gachaBtn.style.opacity = '0.5';
            gachaBtn.style.cursor = 'not-allowed';
            gachaBtn.style.backgroundColor = '#374151'; // gray-700
            gachaBtn.style.borderColor = '#374151';
            gachaBtn.style.boxShadow = 'none';
        } else {
            gachaBtn.disabled = false;
            gachaBtn.style.opacity = '1';
            gachaBtn.style.cursor = 'pointer';
            gachaBtn.style.backgroundColor = ''; // Revert to CSS default
            gachaBtn.style.borderColor = '';
            gachaBtn.style.boxShadow = '';
        }
    }
  }, [isGachaDone, missionPool]);

  // Persistence Helpers
  const handleGoldUpdate = async (newGold: number) => {
    setGold(newGold);
    if (session && isCloudEnabled) {
      // Save stats includes gold
      await dbSaveStats(session.user.id, { ...stats, gold: newGold });
    } else {
      saveGold(newGold);
    }
  };

  const handleGeneratorUpdate = async (newData: GeneratorData) => {
    setGeneratorData(newData);
    if (session && isCloudEnabled) await dbSaveGenerator(session.user.id, newData);
    else saveGenerator(newData);
  };

  const handleCollectGeneratedGold = async (amount: number) => {
    // Add to total gold
    const newGold = gold + amount;
    handleGoldUpdate(newGold);

    // Update last collected time (preserve potion data)
    const newData = { 
      ...generatorData, 
      lastCollected: new Date().toISOString() 
    };
    handleGeneratorUpdate(newData);
  };

  const handleAddTask = async (title: string, type: TaskType, date: string, reward: number, isSabori: boolean = false) => {
    // Check if this is the first task for this date
    const existingTasksForDate = tasks.filter(t => t.date === date);
    
    // Logic: If creating a task on a day with NO missions, burn one random mission from the pool
    if (existingTasksForDate.length === 0) {
        const availableMissions = missionPool.filter(p => !p.isUsed);
        if (availableMissions.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableMissions.length);
            const missionToRemove = availableMissions[randomIndex];
            
            // Mark as used (burned)
            const updatedPool = missionPool.map(p => p.id === missionToRemove.id ? { ...p, isUsed: true } : p);
            setMissionPool(updatedPool);
            
            if (session && isCloudEnabled) {
                await dbUpdateMissionStatus(session.user.id, missionToRemove.id, true);
            } else {
                saveMissionPool(updatedPool);
            }
        }
    }

    const newTask: Task = {
      id: Date.now(),
      title,
      type,
      date,
      reward,
      done: false,
      isSabori
    };

    setTasks(prev => [...prev, newTask]);
    
    if (session && isCloudEnabled) {
      await dbAddTask(session.user.id, newTask);
    } else {
      saveTasks([...tasks, newTask]);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    const originalTask = tasks.find(t => t.id === updatedTask.id);
    
    if (originalTask && originalTask.done && !originalTask.isSabori) {
        // Adjust stats if reward changed
        const expToRemove = originalTask.reward;
        const typeToRemoveFrom = originalTask.type;
        const expToAdd = updatedTask.reward;
        const typeToAddTo = updatedTask.type;
        
        const newStats = { ...stats };
        newStats[typeToRemoveFrom] = Math.max(0, newStats[typeToRemoveFrom] - expToRemove);
        newStats[typeToAddTo] = newStats[typeToAddTo] + expToAdd;
        
        setStats(newStats);
        if (session && isCloudEnabled) await dbSaveStats(session.user.id, { ...newStats, gold });
        else saveStats(newStats);
    }

    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    
    if (session && isCloudEnabled) await dbUpdateTask(session.user.id, updatedTask);
    else saveTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));

    setEditingTask(null);
  };

  const handleDeleteTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (confirm(`「${task.title}」を削除しますか？`)) {
      if (task.done && !task.isSabori) {
        const newStats = { ...stats };
        newStats[task.type] = Math.max(0, newStats[task.type] - task.reward);
        setStats(newStats);
        if (session && isCloudEnabled) await dbSaveStats(session.user.id, { ...newStats, gold });
        else saveStats(newStats);
      }
      
      const newTasks = tasks.filter(t => t.id !== id);
      setTasks(newTasks);
      
      if (session && isCloudEnabled) await dbDeleteTask(session.user.id, id);
      else saveTasks(newTasks);

      setEditingTask(null); // Close modal if open
    }
  };

  const handleStatUpdate = async (newStats: Stats) => {
    setStats(newStats);
    if (session && isCloudEnabled) await dbSaveStats(session.user.id, { ...newStats, gold });
    else saveStats(newStats);
  };
  
  const handleProfileUpdate = async (newProfile: UserProfile) => {
    const mergedProfile = { ...userProfile, ...newProfile };
    setUserProfile(mergedProfile);
    
    if (session && isCloudEnabled) {
      await dbSaveUserProfile(session.user.id, mergedProfile);
    } else {
      saveUserProfile(mergedProfile);
    }

    // After saving profile, check if weekly setup is needed (this helps it feel responsive)
    // The useEffect will also catch this, but explicit check ensures intent.
    const currentWeekId = getCurrentWeekId();
    const lastWeekId = getLastVisitWeek();
    if (currentWeekId !== lastWeekId || missionPool.length === 0) {
        setShowWeeklySetup(true);
    }
  };

  // Emergency Sabori Handler (Skip Tasks)
  const handleEmergencySabori = async () => {
    // Get today in local YYYY-MM-DD
    const d = new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Find pending tasks for today
    const pendingTasks = tasks.filter(t => t.date === todayStr && !t.done);

    if (pendingTasks.length === 0) {
        alert("本日サボる（スキップする）タスクがありません。");
        return;
    }

    // Check for Skip Ticket (Indulgence)
    const currentSkipTickets = generatorData.skipTicketCount || 0;
    let useTicket = false;

    if (currentSkipTickets > 0) {
       useTicket = confirm(`免罪符（スキップチケット）を所持しています（残り${currentSkipTickets}枚）。\n\nチケットを使用して、ペナルティなしでサボりますか？\n（キャンセルを押すと、通常通りペナルティを受けてサボります）`);
    } else {
       if (!confirm(`本日の未完了タスク${pendingTasks.length}件を全てサボりますか？\n\n【警告】\nタスクで得られるはずだった経験値がステータスから減算されます。`)) {
           return;
       }
    }

    const newStats = { ...stats };
    const updatedTasks = [...tasks];
    let penaltyTotal = 0;

    for (const task of pendingTasks) {
        // Calculate penalty (reward amount)
        const penalty = task.reward;
        
        let finalReward = -penalty; // Default to negative reward (penalty)

        if (useTicket) {
             // If using ticket, NO stat reduction.
             // Set reward to 0 (neutral) so it doesn't show as a penalty in UI history
             finalReward = 0;
        } else {
             // Normal Sabori
             penaltyTotal += penalty;
             // Deduct from stats (ensure non-negative)
             newStats[task.type] = Math.max(0, newStats[task.type] - penalty);
        }

        // Update task: Done = true
        const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
        if (taskIndex > -1) {
            const updatedTask = { 
                ...task, 
                done: true, 
                reward: finalReward
            };
            updatedTasks[taskIndex] = updatedTask;
            
            // Sync individual task to DB
            if (session && isCloudEnabled) await dbUpdateTask(session.user.id, updatedTask);
        }
    }

    setTasks(updatedTasks);
    
    // Update Stats & Generator Data (for ticket consumption)
    if (useTicket) {
         // Decrease ticket count
         const newData = { ...generatorData, skipTicketCount: Math.max(0, currentSkipTickets - 1) };
         handleGeneratorUpdate(newData);
         alert(`免罪符を使用しました。\n本日のタスクをペナルティなしでスキップしました。`);
    } else {
         // Apply stat penalty
         setStats(newStats);
         alert(`本日のタスクを放棄しました。\n合計 -${penaltyTotal} EXP のペナルティを受けました。`);
    }
    
    // Save Stats (only needed if ticket was NOT used, or general save to be safe)
    if (session && isCloudEnabled) {
        await dbSaveStats(session.user.id, { ...newStats, gold });
    } else {
        saveTasks(updatedTasks);
        saveStats(newStats);
    }
  };

  // Helper for Task Completion logic
  const completeTask = async (task: Task) => {
     // Get today's date using local time logic consistent with App initialization
     const d = new Date();
     const year = d.getFullYear();
     const month = (d.getMonth() + 1).toString().padStart(2, '0');
     const day = d.getDate().toString().padStart(2, '0');
     const todayStr = `${year}-${month}-${day}`;

     let finalReward = task.reward;

     // Reduce reward if overdue (and not a rest task)
     // Overdue = Task Date < Today
     if (!task.isSabori && task.date < todayStr) {
        finalReward = Math.floor(task.reward * 0.3);
     }

     // 1. Mark Done locally with potentially reduced reward
     // We update the reward in the task object so history and modal show actual gained amount
     const updatedTask = { ...task, done: true, reward: finalReward };
     
     setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
     
     if (session && isCloudEnabled) await dbUpdateTask(session.user.id, updatedTask);
     else saveTasks(tasks.map(t => t.id === task.id ? updatedTask : t));

     if (task.isSabori) {
        // Penalty Logic
        const penalty = Math.floor(Math.random() * 21) + 10;
        let maxStatType: TaskType = TaskType.WORK;
        let maxVal = -1;
        (Object.keys(stats) as TaskType[]).forEach(key => {
            if (stats[key] > maxVal) { maxVal = stats[key]; maxStatType = key; }
        });
        
        const newExp = Math.max(0, stats[maxStatType] - penalty);
        const newStats = { ...stats, [maxStatType]: newExp };
        setStats(newStats);
        
        if (session && isCloudEnabled) await dbSaveStats(session.user.id, { ...newStats, gold });
        else saveStats(newStats);

        setCompletedTask({ ...updatedTask, reward: penalty, type: maxStatType });
     } else {
        // Reward Logic (EXP)
        setCompletedTask(updatedTask);
        const currentExp = stats[task.type];
        const newExp = currentExp + finalReward; // Use reduced reward
        const oldLevel = getLevelInfo(currentExp).level;
        const newLevel = getLevelInfo(newExp).level;

        const newStats = { ...stats, [task.type]: newExp };
        setStats(newStats);

        if (newLevel > oldLevel) {
            setLevelUpState({ show: true, type: task.type, level: newLevel });
        }
        
        // --- NEW: Gold Logic ---
        // Earn gold based on 50% of EXP reward
        const earnedGold = Math.floor(finalReward * 0.5);
        const newGold = gold + earnedGold;
        handleGoldUpdate(newGold);
        
        // Save Stats & Gold together
        if (session && isCloudEnabled) await dbSaveStats(session.user.id, { ...newStats, gold: newGold });
        else saveStats(newStats);

        // --- NEW: Boss Damage Logic ---
        const activeBoss = bosses.find(b => b.status === 'active');
        if (activeBoss) {
            // Damage is roughly equal to EXP earned
            const damage = finalReward;
            const newHp = Math.max(0, activeBoss.hp - damage);
            let updatedBoss = { ...activeBoss, hp: newHp };
            
            if (newHp === 0) {
               // Boss Defeated!
               updatedBoss.status = 'defeated';
               
               // Give Rewards
               const bossGold = activeBoss.rewardGold;
               const bossExp = activeBoss.expReward;
               
               handleGoldUpdate(newGold + bossGold); // Add both task gold and boss gold
               
               // Add EXP to all stats evenly for boss reward? Or specific? Let's do even split.
               const splitExp = Math.floor(bossExp / 3);
               newStats[TaskType.STUDY] += splitExp;
               newStats[TaskType.EXERCISE] += splitExp;
               newStats[TaskType.WORK] += splitExp;
               setStats(newStats); // Update stats again
               
               if (session && isCloudEnabled) {
                 await dbSaveStats(session.user.id, { ...newStats, gold: newGold + bossGold });
               } else {
                 saveStats(newStats);
               }
               
               alert(`🎉 ボス「${activeBoss.name}」を討伐しました！\n報酬: ${bossGold}G, ${bossExp}EXP`);
            }
            
            const newBosses = bosses.map(b => b.id === activeBoss.id ? updatedBoss : b);
            setBosses(newBosses);
            if (session && isCloudEnabled) await dbSaveBoss(session.user.id, updatedBoss);
            else saveBosses(newBosses);
        }
     }
  };

  // Handlers for Toggle Status
  const handleToggleStatus = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.done) {
        // Undo
        if (!task.isSabori) {
            // If reward is negative (was skipped/sabori'd), add it back (double negative = positive subtraction? No.)
            // Logic: stats - reward. If reward was 50, stats = stats - 50.
            // If reward was -50 (penalty), stats = stats - (-50) = stats + 50. Correct.
            const newStats = { ...stats };
            // Ensure we don't handle legacy rest tasks weirdly, but for normal/skipped tasks:
            newStats[task.type] = Math.max(0, newStats[task.type] - task.reward);
            handleStatUpdate(newStats);
            
            // If it was a skipped task (negative reward), revert reward to positive when undoing
            if (task.reward < 0) {
                task.reward = Math.abs(task.reward);
            }
        } else {
            alert("休息タスクの取り消しによるステータス返還は手動で行ってください。");
        }
        
        const updatedTask = { ...task, done: false };
        setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
        if (session && isCloudEnabled) await dbUpdateTask(session.user.id, updatedTask);
        else saveTasks(tasks.map(t => t.id === id ? updatedTask : t));

    } else {
        completeTask(task);
    }
  };

  // Handlers for Gacha/Weekly that update pools and stats
  const handleWeeklySetupComplete = async (missions: PoolMission[], goalText: string) => {
    // 1. Update Mission Pool
    setMissionPool(missions);
    saveLastVisitWeek(getCurrentWeekId());
    
    // 2. Update Weekly Goal in Profile
    const updatedProfile = { ...userProfile, weeklyGoal: goalText };
    setUserProfile(updatedProfile);

    // Save Data
    if (session && isCloudEnabled) {
        await dbResetMissionPool(session.user.id, missions);
        await dbSaveUserProfile(session.user.id, updatedProfile);
    } else {
        saveMissionPool(missions);
        saveUserProfile(updatedProfile);
    }

    setShowWeeklySetup(false);
    setShowDailyGacha(true);
  };

  const handleGachaComplete = async (mission: PoolMission) => {
    const updatedPool = missionPool.map(p => p.id === mission.id ? { ...p, isUsed: true } : p);
    setMissionPool(updatedPool);
    
    if (session && isCloudEnabled) {
        await dbUpdateMissionStatus(session.user.id, mission.id, true);
    } else {
        saveMissionPool(updatedPool);
    }

    // Use local time for 'today' instead of UTC to ensure the task appears on the correct day for the user
    const d = new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    // Save last visit date to today, so it doesn't show again today
    saveLastVisitDate(todayStr);
    setIsGachaDone(true); // Update state

    handleAddTask(mission.title, mission.type, todayStr, mission.reward, mission.isSabori);

    if (streakInfo.bonusExp > 0) {
        const newStats = { ...stats };
        newStats[mission.type] += streakInfo.bonusExp;
        handleStatUpdate(newStats);

        // Level up check for bonus...
        const oldLevel = getLevelInfo(stats[mission.type]).level;
        const newLevel = getLevelInfo(newStats[mission.type]).level;
        if (newLevel > oldLevel) setLevelUpState({ show: true, type: mission.type, level: newLevel });
    }
    setShowDailyGacha(false);
  };
  
  const handleDateClick = useCallback((arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
  }, []);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    // Only handle clicks for actual tasks
    if (arg.event.extendedProps.isGoal) return;

    const taskId = arg.event.extendedProps.taskId;
    if (!taskId) return;
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.done) completeTask(task);
  }, [tasks, stats, bosses, gold]); // Depend on state

  // Other UI handlers
  const handleEventMount = useCallback((info: any) => {
    // Disable right click menu for Goal events
    if (info.event.extendedProps.isGoal) return;

    // Left click on event (context menu logic)
    info.el.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation(); // Stop propagation so date cell context menu doesn't also trigger
      setMenuState({ visible: true, x: e.clientX, y: e.clientY, taskId: info.event.extendedProps.taskId });
    });
  }, []);
  
  // Date Cell Mount for Right Click
  const handleDayCellMount = useCallback((arg: any) => {
    const el = arg.el as HTMLElement;
    el.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      const d = arg.date;
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      setDateMenuState({ visible: true, x: e.clientX, y: e.clientY, dateStr: dateStr });
    });
  }, []);

  // Boss & Shop Handlers
  const handleAddBoss = async (newBoss: Boss) => {
    setBosses(prev => [...prev, newBoss]);
    if (session && isCloudEnabled) await dbSaveBoss(session.user.id, newBoss);
    else saveBosses([...bosses, newBoss]);
  };
  
  const handleDeleteBoss = async (bossId: string) => {
     const newBosses = bosses.filter(b => b.id !== bossId);
     setBosses(newBosses);
     if (session && isCloudEnabled) await dbDeleteBoss(session.user.id, bossId);
     else saveBosses(newBosses);
  };

  const handleBuyItem = async (item: ShopItem) => {
    // NOTE: item.cost passed here comes from the UI (which already has dynamic calculation applied)
    if (gold < item.cost) return;
    
    // Deduct Gold
    const newGold = gold - item.cost;
    handleGoldUpdate(newGold);
    
    // Handle Item Specific Logic
    if (item.id === 'potion_stamina') {
        const currentPotionCount = generatorData.potionCount || 0;
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        const newData = {
            ...generatorData,
            potionCount: currentPotionCount + 1,
            lastShopMonth: currentMonth
        };
        handleGeneratorUpdate(newData);
    } else if (item.id === 'skip_ticket') {
        const currentSkipBought = generatorData.skipTicketBoughtCount || 0;
        const currentSkipInventory = generatorData.skipTicketCount || 0;
        const currentMonth = new Date().toISOString().slice(0, 7);

        const newData = {
            ...generatorData,
            skipTicketBoughtCount: currentSkipBought + 1,
            skipTicketCount: currentSkipInventory + 1,
            lastShopMonth: currentMonth
        };
        handleGeneratorUpdate(newData);
    }
    
    // Apply Stats Effects (Immediate)
    if (item.effectType === 'heal_stats') {
       const newStats = { ...stats };
       newStats[TaskType.STUDY] += item.effectValue;
       newStats[TaskType.EXERCISE] += item.effectValue;
       newStats[TaskType.WORK] += item.effectValue;
       
       setStats(newStats);
       if (session && isCloudEnabled) await dbSaveStats(session.user.id, { ...newStats, gold: newGold });
       else saveStats(newStats);
       
       alert(`「${item.name}」を購入し、効果が適用されました！`);
    } else if (item.effectType === 'item') {
        // Just inventory update handled above
        alert(`「${item.name}」を購入しました！`);
    }
    
    setShowShop(false);
  };

  // Check for monthly price reset on Shop Open
  const handleOpenShop = () => {
     const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
     
     if (generatorData.lastShopMonth !== currentMonth) {
         // It's a new month (or first time), reset price counters
         const newData = {
             ...generatorData,
             potionCount: 0,
             skipTicketBoughtCount: 0,
             lastShopMonth: currentMonth
         };
         handleGeneratorUpdate(newData);
     }
     
     setShowShop(true);
  };

  // Calculate current dynamic prices
  const currentPotionCount = generatorData.potionCount || 0;
  const currentPotionPrice = 1000 + (currentPotionCount * 100);

  const currentSkipBought = generatorData.skipTicketBoughtCount || 0;
  const currentSkipTicketPrice = 2000 + (currentSkipBought * 200);

  // Calendar Events transformation
  const calendarEvents = [
    // 1. Regular Daily Tasks
    ...tasks.map(t => {
        const config = TASK_CONFIG[t.type];
        const isRest = t.isSabori;
        let classNames = [
        t.done ? 'opacity-50 cursor-default line-through grayscale' : `cursor-pointer hover:scale-[1.02] transition-transform shadow-md border-none text-white font-medium`
        ];
        
        // Handle visualization for Skipped (Negative Reward or Zero Reward) tasks vs Rest Tasks
        if (isRest) {
           if (!t.done) classNames.push('bg-pink-600/80 border-pink-500');
        } else {
           if (t.reward < 0) {
             // Sabori Skipped Task (Penalty)
             classNames = ['bg-red-900/50 border-red-700/50 text-red-400 line-through opacity-70'];
           } else if (t.done && t.reward === 0) {
             // Sabori Skipped Task (Ticket Used - No Penalty)
             classNames = ['bg-gray-700/50 border-gray-600 text-gray-400 line-through opacity-70'];
           } else {
             if (!t.done) classNames.push(config.color);
           }
        }

        let rewardText = `(+${t.reward})`;
        if (t.reward < 0) rewardText = `(${t.reward})`;
        if (t.done && t.reward === 0) rewardText = '(Void)';

        let icon = config.icon;
        if (isRest) icon = '🛌';
        else if (t.reward < 0) icon = '❌';
        else if (t.done && t.reward === 0) icon = '🎫';

        return {
        id: String(t.id),
        title: `${icon} ${t.title} ${isRest ? '' : rewardText}`,
        start: t.date,
        allDay: true,
        backgroundColor: t.done ? undefined : undefined, // Handled by classNames
        classNames: classNames,
        extendedProps: { taskId: t.id, isGoal: false }
        };
    })
    // REMOVED: Weekly Goal events from calendar grid as requested
  ];

  const selectedTask = tasks.find(t => t.id === menuState.taskId) || null;

  // -- RENDER --

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="font-mono text-blue-400 animate-pulse">SYSTEM LOADING...</div>
        </div>
      </div>
    );
  }

  // If cloud is enabled (configured) but no session, show Auth
  if (isCloudEnabled && !session) {
    return <Auth />;
  }

  const isWeeklyGoalSet = missionPool.length > 0;

  return (
    <div className="min-h-screen p-4 md:p-6 flex flex-col gap-6 max-w-[1400px] mx-auto bg-gray-950 text-slate-200">
      <header className="text-center mb-4 relative flex justify-center items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none"></div>
        
        {isCloudEnabled && (
           <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="bg-gray-900/80 px-4 py-1.5 rounded-full border border-yellow-500/30 text-yellow-400 font-mono font-bold flex items-center gap-2 shadow-lg">
                 <Coins size={14} /> {gold.toLocaleString()} G
              </div>
              
              {/* Display Ticket Count if > 0 */}
              {generatorData.skipTicketCount && generatorData.skipTicketCount > 0 ? (
                  <div className="bg-gray-900/80 px-3 py-1.5 rounded-full border border-blue-500/30 text-blue-400 font-mono font-bold flex items-center gap-2 shadow-lg text-xs">
                     <Ticket size={14} /> {generatorData.skipTicketCount}
                  </div>
              ) : null}

              <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800 text-xs text-gray-400">
                 <Cloud size={14} className="text-emerald-500"/>
                 {/* Display username from metadata, fallback to email name part */}
                 <span className="hidden sm:inline">
                   {session?.user.user_metadata?.username || session?.user.email?.split('@')[0]}
                 </span>
              </div>
              
              <button
                onClick={handleOpenShop}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-yellow-400 hover:text-yellow-200 rounded-full transition-colors border border-yellow-500/20"
                title="アイテムショップ"
              >
                <ShoppingBag size={16} />
              </button>

              <button
                onClick={() => setShowProfileSettings(true)}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition-colors"
                title="プレイヤー設定"
              >
                <Settings size={16} />
              </button>

              <button 
                onClick={() => supabase.auth.signOut()}
                className="p-2 bg-gray-800 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded-full transition-colors"
                title="ログアウト"
              >
                <LogOut size={16} />
              </button>
           </div>
        )}
        
        {!isCloudEnabled && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <div className="bg-gray-900/80 px-4 py-1.5 rounded-full border border-yellow-500/30 text-yellow-400 font-mono font-bold flex items-center gap-2 shadow-lg">
                    <Coins size={14} /> {gold.toLocaleString()} G
                </div>
                {generatorData.skipTicketCount && generatorData.skipTicketCount > 0 ? (
                  <div className="bg-gray-900/80 px-3 py-1.5 rounded-full border border-blue-500/30 text-blue-400 font-mono font-bold flex items-center gap-2 shadow-lg text-xs">
                     <Ticket size={14} /> {generatorData.skipTicketCount}
                  </div>
                ) : null}
                <button
                    onClick={handleOpenShop}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-yellow-400 hover:text-yellow-200 rounded-full transition-colors border border-yellow-500/20"
                    title="アイテムショップ"
                >
                    <ShoppingBag size={16} />
                </button>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                    <CloudOff size={14} /> Local Mode
                </div>
            </div>
        )}

        <h1 className="relative z-10 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 tracking-tight flex items-center justify-center gap-3 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
          <span className="text-5xl filter drop-shadow-lg">🌱</span> GROW
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Left Sidebar (4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <MiningFarm 
             stats={stats} 
             generatorData={generatorData} 
             onCollect={handleCollectGeneratedGold} 
          />
          <BossBattle bosses={bosses} onAddBoss={handleAddBoss} onDeleteBoss={handleDeleteBoss} />
          <AnalyticsView tasks={tasks} stats={stats} compact={true} />
        </div>

        {/* Right Content (8) - Calendar Only (Full Width) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Calendar Section */}
          <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-800 min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>

            {/* NEW: Weekly Goals Section (Text Only) */}
            <div className="mb-6 relative z-10 bg-gray-800/40 p-5 rounded-xl border border-gray-700/50">
                <h3 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider border-b border-gray-700/50 pb-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    今週の目標 (Weekly Goal)
                </h3>
                {userProfile.weeklyGoal ? (
                    <div className="text-sm text-gray-200 font-medium whitespace-pre-wrap leading-relaxed">
                        {userProfile.weeklyGoal}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 font-medium whitespace-pre-wrap leading-relaxed italic text-center py-2">
                        週の目標が決まっていません
                    </div>
                )}
            </div>
            
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 relative z-10">
                <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2 shrink-0"><span className="text-2xl">📅</span> カレンダー</h2>
                <div className="flex flex-1 w-full xl:w-auto gap-3 overflow-x-auto pb-2 xl:pb-0">
                     <StatCard type={TaskType.STUDY} exp={stats[TaskType.STUDY]} compact />
                     <StatCard type={TaskType.EXERCISE} exp={stats[TaskType.EXERCISE]} compact />
                     <StatCard type={TaskType.WORK} exp={stats[TaskType.WORK]} compact />
                </div>
            </div>

            {/* Calendar Container */}
            <div className="flex-1 h-[600px] md:h-[700px] text-sm relative z-10">
                <FullCalendar
                ref={calendarRef}
                plugins={[ dayGridPlugin, interactionPlugin ]}
                initialView="dayGridMonth"
                locale={jaLocale}
                events={calendarEvents}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventDidMount={handleEventMount}
                dayCellDidMount={handleDayCellMount}
                dayCellContent={(arg) => (
                    <span className="relative flex items-center gap-1 justify-center">
                        {arg.dayNumberText}
                        {arg.isToday && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block shadow-[0_0_5px_rgba(52,211,153,0.8)]"></span>}
                    </span>
                )}
                showNonCurrentDates={true}
                fixedWeekCount={false}
                customButtons={{
                    customToday: {
                    text: '今日',
                    click: () => {
                        const calendarApi = calendarRef.current?.getApi();
                        if (calendarApi) {
                        calendarApi.today();
                        const d = new Date();
                        const dateStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
                        setSelectedDate(dateStr);
                        }
                    }
                    },
                    weeklySetup: {
                        text: isWeeklyGoalSet ? '🔄 週目標変更' : '✨ 週目標',
                        click: () => setShowWeeklySetup(true)
                    },
                    dailyGacha: {
                        text: isGachaDone ? '🎁 済' : '🎁 ガチャ',
                        click: () => {
                            if (isGachaDone) return;
                            if (missionPool.every(p => p.isUsed)) {
                                alert("利用可能なミッションがありません。週間目標を再生成してください。");
                                return;
                            }
                            setShowDailyGacha(true);
                        }
                    },
                    saboriButton: {
                        text: '🛌 サボる',
                        click: handleEmergencySabori,
                        hint: '本日の未完了タスクを破棄し、ペナルティを受けます'
                    }
                }}
                headerToolbar={{ left: 'prev,next', center: 'title', right: 'weeklySetup,dailyGacha saboriButton customToday' }}
                height="100%"
                dayMaxEvents={3}
                selectable={true}
                selectMirror={true}
                />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LevelUpModal show={levelUpState.show} type={levelUpState.type} newLevel={levelUpState.level} onClose={() => setLevelUpState(prev => ({ ...prev, show: false }))} />
      {showWeeklySetup && <WeeklySetupModal onComplete={handleWeeklySetupComplete} onClose={() => setShowWeeklySetup(false)} userProfile={userProfile} />}
      {showDailyGacha && <DailyGachaModal pool={missionPool} onRoll={handleGachaComplete} onClose={() => setShowDailyGacha(false)} streakInfo={streakInfo} />}
      {editingTask && <EditTaskModal task={editingTask} onSave={handleUpdateTask} onDelete={handleDeleteTask} onClose={() => setEditingTask(null)} />}
      <TaskCompletionModal show={!!completedTask} task={completedTask} onClose={() => setCompletedTask(null)} />
      {showProfileSettings && <ProfileSettingsModal profile={userProfile} onSave={handleProfileUpdate} onClose={() => setShowProfileSettings(false)} />}
      
      {/* Updated Shop Modal with dynamic price */}
      {showShop && (
         <ShopModal 
            gold={gold} 
            onClose={() => setShowShop(false)} 
            onBuy={handleBuyItem} 
            currentPotionPrice={currentPotionPrice}
            currentSkipTicketPrice={currentSkipTicketPrice}
         />
      )}
      
      {showCreateTaskModal.show && (
          <CreateTaskModal 
            date={showCreateTaskModal.date} 
            onAdd={handleAddTask} 
            onClose={() => setShowCreateTaskModal({ show: false, date: '' })} 
          />
      )}
      
      {menuState.visible && <TaskContextMenu x={menuState.x} y={menuState.y} task={selectedTask} onClose={() => setMenuState(prev => ({ ...prev, visible: false }))} onDelete={handleDeleteTask} onToggleStatus={handleToggleStatus} onEdit={setEditingTask} />}
      {dateMenuState.visible && dateMenuState.dateStr && (
        <DateContextMenu 
          x={dateMenuState.x} 
          y={dateMenuState.y} 
          dateStr={dateMenuState.dateStr}
          onClose={() => setDateMenuState(prev => ({ ...prev, visible: false }))}
          onCreateMission={() => setShowCreateTaskModal({ show: true, date: dateMenuState.dateStr! })}
        />
      )}
    </div>
  );
};

export default App;
