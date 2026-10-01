const pool = require("../db");
const bcrypt = require("bcrypt");
const { validatePassword, validateImageDataUrl } = require("../utils/security");

// GET admin profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT admin_id, full_name, email, role, photo_url, created_at FROM admins WHERE admin_id = $1",
      [req.admin.admin_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Admin not found." });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getProfile error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, email } = req.body;
    await pool.query(
      "UPDATE admins SET full_name=$1, email=$2, updated_at=NOW() WHERE admin_id=$3",
      [full_name, email, req.admin.admin_id]
    );
    res.json({ success: true, message: "Profile updated." });
  } catch (err) {
    console.error("updateProfile error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update just the profile photo
const updatePhoto = async (req, res) => {
  try {
    const { photo_url } = req.body;
    if (!photo_url) return res.status(400).json({ success: false, message: "photo_url is required." });
    const imageCheck = validateImageDataUrl(photo_url);
    if (!imageCheck.ok) return res.status(400).json({ success: false, message: imageCheck.message });
    await pool.query(
      "UPDATE admins SET photo_url=$1, updated_at=NOW() WHERE admin_id=$2",
      [photo_url, req.admin.admin_id]
    );
    res.json({ success: true, message: "Photo updated." });
  } catch (err) {
    console.error("updatePhoto error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update password
const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !validatePassword(new_password)) return res.status(400).json({ success: false, message: "Use 8–12 characters with a letter, a number, and a symbol. Avoid common passwords." });

    const result = await pool.query(
      "SELECT password FROM admins WHERE admin_id = $1",
      [req.admin.admin_id]
    );

    const valid = await bcrypt.compare(current_password, result.rows[0].password);
    if (!valid)
      return res.status(401).json({ success: false, message: "Current password is incorrect." });

    const hashed = await bcrypt.hash(new_password, 12);
    await pool.query(
      "UPDATE admins SET password=$1, token_version=token_version+1, updated_at=NOW() WHERE admin_id=$2",
      [hashed, req.admin.admin_id]
    );

    res.json({ success: true, message: "Password updated." });
  } catch (err) {
    console.error("updatePassword error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile, updatePhoto, updatePassword };