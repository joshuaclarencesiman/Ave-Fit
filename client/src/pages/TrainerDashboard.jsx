import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Dumbbell, Trash2, Plus, Users, AlertTriangle, X, ClipboardList, CircleCheck, TrendingUp, Search } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import trainerApi from "../trainerApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CHART_COLORS = ["#f97316", "#22c55e", "#38bdf8", "#a78bfa", "#f43f5e", "#eab308", "#14b8a6"];

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const axisOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: "#94a3b8", usePointStyle: true, boxWidth: 8 } },
    tooltip: { enabled: true },
  },
  scales: {
    x: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.12)" }, ticks: { color: "#94a3b8", precision: 0 } },
    y: { grid: { display: false }, ticks: { color: "#94a3b8" } },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: {
    legend: { position: "bottom", labels: { color: "#94a3b8", usePointStyle: true, padding: 18, boxWidth: 8 } },
  },
};

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

function calculateBmi(weight, height) {
  const weightKg = Number(weight);
  const heightCm = Number(height);
  if (!Number.isFinite(weightKg) || weightKg <= 0 || !Number.isFinite(heightCm) || heightCm <= 0) return null;
  return (weightKg / ((heightCm / 100) ** 2)).toFixed(1);
}

function MemberProfileModal({ member, onClose }) {
  if (!member) return null;
  const currentWeight = member.latest_weight ?? member.weight;
  const currentBmi = member.latest_bmi ?? calculateBmi(currentWeight, member.height);
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
  const currentWeight=member.latest_weight ?? member.weight, currentBmi=member.latest_bmi ?? calculateBmi(currentWeight, member.height);
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
  const [members,setMembers]=useState([]),[exercises,setExercises]=useState([]),[loading,setLoading]=useState(true),[profileMember,setProfileMember]=useState(null),[fetchError,setFetchError]=useState(""),[rosterSearch,setRosterSearch]=useState("");
  const fetchRoster=()=>trainerApi.get('/me/roster').then(r=>setMembers(r.data.data||[])).catch(err=>{console.error(err);setFetchError(err.response?.data?.message||"Couldn't refresh your roster analytics.");});
  useEffect(()=>{setLoading(true);Promise.all([trainerApi.get('/me/roster'),trainerApi.get('/me/exercises')]).then(([r,e])=>{setMembers(r.data.data||[]);setExercises(e.data.data||[])}).catch(err=>{console.error(err);setFetchError(err.response?.data?.message||"Couldn't load your trainer dashboard.")}).finally(()=>setLoading(false))},[]);
  const assignedTotal=members.reduce((total,member)=>total+Number(member.assigned_workouts||0),0);
  const completedTotal=members.reduce((total,member)=>total+Number(member.completed_workouts||0),0);
  const remainingTotal=Math.max(assignedTotal-completedTotal,0);
  const completionRate=assignedTotal?Math.round((completedTotal/assignedTotal)*100):0;
  const membersWithoutWorkouts=members.filter(member=>Number(member.assigned_workouts||0)===0).length;
  const query=rosterSearch.trim().toLowerCase();
  const filteredMembers=members.filter(member=>!query||`${member.first_name||""} ${member.last_name||""} ${member.email||""} ${member.fitness_goal||""}`.toLowerCase().includes(query));
  const goalCounts=members.reduce((counts,member)=>{const goal=member.fitness_goal?.trim()||"Not specified";counts[goal]=(counts[goal]||0)+1;return counts;},{});
  const goals=Object.entries(goalCounts).sort((a,b)=>b[1]-a[1]);
  const weeklyCounts=Object.fromEntries(DAYS.map(day=>[day,{assigned:0,completed:0}]));
  members.forEach(member=>(member.workouts_by_day||[]).forEach(item=>{
    let day=String(item.day||"").trim();
    const namedDay=DAYS.find(value=>value.toLowerCase()===day.toLowerCase());
    if(!namedDay&&/^\d{4}-\d{2}-\d{2}/.test(day)){
      const date=new Date(`${day.slice(0,10)}T00:00:00Z`);
      day=DAYS[(date.getUTCDay()+6)%7];
    }else{
      day=namedDay;
    }
    if(day&&weeklyCounts[day]){
      weeklyCounts[day].assigned+=Number(item.assigned||0);
      weeklyCounts[day].completed+=Number(item.completed||0);
    }
  }));
  const weeklyHasData=DAYS.some(day=>weeklyCounts[day].assigned>0);
  const workoutBreakdown={labels:["Completed","Remaining"],datasets:[{data:[completedTotal,remainingTotal],backgroundColor:["#22c55e","#f97316"],borderWidth:0}]};
  const goalBreakdown={labels:goals.map(([goal])=>goal),datasets:[{data:goals.map(([,count])=>count),backgroundColor:goals.map((_,index)=>CHART_COLORS[index%CHART_COLORS.length]),borderWidth:0}]};
  const memberProgress={labels:members.map(member=>`${member.first_name} ${member.last_name}`),datasets:[
    {label:"Completed",data:members.map(member=>Number(member.completed_workouts||0)),backgroundColor:"#22c55e",borderRadius:4},
    {label:"Remaining",data:members.map(member=>Math.max(Number(member.assigned_workouts||0)-Number(member.completed_workouts||0),0)),backgroundColor:"#f97316",borderRadius:4},
  ]};
  const weeklyActivity={labels:DAYS,datasets:[
    {label:"Assigned",data:DAYS.map(day=>weeklyCounts[day].assigned),backgroundColor:"#f97316",borderRadius:5},
    {label:"Completed",data:DAYS.map(day=>weeklyCounts[day].completed),backgroundColor:"#22c55e",borderRadius:5},
  ]};
  const barOptions={...axisOptions,scales:{...axisOptions.scales,x:{...axisOptions.scales.x,stacked:true},y:{...axisOptions.scales.y,stacked:true}}};
  const memberBarOptions={...barOptions,indexAxis:"y",scales:{x:{...axisOptions.scales.x,stacked:true},y:{...axisOptions.scales.y,stacked:true,ticks:{...axisOptions.scales.y.ticks,autoSkip:false}}}};
  const panelClass="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900";
  return <div className="space-y-6 px-4 py-6 sm:px-6 sm:py-8"><MemberProfileModal member={profileMember} onClose={()=>setProfileMember(null)}/>
    <header className="ave-page-hero rounded-3xl border border-orange-100 px-5 py-6 dark:border-white/5 sm:px-7 sm:py-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-400">Coach workspace</p>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl"><Users size={25} className="text-orange-500"/> My Roster</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">Review member goals and progress, check training considerations, and assign workouts to their schedules.</p>
    </header>
    {fetchError&&<div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{fetchError}</div>}
    <section aria-labelledby="trainer-analytics-heading" className="mb-8">
      <div className="mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-orange-500"/><h2 id="trainer-analytics-heading" className="text-base font-bold text-slate-900 dark:text-white">Workout analytics</h2></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { label: "Roster members", value: members.length, icon: Users },
          { label: "Workouts assigned", value: assignedTotal, icon: ClipboardList },
          { label: "Workouts completed", value: completedTotal, icon: CircleCheck },
          { label: "Completion rate", value: `${completionRate}%`, icon: TrendingUp },
          { label: "Members without workouts", value: membersWithoutWorkouts, icon: AlertTriangle },
        ].map(({ label, value, icon: Icon })=><div key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-slate-500">{label}</p><Icon size={16} className="text-orange-500"/></div><p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{loading?"—":value}</p></div>)}
      </div>
      {!loading&&members.length>0&&<div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className={panelClass}><h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Workout completion</h3><div className="relative h-64">{assignedTotal?<Doughnut data={workoutBreakdown} options={doughnutOptions}/>:<p className="flex h-full items-center justify-center text-sm text-slate-500">No workouts assigned yet.</p>}{assignedTotal>0&&<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-7"><span className="text-2xl font-bold text-slate-900 dark:text-white">{completionRate}%</span><span className="text-xs text-slate-500">completed</span></div>}</div></div>
        <div className={panelClass}><h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Member goals</h3><div className="relative h-64">{goals.length?<Doughnut data={goalBreakdown} options={doughnutOptions}/>:<p className="flex h-full items-center justify-center text-sm text-slate-500">No member goals recorded.</p>}</div></div>
        <div className={`${panelClass} xl:col-span-2`}><h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Workout completion by member</h3>{assignedTotal?<div className="h-72"><Bar data={memberProgress} options={memberBarOptions}/></div>:<p className="py-12 text-center text-sm text-slate-500">Assign workouts to members to compare completion.</p>}</div>
        <div className={`${panelClass} xl:col-span-2`}><h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Weekly workout schedule</h3>{weeklyHasData?<div className="h-64"><Bar data={weeklyActivity} options={barOptions}/></div>:<p className="py-12 text-center text-sm text-slate-500">No weekday workout schedule data yet.</p>}</div>
      </div>}
    </section>
    <section aria-labelledby="roster-members-heading">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 id="roster-members-heading" className="text-lg font-bold text-slate-900 dark:text-white">Your members</h2><p className="mt-1 text-xs text-slate-500">Select a member to review their schedule and assign a workout.</p></div>
        {!loading&&members.length>0&&<label className="flex min-h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-[#111] sm:max-w-xs"><Search size={16} className="text-slate-400"/><span className="sr-only">Search roster</span><input type="search" value={rosterSearch} onChange={event=>setRosterSearch(event.target.value)} placeholder="Search members..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 dark:text-white"/></label>}
      </div>
      {loading?<div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="h-20 animate-pulse rounded-2xl border border-orange-100 bg-white dark:border-white/5 dark:bg-[#111]"/>)}</div>:members.length===0?<div className="rounded-2xl border border-dashed border-orange-200 bg-white py-16 text-center dark:border-white/10 dark:bg-[#111]"><Users size={36} className="mx-auto mb-3 text-orange-500"/><p className="font-semibold text-slate-900 dark:text-white">No members assigned yet</p><p className="mt-1 text-sm text-slate-500">Members will appear here after the gym assigns them to you.</p></div>:filteredMembers.length===0?<div className="rounded-2xl border border-dashed border-orange-200 bg-white py-12 text-center dark:border-white/10 dark:bg-[#111]"><Search size={28} className="mx-auto mb-2 text-orange-500"/><p className="font-semibold text-slate-900 dark:text-white">No members match that search</p><button type="button" onClick={()=>setRosterSearch("")} className="mt-2 text-sm font-semibold text-orange-700 dark:text-orange-300">Clear search</button></div>:<div className="space-y-3">{filteredMembers.map(m=><MemberRow key={m.user_id} member={m} exercises={exercises} onChanged={fetchRoster} onViewProfile={setProfileMember}/>)}</div>}
    </section>
  </div>;
}
