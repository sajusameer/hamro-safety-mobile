// Hamro Safety - Profile Service
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from '../supabase';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

let localProfileData = {
  id: DEMO_USER_ID,
  email: null,
  full_name: 'Sajus Shrestha',
  name: 'Sajus Shrestha',
  phone_number: '+977-9841234567',
  emergency_phone: '+977-9841234567',
  blood_group: 'O+',
  medical_notes: 'No known drug allergies. Wear contact lenses.',
  preferred_language: 'en',
  avatar_url: null,
};

const isUuid = (id) =>
  typeof id === 'string' &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

export const profileService = {
  isConfigured: isSupabaseConfigured,

  getProfile: async (explicitUserId) => {
    let userId = explicitUserId;

    if (!userId && isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch (e) {
        console.warn('Failed to fetch auth user in getProfile:', e);
      }
    }

    if (!isSupabaseConfigured || !isUuid(userId) || userId === DEMO_USER_ID) {
      return { ...localProfileData };
    }

    try {
      // Query user_profiles table first
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Also query profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const merged = {
        ...localProfileData,
        ...profile,
        ...userProfile,
        id: userId,
        full_name: userProfile?.name || profile?.full_name || localProfileData.full_name,
        name: userProfile?.name || profile?.full_name || localProfileData.name,
        phone_number: userProfile?.emergency_phone || profile?.phone_number || localProfileData.phone_number,
        emergency_phone: userProfile?.emergency_phone || profile?.phone_number || localProfileData.emergency_phone,
        blood_group: userProfile?.blood_group || profile?.blood_group || localProfileData.blood_group,
        medical_notes: userProfile?.medical_notes || profile?.medical_notes || localProfileData.medical_notes,
      };

      localProfileData = merged;
      return merged;
    } catch (e) {
      console.warn('Profile service Supabase fallback:', e);
      return { ...localProfileData, id: userId };
    }
  },

  updateProfile: async (explicitUserId, updates) => {
    let userId = explicitUserId;

    if (!userId && isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch (e) {
        console.warn('Failed to fetch auth user in updateProfile:', e);
      }
    }

    localProfileData = { ...localProfileData, ...updates };

    if (!isSupabaseConfigured || !isUuid(userId) || userId === DEMO_USER_ID) {
      return { ...localProfileData };
    }

    try {
      const nameVal = updates.full_name || updates.name || localProfileData.full_name;
      const phoneVal = updates.emergency_phone || updates.phone_number || localProfileData.phone_number;
      const bloodVal = updates.blood_group || localProfileData.blood_group;
      const notesVal = updates.medical_notes || localProfileData.medical_notes;

      const userProfilePayload = {
        id: userId,
        name: nameVal,
        blood_group: bloodVal,
        medical_notes: notesVal,
        emergency_phone: phoneVal,
        updated_at: new Date().toISOString(),
      };

      const profilesPayload = {
        id: userId,
        full_name: nameVal,
        phone_number: phoneVal,
        blood_group: bloodVal,
        medical_notes: notesVal,
        updated_at: new Date().toISOString(),
      };

      // Upsert into user_profiles table
      await supabase.from('user_profiles').upsert(userProfilePayload);

      // Upsert into profiles table
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .upsert(profilesPayload)
        .select()
        .maybeSingle();

      const merged = {
        ...localProfileData,
        ...updatedProfile,
        ...userProfilePayload,
      };
      localProfileData = merged;
      return merged;
    } catch (e) {
      console.warn('Update profile Supabase error:', e);
      return { ...localProfileData };
    }
  },
};

export default profileService;
