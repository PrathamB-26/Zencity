const db = require('../config/db');

// Valid status transitions state machine
const VALID_TRANSITIONS = {
  SUBMITTED: ['ASSIGNED', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
};

function calculateDueDate(priority, startDate = new Date()) {
  const slaHours = {
    CRITICAL: 24,
    HIGH: 48,
    MEDIUM: 96,
    LOW: 168,
  };
  const hours = slaHours[priority] || 96;
  return new Date(startDate.getTime() + hours * 3600 * 1000);
}

// ----------------------------------------------------------------------------
// CREATE COMPLAINT (Citizens)
// ----------------------------------------------------------------------------
exports.createComplaint = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, category_id, ward_id, location_text, latitude, longitude, priority = 'MEDIUM' } = req.body;

    if (!title || !description || !category_id || !ward_id) {
      return res.status(422).json({
        success: false,
        message: 'Title, description, category, and ward are required.',
      });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const dueDate = calculateDueDate(priority);
    const parsedCatId = parseInt(category_id, 10);
    const parsedWardId = parseInt(ward_id, 10);
    const lat = latitude ? parseFloat(latitude) : null;
    const lon = longitude ? parseFloat(longitude) : null;

    if (db.isPostgresAvailable()) {
      const client = await db.getClient();
      try {
        await client.query('BEGIN');

        // Look up default department for category
        const catRes = await client.query('SELECT default_department_id FROM categories WHERE category_id = $1', [parsedCatId]);
        const deptId = catRes.rows[0] ? catRes.rows[0].default_department_id : null;

        // Insert complaint
        const insertQuery = `
          INSERT INTO complaints (
            user_id, category_id, department_id, ward_id, title, description,
            image, location_text, latitude, longitude, priority, status, due_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'SUBMITTED', $12)
          RETURNING *;
        `;
        const compRes = await client.query(insertQuery, [
          userId, parsedCatId, deptId, parsedWardId, title, description,
          imagePath, location_text || null, lat, lon, priority, dueDate
        ]);
        const complaint = compRes.rows[0];

        // Insert initial lifecycle record
        await client.query(
          `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, remarks)
           VALUES ($1, NULL, 'SUBMITTED', $2, 'Complaint registered by citizen.')`,
          [complaint.complaint_id, userId]
        );

        // Insert notification
        await client.query(
          `INSERT INTO notifications (user_id, complaint_id, type, message)
           VALUES ($1, $2, 'COMPLAINT_SUBMITTED', $3)`,
          [userId, complaint.complaint_id, `Your complaint #${complaint.complaint_id} '${title}' has been successfully submitted.`]
        );

        await client.query('COMMIT');
        return res.status(201).json({ success: true, complaint });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      // Memory fallback
      const mDb = db.getMemoryDb();
      const cat = mDb.categories.find((c) => c.category_id === parsedCatId);
      const newComplaint = {
        complaint_id: mDb.complaints.length + 1,
        user_id: userId,
        category_id: parsedCatId,
        department_id: cat ? cat.default_department_id : null,
        ward_id: parsedWardId,
        assigned_officer_id: null,
        title,
        description,
        image: imagePath,
        location_text: location_text || '',
        latitude: lat || 18.5204,
        longitude: lon || 73.8567,
        priority,
        status: 'SUBMITTED',
        due_date: dueDate.toISOString(),
        created_at: new Date().toISOString(),
        resolved_at: null,
      };
      mDb.complaints.unshift(newComplaint);

      mDb.history.push({
        history_id: mDb.history.length + 1,
        complaint_id: newComplaint.complaint_id,
        old_status: null,
        new_status: 'SUBMITTED',
        changed_by: userId,
        changed_at: new Date().toISOString(),
        remarks: 'Complaint registered by citizen.',
      });

      mDb.notifications.unshift({
        notification_id: mDb.notifications.length + 1,
        user_id: userId,
        complaint_id: newComplaint.complaint_id,
        type: 'COMPLAINT_SUBMITTED',
        message: `Your complaint #${newComplaint.complaint_id} '${title}' has been registered.`,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      return res.status(201).json({ success: true, complaint: newComplaint });
    }
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ success: false, message: 'Server error saving complaint.' });
  }
};

