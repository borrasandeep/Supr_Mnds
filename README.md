# Supr_Mnds

> A full-stack Social Media Content Management System to create, schedule, approve, and analyze content across 6 major platforms.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![MySQL](https://img.shields.io/badge/mysql-%3E%3D8.0-blue)

---

## 📖 About

**Supr_Mnds** is a centralized workspace that helps teams manage their social media presence from one dashboard. Instead of juggling six different apps, content creators, managers, and admins can:

- Draft content once and adapt it per platform
- Schedule posts for Facebook, Instagram, X (Twitter), LinkedIn, TikTok, and YouTube
- Route posts through an approval workflow
- Track engagement metrics across all platforms
- Run analytics on what performs best

Built as a full-stack web application with a strong focus on **role-based access control** and a **clean, modern UI**.

---

## ✨ Features

### Content Management
- 📝 Create, edit, and delete posts
- 🎯 Adapt one post into multiple platform-specific versions
- 🖼 Attach images, videos, or PDFs (up to 20 MB)
- 📅 Schedule posts for a future date and time
- 🏷 Organize content with tags and campaigns

### Workflow & Collaboration
- ✅ Approval workflow: editors request, managers approve/reject
- 👥 Role-based dashboards for **admin / manager / editor / viewer**
- 💬 Inline status badges (draft, pending, approved, scheduled, published, failed)
- 🔔 Toast notifications and confirm dialogs

### Analytics
- 📊 Engagement charts by platform (Chart.js)
- 📈 Top-performing posts leaderboard
- 💡 Content pipeline status (draft → published funnel)

### Platform Support
Facebook · Instagram · X (Twitter) · LinkedIn · TikTok · YouTube

### Interface
- 🌙 Light / dark theme with system preference detection
- 🎨 Cosmic split-screen login page
- 📱 Fully responsive (mobile sidebar collapses to top bar)
- ⚡ Smooth micro-animations, skeleton loaders, empty states
- 🗄 Built-in **Database Admin** panel (admin-only) with SQL query runner

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES2020) |
| **Backend** | Node.js 18+, Express 4 |
| **Database** | MySQL 8 |
| **Authentication** | bcrypt + sessionStorage |
| **File Uploads** | Multer |
| **Charts** | Chart.js 4 |
| **Fonts** | Plus Jakarta Sans, JetBrains Mono |
| **Version Control** | Git + GitHub |

## 📁 Project Structure

```
Supr_Mnds/
|
+-- backend/
|   +-- routes/
|   |   +-- auth.js             Login endpoint
|   |   +-- users.js            User CRUD
|   |   +-- accounts.js         Social account CRUD
|   |   +-- platforms.js        Platform metadata
|   |   +-- campaigns.js        Campaign CRUD
|   |   +-- posts.js            Post CRUD + approval request
|   |   +-- targets.js          Per-platform targets
|   |   +-- analytics.js        Engagement metrics
|   |   +-- comments.js         Comment management
|   |   +-- approvals.js        Approval decisions
|   |   +-- media.js            File uploads
|   |   +-- admin.js            DB admin (read-only)
|   +-- uploads/                User-uploaded media
|   +-- db.js                   MySQL connection pool
|   +-- server.js               Express app entry
|   +-- .env.example            Environment template
|   +-- package.json
|
+-- frontend/
|   +-- login.html              Split-screen cosmic login
|   +-- index.html              Main dashboard
|   +-- style.css               All styles + theming
|   +-- app.js                  Frontend logic
|
+-- database/
|   +-- schema.sql              14 table definitions
|   +-- seed.sql                Minimal seed
|   +-- seed_v2.sql             Rich demo data
|
+-- .gitignore
+-- README.md
```

## 🗄 Database Schema

14 tables covering all aspects of content management:

| Table | Purpose |
|---|---|
| `users` | Team members with roles |
| `platforms` | Supported social platforms |
| `social_accounts` | Connected accounts per user/platform |
| `campaigns` | Marketing campaigns |
| `posts` | Master content |
| `post_targets` | Platform-specific versions of posts |
| `media` | Uploaded files |
| `post_media` | Post ↔ media linking |
| `analytics` | Engagement metrics per target |
| `comments` | Comments received on published posts |
| `tags` / `post_tags` | Content categorization |
| `approvals` | Approval workflow records |
| `publish_logs` | Publish attempt history |

**Key design principle:** a post has one master record and multiple `post_targets` (one per platform account), each with its own adapted content, schedule, and status. This reflects how real social media tools work.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MySQL ≥ 8
- A modern web browser

### 1. Clone the repository

```bash
git clone https://github.com/borrasandeep/Supr_Mnds.git
cd Supr_Mnds