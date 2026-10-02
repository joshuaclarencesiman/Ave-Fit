const pool = require("../db");

// =====================================================
// GET ALL MEMBERS FROM USERS TABLE
// =====================================================
const getMembers = async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT
    u.user_id AS member_id,
    u.user_id,
    u.first_name,
    u.last_name,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.email,
    u.phone,
    u.gender,
    u.birth_date,
    u.age,
    u.height,
    u.weight,

    CASE
        WHEN u.height IS NOT NULL
         AND u.height > 0
         AND u.weight IS NOT NULL
        THEN ROUND(
            (u.weight / POWER(u.height / 100.0, 2))::numeric,
            2
        )
        ELSE NULL
    END AS bmi,

    u.fitness_goal,
    u.activity_level,
    u.target_weight,
    u.workout_days_per_week,
    u.workout_duration,
    u.preferred_days,
    u.intensity,
    u.injuries,
    u.health_conditions,
    u.profile_image,
    u.trainer_id,

    t.full_name AS trainer_name,
    t.photo_url AS trainer_photo_url,
    t.bio AS trainer_bio,

    INITCAP(LOWER(COALESCE(u.account_status, 'pending'))) AS status,

    COALESCE(u.email_verified, FALSE) AS email_verified,
    u.email_verified_at,

    u.created_at AS joined_date,
    u.created_at,
    u.updated_at

FROM users u

LEFT JOIN trainers t
    ON t.trainer_id = u.trainer_id


ORDER BY u.user_id DESC;
    `);

    console.log(`✅ Retrieved ${result.rows.length} users from users table`);

    res.json({ success: true, data: result.rows });

  } catch (error) {
    console.error("❌ Error fetching members:", error);

    res.status(500).json({
      message: "Failed to fetch members",
      error: error.message
    });
  }
};


// =====================================================
// GET SINGLE MEMBER
// =====================================================
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        u.user_id AS member_id,
        u.user_id,
        u.first_name,
        u.last_name,
        TRIM(
          CONCAT(
            COALESCE(u.first_name, ''),
            ' ',
            COALESCE(u.last_name, '')
          )
        ) AS full_name,

        u.email,
        u.phone,
            u.gender,
        u.birth_date,
        u.age,
        u.height,
        u.weight,

        CASE
          WHEN u.height IS NOT NULL
            AND u.height > 0
            AND u.weight IS NOT NULL
          THEN ROUND(
            (u.weight / POWER(u.height / 100.0, 2))::numeric,
            2
          )
          ELSE NULL
        END AS bmi,

        u.fitness_goal,
        u.activity_level,
        u.target_weight,
        u.workout_days_per_week,
        u.workout_duration,
        u.preferred_days,
        u.intensity,
        u.injuries,
        u.health_conditions,

        u.profile_image,
        u.trainer_id,

        t.full_name AS trainer_name,
        t.photo_url AS trainer_photo_url,
        t.bio AS trainer_bio,

        INITCAP(LOWER(COALESCE(u.account_status, 'pending'))) AS status,

        COALESCE(u.email_verified, FALSE) AS email_verified,
        u.email_verified_at,

        u.created_at AS joined_date,
        u.created_at AS joined_date,
        u.updated_at

      FROM users u

      LEFT JOIN trainers t
        ON t.trainer_id = u.trainer_id

      WHERE u.user_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("❌ Error fetching member:", error);

    res.status(500).json({
      message: "Failed to fetch member",
      error: error.message
    });
  }
};


// =====================================================
// ASSIGN / CHANGE TRAINER
// ADMIN ONLY
// =====================================================
const assignTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { trainer_id } = req.body;

    // Allow removing trainer
    const trainerIdValue =
      trainer_id === null ||
      trainer_id === "" ||
      trainer_id === undefined
        ? null
        : Number(trainer_id);

    if (trainerIdValue !== null && Number.isNaN(trainerIdValue)) {
      return res.status(400).json({
        message: "Invalid trainer_id"
      });
    }

    // Make sure member exists
    const memberCheck = await pool.query(
      `SELECT user_id FROM users WHERE user_id = $1`,
      [id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    // If assigning a trainer, verify trainer exists and is active
    if (trainerIdValue !== null) {
      const trainerCheck = await pool.query(
        `
        SELECT trainer_id
        FROM trainers
        WHERE trainer_id = $1
          AND COALESCE(status, 'Active') = 'Active'
        `,
        [trainerIdValue]
      );

      if (trainerCheck.rows.length === 0) {
        return res.status(404).json({
          message: "Trainer not found or inactive"
        });
      }
    }

    // Update users table
    const result = await pool.query(
      `
      UPDATE users
      SET
        trainer_id = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING
        user_id,
        trainer_id
      `,
      [trainerIdValue, id]
    );

    res.json({
      message:
        trainerIdValue === null
          ? "Trainer removed successfully"
          : "Trainer assigned successfully",
      member: result.rows[0]
    });

  } catch (error) {
    console.error("❌ Error assigning trainer:", error);

    res.status(500).json({
      message: "Failed to assign trainer",
      error: error.message
    });
  }
};


// =====================================================
// CREATE MEMBER
// =====================================================
const createMember = async (req, res) => {
  return res.status(400).json({
    message: "Members are created through user registration."
  });
};


// =====================================================
// UPDATE MEMBER
// =====================================================
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      first_name,
      last_name,
      email,
      phone,
      gender,
      birth_date,
      age,
      height,
      weight,
      fitness_goal,
      activity_level,
      target_weight
    } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        gender = COALESCE($5, gender),
        birth_date = COALESCE($6, birth_date),
        age = COALESCE($7, age),
        height = COALESCE($8, height),
        weight = COALESCE($9, weight),
        fitness_goal = COALESCE($10, fitness_goal),
        activity_level = COALESCE($11, activity_level),
        target_weight = COALESCE($12, target_weight),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $13
      RETURNING *
      `,
      [
        first_name,
        last_name,
        email,
        phone,
        gender,
        birth_date,
        age,
        height,
        weight,
        fitness_goal,
        activity_level,
        target_weight,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    res.json({
      message: "Member updated successfully",
      member: result.rows[0]
    });

  } catch (error) {
    console.error("❌ Error updating member:", error);

    res.status(500).json({
      message: "Failed to update member",
      error: error.message
    });
  }
};


