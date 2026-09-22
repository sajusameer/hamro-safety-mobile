// Hamro Safety - Forgot Password Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../theme/colors';
import authService from '../../services/auth/authService';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authService.resetPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not send reset link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={32} color={colors.primary} />
        </View>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email and we'll send instructions to reset your password.
        </Text>

        {submitted ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={24} color={colors.safe} />
            <Text style={styles.successTitle}>Instructions Sent</Text>
            <Text style={styles.successText}>
              If an account matches {email}, a recovery link has been dispatched.
            </Text>
            <Button
              title="Return to Sign In"
              onPress={() => navigation.navigate('Login')}
              variant="primary"
              style={styles.returnBtn}
            />
          </View>
        ) : (
          <>
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.emergency} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              icon="mail-outline"
            />

            <Button
              title="Send Reset Link"
              onPress={handleReset}
              loading={loading}
              variant="primary"
              style={styles.submitBtn}
            />
          </>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emergencyLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
    width: '100%',
  },
  errorText: {
    fontSize: 13,
    color: colors.emergencyDark,
    fontWeight: '500',
    flex: 1,
  },
  submitBtn: {
    width: '100%',
    marginTop: 8,
  },
  successBox: {
    alignItems: 'center',
    padding: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 6,
  },
  successText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  returnBtn: {
    width: '100%',
    minWidth: 200,
  },
});

export default ForgotPasswordScreen;
