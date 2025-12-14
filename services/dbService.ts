
import { supabase } from '../lib/supabase';
import { Task, Stats, GeneratorData, TaskType, UserProfile, Boss, PoolMission } from '../types';

// Tasks
export const dbGetTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching tasks:', error.message);
    return [];
  }

  // Ensure data is an array
  const tasksData = data || [];

  return tasksData.map((t: any) => ({
    id: Number(t.id),
    title: t.title,
    date: t.date,
    type: t.type as TaskType,
    reward: t.reward,
    done: t.done,
    isSabori: t.is_sabori
  }));
};

export const dbAddTask = async (userId: string, task: Task) => {
  const { error } = await supabase.from('tasks').insert({
    id: task.id,
    user_id: userId,
    title: task.title,
    type: task.type,
    date: task.date,
    reward: task.reward,
    done: task.done,
    is_sabori: task.isSabori
  });
  if (error) console.error('Error adding task:', error.message);
};

export const dbUpdateTask = async (userId: string, task: Task) => {
  const { error } = await supabase
    .from('tasks')
    .update({
      title: task.title,
      type: task.type,
      date: task.date,
      reward: task.reward,
      done: task.done,
      is_sabori: task.isSabori
    })
    .eq('id', task.id)
    .eq('user_id', userId);
    
  if (error) console.error('Error updating task:', error.message);
};

export const dbDeleteTask = async (userId: string, taskId: number) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);
    
  if (error) console.error('Error deleting task:', error.message);
};

// Stats & Gold
export const dbGetStats = async (userId: string): Promise<Stats & { gold: number } | null> => {
  // Use select('*') to avoid errors if specific columns (like gold) are missing in the DB schema
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error('Error fetching stats:', error.message);
    }
    return null;
  }
  
  if (!data) return null;

  return {
    study: data.study || 0,
    exercise: data.exercise || 0,
    work: data.work || 0,
    gold: data.gold || 0 
  };
};

export const dbSaveStats = async (userId: string, stats: Stats & { gold?: number }) => {
  const basePayload: any = {
    user_id: userId,
    study: stats.study,
    exercise: stats.exercise,
    work: stats.work,
    updated_at: new Date().toISOString()
  };
  
  let payload = { ...basePayload };
  if (stats.gold !== undefined) {
    payload.gold = stats.gold;
  }

  const { error } = await supabase.from('user_stats').upsert(payload);
  
  if (error) {
    console.error('Error saving stats:', error.message);
    // Fallback: If saving with 'gold' failed (e.g., column missing), try saving without it to preserve other stats
    if (stats.gold !== undefined) {
        console.warn('Retrying save without gold column...');
        const { error: retryError } = await supabase.from('user_stats').upsert(basePayload);
        if (retryError) console.error('Error saving stats (fallback):', retryError.message);
    }
  }
};

// Generator (Idle Income) - Reusing 'user_pets' table to store the JSON data
export const dbGetGenerator = async (userId: string): Promise<GeneratorData | null> => {
  const { data, error } = await supabase
    .from('user_pets')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching generator:', error.message);
    return null;
  }

  if (!data) return null;
  return data.data as GeneratorData;
};

export const dbSaveGenerator = async (userId: string, generatorData: GeneratorData) => {
  const { error } = await supabase.from('user_pets').upsert({
    user_id: userId,
    data: generatorData,
    updated_at: new Date().toISOString()
  });
  if (error) console.error('Error saving generator:', error.message);
};

// Bosses
export const dbGetBosses = async (userId: string): Promise<Boss[]> => {
  try {
    const { data, error } = await supabase
        .from('bosses')
        .select('*')
        .eq('user_id', userId);
        
    if (error) {
        // Suppress error if table doesn't exist yet for user
        console.warn('Error fetching bosses (table might not exist):', error.message);
        return [];
    }
    
    return (data || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        hp: b.hp,
        maxHp: b.max_hp,
        rewardGold: b.reward_gold,
        expReward: b.exp_reward,
        deadline: b.deadline,
        type: b.type,
        status: b.status
    }));
  } catch (e) {
      return [];
  }
};

