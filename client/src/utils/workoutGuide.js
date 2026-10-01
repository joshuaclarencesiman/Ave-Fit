import guideManifest from "../data/workoutGuideManifest.json";

const normalize = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

// Database names can differ slightly from the repository catalog.
const aliases = {
  "push ups": "push-up",
  "push up": "push-up",
  "bodyweight squat": "bodyweight-squat",
  "bodyweight squats": "bodyweight-squat",
  "air squat": "bodyweight-squat",
  "air squats": "bodyweight-squat",
  "dumbbell shoulder press": "dumbbell seated shoulder press",
  "shoulder press": "overhead press",
  "pull ups": "pull-up",
  "pull up": "pull-up",
  "chin ups": "chin-up",
  "chin up": "chin-up",
};

const byName = new Map(guideManifest.map((exercise) => [normalize(exercise.name), exercise]));
const bySlug = new Map(guideManifest.map((exercise) => [exercise.slug, exercise]));

export function getWorkoutGuideExercise(nameOrSlug = "") {
  const key = normalize(nameOrSlug);
  return byName.get(key) || bySlug.get(key) || bySlug.get(aliases[key]) || null;
}

export function getWorkoutGuideAssetUrl(exercise, frameIndex = 2) {
  if (!exercise) return null;
  const frame = exercise.frames?.find((item) => item.index === frameIndex);
  return frame ? `/workout-guide/${frame.path}` : null;
}

export { guideManifest };
