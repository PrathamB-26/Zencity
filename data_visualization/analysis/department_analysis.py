import os
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def run_department_analysis(df, output_dir):
    """
    Analyzes municipal department workload, resolution efficiency, and
    generates Chart 5: department_performance.png (Grouped bar chart)
    """
    dept_group = df.groupby(["department_id", "department_name"]).agg(
        total_assigned=("complaint_id", "count"),
        resolved_count=("status", lambda s: s.isin(["RESOLVED", "CLOSED"]).sum()),
        in_progress_count=("status", lambda s: (s == "IN_PROGRESS").sum()),
        pending_count=("status", lambda s: s.isin(["SUBMITTED", "ASSIGNED"]).sum()),
        avg_res_days=("resolution_days", "mean"),
        avg_rating=("rating", "mean")
    ).reset_index()

    dept_group["resolution_rate"] = (dept_group["resolved_count"] / dept_group["total_assigned"] * 100).round(1)
    dept_group["avg_res_days"] = dept_group["avg_res_days"].round(2)
    dept_group["avg_rating"] = dept_group["avg_rating"].round(2)
    dept_group = dept_group.sort_values(by="total_assigned", ascending=False)

    # Generate Chart 5: Grouped Bar Chart
    plt.figure(figsize=(11, 5.5), facecolor="#ffffff")
    ax = plt.subplot(111)
    ax.set_facecolor("#ffffff")

    x = np.arange(len(dept_group))
    width = 0.25

    # Shorten names for clean display
    dept_labels = dept_group["department_name"].str.replace(" Department", "")

    r1 = ax.bar(x - width, dept_group["resolved_count"], width, label="Resolved", color="#2d6a4f", edgecolor="#1b4332")
    r2 = ax.bar(x, dept_group["in_progress_count"], width, label="In Progress", color="#d97706", edgecolor="#b45309")
    r3 = ax.bar(x + width, dept_group["pending_count"], width, label="Pending", color="#6b7280", edgecolor="#4b5563")

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#d1d5db")
    ax.spines["bottom"].set_color("#d1d5db")
    ax.grid(axis="y", linestyle="--", alpha=0.3, color="#9ca3af")

    plt.xticks(x, dept_labels, rotation=20, ha="right", fontsize=9, color="#374151")
    plt.yticks(fontsize=9, color="#374151")
    plt.title("Department Performance & Case Status Breakdown", fontsize=13, fontweight="bold", pad=15, color="#111827")
    plt.xlabel("Municipal Department", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.ylabel("Number of Complaints", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.legend(frameon=True, facecolor="#ffffff", edgecolor="#e5e7eb", fontsize=9)
    plt.tight_layout()

    chart_path = os.path.join(output_dir, "department_performance.png")
    plt.savefig(chart_path, dpi=200, bbox_inches="tight")
    plt.close()

    fastest_dept = dept_group.sort_values(by="avg_res_days").iloc[0].to_dict() if not dept_group.empty else {}
    highest_workload_dept = dept_group.iloc[0].to_dict() if not dept_group.empty else {}

    return {
        "department_breakdown": dept_group.to_dict(orient="records"),
        "fastest_department": fastest_dept,
        "highest_workload_department": highest_workload_dept
    }
