import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MailCheck } from "lucide-react";
import AuthShell from "../components/layout/AuthShell";
import { Alert, Field, PasswordField, PrimaryButton } from "../components/ui/Form";
import { useUserAuth } from "../context/UserAuthContext";
import userApi from "../userApi";

const TABS = [
  { id: "login", label: "Log in" },
  { id: "signup", label: "Sign up" },
];

export default function UserLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser } = useUserAuth();
  const [mode, setMode] = useState(searchParams.get("mode") === "signup" ? "signup" : "login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingNotice, setPendingNotice] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendNotice, setResendNotice] = useState("");
  const [resending, setResending] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    agreed: false,
  });

  const goToDestination = (user) => {
    navigate(user?.setup_completed ? "/user/workout" : "/user/assessment", { replace: true });
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setPendingNotice(false);
    setResendNotice("");

    try {
      const res = await userApi.post("/login", loginForm);
      loginUser(res.data.user, res.data.token);
      goToDestination(res.data.user);
    } catch (err) {
      const status = err.response?.status;
      const bodyStatus = err.response?.data?.status;
      if (status === 403 && bodyStatus === "Unverified") {
        // Offer to resend here because most people hit this right after signing up
        // and the original email may have gone to spam.
        setUnverifiedEmail(loginForm.email);
        setError(err.response?.data?.message || "Please verify your email address first.");
      } else if (status === 403 && (bodyStatus === "Pending" || bodyStatus === "Rejected")) {
        setPendingNotice(bodyStatus === "Pending");
        setError(bodyStatus === "Rejected" ? err.response?.data?.message || "Login failed." : "");
      } else {
        setError(err.response?.data?.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    setResending(true);
    setError("");
    setResendNotice("");

    try {
      const res = await userApi.post("/resend-verification", { email: unverifiedEmail });
      setResendNotice(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send a new link right now.");
    } finally {
      setResending(false);
    }
  };

  const handleSignup = async () => {
    if (
      !signupForm.first_name ||
      !signupForm.last_name ||
      !signupForm.email ||
      !signupForm.phone ||
      !signupForm.password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!signupForm.agreed) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await userApi.post("/register", signupForm);
      // Remembered so the "check your inbox" screen can prefill the resend form.
      sessionStorage.setItem("avefit_pending_email", signupForm.email.trim());
      navigate("/user/pending", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (next) => {
    setMode(next);
    setError("");
    setPendingNotice(false);
    setResendNotice("");
  };

  return (
    <AuthShell
      width="max-w-lg"
      title="Welcome to AveFit"
      subtitle="Avenue Power and Fitness Gym"
      footer={
        <p className="mt-6 text-center text-sm text-slate-500">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded font-medium transition hover:text-orange-600"
          >
            &larr; Back to homepage
          </button>
        </p>
      }
    >
      <div
        role="tablist"
        aria-label="Account access"
        className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => switchTab(tab.id)}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              mode === tab.id
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-500 hover:text-orange-600 dark:text-slate-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "login" ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <Field
            label="Email address"
            htmlFor="user-login-email"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="your@email.com"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
          />

          <PasswordField
            label="Password"
            htmlFor="user-login-password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          />

          {pendingNotice && (
            <Alert tone="warning">
              Your account is awaiting approval from the gym. You&apos;ll be able to log in
              once an administrator has reviewed your registration.
            </Alert>
          )}

          {unverifiedEmail && (
            <div className="space-y-3 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/30 dark:bg-orange-500/10">
              <div className="flex items-start gap-2.5">
                <MailCheck size={18} className="mt-0.5 shrink-0 text-orange-500" />
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  We sent a verification link to {unverifiedEmail}. Open it to activate your
                  account, or send a new one.
                </p>
              </div>

              {resendNotice && <Alert tone="info">{resendNotice}</Alert>}

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/40 bg-white/70 px-5 py-2.5 text-sm font-bold text-orange-700 transition hover:bg-white disabled:opacity-60 dark:bg-transparent dark:text-orange-200 dark:hover:bg-white/10"
              >
                {resending && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
                )}
                {resending ? "Sending…" : "Resend verification email"}
              </button>
            </div>
          )}

          {error && <Alert tone="error">{error}</Alert>}

          <PrimaryButton type="submit" loading={loading} loadingText="Logging in…" className="mt-2">
            Log in
          </PrimaryButton>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
        >
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Start your personalised setup in a couple of minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              htmlFor="signup-first"
              autoComplete="given-name"
              placeholder="Juan"
              value={signupForm.first_name}
              onChange={(e) => setSignupForm({ ...signupForm, first_name: e.target.value })}
            />
            <Field
              label="Last name"
              htmlFor="signup-last"
              autoComplete="family-name"
              placeholder="dela Cruz"
              value={signupForm.last_name}
              onChange={(e) => setSignupForm({ ...signupForm, last_name: e.target.value })}
            />
          </div>

          <Field
            label="Email address"
            htmlFor="signup-email"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            value={signupForm.email}
            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
          />

          <Field
            label="Phone number"
            htmlFor="signup-phone"
            type="tel"
            autoComplete="tel"
            placeholder="09XX XXX XXXX"
            value={signupForm.phone}
            onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
          />

          <PasswordField
            label="Password"
            htmlFor="signup-password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={signupForm.password}
            onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
          />

          <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={signupForm.agreed}
              onChange={(e) => setSignupForm({ ...signupForm, agreed: e.target.checked })}
              className="mt-0.5"
            />
            I agree to the Terms and Conditions of AveFit
          </label>

          {error && <Alert tone="error">{error}</Alert>}

          <PrimaryButton type="submit" loading={loading} loadingText="Creating account…" className="mt-2">
            Create account
          </PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
