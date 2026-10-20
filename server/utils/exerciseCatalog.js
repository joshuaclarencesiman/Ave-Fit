const pool = require("../db");
const enrichExercise = require("./exerciseGuidance");

const getExerciseCatalog = async () => {
  const result = await pool.query(`
    WITH ranked_exercises AS (
      SELECT e.*,
        ROW_NUMBER() OVER (
          PARTITION BY TRIM(REGEXP_REPLACE(
            REGEXP_REPLACE(LOWER(BTRIM(e.exercise_name)), CHR(39), '', 'g'),
            '[^a-z0-9]+', ' ', 'g'
          ))
          ORDER BY
            (e.movement_steps IS NOT NULL) DESC,
            (NULLIF(BTRIM(e.description), '') IS NOT NULL) DESC,
            (NULLIF(BTRIM(e.equipment), '') IS NOT NULL) DESC,
            e.exercise_id ASC
        ) AS duplicate_rank
      FROM exercises e
    )
    SELECT e.*, c.category_name
    FROM ranked_exercises e
    LEFT JOIN exercise_categories c ON e.category_id = c.category_id
    WHERE e.duplicate_rank = 1
    ORDER BY e.exercise_name ASC
  `);

  return {
    ...result,
    rows: result.rows.map(enrichExercise),
  };
};

module.exports = getExerciseCatalog;
