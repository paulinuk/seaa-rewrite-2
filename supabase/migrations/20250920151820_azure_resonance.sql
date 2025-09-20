/*
  # Athletics Registration System Database Schema

  1. New Tables
    - `users` - User accounts (athletes and team managers)
    - `meetings` - Athletic meetings/competitions
    - `events` - Track and field events
    - `age_groups` - Age categories for competitions
    - `registrations` - User registrations for meetings
    - `event_registrations` - Individual event entries within registrations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access based on user roles

  3. Sample Data
    - Default events (100m, 200m, etc.)
    - Age groups (Under 15, Under 17, etc.)
    - Sample meetings for 2025
*/

-- Users table for authentication and profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  surname text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('athlete', 'team_manager')),
  club text,
  club_role text,
  telephone text,
  mobile text,
  club_colours text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  meeting_date timestamptz NOT NULL,
  venue text NOT NULL,
  description text,
  closing_date timestamptz NOT NULL,
  is_open boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('track', 'field', 'road')),
  created_at timestamptz DEFAULT now()
);

-- Age groups table
CREATE TABLE IF NOT EXISTS age_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_age integer,
  max_age integer,
  created_at timestamptz DEFAULT now()
);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  total_cost decimal(10,2) NOT NULL DEFAULT 0.00,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event registrations table (junction table)
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  age_group_id uuid NOT NULL REFERENCES age_groups(id) ON DELETE CASCADE,
  personal_best text,
  pb_venue text,
  pb_date date,
  cost decimal(10,2) NOT NULL DEFAULT 10.00,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Everyone can read meetings, events, and age groups
CREATE POLICY "Anyone can read meetings"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read age groups"
  ON age_groups
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can read their own registrations
CREATE POLICY "Users can read own registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own registrations"
  ON registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can read their own event registrations
CREATE POLICY "Users can read own event registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (
    registration_id IN (
      SELECT id FROM registrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own event registrations"
  ON event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    registration_id IN (
      SELECT id FROM registrations WHERE user_id = auth.uid()
    )
  );

-- Insert default events
INSERT INTO events (name, category) VALUES
  ('100m', 'track'),
  ('200m', 'track'),
  ('400m', 'track'),
  ('800m', 'track'),
  ('1500m', 'track'),
  ('5000m', 'track'),
  ('10000m', 'track'),
  ('Long Jump', 'field'),
  ('High Jump', 'field'),
  ('Shot Put', 'field'),
  ('Discus', 'field'),
  ('Javelin', 'field')
ON CONFLICT DO NOTHING;

-- Insert default age groups
INSERT INTO age_groups (name, min_age, max_age) VALUES
  ('Under 15', NULL, 14),
  ('Under 17', NULL, 16),
  ('Under 20', NULL, 19),
  ('Senior', 20, 34),
  ('Veteran 35+', 35, 39),
  ('Veteran 40+', 40, 44),
  ('Veteran 45+', 45, 49),
  ('Veteran 50+', 50, NULL)
ON CONFLICT DO NOTHING;

-- Insert sample meetings
INSERT INTO meetings (name, meeting_date, venue, description, closing_date, is_open) VALUES
  (
    'Southern 6/4/3 Stage Road Relays 2025',
    '2025-09-20 10:00:00+00',
    'Rushmoor Arena, Aldershot, Hants',
    'Annual road relay championships',
    '2025-09-15 23:59:59+00',
    true
  ),
  (
    'SEAA Track & Field Championships',
    '2025-07-15 10:00:00+00',
    'Bedford International Stadium',
    'Regional track and field championships',
    '2025-12-31 23:59:59+00',
    true
  ),
  (
    'Southern Cross Country Championships',
    '2025-02-22 10:00:00+00',
    'Parliament Hill, London',
    'Cross country championships',
    '2025-02-15 23:59:59+00',
    true
  )
ON CONFLICT DO NOTHING;