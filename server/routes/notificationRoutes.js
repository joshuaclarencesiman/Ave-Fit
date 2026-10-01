const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification
} = require("../controllers/notificationController");

router.get("/", verifyToken, getNotifications);
router.get("/unread-count", verifyToken, getUnreadCount);
router.put("/:id/read", verifyToken, markAsRead);
router.put("/mark-all-read", verifyToken, markAllAsRead);
router.delete("/:id", verifyToken, deleteNotification);

module.exports = router;