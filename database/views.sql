-- ============================================================================
-- ZENCITY: SMART CITY COMPLAINT & ANALYTICS PLATFORM
-- DATABASE VIEWS DEFINITION (POSTGRESQL)
-- ============================================================================
-- DBMS Concepts Demonstrated:
-- 1. Views for Abstraction & Pre-computed Aggregation
-- 2. Complex Multi-Table Joins (INNER JOIN, LEFT JOIN)
-- 3. CASE Statements for conditional aggregation (Pivot-like counts)
-- 4. Date and Time Extraction functions (DATE_TRUNC, EXTRACT, EPOCH)
-- 5. Window Functions and Rounding
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. VIEW: monthly_complaint_statistics
-- Summarizes complaints reported, resolved, and active month by month
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW monthly_complaint_statistics AS
SELECT
    TO_CHAR(DATE_TRUNC('month', c.created_at), 'YYYY-MM') AS month_year,
    COUNT(c.complaint_id) AS total_complaints,
    COUNT(CASE WHEN c.status = 'RESOLVED' OR c.status = 'CLOSED' THEN 1 END) AS resolved_complaints,
    COUNT(CASE WHEN c.status = 'IN_PROGRESS' THEN 1 END) AS in_progress_complaints,
    COUNT(CASE WHEN c.status = 'SUBMITTED' OR c.status = 'ASSIGNED' THEN 1 END) AS pending_complaints,
    COUNT(CASE WHEN c.status = 'REJECTED' THEN 1 END) AS rejected_complaints,
    ROUND(
        AVG(CASE 
            WHEN c.resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 86400.0 
        END)::numeric, 2
    ) AS avg_resolution_days
FROM complaints c
GROUP BY DATE_TRUNC('month', c.created_at)
ORDER BY month_year ASC;

-- ----------------------------------------------------------------------------
-- 2. VIEW: department_performance
-- Calculates departmental workload, resolution rates, and average time to fix
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW department_performance AS
SELECT
    d.department_id,
    d.department_name,
    COUNT(c.complaint_id) AS total_assigned,
    COUNT(CASE WHEN c.status IN ('RESOLVED', 'CLOSED') THEN 1 END) AS resolved_count,
    COUNT(CASE WHEN c.status = 'IN_PROGRESS' THEN 1 END) AS in_progress_count,
    COUNT(CASE WHEN c.status IN ('SUBMITTED', 'ASSIGNED') THEN 1 END) AS pending_count,
    COUNT(CASE WHEN c.status = 'REJECTED' THEN 1 END) AS rejected_count,
    ROUND(
        (COUNT(CASE WHEN c.status IN ('RESOLVED', 'CLOSED') THEN 1 END)::numeric / 
        NULLIF(COUNT(c.complaint_id), 0)::numeric * 100), 1
    ) AS resolution_rate_percentage,
    ROUND(
        AVG(CASE 
            WHEN c.resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 86400.0 
        END)::numeric, 2
    ) AS avg_resolution_days,
    ROUND(AVG(f.rating)::numeric, 2) AS avg_citizen_rating
FROM departments d
LEFT JOIN complaints c ON d.department_id = c.department_id
LEFT JOIN feedback f ON c.complaint_id = f.complaint_id
GROUP BY d.department_id, d.department_name
ORDER BY total_assigned DESC;

