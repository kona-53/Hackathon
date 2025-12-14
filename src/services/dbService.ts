
import { supabase } from '../lib/supabase';
import { Task, Stats, PetData, TaskType } from '../types';

// Tasks
export const dbGetTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  // Convert snake_case to camelCase if necessary, or just rely on direct mapping if columns match
  // Here we map DB columns to App types
  return data.map((t: any) => ({
    id: Number(t.id), // BigInt comes as string/number
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
  if (error) console.error('Error adding task:', error);
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
    
  if (error) console.error('Error updating task:', error);
};

export const dbDeleteTask = async (userId: string, taskId: number) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);
    
  if (error) console.error('Error deleting task:', error);
};

// Stats
export const dbGetStats = async (userId: string): Promise<Stats | null> => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('study, exercise, work')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
    console.error('Error fetching stats:', error);
    return null;
  }
  
  if (!data) return null;

  return {
    study: data.study,
    exercise: data.exercise,
    work: data.work
  };
};

export const dbSaveStats = async (userId: string, stats: Stats) => {
  const { error } = await supabase.from('user_stats').upsert({
    user_id: userId,
    study: stats.study,
    exercise: stats.exercise,
    work: stats.work,
    updated_at: new Date().toISOString()
  });
  if (error) console.error('Error saving stats:', error);
};

// Pet
export const dbGetPet = async (userId: string): Promise<PetData | null> => {
  const { data, error } = await supabase
    .from('user_pets')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching pet:', error);
    return null;
  }

  if (!data) return null;
  return data.data as PetData;
};

export const dbSavePet = async (userId: string, pet: PetData) => {
  const { error } = await supabase.from('user_pets').upsert({
    user_id: userId,
    data: pet,
    updated_at: new Date().toISOString()
  });
  if (error) console.error('Error saving pet:', error);
};
