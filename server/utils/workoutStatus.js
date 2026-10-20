const pool = require("../db");

// Every date in the product is evaluated on Philippine Standard Time.
const APP_TIME_ZONE = "Asia/Manila";

// The four workout statuses shown on the member dashboard and the trainer's
// workout plans.
const WORKOUT_STATUS = {
  ACTIVE: "Active",
  COMPLETE: "Complete",
  INCOMPLETE: "Incomplete",
  ABSENT: "Absent",
};

const WORKOUT_STATUSES = Object.values(WORKOUT_STATUS);

// Offset of every weekday inside a Monday based week.
const WEEKDAY_OFFSETS = [
  ["monday", 0],
  ["tuesday", 1],
  ["wednesday", 2],
  ["thursday", 3],
  ["friday", 4],
  ["saturday", 5],
  ["sunday", 6],
];

/**
 * Resolves the calendar day a workout session is scheduled for.
 *
 * `workout_sessions.session_date` holds either an ISO date (a one off workout)
 * or a weekday name (a recurring workout). Recurring workouts resolve to their
 * day inside the current Monday based week, so they roll over every week.
 */
const scheduledDateSql = (alias = "ws") => `(
  CASE
    WHEN ${alias}.session_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      THEN TO_DATE(${alias}.session_date, 'YYYY-MM-DD')
    ${WEEKDAY_OFFSETS.map(([day, offset]) => `WHEN LOWER(BTRIM(${alias}.session_date)) = '${day}'
      THEN (DATE_TRUNC('week', (NOW() AT TIME ZONE '${APP_TIME_ZONE}')::date))::date + ${offset}`).join("\n    ")}
    ELSE NULL
  END
)`;

/**
 * The status of a single scheduled workout.
 *
 * Active     -> the workout is scheduled (or started) and its day has not ended
 * Complete   -> the member finished the workout
 * Incomplete -> the member started/logged the workout but the day ended first
 * Absent     -> the day ended without any recorded workout
 */
const sessionStatusSql = (alias = "ws") => `(
  CASE
    WHEN ${alias}.completed IS TRUE THEN '${WORKOUT_STATUS.COMPLETE}'
    WHEN ${scheduledDateSql(alias)} IS NULL THEN '${WORKOUT_STATUS.ACTIVE}'
    WHEN ${scheduledDateSql(alias)} >= (NOW() AT TIME ZONE '${APP_TIME_ZONE}')::date THEN '${WORKOUT_STATUS.ACTIVE}'
    WHEN ${alias}.started_at IS NOT NULL THEN '${WORKOUT_STATUS.INCOMPLETE}'
    ELSE '${WORKOUT_STATUS.ABSENT}'
  END
)`;

/**
 * The status of every session that belongs to one plan.
 *
 * A plan is only Complete when every one of its workouts is complete. While a
 * workout is still scheduled or ongoing the plan stays Active, otherwise the
 * first unfinished workout decides whether the plan is Incomplete or Absent.
 */
const planStatusSql = (alias = "ws") => `(
  CASE
    WHEN COUNT(${alias}.session_id) = 0 THEN '${WORKOUT_STATUS.ACTIVE}'
    WHEN COUNT(${alias}.session_id) FILTER (WHERE ${alias}.completed IS TRUE) = COUNT(${alias}.session_id)
      THEN '${WORKOUT_STATUS.COMPLETE}'
    WHEN COUNT(${alias}.session_id) FILTER (WHERE ${sessionStatusSql(alias)} = '${WORKOUT_STATUS.ACTIVE}') > 0
      THEN '${WORKOUT_STATUS.ACTIVE}'
    WHEN COUNT(${alias}.session_id) FILTER (WHERE ${sessionStatusSql(alias)} = '${WORKOUT_STATUS.INCOMPLETE}') > 0
      THEN '${WORKOUT_STATUS.INCOMPLETE}'
    WHEN COUNT(${alias}.session_id) FILTER (WHERE ${sessionStatusSql(alias)} = '${WORKOUT_STATUS.ABSENT}') > 0
      THEN '${WORKOUT_STATUS.ABSENT}'
    ELSE '${WORKOUT_STATUS.COMPLETE}'
  END
)`;

// Columns returned for a workout session. The stored `status` column is left
// out on purpose so the live status below is the only one the API reports.
const sessionColumns = (alias = "ws") => [
  `${alias}.session_id`,
  `${alias}.workout_plan_id`,
  `${alias}.exercise_id`,
  `${alias}.sets`,
  `${alias}.reps`,
  `${alias}.duration_minutes`,
  `${alias}.calories_burned`,
  `${alias}.completed`,
  `${alias}.session_date`,
  `${alias}.completed_at`,
  `${alias}.started_at`,
].join(", ");

/**
 * Keeps the stored `workout_sessions.status` column in sync with the live
 * status rules. Only the status column is written, every recorded workout
 * detail (sets, reps, duration, completion time) is left untouched and a
 * confirmed completion is never overwritten.
 *
 * @param {{ userId?: number, trainerId?: number, planId?: number }} scope
 * @returns {Promise<number>} the number of sessions whose status changed
 */
const refreshWorkoutStatuses = async (scope = {}) => {
  const values = [];
  const clauses = [];

  if (Number.isInteger(scope.userId)) {
    values.push(scope.userId);
    clauses.push(`wp.user_id = $${values.length}`);
  }
  if (Number.isInteger(scope.trainerId)) {
    values.push(scope.trainerId);
    clauses.push(`wp.trainer_id = $${values.length}`);
  }
  if (Number.isInteger(scope.planId)) {
    values.push(scope.planId);
    clauses.push(`ws.workout_plan_id = $${values.length}`);
  }

  try {
    const result = await pool.query(`
      WITH computed AS (
        SELECT ws.session_id, ${sessionStatusSql("ws")} AS next_status
        FROM workout_sessions ws
        JOIN workout_plans wp ON wp.workout_plan_id = ws.workout_plan_id
        ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
      )
      UPDATE workout_sessions ws
      SET status = computed.next_status
      FROM computed
      WHERE computed.session_id = ws.session_id
        AND ws.status IS DISTINCT FROM computed.next_status
        AND NOT (ws.status = '${WORKOUT_STATUS.COMPLETE}' AND ws.completed_at IS NOT NULL)
    `, values);

    return result.rowCount;
  } catch (err) {
    // The status column is created when the database is initialised. If it is
    // not available yet the live status is still reported by the API.
    console.warn("Workout status refresh skipped:", err.message);
    return 0;
  }
};

module.exports = {
  APP_TIME_ZONE,
  WORKOUT_STATUS,
  WORKOUT_STATUSES,
  scheduledDateSql,
  sessionStatusSql,
  planStatusSql,
  sessionColumns,
  refreshWorkoutStatuses,
};
