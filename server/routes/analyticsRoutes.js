const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { getDashboardStats, getAnalytics } = require("../controllers/analyticsController");

router.get("/dashboard", verifyToken, getDashboardStats);
router.get("/", verifyToken, getAnalytics);

module.exports = router;