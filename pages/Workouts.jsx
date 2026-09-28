import { useEffect, useState } from "react";
import { Dumbbell, Search, Plus, Edit2, Trash2, X, ListOrdered } from "lucide-react";
import { getWorkoutGuideExercise } from "../utils/workoutGuide";
import api from "../services/api";

const difficultyColors = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-yellow-100 text-yellow-700",
  Advanced: "bg-red-100 text-red-700",
};

const emptySteps = () => [
  { title: "Starting Position", description: "" },
  { title: "Movement", description: "" },
  { title: "Finish", description: "" },
];

function ExerciseModal({ exercise, categories, onClose, onSave }) {
  const [form, setForm] = useState(
    exercise
      ? { ...exercise }
      : { exercise_name: "", category_id: "", muscle_group: "", difficulty: "Beginner", calories_per_minute: "", description: "", equipment: "" }
  );
  const [steps, setSteps] = useState(
    exercise?.movement_steps && Array.isArray(exercise.movement_steps) && exercise.movement_steps.length === 3
      ? exercise.movement_steps
      : emptySteps()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateStep = (i, field, value) => {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const handleSubmit = async () => {
    if (!form.exercise_name || !form.muscle_group) {
      setError("Exercise name and muscle group are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      // The exercise visuals now come from the bundled Workout Guide repository.
      // Keep only AveFit's exercise metadata and optional coaching notes in the database.
      const hasTutorial = steps.some((s) => s.description.trim());
      const {
        exercise_name, category_id, muscle_group, difficulty,
        calories_per_minute, description, equipment
      } = form;
      const payload = {
        exercise_name,
        category_id,
        muscle_group,
        difficulty,
        calories_per_minute,
        description,
        equipment,
        movement_steps: hasTutorial ? steps : null,
      };
      if (exercise) {
        await api.put(`/workouts/${exercise.exercise_id}`, payload);
      } else {
        await api.post("/workouts", payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save exercise.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {exercise ? "Edit Exercise" : "Add New Exercise"}
          </h2>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Exercise Name *</label>
              <input type="text" value={form.exercise_name}
                onChange={(e) => setForm({ ...form, exercise_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
              <select value={form.category_id || ""} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Muscle Group *</label>
              <input type="text" value={form.muscle_group}
                onChange={(e) => setForm({ ...form, muscle_group: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Equipment</label>
              <input type="text" value={form.equipment || ""}
                onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Difficulty</label>
              <select value={form.difficulty || "Beginner"} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Calories / min</label>
              <input type="number" value={form.calories_per_minute || ""}
                onChange={(e) => setForm({ ...form, calories_per_minute: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
            <textarea rows={2} value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          {/* Movement Tutorial — 3 steps */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-1">
              <ListOrdered size={16} className="text-orange-600" />
              <label className="text-sm font-semibold text-slate-700">Movement Tutorial (3 steps)</label>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Shown to members as a step-by-step guide for performing this exercise correctly.
            </p>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(i, "title", e.target.value)}
                      placeholder={`Step ${i + 1} title`}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) => updateStep(i, "description", e.target.value)}
                    placeholder="Describe what to do in this phase of the movement..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white transition">
            {saving ? "Saving..." : exercise ? "Save Changes" : "Add Exercise"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Workouts() {
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editExercise, setEditExercise] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setFetchError("");
    Promise.all([
      api.get("/workouts"),
      api.get("/workouts/categories"),
    ])
      .then(([exRes, catRes]) => {
        setExercises(exRes.data.data);
        setCategories(catRes.data.data || []);
      })
      .catch((err) => {
        console.error(err);
        setFetchError(err.response?.data?.message || err.message || "Couldn't load exercises.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = () => { setEditExercise(null); setShowModal(true); };
  const handleEdit = (ex) => { setEditExercise(ex); setShowModal(true); };
  const handleDelete = async (ex) => {
    if (!confirm(`Delete "${ex.exercise_name}"? This can't be undone.`)) return;
    try {
      await api.delete(`/workouts/${ex.exercise_id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete exercise.");
    }
  };

  const categoryNames = ["All", ...new Set(exercises.map((e) => e.category_name).filter(Boolean))];

  const filtered = exercises.filter((e) => {
    const matchSearch =
      e.exercise_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.muscle_group?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || e.category_name === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {showModal && (
        <ExerciseModal
          exercise={editExercise}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={fetchData}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Exercises</h1>
          <p className="text-slate-500 mt-1">Manage the exercise library and use the bundled Workout Guide illustrations.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition"
        >
          <Plus size={18} /> Add Exercise
        </button>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {fetchError}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-full sm:w-72">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none ml-2 w-full text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categoryNames.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === c ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center text-slate-400">
          No exercises found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((exercise) => (
            <div key={exercise.exercise_id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group relative">
              <div className="bg-orange-600 p-5 text-white">
                <div className="flex items-center justify-between">
                  <Dumbbell size={24} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20">
                      {exercise.category_name || "General"}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold mt-3">{exercise.exercise_name}</h3>
                <p className="text-orange-100 text-sm mt-1">{exercise.muscle_group || "Full Body"}</p>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-slate-500 line-clamp-2">{exercise.description || "No description."}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {exercise.equipment && <span>🏋️ {exercise.equipment}</span>}
                    {exercise.calories_per_minute && (
                      <span className="ml-3">🔥 {exercise.calories_per_minute} kcal/min</span>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColors[exercise.difficulty] || "bg-slate-100 text-slate-500"}`}>
                    {exercise.difficulty || "N/A"}
                  </span>
                </div>
                {(() => {
                  const guide = getWorkoutGuideExercise(exercise.exercise_name);
                  return guide ? (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2 border border-slate-100">
                      <img
                        src={`/workout-guide/${guide.frames[1].path}`}
                        alt=""
                        aria-hidden="true"
                        className="w-14 h-14 object-contain rounded-lg bg-white brightness-0 opacity-60"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Workout Guide</p>
                        <p className="text-[11px] text-slate-400">3 illustrated movement frames</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Dumbbell size={12} /> No matching Workout Guide entry
                    </div>
                  );
                })()}
                {exercise.movement_steps && (
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <ListOrdered size={12} /> Coaching notes added
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleEdit(exercise)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(exercise)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
