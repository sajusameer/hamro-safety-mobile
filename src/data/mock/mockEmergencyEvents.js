// Hamro Safety - Mock Emergency History Events
// Company: Zuptrix Solutions Pvt. Ltd.

export const initialMockEvents = [
  {
    id: 'evt-001',
    user_id: 'demo-user-123',
    event_type: 'sos',
    status: 'resolved',
    triggered_at: new Date(Date.now() - 24 * 3600 * 1000 * 2).toISOString(),
    resolved_at: new Date(Date.now() - 24 * 3600 * 1000 * 2 + 15 * 60 * 1000).toISOString(),
    trigger_source: 'hold_button',
    resolution_note: 'Accidental trigger during device setup. Confirmed safe.',
    initial_latitude: 27.7172,
    initial_longitude: 85.3240,
    initial_accuracy: 12.5,
    battery_level: 82,
    location_name: 'Kathmandu, Bagmati',
  },
  {
    id: 'evt-002',
    user_id: 'demo-user-123',
    event_type: 'safety_timer',
    status: 'completed_safe',
    triggered_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 24 * 3600 * 1000 + 20 * 60 * 1000).toISOString(),
    trigger_source: 'timer_checkin',
    resolution_note: 'Checked in safely at destination (Patan Durbar Square).',
    initial_latitude: 27.6744,
    initial_longitude: 85.3253,
    initial_accuracy: 8.0,
    battery_level: 65,
    location_name: 'Lalitpur, Bagmati',
  },
  {
    id: 'evt-003',
    user_id: 'demo-user-123',
    event_type: 'sos',
    status: 'cancelled',
    triggered_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 5 * 3600 * 1000 + 30 * 1000).toISOString(),
    trigger_source: 'hold_button',
    resolution_note: 'User released hold countdown before dispatch.',
    initial_latitude: 27.7125,
    initial_longitude: 85.3130,
    initial_accuracy: 15.0,
    battery_level: 45,
    location_name: 'Thamel, Kathmandu',
  },
];

export default initialMockEvents;
