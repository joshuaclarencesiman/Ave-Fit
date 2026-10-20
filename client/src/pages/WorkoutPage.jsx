<<<<<<< HEAD
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle, Dumbbell, Moon, Play, RotateCcw, Target } from "lucide-react";
=======
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle, Dumbbell, Moon, Play, RotateCcw, Target, Trash2 } from "lucide-react";
>>>>>>> origin/master
import { Link } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import userApi from "../userApi";
import { formatPhilippinesDate, philippinesDateKey, philippinesDateString, philippinesMondayString } from "../utils/philippinesDate";
<<<<<<< HEAD
import { getWorkoutDayGroups, mergeWorkoutStatus } from "../utils/workoutSessions";
import { WORKOUT_STATUS, resolveWorkoutStatus, workoutStatusBadgeClass, workoutStatusDotClass } from "../utils/workoutStatus";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

=======

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

>>>>>>> origin/master
const formatWorkoutDate = (date) =>
  formatPhilippinesDate(date, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const formatWorkoutTime = (date) =>
  new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(date));

<<<<<<< HEAD
const addDays = (dateKey, days) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
};

const getWeekday = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return DAYS[(new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7];
};

// A session is either scheduled on a fixed date or on a weekday of the week.
const sessionWeekday = (session) => {
  const scheduledDate = philippinesDateKey(session.session_date);
  if (ISO_DATE_PATTERN.test(scheduledDate)) return "";
  const weekday = String(session.day_of_week || session.session_date || "").trim().toLowerCase();
  return DAYS.some((day) => day.toLowerCase() === weekday) ? weekday : "";
};

