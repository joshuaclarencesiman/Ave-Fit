-- ============================================================
-- AVEFIT Capstone Upgrade Migration
-- Run this once against your PostgreSQL database.
-- Safe to re-run (idempotent) except the exercise DELETE/INSERT
-- section, which is guarded with NOT EXISTS checks.
-- ============================================================

BEGIN;

-- 1) USERS: onboarding + setup fields --------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_weight NUMERIC(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS workout_days_per_week INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS workout_duration INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_days TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS intensity INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS injuries TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS health_conditions TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS trainer_id INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_trainer_id_fkey'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_trainer_id_fkey
      FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2) TRAINERS: profile picture + recommended-goal tag -----------
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS goal_specialty VARCHAR(30);
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS bio TEXT;

-- Tag any existing trainers so the recommendation logic has something to match.
-- Edit these UPDATEs (or do it in the admin Trainers page) to fit your real coaches.
UPDATE trainers SET goal_specialty = 'Weight Loss'
  WHERE goal_specialty IS NULL AND specialization ILIKE '%weight%loss%';
UPDATE trainers SET goal_specialty = 'Muscle Gain'
  WHERE goal_specialty IS NULL AND (specialization ILIKE '%strength%' OR specialization ILIKE '%muscle%' OR specialization ILIKE '%bodybuilding%');
UPDATE trainers SET goal_specialty = 'Maintain Weight'
  WHERE goal_specialty IS NULL AND (specialization ILIKE '%general%' OR specialization ILIKE '%wellness%');
UPDATE trainers SET goal_specialty = 'General Fitness'
  WHERE goal_specialty IS NULL;

-- 3) EXERCISE CATEGORIES: gym-only category list ----------------
INSERT INTO exercise_categories (category_name) SELECT 'Back' WHERE NOT EXISTS (SELECT 1 FROM exercise_categories WHERE category_name = 'Back');
INSERT INTO exercise_categories (category_name) SELECT 'Biceps' WHERE NOT EXISTS (SELECT 1 FROM exercise_categories WHERE category_name = 'Biceps');
INSERT INTO exercise_categories (category_name) SELECT 'Cardio' WHERE NOT EXISTS (SELECT 1 FROM exercise_categories WHERE category_name = 'Cardio');
INSERT INTO exercise_categories (category_name) SELECT 'Chest' WHERE NOT EXISTS (SELECT 1 FROM exercise_categories WHERE category_name = 'Chest');
INSERT INTO exercise_categories (category_name) SELECT 'Core' WHERE NOT EXISTS (SELECT 1 FROM exercise_categories WHERE category_name = 'Core');
INSERT INTO exercise_categories (category_name) SELECT 'Full Body & Functional' WHERE NOT EXISTS (SELECT 1 FROM exercise_categories WHERE category_name = 'Full Body & Functional');
INSERT INTO exercise_categories (category_name) SELECT 'Glutes' WHERE NOT EXISTS (SELECT 1 FROM exercise_categories WHERE category_name = 'Glutes');
INSERT INTO exercise_categories (category_name) SELECT 'Legs' WHERE NOT EXISTS (SELECT 1 FROM exercise_categories WHERE category_name = 'Legs');
INSERT INTO exercise_categories (category_name) SELECT 'Shoulders' WHERE NOT EXISTS (SELECT 1 FROM exercise_categories WHERE category_name = 'Shoulders');
INSERT INTO exercise_categories (category_name) SELECT 'Triceps' WHERE NOT EXISTS (SELECT 1 FROM exercise_categories WHERE category_name = 'Triceps');

-- 4) EXERCISES: remove any home/no-equipment workouts -----------
-- Only removes exercises that are NOT referenced by an existing
-- workout_session, so nobody's history breaks.
DELETE FROM exercises e
WHERE NOT EXISTS (SELECT 1 FROM workout_sessions ws WHERE ws.exercise_id = e.exercise_id)
  AND (
    e.equipment IS NULL
    OR e.equipment IN ('None', 'Bodyweight', 'No Equipment', 'Home', 'Yoga Mat')
    OR e.equipment ILIKE '%home%'
    OR EXISTS (
      SELECT 1 FROM exercise_categories c
      WHERE c.category_id = e.category_id AND c.category_name ILIKE '%home%'
    )
  );

