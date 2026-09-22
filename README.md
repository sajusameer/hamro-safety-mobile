# Hamro Safety

> **"Your Safety. Our Priority."**  
> Developed by **Zuptrix Solutions Pvt. Ltd.**

A React Native mobile application built with Expo and Supabase for personal protection, real-time emergency dispatch, and trusted safety network management.

---

## 1. Features Overview

* **Deliberate SOS Emergency Dispatch**: 3-second hold-to-activate interaction to prevent false alarms, capturing live GPS coordinates, accuracy, and battery telemetry.
* **Privacy-First Location**: Background location is strictly limited to active emergencies and ongoing safety timers. Location data is never broadcast publicly.
* **Granular Safety Circle**: Manage permissions for each trusted contact (SOS alerts, live GPS tracking, safety timer overdue warnings, and "I'm Safe" check-in notifications).
* **Safety Arrival Timer**: Countdowns for solo travel (cabs, late-night walks) with one-tap "I'm Safe" check-ins and automatic escalation to full SOS if overdue.
* **Discreet Safety Tools**:
  * **Fake Call Simulator**: Realistic incoming and connected call interface with ring vibration to discreetly exit uncomfortable situations without impersonating emergency services.
  * **Quick Exit Screen**: Camouflaged notepad screen that hides the app while preserving background safety monitoring.
  * **Emergency ICE QR**: Lockscreen-accessible medical triage card (blood type, emergency contact, allergies) without exposing private account details.
* **Emergency Audit History**: Private chronological log of past alerts and resolutions with clear data purge controls.
* **PostgreSQL Row-Level Security (RLS)**: Prepared database migrations ensuring users and guardians only access explicitly authorized records.
* **Offline / Demo Resilience**: Automatically switches between Supabase cloud backend and an in-memory mock store when credentials are unconfigured.

---

## 2. Technology Stack

* **Platform**: React Native, Expo (SDK 57)
* **Language**: JavaScript (ES6+ / React 19)
* **Backend**: Supabase (Auth, PostgreSQL, Realtime, Storage)
* **Navigation**: React Navigation 7 (Native Stack & Bottom Tabs)
* **Location**: Expo Location
* **Storage**: Expo SecureStore for encrypted auth session persistence
* **Icons**: `@expo/vector-icons` (Ionicons)

---

## 3. Folder Structure

