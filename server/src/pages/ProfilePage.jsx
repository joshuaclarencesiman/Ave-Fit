import { useEffect, useState } from "react";
import { Save, LogOut, User, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import userApi from "../userApi";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loginUser, logoutUser } = useUserAuth();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    gender: "", birth_date: "", height: "", weight: "",
    fitness_goal: "", activity_level: "",
  });
  const [bmi, setBmi] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.get("/profile")
      .then((res) => {
        const d = res.data.data;
        setForm({
          first_name: d.first_name || "",
          last_name: d.last_name || "",
          email: d.email || "",
          phone: d.phone || "",
          gender: d.gender || "",
          birth_date: d.birth_date ? d.birth_date.split("T")[0] : "",
          height: d.height || "",
          weight: d.weight || "",
          fitness_goal: d.fitness_goal || "",
          activity_level: d.activity_level || "",
        });
        if (d.height && d.weight) {
          const h = parseFloat(d.height) / 100;
          setBmi((parseFloat(d.weight) / (h * h)).toFixed(1));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, val) => {
    setForm((f) => {
      const updated = { ...f, [key]: val };
      if ((key === "weight" || key === "height") && updated.weight && updated.height) {
        const h = parseFloat(updated.height) / 100;
        setBmi((parseFloat(updated.weight) / (h * h)).toFixed(1));
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.put("/profile", form);
      loginUser({ ...user, first_name: form.first_name, last_name: form.last_name }, sessionStorage.getItem("avefit_user_token"));
      setMsg("Profile saved!");
    } catch (err) {
      setMsg("Failed to save.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/user/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-950 px-6 pt-12 pb-8 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <User size={36} className="text-white" />
        </div>
        <h1 className="text-xl font-bold">{form.first_name} {form.last_name}</h1>
        <p className="text-slate-400 text-sm">{form.email}</p>
        {bmi && (
          <div className="mt-3 inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5">
            <span className="text-blue-300 text-sm font-semibold">BMI: {bmi}</span>
          </div>
        )}
      </div>

      <div className="px-6 space-y-5">
        {/* Personal Info */}
        <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-white">Personal Information</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "First Name", key: "first_name" },
              { label: "Last Name", key: "last_name" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                <input type="text" value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>

          {[
            { label: "Email Address", key: "email", type: "email", span: true },
            { label: "Phone Number", key: "phone", type: "text", span: true },
            { label: "Birth Date", key: "birth_date", type: "date", span: false },
          ].map((f) => (
            <div key={f.key} className={f.span ? "" : "grid grid-cols-2 gap-3"}>
              <div>
                <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                <input type={f.type} value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          ))}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Gender</label>
            <div className="flex bg-slate-900 rounded-xl p-1">
              {["Male", "Female"].map((g) => (
                <button key={g} onClick={() => handleChange("gender", g)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    form.gender === g ? "bg-blue-600 text-white" : "text-slate-400"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body Metrics */}
        <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-white">Body Metrics</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Height (cm)", key: "height" },
              { label: "Weight (kg)", key: "weight" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                <input type="number" value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          {bmi && (
            <div className="bg-slate-900 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400">Calculated BMI</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{bmi}</p>
            </div>
          )}
        </div>

        {/* Fitness Settings */}
        <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-white">Fitness Settings</h2>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Fitness Goal</label>
            <select value={form.fitness_goal} onChange={(e) => handleChange("fitness_goal", e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select goal...</option>
              {["Weight Loss", "Muscle Gain", "General Fitness", "Endurance", "Maintain Weight"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Experience Level</label>
            <div className="flex gap-2">
              {["Beginner", "Intermediate", "Advanced"].map((l) => (
                <button key={l} onClick={() => handleChange("activity_level", l)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition ${
                    form.activity_level === l
                      ? "border-blue-500 bg-blue-500/20 text-blue-300"
                      : "border-slate-700 text-slate-400"
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          {[
            { label: "Redo Assessment", to: "/user/assessment" },
            { label: "Change Goal", to: "/user/goal" },
          ].map((item) => (
            <button key={item.label} onClick={() => navigate(item.to)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-700 transition border-b border-slate-700 last:border-0">
              <span className="text-sm text-slate-300">{item.label}</span>
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          ))}
        </div>

        {/* Save + Logout */}
        {msg && (
          <p className={`text-center text-sm font-medium ${msg.includes("Failed") ? "text-red-400" : "text-green-400"}`}>
            {msg}
          </p>
        )}

        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition">
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold py-3.5 rounded-xl transition">
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}