export const dbSaveBoss = async (userId: string, boss: Boss) => {
  try {
    const { error } = await supabase.from('bosses').upsert({
        id: boss.id,
        user_id: userId,
        name: boss.name,
        description: boss.description,
        hp: boss.hp,
        max_hp: boss.maxHp,
        reward_gold: boss.rewardGold,
        exp_reward: boss.expReward,
        deadline: boss.deadline,
        type: boss.type,
        status: boss.status
    });
    if (error) console.error('Error saving boss:', error.message);
  } catch (e) {
    console.error("Failed to save boss to DB", e);
  }
};

export const dbDeleteBoss = async (userId: string, bossId: string) => {
  try {
     const { error } = await supabase.from('bosses').delete().eq('id', bossId).eq('user_id', userId);
     if (error) console.error('Error deleting boss:', error.message);
  } catch(e) {
      console.error("Failed to delete boss DB", e);
  }
}

// User Profile
export const dbGetUserProfile = async (userId: string): Promise<UserProfile> => {
  // Use select('*') instead of named columns to prevent crash if weekly_goal is missing in DB
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error.message);
    return { hobbies: '', recentActivities: '', weeklyGoal: '' };
  }

  if (!data) return { hobbies: '', recentActivities: '', weeklyGoal: '' };

  return {
    hobbies: data.hobbies || '',
    recentActivities: data.recent_activities || '',
    weeklyGoal: data.weekly_goal || ''
  };
};

export const dbSaveUserProfile = async (userId: string, profile: UserProfile) => {
  const payload = {
    user_id: userId,
    hobbies: profile.hobbies,
    recent_activities: profile.recentActivities,
    weekly_goal: profile.weeklyGoal,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from('user_profiles').upsert(payload);
  
  if (error) {
    console.warn('Error saving profile (likely missing column):', error.message);
    // Fallback: Try saving without weekly_goal if that column is missing in DB
    const { weekly_goal, ...fallbackPayload } = payload;
    const { error: fallbackError } = await supabase.from('user_profiles').upsert(fallbackPayload);
    
    if (fallbackError) {
        console.error('Error saving profile fallback:', fallbackError.message);
    }
  }
};

// Mission Pool
export const dbGetMissionPool = async (userId: string): Promise<PoolMission[]> => {
  try {
    const { data, error } = await supabase
        .from('mission_pool')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        // If table doesn't exist (42P01), warn but don't crash
        if (error.code === '42P01') {
            console.warn('mission_pool table not found. Skipping cloud sync.');
            return [];
        }
        console.warn('Error fetching mission pool:', error.message);
        return [];
    }

    return (data || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        type: m.type as TaskType,
        reward: m.reward,
        isSabori: m.is_sabori,
        isUsed: m.is_used
    }));
  } catch (e) {
      console.error("Exception fetching mission pool:", e);
      return [];
  }
};

export const dbResetMissionPool = async (userId: string, missions: PoolMission[]) => {
  try {
      // 1. Delete all existing missions for this user
      const { error: deleteError } = await supabase
        .from('mission_pool')
        .delete()
        .eq('user_id', userId);
    
      if (deleteError) {
        // If table doesn't exist, we can't save. Stop here.
        if (deleteError.code === '42P01') {
            console.warn('mission_pool table not found. Cannot save missions.');
            return;
        }
        console.error('Error clearing mission pool:', deleteError.message);
        return;
      }

      if (missions.length === 0) return;

      // 2. Insert new missions
      const rows = missions.map(m => ({
        id: m.id,
        user_id: userId,
        title: m.title,
        type: m.type,
        reward: m.reward,
        is_sabori: m.isSabori,
        is_used: m.isUsed
      }));

      const { error: insertError } = await supabase
        .from('mission_pool')
        .insert(rows);

      if (insertError) console.error('Error inserting mission pool:', insertError.message);
  } catch (e) {
      console.error("Exception resetting mission pool:", e);
  }
};

export const dbUpdateMissionStatus = async (userId: string, missionId: string, isUsed: boolean) => {
  try {
      const { error } = await supabase
        .from('mission_pool')
        .update({ is_used: isUsed })
        .eq('id', missionId)
        .eq('user_id', userId);

      if (error) {
          if (error.code === '42P01') return; // Ignore if table missing
          console.error('Error updating mission status:', error.message);
      }
  } catch (e) {
      console.error("Exception updating mission status:", e);
  }
};
