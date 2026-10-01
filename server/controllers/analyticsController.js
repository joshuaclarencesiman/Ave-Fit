const pool = require("../db");

// GET dashboard summary stats
const getDashboardStats = async (req, res) => {
  try {
    const totalMembers = await pool.query("SELECT COUNT(*) AS count FROM users WHERE LOWER(COALESCE(account_status, 'pending')) = 'active'");
    const pendingMembers = await pool.query(`
      SELECT COUNT(*) AS count FROM users
      WHERE LOWER(COALESCE(account_status, 'pending')) = 'pending' 
    `);
    const totalExercises = await pool.query("SELECT COUNT(*) AS count FROM exercises");
    const totalMealPlans = await pool.query("SELECT COUNT(*) AS count FROM meal_plans");

    const recentMembers = await pool.query(`
      SELECT
        user_id AS member_id,
        first_name,
        last_name,
        INITCAP(LOWER(COALESCE(account_status, 'pending'))) AS status,
        created_at AS joined_date
      FROM users
      ORDER BY created_at DESC NULLS LAST, user_id DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalMembers: parseInt(totalMembers.rows[0].count),
        pendingMembers: parseInt(pendingMembers.rows[0].count),
        totalExercises: parseInt(totalExercises.rows[0].count),
        totalMealPlans: parseInt(totalMealPlans.rows[0].count),
        recentMembers: recentMembers.rows,
      },
    });
  } catch (err) {
    console.error("getDashboardStats error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET full analytics
const getAnalytics = async (req, res) => {
  try {
    // Member growth last 6 months
    const memberGrowth = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
        COUNT(*) AS count
      FROM users
      WHERE LOWER(COALESCE(account_status, 'pending')) = 'active'
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `);

    // Fitness goal distribution
    const goalDistribution = await pool.query(`
      SELECT fitness_goal AS goal, COUNT(*) AS count
      FROM users
      WHERE LOWER(COALESCE(account_status, 'pending')) = 'active'
        AND fitness_goal IS NOT NULL
      GROUP BY fitness_goal ORDER BY count DESC
    `);

    // BMI distribution
    const bmiDistribution = await pool.query(`
      SELECT
        CASE
          WHEN (weight / POWER(height / 100.0, 2)) < 18.5 THEN 'Underweight'
          WHEN (weight / POWER(height / 100.0, 2)) BETWEEN 18.5 AND 24.9 THEN 'Normal'
          WHEN (weight / POWER(height / 100.0, 2)) BETWEEN 25 AND 29.9 THEN 'Overweight'
          ELSE 'Obese'
        END AS category,
        COUNT(*) AS count
      FROM users
      WHERE LOWER(COALESCE(account_status, 'pending')) = 'active'
        AND height IS NOT NULL AND height > 0 AND weight IS NOT NULL
      GROUP BY category
    `);

    // Completed workout sessions by day of week (session_date stores day
    // names like "Monday".."Sunday", not calendar dates, so a monthly
    // breakdown isn't possible — day-of-week is the meaningful grouping here)
    const attendance = await pool.query(`
      SELECT session_date AS day, COUNT(*) AS count
      FROM workout_sessions
      WHERE completed = true AND session_date IS NOT NULL
      GROUP BY session_date
      ORDER BY CASE session_date
        WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7 ELSE 8
      END
    `);

    // Summary
    const totalMembers = await pool.query("SELECT COUNT(*) AS count FROM users WHERE LOWER(COALESCE(account_status, 'pending')) = 'active'");
    const avgBmi = await pool.query(`
      SELECT ROUND(AVG(weight / POWER(height / 100.0, 2))::numeric,1) AS avg
      FROM users
      WHERE LOWER(COALESCE(account_status, 'pending')) = 'active'
        AND height IS NOT NULL AND height > 0 AND weight IS NOT NULL
    `);
    const totalWorkoutPlans = await pool.query("SELECT COUNT(*) AS count FROM workout_plans");
    const totalMealPlans = await pool.query("SELECT COUNT(*) AS count FROM meal_plans");

    res.json({
      success: true,
      data: {
        summary: {
          totalMembers: parseInt(totalMembers.rows[0].count),
          avgBmi: parseFloat(avgBmi.rows[0].avg) || 0,
          totalWorkoutPlans: parseInt(totalWorkoutPlans.rows[0].count),
          totalNutritionPlans: parseInt(totalMealPlans.rows[0].count),
        },
        memberGrowth: memberGrowth.rows,
        goalDistribution: goalDistribution.rows,
        bmiDistribution: bmiDistribution.rows,
        attendance: attendance.rows,
      },
    });
  } catch (err) {
    console.error("getAnalytics error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats, getAnalytics };