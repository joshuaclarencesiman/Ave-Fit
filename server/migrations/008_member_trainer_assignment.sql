-- ============================================================
-- AVEFIT: Member -> Designated Coach assignment
-- Run this after 007_trainer_specializations.sql.
-- ============================================================

BEGIN;

ALTER TABLE members ADD COLUMN IF NOT EXISTS trainer_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'members_trainer_id_fkey'
  ) THEN
    ALTER TABLE members ADD CONSTRAINT members_trainer_id_fkey
      FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id) ON DELETE SET NULL;
  END IF;
END $$;

-- Keep existing member records aligned with registered user accounts when their emails match.
UPDATE members m
SET trainer_id = u.trainer_id
FROM users u
WHERE LOWER(m.email) = LOWER(u.email)
  AND u.trainer_id IS NOT NULL;

COMMIT;
