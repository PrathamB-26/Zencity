const db = require('../config/db');

exports.listWards = async (req, res) => {
  try {
    if (db.isPostgresAvailable()) {
      const result = await db.query(`
        SELECT w.*,
               COUNT(c.complaint_id) AS total_complaints,
               COUNT(CASE WHEN c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') THEN 1 END) AS unresolved_count
        FROM wards w
        LEFT JOIN complaints c ON w.ward_id = c.ward_id
        GROUP BY w.ward_id
        ORDER BY w.ward_id ASC;
      `);
      return res.json({ success: true, data: result.rows });
    } else {
      const mDb = db.getMemoryDb();
      const list = mDb.wards.map((w) => {
        const comps = mDb.complaints.filter((c) => c.ward_id === w.ward_id);
        const unresolved = comps.filter((c) => !['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status)).length;
        return {
          ...w,
          total_complaints: comps.length,
          unresolved_count: unresolved,
        };
      });
      return res.json({ success: true, data: list });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving wards.' });
  }
};
