const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'zencity_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let isPostgresAvailable = false;
let checkDone = false;

// In-memory fallback dataset for seamless offline execution
let memoryDb = null;

function loadMemorySeed() {
  if (memoryDb) return memoryDb;
  try {
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
    if (!fs.existsSync(seedPath)) return null;
    const content = fs.readFileSync(seedPath, 'utf8');

    // Parse departments
    const departments = [];
    const deptRegex = /\((\d+),\s*'([^']+)',\s*'([^']+)'\)/g;
    let m;
    while ((m = deptRegex.exec(content)) !== null && departments.length < 6) {
      departments.push({ department_id: parseInt(m[1]), department_name: m[2], description: m[3] });
    }

    // Parse wards
    const wards = [];
    const wardRegex = /\((\d+),\s*'([^']+)',\s*'([^']+)',\s*([\d\.]+),\s*([\d\.]+)\)/g;
    while ((m = wardRegex.exec(content)) !== null && wards.length < 12) {
      wards.push({
        ward_id: parseInt(m[1]),
        ward_name: m[2],
        zone: m[3],
        center_latitude: parseFloat(m[4]),
        center_longitude: parseFloat(m[5]),
      });
    }

    // Parse categories
    const categories = [];
    const catRegex = /\((\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*(true|false)\)/g;
    while ((m = catRegex.exec(content)) !== null && categories.length < 14) {
      categories.push({
        category_id: parseInt(m[1]),
        category_name: m[2],
        category_group: m[3],
        description: m[4],
        default_department_id: parseInt(m[5]),
        is_active: m[6] === 'true',
      });
    }

    // Parse users
    const users = [];
    const userRegex = /\((\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+|NULL),\s*(true|false)\)/g;
    while ((m = userRegex.exec(content)) !== null) {
      users.push({
        user_id: parseInt(m[1]),
        name: m[2],
        email: m[3],
        phone: m[4],
        password_hash: m[5],
        role: m[6],
        department_id: m[7] !== 'NULL' ? parseInt(m[7]) : null,
        is_active: m[8] === 'true',
        created_at: new Date().toISOString(),
      });
    }

    // Parse complaints
    const complaints = [];
    const compRegex = /\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+|NULL),\s*'([^']*)',\s*'([^']*)',\s*('[^']*'|NULL),\s*'([^']*)',\s*([\d\.\-]+),\s*([\d\.\-]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*('([^']*)'|NULL)\)/g;
    while ((m = compRegex.exec(content)) !== null) {
      complaints.push({
        complaint_id: parseInt(m[1]),
        user_id: parseInt(m[2]),
        category_id: parseInt(m[3]),
        department_id: parseInt(m[4]),
        ward_id: parseInt(m[5]),
        assigned_officer_id: m[6] !== 'NULL' ? parseInt(m[6]) : null,
        title: m[7],
        description: m[8],
        image: m[9] !== 'NULL' ? m[9].replace(/'/g, '') : null,
        location_text: m[10],
        latitude: parseFloat(m[11]),
        longitude: parseFloat(m[12]),
        priority: m[13],
        status: m[14],
        due_date: m[15],
        created_at: m[16],
        resolved_at: m[17] !== 'NULL' && m[18] ? m[18] : null,
      });
    }

    // Parse status history
    const history = [];
    const histRegex = /\((\d+),\s*(\d+),\s*(NULL|'[^']*'),\s*'([^']*)',\s*(\d+|NULL),\s*'([^']*)',\s*'([^']*)'\)/g;
    while ((m = histRegex.exec(content)) !== null) {
      history.push({
        history_id: parseInt(m[1]),
        complaint_id: parseInt(m[2]),
        old_status: m[3] !== 'NULL' ? m[3].replace(/'/g, '') : null,
        new_status: m[4],
        changed_by: m[5] !== 'NULL' ? parseInt(m[5]) : null,
        changed_at: m[6],
        remarks: m[7],
      });
    }

    // Parse feedback
    const feedback = [];
    const fbRegex = /\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)'\)/g;
    while ((m = fbRegex.exec(content)) !== null) {
      feedback.push({
        feedback_id: parseInt(m[1]),
        complaint_id: parseInt(m[2]),
        user_id: parseInt(m[3]),
        rating: parseInt(m[4]),
        comment: m[5],
        created_at: m[6],
      });
    }

    // Parse notifications
    const notifications = [];
    const notifRegex = /\((\d+),\s*(\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*(true|false),\s*'([^']*)'\)/g;
    while ((m = notifRegex.exec(content)) !== null) {
      notifications.push({
        notification_id: parseInt(m[1]),
        user_id: parseInt(m[2]),
        complaint_id: parseInt(m[3]),
        type: m[4],
        message: m[5],
        is_read: m[6] === 'true',
        created_at: m[7],
      });
    }

    memoryDb = {
      departments,
      wards,
      categories,
      users,
      complaints,
      history,
      feedback,
      notifications,
    };
    return memoryDb;
  } catch (err) {
    console.error('Error loading fallback seed store:', err.message);
    return null;
  }
}

async function checkDatabaseConnection() {
  if (checkDone) return isPostgresAvailable;
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isPostgresAvailable = true;
    console.log('✅ PostgreSQL connected successfully to', process.env.DB_NAME || 'zencity_db');
  } catch (err) {
    isPostgresAvailable = false;
    console.warn(`⚠️ PostgreSQL connection unavailable (${err.message}). Using local relational store fallback.`);
    loadMemorySeed();
  }
  checkDone = true;
  return isPostgresAvailable;
}

// Initial check
checkDatabaseConnection();

module.exports = {
  pool,
  query: async (text, params) => {
    await checkDatabaseConnection();
    if (isPostgresAvailable) {
      return pool.query(text, params);
    }
    // Return empty rows or let fallback services handle in memory
    throw new Error('POSTGRESQL_OFFLINE');
  },
  getClient: async () => {
    await checkDatabaseConnection();
    if (isPostgresAvailable) {
      return pool.connect();
    }
    throw new Error('POSTGRESQL_OFFLINE');
  },
  isPostgresAvailable: () => isPostgresAvailable,
  getMemoryDb: () => {
    if (!memoryDb) loadMemorySeed();
    return memoryDb;
  },
};
