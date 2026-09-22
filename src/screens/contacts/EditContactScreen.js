// Hamro Safety - Edit Emergency Contact Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../theme/colors';
import contactsService from '../../services/contacts/contactsService';

export const EditContactScreen = ({ route, navigation }) => {
  const { contact } = route.params || {};

  const [name, setName] = useState(contact?.name || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [relationship, setRelationship] = useState(contact?.relationship || 'Family');
  const [priority, setPriority] = useState(contact?.priority || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const relationships = ['Family', 'Parent', 'Sibling', 'Spouse', 'Friend', 'Colleague', 'Other'];

  const handleUpdate = async () => {
    if (!name.trim() || !phone.trim()) {
      setError('Please provide contact name and phone number.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await contactsService.updateContact(contact.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        relationship,
        priority,
      });

      Alert.alert('Contact Updated', `${name}'s details were updated successfully.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to update contact.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Edit Emergency Contact</Text>
        <Text style={styles.subtitle}>Modify trusted contact information and alert priority</Text>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.emergency} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Input
          label="Contact Name *"
          value={name}
          onChangeText={setName}
          icon="person-outline"
        />

        <Input
          label="Phone Number *"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          icon="call-outline"
        />

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          icon="mail-outline"
        />

        {/* Relationship Picker Chips */}
        <Text style={styles.fieldLabel}>Relationship</Text>
        <View style={styles.chipRow}>
          {relationships.map((rel) => (
            <TouchableOpacity
              key={rel}
              onPress={() => setRelationship(rel)}
              style={[styles.chip, relationship === rel && styles.chipActive]}
            >
              <Text style={[styles.chipText, relationship === rel && styles.chipTextActive]}>
                {rel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Priority Selector */}
        <Text style={styles.fieldLabel}>Alert Priority</Text>
        <View style={styles.priorityRow}>
          <TouchableOpacity
            onPress={() => setPriority(1)}
            style={[styles.priorityBtn, priority === 1 && styles.priorityBtnActive]}
          >
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={priority === 1 ? colors.emergency : colors.textMuted}
            />
            <Text style={[styles.priorityText, priority === 1 && styles.priorityTextActive]}>
              Primary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPriority(2)}
            style={[styles.priorityBtn, priority === 2 && styles.priorityBtnActive]}
          >
            <Ionicons
              name="shield-outline"
              size={18}
              color={priority === 2 ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.priorityText, priority === 2 && styles.priorityTextActive]}>
              Secondary
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Save Changes"
          onPress={handleUpdate}
          loading={loading}
          variant="primary"
          style={styles.saveBtn}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emergencyLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: colors.emergencyDark,
    fontWeight: '500',
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  priorityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 6,
  },
  priorityBtnActive: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  priorityTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: 8,
  },
});

export default EditContactScreen;
