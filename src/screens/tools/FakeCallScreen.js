// Hamro Safety - Fake Call Simulator Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../theme/colors';

export const FakeCallScreen = ({ navigation }) => {
  const [callerName, setCallerName] = useState('Home / Baba');
  const [callDelaySeconds, setCallDelaySeconds] = useState(5);
  const [callState, setCallState] = useState('idle'); // idle | countdown | ringing | connected
  const [countdown, setCountdown] = useState(0);
  const [callDuration, setCallDuration] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      try {
        Vibration.cancel();
      } catch (e) {
        console.warn('Vibration cancel error:', e);
      }
    };
  }, []);

  // Trigger countdown to call
  const startSimulation = () => {
    setCallState('countdown');
    setCountdown(callDelaySeconds);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerRinging();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerRinging = () => {
    setCallState('ringing');
    try {
      // Simulate phone ringing vibration pattern
      Vibration.vibrate(Platform.OS === 'android' ? [0, 800, 1000, 800] : [800, 1000], true);
    } catch (e) {
      console.warn('Vibrate error:', e);
    }
  };

  const answerCall = () => {
    try {
      Vibration.cancel();
    } catch {}
    setCallState('connected');
    setCallDuration(0);

    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      Vibration.cancel();
    } catch {}
    setCallState('idle');
    setCallDuration(0);
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // FULL SCREEN RINGING UI
  if (callState === 'ringing') {
    return (
      <View style={styles.callScreen}>
        <View style={styles.disclaimerBar}>
          <Text style={styles.disclaimerText}>
            SIMULATED CALL • NOT A REAL EMERGENCY CALL
          </Text>
        </View>

        <View style={styles.callerInfo}>
          <View style={styles.callerAvatar}>
            <Ionicons name="person" size={54} color="#FFFFFF" />
          </View>
          <Text style={styles.callerTitle}>{callerName || 'Unknown Caller'}</Text>
          <Text style={styles.incomingLabel}>Incoming Call...</Text>
        </View>

        <View style={styles.answerDeclineRow}>
          <TouchableOpacity onPress={endCall} style={[styles.callBtn, styles.declineBtn]}>
            <Ionicons name="call" size={32} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
            <Text style={styles.callBtnText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={answerCall} style={[styles.callBtn, styles.acceptBtn]}>
            <Ionicons name="call" size={32} color="#FFFFFF" />
            <Text style={styles.callBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // CONNECTED CALL UI
  if (callState === 'connected') {
    return (
      <View style={styles.callScreen}>
        <View style={styles.disclaimerBar}>
          <Text style={styles.disclaimerText}>
            SIMULATED CALL • SPEAK NORMALLY TO EXIT SITUATION
          </Text>
        </View>

        <View style={styles.callerInfo}>
          <View style={styles.callerAvatar}>
            <Ionicons name="person" size={54} color="#FFFFFF" />
          </View>
          <Text style={styles.callerTitle}>{callerName}</Text>
          <Text style={styles.durationText}>{formatSeconds(callDuration)}</Text>
        </View>

        {/* Dummy in-call controls */}
        <View style={styles.inCallControls}>
          <View style={styles.controlCircle}>
            <Ionicons name="mic-off-outline" size={24} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Mute</Text>
          </View>
          <View style={styles.controlCircle}>
            <Ionicons name="keypad-outline" size={24} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Keypad</Text>
          </View>
          <View style={styles.controlCircle}>
            <Ionicons name="volume-high-outline" size={24} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Speaker</Text>
          </View>
        </View>

        <TouchableOpacity onPress={endCall} style={[styles.callBtn, styles.declineBtn, { alignSelf: 'center' }]}>
          <Ionicons name="call" size={32} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
          <Text style={styles.callBtnText}>End</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // SETUP / IDLE VIEW
  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Fake Call Simulator</Text>
        <Text style={styles.subtitle}>
          Use this simulated incoming call to discreetly excuse yourself from an uncomfortable setting.
        </Text>

        <View style={styles.safetyNotice}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
          <Text style={styles.safetyNoticeText}>
            Safety Guarantee: This is strictly an offline visual simulation and does not impersonate police or real emergency personnel.
          </Text>
        </View>

        <Input
          label="Caller Name or Label"
          value={callerName}
          onChangeText={setCallerName}
          placeholder="e.g. Dad, Office Boss, Sister"
          icon="person-outline"
        />

        <Text style={styles.sectionLabel}>Trigger Delay</Text>
        <View style={styles.delayRow}>
          {[5, 15, 30].map((sec) => (
            <TouchableOpacity
              key={sec}
              onPress={() => setCallDelaySeconds(sec)}
              style={[
                styles.delayBtn,
                callDelaySeconds === sec && styles.delayBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.delayText,
                  callDelaySeconds === sec && styles.delayTextActive,
                ]}
              >
                {sec}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {callState === 'countdown' ? (
          <View style={styles.countdownBox}>
            <Text style={styles.countdownNum}>{countdown}</Text>
            <Text style={styles.countdownLabel}>Seconds until call rings...</Text>
            <Button
              title="Cancel Countdown"
              variant="outline"
              size="sm"
              onPress={endCall}
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <Button
            title={`Schedule Call in ${callDelaySeconds}s`}
            icon="call-outline"
            variant="primary"
            size="lg"
            onPress={startSimulation}
            style={styles.scheduleBtn}
          />
        )}
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
    marginBottom: 14,
    lineHeight: 18,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  safetyNoticeText: {
    fontSize: 12,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  delayRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  delayBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
  },
  delayBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  delayText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  delayTextActive: {
    color: colors.textInverse,
  },
  scheduleBtn: {
    marginTop: 8,
  },
  countdownBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 14,
  },
  countdownNum: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
  },
  countdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // Call Screen Styles
  callScreen: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  disclaimerBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
  },
  disclaimerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FDE047',
    letterSpacing: 0.5,
  },
  callerInfo: {
    alignItems: 'center',
  },
  callerAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  callerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  incomingLabel: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 6,
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#38BDF8',
    marginTop: 6,
  },
  answerDeclineRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  callBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    backgroundColor: '#EF4444',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  inCallControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  controlCircle: {
    alignItems: 'center',
  },
  controlLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
  },
});

export default FakeCallScreen;
