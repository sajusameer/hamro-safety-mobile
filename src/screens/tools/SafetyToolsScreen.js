// Hamro Safety - Safety Tools Hub Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import colors from '../../theme/colors';

export const SafetyToolsScreen = ({ navigation }) => {
  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {navigation.canGoBack() && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
      <View style={styles.header}>
        <Text style={styles.title}>Safety Tools</Text>
        <Text style={styles.subtitle}>
          Discreet utilities designed to help you exit uncomfortable situations safely.
        </Text>
      </View>

      {/* 1. Fake Call Simulator */}
      <TouchableOpacity
        style={styles.toolCard}
        onPress={() => navigation.navigate('FakeCall')}
        activeOpacity={0.8}
      >
        <View style={[styles.toolIconWrap, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="call" size={26} color={colors.primaryLight} />
        </View>
        <View style={styles.toolTextCol}>
          <View style={styles.tagRow}>
            <Text style={styles.toolTitle}>Fake Call Simulator</Text>
            <View style={styles.discreetTag}>
              <Text style={styles.discreetText}>SIMULATED</Text>
            </View>
          </View>
          <Text style={styles.toolDesc}>
            Triggers a realistic incoming phone call to give you a natural reason to step away. Does not dial emergency services.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* 2. Quick Exit */}
      <TouchableOpacity
        style={styles.toolCard}
        onPress={() => navigation.navigate('QuickExit')}
        activeOpacity={0.8}
      >
        <View style={[styles.toolIconWrap, { backgroundColor: '#F1F5F9' }]}>
          <Ionicons name="exit-outline" size={26} color={colors.textSecondary} />
        </View>
        <View style={styles.toolTextCol}>
          <Text style={styles.toolTitle}>Quick Exit Screen</Text>
          <Text style={styles.toolDesc}>
            Discreetly switches your phone to a dummy note/calculator screen while keeping background safety armed.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* 3. Emergency Medical QR */}
      <TouchableOpacity
        style={styles.toolCard}
        onPress={() => navigation.navigate('EmergencyQR')}
        activeOpacity={0.8}
      >
        <View style={[styles.toolIconWrap, { backgroundColor: '#F0FDF4' }]}>
          <Ionicons name="qr-code" size={26} color={colors.safe} />
        </View>
        <View style={styles.toolTextCol}>
          <Text style={styles.toolTitle}>Emergency ICE QR</Text>
          <Text style={styles.toolDesc}>
            Shows limited emergency contacts and blood type on lockscreen without unlocking your private phone.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 12,
  },
  toolIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  toolTextCol: {
    flex: 1,
    paddingRight: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  discreetTag: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discreetText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  toolDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
});

export default SafetyToolsScreen;
