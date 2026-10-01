-- AVEFIT schema consistency fixes
-- Safe to run on databases where workout_duration is either INTEGER or VARCHAR.
BEGIN;

-- Admin member pages read/edit members from users. Older copies of the project
-- may not have an address column, so add it only if it is missing.
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Store workout duration consistently as minutes (e.g. 45), not "45 mins".
ALTER TABLE users
  ALTER COLUMN workout_duration TYPE INTEGER
  USING NULLIF(regexp_replace(workout_duration::text, '[^0-9]', '', 'g'), '')::INTEGER;

COMMIT;
