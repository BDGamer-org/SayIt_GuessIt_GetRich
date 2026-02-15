-- Schema and permission checks

-- 1. Check current schema
SELECT current_schema();

-- 2. List all tables in public schema
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'scores';

-- 3. Query with explicit schema
SELECT * FROM public.scores;

-- 4. Check RLS status on table
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'scores';

-- 5. If RLS is enabled, check policies
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE tablename = 'scores';

-- 6. Check table owner
SELECT schemaname, tablename, tableowner
FROM pg_tables
WHERE tablename = 'scores';

-- 7. Try to count with explicit schema
SELECT COUNT(*) FROM public.scores;

-- 8. List all data with full qualification
SELECT id, player_name, score, created_at
FROM public.scores
ORDER BY score DESC;