-- 5) EXERCISES: seed 100+ gym-only exercises ---------------------
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Barbell Bench Press', c.category_id, 'Chest', 'Intermediate', 8, 'Classic horizontal press on a flat bench for overall chest mass.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Barbell Bench Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Incline Barbell Bench Press', c.category_id, 'Chest', 'Intermediate', 8, 'Targets the upper chest with an inclined bench angle.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Incline Barbell Bench Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Decline Barbell Bench Press', c.category_id, 'Chest', 'Intermediate', 8, 'Emphasizes the lower chest using a declined bench.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Decline Barbell Bench Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Dumbbell Bench Press', c.category_id, 'Chest', 'Beginner', 7, 'Flat dumbbell press allowing a deeper range of motion.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Dumbbell Bench Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Incline Dumbbell Press', c.category_id, 'Chest', 'Intermediate', 7, 'Upper chest focused press using dumbbells on an incline bench.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Incline Dumbbell Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Decline Dumbbell Press', c.category_id, 'Chest', 'Intermediate', 7, 'Lower chest press variation using dumbbells on a decline bench.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Decline Dumbbell Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Dumbbell Flyes', c.category_id, 'Chest', 'Beginner', 6, 'Isolation move that stretches and squeezes the chest.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Dumbbell Flyes');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Incline Dumbbell Flyes', c.category_id, 'Chest', 'Intermediate', 6, 'Fly variation targeting the upper chest fibers.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Incline Dumbbell Flyes');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Cable Crossover', c.category_id, 'Chest', 'Intermediate', 6, 'Constant-tension cable movement for chest definition.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Cable Crossover');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Low-to-High Cable Fly', c.category_id, 'Chest', 'Intermediate', 6, 'Cable fly angled upward to hit the upper chest.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Low-to-High Cable Fly');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Chest Press Machine', c.category_id, 'Chest', 'Beginner', 6, 'Guided machine press ideal for building base strength safely.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Chest Press Machine');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Pec Deck Machine', c.category_id, 'Chest', 'Beginner', 5, 'Machine isolation move for the inner and outer chest.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Pec Deck Machine');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Smith Machine Bench Press', c.category_id, 'Chest', 'Beginner', 7, 'Fixed-bar press for controlled chest pressing.', 'Smith Machine'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Smith Machine Bench Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Weighted Dips (Chest Focus)', c.category_id, 'Chest', 'Advanced', 9, 'Leaning-forward dips that emphasize the lower chest.', 'Dip Station'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Weighted Dips (Chest Focus)');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Landmine Press', c.category_id, 'Chest', 'Intermediate', 7, 'Angled pressing movement that''s shoulder-friendly for chest work.', 'Landmine Attachment'
FROM exercise_categories c WHERE c.category_name = 'Chest'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Landmine Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Deadlift', c.category_id, 'Back', 'Advanced', 9, 'Full posterior chain lift and a cornerstone of back strength.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Deadlift');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Barbell Bent-Over Row', c.category_id, 'Back', 'Intermediate', 8, 'Horizontal pulling movement for back thickness.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Barbell Bent-Over Row');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Pendlay Row', c.category_id, 'Back', 'Advanced', 8, 'Explosive row that starts from a dead stop on the floor.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Pendlay Row');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'T-Bar Row', c.category_id, 'Back', 'Intermediate', 8, 'Chest-supported row that builds mid-back thickness.', 'T-Bar Row Machine'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'T-Bar Row');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Dumbbell Single-Arm Row', c.category_id, 'Back', 'Beginner', 7, 'Unilateral row for balanced back development.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Dumbbell Single-Arm Row');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Seated Cable Row', c.category_id, 'Back', 'Beginner', 6, 'Cable row that keeps constant tension on the back.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Seated Cable Row');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Lat Pulldown', c.category_id, 'Back', 'Beginner', 6, 'Vertical pulling movement that builds lat width.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Lat Pulldown');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Close-Grip Lat Pulldown', c.category_id, 'Back', 'Beginner', 6, 'Narrow-grip pulldown emphasizing the lower lats.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Close-Grip Lat Pulldown');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Pull-Up', c.category_id, 'Back', 'Advanced', 9, 'Bodyweight vertical pull performed on the gym pull-up rig.', 'Pull-Up Bar'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Pull-Up');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Chin-Up', c.category_id, 'Back', 'Intermediate', 9, 'Underhand pull-up variant that adds biceps involvement.', 'Pull-Up Bar'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Chin-Up');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Assisted Pull-Up Machine', c.category_id, 'Back', 'Beginner', 6, 'Machine-assisted pull-up for building toward full reps.', 'Assisted Pull-Up Machine'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Assisted Pull-Up Machine');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Machine Row', c.category_id, 'Back', 'Beginner', 6, 'Chest-supported machine row for strict back isolation.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Machine Row');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Straight-Arm Pulldown', c.category_id, 'Back', 'Intermediate', 5, 'Cable movement isolating the lats with straight arms.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Straight-Arm Pulldown');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Hyperextension', c.category_id, 'Back', 'Beginner', 5, 'Lower back and glute movement on the hyperextension bench.', 'Roman Chair'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Hyperextension');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Rack Pull', c.category_id, 'Back', 'Advanced', 8, 'Partial deadlift from pins that overloads the upper back.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Rack Pull');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Face Pull', c.category_id, 'Back', 'Beginner', 5, 'Rear delt and upper back movement using a rope attachment.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Back'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Face Pull');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Barbell Overhead Press', c.category_id, 'Shoulders', 'Intermediate', 8, 'Standing press that builds overall shoulder mass and strength.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Barbell Overhead Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Seated Dumbbell Shoulder Press', c.category_id, 'Shoulders', 'Beginner', 7, 'Seated press for stable, controlled shoulder development.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Seated Dumbbell Shoulder Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Arnold Press', c.category_id, 'Shoulders', 'Intermediate', 7, 'Rotational press that hits all three deltoid heads.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Arnold Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Smith Machine Shoulder Press', c.category_id, 'Shoulders', 'Beginner', 7, 'Fixed-path press for safe shoulder pressing.', 'Smith Machine'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Smith Machine Shoulder Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Dumbbell Lateral Raise', c.category_id, 'Shoulders', 'Beginner', 5, 'Isolation raise for side deltoid width.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Dumbbell Lateral Raise');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Cable Lateral Raise', c.category_id, 'Shoulders', 'Beginner', 5, 'Cable variation providing constant tension on side delts.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Cable Lateral Raise');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Front Raise', c.category_id, 'Shoulders', 'Beginner', 5, 'Isolation move targeting the front deltoid.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Front Raise');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Rear Delt Fly', c.category_id, 'Shoulders', 'Beginner', 5, 'Bent-over raise for rear deltoid development.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Rear Delt Fly');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Reverse Pec Deck', c.category_id, 'Shoulders', 'Beginner', 5, 'Machine isolation for the rear deltoids.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Reverse Pec Deck');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Upright Row', c.category_id, 'Shoulders', 'Intermediate', 6, 'Vertical pull that targets delts and traps.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Upright Row');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Cable Face Pull', c.category_id, 'Shoulders', 'Beginner', 5, 'Rope pull for rear delt and rotator cuff health.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Cable Face Pull');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Machine Shoulder Press', c.category_id, 'Shoulders', 'Beginner', 6, 'Guided press machine for safe overhead pressing.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Machine Shoulder Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Barbell Shrug', c.category_id, 'Shoulders', 'Beginner', 6, 'Trap-focused movement using a straight barbell.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Barbell Shrug');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Dumbbell Shrug', c.category_id, 'Shoulders', 'Beginner', 6, 'Trap isolation move using dumbbells.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Shoulders'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Dumbbell Shrug');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Barbell Curl', c.category_id, 'Biceps', 'Beginner', 5, 'Classic mass-building curl for the biceps.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Barbell Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'EZ-Bar Curl', c.category_id, 'Biceps', 'Beginner', 5, 'Wrist-friendly curl variation using an EZ bar.', 'EZ Bar'
FROM exercise_categories c WHERE c.category_name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'EZ-Bar Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Dumbbell Curl', c.category_id, 'Biceps', 'Beginner', 5, 'Standard alternating curl for biceps growth.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Dumbbell Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Hammer Curl', c.category_id, 'Biceps', 'Beginner', 5, 'Neutral-grip curl that also builds the forearms.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Hammer Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Incline Dumbbell Curl', c.category_id, 'Biceps', 'Intermediate', 5, 'Incline bench curl that maximizes bicep stretch.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Incline Dumbbell Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Preacher Curl', c.category_id, 'Biceps', 'Intermediate', 5, 'Strict curl that isolates the biceps on a preacher pad.', 'Preacher Bench'
FROM exercise_categories c WHERE c.category_name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Preacher Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Cable Curl', c.category_id, 'Biceps', 'Beginner', 5, 'Constant-tension curl using a cable and bar attachment.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Cable Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Concentration Curl', c.category_id, 'Biceps', 'Beginner', 5, 'Seated single-arm curl for peak bicep contraction.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Concentration Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Machine Bicep Curl', c.category_id, 'Biceps', 'Beginner', 5, 'Guided curl machine for strict bicep isolation.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Machine Bicep Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Cable Rope Hammer Curl', c.category_id, 'Biceps', 'Beginner', 5, 'Rope attachment curl targeting the brachialis.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Cable Rope Hammer Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Close-Grip Bench Press', c.category_id, 'Triceps', 'Intermediate', 8, 'Compound press emphasizing tricep involvement.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Close-Grip Bench Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Triceps Pushdown', c.category_id, 'Triceps', 'Beginner', 5, 'Cable isolation move for overall tricep mass.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Triceps Pushdown');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Overhead Cable Triceps Extension', c.category_id, 'Triceps', 'Intermediate', 5, 'Overhead cable move for the long head of the triceps.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Overhead Cable Triceps Extension');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Skull Crusher', c.category_id, 'Triceps', 'Intermediate', 6, 'Lying extension that builds tricep size and strength.', 'EZ Bar'
FROM exercise_categories c WHERE c.category_name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Skull Crusher');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Dumbbell Overhead Triceps Extension', c.category_id, 'Triceps', 'Beginner', 5, 'Overhead extension using a single dumbbell.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Dumbbell Overhead Triceps Extension');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Dips (Triceps Focus)', c.category_id, 'Triceps', 'Advanced', 8, 'Upright dip variation that targets the triceps.', 'Dip Station'
FROM exercise_categories c WHERE c.category_name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Dips (Triceps Focus)');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Machine Triceps Extension', c.category_id, 'Triceps', 'Beginner', 5, 'Guided machine extension for strict tricep isolation.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Machine Triceps Extension');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Rope Pushdown', c.category_id, 'Triceps', 'Beginner', 5, 'Rope attachment pushdown for tricep definition.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Rope Pushdown');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Kickback', c.category_id, 'Triceps', 'Beginner', 4, 'Bent-over isolation move for the triceps.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Kickback');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Barbell Back Squat', c.category_id, 'Legs', 'Advanced', 9, 'Foundational compound lift for total leg development.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Barbell Back Squat');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Barbell Front Squat', c.category_id, 'Legs', 'Advanced', 9, 'Quad-dominant squat variation using a front rack position.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Barbell Front Squat');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Leg Press', c.category_id, 'Legs', 'Beginner', 8, 'Machine-based squat pattern for safe heavy loading.', 'Leg Press Machine'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Leg Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Hack Squat', c.category_id, 'Legs', 'Intermediate', 8, 'Machine squat that emphasizes the quadriceps.', 'Hack Squat Machine'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Hack Squat');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Walking Lunge', c.category_id, 'Legs', 'Intermediate', 7, 'Dynamic lunge pattern for unilateral leg strength.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Walking Lunge');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Bulgarian Split Squat', c.category_id, 'Legs', 'Advanced', 8, 'Rear-foot-elevated squat for balance and leg power.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Bulgarian Split Squat');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Leg Extension', c.category_id, 'Legs', 'Beginner', 5, 'Isolation machine move for the quadriceps.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Leg Extension');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Lying Leg Curl', c.category_id, 'Legs', 'Beginner', 5, 'Isolation machine move for the hamstrings.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Lying Leg Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Seated Leg Curl', c.category_id, 'Legs', 'Beginner', 5, 'Seated hamstring isolation on a curl machine.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Seated Leg Curl');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Romanian Deadlift', c.category_id, 'Legs', 'Intermediate', 8, 'Hip-hinge movement that builds hamstrings and glutes.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Romanian Deadlift');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Dumbbell Romanian Deadlift', c.category_id, 'Legs', 'Intermediate', 7, 'Dumbbell hip-hinge variation for hamstring development.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Dumbbell Romanian Deadlift');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Smith Machine Squat', c.category_id, 'Legs', 'Beginner', 8, 'Fixed-path squat for controlled leg training.', 'Smith Machine'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Smith Machine Squat');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Standing Calf Raise', c.category_id, 'Legs', 'Beginner', 4, 'Calf isolation performed standing on a raise machine.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Standing Calf Raise');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Seated Calf Raise', c.category_id, 'Legs', 'Beginner', 4, 'Seated calf raise machine targeting the soleus.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Seated Calf Raise');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Leg Press Calf Raise', c.category_id, 'Legs', 'Beginner', 4, 'Calf raise performed on the leg press platform.', 'Leg Press Machine'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Leg Press Calf Raise');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Goblet Squat', c.category_id, 'Legs', 'Beginner', 6, 'Front-loaded squat great for building squat mechanics.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Goblet Squat');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Step-Up', c.category_id, 'Legs', 'Intermediate', 7, 'Unilateral step movement onto a gym box or bench.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Step-Up');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Sissy Squat', c.category_id, 'Legs', 'Advanced', 6, 'Advanced quad isolation movement performed at the squat rack.', 'Bodyweight'
FROM exercise_categories c WHERE c.category_name = 'Legs'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Sissy Squat');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Barbell Hip Thrust', c.category_id, 'Glutes', 'Intermediate', 7, 'Top glute builder performed against a bench.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Glutes'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Barbell Hip Thrust');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Cable Glute Kickback', c.category_id, 'Glutes', 'Beginner', 5, 'Cable isolation for glute activation and shape.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Glutes'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Cable Glute Kickback');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Glute Bridge Machine', c.category_id, 'Glutes', 'Beginner', 5, 'Machine-guided bridge for glute isolation.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Glutes'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Glute Bridge Machine');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Sumo Deadlift', c.category_id, 'Glutes', 'Advanced', 9, 'Wide-stance deadlift variation emphasizing glutes and inner thighs.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Glutes'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Sumo Deadlift');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Hip Abduction Machine', c.category_id, 'Glutes', 'Beginner', 4, 'Machine move targeting the outer glutes.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Glutes'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Hip Abduction Machine');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Hip Adduction Machine', c.category_id, 'Glutes', 'Beginner', 4, 'Machine move targeting the inner thighs.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Glutes'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Hip Adduction Machine');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Cable Woodchopper', c.category_id, 'Core', 'Intermediate', 6, 'Rotational cable move for obliques and core stability.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Core'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Cable Woodchopper');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Hanging Leg Raise', c.category_id, 'Core', 'Advanced', 7, 'Advanced ab move performed hanging from the bar.', 'Pull-Up Bar'
FROM exercise_categories c WHERE c.category_name = 'Core'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Hanging Leg Raise');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Captain''s Chair Knee Raise', c.category_id, 'Core', 'Intermediate', 6, 'Supported knee raise for lower ab development.', 'Captain''s Chair'
FROM exercise_categories c WHERE c.category_name = 'Core'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Captain''s Chair Knee Raise');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Cable Crunch', c.category_id, 'Core', 'Intermediate', 6, 'Kneeling crunch using a rope attachment for loaded abs.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Core'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Cable Crunch');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Ab Machine Crunch', c.category_id, 'Core', 'Beginner', 5, 'Machine-guided crunch for controlled ab training.', 'Machine'
FROM exercise_categories c WHERE c.category_name = 'Core'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Ab Machine Crunch');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Weighted Plank', c.category_id, 'Core', 'Intermediate', 5, 'Loaded plank hold for core endurance.', 'Weight Plate'
FROM exercise_categories c WHERE c.category_name = 'Core'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Weighted Plank');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Russian Twist', c.category_id, 'Core', 'Intermediate', 6, 'Rotational core move performed with a plate or dumbbell.', 'Weight Plate'
FROM exercise_categories c WHERE c.category_name = 'Core'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Russian Twist');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Landmine Rotation', c.category_id, 'Core', 'Intermediate', 6, 'Standing rotational core movement using a landmine bar.', 'Landmine Attachment'
FROM exercise_categories c WHERE c.category_name = 'Core'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Landmine Rotation');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Decline Bench Sit-Up', c.category_id, 'Core', 'Intermediate', 6, 'Sit-up variation performed on a decline bench for added load.', 'Decline Bench'
FROM exercise_categories c WHERE c.category_name = 'Core'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Decline Bench Sit-Up');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Back Extension', c.category_id, 'Core', 'Beginner', 5, 'Lower back and core movement on the extension bench.', 'Roman Chair'
FROM exercise_categories c WHERE c.category_name = 'Core'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Back Extension');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Treadmill Running', c.category_id, 'Cardio', 'Beginner', 11, 'Steady-state or interval running on the gym treadmill.', 'Treadmill'
FROM exercise_categories c WHERE c.category_name = 'Cardio'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Treadmill Running');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Treadmill Incline Walk', c.category_id, 'Cardio', 'Beginner', 8, 'Incline walking session for low-impact cardio.', 'Treadmill'
FROM exercise_categories c WHERE c.category_name = 'Cardio'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Treadmill Incline Walk');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Stationary Bike', c.category_id, 'Cardio', 'Beginner', 9, 'Low-impact cardio session on an upright or spin bike.', 'Stationary Bike'
FROM exercise_categories c WHERE c.category_name = 'Cardio'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Stationary Bike');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Rowing Machine', c.category_id, 'Cardio', 'Intermediate', 10, 'Full-body cardio and conditioning on the rower.', 'Rowing Machine'
FROM exercise_categories c WHERE c.category_name = 'Cardio'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Rowing Machine');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Stair Climber', c.category_id, 'Cardio', 'Intermediate', 10, 'High-intensity cardio session on the stair climber.', 'Stair Climber Machine'
FROM exercise_categories c WHERE c.category_name = 'Cardio'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Stair Climber');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Elliptical Trainer', c.category_id, 'Cardio', 'Beginner', 8, 'Low-impact full-body cardio machine session.', 'Elliptical Machine'
FROM exercise_categories c WHERE c.category_name = 'Cardio'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Elliptical Trainer');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Assault Bike Intervals', c.category_id, 'Cardio', 'Advanced', 13, 'High-intensity interval training on an air bike.', 'Assault Bike'
FROM exercise_categories c WHERE c.category_name = 'Cardio'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Assault Bike Intervals');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Battle Ropes', c.category_id, 'Cardio', 'Advanced', 11, 'Explosive conditioning intervals using heavy ropes.', 'Battle Ropes'
FROM exercise_categories c WHERE c.category_name = 'Cardio'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Battle Ropes');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Jump Rope', c.category_id, 'Cardio', 'Intermediate', 12, 'Fast-paced cardio and coordination drill using a jump rope.', 'Jump Rope'
FROM exercise_categories c WHERE c.category_name = 'Cardio'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Jump Rope');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Sled Push', c.category_id, 'Cardio', 'Advanced', 12, 'Full-body conditioning drill pushing a weighted sled.', 'Sled'
FROM exercise_categories c WHERE c.category_name = 'Cardio'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Sled Push');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Sled Pull', c.category_id, 'Cardio', 'Advanced', 11, 'Posterior-chain conditioning drill pulling a weighted sled.', 'Sled'
FROM exercise_categories c WHERE c.category_name = 'Cardio'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Sled Pull');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Barbell Clean and Press', c.category_id, 'Full Body', 'Advanced', 12, 'Olympic-style lift combining a clean and overhead press.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Barbell Clean and Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Kettlebell Swing', c.category_id, 'Full Body', 'Intermediate', 10, 'Explosive hip-hinge move for power and conditioning.', 'Kettlebell'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Kettlebell Swing');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Kettlebell Goblet Squat', c.category_id, 'Full Body', 'Beginner', 7, 'Kettlebell-loaded squat for full-body strength.', 'Kettlebell'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Kettlebell Goblet Squat');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Kettlebell Clean', c.category_id, 'Full Body', 'Advanced', 9, 'Explosive pull that racks the kettlebell at the shoulder.', 'Kettlebell'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Kettlebell Clean');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Kettlebell Snatch', c.category_id, 'Full Body', 'Advanced', 11, 'High-power kettlebell movement from floor to overhead.', 'Kettlebell'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Kettlebell Snatch');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Barbell Thruster', c.category_id, 'Full Body', 'Advanced', 11, 'Squat-to-press combo movement for full-body conditioning.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Barbell Thruster');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Dumbbell Thruster', c.category_id, 'Full Body', 'Intermediate', 10, 'Dumbbell squat-to-press combo for conditioning.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Dumbbell Thruster');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Farmer''s Carry', c.category_id, 'Full Body', 'Beginner', 8, 'Loaded carry that builds grip, core, and total-body strength.', 'Dumbbell'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Farmer''s Carry');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'TRX Row', c.category_id, 'Full Body', 'Beginner', 6, 'Suspension trainer row for back and core stability.', 'TRX Suspension Trainer'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'TRX Row');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'TRX Chest Press', c.category_id, 'Full Body', 'Beginner', 6, 'Suspension trainer press for chest and stability.', 'TRX Suspension Trainer'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'TRX Chest Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Medicine Ball Slam', c.category_id, 'Full Body', 'Intermediate', 9, 'Explosive full-body power movement using a slam ball.', 'Medicine Ball'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Medicine Ball Slam');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Box Jump', c.category_id, 'Full Body', 'Advanced', 9, 'Explosive lower-body power movement onto a gym box.', 'Plyo Box'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Box Jump');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Battle Rope Slam', c.category_id, 'Full Body', 'Advanced', 11, 'High-intensity full-body conditioning drill.', 'Battle Ropes'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Battle Rope Slam');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Smith Machine Deadlift', c.category_id, 'Full Body', 'Intermediate', 8, 'Fixed-path deadlift for controlled posterior chain training.', 'Smith Machine'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Smith Machine Deadlift');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Barbell Push Press', c.category_id, 'Full Body', 'Advanced', 10, 'Explosive overhead press using leg drive.', 'Barbell'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Barbell Push Press');
INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment)
SELECT 'Cable Pull-Through', c.category_id, 'Full Body', 'Intermediate', 7, 'Hip-hinge cable movement for glutes and hamstrings.', 'Cable Machine'
FROM exercise_categories c WHERE c.category_name = 'Full Body & Functional'
AND NOT EXISTS (SELECT 1 FROM exercises WHERE exercise_name = 'Cable Pull-Through');

COMMIT;
