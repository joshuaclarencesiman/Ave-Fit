import { useEffect, useState } from "react";
import { Plus, Trash2, Search, X, ClipboardList } from "lucide-react";
import api from "../services/api";

function PlanModal({ members, trainers, onClose, onSave }) {
  const [form, setForm] = useState({ user_id: "", trainer_id: "", plan_name: "", goal: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.plan_name) { setError("Plan name is required."); return; }
    setSaving(true);
    try {
      await api.post("/workouts/plans", form);
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Create Workout Plan</h2>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Plan Name *</label>
            <input type="text" value={form.plan_name} onChange={(e) => setForm({ ...form, plan_name: e.target.value })}
              placeholder="e.g. Beginner Strength Program"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Goal</label>
            <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select goal...</option>
              {["Weight Loss", "Muscle Gain", "General Fitness", "Endurance", "Flexibility"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Assign to Member</label>
            <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No member (template)</option>
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>{m.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Assign Trainer</label>
            <select value={form.trainer_id} onChange={(e) => setForm({ ...form, trainer_id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No trainer</option>
              {trainers.map((t) => (
                <option key={t.trainer_id} value={t.trainer_id}>{t.full_name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="p-6 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border text-slate-600 hover:bg-slate-50 text-sm font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50">
            {saving ? "Creating..." : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

const statusColors = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-slate-100 text-slate-500",
  Completed: "bg-blue-100 text-blue-700",
};

export default function WorkoutPlans() {
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/workouts/plans"),
      api.get("/members"),
      api.get("/trainers"),
    ])
      .then(([plansRes, memRes, trainerRes]) => {
        setPlans(plansRes.data.data);
        setMembers(memRes.data.data);
        setTrainers(trainerRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this workout plan?")) return;
    await api.delete(`/workouts/plans/${id}`);
    fetchData();
  };

  const filtered = plans.filter((p) =>
    p.plan_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.member_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.trainer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {showModal && (
        <PlanModal
          members={members}
          trainers={trainers}
          onClose={() => setShowModal(false)}
          onSave={fetchData}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Workout Plans</h1>
          <p className="text-slate-500 mt-1">Create and assign workout plans to members.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition">
          <Plus size={18} /> Create Plan
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Plans", value: plans.length, color: "text-blue-600" },
          { label: "Active Plans", value: plans.filter((p) => p.status === "Active").length, color: "text-green-600" },
          { label: "Assigned to Members", value: plans.filter((p) => p.member_name).length, color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-full sm:w-72">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search plans..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none ml-2 w-full text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Plan Name</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Goal</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Member</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Trainer</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Created</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <ClipboardList size={36} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-slate-400">No workout plans found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((plan) => (
                  <tr key={plan.workout_plan_id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">{plan.plan_name}</td>
                    <td className="px-6 py-4 text-slate-600">{plan.goal || "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{plan.member_name || <span className="text-slate-300">Unassigned</span>}</td>
                    <td className="px-6 py-4 text-slate-600">{plan.trainer_name || <span className="text-slate-300">None</span>}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[plan.status] || statusColors.Inactive}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(plan.workout_plan_id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-400">
          {filtered.length} of {plans.length} plans
        </div>
      </div>
    </div>
  );
}