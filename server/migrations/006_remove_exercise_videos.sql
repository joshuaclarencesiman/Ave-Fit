-- ============================================================
-- AVEFIT — Remove Exercise Video Tutorials
-- Run after the existing exercise/tutorial migrations.
-- The AveFit UI now uses the bundled Workout Guide repository
-- (illustrated exercise frames) instead of external video links.
-- ============================================================

BEGIN;

ALTER TABLE exercises DROP COLUMN IF EXISTS video_url;

COMMIT;
