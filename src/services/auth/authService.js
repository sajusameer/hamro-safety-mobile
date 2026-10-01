// Hamro Safety - Auth Service (Email & Password Authentication)
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from '../supabase';

export const authService = {
  isConfigured: isSupabaseConfigured,

  // Get current active session
  getSession: async () => {
    try {
      if (!isSupabaseConfigured) return { session: null };
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log('Supabase Auth Error:', error);
        throw error;
      }
      return { session: data.session };
    } catch (error) {
      console.log('Supabase Auth Error:', error);
      return { session: null, error };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      if (!isSupabaseConfigured) return { user: null, session: null };
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.log('Supabase Auth Error:', error);
        throw error;
      }
      return { user: data.user, session: data.session };
    } catch (error) {
      console.log('Supabase Auth Error:', error);
      throw error;
    }
  },

  // Register new user
  signUp: async (email, password, fullName, phoneNumber) => {
    try {
      if (!isSupabaseConfigured) return { user: null, session: null };
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
      if (error) {
        console.log('Supabase Auth Error:', error);
        throw error;
      }
      return { user: data.user, session: data.session };
    } catch (error) {
      console.log('Supabase Auth Error:', error);
      throw error;
    }
  },

  // Forgot password
  resetPassword: async (email) => {
    try {
      if (!isSupabaseConfigured) return { success: true };
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        console.log('Supabase Auth Error:', error);
        throw error;
      }
      return { success: true, data };
    } catch (error) {
      console.log('Supabase Auth Error:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      if (!isSupabaseConfigured) return { success: true };
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('Supabase Auth Error:', error);
        throw error;
      }
      return { success: true };
    } catch (error) {
      console.log('Supabase Auth Error:', error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    try {
      if (!isSupabaseConfigured) {
        return { unsubscribe: () => {} };
      }
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        try {
          callback(event, session);
        } catch (e) {
          console.warn('Auth state change callback error:', e);
        }
      });
      return subscription;
    } catch (err) {
      console.warn('onAuthStateChange setup error:', err);
      return { unsubscribe: () => {} };
    }
  },
};

export default authService;
