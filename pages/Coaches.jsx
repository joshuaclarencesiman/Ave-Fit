import { useEffect, useMemo, useState } from "react";
import { Briefcase, ChevronLeft, ChevronRight, Sparkles, User, X } from "lucide-react";
import userApi from "../userApi";

const aliases = {
  "Weight Loss": ["weight loss", "weight management", "hiit", "circuit training", "group fitness", "conditioning"],
  "Muscle Gain": ["muscle", "bodybuilding", "physique", "powerlifting", "olympic weightlifting", "kettlebell training", "calisthenics"],
  "Maintain Weight": ["wellness", "maintenance", "functional fitness", "group fitness", "conditioning"],
  "General Fitness": ["general fitness", "fitness", "functional fitness", "group fitness", "hiit", "circuit training", "conditioning"],
};

function score(t, goal) {
  const text = `${(t.specializations || []).join(" ")} ${t.bio || ""} ${t.goal_specialty || ""}`.toLowerCase();
  return (t.goal_specialty === goal ? 100 : 0) +
    (aliases[goal] || aliases["General Fitness"]).reduce((n, w) => n + (text.includes(w) ? 15 : 0), 0);
}

function expertise(t) {
  return [...new Set([...(t.specializations || []), t.goal_specialty].filter(Boolean))].slice(0, 8);
}

