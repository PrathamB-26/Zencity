import os
import json
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from main import generate_full_analytics

app = FastAPI(
    title="ZenCity Analytics & Data Visualization API",
    description="Python Data Analysis API powered by Pandas, NumPy, Matplotlib & Seaborn",
    version="1.0.0"
)

# Enable CORS for React frontend and Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHARTS_DIR = os.path.join(BASE_DIR, "charts")
DASHBOARD_DATA_DIR = os.path.join(BASE_DIR, "dashboard_data")
OUTPUT_JSON_PATH = os.path.join(DASHBOARD_DATA_DIR, "analytics_output.json")

def load_cached_analytics():
    if not os.path.exists(OUTPUT_JSON_PATH):
        # Generate if not exists
        return generate_full_analytics()
    with open(OUTPUT_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/")
def root():
    return {
        "service": "ZenCity Smart City Analytics Engine",
        "status": "operational",
        "documentation": "/docs"
    }

@app.get("/api/analytics/summary")
def get_summary():
    data = load_cached_analytics()
    return {
        "generated_at": data.get("generated_at"),
        "kpis": data.get("kpis", {})
    }

@app.get("/api/analytics/categories")
def get_categories():
    data = load_cached_analytics()
    return data.get("category_statistics", {})

@app.get("/api/analytics/wards")
def get_wards():
    data = load_cached_analytics()
    return data.get("ward_statistics", {})

@app.get("/api/analytics/departments")
def get_departments():
    data = load_cached_analytics()
    return data.get("department_statistics", {})

@app.get("/api/analytics/monthly")
def get_monthly():
    data = load_cached_analytics()
    return data.get("time_statistics", {})

@app.get("/api/analytics/resolution")
def get_resolution():
    data = load_cached_analytics()
    return data.get("resolution_statistics", {})

@app.get("/api/analytics/feedback")
def get_feedback():
    data = load_cached_analytics()
    return data.get("feedback_statistics", {})

@app.post("/api/analytics/refresh")
def refresh_analytics():
    try:
        updated_data = generate_full_analytics()
        return {
            "status": "success",
            "message": "Analytics and charts successfully refreshed from database.",
            "generated_at": updated_data.get("generated_at"),
            "total_complaints": updated_data.get("kpis", {}).get("total_complaints")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refresh failed: {str(e)}")

@app.get("/charts/{chart_name}")
def get_chart(chart_name: str):
    file_path = os.path.join(CHARTS_DIR, chart_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Chart not found")
    return FileResponse(file_path, media_type="image/png")

# Also mount charts directory as static files
app.mount("/static/charts", StaticFiles(directory=CHARTS_DIR), name="charts")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
