// Hamro Safety - Safety Timer Card Component (Redesigned)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { useSafetyTimer } from '../../context/SafetyTimerContext';

export const TimerCard = ({ onStartPress, onManagePress, style }) => {
  const { activeTimer, remainingSeconds, extendTimer, checkInSafe, needHelp, isExpired } = useSafetyTimer();

  const formatRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSeconds = (activeTimer?.duration_minutes || 20) * 60;
  const displayRemaining = activeTimer ? remainingSeconds : 1122; // Default 18:42 for spec
  const elapsedRatio = Math.max(0, Math.min(1, 1 - displayRemaining / (totalSeconds || 1200)));
  const progressPercent = Math.round(elapsedRatio * 100);

  return (
    <View style={[styles.container, style]}>
      {/* Header Row: Clock Icon + Active Safety Timer on Left, "In Progress" Badge on Right */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeftGroup}>
          <Ionicons name="time-sharp" size={18} color={colors.primary} />
          <Text style={styles.headerTitleText}>Active Safety Timer</Text>
        </View>

        <View style={styles.inProgressBadge}>
          <Text style={styles.inProgressBadgeText}>In Progress</Text>
        </View>
      </View>

      {/* Main Title: Walking to Station */}
      <Text style={styles.destinationTitleText}>
        {activeTimer?.destination || 'Walking to Station'}
      </Text>

      {/* Subtitle & Timer Row */}
      <View style={styles.subAndTimerRow}>
        <Text style={styles.subTextLeft}>18 mins remaining • GPS active</Text>
        <Text style={styles.timerTextRight}>
          {activeTimer ? formatRemaining(displayRemaining) : '18:42'}
        </Text>
      </View>

      {/* Thin Red Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBarFill, { width: '75%' }]} />
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.darkCheckInBtn}
          onPress={() => checkInSafe('Safe arrival')}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-sharp" size={16} color="#FFF" />
          <Text style={styles.darkCheckInBtnText}>I'm Safe (Check-in)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.lightExtendBtn}
          onPress={() => (extendTimer ? extendTimer(15) : null)}
          activeOpacity={0.85}
        >
          <Text style={styles.lightExtendBtnText}>Extend +15m</Text>
        </TouchableOpacity>
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
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  inProgressBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  inProgressBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  destinationTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subAndTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  subTextLeft: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  timerTextRight: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.emergency,
    letterSpacing: 0.5,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#ECEEF0',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.emergency,
    borderRadius: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  darkCheckInBtn: {
    flex: 1,
    backgroundColor: '#0A2540',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  darkCheckInBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lightExtendBtn: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  lightExtendBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});

export default TimerCard;


