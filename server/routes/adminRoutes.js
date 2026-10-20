const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/adminAuthMiddleware");
<<<<<<< HEAD
const { adminLoginLimiter, adminPasswordResetRequestLimiter, adminPasswordResetAttemptLimiter } = require("../middleware/rateLimit");
const { loginAdmin, requestAdminPasswordReset, resetAdminPassword } = require("../controllers/adminController");

router.post("/login", adminLoginLimiter, loginAdmin);
router.post("/forgot-password", adminPasswordResetRequestLimiter, requestAdminPasswordReset);
router.post("/reset-password", adminPasswordResetAttemptLimiter, resetAdminPassword);
=======
const { adminLoginLimiter } = require("../middleware/rateLimit");
const { loginAdmin } = require("../controllers/adminController");

router.post("/login", adminLoginLimiter, loginAdmin);
>>>>>>> origin/master

module.exports = router;