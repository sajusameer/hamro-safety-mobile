// Hamro Safety - App Navigator (6 Tabs + Stack)
// Company: Zuptrix Solutions Pvt. Ltd.
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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

// 6-Tab Bottom Bar Architecture
const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#b6171e',
        tabBarInactiveTintColor: '#73777f',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      {/* 1. Home */}
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-sharp" size={22} color={color} />
          ),
        }}
      />

      {/* 2. Safety */}
      <Tab.Screen
        name="ToolsTab"
        component={SafetyToolsScreen}
        options={{
          tabBarLabel: 'Safety',
          tabBarIcon: ({ color }) => (
            <Ionicons name="shield-half-sharp" size={22} color={color} />
          ),
        }}
      />

      {/* 3. SOS (Raised Center Button: Rounded Square, "SOS" Text, No Label, Hidden Tab Bar on active screen) */}
      <Tab.Screen
        name="SOSTab"
        component={SOSScreen}
        options={{
          tabBarStyle: { display: 'none' },
          tabBarShowLabel: false,
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.sosTabButton,
                { backgroundColor: focused ? '#900C11' : '#b6171e' },
              ]}
            >
              <Text style={styles.sosTabText}>{'SOS\nSOS'}</Text>
            </View>
          ),
        }}
      />

      {/* 4. Circle */}
      <Tab.Screen
        name="CircleTab"
        component={SafetyCircleScreen}
        options={{
          tabBarLabel: 'Circle',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-sharp" size={22} color={color} />
          ),
        }}
      />

      {/* 5. History */}
      <Tab.Screen
        name="HistoryTab"
        component={EmergencyHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-sharp" size={22} color={color} />
          ),
        }}
      />

      {/* 6. Profile */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-sharp" size={22} color={color} />
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
      <Stack.Screen name="ContactsTab" component={ContactListScreen} />
      <Stack.Screen name="Contacts" component={ContactListScreen} />
      <Stack.Screen name="AddContact" component={AddContactScreen} />
      <Stack.Screen name="EditContact" component={EditContactScreen} />
      <Stack.Screen name="SafetyTimer" component={SafetyTimerScreen} />
      <Stack.Screen name="EmergencyHistory" component={EmergencyHistoryScreen} />
      <Stack.Screen name="HistoryTab" component={EmergencyHistoryScreen} />
      <Stack.Screen name="SafetyPrivacy" component={SafetyPrivacyScreen} />
      <Stack.Screen name="SafetyTools" component={SafetyToolsScreen} />
      <Stack.Screen name="ToolsTab" component={SafetyToolsScreen} />
      <Stack.Screen name="SafetyCircle" component={SafetyCircleScreen} />
      <Stack.Screen name="CircleTab" component={SafetyCircleScreen} />
      <Stack.Screen name="FakeCall" component={FakeCallScreen} />
      <Stack.Screen name="QuickExit" component={QuickExitScreen} />
      <Stack.Screen name="EmergencyQR" component={EmergencyQRScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ProfileTab" component={ProfileScreen} />
      <Stack.Screen name="DashboardTab" component={DashboardScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  sosTabButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#b6171e',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
    elevation: 4,
    shadowColor: '#b6171e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sosTabText: {
    fontSize: 13,
    lineHeight: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default AppNavigator;

