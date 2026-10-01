import { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Line } from "react-chartjs-2";
import { TrendingUp, Scale, Calendar } from "lucide-react";
import userApi from "../userApi";
import { useUserAuth } from "../context/UserAuthContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ProgressPage() {
  const { user } = useUserAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Log form
  const [logForm, setLogForm] = useState({ weight: "", bmi: "" });
  const [logging, setLogging] = useState(false);
  const [logMsg, setLogMsg] = useState("");

  // Prediction form
  const [predForm, setPredForm] = useState({ current_weight: "", goal_weight: "", weekly_loss: "" });
  const [predResult, setPredResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await userApi.get("/progress");
      setLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProgress(); }, []);

  // Auto-calc BMI when weight changes
  const handleWeightChange = (val) => {
    setLogForm((f) => {
      const h = parseFloat(user?.height);
      let bmi = "";
      if (h && val) {
        const hm = h / 100;
        bmi = (parseFloat(val) / (hm * hm)).toFixed(1);
      }
      return { ...f, weight: val, bmi };
    });
  };

  const handleLogProgress = async () => {
    if (!logForm.weight) return;
    setLogging(true);
    try {
      await userApi.post("/progress", logForm);
      setLogMsg("Progress logged!");
      setLogForm({ weight: "", bmi: "" });
      fetchProgress();
      setTimeout(() => setLogMsg(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  const handlePredict = async () => {
    if (!predForm.current_weight || !predForm.goal_weight || !predForm.weekly_loss) return;
    setPredicting(true);
    try {
      const res = await userApi.post("/progress/predict", predForm);
      setPredResult(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  const chartData = {
    labels: logs.map((l) => l.log_date ? new Date(l.log_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""),
    datasets: [
      {
        label: "Weight (kg)",
        data: logs.map((l) => parseFloat(l.weight)),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.08)",
        fill: true, tension: 0.4,
        pointBackgroundColor: "#3b82f6", pointRadius: 5,
      },
    ],
  };

  const bmiChart = {
    labels: logs.map((l) => l.log_date ? new Date(l.log_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""),
    datasets: [
      {
        label: "BMI",
        data: logs.map((l) => parseFloat(l.bmi)),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.08)",
        fill: true, tension: 0.4,
        pointBackgroundColor: "#10b981", pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: false, grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
      x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
    },
  };

  const latestLog = logs[logs.length - 1];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-900/40 to-slate-950 px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Progress Tracker</h1>
        <p className="text-slate-400 text-sm mt-1">Track your body metrics over time</p>
      </div>

      <div className="px-6 space-y-6">
        {/* Current Stats */}
        {latestLog && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-2xl p-4 text-center">
              <Scale size={20} className="mx-auto text-blue-400 mb-2" />
              <p className="text-2xl font-bold">{latestLog.weight} kg</p>
              <p className="text-xs text-slate-400 mt-1">Latest Weight</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4 text-center">
              <TrendingUp size={20} className="mx-auto text-green-400 mb-2" />
              <p className="text-2xl font-bold">{latestLog.bmi}</p>
              <p className="text-xs text-slate-400 mt-1">Latest BMI</p>
            </div>
          </div>
        )}

        {/* Log Progress */}
        <div className="bg-slate-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4">Log Today's Progress</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
              <input type="number" value={logForm.weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder="e.g. 72.5"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">BMI (auto)</label>
              <input type="number" value={logForm.bmi} readOnly
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-400 text-sm cursor-not-allowed" />
            </div>
          </div>
          {logMsg && <p className="text-green-400 text-sm mb-2">{logMsg}</p>}
          <button onClick={handleLogProgress} disabled={logging || !logForm.weight}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm">
            {logging ? "Logging..." : "Log Progress"}
          </button>
        </div>

        {/* Weight Chart */}
        {logs.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4">Weight Over Time</h3>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {/* BMI Chart */}
        {logs.length > 1 && (
          <div className="bg-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4">BMI Over Time</h3>
            <Line data={bmiChart} options={chartOptions} />
          </div>
        )}

        {/* Weight Prediction */}
        <div className="bg-slate-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-1">Weight Prediction</h3>
          <p className="text-slate-400 text-xs mb-4">Predict when you'll reach your goal weight</p>

          <div className="space-y-3 mb-4">
            {[
              { label: "Current Weight (kg)", key: "current_weight" },
              { label: "Goal Weight (kg)", key: "goal_weight" },
              { label: "Expected Weekly Loss/Gain (kg)", key: "weekly_loss" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                <input type="number" value={predForm[f.key]}
                  onChange={(e) => setPredForm({ ...predForm, [f.key]: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>

          <button onClick={handlePredict} disabled={predicting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm mb-4">
            {predicting ? "Calculating..." : "Calculate Prediction"}
          </button>

          {predResult && (
            <div className="bg-slate-900 rounded-2xl p-4 space-y-3">
              <h4 className="font-semibold text-white text-sm">📊 Prediction Results</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Weeks Needed", value: `${predResult.weeks_needed} weeks`, icon: <Calendar size={16} /> },
                  { label: "Target Date", value: predResult.target_date, icon: "📅" },
                  { label: "Goal Weight", value: `${predResult.goal_weight} kg`, icon: <Scale size={16} /> },
                  { label: "Predicted BMI", value: predResult.predicted_bmi || "—", icon: <TrendingUp size={16} /> },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-800 rounded-xl p-3 text-center">
                    <div className="text-blue-400 flex justify-center mb-1">
                      {typeof item.icon === "string" ? item.icon : item.icon}
                    </div>
                    <p className="font-bold text-white text-sm">{item.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {logs.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4">Progress History</h3>
            <div className="space-y-2">
              {[...logs].reverse().map((log) => (
                <div key={log.progress_id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                  <span className="text-sm text-slate-400">
                    {log.log_date ? new Date(log.log_date).toLocaleDateString() : "—"}
                  </span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-white font-medium">{log.weight} kg</span>
                    <span className="text-green-400">BMI {log.bmi}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}