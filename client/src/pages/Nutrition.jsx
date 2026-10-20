import { useEffect, useState } from "react";
import { Apple, Flame, Search } from "lucide-react";
import api from "../services/api";

export default function Nutrition() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    api.get("/nutrition")
      .then((res) => setPlans(res.data.data))
      .catch((err) => {
        console.error(err);
        setFetchError(err.response?.data?.message || err.message || "Couldn't load meal plans.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = plans.filter((p) =>
    p.meal_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.member_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {fetchError}
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Meal Plans</h1>
        <p className="text-slate-500 mt-1">Dietary plans assigned to members.</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-full sm:w-72">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by meal or member..."
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Member</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Meal Name</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Calories</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Protein</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Carbs</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Fats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No meal plans found.</td>
                </tr>
              ) : (
                filtered.map((plan) => (
                  <tr key={plan.meal_plan_id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{plan.member_name || "—"}</p>
                      <p className="text-xs text-slate-400">{plan.fitness_goal || ""}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{plan.meal_name}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-orange-500 font-semibold">
                        <Flame size={13} /> {plan.calories}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{plan.protein}g</td>
                    <td className="px-6 py-4 text-slate-600">{plan.carbs}g</td>
                    <td className="px-6 py-4 text-slate-600">{plan.fats}g</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-400">
          Showing {filtered.length} of {plans.length} plans
        </div>
      </div>
    </div>
  );
}