# Agent Instructions — Supr_Mnds

## Project Context
Full-stack social media CMS — Node.js + Express + MySQL + vanilla JS.
RDBMS 2nd-year project by Sandeep Borra at Lamrin Tech Skills University.

## File Structure
- /frontend  → index.html, login.html, app.js, style.css
- /backend   → server.js, db.js, /routes/*.js, /uploads/
- /database  → schema.sql, seed_v2.sql, advanced.sql

## Rules
- Backend uses CommonJS (`require`), async/await, mysql2 pool
- Frontend is vanilla JS — no frameworks, no build step
- All SQL must use parameterized queries (`?` placeholders) — never string concat
- Always escape user data with `esc()` before rendering into innerHTML
- Roles: admin, manager, editor, viewer — gate UI with `CURRENT_ROLE`
- Transactions use `conn.beginTransaction()` / `commit()` / `rollback()`

## Conventions
- Route files export a router; server.js registers them under /api/*
- Fetches go through the shared `api()` helper which attaches the Bearer token
- Toasts via `toast(msg, 'success'|'error')`
- Confirm dialogs via `showModal({title, message, icon, confirmText, danger})`

## Never
- Commit `.env`
- Concatenate user input into SQL strings
- Add npm dependencies without asking
- Change schema without updating seed_v2.sql and advanced.sql

## Goal
Polish the app and fix bugs. Prefer small, reviewable diffs. Show the diff before applying.
