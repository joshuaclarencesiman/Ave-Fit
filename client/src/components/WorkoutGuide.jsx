import { useEffect, useMemo, useState } from "react";
import { Dumbbell, ShieldCheck, Play, Pause, RotateCcw } from "lucide-react";
import { getWorkoutGuideAssetUrl } from "../utils/workoutGuide";

const FRAME_DURATION_MS = 1200;

export default function WorkoutGuide({ exerciseName, compact = false }) {
  const matched = typeof exerciseName === "object" ? exerciseName : null;
  const frames = useMemo(() => matched?.frames || [], [matched]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    setCurrentFrame(0);
    setPlaying(true);
  }, [matched?.slug]);

  useEffect(() => {
    if (compact || !playing || frames.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setCurrentFrame((index) => (index + 1) % frames.length);
    }, FRAME_DURATION_MS);
    return () => window.clearInterval(timer);
  }, [compact, playing, frames.length]);

  if (!matched || !frames.length) return null;

  const frame = frames[currentFrame] || frames[0];
  const frameUrl = getWorkoutGuideAssetUrl(matched, frame.index);

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {!compact && (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Dumbbell size={16} className="text-orange-500" />
              Workout Guide
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Animated movement guide — the illustrated positions change automatically.
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <ShieldCheck size={12} /> Guide
          </span>
        </div>
      )}

      {compact ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
          <img
            src={frameUrl}
            alt={`${matched.name}, workout guide`}
            className="w-full aspect-square object-contain brightness-0 opacity-60"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
            <img
              src={frameUrl}
              alt={`${matched.name}, movement frame ${frame.index}`}
              className="w-full aspect-[4/3] object-contain p-4 brightness-0 opacity-65 transition-opacity duration-300"
            />

            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${playing ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
              {playing ? "Playing" : "Paused"}
            </div>

            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentFrame(0)}
                aria-label="Restart workout guide"
                className="w-9 h-9 rounded-full bg-white/95 text-slate-700 shadow-sm flex items-center justify-center hover:bg-white transition"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                aria-label={playing ? "Pause workout guide" : "Play workout guide"}
                className="w-10 h-10 rounded-full bg-slate-900 text-white shadow-sm flex items-center justify-center hover:bg-slate-800 transition"
              >
                {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {frames.map((item, index) => (
              <button
                key={item.index}
                type="button"
                onClick={() => {
                  setCurrentFrame(index);
                  setPlaying(false);
                }}
                aria-label={`Show movement frame ${item.index}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentFrame ? "w-8 bg-orange-500" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

          <p className="text-center text-[11px] text-slate-400">
            Frame {frame.index} of {frames.length} · {playing ? "Auto-playing every 1.2 seconds" : "Paused — press play to continue"}
          </p>
        </div>
      )}

      {!compact && (
        <p className="text-[11px] leading-relaxed text-slate-400">
          Artwork by {matched.attribution.creator}, licensed under {matched.attribution.license}.
        </p>
      )}
    </div>
  );
}
