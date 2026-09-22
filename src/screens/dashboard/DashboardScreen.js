// Hamro Safety - Main Dashboard Screen
// Company: Zuptrix Solutions Pvt. Ltd.
// Tagline: "Your Safety. Our Priority."
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import StatusBadge from '../../components/common/StatusBadge';
import SectionHeader from '../../components/common/SectionHeader';
import SOSButton from '../../components/safety/SOSButton';
import TimerCard from '../../components/safety/TimerCard';
import EmergencyCard from '../../components/emergency/EmergencyCard';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useEmergency } from '../../context/EmergencyContext';
import { SAFETY_STATES } from '../../constants/safetyStates';
import contactsService from '../../services/contacts/contactsService';
import historyService from '../../services/history/historyService';

export const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const {
    safetyState,
    activeEmergency,
    lastLocation,
    dispatches,
    resolveEmergency,
    refreshLocation,
  } = useEmergency();

  const [contactsCount, setContactsCount] = useState(0);
  const [recentEvent, setRecentEvent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const contacts = await contactsService.getContacts(user?.id);
      setContactsCount(contacts.length);
      const history = await historyService.getHistory(user?.id);
      if (history && history.length > 0) {
        setRecentEvent(history[0]);
      }
    } catch (e) {
      console.warn('Dashboard data fetch error:', e);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboardData(), refreshLocation()]);
    setRefreshing(false);
  };

  const displayName = user?.user_metadata?.full_name || 'Friend';

  const navigateTo = (screenName, params) => {
    // 1. Direct tab switches
    if (['DashboardTab', 'ContactsTab', 'SOSTab', 'CircleTab', 'ProfileTab'].includes(screenName)) {
      navigation.navigate(screenName, params);
      return;
    }

    // 2. Tab aliases
    if (screenName === 'SafetyCircle') {
      navigation.navigate('CircleTab', params);
      return;
    }
    if (screenName === 'Contacts') {
      navigation.navigate('ContactsTab', params);
      return;
    }
    if (screenName === 'Profile') {
      navigation.navigate('ProfileTab', params);
      return;
    }

    // 3. For stack screens (FakeCall, QuickExit, EmergencyQR, SafetyTimer, EmergencyHistory, SafetyTools, ToolsTab, SOS, etc.)
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(screenName, params);
    } else {
      navigation.navigate(screenName, params);
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
      {/* 1. Header Greeting & Status */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetingSub}>Hamro Safety</Text>
          <Text style={styles.greetingTitle}>Namaste, {displayName}</Text>
        </View>
        <StatusBadge status={safetyState} size="md" />
      </View>

      {/* 2. Active Emergency Banner if Triggered */}
      {safetyState === SAFETY_STATES.SOS_ACTIVE && (
        <EmergencyCard
          event={activeEmergency}
          location={lastLocation}
          dispatches={dispatches}
          onResolve={resolveEmergency}
        />
      )}

      {/* 3. SOS Trigger Button (Deliberate Hold-to-Activate) */}
      <View style={styles.sosCard}>
        <SOSButton
          onActivated={() => {
            navigateTo('SOS');
          }}
        />
      </View>

      {/* 4. Active Safety Timer or Setup Prompt */}
      <TimerCard
        onStartPress={() => navigateTo('SafetyTimer')}
        onManagePress={() => navigateTo('SafetyTimer')}
      />

      {/* 5. Location & Battery Status Bar */}
      <View style={styles.statusTile}>
        <View style={styles.statusTileIcon}>
          <Ionicons name="location-sharp" size={20} color={colors.primary} />
        </View>
        <View style={styles.statusTileContent}>
          <Text style={styles.statusTileTitle}>
            {lastLocation
              ? `${lastLocation.latitude.toFixed(4)}, ${lastLocation.longitude.toFixed(4)}`
              : 'Acquiring GPS fix...'}
          </Text>
          <Text style={styles.statusTileSubtitle}>
            Privacy Protected • Battery: {lastLocation?.batteryPercentage || 92}%
          </Text>
        </View>
        <TouchableOpacity
          onPress={refreshLocation}
          style={styles.refreshIconBtn}
          accessibilityLabel="Refresh location"
        >
          <Ionicons name="refresh" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 6. Safety Circle Quick Summary */}
      <TouchableOpacity
        style={styles.circleSummaryCard}
        onPress={() => navigateTo('CircleTab')}
        activeOpacity={0.8}
      >
        <View style={styles.circleIcon}>
          <Ionicons name="people-circle" size={28} color={colors.secondary} />
        </View>
        <View style={styles.circleTextCol}>
          <Text style={styles.circleTitle}>Safety Circle ({contactsCount} Guardians)</Text>
          <Text style={styles.circleSub}>
            {contactsCount > 0
              ? 'Authorized to receive immediate SOS alerts & location'
              : 'Add emergency contacts to protect your circle'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* 7. Quick Safety Tools Grid */}
      <SectionHeader
        title="Quick Safety Tools"
        actionText="View All"
        onAction={() => navigateTo('SafetyTools')}
      />
      <View style={styles.toolsGrid}>
        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => navigateTo('FakeCall')}
        >
          <View style={[styles.toolIconWrap, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="call-outline" size={22} color={colors.primaryLight} />
          </View>
          <Text style={styles.toolName}>Fake Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => navigateTo('QuickExit')}
        >
          <View style={[styles.toolIconWrap, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name="exit-outline" size={22} color={colors.textSecondary} />
          </View>
          <Text style={styles.toolName}>Quick Exit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => navigateTo('EmergencyQR')}
        >
          <View style={[styles.toolIconWrap, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="qr-code-outline" size={22} color={colors.safe} />
          </View>
          <Text style={styles.toolName}>Medical QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => navigateTo('SafetyTimer')}
        >
          <View style={[styles.toolIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="timer-outline" size={22} color={colors.warningDark} />
          </View>
          <Text style={styles.toolName}>Trip Timer</Text>
        </TouchableOpacity>
      </View>

      {/* 8. Recent Safety Activity */}
      {recentEvent && (
        <View style={styles.recentSection}>
          <SectionHeader
            title="Recent Safety Activity"
            actionText="Full History"
            onAction={() => navigateTo('EmergencyHistory')}
          />
          <TouchableOpacity
            style={styles.recentCard}
            onPress={() => navigateTo('EmergencyHistory')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={recentEvent.status === 'resolved' ? 'checkmark-circle' : 'information-circle'}
              size={20}
              color={recentEvent.status === 'resolved' ? colors.safe : colors.textSecondary}
            />
            <View style={styles.recentTextCol}>
              <Text style={styles.recentTitle}>
                {recentEvent.event_type.toUpperCase()} ({recentEvent.status})
              </Text>
              <Text style={styles.recentDate}>
                {new Date(recentEvent.triggered_at).toLocaleDateString()} at{' '}
                {new Date(recentEvent.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  sosCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginVertical: 6,
  },
  statusTileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusTileContent: {
    flex: 1,
  },
  statusTileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusTileSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  refreshIconBtn: {
    padding: 6,
  },
  circleSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginVertical: 6,
  },
  circleIcon: {
    marginRight: 12,
  },
  circleTextCol: {
    flex: 1,
  },
  circleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  circleSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toolsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  toolTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  toolIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  toolName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recentSection: {
    marginTop: 8,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 10,
  },
  recentTextCol: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recentDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default DashboardScreen;
