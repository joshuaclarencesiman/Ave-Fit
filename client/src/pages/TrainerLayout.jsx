import { useNavigate } from "react-router-dom";
import { ClipboardList, Dumbbell, User, Users } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import { useTrainerAuth } from "../context/TrainerAuthContext";

const NAV = [
  { to: "/trainer/roster", icon: Users, label: "My Roster" },
  { to: "/trainer/workout-plans", icon: ClipboardList, label: "Workout Plans" },
  { to: "/trainer/exercises", icon: Dumbbell, label: "Exercises" },
  { to: "/trainer/profile", icon: User, label: "My Profile" },
];

export default function TrainerLayout({ children }) {
  const navigate = useNavigate();
  const { trainer, logoutTrainer } = useTrainerAuth();

  const handleLogout = () => {
    logoutTrainer();
    navigate("/trainer/login", { replace: true });
  };

  return (
    <AppShell
      portalClassName="trainer-portal"
      nav={NAV}
      subtitle="Coach portal"
      onLogout={handleLogout}
      user={
        trainer
          ? {
              name: trainer.full_name || "Coach",
              meta: trainer.specializations?.[0] || trainer.email || "Coach",
              avatarUrl: trainer.photo_url || null,
              initials: (trainer.full_name || "C").charAt(0).toUpperCase(),
            }
          : null
      }
      topbarLeft={
        <span className="block min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
            {trainer?.full_name || "AveFit Coach"}
          </span>
          <span className="hidden truncate text-[11px] text-slate-500 sm:block">
            Avenue Power and Fitness Gym
          </span>
        </span>
      }
      contentWidth="max-w-7xl"
    >
      {children}
    </AppShell>
  );
}
