-- ============================================================================
-- ZENCITY: SMART CITY COMPLAINT & ANALYTICS PLATFORM
-- ANALYTICAL QUERIES & DBMS CONCEPTS DEMONSTRATION (POSTGRESQL)
-- ============================================================================
-- This file documents and demonstrates key DBMS concepts:
-- 1. Basic Grouping and Aggregation (GROUP BY, COUNT, AVG, SUM, MIN, MAX)
-- 2. Multi-Table Joins (INNER, LEFT, SELF)
-- 3. Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, Cumulative SUM)
-- 4. Subqueries and Common Table Expressions (WITH CTE)
-- 5. Case-based Conditional Aggregation
-- 6. Date/Time Arithmetics and Durations
-- ============================================================================

-- ----------------------------------------------------------------------------
-- QUERY 1: Basic Distribution Aggregations
-- Concept: GROUP BY with aggregate functions
-- ----------------------------------------------------------------------------

-- Complaints by Category
SELECT 
    c.category_id, 
    cat.category_name, 
    COUNT(*) AS complaint_count
FROM complaints c
JOIN categories cat ON c.category_id = cat.category_id
GROUP BY c.category_id, cat.category_name
ORDER BY complaint_count DESC;

-- Complaints by Ward
SELECT 
    w.ward_id, 
    w.ward_name, 
    w.zone, 
    COUNT(*) AS complaint_count
FROM complaints c
JOIN wards w ON c.ward_id = w.ward_id
GROUP BY w.ward_id, w.ward_name, w.zone
ORDER BY complaint_count DESC;

-- Complaints by Department
SELECT 
    d.department_id, 
    d.department_name, 
    COUNT(*) AS complaint_count
FROM complaints c
JOIN departments d ON c.department_id = d.department_id
GROUP BY d.department_id, d.department_name
ORDER BY complaint_count DESC;

-- Complaints by Status
SELECT 
    status, 
    COUNT(*) AS complaint_count,
    ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM complaints)::numeric * 100), 2) AS percentage
FROM complaints
GROUP BY status
ORDER BY complaint_count DESC;

-- ----------------------------------------------------------------------------
-- QUERY 2: Most Problematic Category within each Ward
-- Concept: Window Function (ROW_NUMBER / DENSE_RANK over PARTITION BY) + CTE
-- ----------------------------------------------------------------------------
WITH WardCategoryRank AS (
    SELECT 
        w.ward_id,
        w.ward_name,
        w.zone,
        cat.category_name,
        COUNT(c.complaint_id) AS complaint_count,
        ROW_NUMBER() OVER (
            PARTITION BY w.ward_id 
            ORDER BY COUNT(c.complaint_id) DESC
        ) AS rank_in_ward
    FROM complaints c
    JOIN wards w ON c.ward_id = w.ward_id
    JOIN categories cat ON c.category_id = cat.category_id
    GROUP BY w.ward_id, w.ward_name, w.zone, cat.category_name
)
SELECT 
    ward_id,
    ward_name,
    zone,
    category_name AS primary_issue,
    complaint_count
FROM WardCategoryRank
WHERE rank_in_ward = 1
ORDER BY complaint_count DESC;

-- ----------------------------------------------------------------------------
-- QUERY 3: Cumulative Running Total & Monthly Growth of Complaints
-- Concept: Window Functions (SUM() OVER(), LAG() OVER()) with DATE_TRUNC
-- ----------------------------------------------------------------------------
WITH MonthlyTotals AS (
    SELECT 
        DATE_TRUNC('month', created_at) AS month_date,
        COUNT(complaint_id) AS monthly_count
    FROM complaints
    GROUP BY DATE_TRUNC('month', created_at)
)
SELECT 
    TO_CHAR(month_date, 'YYYY-MM') AS month_label,
    monthly_count,
    LAG(monthly_count, 1) OVER (ORDER BY month_date) AS prev_month_count,
    monthly_count - LAG(monthly_count, 1) OVER (ORDER BY month_date) AS monthly_change,
    SUM(monthly_count) OVER (ORDER BY month_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM MonthlyTotals
ORDER BY month_date ASC;

-- ----------------------------------------------------------------------------
-- QUERY 4: Department Efficiency & Resolution Duration Outliers
-- Concept: Aggregate Statistical Functions + Quartile Estimation
-- ----------------------------------------------------------------------------
SELECT 
    d.department_name,
    COUNT(c.complaint_id) AS resolved_total,
    ROUND(AVG(EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600.0)::numeric, 1) AS avg_hours,
    ROUND(MIN(EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600.0)::numeric, 1) AS min_hours,
    ROUND(MAX(EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600.0)::numeric, 1) AS max_hours,
    ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600.0)::numeric, 1) AS median_hours
FROM complaints c
JOIN departments d ON c.department_id = d.department_id
WHERE c.resolved_at IS NOT NULL
GROUP BY d.department_name
ORDER BY avg_hours ASC;

-- ----------------------------------------------------------------------------
-- QUERY 5: Recurring Civic Issues (Clusters of Repeated Problems)
-- Concept: HAVING clause with multi-column threshold filtering
-- ----------------------------------------------------------------------------
SELECT 
    w.ward_name,
    cat.category_name,
    COUNT(c.complaint_id) AS occurrence_count,
    COUNT(CASE WHEN c.status NOT IN ('RESOLVED', 'CLOSED') THEN 1 END) AS currently_unresolved
FROM complaints c
JOIN wards w ON c.ward_id = w.ward_id
JOIN categories cat ON c.category_id = cat.category_id
GROUP BY w.ward_name, cat.category_name
HAVING COUNT(c.complaint_id) >= 15
ORDER BY occurrence_count DESC;

-- ----------------------------------------------------------------------------
-- QUERY 6: Priority SLA Adherence Comparison
-- Concept: Conditional Aggregation & Case Expressions
-- ----------------------------------------------------------------------------
SELECT 
    priority,
    COUNT(*) AS total_complaints,
    COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) AS resolved_count,
    ROUND(
        (COUNT(CASE WHEN resolved_at IS NOT NULL AND resolved_at <= due_date THEN 1 END)::numeric /
        NULLIF(COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END), 0)::numeric * 100), 1
    ) AS on_time_sla_rate
FROM complaints
GROUP BY priority
ORDER BY 
    CASE priority 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        WHEN 'LOW' THEN 4 
    END;

-- ----------------------------------------------------------------------------
-- QUERY 7: Citizen Satisfaction vs Resolution Speed
-- Concept: Cross-Table Correlation between Duration and Feedback Rating
-- ----------------------------------------------------------------------------
SELECT 
    f.rating,
    COUNT(f.feedback_id) AS feedback_count,
    ROUND(AVG(EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 86400.0)::numeric, 2) AS avg_resolution_days
FROM feedback f
JOIN complaints c ON f.complaint_id = c.complaint_id
WHERE c.resolved_at IS NOT NULL
GROUP BY f.rating
ORDER BY f.rating DESC;
