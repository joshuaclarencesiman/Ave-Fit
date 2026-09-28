import { useEffect, useState } from "react";
import { Search, X, ChevronDown, ListOrdered, Dumbbell } from "lucide-react";
import userApi from "../userApi";
import WorkoutGuide from "../components/WorkoutGuide";
import { getWorkoutGuideExercise } from "../utils/workoutGuide";

function ExerciseDetail({ exercise, onClose }) {
  const steps = Array.isArray(exercise.movement_steps) ? exercise.movement_steps : null;
  const guide = getWorkoutGuideExercise(exercise.exercise_name);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{exercise.exercise_name}</h3>
            <p className="text-slate-500 text-sm">{exercise.muscle_group}</p>
          </div>
          <button onClick={onClose} aria-label="Close exercise guide">
            <X size={22} className="text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Difficulty", value: exercise.difficulty || "N/A" },
            { label: "Equipment", value: exercise.equipment || "None" },
            { label: "Cal/min", value: exercise.calories_per_minute ? `${exercise.calories_per_minute} kcal` : "—" },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-slate-900 font-semibold text-sm">{item.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {exercise.description && (
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-slate-600 mb-2">Description</h4>
            <p className="text-slate-500 text-sm leading-relaxed">{exercise.description}</p>
          </div>
        )}

        <div className="mb-5 border-t border-slate-100 pt-5">
          {guide ? (
            <WorkoutGuide exerciseName={guide} />
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <Dumbbell size={16} className="text-orange-500" /> Workout Guide
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                A matching illustrated guide is not available for this exercise yet.
              </p>
            </div>
          )}
        </div>

        {steps && (
          <div className="border-t border-slate-100 pt-5">
            <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
              <ListOrdered size={15} className="text-orange-500" /> Coaching Notes
            </h4>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-orange-200 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="font-semibold text-slate-900 text-sm">{step.title}</p>
                    <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const difficultyColors = {
  Beginner: "bg-green-500/20 text-green-400",
  Intermediate: "bg-yellow-500/20 text-yellow-400",
  Advanced: "bg-red-500/20 text-red-400",
};

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.all([
      userApi.get("/exercises"),
      userApi.get("/exercises/categories"),
    ])
      .then(([exRes, catRes]) => {
        setExercises(exRes.data.data || []);
        setCategories(catRes.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = exercises.filter((e) => {
    const matchSearch = e.exercise_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.muscle_group?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || e.category_name === filterCategory;
    const matchDiff = filterDifficulty === "All" || e.difficulty === filterDifficulty;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <div className="min-h-screen bg-[#fffaf5] dark:bg-[#080808] text-slate-900 dark:text-white">
      {selected && <ExerciseDetail exercise={selected} onClose={() => setSelected(null)} />}

      <div className="ave-page-hero px-6 pt-10 pb-7 border-b border-orange-100 dark:border-white/5">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Exercise Library</h1>
        <p className="text-slate-400 text-sm mt-1">
          {exercises.length} exercises available · illustrated workout guides
        </p>
      </div>

      <div className="px-6 space-y-4">
        <div className="flex items-center bg-white rounded-xl px-4 py-3 gap-3">
          <Search size={18} className="text-slate-500" />
          <input type="text" placeholder="Search exercises..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-slate-900 placeholder-slate-400 flex-1 text-sm" />
          {search && <button onClick={() => setSearch("")}><X size={16} className="text-slate-500" /></button>}
        </div>

        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition">
          <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          Filters {filterCategory !== "All" || filterDifficulty !== "All" ? "•" : ""}
        </button>

        {showFilters && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {["All", ...categories.map((c) => c.category_name)].map((c) => (
                  <button key={c} onClick={() => setFilterCategory(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      filterCategory === c ? "bg-orange-500 text-white" : "bg-white text-slate-500"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Difficulty</label>
              <div className="flex gap-2">
                {["All", "Beginner", "Intermediate", "Advanced"].map((d) => (
                  <button key={d} onClick={() => setFilterDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      filterDifficulty === d ? "bg-orange-500 text-white" : "bg-white text-slate-500"
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500">{filtered.length} exercises found</p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No exercises found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((exercise) => {
              const guide = getWorkoutGuideExercise(exercise.exercise_name);
              return (
                <button key={exercise.exercise_id} onClick={() => setSelected(exercise)}
                  className="w-full bg-white hover:bg-slate-100 rounded-2xl p-4 text-left transition border border-slate-200 hover:border-orange-500/50">
                  <div className="flex items-center gap-4">
                    {guide && (
                      <img
                        src={`/workout-guide/${guide.frames[1].path}`}
                        alt=""
                        aria-hidden="true"
                        className="w-16 h-16 rounded-xl bg-slate-50 object-contain shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{exercise.exercise_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{exercise.muscle_group} • {exercise.category_name || "General"}</p>
                      {exercise.equipment && <p className="text-xs text-slate-500 mt-1">🏋️ {exercise.equipment}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        {guide ? (
                          <p className="text-xs text-orange-500 flex items-center gap-1">
                            <Dumbbell size={11} /> Workout Guide
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400">Guide unavailable</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium shrink-0 ${difficultyColors[exercise.difficulty] || "bg-slate-100 text-slate-500"}`}>
                      {exercise.difficulty || "N/A"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
