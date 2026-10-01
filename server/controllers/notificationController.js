const pool = require("../db");

// GET all notifications
const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        n.notification_id,
        n.message,
        n.is_read,
        n.created_at,
        n.notification_type,
        u.first_name || ' ' || u.last_name AS user_name
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.user_id
      ORDER BY n.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getNotifications error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET unread count
const getUnreadCount = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE is_read = false"
    );
    res.json({ success: true, count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error("getUnreadCount error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT mark one as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE notification_id = $1",
      [id]
    );
    res.json({ success: true, message: "Marked as read." });
  } catch (err) {
    console.error("markAsRead error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read = true WHERE is_read = false");
    res.json({ success: true, message: "All marked as read." });
  } catch (err) {
    console.error("markAllAsRead error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE one notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM notifications WHERE notification_id = $1", [id]);
    res.json({ success: true, message: "Notification deleted." });
  } catch (err) {
    console.error("deleteNotification error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };