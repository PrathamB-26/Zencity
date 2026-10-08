# ZenCity: Smart City Complaint & Analytics Platform

ZenCity is an end-to-end municipal complaint management and data analytics platform designed as a comprehensive mini project for **DBMS and Data Visualization**. It combines relational database integrity with statistical computing and interactive web dashboards.

---

## 1. Project Overview & Architecture

Citizens report civic problems (potholes, water leaks, garbage, etc.) with location coordinates and photo evidence. Municipal administrators and field officers manage, assign, resolve, and analyze these complaints.

### Complete Data Flow
```
Citizen / Officer / Admin
        │
        ▼
React.js Frontend (Vite, Recharts, Leaflet, Tailwind CSS)
        │
        ▼ REST API (Axios)
Node.js + Express.js Backend
        │
        ▼ Parameterized SQL (pg pool)
PostgreSQL Relational Database
        │
        ▼ Live SQL Data Extraction
Python Analytics Engine (db_connection.py, SQLAlchemy, Psycopg)
        │
        ▼ Pandas Cleaning, Aggregation, & NumPy Statistical Math
Matplotlib & Seaborn Visualizations (8 Charts) + analytics_output.json
        │
        ▼ Fast API / JSON Delivery
React Admin Dashboard (Interactive Recharts + Python Seaborn Toggle)
```

---

## 2. Technology Stack

- **Frontend:** React.js, React Router v6, Axios, Recharts, Leaflet, React Leaflet, Tailwind CSS, React Icons
- **Backend:** Node.js, Express.js, node-postgres (`pg`), bcryptjs, jsonwebtoken (JWT), Multer, dotenv, cors
- **Database:** PostgreSQL (with Relational Views, Window Functions, Transactions, Constraints, and Indexes)
- **Data Visualization & Analytics:** Python 3.10+, Pandas, NumPy, Matplotlib, Seaborn, SQLAlchemy, Psycopg v3, FastAPI, Uvicorn

---

## 3. Demo Login Credentials

All seed accounts share the default password: **`password123`**

| Role | Email Address | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@zencity.local` | `password123` | Full analytics dashboard, case assignment, user & category management, city map |
| **OFFICER** | `officer.road1@zencity.local` | `password123` | Operational work queue, status transitions, resolution remarks |
| **CITIZEN** | `citizen1@zencity.local` | `password123` | File complaints, interactive map pin picker, photo upload, lifecycle tracking, rating feedback |

---

## 4. Local Setup Instructions

Follow these step-by-step instructions to run ZenCity on your local machine:

### Step 1: Database Setup (PostgreSQL)
1. Open PostgreSQL CLI or pgAdmin:
   ```sql
   CREATE DATABASE zencity_db;
   ```
2. Execute the schema, views, and seed datasets in order:
   ```bash
   psql -U postgres -d zencity_db -f database/schema.sql
   psql -U postgres -d zencity_db -f database/views.sql
   psql -U postgres -d zencity_db -f database/seed.sql
   ```
   *(Note: `database/seed.sql` loads 1,100 synthetic complaints with realistic seasonal spikes, status history, and feedback entries).*

### Step 2: Backend Setup (Express.js)
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Copy environment variables:
   ```bash
   copy .env.example .env
   ```
3. Install dependencies and start the backend:
   ```bash
   npm install
   npm run dev
   ```
   *The backend will run at **http://localhost:5000/api**.*
   *(ZenCity includes a resilient fallback parser: if your PostgreSQL server is not running during initial UI evaluation, the backend seamlessly loads seed data in-memory without crashing).*

### Step 3: Python Analytics & Visualization Module
1. Navigate to `data_visualization/`:
   ```bash
   cd ../data_visualization
   ```
2. Set up a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the analytical pipeline to clean data, compute NumPy stats, and generate all 8 Seaborn charts:
   ```bash
   python main.py
   ```
5. Start the live FastAPI analytics service:
   ```bash
   uvicorn api:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The Python Analytics API runs at **http://127.0.0.1:8000**.*

### Step 4: Frontend Setup (React + Vite)
1. Navigate to `frontend/`:
   ```bash
   cd ../frontend
   ```
2. Install dependencies and start the Vite dev server:
   ```bash
   npm install
   npm run dev
   ```
3. Open **http://localhost:5173** in your web browser.

---

## 5. DBMS Concepts Demonstrated