const isSessionScheduledForDate = (session, date) => {
  const scheduledDate = philippinesDateKey(session.session_date);
  if (ISO_DATE_PATTERN.test(scheduledDate)) return scheduledDate === date;
  return sessionWeekday(session) === getWeekday(date).toLowerCase();
=======
const getPhilippinesWeekday = (date = new Date()) => {
  const dateKey = philippinesDateString(date);
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return DAYS[(weekday + 6) % 7];
>>>>>>> origin/master
};

export default function WorkoutPage() {
  const { user } = useUserAuth();
<<<<<<< HEAD
  const initializedSchedule = useRef(false);
=======
>>>>>>> origin/master
  const [sessions, setSessions] = useState([]);
  const [workoutDays, setWorkoutDays] = useState([]); // days the user picked as their availability
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [weekStart, setWeekStart] = useState(() => philippinesMondayString());
  const [activeDay, setActiveDay] = useState(() => philippinesDateString());
=======
  const [activeDay, setActiveDay] = useState(() => getPhilippinesWeekday());
>>>>>>> origin/master
  const [startingSessionId, setStartingSessionId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sessionsRes, profileRes] = await Promise.all([
        userApi.get("/workouts"),
        userApi.get("/profile"),
      ]);
      const loadedSessions = sessionsRes.data.data || [];
      setSessions(loadedSessions);
      const profile = profileRes.data.data || {};
      const days = profile.preferred_days || [];
      setWorkoutDays(days);
      setFitnessGoal(profile.fitness_goal || "");
      const today = philippinesDateString();
<<<<<<< HEAD
      if (!initializedSchedule.current) {
        const nextScheduledDate = [...new Set(
          loadedSessions
            .map((session) => philippinesDateKey(session.session_date))
            .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today)
        )].sort()[0];
        const initialDate = nextScheduledDate || today;
        const initialWeekStart = philippinesMondayString(new Date(`${initialDate}T12:00:00+08:00`));
        setWeekStart(initialWeekStart);
        setActiveDay(initialDate);
        initializedSchedule.current = true;
=======
      const nextScheduledDate = [...new Set(
        loadedSessions
          .map((session) => philippinesDateKey(session.session_date))
          .filter((date) => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today)
      )].sort()[0];
      if (nextScheduledDate) {
        setActiveDay(nextScheduledDate);
      } else if (days.length > 0) {
        setActiveDay((currentDay) => days.includes(currentDay) ? currentDay : days[0]);
>>>>>>> origin/master
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load your workouts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

<<<<<<< HEAD
  const sessionsForDay = (day) => sessions.filter((session) => isSessionScheduledForDate(session, day));

  const isWorkoutDay = (day) => {
    const weekday = getWeekday(day);
    return sessionsForDay(day).length > 0 || workoutDays.length === 0 || workoutDays.includes(weekday);
  };

  // The status of every workout scheduled on a day, used for the day markers.
  const statusForDay = (day) => {
    const daySessions = sessionsForDay(day);
    if (daySessions.length === 0) return "";
    return daySessions.reduce(
      (current, session) => mergeWorkoutStatus(current, resolveWorkoutStatus(session)),
      ""
    );
=======
  const isWorkoutDay = (day) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return sessions.some((session) => philippinesDateKey(session.session_date) === day);
    return workoutDays.length === 0 || workoutDays.includes(day);
>>>>>>> origin/master
  };

  const handleComplete = async (id) => {
    setError("");
    try {
      await userApi.put(`/workouts/${id}/complete`);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to update this workout. Please try again.");
    }
  };

  const handleStart = async (id) => {
    setError("");
    setStartingSessionId(id);
    try {
      await userApi.put(`/workouts/${id}/start`);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to start this workout. Please try again.");
    } finally {
      setStartingSessionId(null);
    }
  };

<<<<<<< HEAD
=======
  const handleDelete = async (id) => {
    setError("");
    try {
      await userApi.delete(`/workouts/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to remove this workout. Please try again.");
    }
  };

>>>>>>> origin/master
  const handleReset = async () => {
    if (!confirm("Reset all workouts for this week?")) return;
    setError("");
    try {
      await userApi.delete("/workouts/reset/week");
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to reset this week's workouts. Please try again.");
    }
  };

<<<<<<< HEAD
  const daySessions = sessionsForDay(activeDay);
  const workoutDayGroups = getWorkoutDayGroups(sessions);
  const completedWorkoutDays = workoutDayGroups.filter((group) => group.isComplete);
  const completedCount = completedWorkoutDays.length;
  const today = philippinesDateString();
  const weekStartDate = philippinesMondayString();
  const completedThisWeek = completedWorkoutDays.filter(
    (group) => group.completionDate >= weekStartDate && group.completionDate <= today
  ).length;
=======
  const daySessions = sessions.filter((s) => philippinesDateKey(s.session_date) === activeDay || s.day_of_week === activeDay);
  const completedCount = sessions.filter((s) => s.completed).length;
  const today = philippinesDateString();
  const weekStartDate = philippinesMondayString();
  const completedThisWeek = sessions.filter((session) => {
    if (!session.completed) return false;
    const value = session.completed_at || session.session_date;
    if (!value) return false;
    const date = philippinesDateKey(value);
    return date >= weekStartDate && date <= today;
  }).length;
>>>>>>> origin/master
  const weeklyGoal = workoutDays.length;
  const weeklyProgress = weeklyGoal ? Math.min(100, Math.round((completedThisWeek / weeklyGoal) * 100)) : 0;
  const nextSession = sessions
    .filter((session) => {
      const date = philippinesDateKey(session.session_date);
      return !session.completed && date && date >= today;
    })
    .sort((a, b) => philippinesDateKey(a.session_date).localeCompare(philippinesDateKey(b.session_date)))[0];
<<<<<<< HEAD
  const weekDates = DAYS.map((_, index) => addDays(weekStart, index));
  const activeDayLabel = formatWorkoutDate(activeDay);
  const weekEnd = weekDates[6];
  const weekLabel = `${formatPhilippinesDate(weekStart, { month: "short", day: "numeric" })} – ${formatPhilippinesDate(weekEnd, { month: "short", day: "numeric", year: "numeric" })}`;
=======
  const isScheduledDate = /^\d{4}-\d{2}-\d{2}$/.test(activeDay);
  const activeDayLabel = isScheduledDate ? formatWorkoutDate(activeDay) : activeDay;
  const scheduledDates = [...new Set(
    sessions
      .map((session) => philippinesDateKey(session.session_date))
      .filter((date) => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date))
  )].sort();
>>>>>>> origin/master

  return (
    <div className="min-h-screen bg-[#fffaf5] dark:bg-[#080808] text-slate-900 dark:text-white">
      {/* Header */}
      <div className="ave-page-hero border-b border-orange-100 px-5 pb-6 pt-8 dark:border-white/5 sm:px-8 sm:pb-8">
        <div className="mx-auto max-w-5xl">
          <p className="hero-muted text-sm">Your training dashboard</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Welcome back, {user?.first_name || "Athlete"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            {fitnessGoal && (
              <span className="inline-flex items-center gap-1.5">
                <Target size={15} className="text-orange-500" /> {fitnessGoal}
              </span>
            )}
            {nextSession && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={15} className="text-orange-500" />
                Next workout {formatWorkoutDate(nextSession.session_date)}
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#111]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">This week</span>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
<<<<<<< HEAD
                  {weeklyGoal ? `${completedThisWeek}/${weeklyGoal} workout days` : `${completedCount} workout days completed`}
=======
                  {weeklyGoal ? `${completedThisWeek}/${weeklyGoal} sessions` : `${completedCount} completed all time`}
>>>>>>> origin/master
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Weekly workout goal"
                aria-valuemin="0"
                aria-valuemax={weeklyGoal || 100}
                aria-valuenow={weeklyGoal ? Math.min(weeklyGoal, completedThisWeek) : 0}
                className="h-2 overflow-hidden rounded-full bg-orange-50 dark:bg-white/10"
              >
                <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${weeklyProgress}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {weeklyGoal ? "Keep showing up for your weekly training goal." : "Set your preferred workout days in your profile to track a weekly goal."}
              </p>
            </div>
            <Link
              to="/user/progress"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-orange-500/30 dark:text-orange-300 dark:hover:bg-orange-500/10"
            >
              View progress <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="mx-5 mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300 sm:mx-8">
          {error}
        </div>
      )}

      {/* Day Selector */}
      <div className="overflow-x-auto px-5 py-4 sm:px-8">
<<<<<<< HEAD
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                const previousWeekStart = addDays(weekStart, -7);
                setWeekStart(previousWeekStart);
                setActiveDay(addDays(previousWeekStart, Math.max(0, weekDates.indexOf(activeDay))));
              }}
              aria-label="Previous week"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-orange-300 hover:text-orange-600 dark:border-white/10 dark:bg-[#111] dark:text-slate-300"
            >
              <ArrowLeft size={17} />
            </button>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{weekLabel}</p>
            <button
              type="button"
              onClick={() => {
                const nextWeekStart = addDays(weekStart, 7);
                setWeekStart(nextWeekStart);
                setActiveDay(addDays(nextWeekStart, Math.max(0, weekDates.indexOf(activeDay))));
              }}
              aria-label="Next week"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-orange-300 hover:text-orange-600 dark:border-white/10 dark:bg-[#111] dark:text-slate-300"
            >
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="flex w-max gap-2 lg:w-full">
            {weekDates.map((day) => {
              const dayStatus = statusForDay(day);
              const restDay = !isWorkoutDay(day);
              const label = getWeekday(day).slice(0, 3);
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  aria-pressed={activeDay === day}
                  aria-label={`${getWeekday(day)}, ${formatWorkoutDate(day)} workout plan${dayStatus ? `, ${dayStatus}` : ""}`}
                  className={`flex min-w-[62px] flex-col items-center rounded-2xl px-3 py-3 text-sm font-medium transition sm:flex-1 ${
                    activeDay === day
                      ? "bg-orange-500 text-white"
                      : restDay
                        ? "bg-slate-50 text-slate-600"
                        : "bg-white text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <span>{label}</span>
                  <span className={`mt-0.5 text-[10px] ${activeDay === day ? "text-orange-100" : "text-slate-400"}`}>
                    {formatPhilippinesDate(day, { month: "numeric", day: "numeric" })}
                  </span>
                  {restDay ? (
                    <Moon size={10} className={`mt-1 ${activeDay === day ? "text-orange-400" : "text-slate-600"}`} />
                  ) : dayStatus ? (
                    <div className={`mt-1 h-1.5 w-1.5 rounded-full ${activeDay === day ? "bg-white" : workoutStatusDotClass(dayStatus)}`} />
                  ) : null}
                </button>
              );
            })}
          </div>
=======
        <div className="mx-auto flex w-max gap-2 lg:mx-0">
          {[...DAYS, ...scheduledDates].map((day) => {
            const hasWorkout = sessions.some((s) => philippinesDateKey(s.session_date) === day || s.day_of_week === day);
            const restDay = !isWorkoutDay(day);
            const isDate = /^\d{4}-\d{2}-\d{2}$/.test(day);
            const label = isDate ? formatWorkoutDate(day) : day.slice(0, 3);
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                aria-pressed={activeDay === day}
                className={`flex flex-col items-center px-4 py-3 rounded-2xl text-sm font-medium transition min-w-[60px] ${
                  activeDay === day
                    ? "bg-orange-500 text-white"
                    : restDay
                    ? "bg-slate-50 text-slate-600"
                    : "bg-white text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className={isDate ? "whitespace-nowrap text-xs" : ""}>{label}</span>
                {restDay ? (
                  <Moon size={10} className={`mt-1 ${activeDay === day ? "text-orange-400" : "text-slate-600"}`} />
                ) : hasWorkout ? (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeDay === day ? "bg-white" : "bg-orange-500"}`} />
                ) : null}
              </button>
            );
          })}
