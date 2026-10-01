// Hamro Safety - Contacts Service Compatibility Wrapper
// Company: Zuptrix Solutions Pvt. Ltd.
import { contactService } from '../contactService';

export const contactsService = {
  isConfigured: contactService.isConfigured,
  getContacts: (userId) => contactService.getContacts(userId),
  addContact: (contactData, userId) => contactService.addContact(contactData, userId),
  updateContact: (id, updates) => contactService.updateContact(id, updates),
  deleteContact: (id) => contactService.deleteContact(id),
  updatePermissions: (contactId, permissions) => contactService.updateContact(contactId, { safety_circle_permissions: permissions }),
};

export default contactsService;
