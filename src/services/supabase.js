// Hamro Safety - Supabase Backend Client
// Company: Zuptrix Solutions Pvt. Ltd.
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Verify credentials are present and not default placeholders
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('YOUR_SUPABASE_PROJECT_URL') &&
  !supabaseUrl.includes('your-project-id')
);

let client = null;

if (isSupabaseConfigured) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} else {
  // Graceful fallback stub for offline / demo mode
  console.info('[Hamro Safety] Supabase environment variables not configured. Operating in Demo/Mock Mode.');

  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    insert: () => mockQueryBuilder,
    update: () => mockQueryBuilder,
    upsert: () => mockQueryBuilder,
    delete: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    limit: () => mockQueryBuilder,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve) => resolve({ data: [], error: null }),
  };

  const mockChannel = {
    on: () => mockChannel,
    subscribe: (callback) => {
      if (typeof callback === 'function') callback('SUBSCRIBED');
      return mockChannel;
    },
    unsubscribe: () => {},
    send: async () => {},
  };

  client = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({
        data: null,
        error: new Error('Supabase URL/Key not configured. Please use Quick Demo Login.'),
      }),
      signUp: async () => ({
        data: null,
        error: new Error('Supabase URL/Key not configured. Please use Quick Demo Login.'),
      }),
      resetPasswordForEmail: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => mockQueryBuilder,
    channel: () => mockChannel,
    removeChannel: () => {},
  };
}

export const supabase = client;
export default supabase;
