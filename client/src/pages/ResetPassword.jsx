import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/layout/AuthShell";
import { Alert, Field, PasswordField, PrimaryButton } from "../components/ui/Form";
import userApi from "../userApi";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleRequestReset = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Enter the email address linked to your AveFit account.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const res = await userApi.post("/forgot-password", { email: email.trim() });
      setNotice(res.data.message || "If that account exists, a password reset link has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send the reset email right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("This reset link is missing a token. Please request a new one from the login page.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const res = await userApi.post("/reset-password", { token, password });
      setNotice(res.data.message || "Your password has been reset.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset your password right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      width="max-w-lg"
      glass
      title={token ? "Reset your password" : "Forgot your password?"}
      subtitle={token ? "Choose a new password for your account." : "We can send you a secure reset link."}
      footer={
        <p className="mt-6 text-center text-sm text-slate-500">
          <button
            type="button"
            onClick={() => navigate("/user/login", { replace: true })}
            className="rounded font-medium transition hover:text-orange-600"
          >
            &larr; Back to login
          </button>
        </p>
      }
    >
      {token ? (
        <form className="space-y-4" onSubmit={handleResetPassword}>
          {notice && <Alert tone="info">{notice}</Alert>}
          {error && <Alert tone="error">{error}</Alert>}

          <PasswordField
            label="New password"
            htmlFor="reset-password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a new password"
          />

          <PasswordField
            label="Confirm new password"
            htmlFor="reset-password-confirm"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your new password"
          />

          <PrimaryButton type="submit" loading={loading} loadingText="Resetting…">
            Reset password
          </PrimaryButton>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleRequestReset}>
          {notice && <Alert tone="info">{notice}</Alert>}
          {error && <Alert tone="error">{error}</Alert>}

          <Field
            label="Email address"
            htmlFor="password-reset-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <PrimaryButton type="submit" loading={loading} loadingText="Sending…">
            Send reset link
          </PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
