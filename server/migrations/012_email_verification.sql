-- AVEFIT email verification
-- Members must confirm ownership of their email address before the gym
-- administrator can approve the account, and before they can log in.
BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verification_token_hash TEXT;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP;

-- Accounts the admin has already approved are grandfathered in as verified so
-- the upgrade never locks out an existing member mid-onboarding. Accounts still
-- awaiting approval must confirm their email before approval is possible.
UPDATE users
SET email_verified = TRUE,
    email_verified_at = COALESCE(email_verified_at, created_at)
WHERE LOWER(COALESCE(account_status, 'pending')) = 'active'
  AND email_verified = FALSE;

-- Expired or spent tokens must never be considered by the verify endpoint.
CREATE INDEX IF NOT EXISTS users_verification_token_idx
  ON users (verification_token_hash)
  WHERE verification_token_hash IS NOT NULL;

COMMIT;
