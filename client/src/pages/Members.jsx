import { useEffect, useState } from "react";
import { Search, Eye, CheckCircle, XCircle, Plus, Trash2, X, UserRoundCog, UserRound, Save } from "lucide-react";
import api from "../services/api";

const statusColors = {
  Active: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  Inactive: "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400",
};

function getBMICategory(bmi) {
  if (!bmi) return { label: "N/A", color: "text-slate-400" };
  if (bmi < 18.5) return { label: "Underweight", color: "text-orange-500" };
  if (bmi < 25) return { label: "Normal", color: "text-green-600 dark:text-green-400" };
  if (bmi < 30) return { label: "Overweight", color: "text-orange-500" };
  return { label: "Obese", color: "text-red-500" };
}

function MemberPhoto({ member, large = false }) {
  const size = large ? "w-28 h-28 sm:w-36 sm:h-36" : "w-10 h-10";
  return (
    <div className={`${size} rounded-full overflow-hidden bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold shrink-0`}>
      {member.profile_image ? (
        <img src={member.profile_image} alt={member.full_name || "Member"} className="w-full h-full object-cover" />
      ) : (
        <span className={large ? "text-4xl" : "text-sm"}>{member.full_name?.charAt(0)?.toUpperCase() || "?"}</span>
      )}
    </div>
  );
}