// =====================================================
// APPROVE MEMBER
// =====================================================
const approveMember = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE users
      SET
        account_status = 'Active',
        token_version = token_version + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING user_id, account_status
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    await pool.query(
      "UPDATE members SET status = 'Active' WHERE email = (SELECT email FROM users WHERE user_id = $1)",
      [id]
    ).catch(() => {});

    res.json({
      message: "Member approved successfully",
      member: result.rows[0]
    });

  } catch (error) {
    console.error("❌ Error approving member:", error);

    res.status(500).json({
      message: "Failed to approve member",
      error: error.message
    });
  }
};


// =====================================================
// REJECT MEMBER
// =====================================================
const rejectMember = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE users
      SET
        account_status = 'Rejected',
        token_version = token_version + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING user_id, account_status
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    await pool.query(
      "UPDATE members SET status = 'Inactive' WHERE email = (SELECT email FROM users WHERE user_id = $1)",
      [id]
    ).catch(() => {});

    res.json({
      message: "Member rejected successfully",
      member: result.rows[0]
    });

  } catch (error) {
    console.error("❌ Error rejecting member:", error);

    res.status(500).json({
      message: "Failed to reject member",
      error: error.message
    });
  }
};


// =====================================================
// DELETE MEMBER
// =====================================================
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM users
      WHERE user_id = $1
      RETURNING user_id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    res.json({
      message: "Member deleted successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting member:", error);

    res.status(500).json({
      message: "Failed to delete member",
      error: error.message
    });
  }
};


// =====================================================
// MEMBER PROGRESS
// =====================================================
const getMemberProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM progress_logs
      WHERE user_id = $1
      ORDER BY log_date DESC
      `,
      [id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("❌ Error fetching progress:", error);

    res.status(500).json({
      message: "Failed to fetch member progress",
      error: error.message
    });
  }
};


module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  assignTrainer,
  approveMember,
  rejectMember,
  deleteMember,
  getMemberProgress
};