import pandas as pd
import numpy as np

def run_feedback_analysis(df):
    """
    Analyzes citizen satisfaction ratings and comments on resolved complaints.
    """
    feedback_df = df[df["rating"].notna()].copy()

    if feedback_df.empty:
        return {
            "total_feedbacks": 0,
            "average_rating": 0.0,
            "rating_distribution": [],
            "department_ratings": [],
            "category_ratings": []
        }

    avg_overall = round(float(feedback_df["rating"].mean()), 2)
    total_feedbacks = int(len(feedback_df))

    # Rating distribution 1-5
    rating_counts = feedback_df["rating"].value_counts().sort_index(ascending=False).reset_index()
    rating_counts.columns = ["rating", "count"]
    rating_counts["percentage"] = (rating_counts["count"] / total_feedbacks * 100).round(1)

    # Department ratings
    dept_ratings = feedback_df.groupby("department_name")["rating"].agg(["mean", "count"]).reset_index()
    dept_ratings.columns = ["department_name", "avg_rating", "feedback_count"]
    dept_ratings["avg_rating"] = dept_ratings["avg_rating"].round(2)
    dept_ratings = dept_ratings.sort_values(by="avg_rating", ascending=False)

    # Category ratings
    cat_ratings = feedback_df.groupby("category_name")["rating"].agg(["mean", "count"]).reset_index()
    cat_ratings.columns = ["category_name", "avg_rating", "feedback_count"]
    cat_ratings["avg_rating"] = cat_ratings["avg_rating"].round(2)
    cat_ratings = cat_ratings.sort_values(by="avg_rating", ascending=False)

    return {
        "total_feedbacks": total_feedbacks,
        "average_rating": avg_overall,
        "rating_distribution": rating_counts.to_dict(orient="records"),
        "department_ratings": dept_ratings.to_dict(orient="records"),
        "category_ratings": cat_ratings.to_dict(orient="records")
    }
