-- Section C: operational statistics from generated_problem_attempts
-- Run (from host):
--   docker exec dms-postgres-1 psql -U dmc_user -d dmc_db -f - < eval/section_c_db_stats.sql
-- Or copy-paste blocks into psql.

\echo '=== C.0 Overview ==='
SELECT COUNT(*) AS total_attempts,
       MIN(created_at)::date AS first_attempt,
       MAX(created_at)::date AS last_attempt
FROM generated_problem_attempts;

\echo '=== C.1 By verification_method ==='
SELECT verification_method,
       COUNT(*) AS attempts,
       SUM(CASE WHEN correct THEN 1 ELSE 0 END) AS marked_correct,
       ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) AS pct_marked_correct
FROM generated_problem_attempts
GROUP BY verification_method
ORDER BY attempts DESC;

\echo '=== C.2 Confidence by method ==='
SELECT verification_method,
       COUNT(*) AS n,
       ROUND(AVG(confidence::numeric), 3) AS avg_conf,
       ROUND(MIN(confidence::numeric), 3) AS min_conf,
       ROUND(MAX(confidence::numeric), 3) AS max_conf
FROM generated_problem_attempts
WHERE confidence IS NOT NULL
GROUP BY verification_method
ORDER BY n DESC;

\echo '=== C.3 Manual review candidates (confidence < 0.55) ==='
SELECT id,
       verification_method,
       confidence,
       correct,
       LEFT(COALESCE(feedback, ''), 80) AS feedback,
       created_at::date AS attempt_date
FROM generated_problem_attempts
WHERE confidence < 0.55
ORDER BY confidence, id;
