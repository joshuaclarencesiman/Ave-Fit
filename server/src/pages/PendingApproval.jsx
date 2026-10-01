import { Clock3, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400">AveFit</h1>
          <p className="text-slate-400 mt-1">Avenue Power and Fitness Gym</p>
        </div>
        <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <Clock3 size={30} className="text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mt-5">Your Account Is Pending Approval</h2>
          <p className="text-slate-400 mt-3 leading-relaxed">Thank you for registering with AveFit. Your account has been submitted to the gym administrator for review.</p>
          <div className="bg-slate-900 rounded-2xl p-5 mt-6 text-left">
            <div className="flex gap-3">
              <CheckCircle2 className="text-yellow-400 shrink-0" size={20} />
              <div>
                <p className="text-white font-semibold">Please wait 1-3 working days</p>
                <p className="text-slate-500 text-sm mt-1">You will be able to log in and complete your AveFit setup once your account has been approved.</p>
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/user/login")} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition">Return to Login</button>
        </div>
        <p className="text-center text-slate-500 text-sm mt-6"><button onClick={() => navigate("/")} className="hover:text-slate-300 transition">← Back to Homepage</button></p>
      </div>
    </div>
  );
}
