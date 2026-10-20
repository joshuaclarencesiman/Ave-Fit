-- AVEFIT security hardening
BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'Active';

UPDATE admins SET account_status = 'Active' WHERE account_status IS NULL;

-- Case-insensitive uniqueness prevents duplicate accounts such as A@B.COM and a@b.com.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS trainers_email_lower_unique ON trainers (LOWER(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS admins_email_lower_unique ON admins (LOWER(email));

COMMIT;
