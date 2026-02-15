-- ============================================
-- Database Verification SQL for SayIt Game
-- Run these in Supabase SQL Editor
-- ============================================

-- 1. Check if table exists and view structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'scores'
ORDER BY
    ordinal_position;

-- 2. View all data in table (check if inserts work)
SELECT * FROM scores ORDER BY created_at DESC LIMIT 20;

-- 3. Check TOP 10 scores (what the API returns)
SELECT
    id,
    player_name,
    score,
    created_at
FROM scores
ORDER BY score DESC
LIMIT 10;

-- 4. Count total scores
SELECT COUNT(*) as total_scores FROM scores;

-- 5. Check for duplicate names
SELECT
    player_name,
    COUNT(*) as entries,
    MAX(score) as best_score
FROM scores
GROUP BY player_name
ORDER BY best_score DESC;

-- 6. Test insert (run this then check if it appears)
-- INSERT INTO scores (player_name, score) VALUES ('TestPlayer', 999);

-- 7. Check table size
SELECT pg_size_pretty(pg_total_relation_size('scores')) as table_size;

-- 8. View recent submissions with time
SELECT
    player_name,
    score,
    created_at,
    created_at::date as date_only
FROM scores
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- Troubleshooting Queries
-- ============================================

-- If leaderboard returns empty, check RLS:
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'scores';

-- Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'scores';
