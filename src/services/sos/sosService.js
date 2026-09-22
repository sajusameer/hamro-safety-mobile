// Hamro Safety - SOS Emergency Dispatch Service
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import locationService from '../location/locationService';
import contactsService from '../contacts/contactsService';
import { mockSmsService, mockPushNotificationService } from '../../data/mock/mockServices';
import { initialMockEvents } from '../../data/mock/mockEmergencyEvents';

let localEventsStore = [...initialMockEvents];

export const sosService = {
  isConfigured: isSupabaseConfigured,

  // 1. Trigger SOS Emergency Event
  triggerSOS: async (userId = 'demo-user-123') => {
    // Obtain snapshot of location
    const location = await locationService.getCurrentLocation();
    
    // Load contacts authorized for SOS
    const contacts = await contactsService.getContacts(userId);
    const authorizedContacts = contacts.filter(
      (c) => c.safety_circle?.allow_sos_alerts !== false
    );

    const eventId = `evt-${Date.now()}`;
    const newEvent = {
      id: eventId,
      user_id: userId,
      event_type: 'sos',
      status: 'active', // SOS ACTIVE
      triggered_at: new Date().toISOString(),
      trigger_source: 'hold_button',
      initial_latitude: location.latitude,
      initial_longitude: location.longitude,
      initial_accuracy: location.accuracy,
      battery_level: location.batteryPercentage || 90,
      location_name: location.isMockLocation ? 'Kathmandu, Nepal (Simulated)' : 'Current Device GPS',
      resolved_at: null,
      resolution_note: null,
    };

    // Prepare notification tracking list
    const notificationDispatches = [];

    // Dispatch notifications to trusted contacts
    for (const contact of authorizedContacts) {
      const smsResult = await mockSmsService.sendEmergencySms(
        contact.phone,
        contact.name,
        `EMERGENCY ALERT: Need urgent assistance. Last known location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        { lat: location.latitude, lng: location.longitude }
      );

      notificationDispatches.push({
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        deliveryStatus: smsResult.isMock ? 'mock_delivered' : 'delivered',
        isMock: smsResult.isMock,
        deliveredAt: smsResult.timestamp,
        statusLabel: smsResult.isMock ? 'Simulated Alert Sent [DEMO]' : 'Delivered via SMS',
      });
    }

    if (!isSupabaseConfigured) {
      localEventsStore.unshift(newEvent);
      return {
        event: newEvent,
        location,
        dispatches: notificationDispatches,
        isDemo: true,
      };
    }

    // Persist to Supabase
    const { data: eventData, error: eventErr } = await supabase
      .from('emergency_events')
      .insert([newEvent])
      .select()
      .single();

    if (eventErr) {
      console.warn('Supabase insert event failed, fallback to local:', eventErr);
      localEventsStore.unshift(newEvent);
      return { event: newEvent, location, dispatches: notificationDispatches, isDemo: true };
    }

    // Insert notifications log
    for (const disp of notificationDispatches) {
      await supabase.from('notifications').insert([{
        user_id: userId,
        event_id: eventData.id,
        recipient_name: disp.contactName,
        recipient_contact: disp.contactPhone,
        channel: 'sms',
        message: 'Emergency SOS Alert',
        delivery_status: disp.deliveryStatus,
        is_mock: disp.isMock,
        delivered_at: disp.deliveredAt,
      }]);
    }

    return {
      event: eventData,
      location,
      dispatches: notificationDispatches,
      isDemo: false,
    };
  },

  // 2. Resolve Active Emergency
  resolveSOS: async (eventId, resolutionNote = 'User resolved safely') => {
    const resolvedAt = new Date().toISOString();

    if (!isSupabaseConfigured) {
      localEventsStore = localEventsStore.map((evt) =>
        evt.id === eventId
          ? { ...evt, status: 'resolved', resolved_at: resolvedAt, resolution_note: resolutionNote }
          : evt
      );
      locationService.stopEmergencyTracking();
      return true;
    }

    const { error } = await supabase
      .from('emergency_events')
      .update({
        status: 'resolved',
        resolved_at: resolvedAt,
        resolution_note: resolutionNote,
      })
      .eq('id', eventId);

    locationService.stopEmergencyTracking();
    if (error) throw error;
    return true;
  },

  // 3. Cancel Emergency (if aborted during activating)
  cancelSOS: async (eventId) => {
    if (!isSupabaseConfigured) {
      localEventsStore = localEventsStore.map((evt) =>
        evt.id === eventId ? { ...evt, status: 'cancelled', resolved_at: new Date().toISOString() } : evt
      );
      locationService.stopEmergencyTracking();
      return true;
    }

    await supabase
      .from('emergency_events')
      .update({
        status: 'cancelled',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    locationService.stopEmergencyTracking();
    return true;
  },

  // Get active emergency if any
  getActiveEmergency: async (userId = 'demo-user-123') => {
    if (!isSupabaseConfigured) {
      return localEventsStore.find((e) => e.status === 'active' || e.status === 'activating') || null;
    }

    const { data, error } = await supabase
      .from('emergency_events')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return null;
    return data;
  },
};

export default sosService;