function TrainerPhoto({ trainer, className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-slate-950 ${className}`}>
      {trainer.photo_url ? (
        <>
          <img src={trainer.photo_url} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-5">
            <img src={trainer.photo_url} alt={trainer.full_name} className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-2xl" />
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center"><User size={96} className="text-orange-500" /></div>
      )}
    </div>
  );
}

function TrainerProfileModal({ trainer, goal, onClose }) {
  const [photoOpen, setPhotoOpen] = useState(false);
  if (!trainer) return null;
  const items = [...new Set([...(trainer.specializations || []), trainer.goal_specialty].filter(Boolean))];

  return (
    <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-y-auto border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-[55vh] min-h-[360px] max-h-[650px] bg-slate-950">
          <button type="button" onClick={() => trainer.photo_url && setPhotoOpen(true)} className={`w-full h-full ${trainer.photo_url ? "cursor-zoom-in" : "cursor-default"}`} aria-label={trainer.photo_url ? "View full profile photo" : "Profile photo unavailable"}>
            <TrainerPhoto trainer={trainer} className="w-full h-full" />
          </button>
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />
          <button type="button" onClick={onClose} className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center" aria-label="Close profile"><X size={20} /></button>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="text-xs uppercase tracking-widest font-bold text-orange-300">Coach Profile</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-1">{trainer.full_name}</h2>
            <p className="text-orange-300 font-semibold mt-1">{trainer.goal_specialty || "General Fitness Coach"}</p>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-400">About the Coach</p>
          <p className="text-sm sm:text-base leading-7 text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-line">{trainer.bio || "This coach has not added a profile description yet."}</p>
          <div className="mt-7">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">Expertise</p>
            <div className="flex flex-wrap gap-2">
              {items.length ? items.map((item) => <span key={item} className="px-3 py-2 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold">{item}</span>) : <span className="text-sm text-slate-400">No specializations listed.</span>}
            </div>
          </div>
          <div className="mt-7 rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 flex items-center gap-3">
            <Briefcase size={18} className="text-orange-500 shrink-0" />
            <div><p className="text-xs text-slate-400">Your fitness goal</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{goal || "General Fitness"}</p></div>
          </div>
          <div className="mt-6 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/70 dark:bg-orange-500/5 p-4 text-sm text-slate-600 dark:text-slate-300">
            Your coach is designated by the gym. If you need a coach change, please contact the gym administrator.
          </div>
        </div>
      </div>
      {photoOpen && trainer.photo_url && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setPhotoOpen(false)}
        >
          <button
            type="button"
            onClick={() => setPhotoOpen(false)}
            className="absolute top-4 right-4 z-[110] w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20"
            aria-label="Close full profile photo"
          >
            <X size={24} />
          </button>
          <img
            src={trainer.photo_url}
            alt={trainer.full_name}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl cursor-zoom-out"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default function Coaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [i, setI] = useState(0);
  const [touch, setTouch] = useState(null);
  const [goal, setGoal] = useState("General Fitness");
  const [assignedTrainerId, setAssignedTrainerId] = useState(null);
  const [profileTrainer, setProfileTrainer] = useState(null);
  const [error, setError] = useState("");

  const swipeStart = (e) => setTouch(e.touches?.[0]?.clientX ?? null);
  const swipeEnd = (e) => {
    if (touch == null || !ranked.length) return;
    const d = (e.changedTouches?.[0]?.clientX ?? touch) - touch;
    if (Math.abs(d) > 55) setI((n) => (n + (d < 0 ? 1 : -1) + ranked.length) % ranked.length);
    setTouch(null);
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([userApi.get("/trainers"), userApi.get("/profile")])
      .then(([trainerRes, profileRes]) => {
        if (!mounted) return;
        const list = trainerRes.data?.data || [];
        const profile = profileRes?.data?.data || profileRes?.data?.user || profileRes?.data;
        setCoaches(list);
        if (profile?.fitness_goal) setGoal(profile.fitness_goal);
        if (profile?.trainer_id) setAssignedTrainerId(profile.trainer_id);
      })
      .catch((err) => {
        console.error("Failed to load coaches:", err);
        if (mounted) setError("Unable to load coach profiles. Please try again.");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const ranked = useMemo(() => [...coaches].sort((a, b) => score(b, goal) - score(a, goal)), [coaches, goal]);
  const t = ranked[i];

  useEffect(() => { if (i >= ranked.length && ranked.length) setI(0); }, [ranked.length, i]);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-7">
        <p className="text-orange-500 text-xs font-bold uppercase tracking-widest">AveFit Coaches</p>
        <h1 className="text-3xl font-bold mt-1">Meet your coaches</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">View coach profiles and see who specializes in your goal: <b>{goal}</b>.</p>
      </div>
      {assignedTrainerId && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">Your designated coach is shown with a <b>Assigned Coach</b> badge. Coach changes are managed by the gym administrator.</div>}
      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}
      {loading ? <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse" /> : !t ? <div className="text-slate-500">No active coaches are available.</div> : (
        <div className="max-w-2xl mx-auto relative">
          <button type="button" onClick={() => setI((i - 1 + ranked.length) % ranked.length)} className="absolute left-0 top-[42%] -translate-y-1/2 -translate-x-1/2 z-20 w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 shadow-lg"><ChevronLeft /></button>
          <button type="button" onClick={() => setI((i + 1) % ranked.length)} className="absolute right-0 top-[42%] -translate-y-1/2 translate-x-1/2 z-20 w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 shadow-lg"><ChevronRight /></button>
          <div onTouchStart={swipeStart} onTouchEnd={swipeEnd} onClick={() => setProfileTrainer(t)} className="cursor-pointer overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] shadow-xl hover:shadow-2xl transition-shadow">
            <TrainerPhoto trainer={t} className="h-[420px] sm:h-[500px]" />
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {i === 0 && <span className="inline-flex items-center gap-1 bg-orange-500 text-white rounded-full px-3 py-1 text-xs font-bold"><Sparkles size={12} /> Recommended for you</span>}
                  <h2 className="text-2xl font-bold mt-3">{t.full_name}</h2>
                  <p className="text-orange-500 font-semibold mt-1">{t.goal_specialty || "General Fitness Coach"}</p>
                </div>
                {assignedTrainerId === t.trainer_id && <span className="shrink-0 inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1.5 text-xs font-bold">Assigned Coach</span>}
              </div>
              {t.bio && <p className="text-slate-500 dark:text-slate-400 mt-4 leading-6 line-clamp-3">{t.bio}</p>}
              <div className="mt-5"><p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Expertise</p><div className="flex flex-wrap gap-2">{expertise(t).map((x) => <span key={x} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-xs font-medium">{x}</span>)}</div></div>
              <div className="mt-6"><button type="button" onClick={(e) => { e.stopPropagation(); setProfileTrainer(t); }} className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold">View Full Profile & Description</button></div>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-4">{ranked.map((x, n) => <button key={x.trainer_id} type="button" onClick={(e) => { e.stopPropagation(); setI(n); }} aria-label={`Show ${x.full_name}`} className={`h-2 rounded-full ${n === i ? "w-7 bg-orange-500" : "w-2 bg-slate-300 dark:bg-slate-700"}`} />)}</div>
          <p className="text-center text-xs text-slate-400 mt-2">Coach {i + 1} of {ranked.length} · Click anywhere on the profile to view details</p>
        </div>
      )}
      {profileTrainer && <TrainerProfileModal trainer={profileTrainer} goal={goal} onClose={() => setProfileTrainer(null)} />}
    </div>
  );
}
