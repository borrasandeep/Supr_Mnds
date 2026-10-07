-- ============================================================
-- Supr_Mnds — Rich Sample Data
-- Run AFTER schema.sql
-- ============================================================

USE social_media_cms;

-- Reset all tables. Use DELETE for parent tables (FK constraint blocks TRUNCATE).
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM publish_logs;
DELETE FROM approvals;
DELETE FROM post_tags;
DELETE FROM comments;
DELETE FROM analytics;
DELETE FROM post_media;
DELETE FROM media;
DELETE FROM post_targets;
DELETE FROM posts;
DELETE FROM campaigns;
DELETE FROM social_accounts;
DELETE FROM users;
DELETE FROM tags;

ALTER TABLE publish_logs   AUTO_INCREMENT = 1;
ALTER TABLE approvals      AUTO_INCREMENT = 1;
ALTER TABLE comments       AUTO_INCREMENT = 1;
ALTER TABLE analytics      AUTO_INCREMENT = 1;
ALTER TABLE media          AUTO_INCREMENT = 1;
ALTER TABLE post_targets   AUTO_INCREMENT = 1;
ALTER TABLE posts          AUTO_INCREMENT = 1;
ALTER TABLE campaigns      AUTO_INCREMENT = 1;
ALTER TABLE social_accounts AUTO_INCREMENT = 1;
ALTER TABLE users          AUTO_INCREMENT = 1;
ALTER TABLE tags           AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. USERS (6 team members)
-- ============================================================

INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES
('admin',     'admin@suprmnds.com',    '$2b$10$abcdefghijklmnopqrstuv', 'Aarav Mehta',     'admin',   TRUE),
('priya.m',   'priya@suprmnds.com',    '$2b$10$abcdefghijklmnopqrstuv', 'Priya Sharma',    'manager', TRUE),
('rahul.v',   'rahul@suprmnds.com',    '$2b$10$abcdefghijklmnopqrstuv', 'Rahul Verma',     'editor',  TRUE),
('anita.r',   'anita@suprmnds.com',    '$2b$10$abcdefghijklmnopqrstuv', 'Anita Rao',       'editor',  TRUE),
('karthik.s', 'karthik@suprmnds.com',  '$2b$10$abcdefghijklmnopqrstuv', 'Karthik Subbu',   'editor',  TRUE),
('neha.g',    'neha@suprmnds.com',     '$2b$10$abcdefghijklmnopqrstuv', 'Neha Gupta',      'viewer',  TRUE);

-- ============================================================
-- 2. SOCIAL ACCOUNTS (8 accounts across 6 platforms)
-- ============================================================
INSERT INTO social_accounts (user_id, platform_id, account_name, account_handle, is_active) VALUES
(1, 1, 'SuprMnds Official',    '@suprmnds',        TRUE),
(2, 1, 'SuprMnds Careers',     '@suprmnds.careers',TRUE),
(2, 2, 'SuprMnds Instagram',   '@suprmnds',        TRUE),
(3, 2, 'SuprMnds Stories',     '@suprmnds.stories',TRUE),
(3, 3, 'SuprMnds',             '@suprmnds',        TRUE),
(4, 4, 'SuprMnds Company',     'suprmnds',         TRUE),
(5, 5, 'SuprMnds TikTok',      '@suprmnds',        TRUE),
(6, 6, 'SuprMnds YouTube',     '@SuprMndsHQ',      TRUE);

-- ============================================================
-- 3. CAMPAIGNS (5 realistic campaigns)
-- ============================================================
INSERT INTO campaigns (name, description, start_date, end_date, status, created_by) VALUES
('Summer Sale 2026',      'Seasonal discount campaign — 50% off on all products',  '2026-05-01', '2026-06-30', 'active',    1),
('New Product Launch',    'Launch sequence for our new AI feature',                '2026-04-10', '2026-05-15', 'active',    1),
('Diwali Special 2026',   'Festive campaign with gift guides and offers',         '2026-10-15', '2026-11-10', 'draft',     2),
('Customer Stories',      'Weekly user spotlight interviews and testimonials',    '2026-01-01', '2026-12-31', 'active',    2),
('Brand Awareness Q3',    'Focus on increasing reach and followers',              '2026-07-01', '2026-09-30', 'draft',     1);

