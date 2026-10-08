const db = require('../config/db');

exports.listNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (db.isPostgresAvailable()) {
      const result = await db.query(
        `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [userId]
      );
      return res.json({ success: true, data: result.rows });
    } else {
      const mDb = db.getMemoryDb();
      const userNotifs = mDb.notifications
        .filter((n) => n.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 50);
      return res.json({ success: true, data: userNotifs });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifId = req.params.id ? parseInt(req.params.id, 10) : null;

    if (db.isPostgresAvailable()) {
      if (notifId) {
        await db.query(`UPDATE notifications SET is_read = true WHERE notification_id = $1 AND user_id = $2`, [notifId, userId]);
      } else {
        await db.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [userId]);
      }
      return res.json({ success: true, message: 'Notification marked as read.' });
    } else {
      const mDb = db.getMemoryDb();
      if (notifId) {
        const item = mDb.notifications.find((n) => n.notification_id === notifId && n.user_id === userId);
        if (item) item.is_read = true;
      } else {
        mDb.notifications.forEach((n) => {
          if (n.user_id === userId) n.is_read = true;
        });
      }
      return res.json({ success: true, message: 'Notification marked as read.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating notification.' });
  }
};
