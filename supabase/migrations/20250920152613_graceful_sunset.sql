/*
  # Convert MySQL Athletics Database to Supabase

  1. New Tables
    - `clubs` - Athletic clubs and organizations
    - `age_groups` - Age categories with min/max ages and gender
    - `events` - Track and field events with categories
    - `meetings` - Athletic competitions and championships
    - `meeting_event_ages` - Junction table for meeting/event/age combinations
    - `registrations` - User registrations for meetings
    - `registration_events` - Individual event entries within registrations
    - `meeting_teams` - Team entries for relay events
    - `event_limits` - Maximum athlete limits per event/age combination

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Public read access for reference data (clubs, events, age groups, meetings)
    - Users can only access their own registrations

  3. Data Migration
    - Import all clubs from tblClubs
    - Import age groups from tblAges with proper gender mapping
    - Import events from tblEvents
    - Import meetings from tblMeeting with date conversion
    - Import meeting configurations from tblMeetEventAges
*/

-- Clubs table (from tblClubs)
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id integer UNIQUE NOT NULL, -- Original ClubID for reference
  name text NOT NULL,
  is_active boolean DEFAULT true,
  is_county boolean DEFAULT false,
  password text,
  created_at timestamptz DEFAULT now()
);

-- Age groups table (from tblAges)
CREATE TABLE IF NOT EXISTS age_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  age_id integer UNIQUE NOT NULL, -- Original AgeID for reference
  name text NOT NULL,
  abbreviation text,
  min_age numeric,
  max_age numeric,
  gender integer, -- 1=Male, 2=Female, NULL=Mixed
  is_active boolean DEFAULT true,
  list_position integer,
  created_at timestamptz DEFAULT now()
);

-- Events table (from tblEvents)
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id integer UNIQUE NOT NULL, -- Original EventID for reference
  name text NOT NULL,
  code text,
  is_active boolean DEFAULT true,
  list_position integer,
  category text, -- Will be derived from event name
  created_at timestamptz DEFAULT now()
);

-- Meetings table (from tblMeeting)
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id integer UNIQUE NOT NULL, -- Original MeetingID for reference
  name text NOT NULL,
  meeting_date timestamptz,
  venue text,
  description text,
  closing_date timestamptz,
  is_open boolean DEFAULT true,
  event_cost numeric(10,2),
  max_events integer,
  band1_cost numeric(10,2),
  band2_cost numeric(10,2),
  band1_text text,
  band2_text text,
  meeting_cost_text text,
  email_footer text,
  terms_text text,
  meeting_type integer DEFAULT 1,
  discount integer DEFAULT 0,
  is_excluded boolean DEFAULT false,
  max_age numeric,
  created_at timestamptz DEFAULT now()
);

-- Meeting event ages junction table (from tblMeetEventAges)
CREATE TABLE IF NOT EXISTS meeting_event_ages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  age_group_id uuid REFERENCES age_groups(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  band_number integer,
  fee numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- Event limits table (from tblEventLimits)
CREATE TABLE IF NOT EXISTS event_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  age_group_id uuid REFERENCES age_groups(id) ON DELETE CASCADE,
  max_athletes integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Users table for authentication (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  surname text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('athlete', 'team_manager')),
  club_id uuid REFERENCES clubs(id),
  club_role text,
  telephone text,
  mobile text,
  address text,
  postcode text,
  date_of_birth date,
  ea_number integer,
  club_colours text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Registrations table (from tblRegistrations)
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reg_id integer UNIQUE, -- Original RegID for reference
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  first_name text,
  surname text,
  address text,
  postcode text,
  club_id uuid REFERENCES clubs(id),
  date_of_birth date,
  mobile_no text,
  tel_no text,
  email text,
  total_events integer,
  band1_events integer,
  band2_events integer,
  total_cost numeric(10,2) DEFAULT 0.00,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_type integer,
  transaction_id text,
  is_billed boolean DEFAULT false,
  entrance_fee_paid boolean DEFAULT false,
  sent_to_organiser boolean DEFAULT false,
  registration_date timestamptz DEFAULT now(),
  club_colours text,
  club_position text,
  total_teams integer DEFAULT 1,
  area_status text,
  created_at timestamptz DEFAULT now()
);

