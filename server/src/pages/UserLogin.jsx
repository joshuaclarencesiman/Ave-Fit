import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";
import userApi from "../userApi";

export default function UserLogin() {
  const navigate = useNavigate();
  const { loginUser } = useUserAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingNotice, setPendingNotice] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    agreed: false,
  });

  // Send a freshly-logged-in user to their dashboard if setup is done,
  // otherwise start them on the onboarding flow.
  const goToDestination = (user) => {
    navigate(user?.setup_completed ? "/user/workout" : "/user/assessment");
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) { setError("Please fill in all fields."); return; }
    setPendingNotice(false);
    setLoading(true); setError("");
    try {
      const res = await userApi.post("/login", loginForm);
      loginUser(res.data.user, res.data.token);
      goToDestination(res.data.user);
    } catch (err) {
      if (err.response?.status === 403 && (err.response?.data?.status === "Pending" || err.response?.data?.status === "Rejected")) {
        setPendingNotice(err.response?.data?.status === "Pending");
        setError(err.response?.data?.status === "Rejected" ? err.response?.data?.message : "");
      } else {
        setError(err.response?.data?.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupForm.first_name || !signupForm.last_name || !signupForm.email || !signupForm.phone || !signupForm.password) {
      setError("Please fill in all fields."); return;
    }
    if (!signupForm.agreed) { setError("Please agree to the Terms and Conditions."); return; }
    setLoading(true); setError("");
    try {
      await userApi.post("/register", signupForm);
      navigate("/user/pending");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400">AveFit</h1>
          <p className="text-slate-400 mt-1">Avenue Power and Fitness Gym</p>
        </div>

        <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
          {/* Toggle */}
          <div className="flex bg-slate-900 rounded-xl p-1 mb-6">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition ${
                  mode === m ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="your@email.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  />
                  <button
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    className="rounded" />
                  Remember me
                </label>
                <button className="text-blue-400 hover:underline">Forgot Password?</button>
              </div>
              {pendingNotice && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                  <p className="text-yellow-300 font-semibold">Account Pending Approval</p>
                  <p className="text-slate-400 text-sm mt-1">Please wait 1-3 working days while the gym administrator reviews your account.</p>
                </div>
              )}
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={signupForm.first_name}
                    onChange={(e) => setSignupForm({ ...signupForm, first_name: e.target.value })}
                    placeholder="Juan"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={signupForm.last_name}
                    onChange={(e) => setSignupForm({ ...signupForm, last_name: e.target.value })}
                    placeholder="dela Cruz"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={signupForm.phone}
                  onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                  placeholder="09XX XXX XXXX"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  />
                  <button
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <label className="flex items-start gap-2 text-slate-400 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={signupForm.agreed}
                  onChange={(e) => setSignupForm({ ...signupForm, agreed: e.target.checked })}
                  className="rounded mt-0.5"
                />
                I agree to the Terms and Conditions of AveFit
              </label>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <button onClick={() => navigate("/")} className="hover:text-slate-300 transition">
            ← Back to Homepage
          </button>
        </p>
      </div>
    </div>
  );
}
