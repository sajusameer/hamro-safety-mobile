// Hamro Safety - Register Screen
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export const RegisterScreen = ({ navigation }) => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim(), phone.trim());
      Alert.alert(
        'Account Created',
        'Your Hamro Safety profile has been registered successfully.',
        [{ text: 'Continue', onPress: () => {} }]
      );
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.formCard}>
        <View style={styles.brandLogoWrap}>
          <Image
            source={require('../../../assets/brand-logo.png')}
            style={styles.brandLogoHeader}
          />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Hamro Safety for trusted personal protection</Text>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.emergency} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Input
          label="Full Name *"
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Sajus Shrestha"
          icon="person-outline"
        />

        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="+977-98XXXXXXXX"
          keyboardType="phone-pad"
          icon="call-outline"
        />

        <Input
          label="Email Address *"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          keyboardType="email-address"
          icon="mail-outline"
        />

        <Input
          label="Password *"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          icon="lock-closed-outline"
        />

        <Input
          label="Confirm Password *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repeat password"
          secureTextEntry
          icon="lock-closed-outline"
        />

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          variant="primary"
          style={styles.submitBtn}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  brandLogoWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  brandLogoHeader: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emergencyLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: colors.emergencyDark,
    fontWeight: '500',
    flex: 1,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default RegisterScreen;
