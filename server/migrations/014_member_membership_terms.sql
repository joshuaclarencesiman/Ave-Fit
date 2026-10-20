BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS membership_months INTEGER,
  ADD COLUMN IF NOT EXISTS membership_start_date DATE,
  ADD COLUMN IF NOT EXISTS membership_end_date DATE;

UPDATE users
SET membership_start_date = created_at::date,
    membership_end_date = (
      created_at::date + make_interval(months => membership_months) - INTERVAL '1 day'
    )::date
WHERE membership_months IS NOT NULL
  AND membership_start_date IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'users_membership_months_check'
      AND table_name = 'users'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_membership_months_check
      CHECK (membership_months IS NULL OR membership_months IN (1, 3, 6, 10, 12));
  END IF;
END $$;

COMMIT;
