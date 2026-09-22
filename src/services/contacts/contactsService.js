// Hamro Safety - Emergency Contacts Service
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { initialMockContacts } from '../../data/mock/mockContacts';

// In-memory store for demo/unconfigured sessions
let localContactsStore = [...initialMockContacts];

export const contactsService = {
  isConfigured: isSupabaseConfigured,

  // Fetch all emergency contacts for user
  getContacts: async (userId = 'demo-user-123') => {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...localContactsStore];
    }

    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*, safety_circle(*)')
      .eq('user_id', userId)
      .order('priority', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Add contact
  addContact: async (contactData, userId = 'demo-user-123') => {
    if (!isSupabaseConfigured) {
      const newContact = {
        id: `c-${Date.now()}`,
        user_id: userId,
        ...contactData,
        is_active: true,
        created_at: new Date().toISOString(),
        safety_circle: {
          allow_sos_alerts: true,
          allow_emergency_location: true,
          allow_safety_timer_alerts: true,
          allow_status_updates: true,
          status: 'active',
        },
      };
      localContactsStore.push(newContact);
      return newContact;
    }

    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert([{ ...contactData, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update contact
  updateContact: async (id, updates) => {
    if (!isSupabaseConfigured) {
      localContactsStore = localContactsStore.map((c) =>
        c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
      );
      return localContactsStore.find((c) => c.id === id);
    }

    const { data, error } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete contact
  deleteContact: async (id) => {
    if (!isSupabaseConfigured) {
      localContactsStore = localContactsStore.filter((c) => c.id !== id);
      return true;
    }

    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Update Safety Circle permissions for this contact
  updatePermissions: async (contactId, permissions) => {
    if (!isSupabaseConfigured) {
      localContactsStore = localContactsStore.map((c) => {
        if (c.id === contactId) {
          return {
            ...c,
            safety_circle: { ...c.safety_circle, ...permissions },
          };
        }
        return c;
      });
      return true;
    }

    const { error } = await supabase
      .from('safety_circle')
      .upsert({
        contact_id: contactId,
        ...permissions,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return true;
  },
};

export default contactsService;
