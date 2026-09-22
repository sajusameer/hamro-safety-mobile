// Hamro Safety - Active Emergency Status Card
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import { SAFETY_STATES } from '../../constants/safetyStates';

export const EmergencyCard = ({
  event,
  location,
  dispatches = [],
  onResolve,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Emergency Header */}
      <View style={styles.header}>
        <StatusBadge status={SAFETY_STATES.SOS_ACTIVE} size="lg" />
        <Text style={styles.timeTag}>
          {event?.triggered_at
            ? new Date(event.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now'}
        </Text>
      </View>

      {/* Emergency Description */}
      <Text style={styles.alertNotice}>
        Emergency broadcast active. Your safety circle is receiving coordinates.
      </Text>

      {/* Real-time Location Indicator */}
      <View style={styles.locationBox}>
        <Ionicons name="location" size={20} color={colors.emergency} />
        <View style={styles.locTextCol}>
          <Text style={styles.locCoord}>
            {location
              ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
              : 'Acquiring GPS fix...'}
          </Text>
          <Text style={styles.locMeta}>
            Accuracy: ±{location?.accuracy ? Math.round(location.accuracy) : 15}m • Battery: {location?.batteryPercentage || 90}%
          </Text>
        </View>
      </View>

      {/* Dispatches & Evidence Verification */}
      <View style={styles.dispatchSection}>
        <Text style={styles.dispatchHeader}>Delivery Verification Evidence:</Text>
        {dispatches.length > 0 ? (
          dispatches.map((item, idx) => (
            <View key={idx} style={styles.dispatchRow}>
              <Ionicons
                name={item.isMock ? 'information-circle' : 'checkmark-circle'}
                size={16}
                color={item.isMock ? colors.warning : colors.safe}
              />
              <Text style={styles.contactName}>{item.contactName}:</Text>
              <Text style={[styles.dispatchStatus, item.isMock && styles.mockStatus]}>
                {item.statusLabel || item.deliveryStatus}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDispatches}>
            Broadcasting to primary safety circle contacts...
          </Text>
        )}
      </View>

      {/* Resolution Action */}
      <Button
        title="I Am Safe Now (Resolve SOS)"
        icon="shield-checkmark"
        variant="safe"
        size="md"
        onPress={onResolve}
        style={styles.resolveBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.emergencyLight,
    borderWidth: 2,
    borderColor: colors.emergency,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeTag: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.emergencyDark,
  },
  alertNotice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.emergencyDark,
    marginBottom: 12,
    lineHeight: 20,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  locTextCol: {
    marginLeft: 10,
    flex: 1,
  },
  locCoord: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  locMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dispatchSection: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  dispatchHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dispatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 6,
    marginRight: 6,
  },
  dispatchStatus: {
    fontSize: 12,
    color: colors.safeDark,
    fontWeight: '600',
  },
  mockStatus: {
    color: colors.warningDark,
  },
  noDispatches: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  resolveBtn: {
    marginTop: 4,
  },
});

export default EmergencyCard;
