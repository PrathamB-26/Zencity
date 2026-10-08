import os
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

def run_ward_analysis(df, output_dir):
    """
    Analyzes geographic complaint distribution across municipal wards and zones.
    Generates:
    - Chart 4: complaints_by_ward.png (Bar chart)
    - Chart 8: ward_category_heatmap.png (Seaborn heatmap)
    """
    # Ward summary
    ward_group = df.groupby(["ward_id", "ward_name", "zone"]).agg(
        total_complaints=("complaint_id", "count"),
        resolved_count=("status", lambda s: s.isin(["RESOLVED", "CLOSED"]).sum()),
        unresolved_count=("status", lambda s: (~s.isin(["RESOLVED", "CLOSED", "REJECTED"])).sum())
    ).reset_index()

    ward_group["unresolved_rate"] = (ward_group["unresolved_count"] / ward_group["total_complaints"] * 100).round(1)
    ward_group = ward_group.sort_values(by="total_complaints", ascending=False)

    most_problematic_ward = ward_group.iloc[0].to_dict() if not ward_group.empty else {}
    highest_unresolved_ward = ward_group.sort_values(by="unresolved_rate", ascending=False).iloc[0].to_dict() if not ward_group.empty else {}

    # Primary issue in each ward
    ward_cat_counts = df.groupby(["ward_name", "category_name"]).size().reset_index(name="count")
    idx_max = ward_cat_counts.groupby("ward_name")["count"].idxmax()
    primary_issues = ward_cat_counts.loc[idx_max].rename(columns={"category_name": "primary_category"}).to_dict(orient="records")

    # Generate Chart 4: Bar chart (Complaints by Ward)
    plt.figure(figsize=(10, 5.5), facecolor="#ffffff")
    ax = plt.subplot(111)
    ax.set_facecolor("#ffffff")

    bars = ax.bar(ward_group["ward_name"].str.split(" - ").str[1], ward_group["total_complaints"],
                  color="#2d6a4f", edgecolor="#1b4332", width=0.6)

    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, height + 1.5, f"{int(height)}",
                ha="center", va="bottom", fontsize=8.5, color="#1f2937", fontweight="600")

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#d1d5db")
    ax.spines["bottom"].set_color("#d1d5db")
    ax.grid(axis="y", linestyle="--", alpha=0.3, color="#9ca3af")

    plt.xticks(rotation=40, ha="right", fontsize=8.5, color="#374151")
    plt.yticks(fontsize=9, color="#374151")
    plt.title("Civic Complaint Load Across Municipal Wards", fontsize=13, fontweight="bold", pad=15, color="#111827")
    plt.xlabel("Municipal Ward", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.ylabel("Total Complaints", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.tight_layout()

    chart4_path = os.path.join(output_dir, "complaints_by_ward.png")
    plt.savefig(chart4_path, dpi=200, bbox_inches="tight")
    plt.close()

    # Generate Chart 8: Seaborn Heatmap (Ward by Category)
    pivot_matrix = df.pivot_table(
        index="ward_name",
        columns="category_name",
        values="complaint_id",
        aggfunc="count",
        fill_value=0
    )
    # Simplify ward label for clean rendering
    pivot_matrix.index = [w.split(" - ")[1] for w in pivot_matrix.index]

    plt.figure(figsize=(12, 7), facecolor="#ffffff")
    cmap = sns.light_palette("#1b4332", as_cmap=True)
    sns.heatmap(pivot_matrix, cmap=cmap, annot=True, fmt="d", linewidths=0.5,
                linecolor="#f3f4f6", cbar_kws={"label": "Complaint Frequency"})

    plt.title("Cross-Tabulation Heatmap: Municipal Ward vs Category Density",
              fontsize=13, fontweight="bold", pad=15, color="#111827")
    plt.xlabel("Civic Category", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.ylabel("Ward Area", fontsize=10, fontweight="600", labelpad=10, color="#374151")
    plt.xticks(rotation=45, ha="right", fontsize=8.5)
    plt.yticks(rotation=0, fontsize=8.5)
    plt.tight_layout()

    chart8_path = os.path.join(output_dir, "ward_category_heatmap.png")
    plt.savefig(chart8_path, dpi=200, bbox_inches="tight")
    plt.close()

    return {
        "ward_breakdown": ward_group.to_dict(orient="records"),
        "most_problematic_ward": most_problematic_ward,
        "highest_unresolved_ward": highest_unresolved_ward,
        "primary_issues": primary_issues,
        "heatmap_matrix": {
            "wards": list(pivot_matrix.index),
            "categories": list(pivot_matrix.columns),
            "values": pivot_matrix.values.tolist()
        }
    }
