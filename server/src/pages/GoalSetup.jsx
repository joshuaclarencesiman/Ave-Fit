import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../userApi";

const goals = [
  { key: "Weight Loss", icon: "⬇️", desc: "Lose weight and burn fat" },
  { key: "Maintain Weight", icon: "⚖️", desc: "Stay at current weight" },
  { key: "Muscle Gain", icon: "💪", desc: "Build muscle and strength" },
];

// Given the goal + the user's current weight, figure out the valid slider range.
function getRange(goal, currentWeight) {
  const cw = Math.round(currentWeight || 65);
  if (goal === "Weight Loss") {
    return { min: 40, max: Math.max(40, cw - 1) }; // must end up lighter than now
  }
  if (goal === "Muscle Gain") {
    return { min: Math.min(150, cw + 1), max: 150 }; // must end up heavier than now
  }
  return { min: cw, max: cw }; // Maintain Weight — locked to current weight
}

export default function GoalSetup() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState("Weight Loss");
  const [currentWeight, setCurrentWeight] = useState(null);
  const [targetWeight, setTargetWeight] = useState(65);
  const [loading, setLoading] = useState(true);

  // Pull the weight the user entered during Body Assessment.
  useEffect(() => {
    userApi.get("/profile")
      .then((res) => {
        const w = parseFloat(res.data.data?.weight) || 65;
        setCurrentWeight(w);
        const range = getRange("Weight Loss", w);
        setTargetWeight(range.max);
      })
      .catch((err) => {
        console.error(err);
        setCurrentWeight(65);
      })
      .finally(() => setLoading(false));
  }, []);

  const { min, max } = getRange(goal, currentWeight);
  const isLocked = goal === "Maintain Weight";

  const handleSelectGoal = (key) => {
    setGoal(key);
    const range = getRange(key, currentWeight);
    // Snap target weight into whatever range the new goal allows.
    setTargetWeight((prev) => Math.min(Math.max(prev, range.min), range.max));
  };

  const handleContinue = () => {
    const finalTarget = isLocked ? Math.round(currentWeight) : targetWeight;
    sessionStorage.setItem("avefit_goal", JSON.stringify({ goal, targetWeight: finalTarget }));
    navigate("/user/health");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className={`flex-1 h-1.5 rounded-full ${step <= 2 ? "bg-blue-500" : "bg-slate-700"}`} />
          ))}
        </div>

        <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
          <button onClick={() => navigate("/user/assessment")} className="text-slate-400 hover:text-white text-sm mb-4 flex items-center gap-1">
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-white mb-1">Set Your Goal</h2>
          <p className="text-slate-400 text-sm mb-6">What do you want to achieve?</p>

          {/* Goal Toggle */}
          <div className="space-y-3 mb-8">
            {goals.map((g) => (
              <button
                key={g.key}
                onClick={() => handleSelectGoal(g.key)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left ${
                  goal === g.key
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <p className="font-semibold">{g.key}</p>
                  <p className="text-xs opacity-70">{g.desc}</p>
                </div>
                {goal === g.key && (
                  <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Target Weight */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">Target Weight</label>
              <span className="text-2xl font-bold text-blue-400">
                {loading ? "—" : isLocked ? Math.round(currentWeight) : targetWeight} kg
              </span>
            </div>

            {isLocked ? (
              <p className="text-xs text-slate-500 bg-slate-900 rounded-xl px-4 py-3">
                Your goal is to stay at your current weight ({Math.round(currentWeight || 0)} kg) — no need to set a target.
              </p>
            ) : (
              <>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={targetWeight}
                  disabled={loading}
                  onChange={(e) => setTargetWeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{min} kg</span>
                  <span>{max} kg</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {goal === "Weight Loss"
                    ? `Must be lower than your current weight (${Math.round(currentWeight || 0)} kg).`
                    : `Must be higher than your current weight (${Math.round(currentWeight || 0)} kg).`}
                </p>
              </>
            )}
          </div>

          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
          >
            Continue to Health Assessment →
          </button>
        </div>
      </div>
    </div>
  );
}
