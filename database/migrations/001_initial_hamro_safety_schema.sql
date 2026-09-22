-- Hamro Safety Mobile Application Database Schema
-- Company: Zuptrix Solutions Pvt. Ltd.
-- Tagline: "Your Safety. Our Priority."
-- Migration: 001_initial_hamro_safety_schema.sql

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. Users Profile Table (Extends auth.users)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    blood_group TEXT,
    medical_notes TEXT,
    emergency_pin_hash TEXT,
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Users can only see and update their own profile
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

--------------------------------------------------------------------------------
-- 2. Emergency Contacts Table
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    relationship TEXT NOT NULL,
    priority INT DEFAULT 1, -- 1: Primary, 2: Secondary, 3: Tertiary
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their emergency contacts"
    ON public.emergency_contacts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 3. Safety Circle Table (Permissions & Trusted Network)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.safety_circle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.emergency_contacts(id) ON DELETE CASCADE,
    member_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    member_name TEXT NOT NULL,
    member_phone TEXT NOT NULL,
    allow_sos_alerts BOOLEAN DEFAULT true,
    allow_emergency_location BOOLEAN DEFAULT true,
    allow_safety_timer_alerts BOOLEAN DEFAULT true,
    allow_status_updates BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.safety_circle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their safety circle"
    ON public.safety_circle FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Circle members can view authorizations"
    ON public.safety_circle FOR SELECT
    USING (auth.uid() = member_user_id);

--------------------------------------------------------------------------------
-- 4. Emergency Events Table (SOS & Escalations)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL DEFAULT 'sos' CHECK (event_type IN ('sos', 'safety_timer', 'manual_panic', 'fall_detected', 'test')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('activating', 'active', 'acknowledged', 'resolved', 'cancelled', 'failed', 'expired')),
    triggered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMPTZ,
    trigger_source TEXT DEFAULT 'hold_button',
    resolution_note TEXT,
    initial_latitude DOUBLE PRECISION,
    initial_longitude DOUBLE PRECISION,
    initial_accuracy DOUBLE PRECISION,
    battery_level INT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their emergency events"
    ON public.emergency_events FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Authorized safety circle members can view active emergency events
CREATE POLICY "Safety circle members can view active emergency events"
    ON public.emergency_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.safety_circle sc
            WHERE sc.user_id = public.emergency_events.user_id
              AND sc.member_user_id = auth.uid()
              AND sc.allow_sos_alerts = true
              AND sc.status = 'active'
        )
    );

--------------------------------------------------------------------------------
-- 5. Location Updates Table (Private & Temporal Emergency Breadcrumbs)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.location_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.emergency_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    altitude DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    battery_percentage INT,
    recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.location_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can record and view their own location updates"
    ON public.location_updates FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authorized safety circle can view emergency location"
    ON public.location_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.emergency_events ee
            JOIN public.safety_circle sc ON sc.user_id = ee.user_id
            WHERE ee.id = public.location_updates.event_id
              AND ee.status = 'active'
              AND sc.member_user_id = auth.uid()
              AND sc.allow_emergency_location = true
              AND sc.status = 'active'
        )
    );

--------------------------------------------------------------------------------
-- 6. Safety Timers Table
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.safety_timers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    destination TEXT,
    duration_minutes INT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed_safe', 'expired_escalated', 'cancelled')),
    check_in_note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.safety_timers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their safety timers"
    ON public.safety_timers FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 7. Notifications Log Table (Audit trail of real and demo notifications)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.emergency_events(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_contact TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'push', 'email', 'in_app', 'mock')),
    message TEXT NOT NULL,
    delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'mock_delivered')),
    is_mock BOOLEAN DEFAULT false,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 8. Emergency Evidence Table (Photos, Audio, Sensor snapshots)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.emergency_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('audio', 'photo', 'sensor_log')),
    file_size_bytes BIGINT,
    captured_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.emergency_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their emergency evidence"
    ON public.emergency_evidence FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- Indexes for Performance & Realtime Queries
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_circle_user_id ON public.safety_circle(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_user_status ON public.emergency_events(user_id, status);
CREATE INDEX IF NOT EXISTS idx_location_updates_event_id ON public.location_updates(event_id);
CREATE INDEX IF NOT EXISTS idx_safety_timers_user_status ON public.safety_timers(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
