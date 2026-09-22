// Hamro Safety - Safety Timer Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../theme/colors';
import { useSafetyTimer } from '../../context/SafetyTimerContext';

export const SafetyTimerScreen = ({ navigation }) => {
  const {
    activeTimer,
    remainingSeconds,
    isExpired,
    startTimer,
    checkInSafe,
    needHelp,
    cancelTimer,
  } = useSafetyTimer();

  const [destination, setDestination] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(15); // minutes
  const [loading, setLoading] = useState(false);

  const durationPresets = [
    { label: '5 min', value: 5, desc: 'Short walk' },
    { label: '15 min', value: 15, desc: 'Quick commute' },
    { label: '30 min', value: 30, desc: 'Cab / Taxi ride' },
    { label: '60 min', value: 60, desc: 'Night journey' },
  ];

  const formatRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await startTimer('Safety Trip', destination.trim() || 'Home', selectedDuration);
    } catch {
      Alert.alert('Error', 'Failed to start safety timer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSafeCheckIn = async () => {
    await checkInSafe('Safe arrival confirmed');
    Alert.alert('Safe Arrival', 'Timer dismissed and Safety Circle updated.');
  };

  const handleHelp = () => {
    Alert.alert(
      'Trigger Emergency SOS?',
      'This will immediately alert your Safety Circle and acquire your current GPS coordinates.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Trigger SOS',
          style: 'destructive',
          onPress: async () => {
            await needHelp();
            navigation.navigate('SOS');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {activeTimer ? (
        // ACTIVE TIMER / EXPIRED VIEW
        <View style={styles.activeWrapper}>
          <View
            style={[
              styles.timerBanner,
              isExpired ? styles.timerBannerExpired : styles.timerBannerActive,
            ]}
          >
            <View style={styles.badgeRow}>
              <Ionicons
                name={isExpired ? 'alert-circle' : 'timer'}
                size={22}
                color={isExpired ? colors.emergency : colors.warningDark}
              />
              <Text
                style={[
                  styles.badgeTitle,
                  { color: isExpired ? colors.emergencyDark : colors.warningDark },
                ]}
              >
                {isExpired ? 'TIMER EXPIRED - ESCALATION ACTIVE' : 'ACTIVE SAFETY TIMER'}
              </Text>
            </View>

            <Text style={styles.destText}>
              Destination: {activeTimer.destination || 'Unspecified'}
            </Text>

            <Text
              style={[
                styles.largeCountdown,
                { color: isExpired ? colors.emergency : colors.textPrimary },
              ]}
            >
              {isExpired ? '00:00' : formatRemaining(remainingSeconds)}
            </Text>

            <Text style={styles.countdownExpl}>
              {isExpired
                ? 'You have not checked in within the expected duration. Safety circle alert broadcasted.'
                : 'If you do not check in before the timer expires, an automated alert will notify your trusted circle.'}
            </Text>

            {/* Actions */}
            <View style={styles.actionButtonGroup}>
              <Button
                title="I Am Safe (Check In)"
                icon="checkmark-circle"
                variant="safe"
                size="lg"
                onPress={handleSafeCheckIn}
                style={styles.safeBtn}
              />

              <Button
                title="I Need Help Now (SOS)"
                icon="warning"
                variant="emergency"
                size="lg"
                onPress={handleHelp}
                style={styles.helpBtn}
              />

              <TouchableOpacity onPress={cancelTimer} style={styles.cancelLink}>
                <Text style={styles.cancelLinkText}>Cancel Timer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        // CREATE TIMER VIEW
        <View style={styles.createWrapper}>
          <View style={styles.header}>
            <Text style={styles.title}>Safety Arrival Timer</Text>
            <Text style={styles.subtitle}>
              Traveling alone or taking a late-night ride? Set an expected arrival time. If you don't check in safely, your Safety Circle is automatically notified.
            </Text>
          </View>

          <View style={styles.card}>
            <Input
              label="Where are you heading?"
              value={destination}
              onChangeText={setDestination}
              placeholder="e.g. Home, Patan, Hostel, Airport"
              icon="navigate-outline"
            />

            <Text style={styles.sectionLabel}>Expected Travel Duration</Text>
            <View style={styles.presetGrid}>
              {durationPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.value}
                  onPress={() => setSelectedDuration(preset.value)}
                  style={[
                    styles.presetTile,
                    selectedDuration === preset.value && styles.presetTileActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetLabel,
                      selectedDuration === preset.value && styles.presetLabelActive,
                    ]}
                  >
                    {preset.label}
                  </Text>
                  <Text style={styles.presetDesc}>{preset.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.noticeBox}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={styles.noticeText}>
                [DEMO NOTIFICATION] A simulated push reminder will alert your device 2 minutes before expiry.
              </Text>
            </View>

            <Button
              title={`Start ${selectedDuration}-Minute Safety Timer`}
              icon="timer-outline"
              onPress={handleStart}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.startActionBtn}
            />
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  presetTile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  presetTileActive: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  presetLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  presetLabelActive: {
    color: colors.primary,
  },
  presetDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 12,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 16,
  },
  startActionBtn: {
    marginTop: 4,
  },
  activeWrapper: {
    paddingTop: 8,
  },
  timerBanner: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  timerBannerActive: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  timerBannerExpired: {
    backgroundColor: colors.emergencyLight,
    borderColor: colors.emergency,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  destText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  largeCountdown: {
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 3,
    marginVertical: 8,
  },
  countdownExpl: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  actionButtonGroup: {
    width: '100%',
    gap: 12,
  },
  safeBtn: {
    width: '100%',
  },
  helpBtn: {
    width: '100%',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default SafetyTimerScreen;
