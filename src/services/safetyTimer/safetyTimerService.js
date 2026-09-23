// Hamro Safety - Safety Timer Service
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mockPushNotificationService } from '../../data/mock/mockServices';

let activeTimerState = null;

export const safetyTimerService = {
  isConfigured: isSupabaseConfigured,

  // Create & start a safety timer
  startTimer: async (title, destination, durationMinutes, userId = 'demo-user-123') => {
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

    const timerRecord = {
      id: `timer-${Date.now()}`,
      user_id: userId,
      title: title || 'Trip Monitor',
      destination: destination || 'Home',
      duration_minutes: durationMinutes,
      started_at: startedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active',
      check_in_note: null,
    };

    activeTimerState = timerRecord;

    await mockPushNotificationService.sendAlert(
      'Safety Timer Started',
      `Monitoring trip to ${timerRecord.destination} (${durationMinutes} min). We will alert your Safety Circle if you do not check in safely.`,
      { timerId: timerRecord.id }
    );

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('safety_timers')
        .insert([timerRecord])
        .select()
        .single();
      if (!error && data) activeTimerState = data;
    }

    return activeTimerState;
  },

  // "I'm Safe" safe check-in
  checkInSafe: async (timerId, note = 'Checked in safely') => {
    if (activeTimerState && activeTimerState.id === timerId) {
      activeTimerState = {
        ...activeTimerState,
        status: 'completed_safe',
        check_in_note: note,
      };
    }

    if (isSupabaseConfigured) {
      await supabase
        .from('safety_timers')
        .update({ status: 'completed_safe', check_in_note: note })
        .eq('id', timerId);
    }

    await mockPushNotificationService.sendAlert(
      'Safe Check-in Confirmed',
      'You checked in safely. Timer dismissed.',
      { timerId }
    );

    const completed = activeTimerState;
    activeTimerState = null;
    return completed;
  },

  // "I Need Help" instant escalation
  escalateTimerToHelp: async (timerId) => {
    if (activeTimerState && activeTimerState.id === timerId) {
      activeTimerState = {
        ...activeTimerState,
        status: 'expired_escalated',
      };
    }

    if (isSupabaseConfigured) {
      await supabase
        .from('safety_timers')
        .update({ status: 'expired_escalated' })
        .eq('id', timerId);
    }

    return true;
  },

  // Extend active timer by additional minutes
  extendTimer: async (timerId, additionalMinutes = 15) => {
    if (activeTimerState && activeTimerState.id === timerId) {
      const currentExpiry = new Date(activeTimerState.expires_at).getTime();
      const newExpiry = new Date(currentExpiry + additionalMinutes * 60 * 1000);
      activeTimerState = {
        ...activeTimerState,
        expires_at: newExpiry.toISOString(),
        duration_minutes: (activeTimerState.duration_minutes || 0) + additionalMinutes,
      };
    }

    if (isSupabaseConfigured && activeTimerState) {
      await supabase
        .from('safety_timers')
        .update({
          expires_at: activeTimerState.expires_at,
          duration_minutes: activeTimerState.duration_minutes,
        })
        .eq('id', timerId);
    }

    await mockPushNotificationService.sendAlert(
      'Safety Timer Extended',
      `Timer extended by ${additionalMinutes} minutes for trip to ${activeTimerState?.destination || 'Destination'}.`,
      { timerId }
    );

    return activeTimerState;
  },

  // Cancel timer
  cancelTimer: async (timerId) => {
    if (activeTimerState && activeTimerState.id === timerId) {
      activeTimerState = null;
    }

    if (isSupabaseConfigured) {
      await supabase
        .from('safety_timers')
        .update({ status: 'cancelled' })
        .eq('id', timerId);
    }

    return true;
  },

  // Get current active timer
  getActiveTimer: async () => {
    return activeTimerState;
  },
};

export default safetyTimerService;
