-- Backend-driven life recovery migration
-- Run in Supabase SQL Editor before deploying backend changes.

ALTER TABLE players
ADD COLUMN IF NOT EXISTS lives INTEGER NOT NULL DEFAULT 5;

ALTER TABLE players
ADD COLUMN IF NOT EXISTS life_recovery_queue JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE players
SET
  lives = COALESCE(lives, 5),
  life_recovery_queue = COALESCE(life_recovery_queue, '[]'::jsonb);
