-- ============================================================================
-- ZENCITY: SMART CITY COMPLAINT & ANALYTICS PLATFORM
-- DATABASE SCHEMA DEFINITION (POSTGRESQL)
-- ============================================================================
-- DBMS Concepts Demonstrated:
-- 1. Table Creation and Data Types (SERIAL, VARCHAR, TEXT, TIMESTAMP, NUMERIC, BOOLEAN)
-- 2. Constraints: PRIMARY KEY, FOREIGN KEY (with ON DELETE CASCADE), UNIQUE, NOT NULL, CHECK, DEFAULT
-- 3. Relationships: 1-to-Many (Users-Complaints, Categories-Complaints, Wards-Complaints), 1-to-1/0 (Complaints-Feedback)
-- 4. Geographic Data Support: Latitude and Longitude bounded by CHECK constraints
-- 5. B-Tree Indexes for rapid query retrieval and aggregation
-- ============================================================================

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS complaint_status_history CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS wards CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ----------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- Represents municipal departments responsible for resolving civic complaints
-- ----------------------------------------------------------------------------
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. WARDS TABLE
-- City administrative wards and zones for geographic analysis
-- ----------------------------------------------------------------------------
CREATE TABLE wards (
    ward_id SERIAL PRIMARY KEY,
    ward_name VARCHAR(100) NOT NULL UNIQUE,
    zone VARCHAR(50) NOT NULL,
    center_latitude NUMERIC(9, 6) CHECK (center_latitude BETWEEN -90 AND 90),
    center_longitude NUMERIC(9, 6) CHECK (center_longitude BETWEEN -180 AND 180),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. USERS TABLE
-- Handles authentication, roles (CITIZEN, OFFICER, ADMIN), and officer department assignments
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CITIZEN' CHECK (role IN ('CITIZEN', 'OFFICER', 'ADMIN')),
    department_id INT REFERENCES departments(department_id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. CATEGORIES TABLE
-- Categorization of civic problems grouped by infrastructure, water, waste, etc.
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    category_group VARCHAR(100) NOT NULL,
    description TEXT,
    default_department_id INT REFERENCES departments(department_id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. COMPLAINTS TABLE
-- Core table storing reported civic issues with spatial coordinates, status, and SLA due date
-- ----------------------------------------------------------------------------
CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    category_id INT NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    department_id INT REFERENCES departments(department_id) ON DELETE SET NULL,
    ward_id INT NOT NULL REFERENCES wards(ward_id) ON DELETE RESTRICT,
    assigned_officer_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255),
    location_text VARCHAR(255),
    latitude NUMERIC(9, 6) CHECK (latitude BETWEEN -90.0 AND 90.0),
    longitude NUMERIC(9, 6) CHECK (longitude BETWEEN -180.0 AND 180.0),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT check_resolved_after_created CHECK (resolved_at IS NULL OR resolved_at >= created_at)
);

-- ----------------------------------------------------------------------------
-- 6. COMPLAINT STATUS HISTORY TABLE
-- Maintains immutable audit trail of every status transition for lifecycle tracking and resolution time analysis
-- ----------------------------------------------------------------------------
CREATE TABLE complaint_status_history (
    history_id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL CHECK (new_status IN ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED')),
    changed_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT
);

-- ----------------------------------------------------------------------------
-- 7. FEEDBACK TABLE
-- Citizen satisfaction ratings and comments on resolved complaints (1 to 1 relationship with complaint)
-- ----------------------------------------------------------------------------
CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL UNIQUE REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. NOTIFICATIONS TABLE
-- Real-time events delivered to citizens and officers
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    complaint_id INT REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE INDEXES (DBMS Concept: Indexing for fast searches and aggregation)
-- ============================================================================
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_category_id ON complaints(category_id);
CREATE INDEX idx_complaints_department_id ON complaints(department_id);
CREATE INDEX idx_complaints_ward_id ON complaints(ward_id);
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_officer_id ON complaints(assigned_officer_id);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_complaints_coordinates ON complaints(latitude, longitude);

CREATE INDEX idx_history_complaint_id ON complaint_status_history(complaint_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