-- ============================================================
-- 4. POSTS (40 realistic posts)
-- ============================================================
INSERT INTO posts (user_id, campaign_id, title, content, post_type, status) VALUES
-- Summer Sale (campaign 1)
(3, 1, 'Summer Sale Kickoff',          'Get 50% off on all items this summer! Our biggest sale of the year starts now. Limited stock — shop fast!', 'image',    'approved'),
(3, 1, 'Summer Sale - Day 2',          'Fashion deals you cannot miss. New arrivals at half price.', 'image',    'approved'),
(4, 1, 'Summer Sale - Electronics',    'Laptops, headphones, smartwatches — all 50% off. Use code SUMMER50.', 'image',    'published'),
(3, 1, 'Summer Sale - Last Day',       'Final hours! Sale ends tonight at midnight. Do not miss out.', 'image',    'scheduled'),
(4, 1, 'Summer Sale - Customer Pick',  'Our most-loved products this summer, voted by you.', 'carousel', 'draft'),

-- New Product Launch (campaign 2)
(3, 2, 'Something Big is Coming',      'We have been working on something incredible. Stay tuned for the reveal on April 15.', 'video',    'approved'),
(4, 2, 'Product Teaser — Sneak Peek',  'A first look at the future of our platform. Watch the teaser.', 'video',    'published'),
(3, 2, 'Launch Day is Here!',          'Introducing SuprMnds AI — the smartest way to manage content across platforms.', 'video',    'published'),
(5, 2, 'AI Feature Demo',              'Watch how SuprMnds AI writes, schedules, and optimizes your posts automatically.', 'video',    'scheduled'),
(4, 2, 'Behind the Scenes',            'A look at how our team built the new AI engine over 6 months.', 'carousel', 'draft'),

-- Customer Stories (campaign 4)
(3, 4, 'How Priya Grew Her Brand',     'From 500 to 50,000 followers in 8 months using SuprMnds. Read her story.', 'image',    'published'),
(4, 4, 'Meet Karthik — Content Creator','He posts 30 times a week across 5 platforms. Here is how he manages it all.', 'image',    'published'),
(5, 4, 'Team Spotlight: Anita',        'Our design lead shares how she keeps every campaign consistent.', 'image',    'draft'),
(3, 4, 'Customer Love Story',          'How a small bakery in Pune uses SuprMnds to reach 10,000 customers.', 'image',    'approved'),

-- Diwali Special (campaign 3)
(4, 3, 'Diwali Gift Guide 2026',       'Curated gift ideas for family, friends, and colleagues.', 'carousel', 'draft'),
(3, 3, 'Diwali Sale Announcement',     'Flat 60% off starting October 20th. Save the date.', 'image',    'draft'),
(5, 3, 'Diwali Recipes Reel',          'Quick 30-second recipes for your festive sweets.', 'video',    'draft'),

-- Brand Awareness (campaign 5)
(3, 5, 'Why Social Media Matters',     'A short thread on why every business needs a social presence in 2026.', 'text',     'draft'),
(4, 5, 'Our Mission Statement',        'We believe content creation should be effortless. Here is our vision.', 'text',     'draft'),

-- No campaign (organic posts)
(3, NULL, 'Weekend Motivation',        'Rest is productive too. Take a break, recharge, come back stronger.', 'image',    'published'),
(4, NULL, 'Monday Mood',               'New week, new goals. Let us crush it together!', 'image',    'published'),
(5, NULL, 'Industry News Roundup',     'Top 5 things happening in tech this week.', 'link',     'approved'),
(3, NULL, 'Quick Tip Tuesday',         'Pro tip: Batch your content creation on Sundays for the whole week.', 'text',     'published'),
(4, NULL, 'Follower Milestone!',       'We just hit 100K followers. Thank you for being part of this journey!', 'image',    'scheduled'),
(5, NULL, 'Behind the Code',           'A day in the life of a SuprMnds engineer.', 'carousel', 'draft'),
(3, NULL, 'Ask Us Anything',           'Drop your questions in the comments — we are answering all day.', 'text',     'published'),
(4, NULL, 'Poll: What Do You Want?',   'Vote for the next feature you want us to build.', 'text',     'published'),
(5, NULL, 'Sunday Inspiration',        'Every expert was once a beginner. Keep going.', 'image',    'published'),
(3, NULL, 'Monthly Recap — March',     'Here is everything we shipped last month.', 'carousel', 'approved'),
(4, NULL, 'Team Retreat Photos',       'Our annual team retreat in Goa. The memories we made!', 'carousel', 'published'),
(5, NULL, '5 Mistakes to Avoid',       'Common content mistakes we see brands make every day.', 'text',     'published'),
(3, NULL, 'Feature Friday: Scheduling','Deep dive into our scheduling engine and timezone handling.', 'image',    'scheduled'),
(4, NULL, 'User Q&A Session',          'We answered your top 10 questions about the platform.', 'video',    'published'),
(5, NULL, 'Holiday Greetings',         'Wishing you and your loved ones a wonderful holiday season.', 'image',    'scheduled'),
(3, NULL, 'How We Handle 10K Posts',   'A look at our backend architecture for scaling.', 'link',     'draft'),
(4, NULL, 'Accessibility Update',      'We just shipped dark mode and improved contrast. Try it now!', 'image',    'published'),
(5, NULL, 'Our Favorite Tools',        'The 10 tools our team uses every single day.', 'link',     'approved'),
(3, NULL, 'Creative Prompt Challenge', 'Write a post using only 5 words. Share yours below.', 'text',     'published');

