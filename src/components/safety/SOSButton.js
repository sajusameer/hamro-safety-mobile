// Hamro Safety - Hold-to-Activate SOS Button (Redesigned)
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

  const handleQuickTap = () => {
    if (safetyState === SAFETY_STATES.SOS_ACTIVE) return;
    // Direct tap feedback
    Vibration.vibrate(100);
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
          activeOpacity={0.88}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleQuickTap}
          disabled={isEmergency}
          style={[
            styles.button,
            isEmergency ? styles.buttonActive : styles.buttonReady,
          ]}
          accessibilityRole="button"
          accessibilityLabel="SOS Emergency Button. Hold for 3 seconds or tap to trigger alert."
        >
          <View style={styles.contentContainer}>
            <Text style={styles.sosTextTwoLines}>
              {'SOS\nSOS'}
            </Text>
          </View>

          {/* Visual Progress Track */}
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
            ? 'Keep holding to activate immediate emergency dispatch'
            : 'Press and hold for 3 seconds or tap to activate SOS alert'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonWrapper: {
    width: 168,
    height: 168,
    borderRadius: 30,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyPulse: {
    backgroundColor: 'rgba(211, 47, 47, 0.3)',
    borderWidth: 3,
    borderColor: colors.emergency,
  },
  button: {
    width: 168,
    height: 168,
    borderRadius: 30, // Centered rounded square
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
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
  sosTextTwoLines: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 2,
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
    backgroundColor: '#FDE047',
  },
  instruction: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 20,
  },
});

export default SOSButton;

