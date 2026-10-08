const db = require('../config/db');

exports.listUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    if (db.isPostgresAvailable()) {
      let conditions = [];
      let params = [];

      if (role) {
        params.push(role);
        conditions.push(`u.role = $${params.length}`);
      }
      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const totalRes = await db.query(`SELECT COUNT(*) FROM users u ${whereClause}`, params);
      const total = parseInt(totalRes.rows[0].count, 10);

      const listSql = `
        SELECT u.user_id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
               d.department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.department_id
        ${whereClause}
        ORDER BY u.user_id ASC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2};
      `;
      const result = await db.query(listSql, [...params, parseInt(limit, 10), offset]);

      return res.json({
        success: true,
        data: result.rows,
        pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
      });
    } else {
      const mDb = db.getMemoryDb();
      let list = mDb.users.slice();
      if (role) list = list.filter((u) => u.role === role);
      if (search) {
        const s = search.toLowerCase();
        list = list.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
      }
      const total = list.length;
      const paged = list.slice(offset, offset + parseInt(limit, 10)).map((u) => {
        const d = mDb.departments.find((x) => x.department_id === u.department_id);
        return {
          user_id: u.user_id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          is_active: u.is_active,
          created_at: u.created_at,
          department_name: d ? d.department_name : null,
        };
      });

      return res.json({
        success: true,
        data: paged,
        pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving users.' });
  }
};

exports.listOfficers = async (req, res) => {
  try {
    const { department_id } = req.query;

    if (db.isPostgresAvailable()) {
      let sql = `
        SELECT u.user_id, u.name, u.email, u.phone, u.department_id, d.department_name,
               COUNT(c.complaint_id) AS active_cases
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.department_id
        LEFT JOIN complaints c ON u.user_id = c.assigned_officer_id AND c.status IN ('ASSIGNED', 'IN_PROGRESS')
        WHERE u.role = 'OFFICER' AND u.is_active = true
      `;
      const params = [];
      if (department_id) {
        params.push(parseInt(department_id, 10));
        sql += ` AND u.department_id = $1`;
      }
      sql += ` GROUP BY u.user_id, d.department_name ORDER BY u.name ASC;`;

      const result = await db.query(sql, params);
      return res.json({ success: true, data: result.rows });
    } else {
      const mDb = db.getMemoryDb();
      let officers = mDb.users.filter((u) => u.role === 'OFFICER' && u.is_active);
      if (department_id) {
        officers = officers.filter((u) => u.department_id === parseInt(department_id, 10));
      }
      const data = officers.map((u) => {
        const d = mDb.departments.find((x) => x.department_id === u.department_id);
        const active = mDb.complaints.filter((c) => c.assigned_officer_id === u.user_id && ['ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length;
        return {
          user_id: u.user_id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          department_id: u.department_id,
          department_name: d ? d.department_name : null,
          active_cases: active,
        };
      });
      return res.json({ success: true, data });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving officers.' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { is_active, role, department_id } = req.body;

    if (db.isPostgresAvailable()) {
      const updates = [];
      const params = [userId];

      if (is_active !== undefined) {
        params.push(is_active);
        updates.push(`is_active = $${params.length}`);
      }
      if (role) {
        params.push(role);
        updates.push(`role = $${params.length}`);
      }
      if (department_id !== undefined) {
        params.push(department_id ? parseInt(department_id, 10) : null);
        updates.push(`department_id = $${params.length}`);
      }

      if (updates.length > 0) {
        await db.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = $1`, params);
      }
      return res.json({ success: true, message: 'User updated successfully.' });
    } else {
      const mDb = db.getMemoryDb();
      const u = mDb.users.find((x) => x.user_id === userId);
      if (!u) return res.status(404).json({ success: false, message: 'User not found.' });

      if (is_active !== undefined) u.is_active = is_active;
      if (role) u.role = role;
      if (department_id !== undefined) u.department_id = department_id ? parseInt(department_id, 10) : null;

      return res.json({ success: true, message: 'User updated successfully.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating user.' });
  }
};
