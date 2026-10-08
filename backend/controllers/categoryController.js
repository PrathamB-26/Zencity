const db = require('../config/db');

exports.listCategories = async (req, res) => {
  try {
    if (db.isPostgresAvailable()) {
      const result = await db.query(`
        SELECT c.*, d.department_name, COUNT(comp.complaint_id) AS complaint_count
        FROM categories c
        LEFT JOIN departments d ON c.default_department_id = d.department_id
        LEFT JOIN complaints comp ON c.category_id = comp.category_id
        GROUP BY c.category_id, d.department_name
        ORDER BY c.category_group, c.category_name;
      `);
      return res.json({ success: true, data: result.rows });
    } else {
      const mDb = db.getMemoryDb();
      const list = mDb.categories.map((c) => {
        const d = mDb.departments.find((x) => x.department_id === c.default_department_id);
        const count = mDb.complaints.filter((comp) => comp.category_id === c.category_id).length;
        return {
          ...c,
          department_name: d ? d.department_name : null,
          complaint_count: count,
        };
      });
      return res.json({ success: true, data: list });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving categories.' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { category_name, category_group, description, default_department_id } = req.body;
    if (!category_name || !category_group) {
      return res.status(422).json({ success: false, message: 'Category name and group are required.' });
    }

    if (db.isPostgresAvailable()) {
      const result = await db.query(
        `INSERT INTO categories (category_name, category_group, description, default_department_id)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [category_name, category_group, description || null, default_department_id || null]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    } else {
      const mDb = db.getMemoryDb();
      const newCat = {
        category_id: mDb.categories.length + 1,
        category_name,
        category_group,
        description: description || '',
        default_department_id: default_department_id ? parseInt(default_department_id, 10) : null,
        is_active: true,
      };
      mDb.categories.push(newCat);
      return res.status(201).json({ success: true, data: newCat });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating category.' });
  }
};
