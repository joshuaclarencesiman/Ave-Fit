-- ============================================================
-- AVEFIT Capstone — Trainer Portal Login
-- Run this once against your PostgreSQL database (after
-- 001_capstone_upgrade.sql). Safe to re-run.
-- ============================================================

BEGIN;

ALTER TABLE trainers ADD COLUMN IF NOT EXISTS password TEXT;

COMMIT;