-- ============================================================
-- 5. POST TARGETS (multiple platforms per post)
-- ============================================================
INSERT INTO post_targets (post_id, account_id, platform_id, adapted_content, scheduled_at, published_at, status) VALUES
-- Posts 1-5: Summer Sale
(1, 1, 1, 'Get 50% off on all items this summer! Our biggest sale of the year starts now.', '2026-05-01 10:00:00', '2026-05-01 10:00:15', 'published'),
(1, 3, 2, 'Summer Sale 🌞 50% OFF everything! #summer #sale #fashion',                      '2026-05-01 11:00:00', '2026-05-01 11:00:08', 'published'),
(1, 5, 3, '50% OFF this summer! Shop now 👉',                                                '2026-05-01 12:00:00', '2026-05-01 12:00:02', 'published'),

(2, 1, 1, 'Fashion deals you cannot miss. New arrivals at half price.',  '2026-05-02 10:00:00', '2026-05-02 10:00:10', 'published'),
(2, 3, 2, 'New arrivals at HALF price 😍 #fashion #newin',              '2026-05-02 11:00:00', '2026-05-02 11:00:05', 'published'),

(3, 1, 1, 'Laptops, headphones, smartwatches — all 50% off.',            '2026-05-03 10:00:00', '2026-05-03 10:00:20', 'published'),
(3, 5, 3, 'Tech deals you cannot miss. 50% off today only.',             '2026-05-03 12:00:00', '2026-05-03 12:00:00', 'published'),
(3, 6, 4, 'Our electronics lineup is now 50% off for Summer Sale 2026.', '2026-05-03 14:00:00', '2026-05-03 14:00:30', 'published'),

(4, 1, 1, 'Final hours! Sale ends tonight.',                             '2026-05-31 18:00:00', NULL, 'scheduled'),
(4, 3, 2, 'LAST CHANCE! Sale ends tonight ⏰',                            '2026-05-31 19:00:00', NULL, 'scheduled'),
(4, 5, 3, 'Final hours of our Summer Sale. Do not miss it.',              '2026-05-31 20:00:00', NULL, 'scheduled'),

-- Posts 6-10: Product Launch
(6, 1, 1, 'We have been working on something incredible. Reveal on April 15.', '2026-04-08 09:00:00', '2026-04-08 09:00:00', 'published'),
(6, 3, 2, 'Something BIG is coming 👀 #teaser #newproduct',                     '2026-04-08 10:00:00', '2026-04-08 10:00:12', 'published'),
(6, 7, 5, 'POV: you are about to see something game-changing 👀',                '2026-04-08 11:00:00', '2026-04-08 11:00:00', 'published'),

(7, 1, 1, 'A first look at the future of our platform.',                       '2026-04-10 09:00:00', '2026-04-10 09:00:05', 'published'),
(7, 3, 2, 'Sneak peek 🤫 Full reveal coming soon',                              '2026-04-10 10:00:00', '2026-04-10 10:00:15', 'published'),
(7, 6, 4, 'The future of content management is almost here.',                   '2026-04-10 14:00:00', '2026-04-10 14:00:30', 'published'),

