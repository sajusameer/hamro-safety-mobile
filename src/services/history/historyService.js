// Hamro Safety - Emergency History Service
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { initialMockEvents } from '../../data/mock/mockEmergencyEvents';

let localHistoryEvents = [...initialMockEvents];

export const historyService = {
  isConfigured: isSupabaseConfigured,

  // Fetch emergency history events for user
  getHistory: async (userId = 'demo-user-123') => {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...localHistoryEvents].sort(
        (a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
      );
    }

    const { data, error } = await supabase
      .from('emergency_events')
      .select('id, event_type, status, triggered_at, resolved_at, resolution_note, location_name')
      .eq('user_id', userId)
      .order('triggered_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Clear or purge emergency history (privacy control)
  clearHistory: async (userId = 'demo-user-123') => {
    if (!isSupabaseConfigured) {
      localHistoryEvents = [];
      return true;
    }

    const { error } = await supabase
      .from('emergency_events')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },
};

export default historyService;
