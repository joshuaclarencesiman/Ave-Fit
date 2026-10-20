import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Dumbbell, Trash2, Plus, Users } from "lucide-react";
import trainerApi from "../trainerApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function MemberRow({ member, exercises, onChanged }) {
  const [expanded, setExpanded] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [form, setForm] = useState({ exercise_id: "", sets: "", reps: "", duration_minutes: "", session_date: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dayOptions = member.preferred_days?.length > 0 ? member.preferred_days : DAYS;

  const fetchSessions = () => {
    setLoadingSessions(true);
    trainerApi.get(`/me/members/${member.user_id}/sessions`)
      .then((res) => setSessions(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoadingSessions(false));
  };

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && sessions.length === 0) fetchSessions();
  };

  const handleAssign = async () => {
    if (!form.exercise_id || !form.session_date) {
      setError("Please pick an exercise and a day.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await trainerApi.post("/me/assign", { ...form, user_id: member.user_id });
      setForm({ exercise_id: "", sets: "", reps: "", duration_minutes: "", session_date: "" });
      fetchSessions();
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign workout.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    await trainerApi.delete(`/me/sessions/${sessionId}`);
    fetchSessions();
    onChanged?.();
  };

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
      <button onClick={toggleExpand} className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-800/60 transition text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-bold text-sm">
            {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{member.first_name} {member.last_name}</p>
            <p className="text-slate-500 text-xs">{member.fitness_goal || "No goal set"} · {member.email}</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-800">
          {/* Assign form */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
            <div className="col-span-2 sm:col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Exercise</label>
              <select value={form.exercise_id} onChange={(e) => setForm({ ...form, exercise_id: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white">
                <option value="">Select...</option>
                {exercises.map((e) => (
                  <option key={e.exercise_id} value={e.exercise_id}>{e.exercise_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sets</label>
              <input type="number" value={form.sets} onChange={(e) => setForm({ ...form, sets: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Reps</label>
              <input type="number" value={form.reps} onChange={(e) => setForm({ ...form, reps: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Day</label>
              <select value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white">
                <option value="">Select...</option>
                {dayOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          <button onClick={handleAssign} disabled={saving}
            className="mt-3 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-2 rounded-lg transition">
            <Plus size={14} /> {saving ? "Assigning..." : "Assign Workout"}
          </button>

          {/* Assigned sessions */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Assigned Workouts</p>
            {loadingSessions ? (
              <p className="text-xs text-slate-500">Loading...</p>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-slate-500">No workouts assigned yet.</p>
            ) : (
              <div className="space-y-1.5">
                {sessions.map((s) => (
                  <div key={s.session_id} className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Dumbbell size={14} className="text-emerald-400" />
                      <span className="font-medium text-slate-200">{s.exercise_name || "Exercise"}</span>
                      <span className="text-slate-500">· {s.session_date}</span>
                      {s.sets && <span className="text-slate-500">· {s.sets}x{s.reps || "?"}</span>}
                      {s.completed && <span className="text-green-400 font-medium">✓ Done</span>}
                    </div>
                    <button onClick={() => handleDeleteSession(s.session_id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainerDashboard() {
  const [members, setMembers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoster = () => {
    trainerApi.get("/me/roster")
      .then((res) => setMembers(res.data.data || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      trainerApi.get("/me/roster"),
      trainerApi.get("/me/exercises"),
    ])
      .then(([rosterRes, exercisesRes]) => {
        setMembers(rosterRes.data.data || []);
        setExercises(exercisesRes.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Users size={24} className="text-emerald-400" /> My Roster
      </h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">
        Members who chose you as their coach. Expand a member to assign workouts to their weekly schedule.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-900 rounded-2xl animate-pulse" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 border border-slate-800 rounded-2xl">
          <Users size={40} className="mx-auto text-slate-700 mb-3" />
          <p className="text-slate-400 font-medium">No members yet</p>
          <p className="text-slate-600 text-sm mt-1">Members will appear here once they pick you as their coach during onboarding.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <MemberRow key={m.user_id} member={m} exercises={exercises} onChanged={fetchRoster} />
          ))}
        </div>
      )}
    </div>
  );
}
