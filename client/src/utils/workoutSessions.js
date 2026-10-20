import {
  philippinesDateKey,
  philippinesDateString,
  addPhilippinesDays,
  philippinesWeekStart,
} from "./philippinesDate.js";
import { WORKOUT_STATUS } from "./workoutStatus.js";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Monday based index for every weekday name.
const WEEKDAY_INDEX = {
  sunday: 6,
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
};

/** Monday based index of a weekday name, or null when it is not a weekday. */
export const weekdayIndexOf = (name) => {
  const index = WEEKDAY_INDEX[String(name || "").trim().toLowerCase()];
  return index === undefined ? null : index;
};

// The backend owns the status, so prefer it and fall back to the completion
// flag for records that predate the status column.
export function isSessionComplete(session) {
  if (session?.status) return session.status === WORKOUT_STATUS.COMPLETE;
  return Boolean(session?.completed);
}

/** A workout counts as activity once the member started or finished it. */
export function sessionHasActivity(session) {
  return Boolean(session?.started_at) || isSessionComplete(session);
}

/**
 * The calendar day a session is scheduled on. Concrete dates use the stored
 * value, recurring weekday sessions use their occurrence in the current week.
 */
export function getSessionScheduledDate(session, referenceDate = philippinesDateString()) {
  const key = philippinesDateKey(session.session_date);
  if (ISO_DATE_PATTERN.test(key)) return key;
  const index = weekdayIndexOf(session.session_date);
  if (index === null) return "";
  return addPhilippinesDays(philippinesWeekStart(referenceDate), index);
}

const resolveDayStatus = (group, today) => {
  if (group.totalCount > 0 && group.completedCount === group.totalCount) {
    return WORKOUT_STATUS.COMPLETE;
  }
  if (group.scheduledDate < today) {
    return group.hasActivity ? WORKOUT_STATUS.INCOMPLETE : WORKOUT_STATUS.ABSENT;
  }
  if (group.scheduledDate === today) return WORKOUT_STATUS.ACTIVE;
  return WORKOUT_STATUS.SCHEDULED;
};

/**
 * Group the sessions into the scheduled workout days they belong to. A day is
 * complete once every workout scheduled on it is complete.
 */
export function getWorkoutDayGroups(sessions, { referenceDate = philippinesDateString() } = {}) {
  const groups = new Map();

  sessions.forEach((session) => {
    const scheduledDate = getSessionScheduledDate(session, referenceDate);
    if (!scheduledDate || scheduledDate > referenceDate) return;

    const completed = isSessionComplete(session);
    const completedDate = completed
      ? philippinesDateKey(session.completed_at) || scheduledDate
      : "";

    let group = groups.get(scheduledDate);
    if (!group) {
      group = {
        key: scheduledDate,
        scheduledDate,
        completionDate: "",
        isComplete: true,
        status: WORKOUT_STATUS.SCHEDULED,
        completedCount: 0,
        totalCount: 0,
        hasActivity: false,
      };
      groups.set(scheduledDate, group);
    }

    group.totalCount += 1;
    group.hasActivity = group.hasActivity || sessionHasActivity(session);
    if (completed) {
      group.completedCount += 1;
      if (completedDate > group.completionDate) group.completionDate = completedDate;
    } else {
      group.isComplete = false;
    }
  });

  groups.forEach((group) => {
    group.status = resolveDayStatus(group, referenceDate);
  });

  return [...groups.values()];
}

/**
 * The status of a recurring weekday workout in one of the earlier weeks. The
 * backend only tracks the current occurrence, so earlier occurrences are
 * derived from the recorded completion and start timestamps.
 */
const derivePastOccurrenceStatus = (session, weekStart) => {
  const weekEnd = addPhilippinesDays(weekStart, 7);
  const completedAt = philippinesDateKey(session.completed_at);
  if (completedAt && completedAt >= weekStart && completedAt < weekEnd) {
    return WORKOUT_STATUS.COMPLETE;
  }
  const startedAt = philippinesDateKey(session.started_at);
  if (startedAt && startedAt >= weekStart && startedAt < weekEnd) {
    return WORKOUT_STATUS.INCOMPLETE;
  }
  return WORKOUT_STATUS.ABSENT;
};

/**
 * The scheduled workout days of every week in the analysed range, newest week
 * last. Recurring weekday workouts are expanded into one day per week.
 */
