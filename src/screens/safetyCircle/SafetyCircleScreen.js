// Hamro Safety - Redesigned Safety Circle Screen (screen_4.png Spec)
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import colors from '../../theme/colors';
import safetyCircleService from '../../services/safetyCircle/safetyCircleService';
import { useAuth } from '../../context/AuthContext';

// 4 Trusted Members matching screen_4.png spec
const INITIAL_TRUSTED_MEMBERS = [
  {
    id: 'm1',
    name: 'Aayushma Sharma',
    role: 'Partner',
    statusText: 'Last active 2 mins ago • Kathmandu, NP',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    settingText: 'Live Location Enabled',
    settingIcon: 'settings-sharp',
    battery: 84,
    showBattery: true,
  },
  {
    id: 'm2',
    name: 'Bikash Sharma',
    role: 'Family',
    statusText: 'At Home • Lalitpur, NP',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    settingText: 'Live Location Enabled',
    settingIcon: 'settings-sharp',
    battery: 92,
    showBattery: true,
  },
  {
    id: 'm3',
    name: 'Pooja Thapa',
    role: 'Roommate',
    statusText: 'Last active 4 hours ago',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    settingText: 'SOS Alerts Only | Location Hidden',
    settingIcon: 'notifications-sharp',
    battery: null,
    showBattery: false,
  },
  {
    id: 'm4',
    name: 'Rohan Karki',
    role: 'Friend',
    statusText: 'On the move • Thamel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    settingText: 'Live Location Enabled',
    settingIcon: 'settings-sharp',
    battery: 45,
    showBattery: true,
  },
];