(8, 1, 1, 'Introducing SuprMnds AI — the smartest way to manage content.',      '2026-04-15 09:00:00', '2026-04-15 09:00:00', 'published'),
(8, 3, 2, 'IT IS HERE 🚀 Meet SuprMnds AI',                                     '2026-04-15 10:00:00', '2026-04-15 10:00:10', 'published'),
(8, 5, 3, 'Launch day! Meet SuprMnds AI 🚀',                                    '2026-04-15 11:00:00', '2026-04-15 11:00:00', 'published'),
(8, 6, 4, 'Introducing SuprMnds AI — automate your entire content workflow.',   '2026-04-15 12:00:00', '2026-04-15 12:00:00', 'published'),
(8, 8, 6, 'Full demo video of SuprMnds AI on our YouTube channel.',              '2026-04-15 14:00:00', '2026-04-15 14:00:00', 'published'),

(9, 7, 5, 'Watch how SuprMnds AI writes and schedules your posts automatically.', '2026-04-20 10:00:00', NULL, 'scheduled'),
(9, 8, 6, 'AI Feature Demo — 3 min walkthrough',                                  '2026-04-20 12:00:00', NULL, 'scheduled'),

-- Posts 11-14: Customer Stories
(11, 1, 1, 'From 500 to 50,000 followers in 8 months. Read Priya''s story.',  '2026-01-15 10:00:00', '2026-01-15 10:00:00', 'published'),
(11, 3, 2, 'Her secret? Consistency + SuprMnds ✨',                            '2026-01-15 11:00:00', '2026-01-15 11:00:00', 'published'),
(11, 6, 4, 'Case study: How one creator scaled 100x in under a year.',         '2026-01-15 14:00:00', '2026-01-15 14:00:00', 'published'),

(12, 1, 1, 'He posts 30 times a week across 5 platforms. Here is how.',        '2026-02-10 10:00:00', '2026-02-10 10:00:00', 'published'),
(12, 3, 2, 'Meet the creator who never misses a post day 📅',                   '2026-02-10 11:00:00', '2026-02-10 11:00:00', 'published'),

(14, 1, 1, 'How a small bakery in Pune uses SuprMnds to reach 10k customers.', '2026-03-05 10:00:00', '2026-03-05 10:00:00', 'published'),
(14, 4, 2, 'From local bakery to viral sensation 🥐',                            '2026-03-05 11:00:00', '2026-03-05 11:00:00', 'published'),

-- Posts 19-30: Organic
(19, 1, 1, 'Rest is productive too. Take a break, recharge, come back stronger.', '2026-03-15 09:00:00', '2026-03-15 09:00:00', 'published'),
(19, 3, 2, 'Weekend reminder: rest IS productive 🌿',                              '2026-03-15 10:00:00', '2026-03-15 10:00:00', 'published'),

(20, 1, 1, 'New week, new goals. Let us crush it together!',                       '2026-03-16 08:00:00', '2026-03-16 08:00:00', 'published'),
(20, 3, 2, 'Monday mood: motivated 💪',                                             '2026-03-16 09:00:00', '2026-03-16 09:00:00', 'published'),

(21, 6, 4, 'Top 5 things happening in tech this week.',                            '2026-03-17 10:00:00', '2026-03-17 10:00:00', 'published'),
(21, 5, 3, 'Your weekly tech roundup 🧵',                                           '2026-03-17 11:00:00', '2026-03-17 11:00:00', 'published'),

(22, 1, 1, 'Pro tip: Batch your content on Sundays.',                              '2026-03-18 10:00:00', '2026-03-18 10:00:00', 'published'),
(22, 3, 2, 'Sunday content prep = smoother week 🗓️',                                '2026-03-18 11:00:00', '2026-03-18 11:00:00', 'published'),

(23, 1, 1, 'We just hit 100K followers. Thank you!',                               '2026-04-01 10:00:00', NULL, 'scheduled'),
(23, 3, 2, '100K STRONG 💜 Thank you for everything!',                              '2026-04-01 11:00:00', NULL, 'scheduled'),

(26, 1, 1, 'Drop your questions in the comments — answering all day!',              '2026-03-20 10:00:00', '2026-03-20 10:00:00', 'published'),
(26, 3, 2, 'AMA day! Ask us anything 👇',                                            '2026-03-20 11:00:00', '2026-03-20 11:00:00', 'published'),

(27, 1, 1, 'Vote for the next feature you want us to build.',                        '2026-03-21 10:00:00', '2026-03-21 10:00:00', 'published'),

(28, 3, 2, 'Every expert was once a beginner 🌱',                                    '2026-03-22 11:00:00', '2026-03-22 11:00:00', 'published'),
(28, 5, 3, 'Keep going. You are closer than you think.',                             '2026-03-22 12:00:00', '2026-03-22 12:00:00', 'published'),

