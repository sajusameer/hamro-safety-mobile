// Hamro Safety - Dedicated SOS Emergency Workflow Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import StatusBadge from '../../components/common/StatusBadge';
import SOSButton from '../../components/safety/SOSButton';
import EmergencyCard from '../../components/emergency/EmergencyCard';
import Button from '../../components/common/Button';
import colors from '../../theme/colors';
import { useEmergency } from '../../context/EmergencyContext';
import { SAFETY_STATES } from '../../constants/safetyStates';
import { APP_CONFIG } from '../../constants/config';

export const SOSScreen = ({ navigation }) => {
  const {
    safetyState,
    activeEmergency,
    lastLocation,
    dispatches,
    resolveEmergency,
  } = useEmergency();

  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolving, setResolving] = useState(false);

  const isEmergency = safetyState === SAFETY_STATES.SOS_ACTIVE;

  const handleConfirmResolve = async () => {
    setResolving(true);
    try {
      await resolveEmergency(resolutionNote || 'User confirmed safety.');
      setResolveModalVisible(false);
      setResolutionNote('');
      Alert.alert('Emergency Resolved', 'Your safe status has been restored.');
    } catch (e) {
      Alert.alert('Error', 'Failed to resolve emergency.');
    } finally {
      setResolving(false);
    }
  };

  const handleCallEmergency = (number, label) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Top Bar */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.topTitle}>Emergency Response</Text>
          <Text style={styles.topSubtitle}>Instant SOS Dispatch</Text>
        </View>
        <StatusBadge status={safetyState} size="md" />
      </View>

      {/* Main Flow: Emergency Active vs Ready/Safe */}
      {isEmergency ? (
        <View style={styles.activeSection}>
          <EmergencyCard
            event={activeEmergency}
            location={lastLocation}
            dispatches={dispatches}
            onResolve={() => setResolveModalVisible(true)}
          />

          {/* Quick Direct Emergency Helpline Dials */}
          <View style={styles.helplineCard}>
            <Text style={styles.helplineTitle}>Direct Emergency Services (Nepal)</Text>
            <View style={styles.helplineGrid}>
              <TouchableOpacity
                style={styles.helplineBtn}
                onPress={() => handleCallEmergency(APP_CONFIG.emergencyPhoneNumbers.nepalPolice, 'Nepal Police')}
              >
                <Ionicons name="call" size={18} color={colors.primary} />
                <Text style={styles.helplineName}>Police (100)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.helplineBtn}
                onPress={() => handleCallEmergency(APP_CONFIG.emergencyPhoneNumbers.ambulance, 'Ambulance')}
              >
                <Ionicons name="medkit" size={18} color={colors.emergency} />
                <Text style={styles.helplineName}>Ambulance (102)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.helplineBtn}
                onPress={() => handleCallEmergency(APP_CONFIG.emergencyPhoneNumbers.trafficPolice, 'Traffic')}
              >
                <Ionicons name="car" size={18} color={colors.warningDark} />
                <Text style={styles.helplineName}>Traffic (103)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.idleSection}>
          <View style={styles.sosCenterWrap}>
            <SOSButton />
          </View>

          {/* Explanation of deliberate activation */}
          <View style={styles.protocolCard}>
            <Text style={styles.protocolTitle}>What happens during SOS:</Text>
            <View style={styles.protocolRow}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={styles.protocolText}>
                Acquires GPS coordinates with battery status.
              </Text>
            </View>
            <View style={styles.protocolRow}>
              <Ionicons name="paper-plane" size={18} color={colors.primary} />
              <Text style={styles.protocolText}>
                Sends SMS / push alerts to authorized Safety Circle members.
              </Text>
            </View>
            <View style={styles.protocolRow}>
              <Ionicons name="eye-off" size={18} color={colors.primary} />
              <Text style={styles.protocolText}>
                Location is strictly encrypted and never shared publicly.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Resolve Confirmation Modal */}
      <Modal
        visible={resolveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResolveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={32} color={colors.safe} />
              <Text style={styles.modalTitle}>Confirm You Are Safe</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Resolving will stop live location tracking and notify your Safety Circle that the emergency has ended safely.
            </Text>

            <TextInput
              value={resolutionNote}
              onChangeText={setResolutionNote}
              placeholder="Optional safe note (e.g. False alarm / Safe now)"
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="sm"
                onPress={() => setResolveModalVisible(false)}
                style={styles.modalBtn}
              />
              <Button
                title="Yes, I Am Safe"
                variant="safe"
                size="sm"
                loading={resolving}
                onPress={handleConfirmResolve}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  topSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  activeSection: {
    marginTop: 4,
  },
  helplineCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginTop: 8,
  },
  helplineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  helplineGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  helplineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  helplineName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  idleSection: {
    alignItems: 'center',
  },
  sosCenterWrap: {
    marginVertical: 16,
  },
  protocolCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    width: '100%',
    marginTop: 12,
  },
  protocolTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  protocolRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    gap: 10,
  },
  protocolText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
  },
});

export default SOSScreen;
