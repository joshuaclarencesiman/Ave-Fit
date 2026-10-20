const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateImageDataUrl,
  normalizeEmail,
} = require("../utils/security");

const ALLOWED_SPECIALIZATIONS = [
  "High-Intensity Interval Training (HIIT)",
  "Circuit Training",
  "Olympic Weightlifting",
  "Powerlifting",
  "Calisthenics & Bodyweight",
  "Kettlebell Training",
  "Functional Fitness",
  "CrossFit Coaching",
  "Bodybuilding & Physique",
  "Weight Loss & Management",
  "Group Fitness",
];

const sanitizeSpecializations = (values) =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : []).filter((value) =>
        ALLOWED_SPECIALIZATIONS.includes(value)
      )
    )
  );

// Convert the frontend array into the existing database TEXT column.
const specializationToText = (values) => {
  return sanitizeSpecializations(values).join(", ");
};

// Convert the database TEXT value back into an array for the frontend.
const specializationToArray = (value) => {
  if (!value || typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => ALLOWED_SPECIALIZATIONS.includes(item));
};

// GET all trainers
const getTrainers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT trainer_id, full_name, email, phone, specialization, profile_image, status, created_at, updated_at
       FROM trainers
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows.map((trainer) => ({
        ...trainer,
        specializations: specializationToArray(trainer.specialization),
      })),
    });
  } catch (err) {
    console.error("getTrainers error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET trainer by ID
const getTrainerById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT trainer_id, full_name, email, phone, specialization, profile_image, status, created_at, updated_at
       FROM trainers
       WHERE trainer_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found.",
      });
    }

    const trainer = result.rows[0];

    res.json({
      success: true,
      data: {
        ...trainer,
        specializations: specializationToArray(trainer.specialization),
      },
    });
  } catch (err) {
    console.error("getTrainerById error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create trainer (admin) — optionally sets a portal login password
const createTrainer = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      specializations,
      password,
      photo_url,
      goal_specialty,
      bio,
    } = req.body;

    if (!validateName(full_name)) {
      return res.status(400).json({
        success: false,
        message: "Trainer name must be 2-50 characters.",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid trainer email.",
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number.",
      });
    }

    if (password && !validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Use 8–12 characters with a letter, a number, and a symbol. Avoid common passwords.",
      });
    }

    if (photo_url) {
      const imageCheck = validateImageDataUrl(photo_url);

      if (!imageCheck.ok) {
        return res.status(400).json({
          success: false,
          message: imageCheck.message,
        });
      }
    }

    const hashed = password ? await bcrypt.hash(password, 12) : null;

    const specialization = specializationToText(specializations);

    const result = await pool.query(
      `
      INSERT INTO trainers
        (full_name, email, phone, specialization, password, photo_url, goal_specialty, bio, status)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending')
      RETURNING
        trainer_id, full_name, email, phone, specialization,
        photo_url, goal_specialty, bio, status, created_at
      `,
      [
        String(full_name).trim(),
        normalizeEmail(email),
        phone ? String(phone).trim() : null,
        specialization,
        hashed,
        photo_url || null,
        goal_specialty || null,
        bio || null,
      ]
    );

    const trainer = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        ...trainer,
        specializations: specializationToArray(trainer.specialization),
      },
    });
  } catch (err) {
    console.error("createTrainer error:", err.message);

    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A trainer with that email already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to create trainer.",
    });
  }
};

