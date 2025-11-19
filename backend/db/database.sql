CREATE DATABASE IF NOT EXISTS y4d_dashboard;
USE y4d_dashboard;

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Mentors table
CREATE TABLE IF NOT EXISTS mentors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  bio TEXT,
  image VARCHAR(255),
  social_links JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Management team table
CREATE TABLE IF NOT EXISTS management (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  bio TEXT,
  image VARCHAR(255),
  social_links JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Careers table
CREATE TABLE IF NOT EXISTS careers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requirements TEXT,
  location VARCHAR(255),
  type ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Media tables
CREATE TABLE IF NOT EXISTS newsletters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_path VARCHAR(255),
  published_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image VARCHAR(255),
  author VARCHAR(255),
  published_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE,
  time TIME,
  location VARCHAR(255),
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  author VARCHAR(255),
  image VARCHAR(255),
  tags JSON,
  published_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documentaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(255),
  thumbnail VARCHAR(255),
  duration INT,
  published_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'editor', 'viewer') DEFAULT 'viewer',
  status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT FALSE,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id INT,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Application Logs Table - Comprehensive logging for all application activities
CREATE TABLE IF NOT EXISTS application_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  level ENUM('info', 'success', 'warning', 'error', 'debug') NOT NULL DEFAULT 'info',
  type VARCHAR(100) NOT NULL COMMENT 'Type of log: login, create, update, delete, etc.',
  feature VARCHAR(100) NOT NULL COMMENT 'Feature/module name',
  message TEXT NOT NULL COMMENT 'Log message',
  user_id INT NULL COMMENT 'User who performed the action',
  ip_address VARCHAR(45) NULL COMMENT 'IP address of the request',
  user_agent TEXT NULL COMMENT 'User agent string',
  resource_type VARCHAR(100) NULL COMMENT 'Type of resource affected',
  resource_id INT NULL COMMENT 'ID of resource affected',
  metadata JSON NULL COMMENT 'Additional metadata in JSON format',
  request_method VARCHAR(10) NULL COMMENT 'HTTP method (GET, POST, etc.)',
  request_url VARCHAR(500) NULL COMMENT 'Request URL',
  status_code INT NULL COMMENT 'HTTP status code',
  response_time INT NULL COMMENT 'Response time in milliseconds',
  error_stack TEXT NULL COMMENT 'Error stack trace if applicable',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_level (level),
  INDEX idx_type (type),
  INDEX idx_feature (feature),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_resource (resource_type, resource_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  username_attempted VARCHAR(255) NULL,
  ip_address VARCHAR(100),
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- New registration requests table
CREATE TABLE registration_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  mobile_number VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add mobile_number and address to users table
ALTER TABLE users 
ADD COLUMN mobile_number VARCHAR(20) AFTER email,
ADD COLUMN address TEXT AFTER mobile_number;

-- Add notification system table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
DROP TABLE IF EXISTS newsletters, stories, blogs, events, documentaries;

CREATE TABLE newsletters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500),
  published_date DATE NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE stories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  image VARCHAR(500),
  author VARCHAR(255),
  published_date DATE NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  location VARCHAR(500),
  image VARCHAR(500),
  published_date DATE NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  image VARCHAR(500),
  author VARCHAR(255),
  tags JSON,
  published_date DATE NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE documentaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500) NOT NULL,
  thumbnail VARCHAR(500),
  duration VARCHAR(50),
  published_date DATE NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
DROP TABLE IF EXISTS registration_requests, notifications;
CREATE TABLE IF NOT EXISTS registration_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  mobile_number VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE our_work_sections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category ENUM('quality_education', 'livelihood', 'healthcare', 'environment_sustainability', 'integrated_development') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content LONGTEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  additional_images JSON,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_by INT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
-- Update the our_work_sections table to store multiple items
CREATE TABLE our_work_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  section_category ENUM('quality_education', 'livelihood', 'healthcare', 'environment_sustainability', 'integrated_development') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content LONGTEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  additional_images JSON,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_by INT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  INDEX (section_category, is_active, display_order)
);
-- Quality Education Table
CREATE TABLE quality_education (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content LONGTEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  additional_images JSON,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Livelihood Table
CREATE TABLE livelihood (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content LONGTEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  additional_images JSON,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Healthcare Table
CREATE TABLE healthcare (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content LONGTEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  additional_images JSON,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Environment Sustainability Table
CREATE TABLE environment_sustainability (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content LONGTEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  additional_images JSON,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Integrated Development Program Table
CREATE TABLE integrated_development (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content LONGTEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  additional_images JSON,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Insert sample data for each section
INSERT INTO our_work_items (section_category, title, description, content, is_active, display_order) VALUES
('quality_education', 'School Development Program', 'Building and renovating schools in rural areas', 'Detailed content about school development...', true, 1),
('quality_education', 'Digital Literacy Initiative', 'Teaching digital skills to underprivileged children', 'Content about digital literacy program...', true, 2),
('livelihood', 'Vocational Training Center', 'Skill development for unemployed youth', 'Content about vocational training...', true, 1),
('livelihood', 'Micro-Enterprise Support', 'Funding and mentoring for small businesses', 'Content about micro-enterprise support...', true, 2),
('healthcare', 'Mobile Health Clinic', 'Healthcare services in remote villages', 'Content about mobile health clinics...', true, 1),
('healthcare', 'Maternal Health Program', 'Support for pregnant women and new mothers', 'Content about maternal health...', true, 2),
('environment_sustainability', 'Tree Plantation Drive', 'Afforestation and environmental conservation', 'Content about tree plantation...', true, 1),
('environment_sustainability', 'Waste Management Initiative', 'Recycling and waste reduction programs', 'Content about waste management...', true, 2),
('integrated_development', 'Community Development Program', 'Holistic development of rural communities', 'Content about community development...', true, 1),
('integrated_development', 'Disaster Relief Operations', 'Emergency response and rehabilitation', 'Content about disaster relief...', true, 2);

-- Insert initial data for the 5 categories
INSERT INTO our_work_sections (category, title, description, is_active) VALUES
('quality_education', 'Quality Education', 'Providing quality education for all', true),
('livelihood', 'Livelihood', 'Creating sustainable livelihood opportunities', true),
('healthcare', 'Healthcare', 'Improving healthcare access and quality', true),
('environment_sustainability', 'Environment Sustainability', 'Promoting environmental conservation', true),
('integrated_development', 'Integrated Development Program (IDP)', 'Comprehensive development programs', true);


-- Insert default super admin user (password: admin123)
INSERT INTO users (username, email, password, role, status) VALUES 
('superadmin', 'admin@y4d.org', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 'approved');
-- Insert sample data
INSERT INTO mentors (name, position, bio, image) VALUES
('John Doe', 'Senior Mentor', 'Experienced professional with 10+ years in the industry.', 'mentor1.jpg'),
('Jane Smith', 'Tech Mentor', 'Specialized in web development and programming.', 'mentor2.jpg');

INSERT INTO management (name, position, bio, image) VALUES
('Robert Johnson', 'CEO', 'Founder and CEO with vision for growth.', 'ceo.jpg'),
('Sarah Williams', 'CTO', 'Technical lead with expertise in software architecture.', 'cto.jpg');

INSERT INTO careers (title, description, requirements, location, type, is_active) VALUES
('Frontend Developer', 'We are looking for a skilled React developer.', '3+ years of React experience, JavaScript, HTML, CSS', 'Remote', 'full-time', TRUE),
('Backend Developer', 'Node.js developer needed for API development.', 'Node.js, Express, MySQL, REST APIs', 'New York', 'full-time', TRUE);