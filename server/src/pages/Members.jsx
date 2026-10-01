import { useEffect, useState } from "react";
import { Search, Eye, CheckCircle, XCircle, Plus, Trash2, X } from "lucide-react";
import api from "../services/api";

const statusColors = {
  Active: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Inactive: "bg-slate-100 text-slate-500",
  Rejected: "bg-red-100 text-red-700",
};

function getBMICategory(bmi) {
  if (!bmi) return { label: "N/A", color: "text-slate-400" };
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
  if (bmi < 25) return { label: "Normal", color: "text-green-600" };
  if (bmi < 30) return { label: "Overweight", color: "text-orange-500" };
  return { label: "Obese", color: "text-red-500" };
}

// Add/Edit Member Modal
function MemberModal({ member, onClose, onSave }) {
  const [form, setForm] = useState(
    member || { full_name: "", email: "", phone: "", gender: "", age: "", height: "", weight: "", fitness_goal: "" }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.full_name || !form.email) {
      setError("Full name and email are required.");
      return;
    }
    setSaving(true);
    try {
      if (member) {
        await api.put(`/members/${member.member_id}`, { ...form, status: member.status });
      } else {
        await api.post("/members", form);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save member.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {member ? "Edit Member" : "Add New Member"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Full Name *", key: "full_name", type: "text", span: true },
              { label: "Email *", key: "email", type: "email", span: true },
              { label: "Phone", key: "phone", type: "text" },
              { label: "Gender", key: "gender", type: "select", options: ["", "Male", "Female"] },
              { label: "Age", key: "age", type: "number" },
              { label: "Fitness Goal", key: "fitness_goal", type: "select", options: ["", "Weight Loss", "Muscle Gain", "General Fitness", "Endurance"] },
              { label: "Height (cm)", key: "height", type: "number" },
              { label: "Weight (kg)", key: "weight", type: "number" },
            ].map((f) => (
              <div key={f.key} className={f.span ? "col-span-2" : ""}>
                <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    value={form[f.key] || ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {f.options.map((o) => <option key={o} value={o}>{o || "Select..."}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={form[f.key] || ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
          {form.height && form.weight && (
            <p className="text-sm text-blue-600 font-medium">
              BMI: {(parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)} (auto-calculated)
            </p>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="p-6 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border text-slate-600 hover:bg-slate-50 text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : member ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

// View Member Modal
function ViewModal({ member, onClose, onEdit }) {
  const bmiInfo = getBMICategory(member.bmi);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Member Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {member.full_name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{member.full_name}</h3>
              <p className="text-slate-500 text-sm">{member.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Phone", value: member.phone },
              { label: "Gender", value: member.gender },
              { label: "Age", value: member.age ? `${member.age} years` : "—" },
              { label: "Height", value: member.height ? `${member.height} cm` : "—" },
              { label: "Weight", value: member.weight ? `${member.weight} kg` : "—" },
              { label: "Fitness Goal", value: member.fitness_goal },
              { label: "Joined", value: member.joined_date ? new Date(member.joined_date).toLocaleDateString() : "—" },
              { label: "Status", value: member.status },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-xs">{item.label}</p>
                <p className="font-semibold text-slate-700 mt-0.5">{item.value || "—"}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400">BMI</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {member.bmi ? parseFloat(member.bmi).toFixed(1) : "—"}
            </p>
            <p className={`text-sm font-semibold mt-0.5 ${bmiInfo.color}`}>{bmiInfo.label}</p>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border text-slate-600 hover:bg-slate-50 text-sm font-medium">
            Close
          </button>
          <button
            onClick={() => { onClose(); onEdit(member); }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
          >
            Edit Member
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMember, setViewMember] = useState(null);
  const [editMember, setEditMember] = useState(null);

  const fetchMembers = () => {
    setLoading(true);
    setFetchError("");
    api.get("/members")
      .then((res) => setMembers(res.data.data))
      .catch((err) => {
        console.error(err);
        setFetchError(err.response?.data?.message || err.message || "Couldn't load members.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleApprove = async (id) => {
    await api.put(`/members/${id}/approve`);
    fetchMembers();
  };

  const handleReject = async (id) => {
    await api.put(`/members/${id}/reject`);
    fetchMembers();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this member permanently?")) return;
    await api.delete(`/members/${id}`);
    fetchMembers();
  };

  const filtered = members.filter((m) => {
    const matchSearch =
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || m.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {showAddModal && (
        <MemberModal onClose={() => setShowAddModal(false)} onSave={fetchMembers} />
      )}
      {editMember && (
        <MemberModal member={editMember} onClose={() => setEditMember(null)} onSave={fetchMembers} />
      )}
      {viewMember && (
        <ViewModal
          member={viewMember}
          onClose={() => setViewMember(null)}
          onEdit={(m) => setEditMember(m)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Members</h1>
          <p className="text-slate-500 mt-1">Manage all gym members and their fitness status.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition"
        >
          <Plus size={18} />
          Add Member
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
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none ml-2 w-full text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Active", "Pending", "Rejected", "Inactive"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
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
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Goal</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">BMI</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Joined</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No members found.</td>
                </tr>
              ) : (
                filtered.map((member) => {
                  const bmiInfo = getBMICategory(member.bmi);
                  return (
                    <tr key={member.member_id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{member.full_name}</p>
                        <p className="text-slate-400 text-xs">{member.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{member.fitness_goal || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold">{member.bmi ? parseFloat(member.bmi).toFixed(1) : "—"}</span>
                        <span className={`ml-2 text-xs font-medium ${bmiInfo.color}`}>{bmiInfo.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[member.status] || statusColors.Inactive}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {member.joined_date ? new Date(member.joined_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewMember(member)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition" title="View">
                            <Eye size={16} />
                          </button>
                          {member.status === "Pending" && (
                            <>
                              <button onClick={() => handleApprove(member.member_id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition" title="Approve">
                                <CheckCircle size={16} />
                              </button>
                              <button onClick={() => handleReject(member.member_id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition" title="Reject">
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDelete(member.member_id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
        <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-400">
          Showing {filtered.length} of {members.length} members
        </div>
      </div>
    </div>
  );
}