const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { getProfile, updateProfile, updatePhoto, updatePassword } = require("../controllers/settingsController");

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/photo", verifyToken, updatePhoto);
router.put("/password", verifyToken, updatePassword);

module.exports = router;