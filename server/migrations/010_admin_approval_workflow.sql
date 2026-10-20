-- AVEFIT admin approval workflow
BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'Pending';

-- Preserve existing completed accounts. Unfinished/new accounts remain pending.
UPDATE users
SET account_status = CASE
  WHEN COALESCE(setup_completed, FALSE) = TRUE THEN 'Active'
  ELSE COALESCE(account_status, 'Pending')
END
WHERE account_status IS NULL OR account_status = 'Pending';

ALTER TABLE users ALTER COLUMN account_status SET DEFAULT 'Pending';

-- Existing trainers remain available; newly created trainers default to Pending.
UPDATE trainers SET status = 'Active' WHERE status IS NULL;
ALTER TABLE trainers ALTER COLUMN status SET DEFAULT 'Pending';

COMMIT;
