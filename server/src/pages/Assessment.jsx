import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import userApi from "../userApi";

export default function Assessment() {
  const navigate = useNavigate();
  const { user, loginUser } = useUserAuth();
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const [calculated, setCalculated] = useState(false);

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
    if (bmi < 25) return { label: "Normal Weight", color: "text-green-400" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-400" };
    return { label: "Obese", color: "text-red-400" };
  };

  const handleCalculate = () => {
    if (!weight || !height) return;
    const h = parseFloat(height) / 100;
    const result = (parseFloat(weight) / (h * h)).toFixed(1);
    const cat = getBMICategory(parseFloat(result));
    setBmi(result);
    setBmiCategory(cat);
    setCalculated(true);
  };

  const handleContinue = async () => {
    try {
      await userApi.put("/profile", {
        ...user,
        gender,
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
      });
      navigate("/user/goal");
    } catch (err) {
      console.error(err);
      navigate("/user/goal");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className={`flex-1 h-1.5 rounded-full ${step === 1 ? "bg-blue-500" : "bg-slate-700"}`} />
          ))}
        </div>

        <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
          <button onClick={() => navigate("/user/login")} className="text-slate-400 hover:text-white text-sm mb-4 flex items-center gap-1">
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-white mb-1">Body Assessment</h2>
          <p className="text-slate-400 text-sm mb-6">Tell us about your body so we can calculate your BMI.</p>

          {/* Gender Toggle */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
            <div className="flex bg-slate-900 rounded-xl p-1">
              {["Male", "Female"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition ${
                    gender === g ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {g === "Male" ? "♂ Male" : "♀ Female"}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4 mb-6">
            {[
              { label: "Age", key: "age", value: age, setter: setAge, unit: "years", min: 10, max: 100 },
              { label: "Weight", key: "weight", value: weight, setter: setWeight, unit: "kg", min: 30, max: 300 },
              { label: "Height", key: "height", value: height, setter: setHeight, unit: "cm", min: 100, max: 250 },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-300 mb-1">{f.label}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={f.value}
                    onChange={(e) => { f.setter(e.target.value); setCalculated(false); setBmi(null); }}
                    min={f.min}
                    max={f.max}
                    placeholder={`Enter ${f.label.toLowerCase()}`}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{f.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* BMI Result */}
          {calculated && bmi && (
            <div className="bg-slate-900 rounded-2xl p-4 mb-5 text-center">
              <p className="text-slate-400 text-sm">Your BMI</p>
              <p className="text-4xl font-bold text-white mt-1">{bmi}</p>
              <p className={`text-sm font-semibold mt-1 ${bmiCategory.color}`}>{bmiCategory.label}</p>
              <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    parseFloat(bmi) < 18.5 ? "bg-blue-500 w-1/4" :
                    parseFloat(bmi) < 25 ? "bg-green-500 w-2/4" :
                    parseFloat(bmi) < 30 ? "bg-yellow-500 w-3/4" : "bg-red-500 w-full"
                  }`}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
              </div>
            </div>
          )}

          <button
            onClick={handleCalculate}
            disabled={!weight || !height || !age}
            className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition mb-3"
          >
            Calculate BMI
          </button>

          <button
            onClick={handleContinue}
            disabled={!calculated}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition"
          >
            Continue to Goal Setup →
          </button>
        </div>
      </div>
    </div>
  );
}