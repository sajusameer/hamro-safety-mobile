// Hamro Safety - Emergency History Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
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
        return { label: 'RESOLVED SAFE', color: colors.safe, bg: colors.safeLight, icon: 'checkmark-circle' };
      case 'cancelled':
        return { label: 'CANCELLED', color: colors.textSecondary, bg: colors.surfaceSubtle, icon: 'close-circle' };
      case 'active':
        return { label: 'ACTIVE', color: colors.emergency, bg: colors.emergencyLight, icon: 'warning' };
      default:
        return { label: status?.toUpperCase(), color: colors.warningDark, bg: colors.warningLight, icon: 'alert-circle' };
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Safety History</Text>
          <Text style={styles.subtitle}>Audit trail of emergency alerts and check-ins</Text>
        </View>
        {history.length > 0 && (
          <Button
            title="Clear"
            variant="outline"
            size="sm"
            onPress={handleClearHistory}
            style={styles.clearBtn}
          />
        )}
      </View>

      <View style={styles.privacyNote}>
        <Ionicons name="lock-closed" size={14} color={colors.secondary} />
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
                    <Ionicons name={badge.icon} size={14} color={badge.color} />
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                  <Text style={styles.eventTime}>
                    {new Date(item.triggered_at).toLocaleDateString()} •{' '}
                    {new Date(item.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <Text style={styles.eventType}>
                  {item.event_type === 'sos' ? 'SOS Emergency Alert' : 'Safety Arrival Timer'}
                </Text>

                {item.location_name && (
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{item.location_name}</Text>
                  </View>
                )}

                {item.resolution_note && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteLabel}>Resolution Note:</Text>
                    <Text style={styles.noteText}>{item.resolution_note}</Text>
                  </View>
                )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  clearBtn: {
    minHeight: 32,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 14,
  },
  privacyNoteText: {
    fontSize: 11,
    color: colors.secondary,
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
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  eventTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  eventType: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noteBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  noteText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
  },
});

export default EmergencyHistoryScreen;
