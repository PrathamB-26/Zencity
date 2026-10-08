import os
import re
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "zencity_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

def get_db_url():
    return f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def get_engine():
    """Returns SQLAlchemy engine for PostgreSQL database connection."""
    url = get_db_url()
    return create_engine(url, connect_args={"connect_timeout": 2})

def load_data_from_db_or_seed():
    """
    Connects to live PostgreSQL database using SQLAlchemy.
    If PostgreSQL is unreachable (e.g. initial setup before user starts service),
    it parses database/seed.sql directly to construct identical Pandas DataFrames.
    This guarantees zero downtime and enables offline chart generation.
    """
    try:
        engine = get_engine()
        with engine.connect() as conn:
            # Test quick query
            conn.execute("SELECT 1")
            
            # Read all required tables into DataFrames
            df_complaints = pd.read_sql("SELECT * FROM complaints", conn)
            df_categories = pd.read_sql("SELECT * FROM categories", conn)
            df_departments = pd.read_sql("SELECT * FROM departments", conn)
            df_wards = pd.read_sql("SELECT * FROM wards", conn)
            df_feedback = pd.read_sql("SELECT * FROM feedback", conn)
            df_history = pd.read_sql("SELECT * FROM complaint_status_history", conn)
            
            print("[INFO] Successfully connected to PostgreSQL database.")
            return {
                "complaints": df_complaints,
                "categories": df_categories,
                "departments": df_departments,
                "wards": df_wards,
                "feedback": df_feedback,
                "history": df_history,
                "source": "postgresql"
            }
    except Exception as e:
        print(f"[NOTICE] PostgreSQL not reachable ({e}). Falling back to seed dataset parser...")
        return parse_seed_sql()

def parse_seed_sql():
    """Parses database/seed.sql to construct full relational DataFrames."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    seed_path = os.path.join(base_dir, "database", "seed.sql")
    
    if not os.path.exists(seed_path):
        raise FileNotFoundError(f"Neither PostgreSQL nor seed.sql found at {seed_path}")
        
    with open(seed_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Departments
    dept_matches = re.findall(r"\((\d+),\s*'([^']+)',\s*'([^']+)'\)", content)
    # The departments are the first 6
    departments_data = []
    for m in dept_matches[:6]:
        departments_data.append({"department_id": int(m[0]), "department_name": m[1], "description": m[2]})
    df_departments = pd.DataFrame(departments_data)

    # 2. Wards
    ward_pattern = r"\((\d+),\s*'([^']+)',\s*'([^']+)',\s*([\d\.]+),\s*([\d\.]+)\)"
    ward_matches = re.findall(ward_pattern, content)
    wards_data = []
    for m in ward_matches[:12]:
        wards_data.append({
            "ward_id": int(m[0]),
            "ward_name": m[1],
            "zone": m[2],
            "center_latitude": float(m[3]),
            "center_longitude": float(m[4])
        })
    df_wards = pd.DataFrame(wards_data)

    # 3. Categories
    cat_pattern = r"\((\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*(true|false)\)"
    cat_matches = re.findall(cat_pattern, content)
    cats_data = []
    for m in cat_matches[:14]:
        cats_data.append({
            "category_id": int(m[0]),
            "category_name": m[1],
            "category_group": m[2],
            "description": m[3],
            "default_department_id": int(m[4]),
            "is_active": m[5] == "true"
        })
    df_categories = pd.DataFrame(cats_data)

    # 4. Complaints
    # Pattern: (cid, uid, cat_id, dept_id, ward_id, officer, title, desc, img, loc, lat, lon, priority, status, due, created, resolved)
    complaint_pattern = r"\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+|NULL),\s*'([^']*)',\s*'([^']*)',\s*('[^']*'|NULL),\s*'([^']*)',\s*([\d\.\-]+),\s*([\d\.\-]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*('([^']*)'|NULL)\)"
    comp_matches = re.findall(complaint_pattern, content)
    complaints_data = []
    for m in comp_matches:
        complaints_data.append({
            "complaint_id": int(m[0]),
            "user_id": int(m[1]),
            "category_id": int(m[2]),
            "department_id": int(m[3]),
            "ward_id": int(m[4]),
            "assigned_officer_id": int(m[5]) if m[5] != "NULL" else None,
            "title": m[6],
            "description": m[7],
            "image": m[8].strip("'") if m[8] != "NULL" else None,
            "location_text": m[9],
            "latitude": float(m[10]),
            "longitude": float(m[11]),
            "priority": m[12],
            "status": m[13],
            "due_date": m[14],
            "created_at": m[15],
            "resolved_at": m[17] if m[16] != "NULL" else None
        })
    df_complaints = pd.DataFrame(complaints_data)

    # 5. Feedback
    fb_pattern = r"\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)'\)"
    fb_matches = re.findall(fb_pattern, content)
    feedback_data = []
    for m in fb_matches:
        feedback_data.append({
            "feedback_id": int(m[0]),
            "complaint_id": int(m[1]),
            "user_id": int(m[2]),
            "rating": int(m[3]),
            "comment": m[4],
            "created_at": m[5]
        })
    df_feedback = pd.DataFrame(feedback_data)

    # 6. History
    hist_pattern = r"\((\d+),\s*(\d+),\s*(NULL|'[^']*'),\s*'([^']*)',\s*(\d+|NULL),\s*'([^']*)',\s*'([^']*)'\)"
    hist_matches = re.findall(hist_pattern, content)
    history_data = []
    for m in hist_matches:
        history_data.append({
            "history_id": int(m[0]),
            "complaint_id": int(m[1]),
            "old_status": m[2].strip("'") if m[2] != "NULL" else None,
            "new_status": m[3],
            "changed_by": int(m[4]) if m[4] != "NULL" else None,
            "changed_at": m[5],
            "remarks": m[6]
        })
    df_history = pd.DataFrame(history_data)

    print(f"[INFO] Parsed {len(df_complaints)} complaints from seed dataset.")
    return {
        "complaints": df_complaints,
        "categories": df_categories,
        "departments": df_departments,
        "wards": df_wards,
        "feedback": df_feedback,
        "history": df_history,
        "source": "seed_sql_parser"
    }
