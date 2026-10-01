// Hamro Safety - Safety Timer Service
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from '../supabase';
import { mockPushNotificationService } from '../../data/mock/mockServices';

let activeTimerState = null;

const isUuid = (id) =>
  typeof id === 'string' &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

export const safetyTimerService = {
  isConfigured: isSupabaseConfigured,

  // Create & start a safety timer
  startTimer: async (title, destination, durationMinutes, explicitUserId) => {
    let userId = explicitUserId;

    if (!userId && isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch (e) {
        console.warn('Failed to fetch auth user in startTimer:', e);
      }
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
    const validUserId = isUuid(userId) ? userId : '00000000-0000-0000-0000-000000000000';

    const timerPayload = {
      user_id: validUserId,
      title: title || 'Safety Trip',
      destination: destination || 'Home',
      duration_minutes: durationMinutes,
      started_at: startedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active',
    };

    activeTimerState = {
      id: `timer-${Date.now()}`,
      ...timerPayload,
      check_in_note: null,
    };

    await mockPushNotificationService.sendAlert(
      'Safety Timer Started',
      `Monitoring trip to ${activeTimerState.destination} (${durationMinutes} min). We will alert your Safety Circle if you do not check in safely.`,
      { timerId: activeTimerState.id }
    );

    if (isSupabaseConfigured && validUserId !== '00000000-0000-0000-0000-000000000000') {
      try {
        const { data, error } = await supabase
          .from('safety_timers')
          .insert([timerPayload])
          .select()
          .single();
        if (!error && data) {
          activeTimerState = data;
        } else if (error) {
          console.warn('Start timer Supabase insert error:', error);
        }
      } catch (e) {
        console.warn('Start timer Supabase insert warning:', e);
      }
    }

    return activeTimerState;
  },

  // "I'm Safe" safe check-in
  checkInSafe: async (timerId, note = 'Checked in safely') => {
    const targetId = timerId || activeTimerState?.id;

    if (activeTimerState && (activeTimerState.id === targetId || !targetId)) {
      activeTimerState = {
        ...activeTimerState,
        status: 'completed_safe',
        check_in_note: note,
      };
    }

    if (isSupabaseConfigured && targetId) {
      try {
        await supabase
          .from('safety_timers')
          .update({ status: 'completed_safe', check_in_note: note, updated_at: new Date().toISOString() })
          .eq('id', targetId);
      } catch (e) {
        console.warn('Check in safe Supabase update warning:', e);
      }
    }

    await mockPushNotificationService.sendAlert(
      'Safe Check-in Confirmed',
      'You checked in safely. Timer dismissed.',
      { timerId: targetId }
    );

    const completed = activeTimerState;
    activeTimerState = null;
    return completed;
  },

  // "I Need Help" instant escalation
  escalateTimerToHelp: async (timerId) => {
    const targetId = timerId || activeTimerState?.id;

    if (activeTimerState && (activeTimerState.id === targetId || !targetId)) {
      activeTimerState = {
        ...activeTimerState,
        status: 'expired_escalated',
      };
    }

    if (isSupabaseConfigured && targetId) {
      try {
        await supabase
          .from('safety_timers')
          .update({ status: 'expired_escalated', updated_at: new Date().toISOString() })
          .eq('id', targetId);
      } catch (e) {
        console.warn('Escalate timer Supabase error:', e);
      }
    }

    return true;
  },

  // Extend active timer by additional minutes
  extendTimer: async (timerId, additionalMinutes = 15) => {
    const targetId = timerId || activeTimerState?.id;

    if (activeTimerState) {
      const currentExpiry = new Date(activeTimerState.expires_at).getTime();
      const newExpiry = new Date(currentExpiry + additionalMinutes * 60 * 1000);
      activeTimerState = {
        ...activeTimerState,
        expires_at: newExpiry.toISOString(),
        duration_minutes: (activeTimerState.duration_minutes || 0) + additionalMinutes,
      };
    }

    if (isSupabaseConfigured && targetId && activeTimerState) {
      try {
        await supabase
          .from('safety_timers')
          .update({
            expires_at: activeTimerState.expires_at,
            duration_minutes: activeTimerState.duration_minutes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetId);
      } catch (e) {
        console.warn('Extend timer Supabase error:', e);
      }
    }

    await mockPushNotificationService.sendAlert(
      'Safety Timer Extended',
      `Timer extended by ${additionalMinutes} minutes for trip to ${activeTimerState?.destination || 'Destination'}.`,
      { timerId: targetId }
    );

    return activeTimerState;
  },

  // Cancel timer
  cancelTimer: async (timerId) => {
    const targetId = timerId || activeTimerState?.id;

    if (activeTimerState) {
      activeTimerState = null;
    }

    if (isSupabaseConfigured && targetId) {
      try {
        await supabase
          .from('safety_timers')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', targetId);
      } catch (e) {
        console.warn('Cancel timer Supabase error:', e);
      }
    }

    return true;
  },

  // Get current active timer (with Supabase sync)
  getActiveTimer: async (explicitUserId) => {
    let userId = explicitUserId;

    if (!userId && isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch (e) {
        console.warn('Failed to fetch auth user in getActiveTimer:', e);
      }
    }

    if (activeTimerState) {
      const nowMs = Date.now();
      const expMs = new Date(activeTimerState.expires_at).getTime();
      if ((activeTimerState.status === 'active' || activeTimerState.status === 'ACTIVE') && expMs > nowMs) {
        return activeTimerState;
      }
      activeTimerState = null;
    }

    if (!isSupabaseConfigured || !isUuid(userId)) return null;

    try {
      const { data, error } = await supabase
        .from('safety_timers')
        .select('*')
        .eq('user_id', userId)
        .or('status.eq.active,status.eq.ACTIVE')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        activeTimerState = data;
        return data;
      }
    } catch (e) {
      console.warn('Get active timer from Supabase failed:', e);
    }
    return null;
  },
};

export default safetyTimerService;
