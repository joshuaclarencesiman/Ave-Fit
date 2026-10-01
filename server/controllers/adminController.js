const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateEmail, normalizeEmail } = require("../utils/security");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validateEmail(email) || typeof password !== "string" || password.length === 0)
      return res.status(400).json({ success: false, message: "Please provide a valid email and password." });

    const result = await db.query(
      "SELECT admin_id, full_name, email, password, role, photo_url, account_status, token_version FROM admins WHERE LOWER(email) = $1",
      [normalizeEmail(email)]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const admin = result.rows[0];

    // Column is "password" (not password_hash)
    if (String(admin.account_status || "Active").toLowerCase() !== "active")
      return res.status(403).json({ success: false, message: "This admin account is inactive." });

    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { admin_id: admin.admin_id, email: admin.email, role: admin.role, token_version: Number(admin.token_version || 0) },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        id: admin.admin_id,
        name: admin.full_name,
        email: admin.email,
        role: admin.role,
        photo_url: admin.photo_url,
      },
    });
  } catch (error) {
    console.error("loginAdmin error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { loginAdmin };