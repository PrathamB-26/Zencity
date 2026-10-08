import os
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

def run_resolution_analysis(df, output_dir):
    """
    Analyzes resolution durations, SLA compliance, status distributions, and correlations.
    Generates:
    - Chart 3: complaint_status.png (Donut chart)
    - Chart 6: resolution_time.png (Seaborn Box plot)
    - Chart 7: complaints_vs_resolution.png (Scatter plot)
    """
    # 1. Status Distribution
    status_counts = df["status"].value_counts().reset_index()
    status_counts.columns = ["status", "count"]

    # Generate Chart 3: Donut Chart
    plt.figure(figsize=(7, 5.5), facecolor="#ffffff")
    status_colors = {
        "RESOLVED": "#2d6a4f",
        "CLOSED": "#1b4332",
        "IN_PROGRESS": "#d97706",
        "ASSIGNED": "#3b82f6",
        "SUBMITTED": "#9ca3af",
        "REJECTED": "#dc2626"
    }
    colors = [status_colors.get(s, "#6b7280") for s in status_counts["status"]]

    wedges, texts, autotexts = plt.pie(
        status_counts["count"],
        labels=status_counts["status"],
        autopct="%1.1f%%",
        startangle=140,
        colors=colors,
        pctdistance=0.8,
        wedgeprops=dict(width=0.4, edgecolor="#ffffff", linewidth=2)
    )
    for text in texts:
        text.set_color("#374151")
        text.set_fontsize(9)
    for autotext in autotexts:
        autotext.set_color("#ffffff")
        autotext.set_fontsize(8.5)
        autotext.set_fontweight("bold")

    plt.title("Current Complaint Status Lifecycle Distribution", fontsize=12, fontweight="bold", pad=15, color="#111827")
    plt.tight_layout()

    chart3_path = os.path.join(output_dir, "complaint_status.png")
    plt.savefig(chart3_path, dpi=200, bbox_inches="tight")
    plt.close()

    # 2. Resolution Time Metrics
    resolved_df = df[df["resolution_hours"].notna()].copy()
    if not resolved_df.empty:
        avg_res_hours = round(float(resolved_df["resolution_hours"].mean()), 1)
        min_res_hours = round(float(resolved_df["resolution_hours"].min()), 1)
        max_res_hours = round(float(resolved_df["resolution_hours"].max()), 1)
        pct_24h = round(float((resolved_df["resolution_hours"] <= 24).mean() * 100), 1)
        pct_48h = round(float((resolved_df["resolution_hours"] <= 48).mean() * 100), 1)
    else:
        avg_res_hours, min_res_hours, max_res_hours, pct_24h, pct_48h = 0, 0, 0, 0, 0

    # Overdue count
    overdue_count = int(df["is_overdue"].sum())

    # Priority SLAs
    priority_res = df.groupby("priority")["resolution_hours"].mean().round(1).to_dict()

    # 3. Generate Chart 6: Seaborn Box Plot (Resolution Time by Department)
    plt.figure(figsize=(10, 6), facecolor="#ffffff")
    ax = plt.subplot(111)
    ax.set_facecolor("#ffffff")

    # Clean department name
    resolved_df["dept_clean"] = resolved_df["department_name"].str.replace(" Department", "")

    sns.boxplot(
        data=resolved_df,
        x="dept_clean",
        y="resolution_days",
        palette=["#95d5b2", "#74c69d", "#52b788", "#40916c", "#2d6a4f", "#1b4332"],
        ax=ax,
        fliersize=3.5,
        linewidth=1.2
    )

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#d1d5db")
    ax.spines["bottom"].set_color("#d1d5db")
    ax.grid(axis="y", linestyle="--", alpha=0.3, color="#9ca3af")

    plt.xticks(rotation=20, ha="right", fontsize=9, color="#374151")
    plt.yticks(fontsize=9, color="#374151")
    plt.title("Resolution Duration Distribution by Department (Days)", fontsize=13, fontweight="bold", pad=15, color="#111827")
    plt.xlabel("Department", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.ylabel("Resolution Time (Days)", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.tight_layout()

    chart6_path = os.path.join(output_dir, "resolution_time.png")
    plt.savefig(chart6_path, dpi=200, bbox_inches="tight")
    plt.close()

    # Box plot summary values for JSON output
    box_plot_data = []
    for dept_name, group in resolved_df.groupby("dept_clean"):
        vals = group["resolution_days"].values
        if len(vals) > 0:
            q25, q50, q75 = np.percentile(vals, [25, 50, 75])
            iqr = q75 - q25
            lower_whisker = float(max(min(vals), q25 - 1.5 * iqr))
            upper_whisker = float(min(max(vals), q75 + 1.5 * iqr))
            outliers = [float(v) for v in vals if v < lower_whisker or v > upper_whisker]
            box_plot_data.append({
                "department": dept_name,
                "q25": round(float(q25), 2),
                "median": round(float(q50), 2),
                "q75": round(float(q75), 2),
                "lower_whisker": round(lower_whisker, 2),
                "upper_whisker": round(upper_whisker, 2),
                "outliers_count": len(outliers)
            })

    # 4. Generate Chart 7: Scatter Plot (Complaints vs Resolution Time)
    ward_stats = df.groupby("ward_name").agg(
        volume=("complaint_id", "count"),
        avg_res_days=("resolution_days", "mean")
    ).dropna().reset_index()

    plt.figure(figsize=(9, 5.5), facecolor="#ffffff")
    ax = plt.subplot(111)
    ax.set_facecolor("#ffffff")

    ax.scatter(ward_stats["volume"], ward_stats["avg_res_days"],
               color="#2d6a4f", s=90, alpha=0.85, edgecolors="#1b4332", linewidth=1.5)

    for _, row in ward_stats.iterrows():
        short_name = row["ward_name"].split(" - ")[1]
        ax.annotate(short_name, (row["volume"] + 0.8, row["avg_res_days"]),
                    fontsize=8.5, color="#374151")

    # Correlation calculation with NumPy
    if len(ward_stats) > 1:
        corr = np.corrcoef(ward_stats["volume"], ward_stats["avg_res_days"])[0, 1]
    else:
        corr = 0.0

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#d1d5db")
    ax.spines["bottom"].set_color("#d1d5db")
    ax.grid(True, linestyle="--", alpha=0.3, color="#9ca3af")

    plt.title(f"Ward Workload vs Avg Resolution Duration (Correlation: {corr:+.2f})",
              fontsize=13, fontweight="bold", pad=15, color="#111827")
    plt.xlabel("Ward Complaint Volume", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.ylabel("Average Resolution Time (Days)", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.tight_layout()

    chart7_path = os.path.join(output_dir, "complaints_vs_resolution.png")
    plt.savefig(chart7_path, dpi=200, bbox_inches="tight")
    plt.close()

    scatter_points = ward_stats.to_dict(orient="records")

    return {
        "status_distribution": status_counts.to_dict(orient="records"),
        "avg_resolution_hours": avg_res_hours,
        "avg_resolution_days": round(avg_res_hours / 24.0, 2),
        "min_resolution_hours": min_res_hours,
        "max_resolution_hours": max_res_hours,
        "pct_resolved_24h": pct_24h,
        "pct_resolved_48h": pct_48h,
        "overdue_count": overdue_count,
        "priority_resolution_hours": priority_res,
        "box_plot_data": box_plot_data,
        "correlation_volume_resolution": round(float(corr), 2),
        "scatter_points": scatter_points
    }
