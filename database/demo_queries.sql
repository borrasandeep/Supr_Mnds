-- ============================================================
-- Supr_Mnds — RDBMS Demo Queries
-- Showcases: SELECT, JOIN, GROUP BY, aggregates, subqueries,
--            views, HAVING, ORDER BY, date functions
-- ============================================================

USE social_media_cms;

-- ============================================================
-- 1. BASIC SELECTS — show raw data from each table
-- ============================================================

SELECT '--- 1.1 All Users ---' AS '';
SELECT user_id, username, full_name, email, role, is_active
FROM users
ORDER BY user_id;

SELECT '--- 1.2 All Platforms ---' AS '';
SELECT platform_id, name, char_limit, supports_images, supports_videos
FROM platforms
ORDER BY platform_id;

SELECT '--- 1.3 All Campaigns ---' AS '';
SELECT campaign_id, name, status, start_date, end_date
FROM campaigns
ORDER BY campaign_id;

-- ============================================================
-- 2. TWO-TABLE JOINS
-- ============================================================

SELECT '--- 2.1 Posts with Author Names ---' AS '';
SELECT p.post_id, p.title, u.username AS author, u.role,
       p.post_type, p.status, p.created_at
FROM posts p
JOIN users u ON u.user_id = p.user_id
ORDER BY p.post_id;

SELECT '--- 2.2 Social Accounts with Platform Names ---' AS '';
SELECT sa.account_id, sa.account_name, sa.account_handle,
       pl.name AS platform, u.username AS owner
FROM social_accounts sa
JOIN platforms pl ON pl.platform_id = sa.platform_id
JOIN users u      ON u.user_id      = sa.user_id
ORDER BY sa.account_id;

-- ============================================================
-- 3. THREE-TABLE JOINS
-- ============================================================

SELECT '--- 3.1 Post Targets with Full Context ---' AS '';
SELECT pt.target_id, p.title AS post_title,
       pl.name AS platform, sa.account_name,
       pt.status, pt.scheduled_at
FROM post_targets pt
JOIN posts p            ON p.post_id      = pt.post_id
JOIN platforms pl       ON pl.platform_id = pt.platform_id
JOIN social_accounts sa ON sa.account_id  = pt.account_id
ORDER BY pt.target_id
LIMIT 15;

SELECT '--- 3.2 Comments with Post and Platform ---' AS '';
SELECT c.comment_id, c.author_name, c.comment_text,
       c.sentiment, p.title AS post_title, pl.name AS platform
FROM comments c
JOIN post_targets pt ON pt.target_id  = c.target_id
JOIN posts p         ON p.post_id     = pt.post_id
JOIN platforms pl    ON pl.platform_id = pt.platform_id
ORDER BY c.comment_id
LIMIT 10;

-- ============================================================
-- 4. AGGREGATE FUNCTIONS — COUNT, SUM, AVG, MAX, MIN
-- ============================================================

SELECT '--- 4.1 Summary Stats ---' AS '';
SELECT
  (SELECT COUNT(*) FROM users)             AS total_users,
  (SELECT COUNT(*) FROM posts)             AS total_posts,
  (SELECT COUNT(*) FROM platforms)         AS total_platforms,
  (SELECT COUNT(*) FROM campaigns)         AS total_campaigns,
  (SELECT COUNT(*) FROM post_targets)      AS total_targets,
  (SELECT COUNT(*) FROM comments)          AS total_comments;

SELECT '--- 4.2 Total Engagement by Platform ---' AS '';
SELECT pl.name AS platform,
       COUNT(a.analytics_id)         AS records,
       SUM(a.likes)                  AS total_likes,
       SUM(a.comments_count)         AS total_comments,
       SUM(a.shares)                 AS total_shares,
       ROUND(AVG(a.engagement_rate),2) AS avg_engagement
FROM analytics a
JOIN post_targets pt ON pt.target_id  = a.target_id
JOIN platforms pl    ON pl.platform_id = pt.platform_id
GROUP BY pl.name
ORDER BY avg_engagement DESC;

-- ============================================================
-- 5. GROUP BY + HAVING
-- ============================================================

SELECT '--- 5.1 Users Who Created More Than 2 Posts ---' AS '';
SELECT u.username, u.role, COUNT(p.post_id) AS post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.user_id
GROUP BY u.user_id, u.username, u.role
HAVING post_count > 2
ORDER BY post_count DESC;

SELECT '--- 5.2 Posts Grouped by Status ---' AS '';
SELECT status, COUNT(*) AS count
FROM posts
GROUP BY status
ORDER BY count DESC;

SELECT '--- 5.3 Posts Grouped by Type ---' AS '';
SELECT post_type, COUNT(*) AS count
FROM posts
GROUP BY post_type
ORDER BY count DESC;

