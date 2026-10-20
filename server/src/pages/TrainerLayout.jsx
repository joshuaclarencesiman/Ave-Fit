import { useNavigate } from "react-router-dom";
import { Users, LogOut } from "lucide-react";
import { useTrainerAuth } from "../context/TrainerAuthContext";

export default function TrainerLayout({ children }) {
  const navigate = useNavigate();
  const { trainer, logoutTrainer } = useTrainerAuth();

  const handleLogout = () => {
    logoutTrainer();
    navigate("/trainer/login");
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-slate-800 bg-slate-900">
        <div className="px-6 py-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-emerald-400">AveFit</h1>
          <p className="text-xs text-slate-500 mt-0.5">Coach Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4">
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-600 text-white">
            <Users size={20} /> My Roster
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          {trainer && (
            <div className="px-4 py-2 mb-2">
              <p className="text-sm font-semibold text-white truncate">{trainer.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{trainer.specialization || trainer.email}</p>
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

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-slate-800 bg-slate-900">
          <div>
            <h1 className="text-xl font-bold text-emerald-400">AveFit Coach</h1>
            {trainer && <p className="text-xs text-slate-500">{trainer.full_name}</p>}
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          <div className="w-full max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
