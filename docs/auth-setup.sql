-- ============================================
-- Auth System Setup SQL
-- Run these in Supabase SQL Editor
-- ============================================

-- 1. Create players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_code TEXT UNIQUE NOT NULL,
    player_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add player_id to scores table
ALTER TABLE scores
ADD COLUMN IF NOT EXISTS player_id UUID REFERENCES players(id);

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_scores_player_id ON scores(player_id);
CREATE INDEX IF NOT EXISTS idx_players_backup_code ON players(backup_code);

-- 4. Enable RLS on players table
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Anyone can create players
CREATE POLICY "Allow insert" ON players
FOR INSERT WITH CHECK (true);

-- 6. Policy: Anyone can read players (needed for recovery)
CREATE POLICY "Allow select" ON players
FOR SELECT USING (true);

-- 7. Update scores RLS policy
DROP POLICY IF EXISTS "Allow all" ON scores;
DROP POLICY IF EXISTS "Users can only see their own scores" ON scores;

CREATE POLICY "Allow insert" ON scores
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select" ON scores
FOR SELECT USING (true);

-- 8. Function to generate backup code
CREATE OR REPLACE FUNCTION generate_backup_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate 8 character code (letters + numbers)
        code := upper(substring(md5(random()::text) from 1 for 8));

        -- Check if exists
        SELECT EXISTS(SELECT 1 FROM players WHERE backup_code = code) INTO exists_check;

        EXIT WHEN NOT exists_check;
    END LOOP;

    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Test: Create a test player
-- ============================================
-- INSERT INTO players (backup_code, player_name)
-- VALUES (generate_backup_code(), 'TestPlayer')
-- RETURNING id, backup_code, player_name;
