// Hamro Safety - Application Configuration
// Zuptrix Solutions Pvt. Ltd.

export const APP_CONFIG = {
  appName: 'Hamro Safety',
  company: 'Zuptrix Solutions Pvt. Ltd.',
  tagline: 'Your Safety. Our Priority.',
  version: '1.0.0',
  supportEmail: 'support@zuptrix.com',
  emergencyPhoneNumbers: {
    nepalPolice: '100',
    trafficPolice: '103',
    ambulance: '102',
    fireBrigade: '101',
    womenHelpline: '1145',
    childHelpline: '1098',
  },
  sosHoldDurationMs: 3000, // 3-second hold to activate SOS (prevents accidental triggers)
  locationUpdateIntervalMs: 10000, // 10 seconds during active emergency
};

export default APP_CONFIG;