(30, 1, 1, 'Our annual team retreat in Goa. The memories we made!',                  '2026-03-25 10:00:00', '2026-03-25 10:00:00', 'published'),
(30, 3, 2, 'Team retreat dump 📸🌴',                                                  '2026-03-25 11:00:00', '2026-03-25 11:00:00', 'published'),
(30, 4, 2, 'Stories: 24 hours of Goa 🌊',                                             '2026-03-25 12:00:00', '2026-03-25 12:00:00', 'published'),

(31, 6, 4, 'Common content mistakes we see brands make.',                             '2026-03-26 10:00:00', '2026-03-26 10:00:00', 'published'),
(31, 5, 3, 'Thread: 5 content mistakes to avoid 🧵',                                  '2026-03-26 11:00:00', '2026-03-26 11:00:00', 'published'),

(33, 1, 1, 'We answered your top 10 questions about the platform.',                    '2026-03-28 10:00:00', '2026-03-28 10:00:00', 'published'),
(33, 8, 6, 'User Q&A — 12 min video walkthrough',                                       '2026-03-28 12:00:00', '2026-03-28 12:00:00', 'published'),

(36, 1, 1, 'We just shipped dark mode and improved contrast.',                          '2026-04-02 10:00:00', '2026-04-02 10:00:00', 'published'),
(36, 3, 2, 'Dark mode is HERE 🌙 Try it now!',                                          '2026-04-02 11:00:00', '2026-04-02 11:00:00', 'published'),

(38, 3, 2, 'Write a post using only 5 words. Share yours 👇',                            '2026-04-05 10:00:00', '2026-04-05 10:00:00', 'published'),
(38, 5, 3, 'Creative prompt: 5-word post challenge ✍️',                                 '2026-04-05 11:00:00', '2026-04-05 11:00:00', 'published');

-- ============================================================
-- 6. MEDIA
-- ============================================================
INSERT INTO media (file_name, file_path, media_type, file_size, uploaded_by) VALUES
('summer_sale_banner.jpg',    '/uploads/sample-summer-sale.jpg',    'image', 245000, 3),
('product_teaser.mp4',        '/uploads/sample-product-teaser.mp4', 'video', 4500000, 3),
('launch_video.mp4',          '/uploads/sample-launch.mp4',         'video', 8200000, 3),
('team_retreat_01.jpg',       '/uploads/sample-team-01.jpg',        'image', 380000, 5),
('team_retreat_02.jpg',       '/uploads/sample-team-02.jpg',        'image', 412000, 5),
('customer_story_priya.jpg',  '/uploads/sample-priya.jpg',          'image', 195000, 3),
('feature_promo.png',         '/uploads/sample-feature.png',        'image', 156000, 4),
('brand_guidelines.pdf',      '/uploads/sample-guidelines.pdf',     'document', 890000, 2);

INSERT INTO post_media (post_id, media_id, display_order) VALUES
(1,  1, 0),
(6,  2, 0),
(8,  3, 0),
(11, 6, 0),
(30, 4, 0),
(30, 5, 1),
(36, 7, 0),
(1,  8, 1);

-- ============================================================
-- 7. TAGS
-- ============================================================
INSERT INTO tags (name) VALUES
('sale'), ('summer'), ('promo'), ('launch'), ('new-product'),
('customer-story'), ('testimonial'), ('festival'), ('diwali'),
('tech'), ('tips'), ('milestone'), ('team'), ('creative'),
('feature'), ('ai'), ('video'), ('carousel'), ('organic');

INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1),(1, 2),(1, 3),
(2, 1),(2, 2),
(3, 1),(3, 2),
(4, 1),(4, 2),
(6, 4),(6, 5),(6, 16),
(7, 4),(7, 16),
(8, 4),(8, 16),(8, 17),
(11, 6),(11, 7),
(12, 6),(12, 7),
(14, 6),
(15, 8),(15, 9),
(16, 8),(16, 9),
(19, 12),
(21, 10),(21, 11),
(22, 11),
(23, 12),
(26, 11),
(28, 11),(28, 12),
(30, 13),
(31, 11),
(33, 11),
(36, 15),
(38, 14);

