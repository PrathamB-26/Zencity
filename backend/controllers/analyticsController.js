const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const db = require('../config/db');

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
const BASE_DIR = path.join(__dirname, '..', '..', 'data_visualization');
const CHARTS_DIR = path.join(BASE_DIR, 'charts');
const JSON_PATH = path.join(BASE_DIR, 'dashboard_data', 'analytics_output.json');

// Helper to get cached JSON
function getLocalAnalyticsJson() {
  if (fs.existsSync(JSON_PATH)) {
    const raw = fs.readFileSync(JSON_PATH, 'utf8');
    return JSON.parse(raw);
  }
  return null;
}

exports.getSummary = async (req, res) => {
  try {
    // Attempt live Python API first
    try {
      const response = await axios.get(`${PYTHON_API_URL}/api/analytics/summary`, { timeout: 1500 });
      return res.json({ success: true, ...response.data, source: 'python_fastapi' });
    } catch (apiErr) {
      // Fallback to local generated JSON
      const cached = getLocalAnalyticsJson();
      if (cached) {
        return res.json({
          success: true,
          generated_at: cached.generated_at,
          kpis: cached.kpis,
          source: 'cached_python_json',
        });
      }
      return res.status(503).json({ success: false, message: 'Analytics data is generating. Please run main.py or start FastAPI.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics summary.' });
  }
};

exports.getFullAnalytics = async (req, res) => {
  try {
    const cached = getLocalAnalyticsJson();
    if (cached) {
      return res.json({ success: true, data: cached });
    }
    res.status(404).json({ success: false, message: 'Analytics data not found. Run python main.py to generate.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics data.' });
  }
};

exports.getChartImage = (req, res) => {
  const chartName = req.params.name;
  const filePath = path.join(CHARTS_DIR, chartName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: `Chart image '${chartName}' not found.` });
  }

  res.setHeader('Content-Type', 'image/png');
  res.sendFile(filePath);
};

exports.refreshAnalytics = async (req, res) => {
  try {
    // Attempt Python API trigger first
    try {
      const response = await axios.post(`${PYTHON_API_URL}/api/analytics/refresh`, {}, { timeout: 8000 });
      return res.json({ success: true, message: 'Analytics refreshed via Python service.', data: response.data });
    } catch (e) {
      // Fallback: execute main.py via child_process
      const scriptPath = path.join(BASE_DIR, 'main.py');
      exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('Refresh script error:', error);
          return res.status(500).json({ success: false, message: 'Error executing Python analytics refresh.', error: stderr });
        }
        const updated = getLocalAnalyticsJson();
        return res.json({
          success: true,
          message: 'Analytics pipeline successfully re-executed from PostgreSQL data.',
          generated_at: updated ? updated.generated_at : new Date().toISOString(),
          kpis: updated ? updated.kpis : null,
        });
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to trigger analytics refresh.' });
  }
};

exports.getDatabaseViewStats = async (req, res) => {
  try {
    if (db.isPostgresAvailable()) {
      const [deptPerf, wardSum, monthlyStats] = await Promise.all([
        db.query('SELECT * FROM department_performance;'),
        db.query('SELECT * FROM ward_complaint_summary LIMIT 15;'),
        db.query('SELECT * FROM monthly_complaint_statistics;'),
      ]);

      return res.json({
        success: true,
        source: 'postgresql_views',
        department_performance: deptPerf.rows,
        ward_summary: wardSum.rows,
        monthly_statistics: monthlyStats.rows,
      });
    } else {
      const cached = getLocalAnalyticsJson();
      return res.json({
        success: true,
        source: 'cached_python_json',
        department_performance: cached?.department_statistics?.department_breakdown || [],
        ward_summary: cached?.ward_statistics?.ward_breakdown || [],
        monthly_statistics: cached?.time_statistics?.monthly_series || [],
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to query database views.' });
  }
};
