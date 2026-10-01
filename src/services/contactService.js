// Hamro Safety - Emergency Contacts Service
// Company: Zuptrix Solutions Pvt. Ltd.
import { supabase, isSupabaseConfigured } from './supabase';

let localContactsStore = [];

const isUuid = (id) =>
  typeof id === 'string' &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

export const contactService = {
  isConfigured: isSupabaseConfigured,

  // Fetch all emergency contacts for authenticated user ordered by created_at
  getContacts: async (explicitUserId) => {
    let userId = explicitUserId;

    if (!userId && isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch (e) {
        console.warn('Failed to fetch auth user in getContacts:', e);
      }
    }

    if (!isSupabaseConfigured || !isUuid(userId)) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return [...localContactsStore];
    }

    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Supabase getContacts error/fallback:', error);
        return [...localContactsStore];
      }
      return data;
    } catch (e) {
      console.warn('Get contacts Supabase exception:', e);
      return [...localContactsStore];
    }
  },

  // Add a new contact
  addContact: async (contactData, explicitUserId) => {
    let userId = explicitUserId || contactData?.user_id;

    if (!userId && isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch (e) {
        console.warn('Failed to fetch auth user in addContact:', e);
      }
    }

    const validUserId = isUuid(userId) ? userId : '00000000-0000-0000-0000-000000000000';

    const payload = {
      name: contactData.name?.trim(),
      phone: contactData.phone?.trim(),
      relationship: contactData.relationship || 'Family',
      priority: contactData.priority || 1,
      is_in_circle: contactData.is_in_circle !== undefined ? Boolean(contactData.is_in_circle) : true,
      user_id: validUserId,
    };

    if (contactData.email && contactData.email.trim()) {
      payload.email = contactData.email.trim();
    }

    if (!isSupabaseConfigured || validUserId === '00000000-0000-0000-0000-000000000000') {
      const newContact = {
        id: `c-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localContactsStore.unshift(newContact);
      return newContact;
    }

    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        return data;
      }

      if (error && error.code === 'PGRST204') {
        // Fallback retry without optional email/is_in_circle fields if schema lacks them
        const corePayload = {
          name: payload.name,
          phone: payload.phone,
          relationship: payload.relationship,
          priority: payload.priority,
          user_id: payload.user_id,
        };
        const { data: retryData, error: retryError } = await supabase
          .from('emergency_contacts')
          .insert([corePayload])
          .select()
          .single();

        if (!retryError && retryData) {
          return retryData;
        }
      }

      console.warn('Supabase addContact fallback:', error);
      const fallbackContact = {
        id: `c-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localContactsStore.unshift(fallbackContact);
      return fallbackContact;
    } catch (e) {
      console.warn('Add contact Supabase exception:', e);
      const fallbackContact = {
        id: `c-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localContactsStore.unshift(fallbackContact);
      return fallbackContact;
    }
  },

  // Update existing contact
  updateContact: async (contactId, updates) => {
    const updatedAt = new Date().toISOString();
    localContactsStore = localContactsStore.map((c) =>
      c.id === contactId ? { ...c, ...updates, updated_at: updatedAt } : c
    );

    if (isSupabaseConfigured && isUuid(contactId)) {
      try {
        const { data, error } = await supabase
          .from('emergency_contacts')
          .update({ ...updates, updated_at: updatedAt })
          .eq('id', contactId)
          .select()
          .single();

        if (!error && data) return data;
      } catch (e) {
        console.warn('Update contact Supabase error:', e);
      }
    }
    return localContactsStore.find((c) => c.id === contactId);
  },

  // Delete contact by ID
  deleteContact: async (contactId) => {
    localContactsStore = localContactsStore.filter((c) => c.id !== contactId);

    if (isSupabaseConfigured && isUuid(contactId)) {
      try {
        const { error } = await supabase
          .from('emergency_contacts')
          .delete()
          .eq('id', contactId);

        if (error) {
          console.warn('Delete contact Supabase error:', error);
        }
      } catch (e) {
        console.warn('Delete contact Supabase exception:', e);
      }
    }
    return true;
  },
};

export default contactService;
