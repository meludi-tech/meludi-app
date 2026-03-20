import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill';

// ⚠️ IMPORTANTE: fallback seguro para Expo Go
const storage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});