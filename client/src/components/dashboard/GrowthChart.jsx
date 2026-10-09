import { useEffect, useState } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import api from "../../services/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function GrowthChart() {
  const [period, setPeriod] = useState("sixMonths");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    api.get("/analytics", { params: { period } })
      .then((res) => {
        if (!active) return;
        const growth = res.data.data.growthOverview || [];

        setChartData({
          labels: growth.map((g) => g.label),
          datasets: [
            {
              label: "New Members",
              data: growth.map((g) => Number(g.new_members)),
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.08)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#3b82f6",
              pointRadius: 5,
            },
            {
              label: "Workout Sessions",
              data: growth.map((g) => Number(g.workout_sessions)),
              borderColor: "#10b981",
              backgroundColor: "rgba(16,185,129,0.08)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#10b981",
              pointRadius: 5,
            },
          ],
        });
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError(err.response?.data?.message || err.message || "Couldn't load growth data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [period]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { usePointStyle: true, padding: 20 } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Growth Overview</h3>
        <label className="sr-only" htmlFor="growth-period">Growth chart time range</label>
        <select
          id="growth-period"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          className="rounded-full border-0 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 outline-none transition focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <option value="week">Weekly</option>
          <option value="month">1 month</option>
          <option value="threeMonths">3 months</option>
          <option value="sixMonths">6 months</option>
          <option value="year">Yearly</option>
        </select>
      </div>
      {error && (
        <div role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading ? (
        <div className="h-48 animate-pulse bg-slate-100 rounded-xl" />
      ) : chartData && chartData.labels.length > 0 ? (
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No data available yet.
        </div>
      )}
    </div>
  );
}