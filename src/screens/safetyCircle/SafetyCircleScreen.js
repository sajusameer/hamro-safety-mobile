// Hamro Safety - Safety Circle Permissions Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import colors from '../../theme/colors';
import safetyCircleService from '../../services/safetyCircle/safetyCircleService';
import { useAuth } from '../../context/AuthContext';

export const SafetyCircleScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMembers = async () => {
    try {
      const data = await safetyCircleService.getCircleMembers(user?.id);
      setMembers(data);
    } catch (e) {
      console.warn('Fetch safety circle members failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMembers();
    });
    fetchMembers();
    return unsubscribe;
  }, [navigation, user]);

  const PERMISSION_FIELD_MAP = {
    allowSosAlerts: 'allow_sos_alerts',
    allowEmergencyLocation: 'allow_emergency_location',
    allowSafetyTimerAlerts: 'allow_safety_timer_alerts',
    allowStatusUpdates: 'allow_status_updates',
  };

  const handleToggle = async (contactId, camelKey) => {
    const member = members.find((m) => m.contactId === contactId);
    if (!member) return;

    const previousValue = Boolean(member[camelKey]);
    const nextValue = !previousValue;
    const dbKey = PERMISSION_FIELD_MAP[camelKey] || camelKey;

    // 1. Optimistic UI update immediately
    setMembers((prev) =>
      prev.map((m) => {
        if (m.contactId === contactId) {
          return {
            ...m,
            [camelKey]: nextValue,
            [dbKey]: nextValue,
          };
        }
        return m;
      })
    );

    // 2. Persist to service / local mock store
    try {
      await safetyCircleService.togglePermission(contactId, dbKey, previousValue);
    } catch (err) {
      console.warn('Failed to update circle permission, reverting:', err);
      // Revert on error
      setMembers((prev) =>
        prev.map((m) => {
          if (m.contactId === contactId) {
            return {
              ...m,
              [camelKey]: previousValue,
              [dbKey]: previousValue,
            };
          }
          return m;
        })
      );
      Alert.alert('Error', 'Could not update circle permissions.');
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Circle</Text>
        <Text style={styles.subtitle}>
          Fine-tune what each trusted guardian can see and receive during alerts.
        </Text>
      </View>

      <View style={styles.securityBanner}>
        <Ionicons name="shield-checkmark" size={18} color={colors.secondary} />
        <Text style={styles.securityText}>
          Row-Level Privacy: Guardians only access your emergency location when an active SOS or safety timer is running.
        </Text>
      </View>

      {loading ? (
        <LoadingState message="Loading safety circle..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No Guardians in Circle"
          description="Add emergency contacts first to manage safety permissions."
          actionTitle="Add Emergency Contact"
          onAction={() => navigation.navigate('ContactsTab')}
        />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.contactId}
          renderItem={({ item }) => (
            <View style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberSub}>
                    {item.relationship} • {item.phone}
                  </Text>
                </View>
              </View>

              <View style={styles.permissionsDivider} />

              {/* 1. SOS Alerts Toggle */}
              <View style={styles.permRow}>
                <View style={styles.permLabelCol}>
                  <Text style={styles.permTitle}>SOS Emergency Alerts</Text>
                  <Text style={styles.permDesc}>Receives urgent SMS/Push on SOS activation</Text>
                </View>
                <Switch
                  value={Boolean(item.allowSosAlerts)}
                  onValueChange={() => handleToggle(item.contactId, 'allowSosAlerts')}
                  trackColor={{ false: colors.surfaceBorder, true: colors.emergencyLight }}
                  thumbColor={item.allowSosAlerts ? colors.emergency : '#f4f3f4'}
                />
              </View>

              {/* 2. Emergency Location Toggle */}
              <View style={styles.permRow}>
                <View style={styles.permLabelCol}>
                  <Text style={styles.permTitle}>Emergency GPS Location</Text>
                  <Text style={styles.permDesc}>Can view coordinates during active emergencies</Text>
                </View>
                <Switch
                  value={Boolean(item.allowEmergencyLocation)}
                  onValueChange={() => handleToggle(item.contactId, 'allowEmergencyLocation')}
                  trackColor={{ false: colors.surfaceBorder, true: '#DBEAFE' }}
                  thumbColor={item.allowEmergencyLocation ? colors.primary : '#f4f3f4'}
                />
              </View>

              {/* 3. Safety Timer Alerts */}
              <View style={styles.permRow}>
                <View style={styles.permLabelCol}>
                  <Text style={styles.permTitle}>Safety Timer Overdue Alerts</Text>
                  <Text style={styles.permDesc}>Notified if you fail to check in upon arrival</Text>
                </View>
                <Switch
                  value={Boolean(item.allowSafetyTimerAlerts)}
                  onValueChange={() => handleToggle(item.contactId, 'allowSafetyTimerAlerts')}
                  trackColor={{ false: colors.surfaceBorder, true: colors.warningLight }}
                  thumbColor={item.allowSafetyTimerAlerts ? colors.warning : '#f4f3f4'}
                />
              </View>

              {/* 4. Safe Status Updates */}
              <View style={styles.permRow}>
                <View style={styles.permLabelCol}>
                  <Text style={styles.permTitle}>"I'm Safe" Check-in Updates</Text>
                  <Text style={styles.permDesc}>Notified when you arrive safely or resolve SOS</Text>
                </View>
                <Switch
                  value={Boolean(item.allowStatusUpdates)}
                  onValueChange={() => handleToggle(item.contactId, 'allowStatusUpdates')}
                  trackColor={{ false: colors.surfaceBorder, true: colors.safeLight }}
                  thumbColor={item.allowStatusUpdates ? colors.safe : '#f4f3f4'}
                />
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchMembers();
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
  header: {
    marginBottom: 12,
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
    lineHeight: 18,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  securityText: {
    fontSize: 12,
    color: colors.secondary,
    flex: 1,
    lineHeight: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  memberCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 14,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  memberSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  permissionsDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  permLabelCol: {
    flex: 1,
    paddingRight: 12,
  },
  permTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  permDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default SafetyCircleScreen;