-- ============================================================
-- 8. ANALYTICS
-- ============================================================
INSERT INTO analytics (target_id, impressions, reach, likes, comments_count, shares, clicks, views, engagement_rate) VALUES
(1,  45000, 38000, 3200, 180, 420,  890,  0,     9.50),
(2,  62000, 51000, 4800, 320, 610,  1240, 0,     11.80),
(3,  28000, 23000, 1850, 95,  220,  410,  0,     9.30),
(4,  22000, 18000, 1400, 80,  190,  380,  0,     9.20),
(5,  18000, 15000, 1150, 62,  150,  290,  0,     9.10),
(6,  52000, 44000, 4100, 220, 550,  0,    8900,  11.10),
(7,  31000, 26000, 2200, 140, 310,  520,  0,     10.30),
(8,  18000, 15000, 1300, 80,  180,  260,  0,     10.40),
(9,  95000, 78000, 8200, 480, 1100, 2100, 0,     12.60),
(10, 88000, 72000, 7600, 420, 980,  0,    22500, 11.30),
(11, 14000, 12000, 980,  62,  140,  180,  0,     9.80),
(12, 11000, 9500,  780,  48,  110,  150,  0,     9.20),
(13, 8900,  7500,  590,  32,  85,   105,  0,     9.30),
(14, 7200,  6100,  480,  28,  72,   92,   0,     9.50),
(15, 6600,  5600,  440,  24,  62,   85,   0,     9.50),
(16, 5800,  4900,  380,  20,  52,   68,   0,     9.20),
(17, 4400,  3800,  290,  14,  38,   50,   0,     8.90),
(18, 6200,  5300,  420,  22,  58,   78,   0,     9.40),
(19, 8100,  6900,  550,  30,  82,   0,    1250,  9.60),
(20, 3900,  3300,  260,  12,  34,   45,   0,     9.00),
(21, 2900,  2500,  190,  9,   25,   32,   0,     8.90),
(22, 3600,  3100,  240,  11,  32,   42,   0,     9.00),
(23, 4400,  3800,  290,  14,  38,   52,   0,     9.30),
(24, 3700,  3200,  245,  12,  32,   0,    620,   9.20),
(25, 2900,  2500,  190,  9,   24,   30,   0,     8.90),
(26, 2200,  1900,  145,  7,   18,   24,   0,     8.80),
(27, 1900,  1600,  120,  5,   15,   20,   0,     8.70),
(28, 2400,  2100,  160,  8,   20,   28,   0,     8.90),
(29, 2100,  1800,  140,  6,   18,   22,   0,     8.80),
(30, 3100,  2700,  205,  10,  28,   36,   0,     9.00),
(31, 3700,  3200,  245,  12,  32,   42,   0,     9.10),
(32, 2900,  2500,  190,  9,   25,   32,   0,     8.95),
(33, 4400,  3800,  295,  14,  38,   52,   0,     9.30),
(34, 2900,  2500,  195,  9,   26,   34,   0,     9.10),
(35, 4400,  3800,  290,  14,  38,   52,   0,     9.35),
(36, 5200,  4500,  350,  18,  46,   62,   0,     9.40),
(37, 3700,  3200,  245,  12,  32,   0,    580,   9.20),
(38, 2900,  2500,  190,  9,   25,   32,   0,     9.00),
(39, 4400,  3800,  295,  14,  38,   52,   0,     9.30),
(40, 2900,  2500,  190,  9,   25,   32,   0,     9.00);

