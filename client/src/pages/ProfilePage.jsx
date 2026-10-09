import { useEffect, useState, useRef } from "react";
import { Activity, Save, LogOut, ChevronRight, Camera, CircleUserRound, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import userApi from "../userApi";
import { fileToCompressedDataUrl } from "../utils/imageUpload";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logoutUser } = useUserAuth();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    gender: "", birth_date: "", height: "", weight: "",
    fitness_goal: "", activity_level: "",
  });
  const [photo, setPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [bmi, setBmi] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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
        setPhoto(d.profile_image || null);
        if (d.height && d.weight) {
          const h = parseFloat(d.height) / 100;
          setBmi((parseFloat(d.weight) / (h * h)).toFixed(1));
        }
      })
      .catch((err) => {
        console.error(err);
        setLoadError(err.response?.data?.message || "Unable to load your profile. Please refresh and try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setMsg("");
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      await userApi.put("/profile/photo", { profile_image: dataUrl });
      setPhoto(dataUrl);
      setMsg("Photo updated!");
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
      setTimeout(() => setMsg(""), 3000);
      e.target.value = "";
    }
  };

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
    setMsg("");
    try {
      const res = await userApi.put("/profile", form);
      updateUser({ first_name: form.first_name, last_name: form.last_name, email: form.email });
      setMsg(res.data.email_verification_required
        ? res.data.message
        : "Profile changes saved successfully.");
    } catch (err) {
      setMsg(err.response?.data?.message || "Unable to save your profile. Please try again.");
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
      <div className="min-h-screen bg-[#fffaf5] dark:bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf5] dark:bg-[#080808] text-slate-900 dark:text-white">
      {/* Header */}
      <div className="ave-page-hero border-b border-orange-100 px-5 pb-8 pt-8 text-center dark:border-white/5 sm:px-8">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingPhoto}
          aria-label={uploadingPhoto ? "Uploading profile photo" : "Change profile photo"}
          className="relative mx-auto mb-3 block h-20 w-20 rounded-full ring-4 ring-white/70 transition hover:ring-orange-200 focus-visible:outline-none focus-visible:ring-orange-400 dark:ring-white/10 dark:hover:ring-orange-500/30 disabled:opacity-70"
        >
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-orange-500">
            {photo ? (
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-black text-white">
                {(form.first_name?.[0] || user?.first_name?.[0] || "M").toUpperCase()}
                {(form.last_name?.[0] || user?.last_name?.[0] || "").toUpperCase()}
              </span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-white text-slate-700 dark:border-[#111] dark:bg-[#222] dark:text-white">
            {uploadingPhoto ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            ) : (
              <Camera size={13} className="text-slate-900" />
            )}
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" aria-label="Choose profile photo" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{form.first_name} {form.last_name}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{form.email}</p>
        {bmi && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5">
            <Activity size={15} className="text-orange-500" />
            <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">BMI {bmi}</span>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-4xl space-y-5 px-5 py-6 sm:px-8">
        {loadError && (
          <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {loadError}
          </p>
        )}

        {msg && (
          <p role="status" className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            /unable|failed|error/i.test(msg)
              ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
              : "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300"
          }`}>
            {msg}
          </p>
        )}

        {/* Personal Info */}
        <section className="space-y-4 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-[#111] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400"><CircleUserRound size={19} /></span>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Personal information</h2>
              <p className="text-xs text-slate-500">Keep your account details up to date.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "First Name", key: "first_name" },
              { label: "Last Name", key: "last_name" },
            ].map((f) => (
              <div key={f.key}>
                <label htmlFor={`profile-${f.key}`} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">{f.label}</label>
                <input id={`profile-${f.key}`} type="text" value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  autoComplete={f.key === "first_name" ? "given-name" : "family-name"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>
            ))}
          </div>

          {[
            { label: "Email Address", key: "email", type: "email", span: true },
            { label: "Phone Number", key: "phone", type: "text", span: true },
          ].map((f) => (
            <div key={f.key} className={f.span ? "" : "grid grid-cols-2 gap-3"}>
              <div>
                <label htmlFor={`profile-${f.key}`} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">{f.label}</label>
                <input id={`profile-${f.key}`} type={f.type} value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  autoComplete={f.key === "email" ? "email" : f.key === "phone" ? "tel" : "bday"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>
            </div>
          ))}

          <div>
            <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Gender</p>
            <div className="flex rounded-xl bg-slate-50 p-1 dark:bg-white/5" role="group" aria-label="Gender">
              {["Male", "Female"].map((g) => (
                <button key={g} type="button" aria-pressed={form.gender === g} onClick={() => handleChange("gender", g)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    form.gender === g ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Body Metrics */}
        <section className="space-y-4 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-[#111] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400"><Activity size={19} /></span>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Body metrics</h2>
              <p className="text-xs text-slate-500">Used to calculate your BMI and personalize your experience.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Height (cm)", key: "height" },
              { label: "Weight (kg)", key: "weight" },
            ].map((f) => (
              <div key={f.key}>
                <label htmlFor={`profile-${f.key}`} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">{f.label}</label>
                <input id={`profile-${f.key}`} type="number" min="0" step="0.1" value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>
            ))}
          </div>
          {bmi && (
            <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-3 text-center dark:border-orange-500/20 dark:bg-orange-500/[0.06]">
              <p className="text-xs text-slate-500">Calculated BMI</p>
              <p className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">{bmi}</p>
            </div>
          )}
        </section>

        {/* Fitness Settings */}
        <section className="space-y-4 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-[#111] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400"><Dumbbell size={19} /></span>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Fitness settings</h2>
              <p className="text-xs text-slate-500">Adjust your goal and experience level.</p>
            </div>
          </div>
          <div>
            <label htmlFor="profile-fitness-goal" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Fitness goal</label>
            <select id="profile-fitness-goal" value={form.fitness_goal} onChange={(e) => handleChange("fitness_goal", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option value="">Select goal...</option>
              {["Weight Loss", "Muscle Gain", "General Fitness", "Endurance", "Maintain Weight"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Experience level</p>
            <div className="flex gap-2">
              {["Beginner", "Intermediate", "Advanced"].map((l) => (
                <button key={l} type="button" aria-pressed={form.activity_level === l} onClick={() => handleChange("activity_level", l)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition ${
                    form.activity_level === l
                      ? "border-orange-500 bg-orange-500/20 text-orange-500"
                      : "border-slate-200 text-slate-500"
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm dark:border-white/5 dark:bg-[#111]">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
            <h2 className="font-bold text-slate-900 dark:text-white">Fitness setup</h2>
            <p className="mt-1 text-xs text-slate-500">Update your plan if your goals or routine change.</p>
          </div>
          {[
            { label: "Redo Assessment", to: "/user/assessment" },
            { label: "Change Goal", to: "/user/goal" },
          ].map((item) => (
            <button key={item.label} type="button" onClick={() => navigate(item.to)}
              className="flex w-full items-center justify-between border-b border-slate-200 px-5 py-4 text-left transition hover:bg-slate-50 last:border-0 dark:border-white/10 dark:hover:bg-white/[0.03]">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          ))}
        </section>

        {/* Save + Logout */}
        <button type="button" onClick={handleSave} disabled={saving || Boolean(loadError)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50">
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button type="button" onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 py-3.5 font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-400">
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}