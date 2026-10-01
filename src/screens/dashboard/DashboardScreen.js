// Hamro Safety - Redesigned Dashboard / Home Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import SOSButton from '../../components/safety/SOSButton';
import TimerCard from '../../components/safety/TimerCard';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useEmergency } from '../../context/EmergencyContext';
import { SAFETY_STATES } from '../../constants/safetyStates';
import safetyCircleService from '../../services/safetyCircle/safetyCircleService';
import contactService from '../../services/contactService';
import historyService from '../../services/history/historyService';

export const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { safetyState, activeEmergency, refreshLocation } = useEmergency();
  const [refreshing, setRefreshing] = useState(false);
  const [circleMembers, setCircleMembers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const isEmergency = safetyState === SAFETY_STATES.SOS_ACTIVE || Boolean(activeEmergency);

  const loadDashboardData = useCallback(async () => {
    try {
      await refreshLocation();
      let members = await safetyCircleService.getCircleMembers(user?.id);
      if (!members || members.length === 0) {
        const contacts = await contactService.getContacts(user?.id);
        members = (contacts || []).filter((c) => c.is_in_circle !== false);
      }
      setCircleMembers(members || []);
      const historyData = await historyService.getHistory(user?.id);
      setRecentActivities(historyData || []);
    } catch (e) {
      console.warn('Dashboard data fetch warning:', e);
    }
  }, [refreshLocation, user]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await loadDashboardData();
    };
    load();
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigation, loadDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const navigateTo = (screenName, params) => {
    if (['DashboardTab', 'ToolsTab', 'SOSTab', 'CircleTab', 'HistoryTab', 'ProfileTab'].includes(screenName)) {
      navigation.navigate(screenName, params);
      return;
    }
    if (screenName === 'SafetyCircle' || screenName === 'Circle') {
      navigation.navigate('CircleTab', params);
      return;
    }
    if (screenName === 'SafetyTools' || screenName === 'Tools') {
      navigation.navigate('ToolsTab', params);
      return;
    }
    if (screenName === 'EmergencyHistory' || screenName === 'History') {
      navigation.navigate('HistoryTab', params);
      return;
    }

    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(screenName, params);
    } else {
      navigation.navigate(screenName, params);
    }
  };

  const formatActivityTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* 1. Header Area: Left "Hamro Safety", Right Bell Icon + Brand Logo */}
      <View style={styles.topHeaderRow}>
        <Text style={styles.appTitleHeader}>Hamro Safety</Text>

        <View style={styles.headerRightIcons}>
          <TouchableOpacity
            style={styles.bellIconBtn}
            onPress={() => navigateTo('HistoryTab')}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            <View style={styles.bellUnreadDot} />
          </TouchableOpacity>

          <Image
            source={require('../../../assets/brand-logo.png')}
            style={styles.headerBrandLogo}
          />
        </View>
      </View>

      {/* 2. Current Status Banner */}
      <TouchableOpacity
        style={[styles.darkStatusBanner, isEmergency && { backgroundColor: colors.emergency }]}
        onPress={() => isEmergency && navigateTo('SOSTab')}
        activeOpacity={0.88}
      >
        <View style={styles.shieldIconSquare}>
          <Ionicons
            name={isEmergency ? 'warning-sharp' : 'shield-outline'}
            size={20}
            color={isEmergency ? '#FFFFFF' : colors.emergency}
          />
        </View>

        <View style={styles.statusBannerCenterCol}>
          <Text style={styles.statusBannerLabel}>
            {isEmergency ? '🔴 SOS ACTIVE' : 'CURRENT STATUS'}
          </Text>
          <Text style={styles.statusBannerMainText}>
            {isEmergency ? 'Emergency Alert Triggered' : 'Protected & Monitored'}
          </Text>
        </View>

        <View style={[styles.securePillDark, isEmergency && { backgroundColor: 'rgba(0,0,0,0.25)' }]}>
          <View style={[styles.secureDotGreen, isEmergency && { backgroundColor: '#FFD700' }]} />
          <Ionicons
            name={isEmergency ? 'warning' : 'shield-checkmark'}
            size={13}
            color={isEmergency ? '#FFD700' : colors.safe}
            style={{ marginRight: 3 }}
          />
          <Text style={styles.securePillText}>
            {isEmergency ? 'ACTIVE SOS' : '🟢 YOU ARE SAFE'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 3. Emergency Assistance Card */}
      <View style={styles.emergencyCardBox}>
        <Text style={styles.emergencyCardTitle}>Emergency Assistance</Text>
        <Text style={styles.emergencyCardSub}>
          Press and hold for 3 seconds or tap to trigger silent alert & notify your circle.
        </Text>

        <SOSButton
          onActivated={() => {
            navigateTo('SOS');
          }}
        />
      </View>

      {/* 4. Active Safety Timer (In-Progress State) */}
      <TimerCard
        onStartPress={() => navigateTo('SafetyTimer')}
        onManagePress={() => navigateTo('SafetyTimer')}
      />

      {/* 5. Dynamic Safety Circle Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleText}>Safety Circle</Text>
          <Text style={styles.activeLabelRight}>{circleMembers.length} Active</Text>
        </View>

        {circleMembers.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyCircleCard}
            onPress={() => navigateTo('CircleTab')}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.emergency} />
            <View style={styles.emptyCircleCol}>
              <Text style={styles.emptyCircleTitle}>No emergency contacts added</Text>
              <Text style={styles.emptyCircleSub}>Tap to add your trusted guardians to your Safety Circle</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={styles.circleGridRow}>
            {circleMembers.slice(0, 3).map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.memberCardTile}
                onPress={() => navigateTo('CircleTab')}
                activeOpacity={0.85}
              >
                <View style={styles.avatarWrapper}>
                  {member.avatar_url || member.avatar ? (
                    <Image
                      source={{ uri: member.avatar_url || member.avatar }}
                      style={styles.avatarImg}
                    />
                  ) : (
                    <View style={styles.fallbackAvatarCircle}>
                      <Text style={styles.fallbackAvatarText}>
                        {(member.name || 'C').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.liveGreenDot} />
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.name}
                </Text>
                <Text style={styles.memberSubText} numberOfLines={1}>
                  {member.role || 'Guardian'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 6. Quick Safety Actions Grid (2x2) */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleText}>Quick Safety Actions</Text>
        </View>

        <View style={styles.grid2x2}>
          {/* Tile 1: Fake Call */}
          <TouchableOpacity
            style={styles.gridTile}
            onPress={() => navigateTo('FakeCall')}
            activeOpacity={0.85}
          >
            <View style={[styles.tileIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="call-sharp" size={22} color="#2563EB" />
            </View>
            <Text style={styles.tileTitle}>Fake Call</Text>
            <Text style={styles.tileSubtitle}>Trigger incoming call</Text>
          </TouchableOpacity>

          {/* Tile 2: New Timer */}
          <TouchableOpacity
            style={styles.gridTile}
            onPress={() => navigateTo('SafetyTimer')}
            activeOpacity={0.85}
          >
            <View style={[styles.tileIconWrap, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="timer-sharp" size={22} color="#EA580C" />
            </View>
            <Text style={styles.tileTitle}>New Timer</Text>
            <Text style={styles.tileSubtitle}>Set safety journey</Text>
          </TouchableOpacity>

          {/* Tile 3: Journey (Live tracking) */}
          <TouchableOpacity
            style={styles.gridTile}
            onPress={() => navigateTo('Journey')}
            activeOpacity={0.85}
          >
            <View style={[styles.tileIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="location-sharp" size={22} color="#16A34A" />
            </View>
            <Text style={styles.tileTitle}>Journey</Text>
            <Text style={styles.tileSubtitle}>Live tracking mode</Text>
          </TouchableOpacity>

          {/* Tile 4: QR Profile */}
          <TouchableOpacity
            style={styles.gridTile}
            onPress={() => navigateTo('EmergencyQR')}
            activeOpacity={0.85}
          >
            <View style={[styles.tileIconWrap, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="qr-code-sharp" size={22} color="#7C3AED" />
            </View>
            <Text style={styles.tileTitle}>QR Profile</Text>
            <Text style={styles.tileSubtitle}>Medical info badge</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 7. Recent Activity Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleText}>Recent Activity</Text>
        </View>

        {recentActivities.length === 0 ? (
          <View style={styles.emptyActivityCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.safe} />
            <Text style={styles.emptyActivityText}>No recent emergency events recorded.</Text>
          </View>
        ) : (
          recentActivities.slice(0, 3).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.activityCardItem}
              onPress={() => navigateTo('HistoryTab')}
              activeOpacity={0.85}
            >
              <View style={[
                styles.activityIconWrap,
                { backgroundColor: item.status === 'resolved' ? colors.safeLight : colors.emergencyLight }
              ]}>
                <Ionicons
                  name={item.status === 'resolved' ? 'checkmark-circle-sharp' : 'alert-circle-sharp'}
                  size={18}
                  color={item.status === 'resolved' ? colors.safe : colors.emergency}
                />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>
                  {item.event_type === 'sos' ? 'SOS Emergency Alert' : 'Safety Check-in'} ({item.status})
                </Text>
                <Text style={styles.activitySubtitle}>{item.location_name || 'Device GPS'}</Text>
                <Text style={styles.activityTime}>{formatActivityTime(item.triggered_at)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  // Top Header Row
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  appTitleHeader: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A2540',
    letterSpacing: -0.5,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellUnreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emergency,
  },
  headerBrandLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  // Dark Status Banner (#0A2540)
  darkStatusBanner: {
    backgroundColor: '#0A2540',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shieldIconSquare: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(211, 47, 47, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusBannerCenterCol: {
    flex: 1,
  },
  statusBannerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.8,
  },
  statusBannerMainText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  securePillDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  secureDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.safe,
    marginRight: 4,
  },
  securePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Emergency Assistance Card
  emergencyCardBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  emergencyCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  emergencyCardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  // Section Container
  sectionContainer: {
    marginVertical: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  activeLabelRight: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  // Empty Circle Prompt
  emptyCircleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 10,
  },
  emptyCircleCol: {
    flex: 1,
  },
  emptyCircleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptyCircleSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Safety Circle Row
  circleGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  memberCardTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainer,
  },
  fallbackAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A2540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  liveGreenDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.safe,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  memberSubText: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  // 2x2 Quick Actions Grid
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridTile: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  tileIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tileSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Recent Activity Feed
  emptyActivityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 8,
  },
  emptyActivityText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activityCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 8,
    gap: 10,
  },
  activityIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  activitySubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default DashboardScreen;
