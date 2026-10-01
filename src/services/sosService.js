// Hamro Safety - Dynamic SOS Emergency Service
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Trigger an active SOS emergency event
 */
export const triggerSOS = async ({
  latitude = 27.7172,
  longitude = 85.3240,
  accuracy = 4.0,
  batteryLevel = null,
} = {}) => {
  if (!isSupabaseConfigured) {
    return {
      id: `evt-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000000',
      event_type: 'sos',
      status: 'active',
      trigger_source: 'hold_button',
      initial_latitude: latitude,
      initial_longitude: longitude,
      initial_accuracy: accuracy,
      battery_level: batteryLevel,
      location_name: 'Current Device GPS',
      triggered_at: new Date().toISOString(),
    };
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated');

  // Check if an active emergency already exists
  const { data: existingActive } = await supabase
    .from('emergency_events')
    .select('*')
    .eq('user_id', user.id)
    .or('status.eq.active,status.eq.ACTIVE')
    .order('triggered_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingActive) {
    return existingActive;
  }

  // Insert new emergency event
  const { data, error } = await supabase
    .from('emergency_events')
    .insert([
      {
        user_id: user.id,
        event_type: 'sos',
        status: 'active',
        trigger_source: 'hold_button',
        initial_latitude: latitude,
        initial_longitude: longitude,
        initial_accuracy: accuracy,
        battery_level: batteryLevel,
        location_name: 'Current Device GPS',
        triggered_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating emergency event:', error);
    throw error;
  }

  // Also push initial point to location_updates
  if (latitude && longitude) {
    await supabase.from('location_updates').insert([
      {
        event_id: data.id,
        user_id: user.id,
        latitude,
        longitude,
        accuracy,
        battery_level: batteryLevel,
        recorded_at: new Date().toISOString(),
      },
    ]);
  }

  return data;
};

/**
 * Fetch the current user's active SOS event
 */
export const getActiveSOSEvent = async () => {
  if (!isSupabaseConfigured) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('emergency_events')
      .select('*')
      .eq('user_id', user.id)
      .or('status.eq.active,status.eq.ACTIVE')
      .order('triggered_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching active SOS:', err);
    return null;
  }
};

/**
 * Resolve an active SOS event
 */
export const resolveSOS = async (eventId, resolutionNote = 'User reported safe') => {
  const resolvedAt = new Date().toISOString();

  if (!isSupabaseConfigured || !eventId) {
    return {
      id: eventId || `evt-${Date.now()}`,
      status: 'resolved',
      resolved_at: resolvedAt,
      resolution_note: resolutionNote,
    };
  }

  try {
    const { data, error } = await supabase
      .from('emergency_events')
      .update({
        status: 'resolved',
        resolved_at: resolvedAt,
        resolution_note: resolutionNote,
      })
      .eq('id', eventId)
      .select()
      .maybeSingle();

    if (!error && data) {
      return data;
    }

    // Fallback: resolve active emergency for current user if eventId was client-generated or local
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      const { data: fallbackData } = await supabase
        .from('emergency_events')
        .update({
          status: 'resolved',
          resolved_at: resolvedAt,
          resolution_note: resolutionNote,
        })
        .eq('user_id', user.id)
        .or('status.eq.active,status.eq.ACTIVE')
        .select()
        .maybeSingle();

      if (fallbackData) return fallbackData;
    }
  } catch (e) {
    console.warn('resolveSOS Supabase exception:', e);
  }

  return {
    id: eventId,
    status: 'resolved',
    resolved_at: resolvedAt,
    resolution_note: resolutionNote,
  };
};

/**
 * Record a continuous GPS location breadcrumb
 */
export const sendLocationUpdate = async ({
  eventId,
  latitude,
  longitude,
  accuracy = 4.0,
  batteryLevel = null,
}) => {
  if (!isSupabaseConfigured) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !eventId) return;

  const { error } = await supabase
    .from('location_updates')
    .insert([
      {
        event_id: eventId,
        user_id: user.id,
        latitude,
        longitude,
        accuracy,
        battery_level: batteryLevel,
        recorded_at: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Error saving location update:', error);
  }
};

/**
 * Subscribe to Realtime location updates safely
 * Registers .on() BEFORE calling .subscribe()
 */
export const subscribeToLocationUpdates = (eventId, onLocationReceived) => {
  if (!eventId || !isSupabaseConfigured) return null;

  const channelName = `location-stream-${eventId}-${Date.now()}`;
  const channel = supabase.channel(channelName);

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'location_updates',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        if (payload?.new && onLocationReceived) {
          onLocationReceived(payload.new);
        }
      }
    )
    .subscribe((status) => {
      console.log(`Realtime location subscription status [${channelName}]:`, status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

export const sosService = {
  isConfigured: isSupabaseConfigured,
  triggerSOS,
  getActiveSOSEvent,
  resolveSOS,
  sendLocationUpdate,
  subscribeToLocationUpdates,
};

export default sosService;
