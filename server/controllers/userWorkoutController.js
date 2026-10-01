const pool = require("../db");

// GET user's workout plan
const getUserWorkoutPlan = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ws.*, e.exercise_name, e.muscle_group, e.difficulty, e.equipment, e.description
      FROM workout_sessions ws
      LEFT JOIN exercises e ON ws.exercise_id = e.exercise_id
      WHERE ws.workout_plan_id IN (
        SELECT workout_plan_id FROM workout_plans WHERE user_id = $1
      )
      ORDER BY ws.session_date ASC
    `, [req.user.user_id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getUserWorkoutPlan error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET user's workout plans list
const getUserPlans = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM workout_plans WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.user_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getUserPlans error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create workout session (add workout to plan)
const addWorkoutSession = async (req, res) => {
  try {
    const { workout_plan_id, exercise_id, sets, reps, duration_minutes, session_date } = req.body;

    // Create a plan if none provided
    let planId = workout_plan_id;
    if (!planId) {
      const planRes = await pool.query(
        "INSERT INTO workout_plans (user_id, plan_name, goal) VALUES ($1, $2, $3) RETURNING workout_plan_id",
        [req.user.user_id, "My Workout Plan", "General Fitness"]
      );
      planId = planRes.rows[0].workout_plan_id;
    }

    const result = await pool.query(`
      INSERT INTO workout_sessions (workout_plan_id, exercise_id, sets, reps, duration_minutes, session_date)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [planId, exercise_id || null, sets || null, reps || null, duration_minutes || null, session_date || new Date()]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("addWorkoutSession error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update workout session
const updateWorkoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { sets, reps, duration_minutes, completed } = req.body;
    await pool.query(`
      UPDATE workout_sessions SET sets=$1, reps=$2, duration_minutes=$3, completed=$4
      WHERE session_id=$5
    `, [sets, reps, duration_minutes, completed || false, id]);
    res.json({ success: true, message: "Workout updated." });
  } catch (err) {
    console.error("updateWorkoutSession error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT mark session as complete
const completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE workout_sessions SET completed=true, completed_at=NOW() WHERE session_id=$1",
      [id]
    );
    res.json({ success: true, message: "Session completed." });
  } catch (err) {
    console.error("completeSession error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE workout session
const deleteWorkoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM workout_sessions WHERE session_id=$1", [id]);
    res.json({ success: true, message: "Workout deleted." });
  } catch (err) {
    console.error("deleteWorkoutSession error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE reset all sessions in user's plan
const resetWeek = async (req, res) => {
  try {
    await pool.query(`
      DELETE FROM workout_sessions
      WHERE workout_plan_id IN (
        SELECT workout_plan_id FROM workout_plans WHERE user_id=$1
      )
    `, [req.user.user_id]);
    res.json({ success: true, message: "Week reset." });
  } catch (err) {
    console.error("resetWeek error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUserWorkoutPlan, getUserPlans, addWorkoutSession, updateWorkoutSession, completeSession, deleteWorkoutSession, resetWeek };