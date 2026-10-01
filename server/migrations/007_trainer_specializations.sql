-- AveFit: multiple predefined coach specializations
-- Safe to run after the existing trainer migrations.

BEGIN;

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS specializations TEXT[] NOT NULL DEFAULT '{}';

-- Preserve existing free-text specialization values when possible.
UPDATE trainers
SET specializations = ARRAY(
  SELECT trim(value)
  FROM unnest(string_to_array(COALESCE(specialization, ''), ',')) AS value
  WHERE trim(value) <> ''
)
WHERE COALESCE(array_length(specializations, 1), 0) = 0
  AND COALESCE(trim(specialization), '') <> '';

ALTER TABLE trainers DROP COLUMN IF EXISTS specialization;

COMMIT;
