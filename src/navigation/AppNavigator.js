// Hamro Safety - App Navigator (Tabs + Stack)
// Company: Zuptrix Solutions Pvt. Ltd.
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SOSScreen from '../screens/sos/SOSScreen';
import ContactListScreen from '../screens/contacts/ContactListScreen';
import AddContactScreen from '../screens/contacts/AddContactScreen';
import EditContactScreen from '../screens/contacts/EditContactScreen';
import SafetyCircleScreen from '../screens/safetyCircle/SafetyCircleScreen';
import SafetyTimerScreen from '../screens/safetyTimer/SafetyTimerScreen';
import EmergencyHistoryScreen from '../screens/history/EmergencyHistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SafetyPrivacyScreen from '../screens/privacy/SafetyPrivacyScreen';
import SafetyToolsScreen from '../screens/tools/SafetyToolsScreen';
import FakeCallScreen from '../screens/tools/FakeCallScreen';
import QuickExitScreen from '../screens/tools/QuickExitScreen';
import EmergencyQRScreen from '../screens/tools/EmergencyQRScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Bar
const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ContactsTab"
        component={ContactListScreen}
        options={{
          tabBarLabel: 'Contacts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      {/* Center SOS Tab - Prominent and highly accessible */}
      <Tab.Screen
        name="SOSTab"
        component={SOSScreen}
        options={{
          tabBarLabel: 'SOS',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.sosTabButton,
                { backgroundColor: focused ? colors.emergencyDark : colors.emergency },
              ]}
            >
              <Ionicons name="warning" size={26} color="#FFFFFF" />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="CircleTab"
        component={SafetyCircleScreen}
        options={{
          tabBarLabel: 'Circle',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-network" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="SOS" component={SOSScreen} />
      <Stack.Screen name="SOSTab" component={SOSScreen} />
      <Stack.Screen name="AddContact" component={AddContactScreen} />
      <Stack.Screen name="EditContact" component={EditContactScreen} />
      <Stack.Screen name="SafetyTimer" component={SafetyTimerScreen} />
      <Stack.Screen name="EmergencyHistory" component={EmergencyHistoryScreen} />
      <Stack.Screen name="SafetyPrivacy" component={SafetyPrivacyScreen} />
      <Stack.Screen name="SafetyTools" component={SafetyToolsScreen} />
      <Stack.Screen name="ToolsTab" component={SafetyToolsScreen} />
      <Stack.Screen name="SafetyCircle" component={SafetyCircleScreen} />
      <Stack.Screen name="CircleTab" component={SafetyCircleScreen} />
      <Stack.Screen name="FakeCall" component={FakeCallScreen} />
      <Stack.Screen name="QuickExit" component={QuickExitScreen} />
      <Stack.Screen name="EmergencyQR" component={EmergencyQRScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  sosTabButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    elevation: 6,
    shadowColor: colors.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});

export default AppNavigator;
