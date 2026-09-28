import { useEffect, useState } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Users, TrendingUp, Dumbbell, Apple } from "lucide-react";
import api from "../services/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: "top", labels: { usePointStyle: true, padding: 20 } } },
  scales: {
    y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
    x: { grid: { display: false } },
  },
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    api.get("/analytics")
      .then((res) => setData(res.data.data))
      .catch((err) => {
        console.error(err);
        setFetchError(err.response?.data?.message || err.message || "Couldn't load analytics.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            ⚠️ {fetchError}
          </div>
        )}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md h-24 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-md h-64 animate-pulse" />
      </div>
    );
  }

  const memberGrowthChart = {
    labels: data?.memberGrowth.map((g) => g.month) || [],
    datasets: [{
      label: "New Members",
      data: data?.memberGrowth.map((g) => parseInt(g.count)) || [],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59,130,246,0.08)",
      fill: true, tension: 0.4,
      pointBackgroundColor: "#3b82f6", pointRadius: 5,
    }],
  };

  const goalChart = {
    labels: data?.goalDistribution.map((g) => g.goal) || [],
    datasets: [{
      data: data?.goalDistribution.map((g) => parseInt(g.count)) || [],
      backgroundColor: COLORS, borderWidth: 0,
    }],
  };

  const attendanceChart = {
    labels: data?.attendance.map((a) => a.day) || [],
    datasets: [{
      label: "Completed Sessions",
      data: data?.attendance.map((a) => parseInt(a.count)) || [],
      backgroundColor: "#10b981", borderRadius: 6,
    }],
  };

  const bmiOrder = ["Underweight", "Normal", "Overweight", "Obese"];
  const bmiMap = Object.fromEntries((data?.bmiDistribution || []).map((b) => [b.category, parseInt(b.count)]));

  return (
    <div className="space-y-8">
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {fetchError}
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 mt-1">Live data from your PostgreSQL database.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: "Total Members", value: data?.summary.totalMembers, icon: <Users size={22} />, color: "bg-orange-500" },
          { label: "Average BMI", value: data?.summary.avgBmi, icon: <TrendingUp size={22} />, color: "bg-green-500" },
          { label: "Workout Plans", value: data?.summary.totalWorkoutPlans, icon: <Dumbbell size={22} />, color: "bg-purple-500" },
          { label: "Nutrition Plans", value: data?.summary.totalNutritionPlans, icon: <Apple size={22} />, color: "bg-orange-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4">
            <div className={`${s.color} p-3 rounded-xl text-white flex-shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value ?? "—"}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Member Growth</h3>
          {memberGrowthChart.labels.length > 0
            ? <Line data={memberGrowthChart} options={chartOptions} />
            : <p className="text-slate-400 text-sm text-center py-12">No data yet.</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Goal Distribution</h3>
          {goalChart.labels.length > 0
            ? <Doughnut data={goalChart} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
            : <p className="text-slate-400 text-sm text-center py-12">No data yet.</p>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Completed Sessions by Day of Week</h3>
        {attendanceChart.labels.length > 0
          ? <Bar data={attendanceChart} options={chartOptions} />
          : <p className="text-slate-400 text-sm text-center py-12">No completed sessions yet.</p>}
      </div>

      {/* BMI Distribution */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">BMI Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Underweight", range: "< 18.5", color: "bg-orange-100 text-orange-700" },
            { label: "Normal", range: "18.5 – 24.9", color: "bg-green-100 text-green-700" },
            { label: "Overweight", range: "25 – 29.9", color: "bg-yellow-100 text-yellow-700" },
            { label: "Obese", range: "≥ 30", color: "bg-red-100 text-red-700" },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl p-4 text-center ${item.color}`}>
              <p className="text-3xl font-bold">{bmiMap[item.label] ?? 0}</p>
              <p className="font-semibold text-sm mt-1">{item.label}</p>
              <p className="text-xs opacity-70 mt-0.5">BMI {item.range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}