// ----------------------------------------------------------------------------
// LIST COMPLAINTS (Role-aware, Filter, Search, Pagination)
// ----------------------------------------------------------------------------
exports.listComplaints = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      status,
      category_id,
      department_id,
      ward_id,
      priority,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC',
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const userRole = req.user.role;
    const userId = req.user.userId;

    if (db.isPostgresAvailable()) {
      let conditions = [];
      let params = [];

      // Role isolation
      if (userRole === 'CITIZEN') {
        params.push(userId);
        conditions.push(`c.user_id = $${params.length}`);
      } else if (userRole === 'OFFICER') {
        params.push(userId);
        conditions.push(`c.assigned_officer_id = $${params.length}`);
      }

      if (status) {
        params.push(status);
        conditions.push(`c.status = $${params.length}`);
      }
      if (category_id) {
        params.push(parseInt(category_id, 10));
        conditions.push(`c.category_id = $${params.length}`);
      }
      if (department_id) {
        params.push(parseInt(department_id, 10));
        conditions.push(`c.department_id = $${params.length}`);
      }
      if (ward_id) {
        params.push(parseInt(ward_id, 10));
        conditions.push(`c.ward_id = $${params.length}`);
      }
      if (priority) {
        params.push(priority);
        conditions.push(`c.priority = $${params.length}`);
      }
      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(c.title ILIKE $${params.length} OR c.description ILIKE $${params.length} OR c.location_text ILIKE $${params.length})`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const allowedSortCols = ['created_at', 'priority', 'status', 'due_date'];
      const cleanSort = allowedSortCols.includes(sort_by) ? `c.${sort_by}` : 'c.created_at';
      const cleanOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const countSql = `SELECT COUNT(*) FROM complaints c ${whereClause}`;
      const countRes = await db.query(countSql, params);
      const total = parseInt(countRes.rows[0].count, 10);

      const listSql = `
        SELECT c.*,
               cat.category_name, cat.category_group,
               d.department_name,
               w.ward_name, w.zone,
               u.name AS citizen_name,
               off.name AS officer_name,
               f.rating AS citizen_rating
        FROM complaints c
        JOIN categories cat ON c.category_id = cat.category_id
        LEFT JOIN departments d ON c.department_id = d.department_id
        JOIN wards w ON c.ward_id = w.ward_id
        JOIN users u ON c.user_id = u.user_id
        LEFT JOIN users off ON c.assigned_officer_id = off.user_id
        LEFT JOIN feedback f ON c.complaint_id = f.complaint_id
        ${whereClause}
        ORDER BY ${cleanSort} ${cleanOrder}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2};
      `;
      const listParams = [...params, parseInt(limit, 10), offset];
      const listRes = await db.query(listSql, listParams);

      return res.json({
        success: true,
        data: listRes.rows,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / parseInt(limit, 10)),
        },
      });
    } else {
      // Memory fallback
      const mDb = db.getMemoryDb();
      let list = mDb.complaints.slice();

      if (userRole === 'CITIZEN') {
        list = list.filter((c) => c.user_id === userId);
      } else if (userRole === 'OFFICER') {
        list = list.filter((c) => c.assigned_officer_id === userId);
      }

      if (status) list = list.filter((c) => c.status === status);
      if (category_id) list = list.filter((c) => c.category_id === parseInt(category_id, 10));
      if (department_id) list = list.filter((c) => c.department_id === parseInt(department_id, 10));
      if (ward_id) list = list.filter((c) => c.ward_id === parseInt(ward_id, 10));
      if (priority) list = list.filter((c) => c.priority === priority);
      if (search) {
        const s = search.toLowerCase();
        list = list.filter((c) => (c.title && c.title.toLowerCase().includes(s)) || (c.description && c.description.toLowerCase().includes(s)));
      }

      // Sort
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const total = list.length;
      const paged = list.slice(offset, offset + parseInt(limit, 10)).map((c) => {
        const cat = mDb.categories.find((x) => x.category_id === c.category_id);
        const dept = mDb.departments.find((x) => x.department_id === c.department_id);
        const ward = mDb.wards.find((x) => x.ward_id === c.ward_id);
        const citizen = mDb.users.find((x) => x.user_id === c.user_id);
        const officer = mDb.users.find((x) => x.user_id === c.assigned_officer_id);
        const fb = mDb.feedback.find((x) => x.complaint_id === c.complaint_id);

        return {
          ...c,
          category_name: cat ? cat.category_name : 'Unknown',
          category_group: cat ? cat.category_group : 'General',
          department_name: dept ? dept.department_name : 'Unassigned',
          ward_name: ward ? ward.ward_name : 'Unknown',
          zone: ward ? ward.zone : 'Unknown',
          citizen_name: citizen ? citizen.name : 'Citizen',
          officer_name: officer ? officer.name : null,
          citizen_rating: fb ? fb.rating : null,
        };
      });

      return res.json({
        success: true,
        data: paged,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / parseInt(limit, 10)),
        },
      });
    }
  } catch (error) {
    console.error('List complaints error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving complaints.' });
  }
};

// ----------------------------------------------------------------------------
// GET COMPLAINT BY ID (With History and Feedback)
// ----------------------------------------------------------------------------
exports.getComplaintById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const role = req.user.role;

    if (db.isPostgresAvailable()) {
      const sql = `
        SELECT c.*,
               cat.category_name, cat.category_group,
               d.department_name,
               w.ward_name, w.zone,
               u.name AS citizen_name, u.email AS citizen_email, u.phone AS citizen_phone,
               off.name AS officer_name, off.email AS officer_email,
               f.rating AS feedback_rating, f.comment AS feedback_comment, f.created_at AS feedback_date
        FROM complaints c
        JOIN categories cat ON c.category_id = cat.category_id
        LEFT JOIN departments d ON c.department_id = d.department_id
        JOIN wards w ON c.ward_id = w.ward_id
        JOIN users u ON c.user_id = u.user_id
        LEFT JOIN users off ON c.assigned_officer_id = off.user_id
        LEFT JOIN feedback f ON c.complaint_id = f.complaint_id
        WHERE c.complaint_id = $1;
      `;
      const result = await db.query(sql, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Complaint not found.' });
      }

      const complaint = result.rows[0];

      // Access authorization
      if (role === 'CITIZEN' && complaint.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only view your own complaints.' });
      }
      if (role === 'OFFICER' && complaint.assigned_officer_id !== userId && complaint.department_id !== req.user.departmentId) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only view complaints assigned to you.' });
      }

      // Fetch status history timeline
      const histSql = `
        SELECT h.*, u.name AS changer_name, u.role AS changer_role
        FROM complaint_status_history h
        LEFT JOIN users u ON h.changed_by = u.user_id
        WHERE h.complaint_id = $1
        ORDER BY h.changed_at ASC;
      `;
      const histResult = await db.query(histSql, [id]);
      complaint.history = histResult.rows;

      return res.json({ success: true, complaint });
    } else {
      // Memory fallback
      const mDb = db.getMemoryDb();
      const c = mDb.complaints.find((x) => x.complaint_id === id);
      if (!c) return res.status(404).json({ success: false, message: 'Complaint not found.' });

      if (role === 'CITIZEN' && c.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only view your own complaints.' });
      }

      const cat = mDb.categories.find((x) => x.category_id === c.category_id);
      const dept = mDb.departments.find((x) => x.department_id === c.department_id);
      const ward = mDb.wards.find((x) => x.ward_id === c.ward_id);
      const citizen = mDb.users.find((x) => x.user_id === c.user_id);
      const officer = mDb.users.find((x) => x.user_id === c.assigned_officer_id);
      const fb = mDb.feedback.find((x) => x.complaint_id === c.complaint_id);

      const history = mDb.history
        .filter((h) => h.complaint_id === id)
        .map((h) => {
          const u = mDb.users.find((x) => x.user_id === h.changed_by);
          return { ...h, changer_name: u ? u.name : 'System', changer_role: u ? u.role : 'SYSTEM' };
        });

      return res.json({
        success: true,
        complaint: {
          ...c,
          category_name: cat ? cat.category_name : 'Unknown',
          category_group: cat ? cat.category_group : 'General',
          department_name: dept ? dept.department_name : 'Unassigned',
          ward_name: ward ? ward.ward_name : 'Unknown',
          zone: ward ? ward.zone : 'Unknown',
          citizen_name: citizen ? citizen.name : 'Citizen',
          officer_name: officer ? officer.name : null,
          feedback_rating: fb ? fb.rating : null,
          feedback_comment: fb ? fb.comment : null,
          history,
        },
      });
    }
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving complaint details.' });
  }
};

// ----------------------------------------------------------------------------
// UPDATE COMPLAINT STATUS (Transactions & State Machine Enforcement)
// ----------------------------------------------------------------------------
exports.updateStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status: newStatus, remarks } = req.body;
    const userId = req.user.userId;
    const role = req.user.role;

    if (!newStatus) {
      return res.status(422).json({ success: false, message: 'Target status is required.' });
    }

    if (db.isPostgresAvailable()) {
      const client = await db.getClient();
      try {
        await client.query('BEGIN');

        const currentRes = await client.query('SELECT * FROM complaints WHERE complaint_id = $1 FOR UPDATE', [id]);
        if (currentRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ success: false, message: 'Complaint not found.' });
        }
        const current = currentRes.rows[0];

        // Authorization check
        if (role === 'OFFICER' && current.assigned_officer_id !== userId) {
          await client.query('ROLLBACK');
          return res.status(403).json({ success: false, message: 'You can only update complaints assigned to you.' });
        }

        // State machine validation
        const allowed = VALID_TRANSITIONS[current.status] || [];
        if (!allowed.includes(newStatus) && role !== 'ADMIN') {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Invalid status transition from ${current.status} to ${newStatus}. Allowed: ${allowed.join(', ')}`,
          });
        }

        const resolvedAt = (newStatus === 'RESOLVED' && !current.resolved_at) ? new Date() : current.resolved_at;

        // Update complaint
        await client.query(
          `UPDATE complaints SET status = $1, resolved_at = $2 WHERE complaint_id = $3`,
          [newStatus, resolvedAt, id]
        );

        // Audit in complaint_status_history
        await client.query(
          `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, remarks)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, current.status, newStatus, userId, remarks || `Status transitioned to ${newStatus}`]
        );

        // Send notification to citizen
        await client.query(
          `INSERT INTO notifications (user_id, complaint_id, type, message)
           VALUES ($1, $2, 'STATUS_UPDATE', $3)`,
          [current.user_id, id, `Your complaint #${id} status changed to ${newStatus}. Remarks: ${remarks || 'None'}`]
        );

        await client.query('COMMIT');
        return res.json({ success: true, message: `Status updated to ${newStatus}.` });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      // Memory fallback
      const mDb = db.getMemoryDb();
      const c = mDb.complaints.find((x) => x.complaint_id === id);
      if (!c) return res.status(404).json({ success: false, message: 'Complaint not found.' });

      const oldStatus = c.status;
      c.status = newStatus;
      if (newStatus === 'RESOLVED' && !c.resolved_at) {
        c.resolved_at = new Date().toISOString();
      }

      mDb.history.push({
        history_id: mDb.history.length + 1,
        complaint_id: id,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: userId,
        changed_at: new Date().toISOString(),
        remarks: remarks || `Status changed to ${newStatus}`,
      });

      mDb.notifications.unshift({
        notification_id: mDb.notifications.length + 1,
        user_id: c.user_id,
        complaint_id: id,
        type: 'STATUS_UPDATE',
        message: `Complaint #${id} updated to ${newStatus}.`,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      return res.json({ success: true, message: `Status updated to ${newStatus}.` });
    }
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating complaint status.' });
  }
};

