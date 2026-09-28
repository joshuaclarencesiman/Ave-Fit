import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Dumbbell, Trash2, Plus, Users, AlertTriangle, X, UserRound } from "lucide-react";
import trainerApi from "../trainerApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatDuration(value) {
  if (value === null || value === undefined || value === "") return "";
  const text = String(value).trim();
  return /mins?$/i.test(text) ? text : `${text} mins`;
}

function toList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") return val.replace(/^\{|\}$/g, "").split(",").map(s=>s.trim()).filter(Boolean);
  return [];
}

function MemberProfileModal({ member, onClose }) {
  if (!member) return null;
  const currentWeight = member.latest_weight ?? member.weight;
  const currentBmi = member.latest_bmi ?? null;
  const injuries = toList(member.injuries);
  const conditions = toList(member.health_conditions);
  return <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className="w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={e=>e.stopPropagation()}>
      <div className="relative min-h-[300px] bg-slate-950 flex items-center justify-center overflow-hidden">
        {member.profile_image ? <><img src={member.profile_image} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-35"/><div className="absolute inset-0 bg-black/25"/><img src={member.profile_image} alt={`${member.first_name} ${member.last_name}`} className="relative z-10 max-w-full max-h-[420px] w-auto h-auto object-contain p-5"/></> : <div className="relative z-10 w-32 h-32 rounded-full bg-orange-500/15 flex items-center justify-center text-orange-400 text-5xl font-bold">{member.first_name?.charAt(0)}{member.last_name?.charAt(0)}</div>}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/95 to-transparent"/>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"><X size={20}/></button>
        <div className="absolute z-20 bottom-5 left-6 right-6 text-white"><p className="text-xs uppercase tracking-widest font-bold text-orange-300">Member Profile</p><h2 className="text-3xl font-bold mt-1">{member.first_name} {member.last_name}</h2><p className="text-sm text-slate-300 mt-1">{member.email}</p></div>
      </div>
      <div className="p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[['Phone',member.phone],['Gender',member.gender],['Age',member.age?`${member.age} yrs`:'—'],['Height',member.height?`${member.height} cm`:'—'],['Weight',currentWeight?`${currentWeight} kg`:'—'],['Target Weight',member.target_weight?`${member.target_weight} kg`:'—'],['BMI',currentBmi||'—'],['Goal',member.fitness_goal||'—']].map(([l,v])=><div key={l} className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3"><p className="text-xs text-slate-400">{l}</p><p className="mt-1 font-semibold text-slate-700 dark:text-slate-200 break-words">{v}</p></div>)}
        </div>
        {(injuries.length || conditions.length) ? <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"><p className="flex items-center gap-2 text-amber-400 font-semibold text-sm"><AlertTriangle size={16}/> Health &amp; Safety Notes</p><div className="flex flex-wrap gap-2 mt-3">{injuries.map(x=><span key={`i-${x}`} className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs">Injury: {x}</span>)}{conditions.map(x=><span key={`c-${x}`} className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs">{x}</span>)}</div></div> : null}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4"><p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Training Preferences</p><p className="text-sm text-slate-600 dark:text-slate-300">{toList(member.preferred_days).join(', ') || 'No preferred days set.'}</p><p className="text-xs text-slate-400 mt-2">{member.workout_days_per_week ? `${member.workout_days_per_week} days/week` : 'Days/week not set'}{member.workout_duration ? ` · ${formatDuration(member.workout_duration)}` : ''}</p></div>
      </div>
    </div>
  </div>;
}

function MemberRow({ member, exercises, onChanged, onViewProfile }) {
  const [expanded, setExpanded] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [form, setForm] = useState({ exercise_id:"", sets:"", reps:"", duration_minutes:"", session_date:"" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const injuries=toList(member.injuries), conditions=toList(member.health_conditions), hasHealthFlags=injuries.length>0||conditions.length>0;
  const currentWeight=member.latest_weight ?? member.weight, currentBmi=member.latest_bmi;
  const preferredDays=toList(member.preferred_days), dayOptions=preferredDays.length?preferredDays:DAYS;
  const fetchSessions=()=>{setLoadingSessions(true);trainerApi.get(`/me/members/${member.user_id}/sessions`).then(r=>setSessions(r.data.data||[])).catch(console.error).finally(()=>setLoadingSessions(false));};
  const toggle=()=>{const next=!expanded;setExpanded(next);if(next&&sessions.length===0)fetchSessions();};
  const handleAssign=async()=>{if(!form.exercise_id||!form.session_date){setError('Please pick an exercise and a day.');return;}setSaving(true);setError('');try{await trainerApi.post('/me/assign',{...form,user_id:member.user_id});setForm({exercise_id:'',sets:'',reps:'',duration_minutes:'',session_date:''});fetchSessions();onChanged?.();}catch(err){setError(err.response?.data?.message||'Failed to assign workout.')}finally{setSaving(false)}};
  const handleDelete=async id=>{try{await trainerApi.delete(`/me/sessions/${id}`);fetchSessions();onChanged?.();}catch(err){console.error(err)}};
  return <div className="trainer-card border rounded-2xl overflow-hidden">
    <div className="w-full flex items-center justify-between px-4 py-4 hover:bg-orange-50 dark:hover:bg-slate-800/60 transition">
      <button onClick={toggle} className="flex items-center gap-3 text-left min-w-0 flex-1"><div className="w-11 h-11 rounded-full overflow-hidden bg-orange-500/15 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">{member.profile_image?<img src={member.profile_image} alt="" className="w-full h-full object-cover"/>:<>{member.first_name?.charAt(0)}{member.last_name?.charAt(0)}</>}</div><div className="min-w-0"><p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{member.first_name} {member.last_name}</p><p className="text-slate-500 text-xs truncate">{member.fitness_goal||'No goal set'} · {member.email}</p></div></button>
      <div className="flex items-center gap-2 ml-3"><button onClick={()=>onViewProfile(member)} className="px-3 py-2 rounded-lg border border-orange-500/30 text-orange-500 hover:bg-orange-500/10 text-xs font-semibold">View Profile</button>{expanded?<ChevronUp size={18} className="text-slate-500"/>:<ChevronDown size={18} className="text-slate-500"/>}</div>
    </div>
    {expanded&&<div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-800">
      <div className="pt-4"><p className="text-xs font-semibold text-slate-500 mb-2">Member Details</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">{[['Age / Gender',`${member.age||'—'}${member.gender?` · ${member.gender}`:''}`],['Height / Weight',`${member.height?`${member.height}cm`:'—'}${currentWeight?` · ${currentWeight}kg`:''}`],['Target Weight',member.target_weight?`${member.target_weight}kg`:'—'],['Current BMI',currentBmi||'—'],['Activity Level',member.activity_level||'—'],['Intensity',member.intensity?`${member.intensity}/10`:'—'],['Days / Week',member.workout_days_per_week||'—'],['Session Length',member.workout_duration ? formatDuration(member.workout_duration) : '—']].map(([l,v])=><div key={l} className="trainer-soft rounded-lg px-3 py-2"><p className="text-slate-500">{l}</p><p className="text-slate-700 dark:text-slate-200 font-medium mt-0.5">{v}</p></div>)}</div>{hasHealthFlags&&<div className="mt-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2.5"><p className="text-amber-400 text-xs font-semibold flex items-center gap-1.5 mb-1.5"><AlertTriangle size={13}/> Health &amp; Safety Notes</p><div className="flex flex-wrap gap-1.5">{injuries.map(x=><span key={`i-${x}`} className="bg-amber-500/15 text-amber-300 text-[11px] px-2 py-0.5 rounded-full">Injury: {x}</span>)}{conditions.map(x=><span key={`c-${x}`} className="bg-amber-500/15 text-amber-300 text-[11px] px-2 py-0.5 rounded-full">{x}</span>)}</div></div>}</div>
      <div className="pt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 items-end"><div className="col-span-2 sm:col-span-2"><label className="block text-xs text-slate-500 mb-1">Exercise</label><select value={form.exercise_id} onChange={e=>setForm({...form,exercise_id:e.target.value})} className="trainer-field w-full rounded-lg px-2 py-2 text-xs"><option value="">Select...</option>{exercises.map(e=><option key={e.exercise_id} value={e.exercise_id}>{e.exercise_name}</option>)}</select></div><div><label className="block text-xs text-slate-500 mb-1">Sets</label><input type="number" value={form.sets} onChange={e=>setForm({...form,sets:e.target.value})} className="trainer-field w-full rounded-lg px-2 py-2 text-xs"/></div><div><label className="block text-xs text-slate-500 mb-1">Reps</label><input type="number" value={form.reps} onChange={e=>setForm({...form,reps:e.target.value})} className="trainer-field w-full rounded-lg px-2 py-2 text-xs"/></div><div><label className="block text-xs text-slate-500 mb-1">Day</label><select value={form.session_date} onChange={e=>setForm({...form,session_date:e.target.value})} className="trainer-field w-full rounded-lg px-2 py-2 text-xs"><option value="">Select...</option>{dayOptions.map(d=><option key={d} value={d}>{d}</option>)}</select></div></div>
      {error&&<p className="text-red-400 text-xs mt-2">{error}</p>}<button onClick={handleAssign} disabled={saving} className="mt-3 flex items-center gap-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-2 rounded-lg"><Plus size={14}/>{saving?'Assigning...':'Assign Workout'}</button>
      <div className="mt-4"><p className="text-xs font-semibold text-slate-500 mb-2">Assigned Workouts</p>{loadingSessions?<p className="text-xs text-slate-500">Loading...</p>:sessions.length===0?<p className="text-xs text-slate-500">No workouts assigned yet.</p>:<div className="space-y-1.5">{sessions.map(s=><div key={s.session_id} className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"><div className="flex items-center gap-2 text-xs"><Dumbbell size={14} className="text-orange-400"/><span className="font-medium text-slate-200">{s.exercise_name||'Exercise'}</span><span className="text-slate-500">· {s.session_date}</span>{s.sets&&<span className="text-slate-500">· {s.sets}x{s.reps||'?'}</span>}{s.completed&&<span className="text-green-400 font-medium">✓ Done</span>}</div><button onClick={()=>handleDelete(s.session_id)} className="text-red-400 hover:text-red-300"><Trash2 size={14}/></button></div>)}</div>}</div>
    </div>}
  </div>;
}

export default function TrainerDashboard(){
  const [members,setMembers]=useState([]),[exercises,setExercises]=useState([]),[loading,setLoading]=useState(true),[profileMember,setProfileMember]=useState(null);
  const fetchRoster=()=>trainerApi.get('/me/roster').then(r=>setMembers(r.data.data||[])).catch(console.error);
  useEffect(()=>{setLoading(true);Promise.all([trainerApi.get('/me/roster'),trainerApi.get('/me/exercises')]).then(([r,e])=>{setMembers(r.data.data||[]);setExercises(e.data.data||[])}).catch(console.error).finally(()=>setLoading(false))},[]);
  return <div className="px-4 sm:px-6 py-8"><MemberProfileModal member={profileMember} onClose={()=>setProfileMember(null)}/><h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Users size={24} className="text-orange-400"/> My Roster</h1><p className="text-slate-500 text-sm mt-1 mb-7 max-w-2xl">Members designated to you by the gym. View their full profile and assign workouts to their weekly schedule.</p>{loading?<div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="h-16 bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 rounded-2xl animate-pulse"/>)}</div>:members.length===0?<div className="text-center py-20 border border-orange-100 dark:border-slate-800 bg-white dark:bg-transparent rounded-2xl"><Users size={40} className="mx-auto text-slate-700 mb-3"/><p className="text-slate-400 font-medium">No members yet</p><p className="text-slate-600 text-sm mt-1">Members will appear here after the gym assigns them to you.</p></div>:<div className="space-y-3">{members.map(m=><MemberRow key={m.user_id} member={m} exercises={exercises} onChanged={fetchRoster} onViewProfile={setProfileMember}/>)}</div>}</div>;
}
