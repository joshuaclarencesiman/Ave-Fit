import { useState, useEffect } from "react";
import { Save, User, Lock, Bell, Database } from "lucide-react";
import api from "../services/api";

export default function Settings() {
  const [profile, setProfile] = useState({ full_name: "", email: "" });
  const [passwords, setPasswords] = useState({ current_password: "", new_password: "", confirm: "" });
  const [notifications, setNotifications] = useState({
    newMember: true, workoutCompleted: false, bmiAlert: true, weeklyReport: true,
  });
  const [status, setStatus] = useState({ profile: "", password: "" });
  const [loading, setLoading] = useState({ profile: false, password: false });

  useEffect(() => {
    api.get("/settings/profile")
      .then((res) => setProfile({ full_name: res.data.data.full_name, email: res.data.data.email }))
      .catch((err) => console.error(err));
  }, []);

  const handleSaveProfile = async () => {
    setLoading((l) => ({ ...l, profile: true }));
    try {
      await api.put("/settings/profile", profile);
      // Update localStorage name too
      const admin = JSON.parse(localStorage.getItem("avefit_admin") || "{}");
      localStorage.setItem("avefit_admin", JSON.stringify({ ...admin, name: profile.full_name, email: profile.email }));
      setStatus((s) => ({ ...s, profile: "success" }));
    } catch (err) {
      setStatus((s) => ({ ...s, profile: "error" }));
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
    if (passwords.new_password.length < 6) {
      setStatus((s) => ({ ...s, password: "short" }));
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
    short: { text: "✗ Password must be at least 6 characters.", color: "text-red-500" },
    "Current password is incorrect.": { text: "✗ Current password is incorrect.", color: "text-red-500" },
    error: { text: "✗ Failed to update password.", color: "text-red-500" },
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><User size={20} /></div>
          <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Full Name", key: "full_name" },
            { label: "Email Address", key: "email" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
              <input
                type="text"
                value={profile[f.key] || ""}
                onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          {status.profile === "success" && <p className="text-green-500 text-sm font-medium">✓ Profile saved!</p>}
          {status.profile === "error" && <p className="text-red-500 text-sm font-medium">✗ Failed to save.</p>}
          <div className="ml-auto">
            <button
              onClick={handleSaveProfile}
              disabled={loading.profile}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition text-sm"
            >
              <Save size={16} />
              {loading.profile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Lock size={20} /></div>
          <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
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
                onChange={(e) => setPasswords({ ...passwords, [f.key]: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          {status.password && (
            <p className={`text-sm font-medium ${(passwordStatusMsg[status.password] || passwordStatusMsg.error).color}`}>
              {(passwordStatusMsg[status.password] || passwordStatusMsg.error).text}
            </p>
          )}
          <div className="ml-auto">
            <button
              onClick={handleSavePassword}
              disabled={loading.password}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition text-sm"
            >
              <Save size={16} />
              {loading.password ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Bell size={20} /></div>
          <h2 className="text-lg font-bold text-slate-800">Notification Preferences</h2>
        </div>
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
                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications[item.key] ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${notifications[item.key] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Database size={20} /></div>
          <h2 className="text-lg font-bold text-slate-800">System Info</h2>
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
            <div key={item.label} className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">{item.label}</span>
              <span className="font-medium text-slate-700">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}