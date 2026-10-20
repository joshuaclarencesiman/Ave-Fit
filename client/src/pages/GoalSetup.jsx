import { useEffect, useState } from "react";
import OnboardingShell from "../components/layout/OnboardingShell";
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
    <OnboardingShell step={2}>
    <button onClick={() => navigate("/user/assessment")} className="text-slate-500 hover:text-slate-900 text-sm mb-4 flex items-center gap-1">
      ← Back
    </button>

    <h2 className="text-2xl font-bold text-slate-900 mb-1">Set Your Goal</h2>
    <p className="text-slate-500 text-sm mb-6">What do you want to achieve?</p>

    {/* Goal Toggle */}
    <div className="space-y-3 mb-8">
      {goals.map((g) => (
        <button
          key={g.key}
          onClick={() => handleSelectGoal(g.key)}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left ${
            goal === g.key
              ? "border-orange-500 bg-orange-500/10 text-slate-900"
              : "border-slate-200 text-slate-500 hover:border-slate-300"
          }`}
        >
          <span className="text-2xl">{g.icon}</span>
          <div>
            <p className="font-semibold">{g.key}</p>
            <p className="text-xs opacity-70">{g.desc}</p>
          </div>
          {goal === g.key && (
            <div className="ml-auto w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
        </button>
      ))}
    </div>

    {/* Target Weight */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-slate-600">Target Weight</label>
        <span className="text-2xl font-bold text-orange-500">
          {loading ? "—" : isLocked ? Math.round(currentWeight) : targetWeight} kg
        </span>
      </div>

      {isLocked ? (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
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
            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-orange-500 disabled:opacity-50"
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
      className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
    >
      Continue to Health Assessment →
    </button>
    </OnboardingShell>
  );
}
