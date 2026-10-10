USE social_media_cms;

-- Platforms
INSERT INTO platforms (name, base_url, char_limit, supports_images, supports_videos, supports_links) VALUES
('Facebook',    'https://facebook.com',   63206, TRUE,  TRUE,  TRUE),
('Instagram',   'https://instagram.com',   2200, TRUE,  TRUE,  FALSE),
('X (Twitter)', 'https://x.com',            280, TRUE,  TRUE,  TRUE),
('LinkedIn',    'https://linkedin.com',    3000, TRUE,  TRUE,  TRUE),
('TikTok',      'https://tiktok.com',      2200, TRUE,  TRUE,  FALSE),
('YouTube',     'https://youtube.com',     5000, TRUE,  TRUE,  TRUE);

-- Users (password = "password123" hashed with bcrypt just for demo)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin',   'admin@cms.com',   '$2b$10$m6EVVc0VbYeo4AsV.Ur9JO7l3YSuaHqhBNZjt1dccpSBymOZYFPKa', 'System Admin',  'admin'),
('manager1','manager@cms.com', '$2b$10$TnCEAc/MisSjbBNyj1btQuxK1ImLIcczbERzFLtIBUsgw/7NzoZkm', 'Priya Sharma',  'manager'),
('editor1', 'editor@cms.com',  '$2b$10$LIZghQb8uloKHRi/gVfGQOA88ZMMJ3SxJFQhpXIf4OXAJHi6w04Qu', 'Rahul Verma',   'editor'),
('viewer1', 'viewer@cms.com',  '$2b$10$uHKYUZmB57Y9HFuw8x.odu8sl1ylJvxkvU0U2I3QlNQ2h/QnJQxxi', 'Anita Rao',     'viewer');

-- Social accounts
INSERT INTO social_accounts (user_id, platform_id, account_name, account_handle) VALUES
(2, 1, 'Brand Facebook Page', '@brandpage'),
(2, 2, 'Brand Instagram',     '@brand.insta'),
(3, 3, 'Brand X Handle',      '@brandx'),
(3, 4, 'Brand LinkedIn',      'brand-company');

-- Campaigns
INSERT INTO campaigns (name, description, start_date, end_date, status, created_by) VALUES
('Summer Sale 2026', 'Seasonal promo campaign', '2026-05-01', '2026-06-30', 'active', 2),
('Product Launch',   'New product teaser',      '2026-04-10', '2026-04-20', 'draft',  2);

-- Posts
INSERT INTO posts (user_id, campaign_id, title, content, post_type, status) VALUES
(3, 1, 'Summer Sale Announcement', 'Get 50% off on all items this summer!', 'image', 'approved'),
(3, 2, 'New Product Teaser',       'Something big is coming. Stay tuned!',  'video', 'pending');

-- Post targets (platform-specific)
INSERT INTO post_targets (post_id, account_id, platform_id, adapted_content, scheduled_at, status, platform_options) VALUES
(1, 1, 1, 'Get 50% off on all items this summer! Shop now 👉',        '2026-05-01 10:00:00', 'scheduled', JSON_OBJECT('boost', true)),
(1, 2, 2, 'Summer Sale 🌞 50% OFF! #summer #sale #fashion',           '2026-05-01 11:00:00', 'scheduled', JSON_OBJECT('hashtags', JSON_ARRAY('summer','sale'))),
(1, 3, 3, '50% OFF this summer! #SummerSale',                          '2026-05-01 12:00:00', 'scheduled', NULL),
(2, 4, 4, 'We are launching something new. Follow our page for updates.','2026-04-15 09:00:00', 'pending', NULL);

-- Analytics
INSERT INTO analytics (target_id, impressions, reach, likes, comments_count, shares, clicks, views, engagement_rate) VALUES
(1, 15000, 12000, 850, 45, 120, 300, 0,    8.75),
(2, 22000, 18000, 1400, 90, 210, 450, 0,   12.10),
(3, 8000,  6500,  320, 15, 40,  90,  0,    5.20);

-- Comments
INSERT INTO comments (target_id, author_name, comment_text, commented_at, sentiment) VALUES
(1, 'Ravi K', 'Great offer!',         '2026-05-01 12:30:00', 'positive'),
(2, 'Sneha M','Is this available online?', '2026-05-01 13:15:00', 'neutral'),
(1, 'Amit P', 'Too expensive.',       '2026-05-01 14:00:00', 'negative');

-- Tags
INSERT INTO tags (name) VALUES ('sale'), ('summer'), ('promo'), ('launch');

INSERT INTO post_tags (post_id, tag_id) VALUES (1,1),(1,2),(1,3),(2,4);

-- Approvals
INSERT INTO approvals (post_id, requested_by, status, comments) VALUES
(1, 3, 'approved', 'Looks good.'),
(2, 3, 'pending',  NULL);

-- Publish logs
INSERT INTO publish_logs (target_id, action, status, message) VALUES
(1, 'schedule', 'success', 'Scheduled for Facebook'),
(2, 'schedule', 'success', 'Scheduled for Instagram'),
(3, 'schedule', 'success', 'Scheduled for X');