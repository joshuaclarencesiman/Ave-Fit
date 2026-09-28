/**
 * Background + centred column shared by every unauthenticated screen
 * (sign-in, sign-up, onboarding, pending approval) so the three portals
 * never drift apart visually.
 */
export default function AuthFrame({ width = "max-w-md", children }) {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center bg-gradient-to-br from-white via-orange-50 to-white px-4 py-10 dark:from-black dark:via-[#141414] dark:to-black">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/5" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/5" />
      </div>

      <div className={`relative w-full ${width}`}>{children}</div>
    </div>
  );
}
