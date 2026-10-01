const express = require("express");
const router = express.Router();
const verifyUser = require("../middleware/userAuthMiddleware");
const pool = require("../db");

// GET all exercises (public for users)
router.get("/", verifyUser, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, c.category_name
      FROM exercises e
      LEFT JOIN exercise_categories c ON e.category_id = c.category_id
      ORDER BY e.exercise_name ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET exercise categories
router.get("/categories", verifyUser, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM exercise_categories ORDER BY category_name ASC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;