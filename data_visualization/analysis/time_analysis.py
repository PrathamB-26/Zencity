import os
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def run_time_analysis(df, output_dir):
    """
    Analyzes temporal complaint trends, calculates rate of change slope with NumPy,
    and generates Chart 2: complaints_over_time.png
    """
    # Group by month
    monthly = df.groupby("created_month").agg(
        total_complaints=("complaint_id", "count"),
        resolved_complaints=("resolved_at", lambda s: s.notna().sum())
    ).reset_index().sort_values(by="created_month")

    # NumPy linear regression slope
    x_indices = np.arange(len(monthly))
    y_values = monthly["total_complaints"].values
    if len(x_indices) > 1:
        slope, intercept = np.polyfit(x_indices, y_values, 1)
        trend_direction = "increasing" if slope > 0.5 else ("decreasing" if slope < -0.5 else "stable")
    else:
        slope, intercept = 0.0, 0.0
        trend_direction = "stable"

    # Category month trends
    cat_month = df.groupby(["created_month", "category_name"]).size().unstack(fill_value=0)
    recent_trend = {}
    if len(cat_month) >= 3:
        for cat in cat_month.columns:
            recent_diff = cat_month[cat].iloc[-1] - cat_month[cat].iloc[-3]
            recent_trend[cat] = int(recent_diff)
    rising_categories = [k for k, v in sorted(recent_trend.items(), key=lambda item: item[1], reverse=True)[:3]]

    # Generate Chart 2: Line chart (Complaints Over Time)
    plt.figure(figsize=(10, 5.5), facecolor="#ffffff")
    ax = plt.subplot(111)
    ax.set_facecolor("#ffffff")

    ax.plot(monthly["created_month"], monthly["total_complaints"],
            marker="o", markersize=6, color="#1b4332", linewidth=2.5, label="Total Reported")
    ax.plot(monthly["created_month"], monthly["resolved_complaints"],
            marker="s", markersize=5, color="#52b788", linewidth=2, linestyle="--", label="Resolved")

    # Trend line
    trend_line = intercept + slope * x_indices
    ax.plot(monthly["created_month"], trend_line, color="#9ca3af", linestyle=":", linewidth=1.5, label=f"Trend Slope ({slope:+.2f}/mo)")

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#d1d5db")
    ax.spines["bottom"].set_color("#d1d5db")
    ax.grid(True, linestyle="--", alpha=0.3, color="#9ca3af")

    plt.xticks(rotation=45, ha="right", fontsize=9, color="#374151")
    plt.yticks(fontsize=9, color="#374151")
    plt.title("Monthly Civic Complaint Volume & Resolution Trends", fontsize=13, fontweight="bold", pad=15, color="#111827")
    plt.xlabel("Month (Year-Month)", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.ylabel("Number of Complaints", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.legend(frameon=True, facecolor="#ffffff", edgecolor="#e5e7eb", fontsize=9)
    plt.tight_layout()

    chart_path = os.path.join(output_dir, "complaints_over_time.png")
    plt.savefig(chart_path, dpi=200, bbox_inches="tight")
    plt.close()

    return {
        "monthly_series": monthly.to_dict(orient="records"),
        "trend_slope": round(float(slope), 2),
        "trend_direction": trend_direction,
        "rising_categories": rising_categories
    }
