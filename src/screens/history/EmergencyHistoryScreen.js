// Hamro Safety - Emergency History Screen (Global Standard)
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import colors from '../../theme/colors';
import historyService from '../../services/history/historyService';
import { useAuth } from '../../context/AuthContext';

export const EmergencyHistoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setError(null);
      const data = await historyService.getHistory(user?.id);
      setHistory(data);
    } catch (err) {
      setError(err.message || 'Failed to load safety event history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Safety History?',
      'This will remove previous event records from your device for privacy.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await historyService.clearHistory(user?.id);
            fetchHistory();
          },
        },
      ]
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
      case 'completed_safe':
        return { label: '✓ RESOLVED SAFE', color: colors.safeDark, bg: colors.safeLight, icon: 'checkmark-circle-sharp' };
      case 'cancelled':
        return { label: 'CANCELLED', color: colors.textSecondary, bg: colors.surfaceContainer, icon: 'close-circle-sharp' };
      case 'active':
        return { label: 'ACTIVE SOS', color: '#FFF', bg: colors.emergency, icon: 'warning-sharp' };
      default:
        return { label: status?.toUpperCase() || 'RESOLVED', color: colors.safeDark, bg: colors.safeLight, icon: 'checkmark-circle-sharp' };
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* 1. Global Header Standard */}
      <View style={styles.topHeaderRow}>
        <Text style={styles.appTitleHeader}>Hamro Safety</Text>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            style={styles.bellIconBtn}
            onPress={() => fetchHistory()}
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

      <View style={styles.pageHeaderRow}>
        <View style={styles.pageHeaderCol}>
          <Text style={styles.title}>Safety History</Text>
          <Text style={styles.subtitle}>Audit trail of emergency alerts and check-ins</Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearHeaderBtn} onPress={handleClearHistory}>
            <Text style={styles.clearHeaderBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.privacyNote}>
        <Ionicons name="shield-checkmark-sharp" size={14} color={colors.safe} />
        <Text style={styles.privacyNoteText}>
          Privacy Guard: Detailed GPS breadcrumbs are discarded once emergencies are resolved.
        </Text>
      </View>

      {loading ? (
        <LoadingState message="Loading safety records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchHistory} />
      ) : history.length === 0 ? (
        <EmptyState
          icon="shield-outline"
          title="No Past Emergency Events"
          description="Your safety history is clear. When you use SOS or safety timers, a private log is maintained here."
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            return (
              <View style={styles.eventCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Ionicons name={badge.icon} size={13} color={badge.color} />
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                  <Text style={styles.eventTime}>
                    {new Date(item.triggered_at).toLocaleDateString()} •{' '}
                    {new Date(item.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                {/* Two stacked lines for headline and subtitle */}
                <Text style={styles.eventHeadline}>
                  {item.event_type === 'sos' ? 'SOS Emergency Alert' : 'Safety Arrival Timer'}
                </Text>

                <Text style={styles.eventSubtitle}>
                  {item.resolution_note || item.location_name || 'Checked in safely via app'}
                </Text>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchHistory();
              }}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  appTitleHeader: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A2540',
    letterSpacing: -0.5,
  },
  headerRightGroup: {
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
  pageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pageHeaderCol: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  clearHeaderBtn: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  clearHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.safeLight,
    padding: 10,
    borderRadius: 10,
    gap: 6,
    marginBottom: 12,
  },
  privacyNoteText: {
    fontSize: 11,
    color: colors.safeDark,
    fontWeight: '600',
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  eventTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  eventHeadline: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  eventSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default EmergencyHistoryScreen;

