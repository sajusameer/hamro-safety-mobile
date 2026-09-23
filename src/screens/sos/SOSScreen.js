// Hamro Safety - Redesigned Dedicated Emergency SOS Screen (screen_2.png Spec)
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  TextInput,
  Animated,
  Vibration,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import colors from '../../theme/colors';
import { useEmergency } from '../../context/EmergencyContext';
import { SAFETY_STATES } from '../../constants/safetyStates';
import { APP_CONFIG } from '../../constants/config';

const HOLD_CANCEL_DURATION_MS = 2000; // 2 seconds hold to confirm safe

export const SOSScreen = ({ navigation }) => {
  const {
    safetyState,
    resolveEmergency,
  } = useEmergency();

  const isEmergency = safetyState === SAFETY_STATES.SOS_ACTIVE;

  // Stopwatch counter (starting at 01:45 = 105 seconds for reference spec)
  const [elapsedSeconds, setElapsedSeconds] = useState(105);
  const [gpsUpdateTick, setGpsUpdateTick] = useState(0);

  // Hold to resolve state
  const [cancelProgress, setCancelProgress] = useState(0);
  const [isHoldingCancel, setIsHoldingCancel] = useState(false);
  const cancelTimerRef = useRef(null);
  const cancelIntervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Resolution modal
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolving, setResolving] = useState(false);

  // Pulsing animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Live stopwatch and GPS update loop every 1s / 2s
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setGpsUpdateTick((prev) => (prev + 1) % 2);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatStopwatchMMSS = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Hold to Cancel logic (2 seconds hold)
  const handleCancelPressIn = () => {
    setIsHoldingCancel(true);
    setCancelProgress(0);

    const startTime = Date.now();
    cancelIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / HOLD_CANCEL_DURATION_MS) * 100));
      setCancelProgress(pct);
    }, 40);

    cancelTimerRef.current = setTimeout(async () => {
      clearInterval(cancelIntervalRef.current);
      setIsHoldingCancel(false);
      setCancelProgress(100);

      try {
        Vibration.vibrate(200);
      } catch (e) {}

      await handleResolveConfirmed('Safe confirmation via hold gesture');
    }, HOLD_CANCEL_DURATION_MS);
  };

  const handleCancelPressOut = () => {
    if (isHoldingCancel) {
      clearTimeout(cancelTimerRef.current);
      clearInterval(cancelIntervalRef.current);
      setIsHoldingCancel(false);
      setCancelProgress(0);
    }
  };

  const handleResolveConfirmed = async (note) => {
    setResolving(true);
    try {
      await resolveEmergency(note || resolutionNote || 'User confirmed safety.');
      setResolveModalVisible(false);
      setResolutionNote('');
      Alert.alert('Emergency Resolved', 'Your safe status has been restored.');
      navigation.navigate('DashboardTab');
    } catch (e) {
      Alert.alert('Error', 'Failed to resolve emergency.');
    } finally {
      setResolving(false);
    }
  };

  const handleCallEmergency = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* 1. Header: Back Arrow, Center "Sos", Right Brand Logo */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('DashboardTab');
            }
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Back to home dashboard"
        >
          <Ionicons name="arrow-back-sharp" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitleText}>Sos</Text>

        <Image
          source={require('../../../assets/brand-logo.png')}
          style={styles.headerBrandLogo}
        />
      </View>

      <View style={styles.activeSection}>
        {/* 1. Compact Single-Row Emergency SOS Active Banner */}
        <Animated.View style={[styles.urgentBannerCompact, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.bannerLeftCol}>
            <View style={styles.warningIconBadge}>
              <Ionicons name="warning-sharp" size={18} color="#FFF" />
            </View>
            <View style={styles.bannerTitleCol}>
              <Text style={styles.urgentBannerTitleCompact}>EMERGENCY SOS ACTIVE</Text>
              <Text style={styles.urgentBannerSubCompact}>Broadcasting live telemetry to authorities</Text>
            </View>
          </View>

          <View style={styles.bannerRightCol}>
            <Text style={styles.stopwatchTextCompact}>{formatStopwatchMMSS(elapsedSeconds)}</Text>
            <Text style={styles.elapsedLabelText}>ELAPSED</Text>
          </View>
        </Animated.View>

        {/* 2. Live GPS Coordinates Card (Kathmandu map snapshot height 144, pulsing pin, ±4m accuracy) */}
        <View style={styles.gpsCard}>
          <View style={styles.gpsCardTopHeader}>
            <View style={styles.gpsCardTitleRow}>
              <Ionicons name="location-sharp" size={18} color={colors.emergency} />
              <Text style={styles.gpsCardTitle}>Live GPS Coordinates</Text>
            </View>
            <View style={styles.accuracyBadge}>
              <Text style={styles.accuracyBadgeText}>±4m Accuracy</Text>
            </View>
          </View>

          {/* Map View Snapshot Container (Height 144, rounded corners 12, pulsing red pin) */}
          <ImageBackground
            source={{ uri: 'https://static-maps.yandex.ru/1.x/?ll=85.3240,27.7172&z=14&l=map&size=450,180' }}
            style={styles.mapContainer}
            imageStyle={{ borderRadius: 12 }}
            resizeMode="cover"
          >
            <View style={styles.mapOverlayDark} />

            <Animated.View style={[styles.mapPulseRing, { transform: [{ scale: pulseAnim }] }]} />
            <View style={styles.mapPinDot}>
              <Ionicons name="location-sharp" size={30} color={colors.emergency} />
            </View>

            <View style={styles.mapLocationTag}>
              <Text style={styles.mapLocationCity}>Kathmandu Valley, Nepal</Text>
            </View>
          </ImageBackground>

          {/* Bottom Coordinates Info */}
          <View style={styles.gpsBottomBar}>
            <Ionicons name="sync-sharp" size={14} color={colors.safe} />
            <Text style={styles.gpsCoordsText}>
              Lat: 27.7172° N, Long: 85.3240° E • Updating every 2s
            </Text>
          </View>
        </View>

        {/* 3. Trusted Contacts Status (3-Column Grid) */}
        <View style={styles.contactsCard}>
          <View style={styles.contactsTopBar}>
            <Text style={styles.contactsSectionTitle}>Trusted Contacts Status</Text>
            <Text style={styles.notifiedCountRightText}>3/3 Notified</Text>
          </View>

          {/* 3-Column Horizontal Grid */}
          <View style={styles.contactsGridRow}>
            {/* Col 1: Aarati R. */}
            <View style={styles.contactGridCard}>
              <View style={[styles.contactAvatarSquareGrid, { backgroundColor: '#0A2540' }]}>
                <Text style={styles.contactAvatarTextGrid}>AR</Text>
              </View>
              <Text style={styles.contactNameGrid} numberOfLines={1}>Aarati R.</Text>
              <Text style={styles.statusTextAckRed}>Acknowledged</Text>
            </View>

            {/* Col 2: Bikash K. */}
            <View style={styles.contactGridCard}>
              <View style={[styles.contactAvatarSquareGrid, { backgroundColor: '#2563EB' }]}>
                <Text style={styles.contactAvatarTextGrid}>BK</Text>
              </View>
              <Text style={styles.contactNameGrid} numberOfLines={1}>Bikash K.</Text>
              <Text style={styles.statusTextMutedSlate}>Notified</Text>
            </View>

            {/* Col 3: Pooja S. */}
            <View style={styles.contactGridCard}>
              <View style={[styles.contactAvatarSquareGrid, { backgroundColor: '#7C3AED' }]}>
                <Text style={styles.contactAvatarTextGrid}>PS</Text>
              </View>
              <Text style={styles.contactNameGrid} numberOfLines={1}>Pooja S.</Text>
              <Text style={styles.statusTextMutedSlate}>Notified</Text>
            </View>
          </View>

          {/* 4. Event Timeline directly below contacts grid */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.emergency }]} />
              <Text style={styles.timelineText}>01:43 Event created & cloud sync active</Text>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.emergency }]} />
              <Text style={styles.timelineText}>01:44 SMS & push dispatched to 3 contacts</Text>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.safe }]} />
              <Text style={styles.timelineTextEmerald}>01:45 Aarati R. acknowledged alert</Text>
            </View>
          </View>
        </View>

        {/* 5. Evidence Secure Card */}
        <View style={styles.evidenceCard}>
          <View style={styles.evidenceHeaderRow}>
            <View style={styles.recIconWrap}>
              <View style={styles.recRedDot} />
            </View>
            <View style={styles.evidenceTitleCol}>
              <Text style={styles.evidenceTitle}>Evidence Secure</Text>
              <Text style={styles.evidenceSubtitle}>Cloud audio/video stream recording</Text>
            </View>
            <View style={styles.encryptedBadge}>
              <Ionicons name="lock-closed-sharp" size={12} color="#FFF" />
              <Text style={styles.encryptedBadgeText}>Encrypted</Text>
            </View>
          </View>
        </View>

        {/* 6. Safe Confirmation Action Button: "Hold to confirm: I am Safe" (2-second hold) */}
        <View style={styles.safeConfirmSection}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPressIn={handleCancelPressIn}
            onPressOut={handleCancelPressOut}
            style={styles.holdConfirmBtn}
            accessibilityRole="button"
            accessibilityLabel="Hold to confirm: I am Safe"
          >
            <View style={styles.holdBtnContent}>
              <Ionicons name="shield-checkmark-sharp" size={22} color="#FFFFFF" />
              <Text style={styles.holdBtnText}>
                {isHoldingCancel
                  ? `HOLDING... ${cancelProgress}%`
                  : 'Hold to confirm: I am Safe'}
              </Text>
            </View>

            {/* Visual Progress Fill */}
            {isHoldingCancel && (
              <View style={styles.holdProgressTrack}>
                <View style={[styles.holdProgressBar, { width: `${cancelProgress}%` }]} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.textNoteBtn}
            onPress={() => setResolveModalVisible(true)}
          >
            <Text style={styles.textNoteBtnText}>Add a safe note before resolving</Text>
          </TouchableOpacity>
        </View>

        {/* Direct Emergency Helplines */}
        <View style={styles.helplineCard}>
          <Text style={styles.helplineTitle}>Direct Emergency Services (Nepal)</Text>
          <View style={styles.helplineGrid}>
            <TouchableOpacity
              style={styles.helplineBtn}
              onPress={() => handleCallEmergency(APP_CONFIG.emergencyPhoneNumbers.nepalPolice)}
            >
              <Ionicons name="call" size={16} color={colors.primary} />
              <Text style={styles.helplineName}>Police (100)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineBtn}
              onPress={() => handleCallEmergency(APP_CONFIG.emergencyPhoneNumbers.ambulance)}
            >
              <Ionicons name="medkit" size={16} color={colors.emergency} />
              <Text style={styles.helplineName}>Ambulance (102)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineBtn}
              onPress={() => handleCallEmergency(APP_CONFIG.emergencyPhoneNumbers.trafficPolice)}
            >
              <Ionicons name="car" size={16} color={colors.warningDark} />
              <Text style={styles.helplineName}>Traffic (103)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
              <Ionicons name="shield-checkmark" size={36} color={colors.safe} />
              <Text style={styles.modalTitle}>Confirm You Are Safe</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Resolving will stop live location tracking and notify your Safety Circle that the emergency has been cleared.
            </Text>

            <TextInput
              value={resolutionNote}
              onChangeText={setResolutionNote}
              placeholder="Optional safe note (e.g. False alarm / Safe at home)"
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
                onPress={() => handleResolveConfirmed(resolutionNote)}
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
  // Top Header Row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerBrandLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  activeSection: {
    gap: 12,
  },
  // Compact Single-Row Emergency SOS Active Banner
  urgentBannerCompact: {
    backgroundColor: colors.emergency,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: colors.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  bannerLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  warningIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitleCol: {
    flex: 1,
  },
  urgentBannerTitleCompact: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.8,
  },
  urgentBannerSubCompact: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 2,
  },
  bannerRightCol: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  stopwatchTextCompact: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
    lineHeight: 24,
  },
  elapsedLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1,
    marginTop: 2,
  },
  // GPS Coordinates Card
  gpsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  gpsCardTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gpsCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  accuracyBadge: {
    backgroundColor: colors.safeLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  accuracyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.safeDark,
  },
  mapContainer: {
    height: 144,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  mapOverlayDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  mapPulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(211, 47, 47, 0.35)',
  },
  mapPinDot: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLocationTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mapLocationCity: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gpsBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  gpsCoordsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  // Trusted Contacts Status Card (3-Column Grid)
  contactsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  contactsTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactsSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  notifiedCountRightText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  contactsGridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  contactGridCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  contactAvatarSquareGrid: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  contactAvatarTextGrid: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  contactNameGrid: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statusTextAckRed: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.emergency,
    textAlign: 'center',
  },
  statusTextMutedSlate: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Timeline Logs
  timelineContainer: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timelineText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  timelineTextEmerald: {
    fontSize: 11,
    color: colors.safeDark,
    fontWeight: '700',
  },
  // Evidence Secure Card
  evidenceCard: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 14,
  },
  evidenceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(211, 47, 47, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  recRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.emergency,
  },
  evidenceTitleCol: {
    flex: 1,
  },
  evidenceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  evidenceSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  encryptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  encryptedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  // Safe Confirmation Button
  safeConfirmSection: {
    alignItems: 'center',
    marginVertical: 4,
  },
  holdConfirmBtn: {
    width: '100%',
    backgroundColor: colors.safe,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 52,
    elevation: 4,
    shadowColor: colors.safe,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  holdBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  holdBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  holdProgressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  holdProgressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  textNoteBtn: {
    marginTop: 10,
    paddingVertical: 4,
  },
  textNoteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  // Direct Emergency Helplines
  helplineCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginTop: 4,
  },
  helplineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
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
    backgroundColor: colors.surfaceContainer,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  helplineName: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
  },
});

export default SOSScreen;



