import { useEffect, useRef, useState } from "react";
import { User, Camera, Mail, Phone, Award } from "lucide-react";
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

  useEffect(() => {
    trainerApi.get("/me/profile")
      .then((res) => {
        setProfile(res.data.data);
        setPhoto(res.data.data.photo_url || null);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
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
      setMsg(err.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
      setTimeout(() => setMsg(""), 3000);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-8">
        <div className="h-40 bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
        <User size={24} className="text-orange-400" /> My Profile
      </h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">
        This is what members see when choosing a coach.
      </p>

      <div className="trainer-card border rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingPhoto}
          className="relative w-24 h-24 rounded-full disabled:opacity-70 shrink-0"
        >
          <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center overflow-hidden">
            {photo ? (
              <img src={photo} alt={profile?.full_name} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-white" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">
            {uploadingPhoto ? (
              <div className="w-3.5 h-3.5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera size={14} className="text-slate-700" />
            )}
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile?.full_name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">{(profile?.specializations || []).length ? profile.specializations.map((item) => <span key={item} className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold">{item}</span>) : <span className="text-orange-400 text-sm font-medium">Fitness Coach</span>}</div>
          {msg && <p className="text-xs font-medium text-orange-400 mt-2">{msg}</p>}

          <div className="mt-4 space-y-1.5 text-sm text-slate-400">
            <p className="flex items-center gap-2 justify-center sm:justify-start"><Mail size={14} /> {profile?.email}</p>
            {profile?.phone && <p className="flex items-center gap-2 justify-center sm:justify-start"><Phone size={14} /> {profile.phone}</p>}
            {profile?.goal_specialty && <p className="flex items-center gap-2 justify-center sm:justify-start"><Award size={14} /> Recommended for: {profile.goal_specialty}</p>}
          </div>
        </div>
      </div>

      <p className="text-slate-600 text-xs mt-4">
        To change your name, email, phone, or specializations, ask the gym admin to update them from the Trainers page.
      </p>
    </div>
  );
}
