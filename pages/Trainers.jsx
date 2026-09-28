import { useEffect, useState, useRef } from "react";
import { UserCheck, Plus, Search, Edit2, XCircle, Users, UserCircle, ChevronDown, ChevronUp, Dumbbell, Trash2, X, Camera, Check } from "lucide-react";
import api from "../services/api";
import { fileToCompressedDataUrl } from "../utils/imageUpload";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SPECIALIZATION_OPTIONS = [
  "High-Intensity Interval Training (HIIT)",
  "Circuit Training",
  "Olympic Weightlifting",
  "Powerlifting",
  "Calisthenics & Bodyweight",
  "Kettlebell Training",
  "Functional Fitness",
  "CrossFit Coaching",
  "Bodybuilding & Physique",
  "Weight Loss & Management",
  "Group Fitness",
];

const normalizeSpecializations = (trainer) => Array.isArray(trainer?.specializations) ? trainer.specializations.filter(Boolean) : [];

const statusColors = {
  Active: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
  Inactive: "bg-slate-100 text-slate-500",
};

function TrainerModal({ trainer, onClose, onSave }) {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(
    trainer || { full_name: "", email: "", phone: "", specializations: [], goal_specialty: "" }
  );
  const [selectedSpecializations, setSelectedSpecializations] = useState(normalizeSpecializations(trainer));
  const [photo, setPhoto] = useState(trainer?.photo_url || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError("");
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setPhoto(dataUrl);
    } catch (err) {
      setError(err.message || "Failed to read photo.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.email) {
      setError("Full name and email are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, specializations: selectedSpecializations, photo_url: photo, ...(password ? { password } : {}) };
      delete payload.specialization;
      if (trainer) {
        await api.put(`/trainers/${trainer.trainer_id}`, { ...payload, status: trainer.status });
      } else {
        await api.post("/trainers", payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save trainer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800">
            {trainer ? "Edit Trainer" : "Add New Trainer"}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="relative w-16 h-16 rounded-full disabled:opacity-70 shrink-0"
            >
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center overflow-hidden">
                {photo ? (
                  <img src={photo} alt="Trainer" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xl font-bold">{form.full_name?.charAt(0) || "?"}</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-slate-100 shadow">
                {uploadingPhoto ? (
                  <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={11} className="text-slate-700" />
                )}
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <div>
              <p className="text-sm font-medium text-slate-700">Profile Photo</p>
              <p className="text-xs text-slate-400">Shown to members on the Coach Selection screen.</p>
            </div>
          </div>

          {[
            { label: "Full Name *", key: "full_name", type: "text" },
            { label: "Email *", key: "email", type: "email" },
            { label: "Phone", key: "phone", type: "text" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-600">Specializations</label>
              <span className="text-xs text-slate-400">Choose one or more</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {SPECIALIZATION_OPTIONS.map((option) => {
                const selected = selectedSpecializations.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedSpecializations((current) => selected ? current.filter((item) => item !== option) : [...current, option])}
                    className={`flex items-center gap-2 text-left px-3 py-2.5 rounded-xl border text-sm transition ${selected ? "border-orange-500 bg-orange-500/10 text-orange-700" : "border-slate-200 bg-white text-slate-600 hover:border-orange-300"}`}
                  >
                    <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${selected ? "bg-orange-500 border-orange-500 text-white" : "border-slate-300"}`}>
                      {selected && <Check size={13} strokeWidth={3} />}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
            {selectedSpecializations.length > 0 && (
              <p className="text-xs text-orange-600 mt-2 font-medium">{selectedSpecializations.length} specialization{selectedSpecializations.length === 1 ? "" : "s"} selected.</p>
            )}
            <p className="text-xs text-slate-400 mt-1">These specialties are shown on the coach profile and used for coach recommendations.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Coach Bio / Profile</label>
            <textarea
              value={form.bio || ""}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Short introduction, coaching approach, and experience..."
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">This profile is shown to members when they browse coaches.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Recommended For (goal match)</label>
            <select
              value={form.goal_specialty || ""}
              onChange={(e) => setForm({ ...form, goal_specialty: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">No specific match</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="Maintain Weight">Maintain Weight</option>
              <option value="General Fitness">General Fitness</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Members with this goal will see this coach highlighted as "Recommended".
            </p>
          </div>

          <div className="pt-2 border-t">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Coach Portal Password {trainer && (
                <span className={`ml-1 text-xs font-normal ${trainer.has_portal_access ? "text-green-600" : "text-slate-400"}`}>
                  ({trainer.has_portal_access ? "portal access enabled" : "no portal access yet"})
                </span>
              )}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={trainer ? "Leave blank to keep current password" : "Set a login password"}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Lets this coach log in at <code>/trainer/login</code> to view their roster and assign workouts.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="p-6 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border text-slate-600 hover:bg-slate-50 text-sm font-medium transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition disabled:opacity-50"
          >
            {saving ? "Saving..." : trainer ? "Save Changes" : "Add Trainer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TrainerProfileModal({ trainer, onClose, onEdit }) {
  const specializations = normalizeSpecializations(trainer);
  const expertise = [...new Set([...specializations, trainer.goal_specialty].filter(Boolean))];

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[55vh] min-h-[360px] max-h-[650px] bg-slate-950 overflow-hidden flex items-center justify-center">
          {trainer.photo_url ? (
            <>
              <img
                src={trainer.photo_url}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
              />
              <div className="absolute inset-0 bg-black/20" />
              <img
                src={trainer.photo_url}
                alt={trainer.full_name}
                className="relative z-10 w-auto h-auto max-w-full max-h-full object-contain"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserCircle size={150} className="text-orange-500" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
          >
            <X size={19} />
          </button>

          <div className="absolute bottom-5 left-6 right-6 text-white">
            <p className="text-xs uppercase tracking-widest font-bold text-orange-300">
              Trainer Profile
            </p>
            <h2 className="text-3xl font-bold mt-1">{trainer.full_name}</h2>
            <p className="text-sm text-orange-300 font-semibold mt-1">
              {trainer.goal_specialty || "General Fitness Coach"}
            </p>
          </div>
        </div>

        <div className="p-6">
          <section>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
              About the Trainer
            </p>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-line">
              {trainer.bio || "This trainer has not added a profile description yet."}
            </p>
          </section>

          <section className="mt-6">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
              Specializations
            </p>
            {expertise.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {expertise.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No specializations listed.</p>
            )}
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-400">Email</p>
              <p className="font-medium text-sm mt-1 break-all text-slate-700 dark:text-slate-200">
                {trainer.email || "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-400">Phone</p>
              <p className="font-medium text-sm mt-1 text-slate-700 dark:text-slate-200">
                {trainer.phone || "—"}
              </p>
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Account Status</p>
              <p className="font-semibold text-sm mt-1 text-slate-800 dark:text-white">
                {trainer.status || "Active"}
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusColors[trainer.status] || statusColors.Active}`}>
              {trainer.status || "Active"}
            </span>
          </section>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              Edit Trainer Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberRow({ member, trainer, exercises }) {
  const [expanded, setExpanded] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [form, setForm] = useState({ exercise_id: "", sets: "", reps: "", duration_minutes: "", session_date: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dayOptions = member.preferred_days?.length > 0 ? member.preferred_days : DAYS;

  const fetchSessions = () => {
    setLoadingSessions(true);
    api.get(`/workouts/member/${member.user_id}`)
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
      await api.post("/workouts/assign", {
        ...form,
        user_id: member.user_id,
        trainer_id: trainer.trainer_id,
      });
      setForm({ exercise_id: "", sets: "", reps: "", duration_minutes: "", session_date: "" });
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign workout.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    await api.delete(`/workouts/session/${sessionId}`);
    fetchSessions();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={toggleExpand} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
            {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{member.first_name} {member.last_name}</p>
            <p className="text-slate-400 text-xs">{member.fitness_goal || "No goal set"} · {member.email}</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/50">
          {/* Assign form */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
            <div className="col-span-2 sm:col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Exercise</label>
              <select value={form.exercise_id} onChange={(e) => setForm({ ...form, exercise_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-2 py-2 text-xs">
                <option value="">Select...</option>
                {exercises.map((e) => (
                  <option key={e.exercise_id} value={e.exercise_id}>{e.exercise_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sets</label>
              <input type="number" value={form.sets} onChange={(e) => setForm({ ...form, sets: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-2 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Reps</label>
              <input type="number" value={form.reps} onChange={(e) => setForm({ ...form, reps: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-2 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Day</label>
              <select value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-2 py-2 text-xs">
                <option value="">Select...</option>
                {dayOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <button onClick={handleAssign} disabled={saving}
            className="mt-3 flex items-center gap-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-2 rounded-lg transition">
            <Plus size={14} /> {saving ? "Assigning..." : "Assign Workout"}
          </button>

          {/* Assigned sessions */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Assigned Workouts</p>
            {loadingSessions ? (
              <p className="text-xs text-slate-400">Loading...</p>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-slate-400">No workouts assigned yet.</p>
            ) : (
              <div className="space-y-1.5">
                {sessions.map((s) => (
                  <div key={s.session_id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Dumbbell size={14} className="text-orange-500" />
                      <span className="font-medium text-slate-700">{s.exercise_name || "Exercise"}</span>
                      <span className="text-slate-400">· {s.session_date}</span>
                      {s.sets && <span className="text-slate-400">· {s.sets}x{s.reps || "?"}</span>}
                      {s.completed && <span className="text-green-500 font-medium">✓ Done</span>}
                    </div>
                    <button onClick={() => handleDeleteSession(s.session_id)} className="text-red-400 hover:text-red-600">
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

function RosterModal({ trainer, onClose }) {
  const [members, setMembers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/trainers/${trainer.trainer_id}/roster`),
      api.get("/workouts"),
    ])
      .then(([rosterRes, exercisesRes]) => {
        setMembers(rosterRes.data.data || []);
        setExercises(exercisesRes.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [trainer.trainer_id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users size={20} className="text-orange-500" /> {trainer.full_name}'s Roster
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">Assign workouts to each member's weekly schedule.</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-slate-400 py-12 text-sm">No members have chosen this coach yet.</p>
          ) : (
            members.map((m) => <MemberRow key={m.user_id} member={m} trainer={trainer} exercises={exercises} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);
  const [rosterTrainer, setRosterTrainer] = useState(null);
  const [profileTrainer, setProfileTrainer] = useState(null);

  const fetchTrainers = () => {
    setLoading(true);
    setFetchError("");
    api.get("/trainers")
      .then((res) => setTrainers(res.data.data))
      .catch((err) => {
        console.error(err);
        setFetchError(err.response?.data?.message || err.message || "Couldn't load trainers.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrainers(); }, []);

  const handleApprove = async (id) => {
    await api.put(`/trainers/${id}/approve`);
    fetchTrainers();
  };

  const handleReject = async (id) => {
    if (!confirm("Reject this trainer account?")) return;
    await api.put(`/trainers/${id}/reject`);
    fetchTrainers();
  };

  const handleDeactivate = async (id) => {
    if (!confirm("Deactivate this trainer?")) return;
    await api.put(`/trainers/${id}/deactivate`);
    fetchTrainers();
  };

  const handleEdit = (trainer) => {
    setEditTrainer(trainer);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditTrainer(null);
    setShowModal(true);
  };

  const filtered = trainers.filter((t) =>
    t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (t.specializations || normalizeSpecializations(t)).join(" ").toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {showModal && (
        <TrainerModal
          trainer={editTrainer}
          onClose={() => setShowModal(false)}
          onSave={fetchTrainers}
        />
      )}

      {rosterTrainer && (
        <RosterModal
          trainer={rosterTrainer}
          onClose={() => setRosterTrainer(null)}
        />
      )}

      {profileTrainer && (
        <TrainerProfileModal
          trainer={profileTrainer}
          onClose={() => setProfileTrainer(null)}
          onEdit={() => { setEditTrainer(profileTrainer); setProfileTrainer(null); setShowModal(true); }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Trainers</h1>
          <p className="text-slate-500 mt-1">Manage gym trainers and their specializations.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition"
        >
          <Plus size={18} />
          Add Trainer
        </button>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {fetchError}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-full sm:w-72">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search trainers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none ml-2 w-full text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Trainer</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Specialization</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Phone</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Joined</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No trainers found.</td>
                </tr>
              ) : (
                filtered.map((trainer) => (
                  <tr key={trainer.trainer_id} onClick={() => setProfileTrainer(trainer)} className="hover:bg-slate-50 transition cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-orange-500 font-bold text-sm flex-shrink-0 overflow-hidden border-2 border-orange-500/20">
                          {trainer.photo_url ? <img src={trainer.photo_url} alt={trainer.full_name} className="w-full h-full object-cover" /> : trainer.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{trainer.full_name}</p>
                          <p className="text-slate-400 text-xs">{trainer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600"><div className="flex flex-wrap gap-1.5 max-w-sm">{(trainer.specializations || normalizeSpecializations(trainer)).length ? (trainer.specializations || normalizeSpecializations(trainer)).slice(0, 3).map((item) => <span key={item} className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">{item}</span>) : <span>—</span>}{(trainer.specializations || normalizeSpecializations(trainer)).length > 3 && <span className="text-xs text-slate-400">+{(trainer.specializations || normalizeSpecializations(trainer)).length - 3} more</span>}</div></td>
                    <td className="px-6 py-4 text-slate-600">{trainer.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[trainer.status] || statusColors.Inactive}`}>
                        {trainer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {trainer.created_at ? new Date(trainer.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setProfileTrainer(trainer)}
                          className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition"
                          title="View Coach Profile"
                        >
                          <UserCircle size={16} />
                        </button>
                        <button
                          onClick={() => setRosterTrainer(trainer)}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition"
                          title="View Roster / Assign Workouts"
                        >
                          <Users size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(trainer)}
                          className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        {trainer.status === "Pending" && (
                          <>
                            <button onClick={() => handleApprove(trainer.trainer_id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition" title="Approve"><UserCheck size={16} /></button>
                            <button onClick={() => handleReject(trainer.trainer_id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition" title="Reject"><XCircle size={16} /></button>
                          </>
                        )}
                        {trainer.status === "Active" && (
                          <button
                            onClick={() => handleDeactivate(trainer.trainer_id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition"
                            title="Deactivate"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-400">
          {filtered.length} of {trainers.length} trainers
        </div>
      </div>
    </div>
  );
}