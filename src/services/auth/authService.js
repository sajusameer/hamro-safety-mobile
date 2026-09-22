// Hamro Safety - Auth Service
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Mock user for offline demo mode
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'sajus@zuptrix.com',
  user_metadata: {
    full_name: 'Sajus Shrestha',
    phone_number: '+977-9841234567',
    blood_group: 'O+',
    preferred_language: 'en',
  },
};

export const authService = {
  isConfigured: isSupabaseConfigured,

  // Get current active session
  getSession: async () => {
    if (!isSupabaseConfigured) {
      return { session: { user: DEMO_USER }, isDemo: true };
    }
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, isDemo: false };
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      // Demo authentication simulation
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        user: { ...DEMO_USER, email: email || DEMO_USER.email },
        isDemo: true,
      };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { user: data.user, session: data.session, isDemo: false };
  },

  // Register new user
  signUp: async (email, password, fullName, phoneNumber) => {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        user: {
          id: `demo-${Date.now()}`,
          email,
          user_metadata: { full_name: fullName, phone_number: phoneNumber },
        },
        isDemo: true,
      };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
        },
      },
    });
    if (error) throw error;
    return { user: data.user, session: data.session, isDemo: false };
  },

  // Forgot password
  resetPassword: async (email) => {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, isDemo: true, message: 'Password reset link simulated in demo mode.' };
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { success: true, data };
  },

  // Sign out
  signOut: async () => {
    if (!isSupabaseConfigured) {
      return { success: true };
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  },
};

export default authService;