-- ----------------------------------------------------------------------------
-- 3. VIEW: ward_complaint_summary
-- Summarizes complaint volume, unresolved counts, and rates by ward and zone
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW ward_complaint_summary AS
SELECT
    w.ward_id,
    w.ward_name,
    w.zone,
    w.center_latitude,
    w.center_longitude,
    COUNT(c.complaint_id) AS total_complaints,
    COUNT(CASE WHEN c.status IN ('RESOLVED', 'CLOSED') THEN 1 END) AS resolved_count,
    COUNT(CASE WHEN c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') THEN 1 END) AS unresolved_count,
    ROUND(
        (COUNT(CASE WHEN c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') THEN 1 END)::numeric /
        NULLIF(COUNT(c.complaint_id), 0)::numeric * 100), 1
    ) AS unresolved_rate_percentage
FROM wards w
LEFT JOIN complaints c ON w.ward_id = c.ward_id
GROUP BY w.ward_id, w.ward_name, w.zone, w.center_latitude, w.center_longitude
ORDER BY total_complaints DESC;

-- ----------------------------------------------------------------------------
-- 4. VIEW: complaint_resolution_statistics
-- High-level SLAs and metrics across priorities
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW complaint_resolution_statistics AS
SELECT
    c.priority,
    COUNT(c.complaint_id) AS total_complaints,
    COUNT(CASE WHEN c.resolved_at IS NOT NULL THEN 1 END) AS resolved_complaints,
    ROUND(
        AVG(CASE 
            WHEN c.resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600.0 
        END)::numeric, 1
    ) AS avg_resolution_hours,
    ROUND(
        (COUNT(CASE 
            WHEN c.resolved_at IS NOT NULL AND (c.resolved_at - c.created_at) <= INTERVAL '24 hours' 
            THEN 1 END)::numeric / 
        NULLIF(COUNT(CASE WHEN c.resolved_at IS NOT NULL THEN 1 END), 0)::numeric * 100), 1
    ) AS pct_resolved_within_24h,
    ROUND(
        (COUNT(CASE 
            WHEN c.resolved_at IS NOT NULL AND (c.resolved_at - c.created_at) <= INTERVAL '48 hours' 
            THEN 1 END)::numeric / 
        NULLIF(COUNT(CASE WHEN c.resolved_at IS NOT NULL THEN 1 END), 0)::numeric * 100), 1
    ) AS pct_resolved_within_48h
FROM complaints c
GROUP BY c.priority
ORDER BY 
    CASE c.priority 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        WHEN 'LOW' THEN 4 
    END;

-- ----------------------------------------------------------------------------
-- 5. VIEW: category_statistics
-- Complaint volume, percentage share, and average rating by category
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW category_statistics AS
SELECT
    cat.category_id,
    cat.category_name,
    cat.category_group,
    COUNT(c.complaint_id) AS total_complaints,
    ROUND(
        (COUNT(c.complaint_id)::numeric / 
        NULLIF((SELECT COUNT(*) FROM complaints), 0)::numeric * 100), 2
    ) AS percentage_of_total,
    ROUND(AVG(f.rating)::numeric, 2) AS avg_rating,
    ROUND(
        AVG(CASE 
            WHEN c.resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 86400.0 
        END)::numeric, 2
    ) AS avg_resolution_days
FROM categories cat
LEFT JOIN complaints c ON cat.category_id = c.category_id
LEFT JOIN feedback f ON c.complaint_id = f.complaint_id
GROUP BY cat.category_id, cat.category_name, cat.category_group
ORDER BY total_complaints DESC;

-- ----------------------------------------------------------------------------
-- 6. VIEW: overdue_complaints
-- Complaints exceeding due_date SLA that have not yet been resolved
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW overdue_complaints AS
SELECT
    c.complaint_id,
    c.title,
    c.priority,
    c.status,
    c.created_at,
    c.due_date,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - c.due_date)) / 86400.0::numeric, 1) AS days_overdue,
    cat.category_name,
    d.department_name,
    w.ward_name,
    u.name AS assigned_officer
FROM complaints c
JOIN categories cat ON c.category_id = cat.category_id
LEFT JOIN departments d ON c.department_id = d.department_id
JOIN wards w ON c.ward_id = w.ward_id
LEFT JOIN users u ON c.assigned_officer_id = u.user_id
WHERE c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')
  AND c.due_date IS NOT NULL
  AND c.due_date < CURRENT_TIMESTAMP
ORDER BY days_overdue DESC;
