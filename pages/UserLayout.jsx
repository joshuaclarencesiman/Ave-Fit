import { useNavigate } from "react-router-dom";
import { Dumbbell, Home, Info, TrendingUp, User, UsersRound } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import { useUserAuth } from "../context/UserAuthContext";

const NAV = [
  { to: "/user/workout", icon: Home, label: "Home" },
  { to: "/user/exercises", icon: Dumbbell, label: "Exercises" },
  { to: "/user/progress", icon: TrendingUp, label: "Progress" },
  { to: "/user/coaches", icon: UsersRound, label: "Coaches" },
  { to: "/user/about", icon: Info, label: "About" },
  { to: "/user/profile", icon: User, label: "Profile" },
];

export default function UserLayout({ children }) {
  const navigate = useNavigate();
  const { user, logoutUser } = useUserAuth();

  const handleLogout = () => {
    logoutUser();
    navigate("/user/login", { replace: true });
  };

  const fullName = user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : "";

  return (
    <AppShell
      portalClassName="user-portal"
      nav={NAV}
      subtitle="Avenue Power &amp; Fitness"
      bottomNav
      user={
        user
          ? {
              name: fullName || "Member",
              meta: user.email || "Member",
              avatarUrl: user.photo_url || null,
              initials: (user.first_name || "M").charAt(0).toUpperCase(),
            }
          : null
      }
      onLogout={handleLogout}
      topbarLeft={
        <span className="block min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
            {fullName || "AveFit"}
          </span>
          <span className="hidden truncate text-[11px] text-slate-500 sm:block">
            Avenue Power and Fitness Gym
          </span>
        </span>
      }
      contentClassName=""
      contentWidth="max-w-6xl"
    >
      {children}
    </AppShell>
  );
}