// ----------------------------------------------------------------------------
// ASSIGN COMPLAINT (Department & Officer Assignment - Admin only)
// ----------------------------------------------------------------------------
exports.assignComplaint = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { department_id, assigned_officer_id, remarks } = req.body;
    const adminId = req.user.userId;

    const deptId = department_id ? parseInt(department_id, 10) : null;
    const officerId = assigned_officer_id ? parseInt(assigned_officer_id, 10) : null;

    if (db.isPostgresAvailable()) {
      const client = await db.getClient();
      try {
        await client.query('BEGIN');

        const currentRes = await client.query('SELECT * FROM complaints WHERE complaint_id = $1 FOR UPDATE', [id]);
        if (currentRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ success: false, message: 'Complaint not found.' });
        }
        const current = currentRes.rows[0];

        await client.query(
          `UPDATE complaints SET department_id = $1, assigned_officer_id = $2, status = 'ASSIGNED' WHERE complaint_id = $3`,
          [deptId, officerId, id]
        );

        await client.query(
          `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, remarks)
           VALUES ($1, $2, 'ASSIGNED', $3, $4)`,
          [id, current.status, adminId, remarks || 'Assigned to municipal department and handling officer.']
        );

        // Notify citizen
        await client.query(
          `INSERT INTO notifications (user_id, complaint_id, type, message)
           VALUES ($1, $2, 'COMPLAINT_ASSIGNED', $3)`,
          [current.user_id, id, `Your complaint #${id} has been assigned for resolution.`]
        );

        // Notify officer if assigned
        if (officerId) {
          await client.query(
            `INSERT INTO notifications (user_id, complaint_id, type, message)
             VALUES ($1, $2, 'OFFICER_ASSIGNED', $3)`,
            [officerId, id, `New case #${id} assigned to you: '${current.title}'`]
          );
        }

        await client.query('COMMIT');
        return res.json({ success: true, message: 'Complaint assigned successfully.' });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      // Memory fallback
      const mDb = db.getMemoryDb();
      const c = mDb.complaints.find((x) => x.complaint_id === id);
      if (!c) return res.status(404).json({ success: false, message: 'Complaint not found.' });

      const oldStatus = c.status;
      c.department_id = deptId;
      c.assigned_officer_id = officerId;
      c.status = 'ASSIGNED';

      mDb.history.push({
        history_id: mDb.history.length + 1,
        complaint_id: id,
        old_status: oldStatus,
        new_status: 'ASSIGNED',
        changed_by: adminId,
        changed_at: new Date().toISOString(),
        remarks: remarks || 'Assigned to department and officer.',
      });

      return res.json({ success: true, message: 'Complaint assigned successfully.' });
    }
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({ success: false, message: 'Server error assigning complaint.' });
  }
};
