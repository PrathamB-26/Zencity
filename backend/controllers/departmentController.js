const db = require('../config/db');

exports.listDepartments = async (req, res) => {
  try {
    if (db.isPostgresAvailable()) {
      const result = await db.query(`
        SELECT d.*, 
               COUNT(c.complaint_id) AS total_complaints,
               COUNT(CASE WHEN c.status IN ('RESOLVED', 'CLOSED') THEN 1 END) AS resolved_count,
               COUNT(u.user_id) AS officer_count
        FROM departments d
        LEFT JOIN complaints c ON d.department_id = c.department_id
        LEFT JOIN users u ON d.department_id = u.department_id AND u.role = 'OFFICER'
        GROUP BY d.department_id
        ORDER BY d.department_id ASC;
      `);
      return res.json({ success: true, data: result.rows });
    } else {
      const mDb = db.getMemoryDb();
      const list = mDb.departments.map((d) => {
        const comps = mDb.complaints.filter((c) => c.department_id === d.department_id);
        const officers = mDb.users.filter((u) => u.department_id === d.department_id && u.role === 'OFFICER');
        return {
          ...d,
          total_complaints: comps.length,
          resolved_count: comps.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length,
          officer_count: officers.length,
        };
      });
      return res.json({ success: true, data: list });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving departments.' });
  }
};
