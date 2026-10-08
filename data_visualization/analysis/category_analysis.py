import os
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def run_category_analysis(df, output_dir):
    """
    Analyzes complaint distribution across categories and generates
    Chart 1: complaints_by_category.png
    """
    cat_counts = df["category_name"].value_counts().reset_index()
    cat_counts.columns = ["category_name", "count"]
    total = len(df)
    cat_counts["percentage"] = (cat_counts["count"] / total * 100).round(2)

    most_common = cat_counts.iloc[0].to_dict() if not cat_counts.empty else {}
    least_common = cat_counts.iloc[-1].to_dict() if not cat_counts.empty else {}

    # Category Group analysis
    group_counts = df["category_group"].value_counts().reset_index()
    group_counts.columns = ["group", "count"]

    # Generate Chart 1: Horizontal Bar Chart with professional civic green styling
    plt.figure(figsize=(10, 6), facecolor="#ffffff")
    ax = plt.subplot(111)
    ax.set_facecolor("#ffffff")

    sorted_df = cat_counts.sort_values(by="count", ascending=True)
    bars = ax.barh(sorted_df["category_name"], sorted_df["count"], color="#2d6a4f", edgecolor="#1b4332", height=0.65)

    # Add count labels at bar ends
    for bar in bars:
        width = bar.get_width()
        ax.text(width + 2, bar.get_y() + bar.get_height()/2, f"{int(width)}",
                ha="left", va="center", fontsize=9, color="#1f2937", fontweight="500")

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#d1d5db")
    ax.spines["bottom"].set_color("#d1d5db")
    ax.grid(axis="x", linestyle="--", alpha=0.3, color="#9ca3af")

    plt.title("Civic Complaints by Category (ZenCity Municipal Analytics)", fontsize=13, fontweight="bold", pad=15, color="#111827")
    plt.xlabel("Total Reported Complaints", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.ylabel("Complaint Category", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.tight_layout()

    chart_path = os.path.join(output_dir, "complaints_by_category.png")
    plt.savefig(chart_path, dpi=200, bbox_inches="tight")
    plt.close()

    return {
        "most_common": most_common,
        "least_common": least_common,
        "category_breakdown": cat_counts.to_dict(orient="records"),
        "group_breakdown": group_counts.to_dict(orient="records")
    }