| Concept | Implementation in ZenCity | Located in File |
| :--- | :--- | :--- |
| **Relational Integrity** | `PRIMARY KEY`, `FOREIGN KEY (ON DELETE CASCADE/RESTRICT)`, `UNIQUE`, `NOT NULL`, `CHECK`, `DEFAULT` | [`database/schema.sql`](file:///c:/Users/PRATHAM%20BAISANE/OneDrive/ZenCity/database/schema.sql) |
| **Geographic Constraints** | `CHECK (latitude BETWEEN -90 AND 90)`, `CHECK (longitude BETWEEN -180 AND 180)` | [`database/schema.sql`](file:///c:/Users/PRATHAM%20BAISANE/OneDrive/ZenCity/database/schema.sql) |
| **Performance Indexing** | B-Tree indexes on `status`, `category_id`, `ward_id`, `department_id`, spatial coordinates | [`database/schema.sql`](file:///c:/Users/PRATHAM%20BAISANE/OneDrive/ZenCity/database/schema.sql) |
| **Database Transactions** | `BEGIN ... COMMIT / ROLLBACK` wrapping status transitions and assignment logs | [`backend/controllers/complaintController.js`](file:///c:/Users/PRATHAM%20BAISANE/OneDrive/ZenCity/backend/controllers/complaintController.js) |
| **Relational Views** | 6 Pre-aggregated analytical views (`monthly_complaint_statistics`, `department_performance`, `ward_complaint_summary`, `complaint_resolution_statistics`, `category_statistics`, `overdue_complaints`) | [`database/views.sql`](file:///c:/Users/PRATHAM%20BAISANE/OneDrive/ZenCity/database/views.sql) |
| **Window Functions** | `ROW_NUMBER() OVER (PARTITION BY ward_id ORDER BY COUNT(*) DESC)` for primary ward issues | [`database/queries.sql`](file:///c:/Users/PRATHAM%20BAISANE/OneDrive/ZenCity/database/queries.sql) |
| **Cumulative Window Math** | `SUM(count) OVER (ORDER BY month_date ROWS UNBOUNDED PRECEDING)` & `LAG(count, 1)` | [`database/queries.sql`](file:///c:/Users/PRATHAM%20BAISANE/OneDrive/ZenCity/database/queries.sql) |
| **Complex Aggregation** | Multi-table `LEFT JOIN`, `GROUP BY`, `HAVING COUNT(*) >= 15`, `PERCENTILE_CONT(0.50)` | [`database/queries.sql`](file:///c:/Users/PRATHAM%20BAISANE/OneDrive/ZenCity/database/queries.sql) |

---

## 6. Explanation of Schema Columns

Beyond minimal CRUD designs, ZenCity incorporates intentional columns required for realistic municipal operations:

- **`assigned_officer_id` (FK to `users`)**: Allows dispatching individual field engineers to cases. Officers only see tickets assigned to them.
- **`due_date` (`TIMESTAMP WITH TIME ZONE`)**: Computed based on complaint priority SLAs (Critical: 24h, High: 48h, Medium: 96h, Low: 168h). Used by PostgreSQL views and Python for overdue detection.
- **`users.department_id` (FK to `departments`)**: Associates municipal staff with their operational division (e.g. Road, Water, Electricity).
- **`location_text` (`VARCHAR(255)`)**: Stores local landmark details alongside raw decimal coordinates.
- **`is_active` (`BOOLEAN`)**: Allows administrative suspension without causing orphan foreign key violations.
- **`notifications` (`TABLE`)**: Real backend event log delivered to citizens and officers upon status changes, assignments, and resolution.

---

## 7. Python Data Visualizations (`charts/`)

The Python module executes statistical analysis on PostgreSQL complaint data and renders 8 publication-grade charts:

1. **`complaints_by_category.png`**: Horizontal bar chart of problem frequency.
2. **`complaints_over_time.png`**: Multi-line chart showing monthly incoming volume, resolved count, and linear trend slope.
3. **`complaint_status.png`**: Donut chart illustrating lifecycle status distribution.
4. **`complaints_by_ward.png`**: Bar chart showing civic workload across city wards.
5. **`department_performance.png`**: Grouped bar chart comparing resolved vs in-progress vs pending cases per department.
6. **`resolution_time.png`**: Seaborn box plot showing resolution duration distribution, median, quartiles, and outliers.
7. **`complaints_vs_resolution.png`**: Scatter plot evaluating Pearson correlation between ward complaint volume and average resolution duration.
8. **`ward_category_heatmap.png`**: Seaborn heatmap cross-tabulating wards against complaint category density to highlight recurring local problems.

---

## 8. Frontend Interface & Dashboards

- **Design Aesthetic:** Professional civic-tech theme in clean white with deep municipal green accents (`#1b4332`, `#2d6a4f`).
- **Interactive Recharts vs Python PNG Toggle:** The admin dashboard lets administrators switch each visualization between interactive SVG charts and the raw Python Seaborn output.
- **Geographic Map:** Built with React Leaflet and OpenStreetMap tiles, displaying geo-located pins colored by SLA priority with full case inspection popups.
- **Citizen Experience:** Includes Leaflet coordinate picking, image previewing, a visual 5-stage lifecycle stepper, audit log history, and post-resolution star ratings.
