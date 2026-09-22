// Hamro Safety - Mock Services Adapter
// Company: Zuptrix Solutions Pvt. Ltd.
// NOTE: These mock adapters simulate external providers (SMS gateways, Push notifications,
// Google Maps Reverse Geocoding, and Emergency Services) during development or when
// third-party API credentials are not yet configured.

export const mockMapsService = {
  isMock: true,
  reverseGeocode: async (latitude, longitude) => {
    // Simulated reverse geocoding
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      formattedAddress: `Lat ${latitude.toFixed(4)}, Long ${longitude.toFixed(4)} (Kathmandu, Nepal)`,
      city: 'Kathmandu',
      country: 'Nepal',
      isMock: true,
    };
  },
  getStaticMapUrl: (latitude, longitude) => {
    return `https://dummyimage.com/600x300/1e293b/ffffff&text=Mock+Map+Coordinates:+${latitude.toFixed(4)},+${longitude.toFixed(4)}`;
  },
};

export const mockSmsService = {
  isMock: true,
  sendEmergencySms: async (recipientPhone, recipientName, message, coordinates) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.info(`[DEMO MOCK SMS] Sent to ${recipientName} (${recipientPhone}):`, message, coordinates);
    return {
      success: true,
      isMock: true,
      messageId: `mock-sms-${Date.now()}`,
      statusText: 'DEMO SMS Simulated',
      timestamp: new Date().toISOString(),
    };
  },
};

export const mockPushNotificationService = {
  isMock: true,
  sendAlert: async (title, body, data = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    console.info(`[DEMO MOCK PUSH] ${title}: ${body}`, data);
    return {
      success: true,
      isMock: true,
      notificationId: `mock-push-${Date.now()}`,
      statusText: 'DEMO Push Alert Queued',
      timestamp: new Date().toISOString(),
    };
  },
};

export const mockEmergencyExternalService = {
  isMock: true,
  // Note: Never claim real police/ambulance contact unless genuine provider exists
  dispatchStatus: async (eventId) => {
    return {
      isMock: true,
      eventId,
      status: 'DEMO_STANDBY',
      disclaimer: 'Third-party government/police dispatch integration is in sandbox/mock mode. In a real life emergency, dial 100 directly.',
    };
  },
};

export default {
  mockMapsService,
  mockSmsService,
  mockPushNotificationService,
  mockEmergencyExternalService,
};
