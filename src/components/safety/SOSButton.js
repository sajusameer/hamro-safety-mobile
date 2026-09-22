// Hamro Safety - Hold-to-Activate SOS Button
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { useEmergency } from '../../context/EmergencyContext';
import { SAFETY_STATES } from '../../constants/safetyStates';

const HOLD_DURATION_MS = 3000;

export const SOSButton = ({ onActivated, style }) => {
  const { safetyState, startActivating, cancelActivating, triggerSOS } = useEmergency();
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef(null);
  const intervalRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (safetyState === SAFETY_STATES.SOS_ACTIVE) return;

    setIsHolding(true);
    setProgress(0);
    startActivating();

    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, Math.floor((elapsed / HOLD_DURATION_MS) * 100));
      setProgress(currentPct);
    }, 50);

    holdTimerRef.current = setTimeout(async () => {
      clearInterval(intervalRef.current);
      setIsHolding(false);
      setProgress(100);

      // Trigger safety haptic/vibration
      try {
        Vibration.vibrate(Platform.OS === 'android' ? [0, 250, 100, 250] : 400);
      } catch (e) {
        console.warn('Vibration failed:', e);
      }

      try {
        await triggerSOS();
        if (onActivated) onActivated();
      } catch (err) {
        console.error('Trigger SOS error in button:', err);
      }
    }, HOLD_DURATION_MS);
  };

  const handlePressOut = () => {
    if (isHolding) {
      clearTimeout(holdTimerRef.current);
      clearInterval(intervalRef.current);
      setIsHolding(false);
      setProgress(0);
      cancelActivating();

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    }
  };

  const isEmergency = safetyState === SAFETY_STATES.SOS_ACTIVE;

  return (
    <View style={[styles.outerContainer, style]}>
      <Animated.View
        style={[
          styles.buttonWrapper,
          { transform: [{ scale: scaleAnim }] },
          isEmergency && styles.emergencyPulse,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isEmergency}
          style={[
            styles.button,
            isEmergency ? styles.buttonActive : styles.buttonReady,
          ]}
          accessibilityRole="button"
          accessibilityLabel="SOS Emergency Button. Press and hold for three seconds to trigger an emergency alert."
        >
          <View style={styles.contentContainer}>
            <Ionicons
              name={isEmergency ? 'warning' : 'shield-checkmark'}
              size={54}
              color={colors.textInverse}
            />
            <Text style={styles.sosText}>
              {isEmergency ? 'SOS ACTIVE' : 'SOS'}
            </Text>
            <Text style={styles.subText}>
              {isEmergency
                ? 'EMERGENCY DISPATCHED'
                : isHolding
                ? `HOLDING... ${Math.round(progress)}%`
                : 'HOLD 3 SECONDS'}
            </Text>
          </View>

          {/* Visual Progress Arc Indicator */}
          {isHolding && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {!isEmergency && (
        <Text style={styles.instruction}>
          {isHolding
            ? 'Keep holding to activate emergency broadcast'
            : 'Press & hold firmly for 3 seconds to avoid accidental taps'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    marginVertical: 18,
  },
  buttonWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.emergency,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  emergencyPulse: {
    backgroundColor: 'rgba(220, 38, 38, 0.3)',
    borderWidth: 4,
    borderColor: colors.emergency,
  },
  button: {
    width: 172,
    height: 172,
    borderRadius: 86,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonReady: {
    backgroundColor: colors.emergency,
  },
  buttonActive: {
    backgroundColor: colors.emergencyDark,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textInverse,
    letterSpacing: 2,
    marginTop: 4,
  },
  subText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FDE047', // Vivid safety yellow
  },
  instruction: {
    marginTop: 14,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 24,
  },
});

export default SOSButton;
