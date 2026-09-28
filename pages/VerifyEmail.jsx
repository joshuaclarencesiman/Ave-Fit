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
      setError(err.response?.data?.message || "Unable to send a new link right now.");
    } finally {
      setResending(false);
    }
  };

  return (
    <OnboardingShell step={1} width="max-w-lg">
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
          {status === "failed" && "This link is not valid"}
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

        {status === "failed" && (
          <>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">{error}</p>

            <form
              className="mt-6 space-y-4 text-left"
              onSubmit={(e) => {
                e.preventDefault();
                handleResend();
              }}
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter your email address and we will send you a fresh link.
              </p>

              <Field
                label="Email address"
                htmlFor="verify-resend-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {resent && <Alert tone="info">{notice}</Alert>}

              <PrimaryButton type="submit" loading={resending} loadingText="Sending…">
                Send new verification link
              </PrimaryButton>
            </form>
          </>
        )}

        {status === "idle" && (
          <>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
              Open the verification link from your AveFit email to continue. If the link has
              expired you can request a new one here.
            </p>

            <form
              className="mt-6 space-y-4 text-left"
              onSubmit={(e) => {
                e.preventDefault();
                handleResend();
              }}
            >
              <Field
                label="Email address"
                htmlFor="verify-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {resent && <Alert tone="info">{notice}</Alert>}

              <PrimaryButton type="submit" loading={resending} loadingText="Sending…">
                Resend verification email
              </PrimaryButton>
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
