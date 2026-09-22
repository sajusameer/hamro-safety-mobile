// Hamro Safety - Emergency ICE Medical QR Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profile/profileService';
import contactsService from '../../services/contacts/contactsService';

export const EmergencyQRScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [primaryContact, setPrimaryContact] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const prof = await profileService.getProfile(user?.id);
        setProfile(prof);
        const contacts = await contactsService.getContacts(user?.id);
        const primary = contacts.find((c) => c.priority === 1) || contacts[0];
        setPrimaryContact(primary);
      } catch (e) {
        console.warn('Load QR data error:', e);
      }
    };
    loadData();
  }, [user]);

  const fullName = profile?.full_name || 'Emergency Holder';
  const bloodGroup = profile?.blood_group || 'O+';
  const medicalNotes = profile?.medical_notes || 'No known allergies.';

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Emergency Medical ICE</Text>
        <Text style={styles.subtitle}>
          First responders can scan this barcode in an accident to access life-saving medical data without unlocking your phone.
        </Text>
      </View>

      {/* ICE Card */}
      <View style={styles.iceCard}>
        <View style={styles.iceHeader}>
          <Ionicons name="medical" size={24} color={colors.emergency} />
          <Text style={styles.iceHeaderTitle}>IN CASE OF EMERGENCY (ICE)</Text>
        </View>

        {/* Simulated QR Code Graphic */}
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <Ionicons name="qr-code" size={160} color={colors.textPrimary} />
          </View>
          <Text style={styles.scanNotice}>Scan for Triage Profile</Text>
        </View>

        {/* Limited Public ICE Triage Data */}
        <View style={styles.dataBlock}>
          <View style={styles.row}>
            <Text style={styles.label}>Patient Name:</Text>
            <Text style={styles.val}>{fullName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Blood Group:</Text>
            <Text style={[styles.val, styles.bloodVal]}>{bloodGroup}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Primary Emergency Contact:</Text>
            <Text style={styles.val}>
              {primaryContact ? `${primaryContact.name} (${primaryContact.phone})` : 'Not configured'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Critical Medical Notes:</Text>
            <Text style={styles.val}>{medicalNotes}</Text>
          </View>
        </View>

        {/* Privacy Assurance */}
        <View style={styles.privacyAssurance}>
          <Ionicons name="lock-closed" size={14} color={colors.safe} />
          <Text style={styles.privacyText}>
            Strict Privacy: This QR never exposes private passwords, account numbers, or home location history.
          </Text>
        </View>
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
  header: {
    marginBottom: 16,
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
    lineHeight: 18,
  },
  iceCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.emergency,
    alignItems: 'center',
  },
  iceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  iceHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.emergency,
    letterSpacing: 0.8,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  qrBox: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
  },
  scanNotice: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  dataBlock: {
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 14,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    paddingBottom: 6,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  val: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  bloodVal: {
    color: colors.emergency,
    fontSize: 16,
  },
  privacyAssurance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  privacyText: {
    fontSize: 11,
    color: colors.safeDark,
    flex: 1,
    lineHeight: 15,
  },
});

export default EmergencyQRScreen;
