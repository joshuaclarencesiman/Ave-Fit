import { useEffect, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import userApi from "../userApi";


function ExerciseDetail({ exercise, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
      <div className="bg-slate-800 rounded-t-3xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{exercise.exercise_name}</h3>
            <p className="text-slate-400 text-sm">{exercise.muscle_group}</p>
          </div>
          <button onClick={onClose}><X size={22} className="text-slate-400" /></button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Difficulty", value: exercise.difficulty || "N/A" },
            { label: "Equipment", value: exercise.equipment || "None" },
            { label: "Cal/min", value: exercise.calories_per_minute ? `${exercise.calories_per_minute} kcal` : "—" },
          ].map((item) => (
            <div key={item.label} className="bg-slate-900 rounded-xl p-3 text-center">
              <p className="text-white font-semibold text-sm">{item.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {exercise.description && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Description</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{exercise.description}</p>
          </div>
        )}

        {/* Video tutorials removed. The active client uses the bundled Workout Guide. */}
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
      userApi.get("/exercise-categories"),
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
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {selected && <ExerciseDetail exercise={selected} onClose={() => setSelected(null)} />}

      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/40 to-slate-950 px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Exercise Library</h1>
        <p className="text-slate-400 text-sm mt-1">{exercises.length} exercises available</p>
      </div>

      <div className="px-6 space-y-4">
        {/* Search */}
        <div className="flex items-center bg-slate-800 rounded-xl px-4 py-3 gap-3">
          <Search size={18} className="text-slate-500" />
          <input type="text" placeholder="Search exercises..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-white placeholder-slate-500 flex-1 text-sm" />
          {search && <button onClick={() => setSearch("")}><X size={16} className="text-slate-500" /></button>}
        </div>

        {/* Filter Toggle */}
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          Filters {filterCategory !== "All" || filterDifficulty !== "All" ? "•" : ""}
        </button>

        {showFilters && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {["All", ...categories.map((c) => c.category_name)].map((c) => (
                  <button key={c} onClick={() => setFilterCategory(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      filterCategory === c ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Difficulty</label>
              <div className="flex gap-2">
                {["All", "Beginner", "Intermediate", "Advanced"].map((d) => (
                  <button key={d} onClick={() => setFilterDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      filterDifficulty === d ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500">{filtered.length} exercises found</p>

        {/* Exercise Cards */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-slate-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No exercises found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((exercise) => (
              <button key={exercise.exercise_id} onClick={() => setSelected(exercise)}
                className="w-full bg-slate-800 hover:bg-slate-700 rounded-2xl p-4 text-left transition border border-slate-700 hover:border-blue-500/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{exercise.exercise_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{exercise.muscle_group} • {exercise.category_name || "General"}</p>
                    {exercise.equipment && <p className="text-xs text-slate-500 mt-1">🏋️ {exercise.equipment}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${difficultyColors[exercise.difficulty] || "bg-slate-700 text-slate-400"}`}>
                    {exercise.difficulty || "N/A"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}