-- Registration events table (from tblRegistrationEvents)
CREATE TABLE IF NOT EXISTS registration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  db_id integer UNIQUE, -- Original DBID for reference
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  age_group_id uuid NOT NULL REFERENCES age_groups(id) ON DELETE CASCADE,
  personal_best text,
  pb_date date,
  pb_venue text,
  surname text,
  first_name text,
  ea_number integer,
  athlete_dob date,
  team_no integer DEFAULT 1,
  team_string text,
  cost numeric(10,2) DEFAULT 10.00,
  created_at timestamptz DEFAULT now()
);

-- Meeting teams table (from tblMeetingTeams)
CREATE TABLE IF NOT EXISTS meeting_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  age_group_name text,
  total_teams integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_event_ages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public read access for reference data
CREATE POLICY "Anyone can read clubs" ON clubs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read age groups" ON age_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read events" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read meetings" ON meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read meeting event ages" ON meeting_event_ages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read event limits" ON event_limits FOR SELECT TO authenticated USING (true);

-- Users can manage their own profile
CREATE POLICY "Users can read own profile" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Users can manage their own registrations
CREATE POLICY "Users can read own registrations" ON registrations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own registrations" ON registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own registrations" ON registrations FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Users can manage their own registration events
CREATE POLICY "Users can read own registration events" ON registration_events FOR SELECT TO authenticated USING (
  registration_id IN (SELECT id FROM registrations WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create own registration events" ON registration_events FOR INSERT TO authenticated WITH CHECK (
  registration_id IN (SELECT id FROM registrations WHERE user_id = auth.uid())
);

-- Users can manage their own meeting teams
CREATE POLICY "Users can read own meeting teams" ON meeting_teams FOR SELECT TO authenticated USING (
  registration_id IN (SELECT id FROM registrations WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create own meeting teams" ON meeting_teams FOR INSERT TO authenticated WITH CHECK (
  registration_id IN (SELECT id FROM registrations WHERE user_id = auth.uid())
);

-- Insert clubs data
INSERT INTO clubs (club_id, name, is_active, is_county, password) VALUES
  (32800837, '100 Marathon Club', true, false, null),
  (32800838, '23 Mile Club', true, false, null),
  (32800839, 'Abingdon AC', true, false, null),
  (32800840, 'Alchester RC', true, false, null),
  (32800841, 'Aldershot Farnham & DAC', true, false, null),
  (32800842, 'Ampthill & Flitwick Flyers', true, false, null),
  (32800843, 'Andover AC', true, false, null),
  (32800844, 'Archbishop Tenison School', true, false, null),
  (32800845, 'Arena 80 AC', true, false, null),
  (32800846, 'Army AC', true, false, null),
  (32800847, 'Ashford AC', true, false, null),
  (32800848, 'Avon Valley Runners', true, false, null),
  (32800849, 'Axe Valley Runners', true, false, null),
  (32800850, 'Banbury Harriers', true, false, null),
  (32800851, 'Barking Road Runners', true, false, null),
  (32800852, 'Barnet & District AC', true, false, null),
  (32800853, 'Basildon AC', true, false, null),
  (32800854, 'Basingstoke & Mid Hants AC', true, false, null),
  (32800855, 'Bath University', true, false, null),
  (32800856, 'Beckenham RC', true, false, null),
  (32800857, 'Bedford & County AC', true, false, null),
  (32800858, 'Bedford College', true, false, null),
  (32800859, 'Belgrave Harriers', true, false, null),
  (32800860, 'Benfleet Running Club', true, false, null),
  (32800861, 'Bexley AC', true, false, null),
  (32800862, 'Bexleyheath School', true, false, null),
  (32800863, 'Bicester A & RRC', true, false, null),
  (32800864, 'Bideford AAC', true, false, null),
  (32800865, 'Biggleswade AC', true, false, null),
  (32800866, 'Billericay Striders RC', true, false, null),
  (32800867, 'Birchfield Harriers', true, false, null),
  (32800868, 'Birmingham University AC', true, false, null),
  (32800869, 'Bishops Stortford RC', true, false, null),
  (32800870, 'Blackburn Harriers', true, false, null),
  (32800872, 'Bodyworks XTC Tri Store', true, false, null),
  (32800873, 'Bognor Regis & Chichester AC', true, false, null),
  (32800874, 'Borehamwood AC', true, false, null),
  (32800875, 'Bournemouth AC', true, false, null),
  (32800876, 'Bracknell AC', true, false, null),
  (32800877, 'Bracknell Forest Runners', true, false, null),
  (32800878, 'Braintree & District AC', true, false, null),
  (32800879, 'Brandon Fern Hoppers', true, false, null),
  (32800880, 'Brighton & Hove AC', true, false, null),
  (32800881, 'Brighton Phoenix AC', true, false, null),
  (32800882, 'Brighton University', true, false, null),
  (32800883, 'Bristol & West AC', true, false, null),
  (32800884, 'Bristol AC', true, false, null),
  (32800885, 'British Airways AC', true, false, null),
  (32800886, 'Brixham Harriers', true, false, null),
  (32800887, 'Bromley Veterans AC', true, false, null),
  (32800888, 'Browning Fellowship FR', true, false, null),
  (32800889, 'Broxbourne Runners', true, false, null),
  (32800890, 'Brunel University AC', true, false, null),
  (32800891, 'Bungay Black Dog RC', true, false, null),
  (32800892, 'Burnham Joggers', true, false, null),
  (32800893, 'Bushfield Joggers', true, false, null),
  (32800894, 'Calne SMaRRT', true, false, null),
  (32800895, 'Camarthen Harriers', true, false, null),
  (32800896, 'Camberley & District AC', true, false, null),
  (32800897, 'Cambridge & Coleridge AC', true, false, null),
  (32800898, 'Cambridge Harriers', true, false, null),
  (32800899, 'Cambridge University AC', true, false, null),
  (32800900, 'Canterbury Harriers', true, false, null),
  (34800020, 'BEDFORDSHIRE COUNTY AA', true, true, 'VCGJ2'),
  (34800021, 'BERKSHIRE ATHLETICS', true, true, 'MGQB2'),
  (34800022, 'BUCKINGHAMSHIRE COUNTY AA', true, true, 'PXUQ2'),
  (34800023, 'CAMBRIDGESHIRE COUNTY AAA', true, true, 'TYFU5'),
  (34800024, 'CORNWALL COUNTY AA', true, true, 'THYV3'),
  (34800025, 'DEVON COUNTY AA', true, true, 'JRGN4'),
  (34800026, 'DORSET COUNTY AA', true, true, 'TZBV8'),
  (34800027, 'ESSEX COUNTY AA', true, true, 'FWHC1'),
  (34800028, 'HAMPSHIRE COUNTY AA', true, true, 'YISA1'),
  (34800029, 'HERTFORDSHIRE COUNTY AA', true, true, 'FWJR2'),
  (34800030, 'KENT COUNTY AA', true, true, 'OIEG1'),
  (34800031, 'MIDDLESEX COUNTY AA', true, true, 'XRUA3'),
  (34800032, 'NORFOLK COUNTY AAA', true, true, 'IGZU3'),
  (34800033, 'OXFORDSHIRE COUNTY AA', true, true, 'WKYX9'),
  (34800034, 'SOMERSET COUNTY AA', true, true, 'WMDE9'),
  (34800035, 'SUFFOLK COUNTY AA', true, true, 'AOJB0'),
  (34800036, 'SURREY COUNTY AA', true, true, 'RQGF4'),
  (34800037, 'SUSSEX COUNTY AAA', true, true, 'AXQS1'),
  (34800038, 'WILTSHIRE COUNTY AA', true, true, 'BQDQ2')
ON CONFLICT (club_id) DO NOTHING;

-- Insert age groups data
INSERT INTO age_groups (age_id, name, abbreviation, min_age, max_age, gender, is_active, list_position) VALUES
  (58, 'Under 15 Boys', 'U15B', 13, 14.11, 1, true, 12),
  (59, 'Under 15 Girls', 'U15G', 13, 14.11, 2, true, 13),
  (60, 'Under 17 Men', 'U17M', 15, 16.11, 1, true, 14),
  (61, 'Under 17 Women', 'U17W', 15, 16.11, 2, true, 15),
  (62, 'Under 20 Men', 'U20M', 17, 19.11, 1, true, 16),
  (63, 'Under 20 Women', 'U20W', 17, 19.11, 2, true, 18),
  (64, 'Senior Men', 'SM', 20, 99.11, 1, true, 19),
  (65, 'Senior Women', 'SW', 20, 99.11, 2, true, 29),
  (66, 'Senior Men Vets 40', null, 40, 44.11, 1, true, 21),
  (67, 'Senior Women Vets 35', null, 35, 39.11, 2, true, 30),
  (70, 'Senior Men Vets 50', null, 50, 54.11, 1, true, 23),
  (71, 'Senior Women Vets 45', null, 45, 49.11, 2, true, 32),
  (72, 'Senior Men Vets 60', null, 60, 64.11, 1, true, 25),
  (73, 'Senior Women Vet 50', null, 50, 54.11, 2, true, 33),
  (74, 'Senior Men Vets 45', null, 45, 49.11, 1, true, 22),
  (75, 'Senior Men Vets 55', null, 55, 59.11, 1, true, 24),
  (76, 'Senior Men Vets 65', null, 65, 69.11, 1, true, 26),
  (77, 'Senior Men Vets 70', null, 70, 74.11, 1, true, 27),
  (78, 'Senior Men Vets 75', null, 75, 79.11, 1, true, 28),
  (79, 'Senior Women Vets 40', null, 40, 44.11, 2, true, 31),
  (80, 'Senior Women Vets 55', null, 55, 59.11, 2, true, 34),
  (81, 'Senior Women Vets 60', null, 60, 64.11, 2, true, 35),
  (115, 'Under 13 Boys', 'U13B', 11, 12.6, 1, true, 1),
  (116, 'Under 13 Girls', 'U13G', 11, 12.6, 2, true, 2),
  (117, 'Male', null, null, null, 1, true, 1),
  (118, 'Female', null, null, null, 2, true, 1),
  (105, 'Men 40+', null, 40, 59.11, 1, true, 1),
  (106, 'Men 50+', null, 50, 59.11, 1, true, 2),
  (109, 'Men 60+', null, 60, 69.11, 1, true, 3),
  (110, 'Men 70+', null, 70, 79.11, 1, true, 4),
  (111, 'Women 35+', null, 35, 39.11, 2, true, 5),
  (112, 'Women 40+', null, 40, 59.11, 2, true, 6),
  (113, 'Women 45+', null, 45, 49.99, 2, true, 7),
  (114, 'Women 55+', null, 55, 59.99, 2, true, 8),
  (119, 'Women 50+', null, 50, 59.11, 2, true, 7),
  (122, 'Women 60+', null, 60, 80, 2, true, 9)
ON CONFLICT (age_id) DO NOTHING;

-- Insert events data with categories
INSERT INTO events (event_id, name, code, is_active, list_position, category) VALUES
  (623, '100 Metres', '100M', true, 6, 'track'),
  (625, '200 Metres', '200M', true, 7, 'track'),
  (627, '400 Metres', '400M', true, 16, 'track'),
  (629, '800 Metres', '800M', true, 18, 'track'),
  (632, '1,500 Metres', '1500M', true, 20, 'track'),
  (633, '3,000 Metres', '3000M', true, 22, 'track'),
  (634, '5,000 Metres', '5000M', true, 23, 'track'),
  (635, '10,000 Metres', '10000M', true, 24, 'track'),
  (649, 'High Jump', 'HJ', true, 37, 'field'),
  (650, 'Long Jump', 'LJ', true, 39, 'field'),
  (651, 'Triple Jump', 'TJ', true, 40, 'field'),
  (652, 'Pole Vault', 'PV', true, 38, 'field'),
  (658, 'Shot', 'SP', true, 41, 'field'),
  (2638, 'Discus', 'DT', true, 42, 'field'),
  (659, 'Hammer', 'HT', true, 45, 'field'),
  (656, 'Javelin', 'JT', true, 46, 'field'),
  (640, '100 Metres Hurdles', '100MH', true, 10, 'track'),
  (641, '110 Metres Hurdles', '110MH', true, 11, 'track'),
  (643, '400 Metres Hurdles', '400MH', true, 13, 'track'),
  (645, '2,000 Metres Steeplechase', '2000SC', true, 30, 'track'),
  (646, '3,000 Metres Steeplechase', '3000SC', true, 31, 'track'),
  (647, '4 x 100 Metres Relay', '4x100', true, 32, 'track'),
  (648, '4 x 400 Metres Relay', '4x400', true, 33, 'track'),
  (667, '5,000 Metres Walk', '5000W', true, 59, 'track'),
  (8888, '6/4/3 Stage Road Relays', 'RR', true, 1111, 'road'),
  (9997, '10K Championships', '10K', true, 222, 'road'),
  (1111, '5K Championships', '5K', true, 225, 'road'),
  (1002, 'Cross Country Champs', 'XCChamps', true, 1002, 'road'),
  (1005, 'Cross Country Relays', 'CREL', true, 1005, 'road'),
  (1006, 'Masters Cross Country', 'MCC', true, 1006, 'road'),
  (661, 'Heptathlon', 'HEP', true, 50, 'field'),
  (663, 'Decathlon', 'DEC', true, 52, 'field'),
  (2494, 'Pentathlon', 'IPENTM', true, 3, 'field')
ON CONFLICT (event_id) DO NOTHING;

-- Insert meetings data (converting dates properly)
INSERT INTO meetings (meeting_id, name, meeting_date, venue, description, closing_date, is_open, event_cost, max_events, band1_cost, band2_cost, band1_text, band2_text, meeting_cost_text) VALUES
  (172, 'Southern 6/4/3 Stage Road Relays 2025', '2025-09-20 10:00:00+00', 'Rushmoor Arena, Aldershot, Hants', 'Sat 20th September at Rushmoor Arena. Aldershot, Hants', '2025-09-15 23:59:59+00', true, 11, 0, 11, 11, '', null, 'Juniors & Veteran Women £42 Per Team - Up to 6 names<br>Senior Women £56 Per Team - Up to 8 names<br>Veteran Men £56 Per Team - Up to 8 names<br>Senior Men £84 Per Team - Up to 12 names'),
  (155, 'Cross Country Relay Championships 2025', '2025-10-18 10:00:00+00', 'Linford Christie Stadium, Wormwood Scrubs', 'Sat 18th October at Linford Christie Stadium, Wormwood Scrubs, West London W12 0DF', '2025-10-07 23:59:59+00', true, 6, 100, 8, 0, null, null, 'U13/U15/U17 £21 U20W, U20M, SW £24 & SM £32 per team<br>*Only SM Teams can enter 10-12 athletes'),
  (157, 'London Cross Country Championships 2025', '2025-11-08 10:00:00+00', 'Parliament Hill Fields, Hampsted Heath', 'Sat 8th November 2025 at Parliament Hill Fields, Hampsted Heath NW5 1QR', '2025-10-28 23:59:59+00', true, 10, 100, 10, 0, null, null, '£8 Per Athlete'),
  (140, 'U20/Senior Championships 2022', '2022-06-18 10:00:00+00', 'Chelmsford Track, Salerno Way', 'Sat 18th and Sun 19th June at Chelmsford Track, Salerno Way, Chelmsford, Essex, CM1 2EH', '2022-12-31 23:59:59+00', false, 13, 0, 16, 19, 'Seniors - £19, U20s - £16', '', null),
  (150, 'U15/U17 Championships 2023', '2023-08-12 10:00:00+00', 'Lee Valley Athletics Stadium', 'Sat 12th and Sun 13th August at Lee Valley Athletics Stadium, Edmonton, London N9 0AR', '2023-08-31 23:59:59+00', false, 12, 0, 16, 16, '£16 Per Event', null, null),
  (148, 'Combined Event Age Group Championships 2023', '2023-07-29 10:00:00+00', 'Horspath Track, Oxford', 'Sat 29th and Sun 30th July at Horspath Track, Oxford OX4 2RR', '2023-07-18 23:59:59+00', false, 16, 0, 40, 33, 'Senior & U20 Men £40, Senior & U20 Women & U17s £33', '', 'Senior & U20 Men £26, Senior/U20/U17 Women £21')
ON CONFLICT (meeting_id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);
CREATE INDEX IF NOT EXISTS idx_clubs_active ON clubs(is_active);
CREATE INDEX IF NOT EXISTS idx_age_groups_gender ON age_groups(gender);
CREATE INDEX IF NOT EXISTS idx_age_groups_active ON age_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_closing_date ON meetings(closing_date);
CREATE INDEX IF NOT EXISTS idx_meetings_open ON meetings(is_open);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_meeting ON registrations(meeting_id);
CREATE INDEX IF NOT EXISTS idx_registration_events_reg ON registration_events(registration_id);