export function getWorkoutWeekGroups(sessions, { weeks = 8, referenceDate = philippinesDateString() } = {}) {
  const today = referenceDate;
  const currentWeekStart = philippinesWeekStart(today);
  const weekStarts = [];
  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    weekStarts.push(addPhilippinesDays(currentWeekStart, -offset * 7));
  }

  const days = new Map();
  const addOccurrence = (date, completed, hasActivity) => {
    let day = days.get(date);
    if (!day) {
      day = { date, completedCount: 0, totalCount: 0, hasActivity: false };
      days.set(date, day);
    }
    day.totalCount += 1;
    day.completedCount += completed ? 1 : 0;
    day.hasActivity = day.hasActivity || hasActivity;
  };

  sessions.forEach((session) => {
    const key = philippinesDateKey(session.session_date);
    if (ISO_DATE_PATTERN.test(key)) {
      if (key > today) return;
      addOccurrence(key, isSessionComplete(session), sessionHasActivity(session));
      return;
    }

    const index = weekdayIndexOf(session.session_date);
    if (index === null) return;
    weekStarts.forEach((weekStart) => {
      const date = addPhilippinesDays(weekStart, index);
      if (date > today) return;
      const status = weekStart === currentWeekStart
        ? session.status
        : derivePastOccurrenceStatus(session, weekStart);
      addOccurrence(
        date,
        status === WORKOUT_STATUS.COMPLETE,
        status === WORKOUT_STATUS.COMPLETE || status === WORKOUT_STATUS.INCOMPLETE,
      );
    });
  });

  const buckets = new Map(weekStarts.map((weekStart) => [weekStart, {
    weekStart,
    scheduledDays: 0,
    completedDays: 0,
    incompleteDays: 0,
    absentDays: 0,
    activeDays: 0,
    workoutsScheduled: 0,
    workoutsCompleted: 0,
  }]));

  days.forEach((day) => {
    const bucket = buckets.get(philippinesWeekStart(day.date));
    if (!bucket) return;
    bucket.scheduledDays += 1;
    bucket.workoutsScheduled += day.totalCount;
    bucket.workoutsCompleted += day.completedCount;
    if (day.totalCount > 0 && day.completedCount === day.totalCount) {
      bucket.completedDays += 1;
    } else if (day.date < today) {
      if (day.hasActivity) bucket.incompleteDays += 1;
      else bucket.absentDays += 1;
    } else if (day.date === today) {
      bucket.activeDays += 1;
    }
  });

  return [...buckets.values()].map((bucket) => ({
    ...bucket,
    completionRate: bucket.workoutsScheduled
      ? Math.round((bucket.workoutsCompleted / bucket.workoutsScheduled) * 100)
      : 0,
  }));
}

/**
 * How the member is doing in the current week: the scheduled workout days,
 * how many are finished and how many workouts are done in total.
 */
export function getWorkoutCompletionStats(sessions, { referenceDate = philippinesDateString() } = {}) {
  const today = referenceDate;
  const weekStart = philippinesWeekStart(today);
  const weekDays = getWorkoutDayGroups(sessions, { referenceDate: today })
    .filter((day) => day.scheduledDate >= weekStart && day.scheduledDate <= today);

  const completedDays = weekDays.filter((day) => day.status === WORKOUT_STATUS.COMPLETE);
  const workoutsScheduled = weekDays.reduce((total, day) => total + day.totalCount, 0);
  const workoutsCompleted = weekDays.reduce((total, day) => total + day.completedCount, 0);

  return {
    weekStart,
    scheduledDays: weekDays.length,
    completedDays: completedDays.length,
    incompleteDays: weekDays.filter((day) => day.status === WORKOUT_STATUS.INCOMPLETE).length,
    absentDays: weekDays.filter((day) => day.status === WORKOUT_STATUS.ABSENT).length,
    activeDays: weekDays.filter((day) => day.status === WORKOUT_STATUS.ACTIVE).length,
    workoutsScheduled,
    workoutsCompleted,
    dayRate: weekDays.length
      ? Math.round((completedDays.length / weekDays.length) * 100)
      : null,
    workoutRate: workoutsScheduled
      ? Math.round((workoutsCompleted / workoutsScheduled) * 100)
      : null,
  };
}
