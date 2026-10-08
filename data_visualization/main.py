import os
import json
import datetime
from database.db_connection import load_data_from_db_or_seed
from utils.data_processing import clean_and_prepare_data
from analysis.category_analysis import run_category_analysis
from analysis.time_analysis import run_time_analysis
from analysis.ward_analysis import run_ward_analysis
from analysis.department_analysis import run_department_analysis
from analysis.resolution_analysis import run_resolution_analysis
from analysis.feedback_analysis import run_feedback_analysis

def generate_full_analytics():
    """
    ZenCity Core Analytics Pipeline:
    PostgreSQL -> DB Connection -> Pandas DataFrame -> Data Cleaning ->
    NumPy Math -> Matplotlib/Seaborn Charts -> analytics_output.json
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    charts_dir = os.path.join(base_dir, "charts")
    dashboard_data_dir = os.path.join(base_dir, "dashboard_data")
    os.makedirs(charts_dir, exist_ok=True)
    os.makedirs(dashboard_data_dir, exist_ok=True)

    print("[1/5] Extracting data from PostgreSQL / seed dataset...")
    raw_data = load_data_from_db_or_seed()

    print("[2/5] Cleaning and standardizing relational data...")
    df = clean_and_prepare_data(raw_data)

    total_complaints = int(len(df))
    resolved_count = int(df["status"].isin(["RESOLVED", "CLOSED"]).sum())
    in_progress_count = int((df["status"] == "IN_PROGRESS").sum())
    pending_count = int(df["status"].isin(["SUBMITTED", "ASSIGNED"]).sum())
    rejected_count = int((df["status"] == "REJECTED").sum())
    resolution_rate = round((resolved_count / total_complaints * 100), 1) if total_complaints > 0 else 0.0

    print("[3/5] Executing specialized statistical analyses...")
    cat_results = run_category_analysis(df, charts_dir)
    time_results = run_time_analysis(df, charts_dir)
    ward_results = run_ward_analysis(df, charts_dir)
    dept_results = run_department_analysis(df, charts_dir)
    res_results = run_resolution_analysis(df, charts_dir)
    fb_results = run_feedback_analysis(df)

    print("[4/5] Compiling unified analytics output JSON...")
    output_payload = {
        "generated_at": datetime.datetime.now().isoformat(),
        "data_source": raw_data.get("source", "unknown"),
        "kpis": {
            "total_complaints": total_complaints,
            "pending_complaints": pending_count,
            "resolved_complaints": resolved_count,
            "in_progress_complaints": in_progress_count,
            "rejected_complaints": rejected_count,
            "resolution_rate": resolution_rate,
            "average_resolution_time_days": res_results["avg_resolution_days"],
            "average_resolution_time_hours": res_results["avg_resolution_hours"],
            "average_citizen_rating": fb_results["average_rating"],
            "overdue_complaints": res_results["overdue_count"]
        },
        "category_statistics": cat_results,
        "time_statistics": time_results,
        "ward_statistics": ward_results,
        "department_statistics": dept_results,
        "resolution_statistics": res_results,
        "feedback_statistics": fb_results,
        "charts": [
            "complaints_by_category.png",
            "complaints_over_time.png",
            "complaint_status.png",
            "complaints_by_ward.png",
            "department_performance.png",
            "resolution_time.png",
            "complaints_vs_resolution.png",
            "ward_category_heatmap.png"
        ]
    }

    output_json_path = os.path.join(dashboard_data_dir, "analytics_output.json")
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2)

    print(f"[5/5] Analytics successfully written to {output_json_path} and charts saved in {charts_dir}/")
    return output_payload

if __name__ == "__main__":
    generate_full_analytics()