>>>>>>> origin/master
        </div>
      </div>

      {/* Workout List */}
      <div className="mx-auto max-w-5xl space-y-3 px-5 py-3 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Training plan</p>
            <h2 className="mt-0.5 font-bold text-slate-900 dark:text-white">{activeDayLabel}&apos;s workouts</h2>
          </div>
<<<<<<< HEAD
          {!daySessions.some((session) => /^\d{4}-\d{2}-\d{2}$/.test(philippinesDateKey(session.session_date))) && isWorkoutDay(activeDay) && daySessions.length > 0 && (
=======
          {!isScheduledDate && isWorkoutDay(activeDay) && daySessions.length > 0 && (
>>>>>>> origin/master
            <button onClick={handleReset} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition">
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white animate-pulse dark:bg-[#111]" />)}
          </div>
        ) : !isWorkoutDay(activeDay) ? (
          <div className="rounded-2xl border border-orange-100 bg-white px-5 py-12 text-center dark:border-white/5 dark:bg-[#111]">
            <Moon size={36} className="mx-auto mb-3 text-orange-500" />
            <p className="font-semibold text-slate-900 dark:text-white">Rest and recover</p>
            <p className="mt-1 text-sm text-slate-500">You didn&apos;t set {activeDay} as a workout day. Recovery is part of your training.</p>
          </div>
        ) : daySessions.length === 0 ? (
          <div className="rounded-2xl border border-orange-100 bg-white px-5 py-12 text-center dark:border-white/5 dark:bg-[#111]">
            <Dumbbell size={36} className="mx-auto mb-3 text-orange-500" />
            <p className="font-semibold text-slate-900 dark:text-white">No workouts assigned yet</p>
            <p className="mt-1 text-sm text-slate-500">Your coach&apos;s plan for {activeDayLabel} will appear here.</p>
          </div>
        ) : (
<<<<<<< HEAD
          daySessions.map((session) => {
            const status = resolveWorkoutStatus(session);
            const isComplete = status === WORKOUT_STATUS.COMPLETE;
            return (
              <div key={session.session_id}
                className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#111] ${isComplete ? "border-green-500/30" : "border-orange-100 dark:border-white/5"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className={`font-semibold ${isComplete ? "text-slate-500" : "text-slate-900 dark:text-white"}`}>
                      {session.exercise_name || "Workout"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{session.muscle_group || ""}</p>
                    <div className="flex gap-3 mt-2 text-xs text-slate-500">
                      {session.sets && <span>💪 {session.sets} sets</span>}
                      {session.reps && <span>🔁 {session.reps} reps</span>}
                      {session.duration_minutes && <span>⏱ {session.duration_minutes} min</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${workoutStatusBadgeClass(status)}`}>
                      {status}
                    </span>
                    {isComplete && session.completed_at && (
                      <span className="text-[11px] font-medium text-slate-500">
                        Completed {formatWorkoutTime(session.completed_at)} PH time
                      </span>
                    )}
                    {status === WORKOUT_STATUS.INCOMPLETE && (
                      <span className="text-right text-[11px] font-medium text-slate-500">
                        Started but not finished
                      </span>
                    )}
                    {status === WORKOUT_STATUS.ABSENT && (
                      <span className="text-right text-[11px] font-medium text-slate-500">
                        No workout recorded
                      </span>
                    )}
                    {status === WORKOUT_STATUS.ACTIVE && (
                      isSessionScheduledForDate(session, today) ? (
                        session.started_at ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[11px] font-medium text-slate-500">
                              Started {formatWorkoutTime(session.started_at)} PH time
                            </span>
                            <button type="button" onClick={() => handleComplete(session.session_id)}
                              aria-label={`Mark ${session.exercise_name || "workout"} complete`}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-green-600 px-3 text-xs font-semibold text-white transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
                              <CheckCircle size={16} /> Complete
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => handleStart(session.session_id)}
                            disabled={startingSessionId === session.session_id}
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-orange-500 px-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                          >
                            <Play size={16} fill="currentColor" />
                            {startingSessionId === session.session_id ? "Starting..." : "Start workout"}
                          </button>
                        )
                      ) : (
                        <span className="text-right text-xs font-medium text-slate-500">
                          Available {formatWorkoutDate(session.session_date)}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
=======
          daySessions.map((session) => (
            <div key={session.session_id}
              className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#111] ${session.completed ? "border-green-500/30" : "border-orange-100 dark:border-white/5"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`font-semibold ${session.completed ? "text-slate-500" : "text-slate-900 dark:text-white"}`}>
                    {session.exercise_name || "Workout"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{session.muscle_group || ""}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    {session.sets && <span>💪 {session.sets} sets</span>}
                    {session.reps && <span>🔁 {session.reps} reps</span>}
                    {session.duration_minutes && <span>⏱ {session.duration_minutes} min</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!session.completed && (
                    session.started_at ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] font-medium text-slate-500">
                          Started {formatWorkoutTime(session.started_at)} PH time
                        </span>
                        <button type="button" onClick={() => handleComplete(session.session_id)}
                          aria-label={`Mark ${session.exercise_name || "workout"} complete`}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-green-600 px-3 text-xs font-semibold text-white transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
                          <CheckCircle size={16} /> Complete
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => handleStart(session.session_id)}
                        disabled={startingSessionId === session.session_id}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-orange-500 px-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      >
                        <Play size={16} fill="currentColor" />
                        {startingSessionId === session.session_id ? "Starting..." : "Start workout"}
                      </button>
                    )
                  )}
                  <button type="button" onClick={() => handleDelete(session.session_id)}
                    aria-label={`Remove ${session.exercise_name || "workout"}`}
                    className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-red-500/10 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
>>>>>>> origin/master
        )}
      </div>
    </div>
  );
}