-- ============================================================
-- 9. COMMENTS
-- ============================================================
INSERT INTO comments (target_id, author_name, comment_text, commented_at, sentiment, replied) VALUES
(1,  'Ravi Kumar',      'Great offer! Just ordered 3 items 🎉',                              '2026-05-01 12:30:00', 'positive', TRUE),
(1,  'Sneha M',         'Is this available in Chennai store?',                              '2026-05-01 13:15:00', 'neutral',  TRUE),
(1,  'Amit Patel',      'Prices are still higher than last year.',                           '2026-05-01 14:00:00', 'negative', FALSE),
(2,  'Divya S',         'Love the new collection! 😍',                                       '2026-05-01 15:20:00', 'positive', FALSE),
(2,  'Rohit K',         'Can you ship internationally?',                                     '2026-05-01 16:00:00', 'neutral',  TRUE),
(3,  'Meera R',         'Best sale of the year!',                                            '2026-05-02 11:45:00', 'positive', FALSE),
(4,  'Ajay M',         'Just bought the MacBook. Amazing deal.',                             '2026-05-02 13:00:00', 'positive', TRUE),
(9,  'Sundar V',        'The AI demo is mind-blowing!',                                       '2026-04-15 10:30:00', 'positive', TRUE),
(9,  'Pooja K',         'How much does the AI feature cost?',                                 '2026-04-15 11:00:00', 'neutral',  TRUE),
(9,  'Manish T',        'When is the Android app coming?',                                    '2026-04-15 11:30:00', 'neutral',  TRUE),
(10, 'Vikas P',         'Watched the full demo on YouTube. Very impressive.',                 '2026-04-15 15:00:00', 'positive', FALSE),
(11, 'Ananya B',        'This is so inspiring! Following your journey 🙌',                    '2026-01-15 12:00:00', 'positive', TRUE),
(11, 'Rahul M',         'What tools does she use?',                                            '2026-01-15 13:00:00', 'neutral',  TRUE),
(12, 'Kavya N',         '30 posts a week?! That is insane productivity!',                     '2026-02-10 12:00:00', 'positive', FALSE),
(14, 'Harsh J',         'Small businesses need more stories like this.',                      '2026-03-05 12:00:00', 'positive', TRUE),
(19, 'Deepa S',         'Needed this reminder today. Thank you 🙏',                            '2026-03-15 10:00:00', 'positive', FALSE),
(20, 'Nikhil R',        'Let us go! Monday motivation 💪',                                     '2026-03-16 09:00:00', 'positive', FALSE),
(21, 'Sameer K',        'Best tech roundup every week.',                                       '2026-03-17 12:00:00', 'positive', TRUE),
(22, 'Pallavi M',       'Starting this Sunday prep ritual!',                                   '2026-03-18 12:00:00', 'positive', FALSE),
(26, 'Girish T',        'When is the desktop app coming?',                                    '2026-03-20 11:00:00', 'neutral',  TRUE),
(26, 'Rupali S',        'Love the transparency. Big respect.',                                 '2026-03-20 12:00:00', 'positive', TRUE),
(27, 'Suresh R',        'Dark mode first please!',                                             '2026-03-21 11:00:00', 'positive', TRUE),
(28, 'Priti K',         'Needed to hear this today.',                                          '2026-03-22 12:00:00', 'positive', FALSE),
(30, 'Anjali P',        'Team retreat looks so fun!',                                          '2026-03-25 12:00:00', 'positive', TRUE),
(31, 'Ramesh N',        'Great insights. Sharing this with my team.',                          '2026-03-26 12:00:00', 'positive', FALSE),
(33, 'Manoj V',         'Really helpful Q&A. Thanks!',                                         '2026-03-28 13:00:00', 'positive', TRUE),
(36, 'Lakshmi B',       'Dark mode looks so good 🌙',                                          '2026-04-02 12:00:00', 'positive', TRUE),
(39, 'Akshay R',        'Five words? "Content made simple and beautiful."',                    '2026-04-05 12:00:00', 'positive', TRUE);

