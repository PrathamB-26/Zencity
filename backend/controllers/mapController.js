const db = require('../config/db');

exports.getMapComplaints = async (req, res) => {
  try {
    const { status, category_id, priority, ward_id, limit = 500 } = req.query;

    if (db.isPostgresAvailable()) {
      let conditions = ['c.latitude IS NOT NULL', 'c.longitude IS NOT NULL'];
      let params = [];

      if (status) {
        params.push(status);
        conditions.push(`c.status = $${params.length}`);
      }
      if (category_id) {
        params.push(parseInt(category_id, 10));
        conditions.push(`c.category_id = $${params.length}`);
      }
      if (priority) {
        params.push(priority);
        conditions.push(`c.priority = $${params.length}`);
      }
      if (ward_id) {
        params.push(parseInt(ward_id, 10));
        conditions.push(`c.ward_id = $${params.length}`);
      }

      params.push(parseInt(limit, 10));
      const sql = `
        SELECT c.complaint_id, c.title, c.description, c.priority, c.status,
               c.latitude, c.longitude, c.location_text, c.created_at,
               cat.category_name, cat.category_group,
               d.department_name,
               w.ward_name, w.zone
        FROM complaints c
        JOIN categories cat ON c.category_id = cat.category_id
        LEFT JOIN departments d ON c.department_id = d.department_id
        JOIN wards w ON c.ward_id = w.ward_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY c.created_at DESC
        LIMIT $${params.length};
      `;
      const result = await db.query(sql, params);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    } else {
      const mDb = db.getMemoryDb();
      let list = mDb.complaints.filter((c) => c.latitude && c.longitude);

      if (status) list = list.filter((c) => c.status === status);
      if (category_id) list = list.filter((c) => c.category_id === parseInt(category_id, 10));
      if (priority) list = list.filter((c) => c.priority === priority);
      if (ward_id) list = list.filter((c) => c.ward_id === parseInt(ward_id, 10));

      const data = list.slice(0, parseInt(limit, 10)).map((c) => {
        const cat = mDb.categories.find((x) => x.category_id === c.category_id);
        const dept = mDb.departments.find((x) => x.department_id === c.department_id);
        const ward = mDb.wards.find((x) => x.ward_id === c.ward_id);
        return {
          complaint_id: c.complaint_id,
          title: c.title,
          description: c.description,
          priority: c.priority,
          status: c.status,
          latitude: c.latitude,
          longitude: c.longitude,
          location_text: c.location_text,
          created_at: c.created_at,
          category_name: cat ? cat.category_name : 'Unknown',
          category_group: cat ? cat.category_group : 'General',
          department_name: dept ? dept.department_name : 'Unassigned',
          ward_name: ward ? ward.ward_name : 'Unknown',
          zone: ward ? ward.zone : 'Unknown',
        };
      });

      return res.json({ success: true, count: data.length, data });
    }
  } catch (err) {
    console.error('Map complaints error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving map complaints.' });
  }
};
