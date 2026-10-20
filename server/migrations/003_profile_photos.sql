-- ============================================================
-- AVEFIT Capstone — Admin Profile Photos
-- Run this once against your PostgreSQL database (after 001 and 002).
-- Safe to re-run.
-- ============================================================

BEGIN;

ALTER TABLE admins ADD COLUMN IF NOT EXISTS photo_url TEXT;

COMMIT;
