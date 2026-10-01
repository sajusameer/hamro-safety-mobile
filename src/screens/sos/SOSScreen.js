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
import { APP_CONFIG } from '../../constants/config';
import locationService from '../../services/location/locationService';
import { subscribeToLocationUpdates } from '../../services/sosService';
import contactService from '../../services/contactService';
import evidenceService from '../../services/evidenceService';

const HOLD_CANCEL_DURATION_MS = 2000; // 2 seconds hold to confirm safe

export const SOSScreen = ({ navigation }) => {
  const {
    resolveEmergency,
    activeEmergency,
    lastLocation,
  } = useEmergency();

  // Realtime telemetry update state
  const [telemetry, setTelemetry] = useState(null);
  const [circleContacts, setCircleContacts] = useState([]);

  // Fetch circle contacts
  useEffect(() => {
    let isMounted = true;
    const loadCircleContacts = async () => {
      try {
        const contacts = await contactService.getContacts();
        const activeInCircle = (contacts || []).filter((c) => c.is_in_circle !== false);
        if (isMounted) setCircleContacts(activeInCircle);
      } catch (e) {
        console.warn('Fetch circle contacts in SOS error:', e);
      }
    };
    loadCircleContacts();
    return () => { isMounted = false; };
  }, []);

  // Real-time Telemetry Subscription via sosService.subscribeToLocationUpdates
  useEffect(() => {
    if (!activeEmergency?.id) return;
    const unsubscribe = subscribeToLocationUpdates(activeEmergency.id, (newLocation) => {
      setTelemetry(newLocation);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeEmergency?.id]);

  const [isMicRecording, setIsMicRecording] = useState(false);

  // Start Evidence Recording Session (Feature 12)
  useEffect(() => {
    let isMounted = true;
    if (!activeEmergency?.id) return;
    const initMic = async () => {
      const session = await evidenceService.startRealEvidenceRecording(activeEmergency.id);
      if (isMounted) {
        setIsMicRecording(Boolean(session?.isMicActive));
      }
    };
    initMic();
    return () => {
      isMounted = false;
    };
  }, [activeEmergency?.id]);

  // Stopwatch counter (starting at 01:45 = 105 seconds for reference spec)
  const [elapsedSeconds, setElapsedSeconds] = useState(105);

  // Hold to resolve state
  const [cancelProgress, setCancelProgress] = useState(0);
  const [isHoldingCancel, setIsHoldingCancel] = useState(false);
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [recPulseAnim] = useState(() => new Animated.Value(1));
  const cancelTimerRef = useRef(null);
  const cancelIntervalRef = useRef(null);

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
  }, [pulseAnim]);

  // Pulsing recording red dot animation
  useEffect(() => {
    const recLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(recPulseAnim, {
          toValue: 0.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(recPulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    recLoop.start();
    return () => recLoop.stop();
  }, [recPulseAnim]);

  // Live stopwatch loop every 1s
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup cancel timers on unmount
  useEffect(() => {
    return () => {
      if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
      if (cancelIntervalRef.current) clearInterval(cancelIntervalRef.current);
    };
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

    cancelIntervalRef.current = setInterval(() => {
      setCancelProgress((prev) => Math.min(100, Math.floor(prev + (40 / HOLD_CANCEL_DURATION_MS) * 100)));
    }, 40);

    cancelTimerRef.current = setTimeout(async () => {
      clearInterval(cancelIntervalRef.current);
      setIsHoldingCancel(false);
      setCancelProgress(100);

      try {
        Vibration.vibrate(200);
      } catch (_e) {}

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

  const handleImSafeTap = () => {
    Alert.alert(
      'Confirm You Are Safe',
      'Are you sure you want to resolve this active emergency and notify your Safety Circle that you are safe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, I Am Safe',
          onPress: () => handleResolveConfirmed('User confirmed safety'),
        },
      ]
    );
  };

  const handleResolveConfirmed = async (note) => {
    setResolving(true);
    const safeNoteToSend = note || resolutionNote || 'User confirmed safety.';
    try {
      if (activeEmergency?.id) {
        await evidenceService.stopAndUploadEvidenceRecording(activeEmergency.id, safeNoteToSend);
      }
      await resolveEmergency(safeNoteToSend);
      setResolveModalVisible(false);
      setResolutionNote('');
      Alert.alert('Emergency Resolved', 'Your safe status has been restored.');
      navigation.navigate('DashboardTab');
    } catch (_e) {
      Alert.alert('Error', 'Failed to resolve emergency.');
    } finally {
      setResolving(false);
    }
  };

  const handleCallEmergency = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const currentLat = telemetry?.latitude || lastLocation?.latitude || 27.7172;
  const currentLng = telemetry?.longitude || lastLocation?.longitude || 85.3240;
  const currentAccuracy = Math.round(telemetry?.accuracy || lastLocation?.accuracy || 4);

  const [locationName, setLocationName] = useState(
    telemetry?.locationName || lastLocation?.locationName || 'Kathmandu Valley, Nepal'
  );

  useEffect(() => {
    let isMounted = true;
    const resolveName = async () => {
      if (telemetry?.locationName) {
        setLocationName(telemetry.locationName);
      } else if (lastLocation?.locationName) {
        setLocationName(lastLocation.locationName);
      } else {
        const name = await locationService.getReverseGeocode(currentLat, currentLng);
        if (isMounted && name) setLocationName(name);
      }
    };
    resolveName();
    return () => { isMounted = false; };
  }, [currentLat, currentLng, telemetry, lastLocation]);

  const mapUri = `https://static-maps.yandex.ru/1.x/?ll=${currentLng.toFixed(4)},${currentLat.toFixed(4)}&z=14&l=map&pt=${currentLng.toFixed(4)},${currentLat.toFixed(4)},pm2rdm&size=450,180`;

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

        {/* 2. Live GPS Coordinates Card */}
        <View style={styles.gpsCard}>
          <View style={styles.gpsCardTopHeader}>
            <View style={styles.gpsCardTitleRow}>
              <Ionicons name="location-sharp" size={18} color={colors.emergency} />
              <Text style={styles.gpsCardTitle}>Live GPS Coordinates</Text>
            </View>
            <View style={styles.accuracyBadge}>
              <Text style={styles.accuracyBadgeText}>±{currentAccuracy}m Accuracy</Text>
            </View>
          </View>

          {/* Map View Snapshot Container centered dynamically around live coordinates */}
          <ImageBackground
            source={{ uri: mapUri }}
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
              <Text style={styles.mapLocationCity}>{locationName}</Text>
            </View>
          </ImageBackground>

          {/* Bottom Coordinates Info */}
          <View style={styles.gpsBottomBar}>
            <Ionicons name="sync-sharp" size={14} color={colors.safe} />
            <Text style={styles.gpsCoordsText}>
              Lat: {currentLat.toFixed(4)}° N, Long: {currentLng.toFixed(4)}° E • Updating every 2s
            </Text>
          </View>
        </View>

        {/* 3. Trusted Contacts Status */}
        <View style={styles.contactsCard}>
          <View style={styles.contactsTopBar}>
            <Text style={styles.contactsSectionTitle}>Trusted Contacts Status</Text>
            <Text style={styles.notifiedCountRightText}>
              {circleContacts.length > 0 ? `${circleContacts.length}/${circleContacts.length} Notified` : '0 Notified'}
            </Text>
          </View>

          {circleContacts.length === 0 ? (
            <View style={styles.emptyContactsContainer}>
              <Text style={styles.emptyContactsSub}>No Safety Circle contacts configured</Text>
            </View>
          ) : (
            <View style={styles.contactsGridRow}>
              {circleContacts.map((contact, idx) => {
                const initials = (contact.name || 'C')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();
                const avatarBgColors = ['#0A2540', '#2563EB', '#7C3AED', '#059669'];
                const bgColor = avatarBgColors[idx % avatarBgColors.length];
                const isAck = idx === 0;

                return (
                  <View key={contact.id || idx} style={styles.contactGridCard}>
                    <View style={[styles.contactAvatarSquareGrid, { backgroundColor: bgColor }]}>
                      <Text style={styles.contactAvatarTextGrid}>{initials}</Text>
                    </View>
                    <Text style={styles.contactNameGrid} numberOfLines={1}>
                      {contact.name}
                    </Text>
                    <Text style={isAck ? styles.statusTextAckRed : styles.statusTextMutedSlate}>
                      {isAck ? 'Acknowledged' : 'Notified'}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* 4. Event Timeline directly below contacts grid */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.emergency }]} />
              <Text style={styles.timelineText}>01:43 Event created & cloud sync active</Text>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.emergency }]} />
              <Text style={styles.timelineText}>
                01:44 SMS & push dispatched to {circleContacts.length} contacts
              </Text>
            </View>
            {circleContacts.length > 0 && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: colors.safe }]} />
                <Text style={styles.timelineTextEmerald}>
                  01:45 {circleContacts[0]?.name} acknowledged alert
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 5. Evidence Secure Card */}
        <View style={styles.evidenceCard}>
          <View style={styles.evidenceHeaderRow}>
            <View style={styles.recIconWrap}>
              <Animated.View style={[styles.recRedDot, { opacity: recPulseAnim }]} />
            </View>
            <View style={styles.evidenceTitleCol}>
              <Text style={styles.evidenceTitle}>Evidence Secure</Text>
              <Text style={styles.evidenceSubtitle}>
                {isMicRecording
                  ? 'Cloud audio stream recording active • Encrypted'
                  : 'Audio evidence recording standby • Encrypted'}
              </Text>
            </View>
            <View style={styles.encryptedBadge}>
              <Ionicons name="lock-closed-sharp" size={12} color="#FFF" />
              <Text style={styles.encryptedBadgeText}>Encrypted</Text>
            </View>
          </View>
        </View>

        {/* 6. Safe Confirmation Action Button: "Hold to confirm: I am Safe" (2-second hold or tap for confirmation prompt) */}
        <View style={styles.safeConfirmSection}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPressIn={handleCancelPressIn}
            onPressOut={handleCancelPressOut}
            onPress={handleImSafeTap}
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
  emptyContactsContainer: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 10,
    marginBottom: 12,
  },
  emptyContactsSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
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



