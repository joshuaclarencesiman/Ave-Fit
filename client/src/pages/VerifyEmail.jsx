import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BadgeCheck, MailWarning, ShieldCheck } from "lucide-react";
import OnboardingShell from "../components/layout/OnboardingShell";
import { Alert, Field, PrimaryButton } from "../components/ui/Form";
import userApi from "../userApi";

/**
 * Landing page for the link in the verification email. The token is read from
 * the query string and redeemed once, then the member is told what happens next.
 */
export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState(token ? "verifying" : "idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const requested = useRef(false);

  // Guard against React 19 double-invoking effects in development, which would
  // burn the single-use token on the first render and fail the second.
  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;

    let cancelled = false;
    userApi
      .post("/verify-email", { token })
      .then((res) => {
        if (cancelled) return;
        setStatus("verified");
        setNotice(res.data.message);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("failed");
        setError(
          err.response?.data?.message ||
            "We could not verify this link. It may have expired or already been used."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      setError("Enter the email address you registered with.");
      return;
    }

    setResending(true);
    setError("");
    setResent(false);

    try {
      const res = await userApi.post("/resend-verification", { email });
      setNotice(res.data.message);
      setResent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send a new code right now.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    if (!email || !/^\d{6}$/.test(code)) {
      setError("Enter your email address and the six-digit code.");
      return;
    }

    setStatus("verifying");
    setError("");
    try {
      const res = await userApi.post("/verify-email", { email, code });
      setStatus("verified");
      setNotice(res.data.message);
    } catch (err) {
      setStatus("failed");
      setError(err.response?.data?.message || "We could not verify this code.");
    }
  };

  return (
    <OnboardingShell step={1} width="max-w-lg" showStepper={false}>
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-orange-500/30 bg-orange-500/10">
          {status === "verifying" ? (
            <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-orange-500/30 border-t-orange-500" />
          ) : status === "failed" ? (
            <MailWarning size={30} className="text-orange-500" />
          ) : (
            <ShieldCheck size={30} className="text-orange-500" />
          )}
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
          {status === "verifying" && "Verifying your email…"}
          {status === "verified" && "Email verified"}
          {status === "failed" && "Verification not complete"}
          {status === "idle" && "Verify your email address"}
        </h1>

        {status === "verified" && (
          <>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
              {notice ||
                "Your email address is confirmed. Your registration is now with the gym administrator."}
            </p>

            <div className="mt-6 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-white/10 dark:bg-white/5">
              <BadgeCheck size={20} className="shrink-0 text-orange-500" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Waiting for gym approval
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Please wait 1&ndash;3 working days. You will be able to log in and complete
                  your AveFit setup once an administrator has approved your account.
                </p>
              </div>
            </div>

            <PrimaryButton className="mt-6" onClick={() => navigate("/user/pending", { replace: true })}>
              Continue
            </PrimaryButton>
          </>
        )}

        {(status === "failed" || status === "idle") && (
          <>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
              {status === "failed" ? error : "Enter the six-digit code from your AveFit email. You can request a new code below."}
            </p>

            <form
              className="mt-6 space-y-4 text-left"
              onSubmit={handleVerifyCode}
            >
              <Field
                label="Email address"
                htmlFor="verify-code-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Field
                label="Six-digit verification code"
                htmlFor="verify-code"
                type="text"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />

              {resent && <Alert tone="info">{notice}</Alert>}

              <PrimaryButton type="submit">
                Confirm code
              </PrimaryButton>
              <button type="button" onClick={handleResend} disabled={resending} className="w-full rounded-xl border border-orange-500/30 px-4 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-500/10 disabled:opacity-60">
                {resending ? "Sending…" : "Send a new code"}
              </button>
            </form>
          </>
        )}

        {status === "failed" && (
          <p className="mt-6 text-center text-sm text-slate-500">
            <button
              type="button"
              onClick={() => navigate("/user/login", { replace: true })}
              className="rounded font-medium transition hover:text-orange-600"
            >
              Back to login
            </button>
          </p>
        )}
      </div>
    </OnboardingShell>
  );
}
