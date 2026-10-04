import { useCallback, useEffect, useState } from "react";
import { Trash2, CheckCircle, RotateCcw, Dumbbell, Moon } from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";
import userApi from "../userApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const localDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatWorkoutDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export default function WorkoutPage() {
  const { user } = useUserAuth();
  const [sessions, setSessions] = useState([]);
  const [workoutDays, setWorkoutDays] = useState([]); // days the user picked as their availability
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(() => {
    const day = new Date().getDay();
    return DAYS[day === 0 ? 6 : day - 1];
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsRes, profileRes] = await Promise.all([
        userApi.get("/workouts"),
        userApi.get("/profile"),
      ]);
      const loadedSessions = sessionsRes.data.data || [];
      setSessions(loadedSessions);
      const days = profileRes.data.data?.preferred_days || [];
      setWorkoutDays(days);
      const today = localDateString(new Date());
      const nextScheduledDate = [...new Set(
        loadedSessions
          .map((session) => session.session_date)
          .filter((date) => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today)
      )].sort()[0];
      if (nextScheduledDate) {
        setActiveDay(nextScheduledDate);
      } else if (days.length > 0) {
        setActiveDay((currentDay) => days.includes(currentDay) ? currentDay : days[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isWorkoutDay = (day) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return sessions.some((session) => session.session_date === day);
    return workoutDays.length === 0 || workoutDays.includes(day);
  };

  const handleComplete = async (id) => {
    await userApi.put(`/workouts/${id}/complete`);
    fetchData();
  };

  const handleDelete = async (id) => {
    await userApi.delete(`/workouts/${id}`);
    fetchData();
  };

  const handleReset = async () => {
    if (!confirm("Reset all workouts for this week?")) return;
    await userApi.delete("/workouts/reset/week");
    fetchData();
  };

  const daySessions = sessions.filter((s) => s.session_date === activeDay || s.day_of_week === activeDay);
  const completedCount = sessions.filter((s) => s.completed).length;
  const isScheduledDate = /^\d{4}-\d{2}-\d{2}$/.test(activeDay);
  const activeDayLabel = isScheduledDate ? formatWorkoutDate(activeDay) : activeDay;
  const scheduledDates = [...new Set(
    sessions
      .map((session) => session.session_date)
      .filter((date) => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date))
  )].sort();

  return (
    <div className="min-h-screen bg-[#fffaf5] dark:bg-[#080808] text-slate-900 dark:text-white">
      {/* Header */}
      <div className="ave-page-hero px-6 pt-10 pb-7 border-b border-orange-100 dark:border-white/5">
        <p className="hero-muted text-sm">Welcome back,</p>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{user?.first_name || "Athlete"} 👋</h1>

        {/* Progress bar */}
        <div className="mt-4 bg-white dark:bg-[#111] rounded-2xl p-4 border border-orange-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Weekly Progress</span>
            <span className="text-sm font-bold text-orange-500">{completedCount}/{sessions.length} done</span>
          </div>
          <div className="h-2 bg-orange-50 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: sessions.length > 0 ? `${(completedCount / sessions.length) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="px-4 py-4 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {[...DAYS, ...scheduledDates].map((day) => {
            const hasWorkout = sessions.some((s) => s.session_date === day || s.day_of_week === day);
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
        </div>
      </div>

      {/* Workout List */}
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">{activeDayLabel}'s Workouts</h2>
          {!isScheduledDate && isWorkoutDay(activeDay) && daySessions.length > 0 && (
            <button onClick={handleReset} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition">
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : !isWorkoutDay(activeDay) ? (
          <div className="text-center py-16">
            <Moon size={40} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-900 font-semibold">Rest Day</p>
            <p className="text-slate-500 text-sm mt-1">You didn't set {activeDay} as a workout day — recover and come back stronger.</p>
          </div>
        ) : daySessions.length === 0 ? (
          <div className="text-center py-16">
            <Dumbbell size={40} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500">No workouts assigned for {activeDayLabel} yet</p>
            <p className="text-slate-600 text-xs mt-1">Your coach will add your training plan here.</p>
          </div>
        ) : (
          daySessions.map((session) => (
            <div key={session.session_id}
              className={`bg-white rounded-2xl p-4 border ${session.completed ? "border-green-500/30" : "border-slate-200"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`font-semibold ${session.completed ? "text-slate-500 line-through" : "text-slate-900"}`}>
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
                    <button onClick={() => handleComplete(session.session_id)}
                      className="p-2 rounded-xl hover:bg-green-500/10 text-green-400 transition">
                      <CheckCircle size={20} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(session.session_id)}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
