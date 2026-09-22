// Hamro Safety - Profile Service
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

let localProfileData = {
  id: 'demo-user-123',
  email: 'sajus@zuptrix.com',
  full_name: 'Sajus Shrestha',
  phone_number: '+977-9841234567',
  blood_group: 'O+',
  medical_notes: 'No known drug allergies. Wear contact lenses.',
  preferred_language: 'en',
  avatar_url: null,
};

export const profileService = {
  isConfigured: isSupabaseConfigured,

  getProfile: async (userId = 'demo-user-123') => {
    if (!isSupabaseConfigured) {
      return { ...localProfileData };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return { ...localProfileData, id: userId };
    }
    return data;
  },

  updateProfile: async (userId, updates) => {
    if (!isSupabaseConfigured) {
      localProfileData = { ...localProfileData, ...updates };
      return { ...localProfileData };
    }

    const { data, error } = await supabase
      .from('users')
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default profileService;
