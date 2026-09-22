// Hamro Safety - Emergency Contacts List Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import ContactCard from '../../components/contacts/ContactCard';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import contactsService from '../../services/contacts/contactsService';

export const ContactListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    try {
      setError(null);
      const data = await contactsService.getContacts(user?.id);
      setContacts(data);
    } catch (err) {
      setError(err.message || 'Failed to load emergency contacts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchContacts();
    });
    fetchContacts();
    return unsubscribe;
  }, [navigation, user]);

  const navigateTo = (screenName, params) => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(screenName, params);
    } else {
      navigation.navigate(screenName, params);
    }
  };

  const handleDelete = (contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to remove ${contact.name} from your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await contactsService.deleteContact(contact.id);
              fetchContacts();
            } catch {
              Alert.alert('Error', 'Failed to delete contact.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Emergency Contacts</Text>
          <Text style={styles.subtitle}>
            {contacts.length} Trusted Guardian{contacts.length === 1 ? '' : 's'}
          </Text>
        </View>
        <Button
          title="Add Contact"
          icon="person-add"
          variant="primary"
          size="sm"
          onPress={() => navigateTo('AddContact')}
        />
      </View>

      {/* Notice Card */}
      <View style={styles.infoBanner}>
        <Ionicons name="shield" size={16} color={colors.primary} />
        <Text style={styles.infoText}>
          Primary contacts are notified first with live GPS coordinates during an emergency.
        </Text>
      </View>

      {/* Main List */}
      {loading ? (
        <LoadingState message="Loading trusted contacts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchContacts} />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No Emergency Contacts Yet"
          description="Add trusted family members or friends who should be immediately alerted when you activate SOS."
          actionTitle="Add First Contact"
          onAction={() => navigateTo('AddContact')}
        />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactCard
              contact={item}
              onEdit={() => navigateTo('EditContact', { contact: item })}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchContacts();
              }}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoText: {
    fontSize: 12,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default ContactListScreen;
