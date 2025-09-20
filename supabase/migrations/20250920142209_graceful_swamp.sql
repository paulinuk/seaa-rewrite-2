-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  user_type ENUM('athlete', 'team_manager') NOT NULL,
  club VARCHAR(255),
  club_role VARCHAR(100),
  telephone VARCHAR(20),
  mobile VARCHAR(20),
  club_colours VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_user_type (user_type)
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date DATETIME NOT NULL,
  venue VARCHAR(255) NOT NULL,
  description TEXT,
  closing_date DATETIME NOT NULL,
  is_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_closing_date (closing_date),
  INDEX idx_is_open (is_open)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category ENUM('track', 'field', 'road') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category)
);

-- Age groups table
CREATE TABLE IF NOT EXISTS age_groups (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  min_age INT,
  max_age INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_age_range (min_age, max_age)
);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  meeting_id VARCHAR(36) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_meeting_id (meeting_id),
  INDEX idx_payment_status (payment_status)
);

-- Event registrations table (junction table for registration events)
CREATE TABLE IF NOT EXISTS event_registrations (
  id VARCHAR(36) PRIMARY KEY,
  registration_id VARCHAR(36) NOT NULL,
  event_id VARCHAR(36) NOT NULL,
  age_group_id VARCHAR(36) NOT NULL,
  personal_best VARCHAR(20),
  pb_venue VARCHAR(255),
  pb_date DATE,
  cost DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (age_group_id) REFERENCES age_groups(id) ON DELETE CASCADE,
  INDEX idx_registration_id (registration_id),
  INDEX idx_event_id (event_id),
  INDEX idx_age_group_id (age_group_id)
);

-- Insert default events
INSERT IGNORE INTO events (id, name, category) VALUES
('1', '100m', 'track'),
('2', '200m', 'track'),
('3', '400m', 'track'),
('4', '800m', 'track'),
('5', '1500m', 'track'),
('6', '5000m', 'track'),
('7', '10000m', 'track'),
('8', 'Long Jump', 'field'),
('9', 'High Jump', 'field'),
('10', 'Shot Put', 'field'),
('11', 'Discus', 'field'),
('12', 'Javelin', 'field');

-- Insert default age groups
INSERT IGNORE INTO age_groups (id, name, min_age, max_age) VALUES
('1', 'Under 15', NULL, 14),
('2', 'Under 17', NULL, 16),
('3', 'Under 20', NULL, 19),
('4', 'Senior', 20, 34),
('5', 'Veteran 35+', 35, 39),
('6', 'Veteran 40+', 40, 44),
('7', 'Veteran 45+', 45, 49),
('8', 'Veteran 50+', 50, NULL);

-- Insert sample meetings
INSERT IGNORE INTO meetings (id, name, date, venue, description, closing_date, is_open) VALUES
('1', 'Southern 6/4/3 Stage Road Relays 2025', '2025-09-20 10:00:00', 'Rushmoor Arena, Aldershot, Hants', 'Annual road relay championships', '2025-09-15 23:59:59', TRUE),
('2', 'SEAA Track & Field Championships', '2025-07-15 10:00:00', 'Bedford International Stadium', 'Regional track and field championships', '2025-12-31 23:59:59', TRUE),
('3', 'Southern Cross Country Championships', '2025-02-22 10:00:00', 'Parliament Hill, London', 'Cross country championships', '2025-02-15 23:59:59', TRUE);