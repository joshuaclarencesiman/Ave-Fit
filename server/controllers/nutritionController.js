const pool = require("../db");

const getNutritionPlans = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mp.*, u.first_name || ' ' || u.last_name AS member_name, u.fitness_goal
      FROM meal_plans mp
      LEFT JOIN users u ON mp.user_id = u.user_id
      ORDER BY mp.meal_plan_id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createNutritionPlan = async (req, res) => {
  try {
    const { user_id, meal_name, calories, protein, carbs, fats } = req.body;
    const result = await pool.query(`
      INSERT INTO meal_plans (user_id, meal_name, calories, protein, carbs, fats)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [user_id || null, meal_name, calories || null, protein || null, carbs || null, fats || null]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateNutritionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { meal_name, calories, protein, carbs, fats } = req.body;
    await pool.query(`
      UPDATE meal_plans SET meal_name=$1, calories=$2, protein=$3, carbs=$4, fats=$5 WHERE meal_plan_id=$6
    `, [meal_name, calories || null, protein || null, carbs || null, fats || null, id]);
    res.json({ success: true, message: "Meal plan updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteNutritionPlan = async (req, res) => {
  try {
    await pool.query("DELETE FROM meal_plans WHERE meal_plan_id = $1", [req.params.id]);
    res.json({ success: true, message: "Meal plan deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getNutritionSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS total_plans,
        ROUND(AVG(calories)::numeric,0) AS avg_calories,
        ROUND(AVG(protein)::numeric,1) AS avg_protein,
        ROUND(AVG(carbs)::numeric,1) AS avg_carbs,
        ROUND(AVG(fats)::numeric,1) AS avg_fats
      FROM meal_plans
    `);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getNutritionPlans, createNutritionPlan, updateNutritionPlan, deleteNutritionPlan, getNutritionSummary };