import { useState, useEffect, useRef } from "react";
import { Save, User, Lock, Bell, Database, Camera } from "lucide-react";
import api from "../services/api";
import { fileToCompressedDataUrl } from "../utils/imageUpload";

const NOTIFICATION_PREFERENCES_KEY = "avefit_admin_notification_preferences";
const DEFAULT_NOTIFICATION_PREFERENCES = {
  newMember: true,
  workoutCompleted: false,
  bmiAlert: true,
  weeklyReport: true,
};

export default function Settings() {
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({ full_name: "", email: "" });
  const [photo, setPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMsg, setPhotoMsg] = useState("");
  const [passwords, setPasswords] = useState({ current_password: "", new_password: "", confirm: "" });
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATION_PREFERENCES);
  const [preferenceError, setPreferenceError] = useState("");
  const [status, setStatus] = useState({ profile: "", password: "" });
  const [loading, setLoading] = useState({ profile: false, password: false });
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const savedPreferences = localStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        setNotifications(Object.fromEntries(
          Object.keys(DEFAULT_NOTIFICATION_PREFERENCES).map((key) => [
            key,
            typeof parsedPreferences[key] === "boolean" ? parsedPreferences[key] : DEFAULT_NOTIFICATION_PREFERENCES[key],
          ]),
        ));
      } catch (error) {
        console.error("Failed to read admin notification preferences:", error);
        setPreferenceError("Saved notification preferences could not be read. Defaults are being used.");
      }
    }

    api.get("/settings/profile")
      .then((res) => {
        setProfile({ full_name: res.data.data.full_name, email: res.data.data.email });
        setPhoto(res.data.data.photo_url || null);
      })
      .catch((err) => {
        console.error(err);
        setFetchError(err.response?.data?.message || err.message || "Couldn't load admin profile.");
      });
  }, []);

  const handleNotificationToggle = (key) => {
    const nextPreferences = { ...notifications, [key]: !notifications[key] };
    try {
      localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(nextPreferences));
      setNotifications(nextPreferences);
      setPreferenceError("");
    } catch (error) {
      console.error("Failed to save admin notification preferences:", error);
      setPreferenceError("Unable to save this preference in your browser.");
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setPhotoMsg("");
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      await api.put("/settings/photo", { photo_url: dataUrl });
      setPhoto(dataUrl);
      const admin = JSON.parse(localStorage.getItem("avefit_admin") || "{}");
      localStorage.setItem("avefit_admin", JSON.stringify({ ...admin, photo_url: dataUrl }));
      setPhotoMsg("Photo updated!");
    } catch (err) {
      setPhotoMsg(err.response?.data?.message || err.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
      setTimeout(() => setPhotoMsg(""), 3000);
      e.target.value = "";
    }
  };

  const handleSaveProfile = async () => {
    setLoading((l) => ({ ...l, profile: true }));
    try {
      await api.put("/settings/profile", profile);
      // Update localStorage name too
      const admin = JSON.parse(localStorage.getItem("avefit_admin") || "{}");
      localStorage.setItem("avefit_admin", JSON.stringify({ ...admin, name: profile.full_name, email: profile.email }));
      setStatus((s) => ({ ...s, profile: "success" }));
    } catch (err) {
      setStatus((s) => ({ ...s, profile: err.response?.data?.message || "error" }));
    } finally {
      setLoading((l) => ({ ...l, profile: false }));
      setTimeout(() => setStatus((s) => ({ ...s, profile: "" })), 3000);
    }
  };

  const handleSavePassword = async () => {
    if (passwords.new_password !== passwords.confirm) {
      setStatus((s) => ({ ...s, password: "mismatch" }));
      return;
    }
    if (passwords.new_password.length < 8 || passwords.new_password.length > 12) {
      setStatus((s) => ({ ...s, password: "requirements" }));
      return;
    }
    setLoading((l) => ({ ...l, password: true }));
    try {
      await api.put("/settings/password", {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setPasswords({ current_password: "", new_password: "", confirm: "" });
      setStatus((s) => ({ ...s, password: "success" }));
    } catch (err) {
      setStatus((s) => ({ ...s, password: err.response?.data?.message || "error" }));
    } finally {
      setLoading((l) => ({ ...l, password: false }));
      setTimeout(() => setStatus((s) => ({ ...s, password: "" })), 3000);
    }
  };

  const passwordStatusMsg = {
    success: { text: "✓ Password updated!", color: "text-green-500" },
    mismatch: { text: "✗ Passwords do not match.", color: "text-red-500" },
    requirements: { text: "Use 8–12 characters with a letter, number, and symbol. Avoid common passwords.", color: "text-red-500" },
    "Use 8–12 characters with a letter, a number, and a symbol. Avoid common passwords.": { text: "Use 8–12 characters with a letter, number, and symbol. Avoid common passwords.", color: "text-red-500" },
    "Current password is incorrect.": { text: "✗ Current password is incorrect.", color: "text-red-500" },
    error: { text: "✗ Failed to update password.", color: "text-red-500" },
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {fetchError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          ⚠️ {fetchError}
        </div>
      )}
      <header className="ave-page-hero rounded-3xl border border-orange-100 px-5 py-6 dark:border-white/5 sm:px-7 sm:py-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-400">Administration</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Manage administrator access, account details, and portal preferences.</p>
      </header>

      {/* Profile */}
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111] sm:p-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
          <div className="rounded-lg bg-orange-500/10 p-2 text-orange-600 dark:text-orange-400"><User size={20} /></div>
          <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile information</h2><p className="mt-0.5 text-xs text-slate-500">Update the details used for your admin account.</p></div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            aria-label={uploadingPhoto ? "Uploading admin photo" : "Change admin profile photo"}
            className="relative w-16 h-16 rounded-full ring-2 ring-orange-100 transition hover:ring-orange-300 focus-visible:outline-none focus-visible:ring-orange-400 disabled:opacity-70 shrink-0 dark:ring-white/10"
          >
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center overflow-hidden">
              {photo ? (
                <img src={photo} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-white" />
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
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" aria-label="Choose admin profile photo" />
          <div>
            <p className="text-sm font-medium text-slate-700">Profile Photo</p>
            <p className="text-xs text-slate-400">Click the avatar to upload a new photo.</p>
            {photoMsg && <p className="text-xs font-medium text-orange-600 mt-1">{photoMsg}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Full Name", key: "full_name" },
            { label: "Email Address", key: "email" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
              <input
                type={f.key === "email" ? "email" : "text"}
                value={profile[f.key] || ""}
                onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {status.profile && <p role="status" className={`text-sm font-medium ${status.profile === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{status.profile === "success" ? "✓ Profile saved!" : `✗ ${status.profile === "error" ? "Failed to save." : status.profile}`}</p>}
          <div className="ml-auto">
            <button
              onClick={handleSaveProfile}
              disabled={loading.profile}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              <Save size={16} />
              {loading.profile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </section>

      {/* Password */}
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111] sm:p-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
          <div className="rounded-lg bg-orange-500/10 p-2 text-orange-600 dark:text-orange-400"><Lock size={20} /></div>
          <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Change password</h2><p className="mt-0.5 text-xs text-slate-500">Use a unique password to keep your administrator account secure.</p></div>
        </div>
        <div className="space-y-4">
          {[
            { label: "Current Password", key: "current_password" },
            { label: "New Password", key: "new_password" },
            { label: "Confirm New Password", key: "confirm" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwords[f.key]}
                minLength={f.key === "new_password" || f.key === "confirm" ? 8 : undefined}
                maxLength={f.key === "new_password" || f.key === "confirm" ? 12 : undefined}
                onChange={(e) => setPasswords({ ...passwords, [f.key]: e.target.value })}
                autoComplete={f.key === "current_password" ? "current-password" : "new-password"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              {f.key === "new_password" && <p className="mt-1 text-xs text-slate-500">8–12 characters with a letter, number, and symbol.</p>}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          {status.password && (
            <p role="status" className={`text-sm font-medium ${(passwordStatusMsg[status.password] || passwordStatusMsg.error).color}`}>
              {(passwordStatusMsg[status.password] || passwordStatusMsg.error).text}
            </p>
          )}
          <div className="ml-auto">
            <button
              onClick={handleSavePassword}
              disabled={loading.password}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <Save size={16} />
              {loading.password ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111] sm:p-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
          <div className="rounded-lg bg-orange-500/10 p-2 text-orange-600 dark:text-orange-400"><Bell size={20} /></div>
          <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification preferences</h2><p className="mt-0.5 text-xs text-slate-500">These choices are saved in this browser on this device.</p></div>
        </div>
        {preferenceError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{preferenceError}</p>}
        <div className="space-y-4">
          {[
            { key: "newMember", label: "New Member Registration", desc: "Get notified when a new member signs up" },
            { key: "workoutCompleted", label: "Workout Completions", desc: "Notify when a member completes a workout" },
            { key: "bmiAlert", label: "BMI Alerts", desc: "Alert when a member's BMI is outside healthy range" },
            { key: "weeklyReport", label: "Weekly Reports", desc: "Receive a weekly summary every Monday" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-slate-700 text-sm">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications[item.key]}
                aria-label={item.label}
                onClick={() => handleNotificationToggle(item.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111] ${notifications[item.key] ? "bg-orange-500" : "bg-slate-300 dark:bg-slate-700"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${notifications[item.key] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* System Info */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111] sm:p-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
          <div className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-white/5 dark:text-slate-300"><Database size={20} /></div>
          <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">System information</h2><p className="mt-0.5 text-xs text-slate-500">Application environment details.</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: "App Name", value: "AveFit" },
            { label: "Version", value: "1.0.0" },
            { label: "Database", value: "PostgreSQL" },
            { label: "Framework", value: "React + Vite" },
            { label: "Backend", value: "Node.js + Express" },
            { label: "School", value: "Batangas State University" },
          ].map((item) => (
            <div key={item.label} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-2 dark:border-white/10">
              <span className="text-slate-500">{item.label}</span>
              <span className="font-medium text-slate-700">{item.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}