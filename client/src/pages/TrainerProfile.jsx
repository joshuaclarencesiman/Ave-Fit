import { useEffect, useRef, useState } from "react";
import { User, Camera, Mail, Phone, Award, BadgeCheck } from "lucide-react";
import { useTrainerAuth } from "../context/TrainerAuthContext";
import trainerApi from "../trainerApi";
import { fileToCompressedDataUrl } from "../utils/imageUpload";

export default function TrainerProfile() {
  const { trainer, loginTrainer, token } = useTrainerAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    trainerApi.get("/me/profile")
      .then((res) => {
        if (!active) return;
        setProfile(res.data.data);
        setPhoto(res.data.data.photo_url || null);
      })
      .catch((err) => {
        console.error("Failed to load trainer profile:", err);
        if (active) setLoadError(err.response?.data?.message || "Unable to load your profile. Please try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setMsg("");
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      await trainerApi.put("/me/photo", { photo_url: dataUrl });
      setPhoto(dataUrl);
      loginTrainer({ ...trainer, photo_url: dataUrl }, token);
      setMsg("Photo updated!");
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
      setTimeout(() => setMsg(""), 3000);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-8 sm:px-6" aria-label="Loading trainer profile">
        <div className="h-28 animate-pulse rounded-3xl bg-white dark:bg-[#111]" />
        <div className="h-52 animate-pulse rounded-2xl bg-white dark:bg-[#111]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <header className="ave-page-hero rounded-3xl border border-orange-100 px-5 py-6 dark:border-white/5 sm:px-7 sm:py-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-400">Coach workspace</p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl"><User size={24} className="text-orange-500" /> My Profile</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Manage the photo and public details members see when browsing coaches.</p>
      </header>

      {loadError && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">{loadError}</p>}
      {msg && <p role="status" className={`rounded-xl border px-4 py-3 text-sm font-medium ${/failed|unable|error/i.test(msg) ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300" : "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"}`}>{msg}</p>}

      <section className="trainer-card overflow-hidden rounded-3xl border">
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Public coach profile</h2>
          <p className="mt-1 text-xs text-slate-500">Your name and contact details are managed by the gym administrator.</p>
        </div>
        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:p-7">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingPhoto}
          aria-label={uploadingPhoto ? "Uploading coach photo" : "Change coach profile photo"}
          className="group relative h-24 w-24 shrink-0 self-center rounded-full ring-4 ring-orange-100 transition hover:ring-orange-300 focus-visible:outline-none focus-visible:ring-orange-400 disabled:opacity-70 sm:self-start dark:ring-white/10"
        >
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-orange-500">
            {photo ? (
              <img src={photo} alt={profile?.full_name} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-white" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white shadow dark:border-[#111] dark:bg-[#222]">
            {uploadingPhoto ? (
              <div className="w-3.5 h-3.5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera size={14} className="text-slate-700" />
            )}
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" aria-label="Choose coach profile photo" />

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{profile?.full_name || trainer?.full_name || "Coach"}</h2>
            {profile?.status && <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-800 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300"><BadgeCheck size={13}/>{profile.status}</span>}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">{(profile?.specializations || []).length ? profile.specializations.map((item) => <span key={item} className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">{item}</span>) : <span className="text-sm font-medium text-slate-500">Fitness Coach</span>}</div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <p className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 dark:bg-white/[0.04] dark:text-slate-300 sm:justify-start"><Mail size={15} className="shrink-0 text-orange-500" /><span className="truncate">{profile?.email || trainer?.email || "Email not listed"}</span></p>
            {profile?.phone && <p className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 dark:bg-white/[0.04] dark:text-slate-300 sm:justify-start"><Phone size={15} className="shrink-0 text-orange-500" />{profile.phone}</p>}
            {profile?.goal_specialty && <p className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 dark:bg-white/[0.04] dark:text-slate-300 sm:col-span-2 sm:justify-start"><Award size={15} className="shrink-0 text-orange-500" />Recommended for: {profile.goal_specialty}</p>}
          </div>
        </div>
        </div>
      </section>

      <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-600 dark:border-white/10 dark:bg-[#111] dark:text-slate-400">To update your name, email, phone number, or specializations, please contact the gym administrator.</p>
    </div>
  );
}
