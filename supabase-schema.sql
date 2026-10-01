-- ==============================================================================
-- HAMRO SAFETY - COMPLETE SUPABASE DATABASE SCHEMA & REALTIME SETUP
-- Company: Zuptrix Solutions Pvt. Ltd.
-- Tagline: "Your Safety. Our Priority."
-- Description: Execute this script in the Supabase SQL Editor to provision all
--              tables, security policies, triggers, and realtime publications.
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- PROFILES TABLE (User profiles synced with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone_number TEXT,
    blood_group TEXT,
    medical_notes TEXT,
    preferred_language TEXT DEFAULT 'en',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PROFILES TABLE (Emergency Information & Health Notes)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    blood_group TEXT,
    medical_notes TEXT,
    emergency_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMERGENCY CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    relationship TEXT DEFAULT 'Family',
    priority INT DEFAULT 1,
    is_in_circle BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAFETY CIRCLE TABLE
CREATE TABLE IF NOT EXISTS public.safety_circle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.emergency_contacts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    allow_sos_alerts BOOLEAN DEFAULT TRUE,
    allow_emergency_location BOOLEAN DEFAULT TRUE,
    allow_safety_timer_alerts BOOLEAN DEFAULT TRUE,
    allow_status_updates BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active',
    status_text TEXT DEFAULT 'Active in Safety Circle',
    battery_level INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_contact_circle UNIQUE (contact_id)
);