// PUT update trainer (admin) — password only changes if a new one is provided
const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      email,
      phone,
      specializations,
      status,
      password,
      photo_url,
      goal_specialty,
      bio,
    } = req.body;

    if (!validateName(full_name)) {
      return res.status(400).json({
        success: false,
        message: "Trainer name must be 2-50 characters.",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid trainer email.",
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number.",
      });
    }

    if (!["Pending", "Active", "Rejected", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trainer status.",
      });
    }

    if (password && !validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Use 8–12 characters with a letter, a number, and a symbol. Avoid common passwords.",
      });
    }

    if (photo_url) {
      const imageCheck = validateImageDataUrl(photo_url);

      if (!imageCheck.ok) {
        return res.status(400).json({
          success: false,
          message: imageCheck.message,
        });
      }
    }

    const specialization = specializationToText(specializations);

    if (password) {
      const hashed = await bcrypt.hash(password, 12);

      await pool.query(
        `
        UPDATE trainers
        SET
          full_name = $1,
          email = $2,
          phone = $3,
          specialization = $4,
          status = $5,
          password = $6,
          token_version = token_version + 1,
          photo_url = COALESCE($7, photo_url),
          goal_specialty = COALESCE($8, goal_specialty),
          bio = COALESCE($9, bio),
          updated_at = NOW()
        WHERE trainer_id = $10
        `,
        [
          String(full_name).trim(),
          normalizeEmail(email),
          phone ? String(phone).trim() : null,
          specialization,
          status,
          hashed,
          photo_url || null,
          goal_specialty || null,
          bio || null,
          id,
        ]
      );
    } else {
      await pool.query(
        `
        UPDATE trainers
        SET
          full_name = $1,
          email = $2,
          phone = $3,
          specialization = $4,
          status = $5,
          token_version = token_version + 1,
          photo_url = COALESCE($6, photo_url),
          goal_specialty = COALESCE($7, goal_specialty),
          bio = COALESCE($8, bio),
          updated_at = NOW()
        WHERE trainer_id = $9
        `,
        [
          String(full_name).trim(),
          normalizeEmail(email),
          phone ? String(phone).trim() : null,
          specialization,
          status,
          photo_url || null,
          goal_specialty || null,
          bio || null,
          id,
        ]
      );
    }

    res.json({
      success: true,
      message: "Trainer updated.",
    });
  } catch (err) {
    console.error("updateTrainer error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// PUT approve trainer
const approveTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE trainers SET status = 'Active', token_version = token_version + 1, updated_at = NOW() WHERE trainer_id = $1 RETURNING trainer_id, status",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found.",
      });
    }

    res.json({
      success: true,
      message: "Trainer approved successfully.",
      trainer: result.rows[0],
    });
  } catch (err) {
    console.error("approveTrainer error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// PUT reject trainer
const rejectTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE trainers SET status = 'Rejected', token_version = token_version + 1, updated_at = NOW() WHERE trainer_id = $1 RETURNING trainer_id, status",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found.",
      });
    }

    res.json({
      success: true,
      message: "Trainer rejected.",
      trainer: result.rows[0],
    });
  } catch (err) {
    console.error("rejectTrainer error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// PUT deactivate trainer
const deactivateTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE trainers SET status = 'Inactive', token_version = token_version + 1, updated_at = NOW() WHERE trainer_id = $1",
      [id]
    );

    res.json({
      success: true,
      message: "Trainer deactivated.",
    });
  } catch (err) {
    console.error("deactivateTrainer error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET active trainers for the member-facing coach selection screen
const getActiveTrainers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        trainer_id,
        full_name,
        specialization,
        goal_specialty,
        photo_url,
        bio,
        phone,
        email
      FROM trainers
      WHERE status = 'Active'
      ORDER BY full_name ASC
    `);

    res.json({
      success: true,
      data: result.rows.map((trainer) => ({
        ...trainer,
        specializations: specializationToArray(trainer.specialization),
      })),
    });
  } catch (err) {
    console.error("getActiveTrainers error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET the members currently assigned to a trainer (admin view, by :id)
const getTrainerRoster = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.profile_image,
        u.gender,
        u.age,
        u.birth_date,
        u.height,
        u.weight,
        u.fitness_goal,
        u.target_weight,
        u.activity_level,
        u.intensity,
        u.injuries,
        u.health_conditions,
        u.preferred_days,
        u.workout_days_per_week,
        u.workout_duration,
        pl.weight AS latest_weight,
        pl.bmi AS latest_bmi,
        pl.log_date AS latest_log_date,
        workout_stats.assigned_workouts,
        workout_stats.completed_workouts
      FROM users u
      LEFT JOIN LATERAL (
        SELECT weight, bmi, log_date
        FROM progress_logs
        WHERE user_id = u.user_id
        ORDER BY log_date DESC
        LIMIT 1
      ) pl ON true
      LEFT JOIN LATERAL (
        SELECT
          COUNT(ws.session_id)::int AS assigned_workouts,
          COUNT(ws.session_id) FILTER (
            WHERE ws.completed = TRUE
          )::int AS completed_workouts
        FROM workout_plans wp
        JOIN workout_sessions ws
          ON ws.workout_plan_id = wp.workout_plan_id
        WHERE wp.user_id = u.user_id
      ) workout_stats ON true
      WHERE u.trainer_id = $1
        AND LOWER(COALESCE(u.account_status, 'pending')) = 'active'
      ORDER BY u.first_name ASC
      `,
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getTrainerRoster error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// Trainer Portal — self-service login for coaches
// =========================================================

// POST /api/trainers/login — trainer logs into their own portal
const loginTrainer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email) || typeof password !== "string" || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email and password.",
      });
    }

    const result = await pool.query(
      "SELECT trainer_id, full_name, email, phone, specialization, goal_specialty, photo_url, status, password, token_version FROM trainers WHERE LOWER(email) = $1",
      [normalizeEmail(email)]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const trainer = result.rows[0];

    if (!trainer.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account doesn't have portal access set up yet — ask the gym admin to set a password for you.",
      });
    }

    const valid = await bcrypt.compare(password, trainer.password);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (trainer.status !== "Active") {
      if (trainer.status === "Rejected") {
        return res.status(403).json({
          success: false,
          status: "Rejected",
          message:
            "Your trainer account was not approved. Please contact the gym administrator.",
        });
      }

      return res.status(403).json({
        success: false,
        status: trainer.status || "Pending",
        message:
          "Your trainer account is not active. Please contact the gym administrator.",
      });
    }

    const token = jwt.sign(
      {
        trainer_id: trainer.trainer_id,
        email: trainer.email,
        token_version: Number(trainer.token_version || 0),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.json({
      success: true,
      token,
      trainer: {
        trainer_id: trainer.trainer_id,
        full_name: trainer.full_name,
        email: trainer.email,
        phone: trainer.phone,
        specializations: specializationToArray(trainer.specialization),
        goal_specialty: trainer.goal_specialty,
        photo_url: trainer.photo_url,
      },
    });
  } catch (err) {
    console.error("loginTrainer error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET /api/trainers/me/roster — the logged-in trainer's own members
const getMyRoster = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.profile_image,
        u.gender,
        u.age,
        u.birth_date,
        u.height,
        u.weight,
        u.fitness_goal,
        u.target_weight,
        u.activity_level,
        u.intensity,
        u.injuries,
        u.health_conditions,
        u.preferred_days,
        u.workout_days_per_week,
        u.workout_duration,
        pl.weight AS latest_weight,
        pl.bmi AS latest_bmi,
        pl.log_date AS latest_log_date
      FROM users u
      LEFT JOIN LATERAL (
        SELECT weight, bmi, log_date
        FROM progress_logs
        WHERE user_id = u.user_id
        ORDER BY log_date DESC
        LIMIT 1
      ) pl ON true
      WHERE u.trainer_id = $1
        AND LOWER(COALESCE(u.account_status, 'pending')) = 'active'
      ORDER BY u.first_name ASC
      `,
      [req.trainer.trainer_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getMyRoster error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET /api/trainers/me/exercises — exercise catalog for the assign-workout form
const getExerciseCatalog = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, c.category_name
      FROM exercises e
      LEFT JOIN exercise_categories c
        ON e.category_id = c.category_id
      ORDER BY e.exercise_name ASC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getExerciseCatalog error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET /api/trainers/me/profile — the logged-in trainer's own profile
const getMyProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT trainer_id, full_name, email, phone, specialization, profile_image, status, created_at, updated_at FROM trainers WHERE trainer_id = $1",
      [req.trainer.trainer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found.",
      });
    }

    const trainer = result.rows[0];

    res.json({
      success: true,
      data: {
        ...trainer,
        specializations: specializationToArray(trainer.specialization),
      },
    });
  } catch (err) {
    console.error("getMyProfile error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// PUT /api/trainers/me/photo — trainer updates their own profile photo
const updateMyPhoto = async (req, res) => {
  try {
    const { photo_url } = req.body;

    if (!photo_url) {
      return res.status(400).json({
        success: false,
        message: "photo_url is required.",
      });
    }

    const imageCheck = validateImageDataUrl(photo_url);

    if (!imageCheck.ok) {
      return res.status(400).json({
        success: false,
        message: imageCheck.message,
      });
    }

    await pool.query(
      "UPDATE trainers SET photo_url=$1, updated_at=NOW() WHERE trainer_id=$2",
      [photo_url, req.trainer.trainer_id]
    );

    res.json({
      success: true,
      message: "Photo updated.",
    });
  } catch (err) {
    console.error("updateMyPhoto error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Helper: confirm a member belongs to the requesting trainer
const memberBelongsToTrainer = async (userId, trainerId) => {
  const check = await pool.query(
    "SELECT user_id FROM users WHERE user_id = $1 AND trainer_id = $2 AND COALESCE(account_status, 'Pending') = 'Active'",
    [userId, trainerId]
  );

  return check.rows.length > 0;
};

// GET /api/trainers/me/members/:userId/sessions — a roster member's assigned workouts
const getRosterMemberSessions = async (req, res) => {
  try {
    const { userId } = req.params;

    const owns = await memberBelongsToTrainer(
      userId,
      req.trainer.trainer_id
    );

    if (!owns) {
      return res.status(403).json({
        success: false,
        message: "This member isn't on your roster.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        ws.*,
        e.exercise_name,
        e.muscle_group,
        e.equipment
      FROM workout_sessions ws
      JOIN workout_plans wp
        ON ws.workout_plan_id = wp.workout_plan_id
      LEFT JOIN exercises e
        ON ws.exercise_id = e.exercise_id
      WHERE wp.user_id = $1
      ORDER BY ws.session_date ASC
      `,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getRosterMemberSessions error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// POST /api/trainers/me/assign — assign a workout to one of this trainer's members
const assignSessionAsTrainer = async (req, res) => {
  try {
    const trainerId = req.trainer.trainer_id;

    const {
      user_id,
      exercise_id,
      sets,
      reps,
      duration_minutes,
      session_date,
    } = req.body;

    if (!user_id || !exercise_id || !session_date) {
      return res.status(400).json({
        success: false,
        message:
          "user_id, exercise_id, and session_date are required.",
      });
    }

    const owns = await memberBelongsToTrainer(user_id, trainerId);

    if (!owns) {
      return res.status(403).json({
        success: false,
        message: "This member isn't on your roster.",
      });
    }

    const planRes = await pool.query(
      "SELECT workout_plan_id FROM workout_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [user_id]
    );

    let planId;

    if (planRes.rows.length > 0) {
      planId = planRes.rows[0].workout_plan_id;

      await pool.query(
        "UPDATE workout_plans SET trainer_id = $1 WHERE workout_plan_id = $2",
        [trainerId, planId]
      );
    } else {
      const created = await pool.query(
        `
        INSERT INTO workout_plans
          (user_id, trainer_id, plan_name, goal)
        VALUES
          ($1, $2, $3, $4)
        RETURNING workout_plan_id
        `,
        [user_id, trainerId, "Coach Plan", "General Fitness"]
      );

      planId = created.rows[0].workout_plan_id;
    }

    const result = await pool.query(
      `
      INSERT INTO workout_sessions
        (workout_plan_id, exercise_id, sets, reps, duration_minutes, session_date)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        planId,
        exercise_id,
        sets || null,
        reps || null,
        duration_minutes || null,
        session_date,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("assignSessionAsTrainer error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE /api/trainers/me/sessions/:sessionId — remove a workout this trainer assigned
const deleteSessionAsTrainer = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const check = await pool.query(
      `
      SELECT ws.session_id
      FROM workout_sessions ws
      JOIN workout_plans wp
        ON ws.workout_plan_id = wp.workout_plan_id
      JOIN users u
        ON wp.user_id = u.user_id
      WHERE ws.session_id = $1
        AND u.trainer_id = $2
      `,
      [sessionId, req.trainer.trainer_id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You can't modify this workout.",
      });
    }

    await pool.query(
      "DELETE FROM workout_sessions WHERE session_id = $1",
      [sessionId]
    );

    res.json({
      success: true,
      message: "Workout removed.",
    });
  } catch (err) {
    console.error("deleteSessionAsTrainer error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  approveTrainer,
  rejectTrainer,
  deactivateTrainer,
  getActiveTrainers,
  getTrainerRoster,
  loginTrainer,
  getMyRoster,
  getMyProfile,
  updateMyPhoto,
  getExerciseCatalog,
  getRosterMemberSessions,
  assignSessionAsTrainer,
  deleteSessionAsTrainer,
};