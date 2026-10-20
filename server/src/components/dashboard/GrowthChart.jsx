import { useEffect, useState } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import api from "../../services/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function GrowthChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics")
      .then((res) => {
        const growth = res.data.data.memberGrowth;
        const attendance = res.data.data.attendance;

        setChartData({
          labels: growth.map((g) => g.month),
          datasets: [
            {
              label: "New Members",
              data: growth.map((g) => parseInt(g.count)),
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.08)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#3b82f6",
              pointRadius: 5,
            },
            {
              label: "Workout Sessions",
              data: attendance.map((a) => parseInt(a.count)),
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
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const options = {
    responsive: true,
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
        <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Last 6 months</span>
      </div>
      {loading ? (
        <div className="h-48 animate-pulse bg-slate-100 rounded-xl" />
      ) : chartData && chartData.labels.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No data available yet.
        </div>
      )}
    </div>
  );
}