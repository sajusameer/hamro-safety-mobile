// Hamro Safety - Mock Emergency Contacts & Safety Circle
// Company: Zuptrix Solutions Pvt. Ltd.

export const initialMockContacts = [
  {
    id: 'c1-ram-shrestha',
    user_id: 'demo-user-123',
    name: 'Ram Shrestha',
    phone: '+977-9841234567',
    email: 'ram.shrestha@example.com',
    relationship: 'Father',
    priority: 1, // Primary
    is_active: true,
    safety_circle: {
      allow_sos_alerts: true,
      allow_emergency_location: true,
      allow_safety_timer_alerts: true,
      allow_status_updates: true,
      status: 'active',
    },
  },
  {
    id: 'c2-sita-adhikari',
    user_id: 'demo-user-123',
    name: 'Sita Adhikari',
    phone: '+977-9851098765',
    email: 'sita.adhikari@example.com',
    relationship: 'Sister',
    priority: 2, // Secondary
    is_active: true,
    safety_circle: {
      allow_sos_alerts: true,
      allow_emergency_location: true,
      allow_safety_timer_alerts: false,
      allow_status_updates: true,
      status: 'active',
    },
  },
  {
    id: 'c3-bikash-gurung',
    user_id: 'demo-user-123',
    name: 'Bikash Gurung',
    phone: '+977-9801239876',
    email: 'bikash.gurung@example.com',
    relationship: 'Close Friend',
    priority: 3,
    is_active: true,
    safety_circle: {
      allow_sos_alerts: true,
      allow_emergency_location: false,
      allow_safety_timer_alerts: false,
      allow_status_updates: false,
      status: 'active',
    },
  },
];

export default initialMockContacts;
