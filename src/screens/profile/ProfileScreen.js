// Hamro Safety - Profile Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profile/profileService';
import { APP_CONFIG } from '../../constants/config';

export const ProfileScreen = ({ navigation }) => {
  const { user, signOut, isDemo } = useAuth();
  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile(user?.id);
      setProfile(data);
    } catch (e) {
      console.warn('Fetch profile error:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });
    fetchProfile();
    return unsubscribe;
  }, [navigation, user]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Hamro Safety?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Safety User';
  const displayEmail = profile?.email || user?.email || 'user@example.com';
  const displayPhone = profile?.phone_number || user?.user_metadata?.phone_number || 'Not set';

  const navigateTo = (screenName, params) => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(screenName, params);
    } else {
      navigation.navigate(screenName, params);
    }
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Header Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{displayEmail}</Text>
        {isDemo && (
          <View style={styles.demoTag}>
            <Text style={styles.demoTagText}>DEMO ACCOUNT</Text>
          </View>
        )}

        <Button
          title="Edit Profile"
          icon="pencil"
          variant="outline"
          size="sm"
          onPress={() => navigateTo('EditProfile', { profile })}
          style={styles.editBtn}
        />
      </View>

      {/* Medical / Emergency Info Card */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionHeading}>Emergency Information</Text>

        <View style={styles.infoRow}>
          <Ionicons name="water-outline" size={20} color={colors.emergency} />
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Blood Group</Text>
            <Text style={styles.infoVal}>{profile?.blood_group || 'O+'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="medkit-outline" size={20} color={colors.primary} />
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Medical & Allergy Notes</Text>
            <Text style={styles.infoVal}>
              {profile?.medical_notes || 'No known allergies.'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={colors.secondary} />
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Emergency Phone</Text>
            <Text style={styles.infoVal}>{displayPhone}</Text>
          </View>
        </View>
      </View>

      {/* Account Settings Links */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionHeading}>Preferences & Security</Text>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => navigateTo('SafetyPrivacy')}
        >
          <View style={styles.menuIconWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.menuTextCol}>
            <Text style={styles.menuTitle}>Safety & Privacy Settings</Text>
            <Text style={styles.menuSubtitle}>Location sharing, data retention, access rules</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => navigateTo('EmergencyHistory')}
        >
          <View style={styles.menuIconWrap}>
            <Ionicons name="time-outline" size={20} color={colors.secondary} />
          </View>
          <View style={styles.menuTextCol}>
            <Text style={styles.menuTitle}>Emergency Event History</Text>
            <Text style={styles.menuSubtitle}>View past SOS logs and check-in audits</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* App Meta & Logout */}
      <View style={styles.footerSection}>
        <Text style={styles.appMeta}>
          {APP_CONFIG.appName} v{APP_CONFIG.version}
        </Text>
        <Text style={styles.companyMeta}>
          {APP_CONFIG.company} • {APP_CONFIG.tagline}
        </Text>

        <Button
          title="Sign Out"
          icon="log-out-outline"
          variant="outline"
          size="md"
          onPress={handleLogout}
          style={styles.logoutBtn}
          textStyle={{ color: colors.emergency }}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textInverse,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  demoTag: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  demoTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.warningDark,
  },
  editBtn: {
    marginTop: 14,
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    gap: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  appMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  companyMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  logoutBtn: {
    borderColor: colors.emergency,
    width: '100%',
  },
});

export default ProfileScreen;
