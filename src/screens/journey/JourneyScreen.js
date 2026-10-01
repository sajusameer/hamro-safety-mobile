// Hamro Safety - Live Journey Tracking Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import colors from '../../theme/colors';
import locationService from '../../services/location/locationService';
import { useAuth } from '../../context/AuthContext';

export const JourneyScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentLat, setCurrentLat] = useState(27.7172);
  const [currentLng, setCurrentLng] = useState(85.3240);
  const [currentAccuracy, setCurrentAccuracy] = useState(4.0);
  const [currentSpeed, setCurrentSpeed] = useState(0.0);
  const [batteryPct, setBatteryPct] = useState(88);
  const [locationName, setLocationName] = useState('Acquiring GPS Signal...');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTracking, setIsTracking] = useState(true);

  const [pulseAnim] = useState(() => new Animated.Value(1));
  const timerRef = useRef(null);

  // Pulse ring animation for map pin
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Elapsed timer ticker
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Live location tracking setup
  useEffect(() => {
    let isMounted = true;

    const initTracking = async () => {
      // 1. Initial location snapshot
      const snapshot = await locationService.getCurrentLocation();
      if (isMounted && snapshot) {
        setCurrentLat(snapshot.latitude);
        setCurrentLng(snapshot.longitude);
        setCurrentAccuracy(snapshot.accuracy || 4.0);
        if (typeof snapshot.speed === 'number' && snapshot.speed > 0) {
          setCurrentSpeed(Math.round(snapshot.speed * 3.6 * 10) / 10);
        }
        if (snapshot.batteryPercentage) {
          setBatteryPct(snapshot.batteryPercentage);
        }
        if (snapshot.locationName) {
          setLocationName(snapshot.locationName);
        }
      }

      // 2. Continuous watchPositionAsync
      await locationService.startEmergencyTracking((update) => {
        if (!isMounted) return;
        if (update.latitude && update.longitude) {
          setCurrentLat(update.latitude);
          setCurrentLng(update.longitude);
        }
        if (update.accuracy) {
          setCurrentAccuracy(update.accuracy);
        }
        if (typeof update.speed === 'number') {
          setCurrentSpeed(Math.max(0, Math.round(update.speed * 3.6 * 10) / 10));
        }
        if (update.batteryPercentage) {
          setBatteryPct(update.batteryPercentage);
        }
        if (update.locationName) {
          setLocationName(update.locationName);
        }
      });
    };

    initTracking();

    return () => {
      isMounted = false;
      locationService.stopEmergencyTracking();
    };
  }, []);

  // Format stopwatch MM:SS or HH:MM:SS
  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStopJourney = () => {
    Alert.alert(
      'Stop Journey Tracking?',
      'Are you sure you want to conclude your current journey tracking session?',
      [
        { text: 'Continue Tracking', style: 'cancel' },
        {
          text: 'Stop Journey',
          style: 'destructive',
          onPress: () => {
            setIsTracking(false);
            locationService.stopEmergencyTracking();
            if (timerRef.current) clearInterval(timerRef.current);
            Alert.alert('Journey Completed', 'Your safety journey has ended successfully.', [
              {
                text: 'OK',
                onPress: () => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    navigation.navigate('DashboardTab');
                  }
                },
              },
            ]);
          },
        },
      ]
    );
  };

  const mapUri = `https://static-maps.yandex.ru/1.x/?ll=${currentLng.toFixed(4)},${currentLat.toFixed(4)}&z=15&l=map&pt=${currentLng.toFixed(4)},${currentLat.toFixed(4)},pm2rdm&size=650,320`;

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* 1. Header Row */}
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

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitleText}>Live Journey Tracking</Text>
          <Text style={styles.headerSubText}>{user?.email || 'Protected Session'}</Text>
        </View>

        <Image
          source={require('../../../assets/brand-logo.png')}
          style={styles.headerBrandLogo}
        />
      </View>

      {/* 2. Active Status Banner */}
      <View style={styles.journeyBanner}>
        <View style={styles.bannerLeftCol}>
          <View style={styles.liveIndicatorDot} />
          <View>
            <Text style={styles.bannerTitle}>ACTIVE JOURNEY MODE</Text>
            <Text style={styles.bannerSub}>Streaming high-precision GPS telemetry</Text>
          </View>
        </View>

        <View style={styles.liveBadge}>
          <Ionicons name="radio" size={14} color="#FFF" />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      </View>

      {/* 3. Live Interactive Map View */}
      <View style={styles.mapCardContainer}>
        <ImageBackground
          source={{ uri: mapUri }}
          style={styles.mapBackground}
          imageStyle={{ borderRadius: 16 }}
          resizeMode="cover"
        >
          <View style={styles.mapOverlay} />

          <Animated.View
            style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}
          />
          <View style={styles.pinDot}>
            <Ionicons name="navigate-circle" size={36} color={colors.safe} />
          </View>

          <View style={styles.locationTagBox}>
            <Ionicons name="location" size={14} color={colors.safe} />
            <Text style={styles.locationTagText} numberOfLines={1}>
              {locationName}
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.coordsFooter}>
          <Ionicons name="sync-sharp" size={13} color={colors.safe} />
          <Text style={styles.coordsText}>
            Lat: {currentLat.toFixed(4)}° N, Long: {currentLng.toFixed(4)}° E • ±{currentAccuracy}m
          </Text>
        </View>
      </View>

      {/* 4. Live Telemetry Metrics (Grid) */}
      <View style={styles.metricsGrid}>
        {/* Speed Metric */}
        <View style={styles.metricCard}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="speedometer-outline" size={20} color="#2563EB" />
          </View>
          <Text style={styles.metricValue}>{currentSpeed} km/h</Text>
          <Text style={styles.metricLabel}>Current Speed</Text>
        </View>

        {/* Elapsed Time Metric */}
        <View style={styles.metricCard}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="stopwatch-outline" size={20} color="#EA580C" />
          </View>
          <Text style={styles.metricValue}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.metricLabel}>Elapsed Time</Text>
        </View>

        {/* Battery Metric */}
        <View style={styles.metricCard}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="battery-charging-outline" size={20} color="#16A34A" />
          </View>
          <Text style={styles.metricValue}>{batteryPct}%</Text>
          <Text style={styles.metricLabel}>Battery Level</Text>
        </View>

        {/* Protection Metric */}
        <View style={styles.metricCard}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#7C3AED" />
          </View>
          <Text style={styles.metricValue}>Encrypted</Text>
          <Text style={styles.metricLabel}>Telemetry Status</Text>
        </View>
      </View>

      {/* 5. Safety Info Notice */}
      <View style={styles.safetyInfoBox}>
        <Ionicons name="shield-half-sharp" size={20} color={colors.primary} />
        <Text style={styles.safetyInfoText}>
          Your guardians are notified that you are on an active journey. Emergency SOS remains accessible at all times.
        </Text>
      </View>

      {/* 6. Stop Journey Button */}
      <Button
        title="Stop Journey"
        icon="square-sharp"
        variant="primary"
        size="lg"
        onPress={handleStopJourney}
        disabled={!isTracking}
        style={styles.stopButton}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  headerBrandLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  journeyBanner: {
    backgroundColor: '#0A2540',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bannerLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.safe,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.safe,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  mapCardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mapBackground: {
    width: '100%',
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 37, 64, 0.25)',
  },
  pulseRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.safe,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    position: 'absolute',
  },
  pinDot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTagBox: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(10, 37, 64, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  coordsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: colors.surfaceSubtle,
    gap: 6,
  },
  coordsText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'flex-start',
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  safetyInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  safetyInfoText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
  stopButton: {
    backgroundColor: colors.emergency,
    borderColor: colors.emergency,
    marginTop: 4,
    marginBottom: 20,
  },
});

export default JourneyScreen;