```
hamro-safety/
├── App.js                         # Root application entry point with context providers
├── app.json                       # Expo configuration & permission definitions
├── package.json                   # Dependencies and scripts
├── .env.example                   # Environment variable template
├── README.md                      # Documentation
├── database/
│   └── migrations/
│       └── 001_initial_hamro_safety_schema.sql  # Supabase PostgreSQL schema with RLS
└── src/
    ├── lib/
    │   └── supabase.js            # Supabase client with offline demo fallback
    ├── theme/
    │   ├── colors.js              # Accessible safety palette (Green, Amber, Red)
    │   ├── typography.js          # Font scale & weights
    │   ├── spacing.js             # 48px accessible touch targets & spacing
    │   └── index.js
    ├── constants/
    │   ├── config.js              # App & company metadata (Zuptrix Solutions)
    │   └── safetyStates.js        # SAFE, SOS_ACTIVATING, SOS_ACTIVE, ACKNOWLEDGED, RESOLVED
    ├── context/
    │   ├── AuthContext.js         # Session persistence & state listener
    │   ├── EmergencyContext.js    # Global SOS emergency lifecycle
    │   └── SafetyTimerContext.js  # Background arrival timer & auto-escalation
    ├── navigation/
    │   ├── RootNavigator.js       # Dynamic Auth vs App switcher
    │   ├── AuthNavigator.js       # Login, Register, Forgot Password
    │   └── AppNavigator.js        # Bottom Tabs (Home, Contacts, SOS, Circle, Profile) + Stack
    ├── components/
    │   ├── common/
    │   │   ├── Button.js          # Accessible buttons with loading & icon support
    │   │   ├── Input.js           # Inputs with label, icon, and error validation
    │   │   ├── ScreenContainer.js # Safe area container with scrolling
    │   │   ├── StatusBadge.js     # Text + icon badge (never color alone)
    │   │   ├── LoadingState.js    # Loading indicator
    │   │   ├── EmptyState.js      # Empty state with action
    │   │   ├── ErrorState.js      # Error card with retry
    │   │   └── SectionHeader.js   # Section title with link
    │   ├── safety/
    │   │   ├── SOSButton.js       # 3-second hold-to-activate button
    │   │   └── TimerCard.js       # Live countdown card
    │   ├── emergency/
    │   │   └── EmergencyCard.js   # Active emergency banner with delivery verification
    │   └── contacts/
    │       └── ContactCard.js     # Contact card with direct dial & permission badges
    ├── services/
    │   ├── auth/authService.js
    │   ├── sos/sosService.js
    │   ├── contacts/contactsService.js
    │   ├── safetyCircle/safetyCircleService.js
    │   ├── safetyTimer/safetyTimerService.js
    │   ├── location/locationService.js
    │   ├── history/historyService.js
    │   └── profile/profileService.js
    ├── data/
    │   └── mock/
    │       ├── mockContacts.js
    │       ├── mockEmergencyEvents.js
    │       └── mockServices.js    # Transparent mock adapters with [DEMO] labeling
    └── screens/
        ├── auth/
        │   ├── LoginScreen.js
        │   ├── RegisterScreen.js
        │   └── ForgotPasswordScreen.js
        ├── dashboard/
        │   └── DashboardScreen.js
        ├── sos/
        │   └── SOSScreen.js
        ├── contacts/
        │   ├── ContactListScreen.js
        │   ├── AddContactScreen.js
        │   └── EditContactScreen.js
        ├── safetyCircle/
        │   └── SafetyCircleScreen.js
        ├── safetyTimer/
        │   └── SafetyTimerScreen.js
        ├── history/
        │   └── EmergencyHistoryScreen.js
        ├── profile/
        │   ├── ProfileScreen.js
        │   └── EditProfileScreen.js
        ├── privacy/
        │   └── SafetyPrivacyScreen.js
        └── tools/
            ├── SafetyToolsScreen.js
            ├── FakeCallScreen.js
            ├── QuickExitScreen.js
            └── EmergencyQRScreen.js
```

---

## 4. Setup & Running Instructions

### Prerequisites
* Node.js (v18+)
* npm (v9+)
* Expo Go app on iOS or Android (or emulator)

### Installation
1. Navigate to the project directory:
   ```bash
   cd hamro-safety
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your Supabase project credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   ```
   *(If left empty or using placeholders, the app automatically runs in Demo Mode with mock data).*

### Running the App
* **Start Metro Bundler**:
  ```bash
  npx expo start
  ```
* **Android**: Press `a` or run `npx expo start --android`
* **iOS**: Press `i` or run `npx expo start --ios`
* **Web Preview**: Press `w` or run `npx expo start --web`

---

## 5. Supabase Database & Migrations

To apply the database schema to your Supabase project:
1. Open the [Supabase Dashboard](https://app.supabase.com).
2. Go to the **SQL Editor**.
3. Open and run the migration script located at:
   `database/migrations/001_initial_hamro_safety_schema.sql`

This creates the tables with complete Row Level Security (RLS):
* `public.users`
* `public.emergency_contacts`
* `public.safety_circle`
* `public.emergency_events`
* `public.location_updates`
* `public.safety_timers`
* `public.notifications`
* `public.emergency_evidence`

---

## 6. Current Mock Integrations vs Production Roadmap

| Integration | Current State | Production Plan |
| :--- | :--- | :--- |
| **Authentication** | Supabase Auth + Demo login fallback | Supabase Email/Password + Google OAuth |
| **SMS Alerts** | Simulated mock in console with timestamps | Twilio / Sparrow SMS (Nepal) |
| **Push Notifications** | Local simulated queued alerts | Expo Push Notifications / FCM |
| **Maps & Geocoding** | Simulated Kathmandu coordinates | Google Maps API / Mapbox SDK |
| **Emergency Dispatch** | Standby mock protocol with 100/102/103 dials | Authorized local dispatch API integration |

---

## 7. License & Credits

Copyright © 2026 **Zuptrix Solutions Pvt. Ltd.**  
All rights reserved. "Your Safety. Our Priority."