export const SafetyCircleScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [trustedMembers, setTrustedMembers] = useState(INITIAL_TRUSTED_MEMBERS);
  const [hasPending, setHasPending] = useState(true);

  const fetchMembers = async () => {
    try {
      const data = await safetyCircleService.getCircleMembers(user?.id);
      if (data && data.length > 0) {
        // preserve updated list if available
      }
    } catch (e) {
      console.warn('Fetch safety circle members error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user]);

  const handleMemberAction = (member) => {
    Alert.alert(
      `${member.name} (${member.role})`,
      'Choose an action for this safety circle member:',
      [
        { text: 'View Live Location', onPress: () => Alert.alert('Location', `${member.name} - ${member.statusText}`) },
        { text: 'Edit Permissions', onPress: () => Alert.alert('Permissions', 'SOS alerts and emergency GPS location are active.') },
        { text: 'Remove Member', style: 'destructive', onPress: () => handleRemoveMember(member.id) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRemoveMember = (id) => {
    setTrustedMembers((prev) => prev.filter((m) => m.id !== id));
    Alert.alert('Member Removed', 'Circle member removed successfully.');
  };

  const handlePendingOptions = () => {
    Alert.alert(
      'Pending Invitation',
      'Nirjala Sharma (Invited as Family)',
      [
        { text: 'Resend Invitation', onPress: () => Alert.alert('Sent', 'Invitation code resent via SMS.') },
        { text: 'Revoke Invitation', style: 'destructive', onPress: () => setHasPending(false) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={styles.container}
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
    >
      {/* 1. Header Area: Topmost row with Hamro Safety + Bell Icon + Brand Logo */}
      <View style={styles.topHeaderRow}>
        <Text style={styles.appTitleHeader}>Hamro Safety</Text>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            style={styles.bellIconBtn}
            onPress={() => navigation.navigate('HistoryTab')}
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

      <View style={styles.pageHeaderGroup}>
        <Text style={styles.pageHeaderTitle}>Safety Circle</Text>
        <Text style={styles.pageHeaderSub}>
          Your trusted network of family and friends keeping watch over your daily journeys.
        </Text>
      </View>

      {/* 2. Encryption Card (White / Light Surface Container) */}
      <View style={styles.lightEncryptionCard}>
        <View style={styles.encHeaderRow}>
          <View style={styles.lockIconBadgeDark}>
            <Ionicons name="lock-closed" size={16} color="#FFF" />
          </View>
          <View style={styles.encTitleCol}>
            <Text style={styles.encMainTitle}>End-to-End Encrypted ...</Text>
          </View>
          <View style={styles.activePillBlue}>
            <Text style={styles.activePillBlueText}>Active</Text>
          </View>
        </View>

        <Text style={styles.encDescriptionText}>
          Your precise GPS telemetry is only streamed during active SOS emergencies or manual check-ins. Circle members always respect your boundaries.
        </Text>

        <View style={styles.encFooterPillsRow}>
          <View style={styles.encFooterPill}>
            <Ionicons name="eye-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.encFooterPillText}>Live Location: On-Demand</Text>
          </View>
          <View style={styles.encFooterPill}>
            <Ionicons name="notifications-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.encFooterPillText}>SOS Alerts: Immediate</Text>
          </View>
        </View>
      </View>

      {/* 3. Trusted Members Section (Trusted Members (4) + Add Member button) */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleText}>Trusted Members ({trustedMembers.length})</Text>
          <TouchableOpacity
            style={styles.addMemberHeaderBtn}
            onPress={() => navigation.navigate('ContactsTab')}
          >
            <Ionicons name="add" size={16} color={colors.emergency} />
            <Text style={styles.addMemberRedText}>Add Member</Text>
          </TouchableOpacity>
        </View>

        {trustedMembers.map((member) => (
          <View key={member.id} style={styles.memberCardTile}>
            <View style={styles.memberTopRow}>
              {/* Photo Avatar with Live Green Dot */}
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: member.avatar }}
                  style={styles.memberAvatarImg}
                />
                <View style={styles.liveGreenDot} />
              </View>

              {/* Name & Status Column */}
              <View style={styles.memberInfoCol}>
                <View style={styles.memberNameAndRoleRow}>
                  <Text style={styles.memberNameText}>{member.name}</Text>
                  <View style={styles.roleTagPill}>
                    <Text style={styles.roleTagPillText}>{member.role}</Text>
                  </View>
                </View>

                <Text style={styles.memberStatusText}>{member.statusText}</Text>
              </View>

              {/* 3-Dots Action Button */}
              <TouchableOpacity
                style={styles.threeDotsBtn}
                onPress={() => handleMemberAction(member)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Bottom Metadata Bar */}
            <View style={styles.memberBottomMetaRow}>
              <View style={styles.settingIconGroup}>
                <Ionicons name={member.settingIcon} size={12} color={colors.textSecondary} />
                <Text style={styles.settingMetaText}>{member.settingText}</Text>
              </View>

              {member.showBattery && (
                <View style={styles.batteryGroup}>
                  <Ionicons
                    name={member.battery > 50 ? 'battery-charging-sharp' : 'battery-dead-sharp'}
                    size={12}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.batteryMetaText}>Battery: {member.battery}%</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* 4. Pending Invitations Section */}
      {hasPending && (
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleText}>Pending Invitations</Text>
            <View style={styles.pendingBadgePink}>
              <Text style={styles.pendingBadgePinkText}>1 Pending</Text>
            </View>
          </View>

          <View style={styles.pendingCardCompact}>
            <View style={styles.pendingAvatarSquare}>
              <Text style={styles.pendingAvatarText}>NS</Text>
            </View>

            <View style={styles.pendingInfoCol}>
              <Text style={styles.pendingNameText} numberOfLines={1}>Nirjala Sharma</Text>
              <Text style={styles.pendingSubText} numberOfLines={1}>Invited as ...</Text>
            </View>

            <TouchableOpacity
              onPress={handlePendingOptions}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.resendRevokeRedLink}>Resend / Revoke</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 5. "Expand Your Safety Net" Bottom Banner (Solid Deep Navy #0A2540) */}
      <View style={styles.darkExpandBanner}>
        <View style={styles.redAddUserBadge}>
          <Ionicons name="person-add-sharp" size={20} color="#FFF" />
        </View>

        <Text style={styles.expandTitleText}>Expand Your Safety Net</Text>
        <Text style={styles.expandSubText}>
          Invite trusted family members or close friends to monitor your trips and receive instant SOS notifications.
        </Text>

        <TouchableOpacity
          style={styles.redAddMemberBtn}
          onPress={() => navigation.navigate('ContactsTab')}
          activeOpacity={0.88}
        >
          <Ionicons name="add-sharp" size={18} color="#FFF" />
          <Text style={styles.redAddMemberBtnText}>Add Circle Member</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  // Topmost Row
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
  pageHeaderGroup: {
    marginBottom: 14,
  },
  pageHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pageHeaderSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  // Light Encryption Card
  lightEncryptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  encHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lockIconBadgeDark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#0A2540',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  encTitleCol: {
    flex: 1,
  },
  encMainTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  activePillBlue: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  activePillBlueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  encDescriptionText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  encFooterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  encFooterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  encFooterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  // Sections
  sectionWrap: {
    marginBottom: 16,
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
  addMemberHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addMemberRedText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.emergency,
  },
  // Member Card Tile
  memberCardTile: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 10,
  },
  memberTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  memberAvatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceContainer,
  },
  liveGreenDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: colors.safe,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberInfoCol: {
    flex: 1,
  },
  memberNameAndRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  roleTagPill: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleTagPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  memberStatusText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  threeDotsBtn: {
    padding: 4,
  },
  memberBottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  settingIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  batteryGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  // Pending Invitations
  pendingBadgePink: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pendingBadgePinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.emergency,
  },
  pendingCardCompact: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingAvatarSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pendingAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pendingInfoCol: {
    flex: 1,
  },
  pendingNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pendingSubText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  resendRevokeRedLink: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.emergency,
  },
  // Dark Expand Banner (#0A2540)
  darkExpandBanner: {
    backgroundColor: '#0A2540',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  redAddUserBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  expandTitleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  expandSubText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  redAddMemberBtn: {
    width: '100%',
    backgroundColor: colors.emergency,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  redAddMemberBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default SafetyCircleScreen;


