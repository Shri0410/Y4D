-- Migration: Add application_logs table
-- Date: 2024
-- Description: Adds comprehensive application logging table for monitoring and debugging

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

-- Add comment to table
ALTER TABLE application_logs COMMENT = 'Comprehensive application activity logs for monitoring and debugging';