function MemberModal({ member, onClose, onSave }) {
  const [form, setForm] = useState(member || { full_name: "", email: "", phone: "", gender: "", age: "", height: "", weight: "", fitness_goal: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.full_name || !form.email) return setError("Full name and email are required.");
    setSaving(true); setError("");
    try {
      if (member) await api.put(`/members/${member.member_id}`, { ...form, status: member.status });
      else await api.post("/members", form);
      await onSave(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save member.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-gray-800">
        <div className="p-6 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{member ? "Edit Member" : "Add New Member"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              {label:"Full Name *",key:"full_name",type:"text",span:true}, {label:"Email *",key:"email",type:"email",span:true},
              {label:"Phone",key:"phone",type:"text"}, {label:"Gender",key:"gender",type:"select",options:["","Male","Female"]},
              {label:"Age",key:"age",type:"number"}, {label:"Fitness Goal",key:"fitness_goal",type:"select",options:["","Weight Loss","Muscle Gain","General Fitness","Endurance"]},
              {label:"Height (cm)",key:"height",type:"number"}, {label:"Weight (kg)",key:"weight",type:"number"},
            ].map(f => <div key={f.key} className={f.span ? "col-span-2" : ""}>
              <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">{f.label}</label>
              {f.type === "select" ? <select value={form[f.key] || ""} onChange={e=>setForm({...form,[f.key]:e.target.value})} className="w-full border border-slate-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#111] text-slate-800 dark:text-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500">{f.options.map(o=><option key={o} value={o}>{o || "Select..."}</option>)}</select> : <input type={f.type} value={form[f.key] || ""} onChange={e=>setForm({...form,[f.key]:e.target.value})} className="w-full border border-slate-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#111] text-slate-800 dark:text-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500" />}
            </div>)}
          </div>
          {form.height && form.weight && <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">BMI: {(parseFloat(form.weight)/Math.pow(parseFloat(form.height)/100,2)).toFixed(1)} (auto-calculated)</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-gray-800 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 text-sm font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium disabled:opacity-50">{saving?"Saving...":member?"Save Changes":"Add Member"}</button>
        </div>
      </div>
    </div>
  );
}

function ViewModal({ member, trainers, onClose, onEdit, onAssign }) {
  const bmiInfo = getBMICategory(member.bmi);
  const [selectedTrainer, setSelectedTrainer] = useState(member.trainer_id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const assignedTrainer = trainers.find(t => Number(t.trainer_id) === Number(member.trainer_id));

  const saveCoach = async () => {
    setSaving(true); setError("");
    try { await onAssign(member, selectedTrainer || null); }
    catch (err) { setError(err.response?.data?.message || "Failed to update coach."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#151515] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[94vh] overflow-y-auto border border-slate-200 dark:border-gray-800" onClick={e=>e.stopPropagation()}>
        <div className="relative bg-slate-950 min-h-[280px] flex items-center justify-center overflow-hidden">
          {member.profile_image ? <>
            <img src={member.profile_image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-35" />
            <div className="absolute inset-0 bg-black/25" />
            <img src={member.profile_image} alt={member.full_name} className="relative z-10 max-w-full max-h-[420px] w-auto h-auto object-contain p-5" />
          </> : <MemberPhoto member={member} large />}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"><X size={20}/></button>
          <div className="absolute z-20 bottom-5 left-6 text-white">
            <p className="text-xs uppercase tracking-widest text-orange-300 font-bold">Member Profile</p>
            <h2 className="text-2xl sm:text-3xl font-bold">{member.full_name}</h2>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[{label:"Email",value:member.email},{label:"Email Verified",value:member.email_verified?"Yes":"No"},{label:"Phone",value:member.phone},{label:"Gender",value:member.gender},{label:"Age",value:member.age?`${member.age} yrs`:"—"},{label:"Height",value:member.height?`${member.height} cm`:"—"},{label:"Weight",value:member.weight?`${member.weight} kg`:"—"},{label:"Fitness Goal",value:member.fitness_goal},{label:"Status",value:member.status}].map(x=><div key={x.label} className="bg-slate-50 dark:bg-[#222] rounded-xl p-3"><p className="text-xs text-slate-400">{x.label}</p><p className="mt-1 font-semibold text-slate-700 dark:text-gray-200 break-words">{x.value || "—"}</p></div>)}
          </div>

          <div className="rounded-2xl bg-orange-50 dark:bg-orange-500/10 p-4 text-center">
            <p className="text-xs text-slate-400">BMI</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{member.bmi ? parseFloat(member.bmi).toFixed(1) : "—"}</p>
            <p className={`text-sm font-semibold ${bmiInfo.color}`}>{bmiInfo.label}</p>
          </div>

          <div className="rounded-2xl border border-orange-200 dark:border-orange-400/30 bg-white dark:bg-[#1b1b1b] p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4"><UserRoundCog size={20} className="text-orange-500"/> Designated Coach</h3>
            {assignedTrainer && <div className="mb-4 flex items-center gap-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 p-3">
              {assignedTrainer.photo_url ? <img src={assignedTrainer.photo_url} alt="" className="w-14 h-14 rounded-full object-contain bg-black"/> : <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-500"><UserRound/></div>}
              <div className="min-w-0"><p className="text-xs text-slate-500 dark:text-gray-400">Current Coach</p><p className="font-bold text-slate-800 dark:text-white truncate">{assignedTrainer.full_name}</p><p className="text-xs text-orange-600 dark:text-orange-400 truncate">{assignedTrainer.goal_specialty || "General Fitness"}</p></div>
            </div>}
            <select value={selectedTrainer} onChange={e=>setSelectedTrainer(e.target.value)} className="w-full border border-slate-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-[#111] text-slate-900 dark:text-white px-5 py-4 text-base font-medium outline-none focus:ring-2 focus:ring-orange-500 dark:[color-scheme:dark]">
              <option value="" className="bg-white text-gray-900 dark:bg-[#111] dark:text-white">No coach assigned</option>
              {trainers.filter(t=>!t.status || t.status === "Active").map(t=><option key={t.trainer_id} value={t.trainer_id} className="bg-white text-gray-900 dark:bg-[#111] dark:text-white">{t.full_name} — {t.goal_specialty || "General Fitness"}</option>)}
            </select>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <button onClick={saveCoach} disabled={saving || String(selectedTrainer || "") === String(member.trainer_id || "")} className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"><Save size={18}/>{saving?"Saving...":"Save Designated Coach"}</button>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 text-sm font-medium">Close</button>
          <button onClick={()=>{onClose();onEdit(member);}} className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium">Edit Member</button>
        </div>
      </div>
    </div>
  );
}

export default function Members() {
  const [members,setMembers]=useState([]), [trainers,setTrainers]=useState([]), [loading,setLoading]=useState(true), [fetchError,setFetchError]=useState(""), [search,setSearch]=useState(""), [filter,setFilter]=useState("All"), [showAddModal,setShowAddModal]=useState(false), [viewMember,setViewMember]=useState(null), [editMember,setEditMember]=useState(null);

  const fetchData = async () => {
    setLoading(true); setFetchError("");
    try {
      const [m,t] = await Promise.all([api.get("/members"), api.get("/trainers")]);

      // The API returns arrays directly. Also support { data: [...] } responses.
      const memberRows = Array.isArray(m.data) ? m.data : (m.data?.data || []);
      const trainerRows = Array.isArray(t.data) ? t.data : (t.data?.data || []);

      setMembers(memberRows);
      setTrainers(trainerRows);
    } catch (err) { console.error(err); setFetchError(err.response?.data?.message || err.message || "Couldn't load members."); }
    finally { setLoading(false); }
  };
  useEffect(()=>{fetchData();},[]);

  const handleApprove=async id=>{try{await api.put(`/members/${id}/approve`);await fetchData();}catch(e){alert(e.response?.data?.code==="EMAIL_NOT_VERIFIED"?(e.response.data.message||"This member has not verified their email yet."):(e.response?.data?.message||"Failed to approve member."));}};
  const handleReject=async id=>{try{await api.put(`/members/${id}/reject`);await fetchData();}catch(e){alert(e.response?.data?.message||"Failed to deactivate member.");}};
  const handleDelete=async id=>{if(!window.confirm("Delete this member permanently?"))return;try{await api.delete(`/members/${id}`);await fetchData();}catch(e){alert(e.response?.data?.message||"Failed to delete member.");}};
  const handleAssign=async(member,trainer_id)=>{
    await api.put(`/members/${member.member_id}/trainer`,{trainer_id});
    await fetchData();

    const response = await api.get("/members");
    const rows = Array.isArray(response.data)
      ? response.data
      : (response.data?.data || []);

    const updated = rows.find(
      m => Number(m.member_id) === Number(member.member_id)
    );

    if (updated) setViewMember(updated);
  };

  const filtered=members.filter(m=>{const q=search.toLowerCase();return (m.full_name?.toLowerCase().includes(q)||m.email?.toLowerCase().includes(q))&&(filter==="All"||String(m.status||"").trim().toLowerCase()===filter.toLowerCase());});

  return <div className="space-y-6">
    {showAddModal&&<MemberModal onClose={()=>setShowAddModal(false)} onSave={fetchData}/>} 
    {editMember&&<MemberModal member={editMember} onClose={()=>setEditMember(null)} onSave={fetchData}/>} 
    {viewMember&&<ViewModal member={viewMember} trainers={trainers} onClose={()=>setViewMember(null)} onEdit={m=>setEditMember(m)} onAssign={handleAssign}/>} 

    <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-slate-800 dark:text-white">Members</h1><p className="text-slate-500 dark:text-gray-400 mt-1">Manage all registered members and their designated coaches.</p></div><button onClick={()=>setShowAddModal(true)} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition"><Plus size={18}/>Add Member</button></div>
    {fetchError&&<div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">⚠️ {fetchError}</div>}
    <div className="bg-white dark:bg-[#171717] border border-transparent dark:border-gray-800 rounded-2xl shadow-md dark:shadow-none p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"><div className="flex items-center bg-slate-100 dark:bg-[#222] rounded-lg px-3 py-2 w-full sm:w-72"><Search size={16} className="text-gray-400"/><input type="text" placeholder="Search members..." value={search} onChange={e=>setSearch(e.target.value)} className="bg-transparent outline-none ml-2 w-full text-sm text-slate-800 dark:text-white placeholder:text-gray-400"/></div><div className="flex gap-2 flex-wrap">{["All","Active","Pending","Inactive"].map(s=><button key={s} onClick={()=>setFilter(s)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${filter===s?"bg-orange-600 text-white":"bg-slate-100 dark:bg-[#222] text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700"}`}>{s}</button>)}</div></div>
    <div className="bg-white dark:bg-[#171717] border border-transparent dark:border-gray-800 rounded-2xl shadow-md dark:shadow-none overflow-hidden">
      {loading?<div className="p-8 space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-10 bg-slate-100 dark:bg-gray-800 rounded-lg animate-pulse"/>)}</div>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 dark:bg-[#202020] border-b border-slate-200 dark:border-gray-800"><tr>{["Member","Goal","Designated Coach","BMI","Status","Joined","Actions"].map(h=><th key={h} className="text-left px-6 py-4 font-semibold text-slate-600 dark:text-gray-300">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-gray-800">{filtered.length===0?<tr><td colSpan={7} className="text-center py-12 text-slate-400">No members found.</td></tr>:filtered.map(member=>{const bmiInfo=getBMICategory(member.bmi);return <tr key={member.member_id} onClick={()=>setViewMember(member)} className="hover:bg-slate-50 dark:hover:bg-[#202020] transition cursor-pointer"><td className="px-6 py-4"><div className="flex items-center gap-3"><MemberPhoto member={member}/><div><p className="font-semibold text-slate-800 dark:text-white">{member.full_name}</p><p className="text-slate-400 text-xs">{member.email}</p><p className={`mt-0.5 text-[11px] font-semibold ${member.email_verified?"text-green-500":"text-orange-500"}`}>{member.email_verified?"✓ Email verified":"⚠ Email not verified"}</p></div></div></td><td className="px-6 py-4 text-slate-600 dark:text-gray-300">{member.fitness_goal||"—"}</td><td className="px-6 py-4">{member.trainer_id?<div className="flex items-center gap-2 text-slate-700 dark:text-gray-200">{member.trainer_photo_url?<img src={member.trainer_photo_url} alt="" className="w-8 h-8 rounded-full object-contain bg-black"/>:<div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center text-orange-500 text-xs font-bold">{member.trainer_name?.charAt(0)||"?"}</div>}<span>{member.trainer_name||"Assigned Coach"}</span></div>:<span className="text-slate-400">Not assigned</span>}</td><td className="px-6 py-4"><span className="font-semibold text-slate-800 dark:text-white">{member.bmi?parseFloat(member.bmi).toFixed(1):"—"}</span><span className={`ml-2 text-xs font-medium ${bmiInfo.color}`}>{bmiInfo.label}</span></td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[member.status]||statusColors.Inactive}`}>{member.status||"Inactive"}</span></td><td className="px-6 py-4 text-slate-500 dark:text-gray-400">{member.joined_date?new Date(member.joined_date).toLocaleDateString():"—"}</td><td className="px-6 py-4" onClick={e=>e.stopPropagation()}><div className="flex items-center gap-2"><button onClick={()=>setViewMember(member)} className="p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 text-orange-500 transition" title="View member / change coach"><UserRoundCog size={16}/></button>{member.status?.trim().toLowerCase()==="pending"&&<><button onClick={()=>handleApprove(member.member_id)} disabled={!member.email_verified} className={`p-1.5 rounded-lg transition ${member.email_verified?"hover:bg-green-50 dark:hover:bg-green-500/10 text-green-500":"text-slate-300 dark:text-gray-600 cursor-not-allowed"}`} title={member.email_verified?"Approve":"Cannot approve until the member verifies their email"}><CheckCircle size={16}/></button><button onClick={()=>handleReject(member.member_id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 transition" title="Reject"><XCircle size={16}/></button></>}<button onClick={()=>handleDelete(member.member_id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 transition" title="Delete"><Trash2 size={16}/></button></div></td></tr>})}</tbody></table></div>}
      <div className="px-6 py-3 border-t border-slate-100 dark:border-gray-800 text-sm text-slate-400">Showing {filtered.length} of {members.length} registered members</div>
    </div>
  </div>;
}
