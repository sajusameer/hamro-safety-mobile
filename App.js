// Hamro Safety - Mobile Application Entry Point
// Company: Zuptrix Solutions Pvt. Ltd.
// Tagline: "Your Safety. Our Priority."
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { EmergencyProvider } from './src/context/EmergencyContext';
import { SafetyTimerProvider } from './src/context/SafetyTimerContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <EmergencyProvider>
          <SafetyTimerProvider>
            <RootNavigator />
            <StatusBar style="dark" />
          </SafetyTimerProvider>
        </EmergencyProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
