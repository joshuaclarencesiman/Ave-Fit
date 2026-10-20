import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PrimaryButton({
  loading = false,
  loadingText = "Please wait…",
  className = "",
  children,
  disabled,
  ...rest
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:pointer-events-none disabled:opacity-60 ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {loading ? loadingText : children}
    </button>
  );
}

const fieldBase =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500";

function FieldShell({ label, htmlFor, children }) {
  return (
    <div>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

export function Field({ label, htmlFor, className = "", children, ...rest }) {
  return (
    <FieldShell label={label} htmlFor={htmlFor}>
      {children ?? <input id={htmlFor} className={`${fieldBase} ${className}`} {...rest} />}
    </FieldShell>
  );
}

export function PasswordField({ label, htmlFor, className = "", ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell label={label} htmlFor={htmlFor}>
      <div className="relative">
        <input
          id={htmlFor}
          type={visible ? "text" : "password"}
          className={`${fieldBase} pr-11 ${className}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FieldShell>
  );
}

const tones = {
  error:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  warning:
    "border-[#fdba74] bg-[#fff7ed] text-[#7c2d12] dark:border-[#9a3412] dark:bg-[#3b200d] dark:text-[#ffedd5]",
  info: "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
};

export function Alert({ tone = "info", children }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
