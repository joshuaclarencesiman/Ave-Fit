-- ============================================================
-- AVEFIT Capstone — Exercise Movement Tutorials (3-step)
-- Run this once against your PostgreSQL database (after 001-003).
-- Safe to re-run.
-- ============================================================

BEGIN;

-- Each exercise can now store a 3-phase movement tutorial as JSON:
-- [ {"title": "Starting Position", "description": "..."},
--   {"title": "Movement", "description": "..."},
--   {"title": "Finish", "description": "..."} ]
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS movement_steps JSONB;

-- Sample tutorials for a set of common exercises across categories,
-- so the feature has real content to show right away. Add more anytime
-- from Admin > Exercises > Edit.
UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Lie flat on a bench with feet planted on the floor. Grip the bar slightly wider than shoulder-width and unrack it over your chest."},
  {"title": "Movement", "description": "Lower the bar slowly to your mid-chest, keeping elbows at about a 45-degree angle from your body."},
  {"title": "Finish", "description": "Press the bar back up to full arm extension without locking out aggressively, then repeat."}
]'::jsonb WHERE exercise_name = 'Barbell Bench Press' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Stand with feet shoulder-width apart, bar resting on your upper back and shoulders, core braced."},
  {"title": "Movement", "description": "Bend your knees and hips to lower into a squat, keeping your chest up and knees tracking over your toes."},
  {"title": "Finish", "description": "Drive through your heels to stand back up to the starting position, squeezing your glutes at the top."}
]'::jsonb WHERE exercise_name = 'Barbell Back Squat' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Stand with feet hip-width apart, barbell over mid-foot, and grip just outside your shins."},
  {"title": "Movement", "description": "Hinge at the hips and bend your knees to grip the bar, keeping your back flat, then drive through your legs to lift."},
  {"title": "Finish", "description": "Stand fully upright with shoulders back, then reverse the motion under control to lower the bar back down."}
]'::jsonb WHERE exercise_name = 'Deadlift' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Hang from the pull-up bar with an overhand grip, hands slightly wider than shoulder-width, arms fully extended."},
  {"title": "Movement", "description": "Pull your body upward by driving your elbows down and back until your chin clears the bar."},
  {"title": "Finish", "description": "Lower yourself back down under control to a full hang before starting the next rep."}
]'::jsonb WHERE exercise_name = 'Pull-Up' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Stand tall holding a barbell at shoulder height, hands just outside shoulder-width, core braced."},
  {"title": "Movement", "description": "Press the bar straight overhead by extending your arms, moving your head slightly back to let the bar pass."},
  {"title": "Finish", "description": "Lock out fully overhead with the bar over your mid-foot, then lower back to the shoulders with control."}
]'::jsonb WHERE exercise_name = 'Barbell Overhead Press' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Sit on the leg press machine with feet shoulder-width apart on the platform, knees at about 90 degrees."},
  {"title": "Movement", "description": "Release the safety and lower the platform by bending your knees toward your chest, staying controlled."},
  {"title": "Finish", "description": "Press through your heels to extend your legs back to the starting position without fully locking your knees."}
]'::jsonb WHERE exercise_name = 'Leg Press' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Stand or sit holding a dumbbell in each hand at shoulder height, palms facing forward."},
  {"title": "Movement", "description": "Press both dumbbells straight overhead until your arms are fully extended."},
  {"title": "Finish", "description": "Lower the dumbbells back down to shoulder height with control, keeping your core tight throughout."}
]'::jsonb WHERE exercise_name = 'Seated Dumbbell Shoulder Press' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Sit at the lat pulldown machine, grip the bar wider than shoulder-width, and secure your thighs under the pad."},
  {"title": "Movement", "description": "Pull the bar down toward your upper chest by driving your elbows down and back, squeezing your lats."},
  {"title": "Finish", "description": "Slowly extend your arms back up to the starting position, keeping the movement controlled."}
]'::jsonb WHERE exercise_name = 'Lat Pulldown' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Stand holding a barbell with an underhand grip, hands shoulder-width apart, arms extended down."},
  {"title": "Movement", "description": "Curl the bar upward by bending your elbows, keeping your upper arms pinned to your sides."},
  {"title": "Finish", "description": "Squeeze at the top, then lower the bar back down under control to full extension."}
]'::jsonb WHERE exercise_name = 'Barbell Curl' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Stand tall holding the rope or bar attachment on a cable machine, elbows tucked at your sides."},
  {"title": "Movement", "description": "Extend your forearms downward by straightening your elbows, keeping your upper arms still."},
  {"title": "Finish", "description": "Pause briefly at full extension, then let the weight return slowly to the starting position."}
]'::jsonb WHERE exercise_name = 'Triceps Pushdown' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Stand upright holding a kettlebell with both hands in front of your hips, feet shoulder-width apart."},
  {"title": "Movement", "description": "Hinge at the hips to swing the kettlebell back between your legs, then drive your hips forward explosively."},
  {"title": "Finish", "description": "Let the kettlebell rise to chest height from the hip drive, then control it back down into the next swing."}
]'::jsonb WHERE exercise_name = 'Kettlebell Swing' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Sit on the rowing machine, strap your feet in, and grip the handle with knees bent, arms extended."},
  {"title": "Movement", "description": "Push through your legs first, then lean back slightly and pull the handle toward your lower ribs."},
  {"title": "Finish", "description": "Reverse the motion smoothly — extend arms, lean forward, then bend your knees to slide back to the start."}
]'::jsonb WHERE exercise_name = 'Rowing Machine' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Set the treadmill to a comfortable pace and stand tall with a light grip or no grip on the handles."},
  {"title": "Movement", "description": "Maintain an upright posture, land midfoot, and keep a steady rhythm as you run or walk."},
  {"title": "Finish", "description": "Gradually slow the belt down for a cool-down period rather than stopping abruptly."}
]'::jsonb WHERE exercise_name = 'Treadmill Running' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Stand with feet hip-width apart, dumbbells at your sides or a barbell across your upper back."},
  {"title": "Movement", "description": "Step forward with one leg and lower your hips until both knees are bent at about 90 degrees."},
  {"title": "Finish", "description": "Push off your front foot to return to standing, then repeat by stepping forward with the other leg."}
]'::jsonb WHERE exercise_name = 'Walking Lunge' AND movement_steps IS NULL;

UPDATE exercises SET movement_steps = '[
  {"title": "Starting Position", "description": "Hang from a pull-up bar with your legs straight and core engaged, hands shoulder-width apart."},
  {"title": "Movement", "description": "Raise your legs upward by flexing your hips and abs, keeping the movement controlled rather than swinging."},
  {"title": "Finish", "description": "Lower your legs back down slowly to the hanging position without letting momentum take over."}
]'::jsonb WHERE exercise_name = 'Hanging Leg Raise' AND movement_steps IS NULL;

COMMIT;
