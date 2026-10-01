// Hamro Safety - Emergency History Service
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from '../supabase';
import { initialMockEvents } from '../../data/mock/mockEmergencyEvents';

let localHistoryEvents = [...initialMockEvents];

const isUuid = (id) =>
  typeof id === 'string' &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

export const historyService = {
  isConfigured: isSupabaseConfigured,

  // Fetch emergency history events for user
  getHistory: async (userId = '00000000-0000-0000-0000-000000000000') => {
    if (!isSupabaseConfigured || !isUuid(userId) || userId === '00000000-0000-0000-0000-000000000000') {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return [...localHistoryEvents].sort(
        (a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
      );
    }

    try {
      const { data, error } = await supabase
        .from('emergency_events')
        .select('id, event_type, status, triggered_at, resolved_at, resolution_note, location_name')
        .eq('user_id', userId)
        .order('triggered_at', { ascending: false });

      if (error || !data) return [...localHistoryEvents];
      return data;
    } catch (e) {
      console.warn('History service Supabase fallback:', e);
      return [...localHistoryEvents];
    }
  },

  // Clear or purge emergency history
  clearHistory: async (userId = '00000000-0000-0000-0000-000000000000') => {
    localHistoryEvents = localHistoryEvents.filter((e) => e.status === 'active');

    if (isSupabaseConfigured && isUuid(userId) && userId !== '00000000-0000-0000-0000-000000000000') {
      try {
        await supabase
          .from('emergency_events')
          .delete()
          .eq('user_id', userId)
          .neq('status', 'active');
      } catch (e) {
        console.warn('Clear history Supabase error:', e);
      }
    }
    return true;
  },
};

export default historyService;
