// Hamro Safety - Safety Circle Service
// Company: Zuptrix Solutions Pvt. Ltd.
import contactsService from '../contacts/contactsService';

export const safetyCircleService = {
  // Get all safety circle members with their permissions
  getCircleMembers: async (userId = 'demo-user-123') => {
    const contacts = await contactsService.getContacts(userId);
    return contacts.map((c) => ({
      contactId: c.id,
      name: c.name,
      phone: c.phone,
      relationship: c.relationship,
      priority: c.priority,
      allowSosAlerts: c.safety_circle?.allow_sos_alerts ?? c.safety_circle?.allowSosAlerts ?? true,
      allowEmergencyLocation: c.safety_circle?.allow_emergency_location ?? c.safety_circle?.allowEmergencyLocation ?? true,
      allowSafetyTimerAlerts: c.safety_circle?.allow_safety_timer_alerts ?? c.safety_circle?.allowSafetyTimerAlerts ?? false,
      allowStatusUpdates: c.safety_circle?.allow_status_updates ?? c.safety_circle?.allowStatusUpdates ?? true,
      status: c.safety_circle?.status ?? 'active',
    }));
  },

  // Toggle specific permission with bidirectional key persistence
  togglePermission: async (contactId, permissionKey, currentValue) => {
    const nextVal = !currentValue;
    const map = {
      allow_sos_alerts: 'allowSosAlerts',
      allowSosAlerts: 'allow_sos_alerts',
      allow_emergency_location: 'allowEmergencyLocation',
      allowEmergencyLocation: 'allow_emergency_location',
      allow_safety_timer_alerts: 'allowSafetyTimerAlerts',
      allowSafetyTimerAlerts: 'allow_safety_timer_alerts',
      allow_status_updates: 'allowStatusUpdates',
      allowStatusUpdates: 'allow_status_updates',
    };
    const otherKey = map[permissionKey];
    const permissions = {
      [permissionKey]: nextVal,
      ...(otherKey ? { [otherKey]: nextVal } : {}),
    };
    return await contactsService.updatePermissions(contactId, permissions);
  },
};

export default safetyCircleService;
