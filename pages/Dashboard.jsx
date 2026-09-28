import { useEffect, useState } from "react";
import { Users, Clock } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import GrowthChart from "../components/dashboard/GrowthChart";
import ActivityList from "../components/dashboard/ActivityList";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    api.get("/analytics/dashboard")
      .then((res) => setStats(res.data.data))
      .catch((err) => {
        console.error(err);
        setFetchError(err.response?.data?.message || err.message || "Couldn't load dashboard stats.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welcome back! Here's what's happening at Avenue Power and Fitness Gym.
        </p>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {fetchError}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-6 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Total Members"
            value={stats?.memberTotal ?? stats?.totalMembers ?? 0}
            icon={<Users size={30} />}
            color="bg-orange-500"
            trend="Registered members"
          />
          <StatCard
            title="Pending Approval"
            value={stats?.pendingMembers ?? 0}
            icon={<Clock size={30} />}
            color="bg-yellow-500"
            trend="Needs review"
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <GrowthChart />
        </div>
        <div>
          <ActivityList recentMembers={stats?.recentMembers ?? []} />
        </div>
      </div>
    </div>
  );
}