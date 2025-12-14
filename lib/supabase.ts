
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to prevent runtime errors
const getEnvVar = (key: string) => {
  try {
    // Check if import.meta.env exists before accessing properties
    return (import.meta as any).env?.[key] || '';
  } catch (e) {
    console.warn(`Failed to read env var ${key}`, e);
    return '';
  }
};

// Use environment variables first, but fall back to provided credentials if missing
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://fxnpqpqjiwyxcpwvxudg.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4bnBxcHFqaXd5eGNwd3Z4dWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODcxMTAsImV4cCI6MjA4MTE2MzExMH0.e9ccMxK6dAiHzDQi4CfF-5q5nba7Y6_BnpORCwdIkOs';

export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};

// Initialize client
// Note: If keys are invalid, createClient might not throw immediately but subsequent calls will fail.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
