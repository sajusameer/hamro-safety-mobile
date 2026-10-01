// Hamro Safety - SOS Emergency Dispatch Service Compatibility Wrapper
// Company: Zuptrix Solutions Pvt. Ltd.
import sosServiceCore from '../sosService';
import { locationService } from '../location/locationService';

export const sosService = {
  isConfigured: sosServiceCore.isConfigured,

  triggerSOS: async (_userId) => {
    const loc = await locationService.getCurrentLocation();
    const event = await sosServiceCore.triggerSOS({
      latitude: loc.latitude,
      longitude: loc.longitude,
      batteryLevel: loc.batteryPercentage || null,
    });
    return {
      event,
      location: loc,
      dispatches: [],
      isDemo: false,
    };
  },

  resolveSOS: async (eventId, _resolutionNote) => {
    return await sosServiceCore.resolveSOS(eventId);
  },

  cancelSOS: async (eventId) => {
    return await sosServiceCore.resolveSOS(eventId);
  },

  getActiveEmergency: async (_userId) => {
    return await sosServiceCore.getActiveSOSEvent();
  },

  getActiveSOSEvent: async () => {
    return await sosServiceCore.getActiveSOSEvent();
  },

  recordTelemetryUpdate: async (params) => {
    return await sosServiceCore.sendLocationUpdate(params);
  },

  sendLocationUpdate: async (params) => {
    return await sosServiceCore.sendLocationUpdate(params);
  },

  subscribeToLocationUpdates: (eventId, callback) => {
    return sosServiceCore.subscribeToLocationUpdates(eventId, callback);
  },
};

export default sosService;
