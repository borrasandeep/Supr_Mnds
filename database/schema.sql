-- =========================================================
-- SOCIAL MEDIA CONTENT MANAGEMENT DATABASE (MySQL 8+)
-- =========================================================

DROP DATABASE IF EXISTS social_media_cms;
CREATE DATABASE social_media_cms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE social_media_cms;

-- ---------------------------------------------------------
-- 1. PLATFORMS
-- ---------------------------------------------------------
CREATE TABLE platforms (
    platform_id     INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    base_url        VARCHAR(255),
    char_limit      INT DEFAULT 2200,
    supports_images BOOLEAN DEFAULT TRUE,
    supports_videos BOOLEAN DEFAULT TRUE,
    supports_links  BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 2. USERS
-- ---------------------------------------------------------
CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100),
    role          ENUM('admin','manager','editor','viewer') NOT NULL DEFAULT 'editor',
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 3. SOCIAL ACCOUNTS
-- ---------------------------------------------------------
CREATE TABLE social_accounts (
    account_id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    platform_id      INT NOT NULL,
    account_name     VARCHAR(100) NOT NULL,
    account_handle   VARCHAR(100),
    access_token     TEXT,
    refresh_token    TEXT,
    token_expires_at TIMESTAMP NULL,
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sa_user     FOREIGN KEY (user_id)     REFERENCES users(user_id)     ON DELETE CASCADE,
    CONSTRAINT fk_sa_platform FOREIGN KEY (platform_id) REFERENCES platforms(platform_id),
    UNIQUE KEY uq_platform_handle (platform_id, account_handle)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 4. CAMPAIGNS
-- ---------------------------------------------------------
CREATE TABLE campaigns (
    campaign_id  INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    description  TEXT,
    start_date   DATE,
    end_date     DATE,
    status       ENUM('draft','active','paused','completed') DEFAULT 'draft',
    created_by   INT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_camp_user FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 5. POSTS (master content)
-- ---------------------------------------------------------
CREATE TABLE posts (
    post_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    campaign_id INT NULL,
    title       VARCHAR(200),
    content     TEXT NOT NULL,
    post_type   ENUM('text','image','video','carousel','link','story') DEFAULT 'text',
    status      ENUM('draft','pending','approved','scheduled','published','failed') DEFAULT 'draft',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_user     FOREIGN KEY (user_id)     REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_post_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 6. POST TARGETS (platform-specific version)
-- ---------------------------------------------------------
CREATE TABLE post_targets (
    target_id        INT AUTO_INCREMENT PRIMARY KEY,
    post_id          INT NOT NULL,
    account_id       INT NOT NULL,
    platform_id      INT NOT NULL,
    adapted_content  TEXT,
    scheduled_at     TIMESTAMP NULL,
    published_at     TIMESTAMP NULL,
    status           ENUM('pending','scheduled','published','failed') DEFAULT 'pending',
    platform_post_id VARCHAR(255),
    error_message    TEXT,
    platform_options JSON,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pt_post     FOREIGN KEY (post_id)     REFERENCES posts(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_account  FOREIGN KEY (account_id)  REFERENCES social_accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_platform FOREIGN KEY (platform_id) REFERENCES platforms(platform_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 7. MEDIA
-- ---------------------------------------------------------
CREATE TABLE media (
    media_id    INT AUTO_INCREMENT PRIMARY KEY,
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    media_type  ENUM('image','video','audio','document') NOT NULL,
    file_size   INT,
    width       INT,
    height      INT,
    duration    INT,
    uploaded_by INT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE post_media (
    post_id       INT NOT NULL,
    media_id      INT NOT NULL,
    display_order INT DEFAULT 0,
    PRIMARY KEY (post_id, media_id),
    CONSTRAINT fk_pm_post  FOREIGN KEY (post_id)  REFERENCES posts(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_media FOREIGN KEY (media_id) REFERENCES media(media_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 8. ANALYTICS
-- ---------------------------------------------------------
CREATE TABLE analytics (
    analytics_id    INT AUTO_INCREMENT PRIMARY KEY,
    target_id       INT NOT NULL,
    measured_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    impressions     INT DEFAULT 0,
    reach           INT DEFAULT 0,
    likes           INT DEFAULT 0,
    comments_count  INT DEFAULT 0,
    shares          INT DEFAULT 0,
    clicks          INT DEFAULT 0,
    views           INT DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    CONSTRAINT fk_an_target FOREIGN KEY (target_id) REFERENCES post_targets(target_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 9. COMMENTS
-- ---------------------------------------------------------
CREATE TABLE comments (
    comment_id          INT AUTO_INCREMENT PRIMARY KEY,
    target_id           INT NOT NULL,
    platform_comment_id VARCHAR(255),
    author_name         VARCHAR(100),
    comment_text        TEXT,
    commented_at        TIMESTAMP NULL,
    sentiment           ENUM('positive','neutral','negative') DEFAULT 'neutral',
    replied             BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cm_target FOREIGN KEY (target_id) REFERENCES post_targets(target_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 10. TAGS
-- ---------------------------------------------------------
CREATE TABLE tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    name   VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE post_tags (
    post_id INT NOT NULL,
    tag_id  INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    CONSTRAINT fk_ptg_post FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_ptg_tag  FOREIGN KEY (tag_id)  REFERENCES tags(tag_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 11. APPROVALS
-- ---------------------------------------------------------
CREATE TABLE approvals (
    approval_id  INT AUTO_INCREMENT PRIMARY KEY,
    post_id      INT NOT NULL,
    requested_by INT,
    approved_by  INT,
    status       ENUM('pending','approved','rejected') DEFAULT 'pending',
    comments     TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decided_at   TIMESTAMP NULL,
    CONSTRAINT fk_ap_post     FOREIGN KEY (post_id)      REFERENCES posts(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_ap_req      FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_ap_approved FOREIGN KEY (approved_by)  REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 12. PUBLISH LOGS
-- ---------------------------------------------------------
CREATE TABLE publish_logs (
    log_id    INT AUTO_INCREMENT PRIMARY KEY,
    target_id INT NOT NULL,
    action    VARCHAR(50),
    status    VARCHAR(20),
    message   TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pl_target FOREIGN KEY (target_id) REFERENCES post_targets(target_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------
CREATE INDEX idx_pt_schedule ON post_targets(status, scheduled_at);
CREATE INDEX idx_an_target   ON analytics(target_id, measured_at);
CREATE INDEX idx_cm_target   ON comments(target_id, commented_at);
CREATE INDEX idx_posts_user  ON posts(user_id, status);