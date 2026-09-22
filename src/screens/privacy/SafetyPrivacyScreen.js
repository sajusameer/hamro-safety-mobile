// Hamro Safety - Safety & Privacy Settings Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import colors from '../../theme/colors';
import historyService from '../../services/history/historyService';
import { useAuth } from '../../context/AuthContext';

export const SafetyPrivacyScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [onlyShareOnEmergency, setOnlyShareOnEmergency] = useState(true);
  const [autoPurgeLogs, setAutoPurgeLogs] = useState(true);
  const [allowBatteryTelemetry, setAllowBatteryTelemetry] = useState(true);
  const [requirePinOnResolve, setRequirePinOnResolve] = useState(false);

  const handlePurgeNow = () => {
    Alert.alert(
      'Purge Emergency Data',
      'This will immediately remove stored location telemetry and past dispatch logs from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purge Now',
          style: 'destructive',
          onPress: async () => {
            await historyService.clearHistory(user?.id);
            Alert.alert('Data Purged', 'Emergency event telemetry has been purged.');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Safety & Privacy</Text>
        <Text style={styles.subtitle}>
          Hamro Safety is built with strict privacy-by-design. Your location is never broadcast publicly.
        </Text>
      </View>

      {/* 1. Location Sharing Policies */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Location Governance</Text>

        <View style={styles.settingRow}>
          <View style={styles.textCol}>
            <Text style={styles.settingName}>Emergency-Only GPS Sharing</Text>
            <Text style={styles.settingDesc}>
              Location sensors sleep until an SOS or Safety Timer is actively triggered.
            </Text>
          </View>
          <Switch
            value={onlyShareOnEmergency}
            onValueChange={setOnlyShareOnEmergency}
            trackColor={{ false: colors.surfaceBorder, true: colors.safeLight }}
            thumbColor={onlyShareOnEmergency ? colors.safe : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.textCol}>
            <Text style={styles.settingName}>Battery Level Telemetry</Text>
            <Text style={styles.settingDesc}>
              Include device battery percentage with SOS alerts so responders know if your phone might die.
            </Text>
          </View>
          <Switch
            value={allowBatteryTelemetry}
            onValueChange={setAllowBatteryTelemetry}
            trackColor={{ false: colors.surfaceBorder, true: colors.primaryLight }}
            thumbColor={allowBatteryTelemetry ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {/* 2. Emergency Resolution Security */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Emergency Resolution Security</Text>

        <View style={styles.settingRow}>
          <View style={styles.textCol}>
            <Text style={styles.settingName}>Require Duress Confirmation</Text>
            <Text style={styles.settingDesc}>
              Require affirmative note or PIN before turning off an active SOS alert.
            </Text>
          </View>
          <Switch
            value={requirePinOnResolve}
            onValueChange={setRequirePinOnResolve}
            trackColor={{ false: colors.surfaceBorder, true: colors.primaryLight }}
            thumbColor={requirePinOnResolve ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {/* 3. Data Retention & Erasure */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Data Retention & Erasure</Text>

        <View style={styles.settingRow}>
          <View style={styles.textCol}>
            <Text style={styles.settingName}>Auto-Purge GPS Breadcrumbs</Text>
            <Text style={styles.settingDesc}>
              Automatically delete precise location breadcrumbs 24 hours after resolution.
            </Text>
          </View>
          <Switch
            value={autoPurgeLogs}
            onValueChange={setAutoPurgeLogs}
            trackColor={{ false: colors.surfaceBorder, true: colors.safeLight }}
            thumbColor={autoPurgeLogs ? colors.safe : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity onPress={handlePurgeNow} style={styles.dangerRow}>
          <Ionicons name="trash-outline" size={18} color={colors.emergency} />
          <Text style={styles.dangerText}>Purge All Emergency Logs Now</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Row Level Security Notice */}
      <View style={styles.rlsInfoBox}>
        <Ionicons name="shield-checkmark" size={24} color={colors.secondary} />
        <View style={styles.rlsTextCol}>
          <Text style={styles.rlsTitle}>PostgreSQL Row Level Security (RLS)</Text>
          <Text style={styles.rlsDesc}>
            All database tables in Hamro Safety use PostgreSQL RLS policies. No contact can query your data unless you explicitly authorized them in your Safety Circle.
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
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  textCol: {
    flex: 1,
    paddingRight: 12,
  },
  settingName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  settingDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
  },
  dangerText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.emergency,
  },
  rlsInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    gap: 12,
    marginBottom: 20,
  },
  rlsTextCol: {
    flex: 1,
  },
  rlsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 2,
  },
  rlsDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

export default SafetyPrivacyScreen;
