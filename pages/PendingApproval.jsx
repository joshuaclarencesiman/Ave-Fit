import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock3, MailCheck } from "lucide-react";
import OnboardingShell from "../components/layout/OnboardingShell";
import { Alert, Field, PrimaryButton } from "../components/ui/Form";
import userApi from "../userApi";

/**
 * Shown straight after signup. The member has to confirm their email address
 * before the gym administrator can be asked to review the registration, so this
 * screen covers both halves of the waiting period.
 */
export default function PendingApproval() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Check whether this account still needs the link, so the screen does not
  // keep telling somebody to look for an email they already opened.
  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("avefit_pending_email");
    if (!pendingEmail) return;

    setEmail(pendingEmail);
    let cancelled = false;

    userApi
      .get("/verification-status", { params: { email: pendingEmail } })
      .then((res) => {
        if (cancelled || !res.data?.registered) return;
        if (res.data.email_verified) {
          setNotice("Your email is already verified. Your registration is with the gym administrator.");
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const handleResend = async () => {
    if (!email) {
      setError("Enter the email address you registered with.");
      return;
    }

    setResending(true);
    setError("");
    setNotice("");

    try {
      const res = await userApi.post("/resend-verification", { email });
      setNotice(res.data.message);
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
          <Clock3 size={30} className="text-orange-500" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
          Verify your email to continue
        </h1>
        <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
          Thank you for registering with AveFit. We have sent a verification link to your email
          address. Confirm it so the gym administrator can review your registration.
        </p>

        <div className="mt-6 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-white/10 dark:bg-white/5">
          <MailCheck size={20} className="shrink-0 text-orange-500" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Step 1 of 2 &mdash; Check your inbox</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Click the link in the AveFit email. If you cannot find it, request a new one below.
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-white/10 dark:bg-white/5">
          <CheckCircle2 size={20} className="shrink-0 text-orange-500" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Step 2 of 2 &mdash; Wait for approval</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Please wait 1&ndash;3 working days. You will be able to log in and complete your
              AveFit setup once an administrator has approved your account.
            </p>
          </div>
        </div>

        <form
          className="mt-6 space-y-4 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            handleResend();
          }}
        >
          <Field
            label="Email address"
            htmlFor="pending-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {notice && <Alert tone="info">{notice}</Alert>}
          {error && <Alert tone="error">{error}</Alert>}

          <PrimaryButton
            type="button"
            onClick={handleResend}
            loading={resending}
            loadingText="Sending…"
            className="font-semibold"
          >
            Resend verification email
          </PrimaryButton>
        </form>

        <PrimaryButton
          className="mt-3"
          onClick={() => navigate("/user/login", { replace: true })}
        >
          Return to login
        </PrimaryButton>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded font-medium transition hover:text-orange-600"
        >
          &larr; Back to homepage
        </button>
      </p>
    </OnboardingShell>
  );
}
