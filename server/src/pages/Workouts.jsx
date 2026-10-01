import { useEffect, useState } from "react";
import { Dumbbell, Search } from "lucide-react";
import api from "../services/api";

const difficultyColors = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-yellow-100 text-yellow-700",
  Advanced: "bg-red-100 text-red-700",
};

export default function Workouts() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.get("/workouts")
      .then((res) => setExercises(res.data.data))
      .catch((err) => {
        console.error(err);
        setFetchError(err.response?.data?.message || err.message || "Couldn't load exercises.");
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(exercises.map((e) => e.category_name).filter(Boolean))];

  const filtered = exercises.filter((e) => {
    const matchSearch =
      e.exercise_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.muscle_group?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || e.category_name === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Exercises</h1>
        <p className="text-slate-500 mt-1">Full exercise library available in the system.</p>
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
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === c ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            <div key={exercise.exercise_id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition">
              <div className="bg-blue-600 p-5 text-white">
                <div className="flex items-center justify-between">
                  <Dumbbell size={24} />
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20">
                    {exercise.category_name || "General"}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-3">{exercise.exercise_name}</h3>
                <p className="text-blue-100 text-sm mt-1">{exercise.muscle_group || "Full Body"}</p>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}