-- EMERGENCY EVENTS TABLE (Active SOS Alerts & Telemetry Triggers)
CREATE TABLE IF NOT EXISTS public.emergency_events (
    id TEXT PRIMARY KEY DEFAULT ('evt-' || extract(epoch from now())::bigint::text),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT DEFAULT 'sos',
    status TEXT DEFAULT 'active', -- 'active', 'resolved', 'cancelled', 'activating'
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    trigger_source TEXT DEFAULT 'hold_button',
    initial_latitude DOUBLE PRECISION,
    initial_longitude DOUBLE PRECISION,
    initial_accuracy DOUBLE PRECISION,
    battery_level INT,
    location_name TEXT DEFAULT 'Current Device GPS',
    resolved_at TIMESTAMPTZ,
    resolution_note TEXT,
    safe_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOCATION UPDATES TABLE (Real-time GPS Telemetry Stream)
CREATE TABLE IF NOT EXISTS public.location_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT REFERENCES public.emergency_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION DEFAULT 4.0,
    battery_level INT,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAFETY TIMERS TABLE (Timed Trip & Journey Monitoring)
CREATE TABLE IF NOT EXISTS public.safety_timers (
    id TEXT PRIMARY KEY DEFAULT ('timer-' || extract(epoch from now())::bigint::text),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Trip Monitor',
    destination TEXT DEFAULT 'Home',
    duration_minutes INT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'completed_safe', 'expired_escalated', 'cancelled'
    check_in_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMERGENCY EVIDENCE TABLE (Feature 12 - Encrypted Audio/Video Streams)
CREATE TABLE IF NOT EXISTS public.emergency_evidence (
    id TEXT PRIMARY KEY DEFAULT ('evd-' || extract(epoch from now())::bigint::text),
    event_id TEXT REFERENCES public.emergency_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    evidence_type TEXT DEFAULT 'AUDIO', -- 'AUDIO', 'VIDEO', 'SNAPSHOT'
    storage_path TEXT,
    status TEXT DEFAULT 'RECORDING', -- 'RECORDING', 'SECURED', 'UPLOADED', 'CANCELLED'
    notes TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS LOG TABLE (SMS & Alert Audit Trail)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id TEXT REFERENCES public.emergency_events(id) ON DELETE CASCADE,
    recipient_name TEXT,
    recipient_contact TEXT,
    channel TEXT DEFAULT 'sms',
    message TEXT,
    delivery_status TEXT,
    is_mock BOOLEAN DEFAULT TRUE,
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_circle_user_id ON public.safety_circle(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_user_id ON public.emergency_events(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_status ON public.emergency_events(status);
CREATE INDEX IF NOT EXISTS idx_location_updates_event_id ON public.location_updates(event_id);
CREATE INDEX IF NOT EXISTS idx_safety_timers_user_id ON public.safety_timers(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_timers_status ON public.safety_timers(status);
CREATE INDEX IF NOT EXISTS idx_emergency_evidence_event_id ON public.emergency_evidence(event_id);
CREATE INDEX IF NOT EXISTS idx_emergency_evidence_user_id ON public.emergency_evidence(user_id);

-- ==============================================================================
-- 4. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone_number)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Hamro Safety User'),
        NEW.raw_user_meta_data->>'phone_number'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_profiles (id, name, emergency_phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Hamro Safety User'),
        NEW.raw_user_meta_data->>'phone_number'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Restricts access so users only access their own data, with anon support for demo testing
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_circle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
DROP POLICY IF EXISTS "Users can manage their own profiles" ON public.profiles;
CREATE POLICY "Users can manage their own profiles"
    ON public.profiles FOR ALL
    USING (auth.uid() = id OR auth.role() = 'anon');

-- User Profiles RLS
DROP POLICY IF EXISTS "Users can manage their own user_profiles" ON public.user_profiles;
CREATE POLICY "Users can manage their own user_profiles"
    ON public.user_profiles FOR ALL
    USING (auth.uid() = id OR auth.role() = 'anon');

-- Emergency Contacts RLS
DROP POLICY IF EXISTS "Users can manage emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Users can manage emergency contacts"
    ON public.emergency_contacts FOR ALL
    USING (auth.uid() = user_id OR auth.role() = 'anon');

-- Safety Circle RLS
DROP POLICY IF EXISTS "Users can manage safety circle" ON public.safety_circle;
CREATE POLICY "Users can manage safety circle"
    ON public.safety_circle FOR ALL
    USING (auth.uid() = user_id OR auth.role() = 'anon');

-- Emergency Events RLS
DROP POLICY IF EXISTS "Users can manage emergency events" ON public.emergency_events;
CREATE POLICY "Users can manage emergency events"
    ON public.emergency_events FOR ALL
    USING (auth.uid() = user_id OR auth.role() = 'anon');

-- Location Updates RLS
DROP POLICY IF EXISTS "Users can manage location updates" ON public.location_updates;
CREATE POLICY "Users can manage location updates"
    ON public.location_updates FOR ALL
    USING (auth.uid() = user_id OR auth.role() = 'anon');

-- Safety Timers RLS
DROP POLICY IF EXISTS "Users can manage safety timers" ON public.safety_timers;
CREATE POLICY "Users can manage safety timers"
    ON public.safety_timers FOR ALL
    USING (auth.uid() = user_id OR auth.role() = 'anon');

-- Emergency Evidence RLS
DROP POLICY IF EXISTS "Users can manage emergency evidence" ON public.emergency_evidence;
CREATE POLICY "Users can manage emergency evidence"
    ON public.emergency_evidence FOR ALL
    USING (auth.uid() = user_id OR auth.role() = 'anon');

-- Notifications Log RLS
DROP POLICY IF EXISTS "Users can manage notifications" ON public.notifications;
CREATE POLICY "Users can manage notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id OR auth.role() = 'anon');

-- ==============================================================================
-- 6. SUPABASE REALTIME PUBLICATION SETUP
-- Enables Supabase Realtime subscriptions for emergency events & location updates
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'location_updates'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.location_updates;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'emergency_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_events;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'safety_circle'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_circle;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'safety_timers'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_timers;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'emergency_evidence'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_evidence;
    END IF;
END $$;

-- ==============================================================================
-- 7. SUPABASE STORAGE (EMERGENCY EVIDENCE BUCKET & RLS POLICIES)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('emergency-evidence', 'emergency-evidence', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own evidence" ON storage.objects;
CREATE POLICY "Users can upload their own evidence"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'emergency-evidence' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can read own evidence" ON storage.objects;
CREATE POLICY "Users can read own evidence"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'emergency-evidence' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

NOTIFY pgrst, 'reload schema';
