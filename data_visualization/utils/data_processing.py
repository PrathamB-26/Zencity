import pandas as pd
import numpy as np

def clean_and_prepare_data(raw_data):
    """
    Cleans raw relational data and builds an enriched analytical DataFrame.
    Calculates resolution time, overdue flags, and standardizes categories.
    """
    df_c = raw_data["complaints"].copy()
    df_cat = raw_data["categories"].copy()
    df_dept = raw_data["departments"].copy()
    df_ward = raw_data["wards"].copy()
    df_fb = raw_data["feedback"].copy()

    # Convert datetimes
    df_c["created_at"] = pd.to_datetime(df_c["created_at"])
    df_c["resolved_at"] = pd.to_datetime(df_c["resolved_at"], errors="coerce")
    df_c["due_date"] = pd.to_datetime(df_c["due_date"], errors="coerce")

    # Merge Category info
    df_enriched = df_c.merge(
        df_cat[["category_id", "category_name", "category_group"]],
        on="category_id",
        how="left"
    )

    # Merge Department info
    df_enriched = df_enriched.merge(
        df_dept[["department_id", "department_name"]],
        on="department_id",
        how="left"
    )

    # Merge Ward info
    df_enriched = df_enriched.merge(
        df_ward[["ward_id", "ward_name", "zone"]],
        on="ward_id",
        how="left"
    )

    # Merge Feedback info (if exists)
    if not df_fb.empty:
        df_enriched = df_enriched.merge(
            df_fb[["complaint_id", "rating", "comment"]],
            on="complaint_id",
            how="left"
        )
    else:
        df_enriched["rating"] = np.nan
        df_enriched["comment"] = None

    # Calculate Resolution Time in hours and days
    # resolved_at minus created_at
    mask_resolved = df_enriched["resolved_at"].notna()
    df_enriched["resolution_hours"] = np.nan
    df_enriched["resolution_days"] = np.nan

    duration_series = df_enriched.loc[mask_resolved, "resolved_at"] - df_enriched.loc[mask_resolved, "created_at"]
    df_enriched.loc[mask_resolved, "resolution_hours"] = duration_series.dt.total_seconds() / 3600.0
    df_enriched.loc[mask_resolved, "resolution_days"] = duration_series.dt.total_seconds() / 86400.0

    # Overdue calculation: not resolved and due_date < current or created + sla
    now_ts = pd.Timestamp.now(tz=df_c["created_at"].iloc[0].tz if df_c["created_at"].iloc[0].tz else None)
    df_enriched["is_overdue"] = False
    unresolved_mask = ~df_enriched["status"].isin(["RESOLVED", "CLOSED", "REJECTED"])
    df_enriched.loc[unresolved_mask & (df_enriched["due_date"] < now_ts), "is_overdue"] = True

    # Date helper columns
    df_enriched["created_month"] = df_enriched["created_at"].dt.to_period("M").astype(str)
    df_enriched["created_date"] = df_enriched["created_at"].dt.date

    return df_enriched
