-- Debug queries for your database situation

-- 1. Check what's actually in the table (no filters)
SELECT * FROM scores;

-- 2. Check count with more detail
SELECT COUNT(*) as total,
       MIN(score) as min_score,
       MAX(score) as max_score,
       MIN(created_at) as first_entry,
       MAX(created_at) as last_entry
FROM scores;

-- 3. Check if data exists but is hidden (check all columns as text)
SELECT id, player_name, score, created_at::text as created_at_text
FROM scores
ORDER BY id
LIMIT 5;

-- 4. Check table permissions (RLS might be blocking)
SELECT * FROM pg_policies WHERE tablename = 'scores';

-- 5. Try direct insert to test
INSERT INTO scores (player_name, score)
VALUES ('DebugTest', 50)
RETURNING *;

-- 6. Check if insert worked
SELECT * FROM scores ORDER BY id DESC LIMIT 5;

-- 7. If RLS is blocking, disable it for testing:
-- ALTER TABLE scores DISABLE ROW LEVEL SECURITY;

-- 8. Or add proper RLS policy:
-- CREATE POLICY "Allow all" ON scores FOR ALL USING (true) WITH CHECK (true);
