// Hamro Safety - Safety Timer Card Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import Button from '../common/Button';
import { useSafetyTimer } from '../../context/SafetyTimerContext';

export const TimerCard = ({ onStartPress, onManagePress, style }) => {
  const { activeTimer, remainingSeconds, checkInSafe, needHelp, isExpired } = useSafetyTimer();

  const formatRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (activeTimer) {
    return (
      <View
        style={[
          styles.container,
          styles.activeContainer,
          isExpired && styles.expiredContainer,
          style,
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.pulseDot,
                { backgroundColor: isExpired ? colors.emergency : colors.warning },
              ]}
            />
            <Text
              style={[
                styles.statusTag,
                { color: isExpired ? colors.emergencyDark : colors.warningDark },
              ]}
            >
              {isExpired ? 'SAFETY TIMER EXPIRED' : 'ACTIVE SAFETY TIMER'}
            </Text>
          </View>
          <TouchableOpacity onPress={onManagePress}>
            <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.timerContent}>
          <Text style={styles.destinationTitle}>
            Heading to: {activeTimer.destination || 'Destination'}
          </Text>
          <Text
            style={[
              styles.countdownDisplay,
              { color: isExpired ? colors.emergency : colors.textPrimary },
            ]}
          >
            {isExpired ? '00:00' : formatRemaining(remainingSeconds)}
          </Text>
          <Text style={styles.timerSubtext}>
            {isExpired
              ? 'Safety Circle alert triggered! Check in immediately.'
              : `Auto-alerts your safety circle if not safely checked in.`}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <Button
            title="I'm Safe"
            icon="checkmark-circle-outline"
            variant="safe"
            size="sm"
            onPress={() => checkInSafe('Safe arrival')}
            style={styles.actionBtn}
          />
          <Button
            title="I Need Help"
            icon="alert-circle-outline"
            variant="emergency"
            size="sm"
            onPress={needHelp}
            style={styles.actionBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.idleRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="timer-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.idleTextCol}>
          <Text style={styles.idleTitle}>Safety Timer</Text>
          <Text style={styles.idleSubtitle}>
            Traveling alone? Set expected arrival time.
          </Text>
        </View>
        <Button
          title="Start"
          variant="outline"
          size="sm"
          onPress={onStartPress}
          style={styles.startBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginVertical: 8,
  },
  activeContainer: {
    borderColor: colors.warning,
    backgroundColor: colors.warningLight,
  },
  expiredContainer: {
    borderColor: colors.emergency,
    backgroundColor: colors.emergencyLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusTag: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerContent: {
    alignItems: 'center',
    marginVertical: 6,
  },
  destinationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  countdownDisplay: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: 4,
  },
  timerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
  },
  idleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  idleTextCol: {
    flex: 1,
  },
  idleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  idleSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  startBtn: {
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
});

export default TimerCard;
