// Hamro Safety - Safety Circle Service
// Company: Zuptrix Solutions Pvt. Ltd.
import contactService from '../contactService';
import { isSupabaseConfigured } from '../supabase';

export const safetyCircleService = {
  isConfigured: isSupabaseConfigured,

  // Get all safety circle members with their permissions
  getCircleMembers: async (userId) => {
    try {
      const contacts = await contactService.getContacts(userId);
      const circleContacts = contacts.filter((c) => c.is_in_circle !== false);

      return circleContacts.map((c) => ({
        id: c.id,
        contactId: c.id,
        name: c.name,
        role: c.relationship || 'Circle Member',
        phone: c.phone,
        email: c.email,
        statusText: c.statusText || 'Active in Safety Circle',
        avatar: c.avatar_url || c.avatar || null,
        settingText: 'Live Location Enabled',
        settingIcon: 'settings-sharp',
        battery: c.battery || 88,
        showBattery: true,
        allowSosAlerts: true,
        allowEmergencyLocation: true,
        status: 'active',
      }));
    } catch (e) {
      console.warn('Error fetching safety circle members:', e);
      return [];
    }
  },

  // Add new member to safety circle
  addMember: async (contactData, userId) => {
    const contact = await contactService.addContact({ ...contactData, is_in_circle: true }, userId);
    return contact;
  },

  // Remove member from safety circle (or turn off is_in_circle)
  removeMember: async (contactId) => {
    return await contactService.updateContact(contactId, { is_in_circle: false });
  },

  // Toggle specific permission
  togglePermission: async (contactId, permissionKey, currentValue) => {
    const nextVal = !currentValue;
    return await contactService.updateContact(contactId, { [permissionKey]: nextVal });
  },
};

export default safetyCircleService;