-- ============================================================
-- 6. SUBQUERIES
-- ============================================================

SELECT '--- 6.1 Posts That Have Analytics Above Average Engagement ---' AS '';
SELECT DISTINCT p.title, a.engagement_rate
FROM posts p
JOIN post_targets pt ON pt.post_id  = p.post_id
JOIN analytics a     ON a.target_id = pt.target_id
WHERE a.engagement_rate > (
    SELECT AVG(engagement_rate) FROM analytics
)
ORDER BY a.engagement_rate DESC;

SELECT '--- 6.2 Users with No Posts ---' AS '';
SELECT user_id, username, role
FROM users
WHERE user_id NOT IN (SELECT DISTINCT user_id FROM posts);

SELECT '--- 6.3 Posts with Most Comments ---' AS '';
SELECT p.title, c_count.total
FROM posts p
JOIN (
    SELECT pt.post_id, COUNT(*) AS total
    FROM comments c
    JOIN post_targets pt ON pt.target_id = c.target_id
    GROUP BY pt.post_id
) AS c_count ON c_count.post_id = p.post_id
ORDER BY c_count.total DESC
LIMIT 5;

-- ============================================================
-- 7. DATE FUNCTIONS
-- ============================================================

SELECT '--- 7.1 Posts Created in the Last 30 Days ---' AS '';
SELECT post_id, title, status, created_at
FROM posts
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY created_at DESC;

SELECT '--- 7.2 Scheduled Posts (Future Only) ---' AS '';
SELECT pt.target_id, p.title, pl.name AS platform,
       pt.scheduled_at,
       TIMESTAMPDIFF(DAY, NOW(), pt.scheduled_at) AS days_until
FROM post_targets pt
JOIN posts p         ON p.post_id     = pt.post_id
JOIN platforms pl    ON pl.platform_id = pt.platform_id
WHERE pt.status = 'scheduled' AND pt.scheduled_at >= NOW()
ORDER BY pt.scheduled_at;

-- ============================================================
-- 8. VIEWS — reusable summaries
-- ============================================================

DROP VIEW IF EXISTS vw_post_summary;
CREATE VIEW vw_post_summary AS
SELECT p.post_id, p.title, u.username AS author,
       c.name AS campaign, p.status,
       COUNT(pt.target_id) AS platforms_targeted
FROM posts p
JOIN users u          ON u.user_id     = p.user_id
LEFT JOIN campaigns c ON c.campaign_id = p.campaign_id
LEFT JOIN post_targets pt ON pt.post_id = p.post_id
GROUP BY p.post_id, p.title, u.username, c.name, p.status;

SELECT '--- 8.1 View: Post Summary ---' AS '';
SELECT * FROM vw_post_summary ORDER BY post_id LIMIT 15;

DROP VIEW IF EXISTS vw_platform_engagement;
CREATE VIEW vw_platform_engagement AS
SELECT pl.name AS platform,
       COUNT(a.analytics_id)           AS records,
       SUM(a.likes)                    AS total_likes,
       SUM(a.comments_count)           AS total_comments,
       SUM(a.shares)                   AS total_shares,
       ROUND(AVG(a.engagement_rate), 2) AS avg_engagement
FROM platforms pl
JOIN post_targets pt ON pt.platform_id = pl.platform_id
JOIN analytics a     ON a.target_id    = pt.target_id
GROUP BY pl.name;

SELECT '--- 8.2 View: Platform Engagement ---' AS '';
SELECT * FROM vw_platform_engagement ORDER BY avg_engagement DESC;

-- ============================================================
-- 9. LEFT JOINS — find missing relationships
-- ============================================================

SELECT '--- 9.1 Posts with No Targets ---' AS '';
SELECT p.post_id, p.title, p.status
FROM posts p
LEFT JOIN post_targets pt ON pt.post_id = p.post_id
WHERE pt.target_id IS NULL
ORDER BY p.post_id;

SELECT '--- 9.2 Campaigns with No Posts ---' AS '';
SELECT c.campaign_id, c.name, c.status
FROM campaigns c
LEFT JOIN posts p ON p.campaign_id = c.campaign_id
WHERE p.post_id IS NULL;

-- ============================================================
-- 10. RANKING — top performers
-- ============================================================

SELECT '--- 10.1 Top 5 Posts by Total Engagement ---' AS '';
SELECT p.post_id, p.title,
       SUM(a.likes + a.comments_count + a.shares) AS total_engagement
FROM posts p
JOIN post_targets pt ON pt.post_id  = p.post_id
JOIN analytics a     ON a.target_id = pt.target_id
GROUP BY p.post_id, p.title
ORDER BY total_engagement DESC
LIMIT 5;

-- ============================================================
-- END OF DEMO
-- ============================================================

SELECT '--- Demo Complete ---' AS '';