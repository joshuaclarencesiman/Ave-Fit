const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
<<<<<<< HEAD
const { getProfile, updateProfile, updatePhoto } = require("../controllers/settingsController");
=======
const { getProfile, updateProfile, updatePhoto, updatePassword } = require("../controllers/settingsController");
>>>>>>> origin/master

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/photo", verifyToken, updatePhoto);
<<<<<<< HEAD
=======
router.put("/password", verifyToken, updatePassword);
>>>>>>> origin/master

module.exports = router;