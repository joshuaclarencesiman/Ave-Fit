const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/adminAuthMiddleware");
const { adminLoginLimiter } = require("../middleware/rateLimit");
const { loginAdmin } = require("../controllers/adminController");

router.post("/login", adminLoginLimiter, loginAdmin);

module.exports = router;