-- ============================================================
-- 10. APPROVALS
-- ============================================================
INSERT INTO approvals (post_id, requested_by, approved_by, status, comments, requested_at, decided_at) VALUES
(1,  3, 2, 'approved', 'Looks good, publish it.',                             '2026-04-29 10:00:00', '2026-04-29 14:00:00'),
(2,  3, 2, 'approved', 'Great copy. Approved.',                               '2026-04-30 10:00:00', '2026-04-30 11:30:00'),
(3,  4, 2, 'approved', 'Approved.',                                            '2026-05-01 10:00:00', '2026-05-01 12:00:00'),
(4,  3, 2, 'approved', 'Approved for scheduling.',                             '2026-05-15 10:00:00', '2026-05-15 11:00:00'),
(6,  3, 2, 'approved', 'Perfect teaser. Go live.',                             '2026-04-06 10:00:00', '2026-04-06 15:00:00'),
(8,  3, 1, 'approved', 'Launch ready.',                                        '2026-04-14 09:00:00', '2026-04-14 10:00:00'),
(9,  5, 2, 'approved', 'Nice demo.',                                           '2026-04-18 10:00:00', '2026-04-18 11:00:00'),
(11, 3, 2, 'approved', 'Beautiful story.',                                     '2026-01-12 10:00:00', '2026-01-12 11:00:00'),
(14, 3, 2, 'approved', 'Love this. Publish.',                                  '2026-03-03 10:00:00', '2026-03-03 12:00:00'),
(21, 5, 2, 'approved', 'Good roundup.',                                        '2026-03-16 10:00:00', '2026-03-16 11:00:00'),
(30, 3, 2, 'approved', 'Approved.',                                            '2026-03-23 10:00:00', '2026-03-23 12:00:00'),
(36, 4, 2, 'approved', 'Ship it.',                                             '2026-04-01 10:00:00', '2026-04-01 11:00:00'),
(38, 5, 1, 'approved', 'Approved.',                                            '2026-04-04 10:00:00', '2026-04-04 12:00:00'),
-- Pending ones
(5,  4, NULL, 'pending',  NULL, '2026-05-20 10:00:00', NULL),
(7,  4, NULL, 'pending',  NULL, '2026-04-09 10:00:00', NULL),
(12, 4, NULL, 'pending',  NULL, '2026-02-08 10:00:00', NULL),
(13, 5, NULL, 'pending',  NULL, '2026-02-20 10:00:00', NULL),
(15, 4, NULL, 'pending',  NULL, '2026-09-30 10:00:00', NULL),
(16, 3, NULL, 'pending',  NULL, '2026-09-30 11:00:00', NULL),
(17, 5, NULL, 'pending',  NULL, '2026-09-30 12:00:00', NULL),
(24, 5, NULL, 'pending',  NULL, '2026-04-05 10:00:00', NULL),
(25, 3, NULL, 'pending',  NULL, '2026-09-28 10:00:00', NULL),
-- Rejected
(18, 3, 2, 'rejected', 'Too generic. Rework the copy.',                        '2026-09-29 10:00:00', '2026-09-29 14:00:00'),
(32, 4, 2, 'rejected', 'Needs better visuals.',                                '2026-09-29 11:00:00', '2026-09-29 15:00:00');

-- ============================================================
-- 11. PUBLISH LOGS
-- ============================================================
INSERT INTO publish_logs (target_id, action, status, message) VALUES
(1,  'publish', 'success', 'Published to Facebook'),
(2,  'publish', 'success', 'Published to Instagram'),
(3,  'publish', 'success', 'Published to X (Twitter)'),
(4,  'publish', 'success', 'Published to Facebook'),
(5,  'publish', 'success', 'Published to Instagram'),
(6,  'publish', 'success', 'Published to Facebook'),
(7,  'publish', 'success', 'Published to X (Twitter)'),
(8,  'publish', 'success', 'Published to LinkedIn'),
(9,  'publish', 'success', 'Published to Facebook'),
(10, 'publish', 'success', 'Published to Instagram'),
(11, 'publish', 'success', 'Published to TikTok'),
(12, 'publish', 'success', 'Published to Facebook'),
(13, 'publish', 'success', 'Published to Instagram'),
(14, 'publish', 'success', 'Published to LinkedIn'),
(15, 'publish', 'success', 'Published to Facebook'),
(16, 'publish', 'success', 'Published to Instagram'),
(17, 'publish', 'success', 'Published to Facebook'),
(18, 'publish', 'success', 'Published to Instagram'),
(19, 'publish', 'success', 'Published to LinkedIn'),
(20, 'publish', 'success', 'Published to YouTube'),
(21, 'publish', 'success', 'Published to TikTok'),
(22, 'publish', 'success', 'Published to YouTube'),
(23, 'publish', 'success', 'Published to Facebook'),
(24, 'publish', 'success', 'Published to Instagram'),
(25, 'publish', 'success', 'Published to LinkedIn'),
(27, 'publish', 'failed',  'Rate limit exceeded. Will retry.'),
(28, 'schedule', 'success', 'Scheduled for future');

-- ============================================================
-- DONE ✅
-- ============================================================

-- Quick verification:
-- SELECT 'users',     COUNT(*) FROM users
-- UNION ALL SELECT 'social_accounts', COUNT(*) FROM social_accounts
-- UNION ALL SELECT 'campaigns',       COUNT(*) FROM campaigns
-- UNION ALL SELECT 'posts',           COUNT(*) FROM posts
-- UNION ALL SELECT 'post_targets',    COUNT(*) FROM post_targets
-- UNION ALL SELECT 'media',           COUNT(*) FROM media
-- UNION ALL SELECT 'analytics',       COUNT(*) FROM analytics
-- UNION ALL SELECT 'comments',        COUNT(*) FROM comments
-- UNION ALL SELECT 'approvals',       COUNT(*) FROM approvals
-- UNION ALL SELECT 'tags',            COUNT(*) FROM tags;