import AuthFrame from "./AuthFrame";
import { Brand } from "./AppShell";

/**
 * Shared frame for sign-in / sign-up screens. Keeps the admin, coach and
 * member portals visually identical instead of each hand-rolling its own
 * gradient and card.
 */
export default function AuthShell({
  title,
  subtitle,
  width = "max-w-md",
  children,
  footer = null,
  glass = false,
}) {
  return (
    <AuthFrame width={width} glass={glass}>
      <div className="mb-7 flex flex-col items-center text-center">
        <Brand subtitle="Avenue Power &amp; Fitness" />
        <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>

      <div
        className={`${glass ? "auth-glass-panel" : "border-slate-200 bg-white shadow-orange-500/5 dark:border-white/10 dark:bg-[#111] dark:shadow-black/40"} rounded-2xl border p-6 shadow-xl sm:p-8`}
      >
        {children}
      </div>

      {footer}

      <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        AveFit &mdash; Batangas State University Capstone Project 2026
      </p>
    </AuthFrame>
  );
}
