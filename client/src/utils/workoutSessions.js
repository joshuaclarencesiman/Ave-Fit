import { philippinesDateKey } from "./philippinesDate.js";
import { WORKOUT_STATUS, resolveWorkoutStatus } from "./workoutStatus.js";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Combines the status of two workouts of the same day.
// A day is only complete when every workout of that day is complete,
// otherwise an ongoing workout keeps the day active.
export const mergeWorkoutStatus = (current, next) => {
  if (!current) return next;
  if (current === WORKOUT_STATUS.COMPLETE) {
    return next === WORKOUT_STATUS.COMPLETE ? WORKOUT_STATUS.COMPLETE : next;
  }
  if (next === WORKOUT_STATUS.COMPLETE) return current;
  if (current === WORKOUT_STATUS.ACTIVE || next === WORKOUT_STATUS.ACTIVE) {
    return WORKOUT_STATUS.ACTIVE;
  }
  if (current === WORKOUT_STATUS.INCOMPLETE || next === WORKOUT_STATUS.INCOMPLETE) {
    return WORKOUT_STATUS.INCOMPLETE;
  }
  return WORKOUT_STATUS.ABSENT;
};

export function getWorkoutDayGroups(sessions) {
  const groups = new Map();

  sessions.forEach((session) => {
    const scheduledDate = philippinesDateKey(session.session_date);
    const scheduleLabel = typeof session.session_date === "string" && session.session_date.trim()
      ? session.session_date.trim().toLowerCase()
      : String(session.day_of_week || "").trim().toLowerCase();
    const completedDate = session.completed
      ? philippinesDateKey(session.completed_at) || (ISO_DATE_PATTERN.test(scheduledDate) ? scheduledDate : "")
      : "";
    const key = ISO_DATE_PATTERN.test(scheduledDate)
      ? scheduledDate
      : scheduleLabel || completedDate;

    if (!key) return;

    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        scheduledDate: ISO_DATE_PATTERN.test(scheduledDate) ? scheduledDate : "",
        completionDate: "",
        isComplete: true,
        status: WORKOUT_STATUS.COMPLETE,
      };
      groups.set(key, group);
    }

    if (!session.completed) {
      group.isComplete = false;
    } else if (completedDate && completedDate > group.completionDate) {
      group.completionDate = completedDate;
    }

    group.status = mergeWorkoutStatus(group.status, resolveWorkoutStatus(session));
  });

  return [...groups.values()];
}
