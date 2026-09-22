// Hamro Safety - Edit Profile Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../theme/colors';
import profileService from '../../services/profile/profileService';
import { useAuth } from '../../context/AuthContext';

export const EditProfileScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { profile } = route.params || {};

  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || user?.user_metadata?.phone_number || '');
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group || 'O+');
  const [medicalNotes, setMedicalNotes] = useState(profile?.medical_notes || '');
  const [loading, setLoading] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSave = async () => {
    setLoading(true);
    try {
      await profileService.updateProfile(user?.id, {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        blood_group: bloodGroup,
        medical_notes: medicalNotes.trim(),
      });
      Alert.alert('Profile Saved', 'Your emergency profile was updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save profile changes.');
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
        <Text style={styles.title}>Edit Safety Profile</Text>
        <Text style={styles.subtitle}>
          Information provided here helps first responders and guardians during an emergency.
        </Text>

        <Input
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          icon="person-outline"
        />

        <Input
          label="Primary Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          icon="call-outline"
        />

        <Text style={styles.sectionLabel}>Blood Group</Text>
        <View style={styles.chipRow}>
          {bloodGroups.map((bg) => (
            <TouchableOpacity
              key={bg}
              onPress={() => setBloodGroup(bg)}
              style={[styles.chip, bloodGroup === bg && styles.chipActive]}
            >
              <Text style={[styles.chipText, bloodGroup === bg && styles.chipTextActive]}>
                {bg}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Medical & Allergy Notes (ICE)"
          value={medicalNotes}
          onChangeText={setMedicalNotes}
          placeholder="Any asthma, diabetes, heart condition, or medicine allergies..."
          multiline
          numberOfLines={3}
          icon="medical-outline"
        />

        <Button
          title="Save Changes"
          onPress={handleSave}
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
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: {
    backgroundColor: colors.emergency,
    borderColor: colors.emergency,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  saveBtn: {
    marginTop: 12,
  },
});

export default EditProfileScreen;
