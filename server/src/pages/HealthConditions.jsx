import { useState } from "react";
import { useNavigate } from "react-router-dom";

const injuryOptions = ["Knee", "Back", "Shoulder", "Hip", "Ankle", "Wrist", "Neck", "None"];
const healthOptions = ["Heart Condition", "Diabetes", "Asthma", "High Blood Pressure", "Arthritis", "None"];
const experienceLevels = ["Beginner", "Intermediate", "Advanced"];

function Chip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition ${
        selected
          ? "border-blue-500 bg-blue-500/20 text-blue-300"
          : "border-slate-700 text-slate-400 hover:border-slate-600"
      }`}
    >
      {label}
    </button>
  );
}

export default function HealthConditions() {
  const navigate = useNavigate();
  const [intensity, setIntensity] = useState(3);
  const [experience, setExperience] = useState("Beginner");
  const [injuries, setInjuries] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);

  const toggleChip = (value, list, setList) => {
    if (value === "None") { setList(["None"]); return; }
    const filtered = list.filter((i) => i !== "None");
    if (filtered.includes(value)) {
      setList(filtered.filter((i) => i !== value));
    } else {
      setList([...filtered, value]);
    }
  };

  const intensityLabels = ["", "Light", "Easy", "Moderate", "Intense", "Very Intense"];

  const handleContinue = () => {
    sessionStorage.setItem("avefit_health", JSON.stringify({ intensity, experience, injuries, healthConditions }));
    navigate("/user/availability");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className={`flex-1 h-1.5 rounded-full ${step <= 3 ? "bg-blue-500" : "bg-slate-700"}`} />
          ))}
        </div>

        <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 max-h-[85vh] overflow-y-auto">
          <button onClick={() => navigate("/user/goal")} className="text-slate-400 hover:text-white text-sm mb-4 flex items-center gap-1">
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-white mb-1">Health Conditions</h2>
          <p className="text-slate-400 text-sm mb-6">Help us make safe workout recommendations.</p>

          {/* Intensity Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Preferred Intensity</label>
              <span className="text-blue-400 text-sm font-semibold">{intensityLabels[intensity]}</span>
            </div>
            <input
              type="range" min={1} max={5} value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Light</span><span>Moderate</span><span>Very Intense</span>
            </div>
          </div>

          {/* Experience Level */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">Experience Level</label>
            <div className="flex gap-2">
              {experienceLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setExperience(level)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                    experience === level
                      ? "border-blue-500 bg-blue-500/20 text-blue-300"
                      : "border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Injury Areas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">Injury or Pain Areas</label>
            <div className="flex flex-wrap gap-2">
              {injuryOptions.map((opt) => (
                <Chip key={opt} label={opt} selected={injuries.includes(opt)}
                  onClick={() => toggleChip(opt, injuries, setInjuries)} />
              ))}
            </div>
          </div>

          {/* Health Conditions */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-3">Health Conditions</label>
            <div className="flex flex-wrap gap-2">
              {healthOptions.map((opt) => (
                <Chip key={opt} label={opt} selected={healthConditions.includes(opt)}
                  onClick={() => toggleChip(opt, healthConditions, setHealthConditions)} />
              ))}
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
          >
            Continue to Workout Schedule →
          </button>
        </div>
      </div>
    </div>
  );
}