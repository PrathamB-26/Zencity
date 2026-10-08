const db = require('../config/db');

exports.createFeedback = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { complaint_id, rating, comment } = req.body;

    const cid = parseInt(complaint_id, 10);
    const rVal = parseInt(rating, 10);

    if (!cid || !rVal || rVal < 1 || rVal > 5) {
      return res.status(422).json({
        success: false,
        message: 'Valid complaint ID and rating (1-5) are required.',
      });
    }

    if (db.isPostgresAvailable()) {
      const client = await db.getClient();
      try {
        await client.query('BEGIN');

        // Verify complaint is owned by citizen and is RESOLVED
        const cRes = await client.query('SELECT * FROM complaints WHERE complaint_id = $1 FOR UPDATE', [cid]);
        if (cRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ success: false, message: 'Complaint not found.' });
        }

        const complaint = cRes.rows[0];
        if (complaint.user_id !== userId) {
          await client.query('ROLLBACK');
          return res.status(403).json({ success: false, message: 'You can only provide feedback on your own complaints.' });
        }

        if (complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED') {
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, message: 'Feedback is only eligible once a complaint has been RESOLVED.' });
        }

        // Check if feedback already exists
        const existingFb = await client.query('SELECT feedback_id FROM feedback WHERE complaint_id = $1', [cid]);
        if (existingFb.rows.length > 0) {
          await client.query('ROLLBACK');
          return res.status(409).json({ success: false, message: 'Feedback has already been submitted for this complaint.' });
        }

        // Insert feedback
        const fbRes = await client.query(
          `INSERT INTO feedback (complaint_id, user_id, rating, comment)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [cid, userId, rVal, comment || null]
        );

        // Transition complaint status to CLOSED
        if (complaint.status === 'RESOLVED') {
          await client.query("UPDATE complaints SET status = 'CLOSED' WHERE complaint_id = $1", [cid]);
          await client.query(
            `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, remarks)
             VALUES ($1, 'RESOLVED', 'CLOSED', $2, 'Citizen feedback recorded. Case verified and closed.')`,
            [cid, userId]
          );
        }

        await client.query('COMMIT');
        return res.status(201).json({ success: true, feedback: fbRes.rows[0], message: 'Thank you! Your feedback has been recorded.' });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      // Memory fallback
      const mDb = db.getMemoryDb();
      const complaint = mDb.complaints.find((x) => x.complaint_id === cid);
      if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
      if (complaint.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'You can only provide feedback on your own complaints.' });
      }
      if (complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED') {
        return res.status(400).json({ success: false, message: 'Feedback is only eligible once a complaint has been RESOLVED.' });
      }

      const existing = mDb.feedback.find((x) => x.complaint_id === cid);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Feedback has already been submitted.' });
      }

      const newFb = {
        feedback_id: mDb.feedback.length + 1,
        complaint_id: cid,
        user_id: userId,
        rating: rVal,
        comment: comment || '',
        created_at: new Date().toISOString(),
      };
      mDb.feedback.push(newFb);

      if (complaint.status === 'RESOLVED') {
        complaint.status = 'CLOSED';
        mDb.history.push({
          history_id: mDb.history.length + 1,
          complaint_id: cid,
          old_status: 'RESOLVED',
          new_status: 'CLOSED',
          changed_by: userId,
          changed_at: new Date().toISOString(),
          remarks: 'Citizen feedback recorded. Case verified and closed.',
        });
      }

      return res.status(201).json({ success: true, feedback: newFb, message: 'Thank you! Your feedback has been recorded.' });
    }
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ success: false, message: 'Server error recording feedback.' });
  }
};
