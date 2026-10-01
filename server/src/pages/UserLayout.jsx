import { useNavigate, useLocation } from "react-router-dom";
import { Home, Dumbbell, TrendingUp, User, Info, LogOut } from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";

const navItems = [
  { to: "/user/workout", icon: <Home size={22} />, label: "Home" },
  { to: "/user/exercises", icon: <Dumbbell size={22} />, label: "Exercises" },
  { to: "/user/progress", icon: <TrendingUp size={22} />, label: "Progress" },
  { to: "/user/about", icon: <Info size={22} />, label: "About" },
  { to: "/user/profile", icon: <User size={22} />, label: "Profile" },
];

export default function UserLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useUserAuth();

  const handleLogout = () => {
    logoutUser();
    navigate("/user/login");
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex">
      {/* Desktop sidebar (lg and up) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-slate-800 bg-slate-900">
        <div className="px-6 py-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-blue-400">AveFit</h1>
          <p className="text-xs text-slate-500 mt-0.5">Avenue Power and Fitness Gym</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          {user && (
            <div className="px-4 py-2 mb-2">
              <p className="text-sm font-semibold text-white truncate">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main content — fills the rest of the screen */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          <div className="w-full max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation (below lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 w-full bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 py-3 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && <div className="w-1 h-1 bg-blue-400 rounded-full" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
