// Hamro Safety - Supabase Client Bridge
// Re-exports Supabase client from src/services/supabase.js for backward compatibility
import { supabase, isSupabaseConfigured } from '../services/supabase';

export { supabase, isSupabaseConfigured };
export default supabase;
