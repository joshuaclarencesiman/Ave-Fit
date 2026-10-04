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
  "barbell bench press": "bench-press",
  "incline barbell bench press": "incline-bench-press",
  "decline barbell bench press": "decline-bench-press",
  "dumbbell flyes": "dumbbell-fly",
  "incline dumbbell flyes": "dumbbell-fly",
  "cable crossover": "cable-fly",
  "chest fly": "dumbbell-fly",
  "low to high cable fly": "incline-cable-fly",
  "chest press machine": "machine-chest-press",
  "pec deck machine": "pec-deck",
  "weighted dips chest focus": "weighted-dip",
  "barbell bent over row": "barbell-row",
  "bent over row": "barbell-row",
  "close grip row": "seated-row",
  "dumbbell single arm row": "one-arm-dumbbell-row",
  "assisted pull up machine": "assisted-pull-up",
  hyperextension: "back-extension",
  "barbell overhead press": "overhead-press",
  "military press": "overhead-press",
  "seated dumbbell shoulder press": "seated-dumbbell-press",
  "smith machine shoulder press": "machine-shoulder-press",
  "dumbbell lateral raise": "lateral-raise",
  "cable face pull": "face-pull",
  "barbell curl": "bicep-curl",
  "dumbbell curl": "bicep-curl",
  "overhead cable curl": "cable-curl",
  "machine bicep curl": "preacher-curl",
  "cable rope hammer curl": "rope-hammer-curl",
  "triceps pushdown": "tricep-pushdown",
  "overhead cable triceps extension": "overhead-tricep-extension",
  "dumbbell overhead triceps extension": "dumbbell-overhead-tricep-extension",
  "dips triceps focus": "dip",
  "machine triceps extension": "tricep-pushdown",
  "single arm pushdown": "tricep-pushdown",
  "rope pushdown": "rope-tricep-pushdown",
  kickback: "tricep-kickback",
  "barbell back squat": "squat",
  squats: "squat",
  "barbell front squat": "front-squat",
  "barbell hip thrust": "hip-thrust",
  "cable glute kickback": "cable-kickback",
  "glute bridge machine": "glute-bridge",
  "cable woodchopper": "cable-woodchop",
  "wood chop": "cable-woodchop",
  "weighted plank": "plank",
  "landmine rotation": "cable-woodchop",
  "decline bench sit up": "decline-sit-up",
  "treadmill running": "running",
  "treadmill run": "running",
  "stationary bike": "cycling",
  "rowing machine": "rowing",
  "elliptical trainer": "elliptical",
  "assault bike intervals": "assault-bike",
  "barbell clean and press": "push-press",
  "clean and press": "push-press",
  "kettlebell goblet squat": "goblet-squat",
  "barbell thruster": "push-press",
  "dumbbell thruster": "push-press",
  "trx row": "inverted-row",
  "trx chest press": "push-up",
  "medicine ball slam": "battle-ropes",
  "battle rope waves": "battle-ropes",
  "burpees": "burpee",
  "box jump": "jump-squat",
  "battle rope slam": "battle-ropes",
  "smith machine deadlift": "deadlift",
  "smith bench press": "smith-machine-bench-press",
  "smith squat": "smith-machine-squat",
  "barbell push press": "push-press",
  "sled push": "leg-press",
  "sled pull": "seated-row",
  "kettlebell clean": "kettlebell-swing",
  "kettlebell snatch": "kettlebell-swing",
  "dip machine": "dip",
  dips: "dip",
  "farmer's carry": "farmer-carry",
  "farmer s carry": "farmer-carry",
  "farmers carry": "farmer-carry",
  "mountain climbers": "mountain-climber",
  shrug: "shrug",
  thruster: "push-press",
  "wide grip pulldown": "wide-grip-lat-pulldown",
  "yoga stretch": "cat-cow-stretch",
  "push ups": "push-up",
  "push up": "push-up",
  "bodyweight squat": "bodyweight-squat",
  "bodyweight squats": "bodyweight-squat",
  "air squat": "bodyweight-squat",
  "air squats": "bodyweight-squat",
  "dumbbell shoulder press": "seated-dumbbell-press",
  "shoulder press": "overhead-press",
  "pull ups": "pull-up",
  "pull up": "pull-up",
  "chin ups": "chin-up",
  "chin up": "chin-up",
  "ab machine crunch": "weighted-crunch",
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
