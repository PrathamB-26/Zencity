# ZenCity Python Data Analytics and Visualization Module

This module forms the analytical and statistical intelligence core of ZenCity. It connects to the PostgreSQL database, cleans and aggregates data with Pandas, performs mathematical and correlation operations with NumPy, generates high-resolution visualizations with Matplotlib & Seaborn, and exposes a FastAPI analytics service.

## Architecture Flow
```
PostgreSQL Database -> Python Database Connection -> Pandas DataFrames ->
Data Cleaning & Feature Engineering -> NumPy Calculations ->
Matplotlib & Seaborn Visualizations -> Charts (*.png) + analytics_output.json ->
React Admin Dashboard (Recharts + Python PNGs)
```

## Generated Visualizations (`charts/`)
1. `complaints_by_category.png`: Bar chart of complaint distribution across categories.
2. `complaints_over_time.png`: Line chart tracking monthly volume, resolution progress, and trend slope.
3. `complaint_status.png`: Donut chart showing complaint lifecycle states.
4. `complaints_by_ward.png`: Bar chart of civic workload across city wards.
5. `department_performance.png`: Grouped bar chart comparing resolved, in progress, and pending cases.
6. `resolution_time.png`: Seaborn box plot showing resolution distribution, quartiles, and outliers.
7. `complaints_vs_resolution.png`: Scatter plot correlating ward workload with resolution delay.
8. `ward_category_heatmap.png`: Seaborn heatmap cross-tabulating wards against category occurrences.

## Local Execution
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run analytical pipeline (generates all charts and JSON):
   ```bash
   python main.py
   ```
3. Run live FastAPI service:
   ```bash
   uvicorn api:app --host 127.0.0.1 --port 8000 --reload
   ```
