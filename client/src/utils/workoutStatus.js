// The four workout statuses shared by the member dashboard and the trainer's
// workout plans. The values match the status stored in the database.
export const WORKOUT_STATUS = {
  ACTIVE: "Active",
  COMPLETE: "Complete",
  INCOMPLETE: "Incomplete",
  ABSENT: "Absent",
};

export const WORKOUT_STATUSES = Object.values(WORKOUT_STATUS);

export const WORKOUT_STATUS_BADGE = {
  [WORKOUT_STATUS.ACTIVE]:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
  [WORKOUT_STATUS.COMPLETE]:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300",
  [WORKOUT_STATUS.INCOMPLETE]:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  [WORKOUT_STATUS.ABSENT]:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
};

export const WORKOUT_STATUS_DOT = {
  [WORKOUT_STATUS.ACTIVE]: "bg-orange-500",
  [WORKOUT_STATUS.COMPLETE]: "bg-green-500",
  [WORKOUT_STATUS.INCOMPLETE]: "bg-amber-500",
  [WORKOUT_STATUS.ABSENT]: "bg-red-400",
};

export const workoutStatusBadgeClass = (status) =>
  WORKOUT_STATUS_BADGE[status] || WORKOUT_STATUS_BADGE[WORKOUT_STATUS.ACTIVE];

export const workoutStatusDotClass = (status) =>
  WORKOUT_STATUS_DOT[status] || WORKOUT_STATUS_DOT[WORKOUT_STATUS.ACTIVE];

// Falls back to the status of the workout data when the API did not report one.
export const resolveWorkoutStatus = (session) => {
  const status = String(session?.status || "").trim();
  if (WORKOUT_STATUSES.includes(status)) return status;
  return session?.completed ? WORKOUT_STATUS.COMPLETE : WORKOUT_STATUS.ACTIVE;
};
