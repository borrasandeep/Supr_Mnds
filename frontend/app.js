const BASE = 'http://localhost:5000';
const API = `${BASE}/api`;

/* ---------- GSAP safety shim ---------- */
window.gsap = window.gsap ||
{
  to: (target, opts) => { if (opts?.onUpdate) opts.onUpdate(); },
  fromTo: () => {},
  killTweensOf: () => {}
};

/* ---------- Theme ---------- */
function applyTheme(theme) 
{
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('cms_theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  if (typeof loadUpcoming === 'function' && document.querySelector('#platformChart')) {
    setTimeout(() => loadUpcoming(), 60);
  }
}

function toggleTheme()
{
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}
window.toggleTheme = toggleTheme;

// Apply saved theme immediately on load
applyTheme(localStorage.getItem('cms_theme') || 'light');

/* ---------- Auth ---------- */
const ME = JSON.parse(sessionStorage.getItem('cms_user') || 'null');
if (!ME) window.location.replace('login.html');

const CURRENT_USER_ID = ME ? ME.user_id : null;
const CURRENT_ROLE = ME ? ME.role : 'viewer';

function logout()
{
  sessionStorage.removeItem('cms_user');
  sessionStorage.removeItem('cms_token');
  window.location.href = 'login.html';
}
window.logout = logout;

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
// Supr_Mnds brand logo (SVG data URL) — used in preview avatars
const SUPR_LOGO_SVG = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" style="width:100%;height:100%;display:block;">
    <rect x="4"  y="8"  width="5" height="16" rx="2" fill="#c4b5fd"/>
    <rect x="13" y="4"  width="6" height="24" rx="2" fill="#a855f7"/>
    <rect x="23" y="8"  width="5" height="16" rx="2" fill="#c4b5fd"/>
  </svg>`;

// Returns the avatar HTML — always uses the Supr_Mnds logo
function avatarHtml()
{
  return `<div class="brand-avatar">${SUPR_LOGO_SVG}</div>`;
}

/* ---------- Line icon library ---------- */
const ICON = 
{
  clock:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  clockAlert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  message:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  activity:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  rocket:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>`,
  checkCircle:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  xCircle:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  alert:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  hourglass:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`,
  edit:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  send:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  download:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  image:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  video:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
  file:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  user:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  folder:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  bell:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  chart:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
  sparkle:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg>`,
  inbox:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  search:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
};

function icon(name, size = 16)
{
  const svg = ICON[name] || ICON.sparkle;
  return `<span class="line-icon" style="width:${size}px;height:${size}px;">${svg}</span>`;
}

function icon(name, size = 16)
{
  const svg = ICON[name] || ICON.sparkle;
  return `<span class="line-icon" style="width:${size}px;height:${size}px;">${svg}</span>`;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtDate = (d) =>
{
  if (!d) return '-';
  const dt = new Date(d);
  return isNaN(dt) ? esc(d) : dt.toLocaleString();
};

const relTime = (d) =>
{
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return esc(d);

  const now = new Date();
  const diffSec = Math.floor((now - dt) / 1000);

  // Future
  if (diffSec < 0) {
    const abs = Math.abs(diffSec);
    if (abs < 60) return 'in a moment';
    if (abs < 3600) return `in ${Math.floor(abs / 60)}m`;
    if (abs < 86400) return `in ${Math.floor(abs / 3600)}h`;
    if (abs < 604800) return `in ${Math.floor(abs / 86400)}d`;
    return dt.toLocaleDateString();
  }

  // Past
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 604800)}w ago`;

  return dt.toLocaleDateString();
};

// Wrap in a span with a title (tooltip) showing the exact date
const relTimeWithTooltip = (d) =>
{
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return esc(d);
  return `<span title="${esc(dt.toLocaleString())}">${relTime(d)}</span>`;
};

function exportCSV(filename, rows, columns)
{
  if (!rows || rows.length === 0) 
  {
    toast('Nothing to export', 'error');
    return;
  }

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
};

  const header = columns.map(c => escapeCell(c.label)).join(',');
  const body = rows.map(row =>
    columns.map(c => escapeCell(typeof c.value === 'function' ? c.value(row) : row[c.value])).join(',')
  ).join('\n');

  const csv = '\ufeff' + header + '\n' + body; // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast(`Exported ${rows.length} rows to ${filename}`, 'success');
}

window.exportCSV = exportCSV;

async function api(path, options = {})
{
  const token = sessionStorage.getItem('cms_token');
  const headers = 
  {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401 || res.status === 403)
  {
    sessionStorage.removeItem('cms_user');
    sessionStorage.removeItem('cms_token');
    window.location.replace('login.html');
    return;
  }

  if (!res.ok)
  {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json().catch(() => ({}));
}

const jsonPost = (path, body) => api(path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

let toastTimer;
function toast(msg, type = '') 
{
  const el = $('toast');
  if (!el) 
  {
    console.warn('Toast-', msg); return;
  }

  el.textContent = msg;
  el.className = 'toast ' + type + ' show';

  gsap.killTweensOf(el);
  gsap.fromTo(el,
    { x: 50, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.6)' }
  );

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() =>
    {
      gsap.to(el, {
      x: 50,
      opacity: 0,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => el.classList.remove('show')
    });
  }, 2500);
}

async function safe(fn)
{
  try { return await fn(); }
  catch (e) { toast(e.message || 'Something went wrong', 'error'); }
}

const emptyRow = (cols, msg) =>
  `<tr><td colspan="${cols}" style="text-align:center;color:#9ca3af;padding:1.5rem;">${msg}</td></tr>`;


/* ---------- Cached data ---------- */
let accountsCache = [];
let currentPostFilter = 'all';
let currentPostSearch = '';
let currentPostSort = 'newest';
let cachedPosts = [];

async function populateDropdowns() 
{
  const [users, campaigns, accounts] = await Promise.all([
    api('/users').catch(() => []),
    api('/campaigns').catch(() => []),
    api('/accounts').catch(() => [])
  ]);

  // ---------- Author dropdown ----------
  const authorLabel = $('user_id').closest('label');

  if (CURRENT_ROLE === 'editor' || CURRENT_ROLE === 'viewer') 
  {
    authorLabel.style.display = 'none';
    $('user_id').innerHTML = `<option value="${CURRENT_USER_ID}" selected>${esc(ME.full_name || ME.username)}</option>`;
  } 
  else 
  {
    authorLabel.style.display = '';
    $('user_id').innerHTML = '<option value="">Select author...</option>' +
      users.map(u => `<option value="${u.user_id}">${esc(u.full_name || u.username)} (${esc(u.role)})</option>`).join('');
  }

  // ---------- Campaign dropdown ----------
  $('campaign_id').innerHTML = '<option value="">No campaign</option>' +
    campaigns.map(c => `<option value="${c.campaign_id}">${esc(c.name)}</option>`).join('');

  // ---------- Accounts cache ----------
  accountsCache = accounts;
}

/* ---------- Role-based access ---------- */
const ROLE_TABS = 
{
  admin:   ['dashboard','posts','calendar','accounts','campaigns','users','admin','analytics','approvals'],
  manager: ['dashboard','posts','calendar','accounts','campaigns','analytics','approvals'],
  editor:  ['dashboard','posts','calendar','campaigns','analytics'],
  viewer:  ['dashboard','analytics']
};

function applyRolePermissions() 
{
  // Fill sidebar user chip
    $('me-avatar').innerHTML = SUPR_LOGO_SVG;
  $('me-name').textContent = ME.full_name || ME.username;
  $('me-role').textContent = ME.role.charAt(0).toUpperCase() + ME.role.slice(1);

  // Hide nav tabs not allowed for this role
  const allowed = ROLE_TABS[CURRENT_ROLE] || [];
  document.querySelectorAll('nav button').forEach(btn => {
    const tab = btn.dataset.tab;
    btn.style.display = allowed.includes(tab) ? '' : 'none';
  });

  // Hide "New Campaign" button for non-admins
  const newCampBtn = document.getElementById('new-campaign-btn');
  if (newCampBtn) newCampBtn.style.display = CURRENT_ROLE === 'admin' ? '' : 'none';

  // Hide "+ New Post" for viewers (read-only)
  const newPostBtn = document.querySelector('#posts .btn-primary');
  if (newPostBtn) newPostBtn.style.display = CURRENT_ROLE === 'viewer' ? 'none' : '';
}
/* ---------- Tab switching ---------- */
document.querySelectorAll('nav button').forEach(btn => 
  {
  btn.onclick = () => {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.tab).classList.add('active');
    loadTab(btn.dataset.tab);
  };
});

/* ---------- Edit post ---------- */
async function editPost(id) 
{
  await safe(async () => {
    // Find post in cache — if not there, fetch from API
    let post = cachedPosts.find(p => p.post_id === id);
    if (!post) {
      try {
        const all = await api('/posts');
        cachedPosts = all;
        post = all.find(p => p.post_id === id);
      } catch(e) { /* ignore */ }
    }
    if (!post) { toast('Post not found', 'error'); return; }

    // Ensure the Posts tab is active (fixes edit from Dashboard / Calendar)
    const postsTab = document.getElementById('posts');
    if (postsTab && !postsTab.classList.contains('active')) {
      document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      const postsBtn = document.querySelector('nav button[data-tab="posts"]');
      if (postsBtn) postsBtn.classList.add('active');
      postsTab.classList.add('active');
      await populateDropdowns();
      await loadPosts();
      await new Promise(r => setTimeout(r, 60));
    }

    // Now open the form
    $('post-form').classList.remove('hidden');
    setTimeout(() => {
      $('post-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    // Change the form title dynamically
    const formTitle = $('post-form').querySelector('h3');
    if (formTitle) formTitle.textContent = 'Edit Post #' + id;

    // Store the editing ID on the form
    $('post-form').dataset.editId = id;

    // Fill fields (editors/viewers can only author as themselves)
    if (CURRENT_ROLE === 'editor' || CURRENT_ROLE === 'viewer') {
      $('user_id').value = CURRENT_USER_ID;
    } else {
      $('user_id').value = post.user_id || '';
    }
    $('campaign_id').value = post.campaign_id || '';
    $('title').value       = post.title || '';
    $('content').value     = post.content || '';
    $('post_type').value   = post.post_type || 'text';

    // Clear existing target rows, rebuild from the post's targets
    $('targets-container').innerHTML = '';

    if ((post.targets || []).length === 0) {
      addTargetRow();
    } else {
      for (const t of post.targets) {
        const div = document.createElement('div');
        div.className = 'target-row';

        const options = accountsCache.map(a =>
          `<option value="${a.account_id}" ${a.account_name === t.account_name ? 'selected' : ''}>
            ${esc(a.account_name)} · ${esc(a.platform)}
          </option>`).join('');

        div.innerHTML = `
          <select class="t-account" required>
            <option value="">Select account...</option>
            ${options}
          </select>
          <input type="datetime-local" class="t-scheduled" value="${t.scheduled_at ? t.scheduled_at.slice(0,16).replace(' ','T') : ''}" />
          <button type="button" class="remove-btn" aria-label="Remove">×</button>`;

        div.querySelector('.remove-btn').onclick = () => div.remove();
        $('targets-container').appendChild(div);
      }
    }

    // Change submit button text
    const submitBtn = $('post-form').querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Save Changes';

    // Refresh the live preview
    try { updatePreview(); } catch(e) { console.warn('Preview:', e.message); }
  });
}
window.editPost = editPost;

window.editPost = editPost;

/* ---------- New post form ---------- */
function toggleForm() {
  const f = $('post-form');
  if (!f) { toast('Form not found', 'error'); return; }

  if (f.classList.contains('hidden')) {
    // Make sure dropdowns are loaded before opening
    if (!accountsCache || accountsCache.length === 0) {
      safe(async () => {
        await populateDropdowns();
        f.reset();
        f.dataset.editId = '';
        $('targets-container').innerHTML = '';
        if (CURRENT_ROLE === 'editor' || CURRENT_ROLE === 'viewer') {
          $('user_id').innerHTML =
            `<option value="${CURRENT_USER_ID}" selected>${esc(ME.full_name || ME.username)}</option>`;
        }
        const formTitle = f.querySelector('h3');
        if (formTitle) formTitle.textContent = 'Create New Post';
        const submitBtn = f.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Save Post';
        addTargetRow();
        f.classList.remove('hidden');
        f.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    // Normal open
    f.reset();
    f.dataset.editId = '';
    $('targets-container').innerHTML = '';

    if (CURRENT_ROLE === 'editor' || CURRENT_ROLE === 'viewer') {
      $('user_id').innerHTML =
        `<option value="${CURRENT_USER_ID}" selected>${esc(ME.full_name || ME.username)}</option>`;
    }

    const formTitle = f.querySelector('h3');
    if (formTitle) formTitle.textContent = 'Create New Post';

    const submitBtn = f.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Save Post';

    addTargetRow();
    f.classList.remove('hidden');
    f.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    f.classList.add('hidden');
  }
}
window.toggleForm = toggleForm;

$('add-target').onclick = () => addTargetRow();

function addTargetRow() {
  const options = accountsCache.map(a =>
    `<option value="${a.account_id}">${esc(a.account_name)} · ${esc(a.platform)}</option>`).join('');

  const div = document.createElement('div');
  div.className = 'target-row';
  div.innerHTML = `
    <select class="t-account" required>
      <option value="">Select account...</option>${options}
    </select>
    <input type="datetime-local" class="t-scheduled" />
    <button type="button" class="remove-btn" aria-label="Remove platform">×</button>`;

  div.querySelector('.remove-btn').onclick = () => div.remove();
  $('targets-container').appendChild(div);

  try { updatePreview(); } catch(e) { console.warn('Preview error:', e.message); }
}

$('post-form').onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const editId = form.dataset.editId;

  const targets = [...document.querySelectorAll('.target-row')].map(r => {
    const account_id = +r.querySelector('.t-account').value;
    const acc = accountsCache.find(a => a.account_id === account_id);
    return {
      account_id,
      platform_id: acc ? acc.platform_id : null,
      scheduled_at: r.querySelector('.t-scheduled').value || null
    };
  }).filter(t => t.account_id && t.platform_id);

  if (targets.length === 0) {
    toast('Add at least one platform account', 'error');
    return;
  }

  submitBtn.disabled = true;
  try {
    // Upload new media if any (only in create mode)
    const media_ids = [];
    if (!editId) {
      const file = $('media_file').files[0];
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('user_id', $('user_id').value);
        const up = await api('/media/upload', { method: 'POST', body: fd });
        media_ids.push(up.media_id);
      }
    }

    const payload = {
      user_id: +$('user_id').value,
      campaign_id: +$('campaign_id').value || null,
      title: $('title').value,
      content: $('content').value,
      post_type: $('post_type').value,
      status: editId ? undefined : 'draft',  // don't overwrite status on edit
      targets,
      media_ids
    };

    if (editId) {
      // UPDATE
      await api(`/posts/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      toast('Post updated!', 'success');
    } else {
      // CREATE
      await jsonPost('/posts', payload);
      toast('Post saved!', 'success');
    }

    // Reset form
    form.reset();
    form.dataset.editId = '';
    $('targets-container').innerHTML = '';
    form.classList.add('hidden');

    const formTitle = form.querySelector('h3');
    if (formTitle) formTitle.textContent = 'Create New Post';
    if (submitBtn) submitBtn.textContent = 'Save Post';

    currentPostFilter = 'all';
    await loadPosts();
  } catch (err) {
    toast('Error saving post: ' + err.message, 'error');
  } finally {
    submitBtn.disabled = false;
  }
};

/* ---------- Dashboard ---------- */

let platformChartInstance = null;
let distributionChartInstance = null;

async function loadUpcoming() {
  const [rows, posts, accounts, pending, byPlatform, needs] = await Promise.all([
    api('/targets/upcoming'),
    api('/posts'),
    api('/accounts'),
    api('/approvals/pending'),
    api('/analytics/by-platform'),
    api('/targets/needs-attention').catch(() => ({ overdue: [], failed: [], approvals: [] }))
  ]);
  // Cache posts so editPost() works from the dashboard too
  cachedPosts = posts || [];
  /* ---------- Upcoming table ---------- */
  document.querySelector('#upcoming-table tbody').innerHTML = rows.length
    ? rows.map(x => `
      <tr>
        <td>${esc(x.title)}</td>
        <td>${esc(x.platform)}</td>
        <td>${esc(x.account_name)}</td>
        <td>${relTimeWithTooltip(x.scheduled_at)}</td>
        <td><span class="badge ${esc(x.status)}">${esc(x.status)}</span></td>
      </tr>`).join('')
    : `<tr><td colspan="5"><div class="empty-state">
        <div class="empty-icon" style="width:40px;height:40px;margin:0 auto 12px;">${ICON.clock}</div>
        <h4>Nothing scheduled yet</h4>
        <p>Create your first scheduled post to see it here.</p>
        <button class="btn-primary" onclick="document.querySelector('[data-tab=posts]').click(); toggleForm();">+ Create Post</button>
      </div></td></tr>`;

  /* ---------- Stat cards (clickable) ---------- */
  $('stat-cards').innerHTML = `
    <div class="stat-card" onclick="document.querySelector('[data-tab=posts]').click()" style="cursor:pointer">
      <div class="stat-body">
        <div class="label">Total Posts</div>
        <div class="value" data-count="${posts.length}">0</div>
        <div class="trend up">▲ Active content</div>
      </div>
      <div class="stat-icon">📝</div>
    </div>

    <div class="stat-card green" onclick="document.querySelector('[data-tab=accounts]').click()" style="cursor:pointer">
      <div class="stat-body">
        <div class="label">Social Accounts</div>
        <div class="value" data-count="${accounts.length}">0</div>
        <div class="trend flat">Connected platforms</div>
      </div>
      <div class="stat-icon">🌐</div>
    </div>

    <div class="stat-card orange" onclick="document.querySelector('[data-tab=calendar]').click()" style="cursor:pointer">
      <div class="stat-body">
        <div class="label">Scheduled</div>
        <div class="value" data-count="${rows.length}">0</div>
        <div class="trend up">▲ Upcoming</div>
      </div>
      <div class="stat-icon">📅</div>
    </div>

    <div class="stat-card red" onclick="document.querySelector('[data-tab=approvals]').click()" style="cursor:pointer">
      <div class="stat-body">
        <div class="label">Pending Approvals</div>
        <div class="value" data-count="${pending.length}">0</div>
        <div class="trend ${pending.length > 0 ? 'down' : 'flat'}">${pending.length > 0 ? '⚠ Needs review' : '✓ All clear'}</div>
      </div>
      <div class="stat-icon">✅</div>
    </div>`;

  // Count-up animation
    // Count-up animation (GSAP)
  document.querySelectorAll('.stat-card .value').forEach(el => {
    const target = +el.dataset.count;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.1,
      ease: 'power3.out',
      onUpdate: () => { el.textContent = Math.round(obj.val); }
    });
  });

  // Stagger the stat cards themselves on first paint
  gsap.fromTo('.stat-card',
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out', clearProps: 'transform,opacity' }
  );

  /* ---------- Needs Attention panel ---------- */
  renderNeedsAttention(needs);

  function relativeOverdue(dateStr) {
  if (!dateStr) return 'unknown';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h overdue`;
  if (diffDays === 1) return '1 day overdue';
  if (diffDays < 30) return `${diffDays} days overdue`;
  const months = Math.floor(diffDays / 30);
  return `${months} month${months === 1 ? '' : 's'} overdue`;
}
  renderNeedsAttention(needs);
  renderPlatformChart(byPlatform);
  renderDistributionChart(posts);

  try { loadBestTime(); } catch(e) { console.warn('Best time failed:', e.message); }
  try { loadSentiment(); } catch(e) { console.warn('Sentiment failed:', e.message); }
  try { loadActivity(); } catch(e) { console.warn('Activity failed:', e.message); }
}

function renderNeedsAttention(needs) {
  const wrap = document.getElementById('needs-attention');
  if (!wrap) return;

  const overdue = needs.overdue || [];
  const failed = needs.failed || [];
  const approvals = needs.approvals || [];

  const total = overdue.length + failed.length + approvals.length;

  if (total === 0) {
    wrap.innerHTML = `
      <div class="needs-head">
        <h3>Needs Attention</h3>
        <span class="badge approved">All clear</span>
      </div>
      <div class="empty-state" style="padding:28px 20px;">
        <div class="empty-icon" style="width:40px;height:40px;margin:0 auto 12px;">${ICON.checkCircle}</div>
        <h4>Everything looks good</h4>
        <p>No overdue posts, failed publishes, or old approvals.</p>
      </div>`;
    return;
  }

  let html = `
    <div class="needs-head">
      <h3>Needs Attention</h3>
      <span class="badge failed">${total} item${total === 1 ? '' : 's'}</span>
    </div>`;

  if (overdue.length) {
    html += `<div class="needs-group">
      <h4><span class="needs-icon">${ICON.clockAlert}</span> Overdue Scheduled (${overdue.length})</h4>
      ${overdue.slice(0, 3).map(o => `
        <div class="needs-item" onclick="editPost(${o.post_id})">
          <div class="needs-body">
            <strong>${esc(o.title)}</strong>
            <div class="needs-meta">${esc(o.platform)} · ${esc(o.account_name)} · <span class="overdue-time" title="${fmtDate(o.scheduled_at)}">${relativeOverdue(o.scheduled_at)}</span></div>
          </div>
          <div class="needs-actions">
            <button class="needs-btn" onclick="event.stopPropagation(); editPost(${o.post_id})" title="Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </div>`).join('')}
      ${overdue.length > 3 ? `<div class="needs-more" onclick="document.querySelector('[data-tab=calendar]').click()">+ ${overdue.length - 3} more overdue →</div>` : ''}
    </div>`;
  }

  if (failed.length) {
    html += `<div class="needs-group">
      <h4><span class="needs-icon">${ICON.xCircle}</span> Failed Publishes (${failed.length})</h4>
      ${failed.slice(0, 3).map(f => `
        <div class="needs-item" onclick="editPost(${f.post_id})">
          <div class="needs-body">
            <strong>${esc(f.title)}</strong>
            <div class="needs-meta">${esc(f.platform)} — ${esc(f.error_message || 'Unknown error')}</div>
          </div>
        </div>`).join('')}
      ${failed.length > 3 ? `<div class="needs-more">+ ${failed.length - 3} more failed →</div>` : ''}
    </div>`;
  }

  if (approvals.length) {
    html += `<div class="needs-group">
      <h4><span class="needs-icon">${ICON.hourglass}</span> Approvals Waiting 2+ Days (${approvals.length})</h4>
      ${approvals.slice(0, 3).map(a => {
        const days = a.days_waiting;
        const tier = days >= 28 ? 'tier-red' : days >= 7 ? 'tier-orange' : 'tier-amber';
        return `
        <div class="needs-item" onclick="document.querySelector('[data-tab=approvals]').click()">
          <div class="needs-body">
            <strong>${esc(a.title)}</strong>
            <div class="needs-meta">Requested by ${esc(a.requested_by || 'Unknown')}</div>
          </div>
          <div class="needs-actions">
            <span class="age-badge ${tier}">${days} day${days === 1 ? '' : 's'}</span>
            ${['admin','manager'].includes(CURRENT_ROLE)
              ? `<button class="needs-btn needs-btn-approve" onclick="event.stopPropagation(); decide(${+a.approval_id}, 'approved')" title="Approve">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                 </button>`
              : ''}
          </div>
        </div>`;
      }).join('')}
      ${approvals.length > 3
        ? `<div class="needs-more" onclick="document.querySelector('[data-tab=approvals]').click()">+ ${approvals.length - 3} more waiting →</div>`
        : ''}
    </div>`;
  }

  wrap.innerHTML = html;
}

/* Helper used above */
function relativeOverdue(dateStr) {
  if (!dateStr) return 'unknown';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h overdue`;
  if (diffDays === 1) return '1 day overdue';
  if (diffDays < 30) return `${diffDays} days overdue`;
  const months = Math.floor(diffDays / 30);
  return `${months} month${months === 1 ? '' : 's'} overdue`;
}

function renderPlatformChart(byPlatform) {
  const ctx = document.getElementById('platformChart');
  if (!ctx || typeof Chart === 'undefined') return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,.06)' : 'rgba(15,23,42,.06)';
  const textColor = isDark ? '#9aa5bd' : '#7b8299';

  if (platformChartInstance) platformChartInstance.destroy();

  platformChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: (byPlatform || []).map(p => p.name),
      datasets: [
        {
          label: 'Likes',
          data: (byPlatform || []).map(p => +p.total_likes || 0),
          backgroundColor: '#7C6CFF',
          borderRadius: 6,
          barThickness: 28
        },
        {
          label: 'Comments',
          data: (byPlatform || []).map(p => +p.total_comments || 0),
          backgroundColor: '#C25BFF',
          borderRadius: 6,
          barThickness: 28
        },
        {
          label: 'Shares',
          data: (byPlatform || []).map(p => +p.total_shares || 0),
          backgroundColor: '#a78bfa',
          borderRadius: 6,
          barThickness: 28
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { left: 8 } },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 }, padding: 14, boxWidth: 12 }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 }, precision: 0, padding: 8 } }
      }
    }
  });
}

function renderDistributionChart(posts) {
  const ctx = document.getElementById('distributionChart');
  if (!ctx) return;

  // Count platform usage from post targets
  const counts = {};
  posts.forEach(p => (p.targets || []).forEach(t => {
    counts[t.platform] = (counts[t.platform] || 0) + 1;
  }));

  const labels = Object.keys(counts);
  const values = Object.values(counts);

  const palette = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#e9d5ff'];

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#9aa5bd' : '#7b8299';

  if (distributionChartInstance) distributionChartInstance.destroy();

  distributionChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['No data'],
      datasets: [{
        data: values.length ? values : [1],
        backgroundColor: values.length ? palette.slice(0, labels.length) : ['#e4e7ef'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 }, padding: 12, boxWidth: 10 }
        }
      }
    }
  });
}

/* ---------- Posts ---------- */
async function loadPosts() {
  cachedPosts = await api('/posts');
  renderPostChips();
  renderPosts();
}

function renderPosts() {
  let posts = currentPostFilter === 'all'
    ? [...cachedPosts]
    : cachedPosts.filter(p => p.status === currentPostFilter);

  // Search filter
  if (currentPostSearch.trim()) {
    const q = currentPostSearch.toLowerCase().trim();
    posts = posts.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.content || '').toLowerCase().includes(q) ||
      (p.author || '').toLowerCase().includes(q) ||
      (p.campaign || '').toLowerCase().includes(q)
    );
  }

  // Sort
  switch (currentPostSort) {
    case 'oldest':
      posts.reverse();
      break;
    case 'title':
      posts.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      break;
    case 'engagement':
      posts.sort((a, b) => {
        const ea = (a.analytics?.likes || 0) + (a.analytics?.shares || 0);
        const eb = (b.analytics?.likes || 0) + (b.analytics?.shares || 0);
        return eb - ea;
      });
      break;
    // newest is default (as returned from server)
  }

  $('posts-list').innerHTML = posts.length
    ? posts.map(p => `
      <div class="post-card" data-platform="${(p.targets?.[0]?.platform || '').toLowerCase().replace(/[^a-z]/g, '')}">
        ${['admin','manager','editor'].includes(CURRENT_ROLE)
          ? `<input type="checkbox" class="post-select" data-id="${+p.post_id}" onchange="togglePostSelection(${+p.post_id}, this.checked)" />`
          : ''}
        ${healthRingHtml(p)}
        <div class="post-card-head">
          <h3>${esc(p.title)}</h3>
          <span class="badge ${esc(p.status)}">${esc(p.status)}</span>
        </div>
        <div class="post-id">Post #${+p.post_id}</div>
        <div class="body">${esc(p.content)}</div>

        ${(p.media || []).map(m => m.media_type === 'image'
          ? `<img src="${BASE}${encodeURI(m.file_path)}" alt="${esc(m.file_name)}" />`
          : `<a href="${BASE}${encodeURI(m.file_path)}" target="_blank" rel="noopener">📎 ${esc(m.file_name)}</a>`
        ).join('')}

        ${(p.targets || []).length
          ? `<div class="targets">
              ${p.targets.map(t => {
                const plat = (t.platform || '').toLowerCase().replace(/[^a-z]/g, '');
                return `
                <div class="target-pill">
                  <span><span class="platform-badge platform-${plat}">${esc(t.platform)}</span> · ${esc(t.account_name)}</span>
                  <span class="badge ${esc(t.status)}">${esc(t.status)}</span>
                </div>`;
              }).join('')}
             </div>`
          : ''}

        <div class="meta">
          <span>👤 ${esc(p.author)}</span>
          ${p.campaign
            ? `<span class="campaign-link" onclick="goToCampaign('${esc(p.campaign)}')" title="Go to campaign">📁 ${esc(p.campaign)}</span>`
            : `<span>📁 No campaign</span>`}
          <span title="${esc(new Date(p.created_at).toLocaleString())}">🕐 ${relTime(p.created_at)}</span>
        </div>

        <div class="post-actions">
          ${['admin','manager','editor'].includes(CURRENT_ROLE)
            ? `<button class="btn-ghost" onclick="editPost(${+p.post_id})"><span class="line-icon" style="width:13px;height:13px;">${ICON.edit}</span> Edit</button>`
            : ''}
          ${(['admin','manager','editor'].includes(CURRENT_ROLE) && p.status === 'draft')
            ? `<button class="btn-approve" onclick="requestApproval(${+p.post_id})">📩 Request Approval</button>`
            : ''}
          ${(['admin','manager'].includes(CURRENT_ROLE))
            ? `<button class="btn-danger-sm" onclick="deletePost(${+p.post_id})">🗑 Delete</button>`
            : ''}
        </div>
      </div>`).join('')
    : `<div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon" style="width:40px;height:40px;margin:0 auto 12px;">${ICON.search}</div>
        <h4>No ${currentPostFilter === 'all' ? '' : currentPostFilter} posts</h4>
        <p>Try a different filter or create a new post.</p>
      </div>`;

    // Update count text
  const label = currentPostFilter === 'all' ? 'posts' : `${currentPostFilter} posts`;
  $('post-count').textContent = `${posts.length} ${label}`;

  // GSAP cascade — cards fade in one by one
  const cards = document.querySelectorAll('#posts-list .post-card');
  if (cards.length) {
    gsap.killTweensOf(cards);
    gsap.fromTo(cards,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.04,
        ease: 'power2.out',
        clearProps: 'transform,opacity'
      }
    );
  }
  if (typeof refreshScrollTriggers === 'function') refreshScrollTriggers();
}
  
    // GSAP cascade
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('#posts-list .post-card',
      { opacity: 0, y: 16, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out', clearProps: 'transform,opacity' }
    );
  }


function renderPostChips() {
  const counts = {
    all:       cachedPosts.length,
    published: cachedPosts.filter(p => p.status === 'published').length,
    scheduled: cachedPosts.filter(p => p.status === 'scheduled').length,
    approved:  cachedPosts.filter(p => p.status === 'approved').length,
    pending:   cachedPosts.filter(p => p.status === 'pending').length,
    draft:     cachedPosts.filter(p => p.status === 'draft').length
  };

  document.querySelectorAll('#post-filters .filter-chip').forEach(chip => {
    const status = chip.dataset.status;
    const label  = chip.dataset.label || chip.textContent.trim();  // use data-label, never re-read textContent
    chip.innerHTML = `${label} <span class="chip-count">${counts[status] || 0}</span>`;
    chip.classList.toggle('active', status === currentPostFilter);
  });
}

// Wire filter chips
document.querySelectorAll('#post-filters .filter-chip').forEach(chip => {
  chip.onclick = () => {
    currentPostFilter = chip.dataset.status;
    clearBulkSelection();
    renderPostChips();
    renderPosts();
  };
});

/* ---------- Search + Sort listeners ---------- */
$('post-search')?.addEventListener('input', e => {
  currentPostSearch = e.target.value;
  renderPosts();
});

$('post-sort')?.addEventListener('change', e => {
  currentPostSort = e.target.value;
  renderPosts();
});

/* ---------- Accounts ---------- */
async function loadAccounts() {
  const rows = await api('/accounts');
  accountsCache = rows;

  document.querySelector('#accounts-table tbody').innerHTML = rows.length
    ? rows.map(x => `
      <tr>
        <td>#${+x.account_id}</td>
        <td><strong>${esc(x.account_name)}</strong></td>
        <td>${esc(x.account_handle || '-')}</td>
        <td>${esc(x.platform)}</td>
        <td>${esc(x.username)}</td>
        <td><span class="badge ${x.is_active ? 'active' : 'inactive'}">${x.is_active ? 'Active' : 'Inactive'}</span></td>
        <td>${['admin','manager'].includes(CURRENT_ROLE)
              ? `<button class="btn-danger-sm" onclick="deleteAccount(${+x.account_id})">🗑 Delete</button>`
              : '<span class="muted">—</span>'}</td>
      </tr>`).join('')
    : emptyRow(7, 'No accounts yet');
    if (typeof refreshScrollTriggers === 'function') refreshScrollTriggers();
}

/* ---------- Campaigns ---------- */
async function loadCampaigns() {
  const rows = await api('/campaigns');

  document.querySelector('#campaigns-table tbody').innerHTML = rows.length
    ? rows.map(c => `
      <tr>
        <td>#${+c.campaign_id}</td>
        <td><strong>${esc(c.name)}</strong></td>
        <td><span class="badge ${esc(c.status)}">${esc(c.status)}</span></td>
        <td>${fmtDate(c.start_date)}</td>
        <td>${fmtDate(c.end_date)}</td>
        <td>${esc(c.creator_full || c.creator_name || '-')}</td>
        <td>${CURRENT_ROLE === 'admin'
          ? `<button class="btn-ghost" onclick="editCampaign(${+c.campaign_id})">✏ Edit</button>`
          : '<span class="muted">—</span>'}</td>
      </tr>`).join('')
    : emptyRow(7, 'No campaigns yet');
}

/* ---------- Users ---------- */
async function loadUsers() {
  const rows = await api('/users');

  document.querySelector('#users-table tbody').innerHTML = rows.length
    ? rows.map(u => `
      <tr>
        <td>#${+u.user_id}</td>
        <td><strong>${esc(u.username)}</strong></td>
        <td>${esc(u.full_name || '-')}</td>
        <td>${esc(u.email)}</td>
        <td><span class="badge draft">${esc(u.role)}</span></td>
        <td><span class="badge ${u.is_active ? 'active' : 'inactive'}">${u.is_active ? 'Active' : 'Inactive'}</span></td>
        <td>${CURRENT_ROLE === 'admin'
          ? `<button class="btn-ghost" onclick="editUser(${+u.user_id})">✏ Edit</button>
             <button class="btn-danger-sm" onclick="deleteUser(${+u.user_id})">🗑 Delete</button>`
          : '<span class="muted">—</span>'}</td>
      </tr>`).join('')
    : emptyRow(7, 'No users yet');
       if (typeof refreshScrollTriggers === 'function') refreshScrollTriggers();
  }
  

/* ---------- Analytics ---------- */
async function loadAnalytics() {
  const [platforms, tops] = await Promise.all([
    api('/analytics/by-platform'), api('/analytics/top-posts')
  ]);

  document.querySelector('#analytics-table tbody').innerHTML = platforms.length
    ? platforms.map(x => `
      <tr>
        <td><strong>${esc(x.name)}</strong></td>
        <td>${+x.total_likes || 0}</td>
        <td>${+x.total_comments || 0}</td>
        <td>${+x.total_shares || 0}</td>
        <td><strong>${(+x.avg_engagement || 0).toFixed(2)}%</strong></td>
      </tr>`).join('')
    : emptyRow(5, 'No analytics yet');

  document.querySelector('#top-posts-table tbody').innerHTML = tops.length
    ? tops.map((x, i) => `
      <tr>
        <td>#${i + 1} — ${esc(x.title)}</td>
        <td><strong>${+x.total_engagement || 0}</strong></td>
      </tr>`).join('')
    : emptyRow(2, 'No posts ranked yet');
    if (typeof refreshScrollTriggers === 'function') refreshScrollTriggers();
}
  

/* ---------- Approvals ---------- */
async function loadApprovals() {
  const rows = await api('/approvals/pending');
  document.querySelector('#approvals-table tbody').innerHTML = rows.length
    ? rows.map(x => `
      <tr>
        <td>#${+x.post_id}</td>
        <td>${esc(x.title)}</td>
        <td>${esc(x.requested_by)}</td>
        <td>${relTimeWithTooltip(x.requested_at)}</td>
        <td>${['admin','manager'].includes(CURRENT_ROLE)
          ? `<button class="btn-approve" onclick="decide(${+x.approval_id},'approved')">Approve</button>
             <button class="btn-reject" onclick="decide(${+x.approval_id},'rejected')">Reject</button>`
          : '<span class="muted">—</span>'}</td>
      </tr>`).join('')
    : emptyRow(5, 'No pending approvals 🎉');
    if (typeof refreshScrollTriggers === 'function') refreshScrollTriggers();
}
  

/* ---------- Actions ---------- */
async function decide(id, status) {
  await safe(async () => {
    await jsonPost(`/approvals/${id}/decide`, {
      status, approved_by: CURRENT_USER_ID, comments: 'Reviewed'
    });
    toast(`Post ${status}!`, status === 'approved' ? 'success' : 'error');
    await loadApprovals();
    await loadPosts();
  });
  if (typeof refreshScrollTriggers === 'function') refreshScrollTriggers();
}
  
async function deletePost(id) {
  await safe(async () => {
    const ok = await showModal({
      title: 'Delete this post?',
      message: 'Its platform targets, media links, analytics, and comments will also be removed. This cannot be undone.',
      icon: '🗑',
      confirmText: 'Delete',
      danger: true
    });
    if (!ok) return;
    await api(`/posts/${id}`, { method: 'DELETE' });
    toast('Post deleted', 'success');
    currentPostFilter = 'all';
    await Promise.all([loadPosts(), loadUpcoming()]);
  });
}

async function deleteAccount(id) {
  await safe(async () => {
    const ok = await showModal({
      title: 'Delete this social account?',
      message: 'All post targets linked to it will also be removed.',
      icon: '⚠️',
      confirmText: 'Delete',
      danger: true
    });
    if (!ok) return;
    await api(`/accounts/${id}`, { method: 'DELETE' });
    toast('Account deleted', 'success');
    await loadAccounts();
  });
}

async function requestApproval(id) {
  await safe(async () => {
    const ok = await showModal({
      title: 'Send this post for approval?',
      message: 'A manager will be notified and can approve or reject it.',
      icon: '📩',
      confirmText: 'Send'
    });
    if (!ok) return;
    await jsonPost(`/posts/${id}/request-approval`, { requested_by: CURRENT_USER_ID });
    toast('Approval requested', 'success');
    await Promise.all([loadPosts(), loadApprovals(), loadUpcoming()]);
  });
}

/* ---------- Account form ---------- */
function toggleAccountForm() {
  const f = $('account-form');
  f.classList.toggle('hidden');
  if (!f.classList.contains('hidden')) safe(populateAccountDropdowns);
}

async function populateAccountDropdowns() {
  const [platforms, users] = await Promise.all([api('/platforms'), api('/users')]);
  $('a_platform').innerHTML = '<option value="">Select platform...</option>' +
    platforms.map(p => `<option value="${p.platform_id}">${esc(p.name)}</option>`).join('');
  $('a_user').innerHTML = '<option value="">Select user...</option>' +
    users.map(u => `<option value="${u.user_id}">${esc(u.full_name || u.username)}</option>`).join('');
}

$('account-form').onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    await jsonPost('/accounts', {
      platform_id: +$('a_platform').value,
      user_id: +$('a_user').value,
      account_name: $('a_name').value,
      account_handle: $('a_handle').value || null,
      access_token: $('a_token').value || null
    });
    toast('Account connected!', 'success');
    form.reset();
    form.classList.add('hidden');
    await loadAccounts();
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
  }
};

/* ---------- Campaign form ---------- */
function toggleCampaignForm() {
  const f = $('campaign-form');
  f.classList.toggle('hidden');
  if (!f.classList.contains('hidden')) safe(populateCampaignUsers);
}

async function editCampaign(id) {
  await safe(async () => {
    const campaigns = await api('/campaigns');
    const c = campaigns.find(x => x.campaign_id === id);
    if (!c) { toast('Campaign not found', 'error'); return; }

    // Fill the form
    $('c_name').value = c.name;
    $('c_description').value = c.description || '';
    $('c_start').value = c.start_date ? c.start_date.slice(0, 10) : '';
    $('c_end').value = c.end_date ? c.end_date.slice(0, 10) : '';
    $('c_status').value = c.status;

    // Load users into "Created By" dropdown, then select the current creator
    await populateCampaignUsers();
    $('c_created_by').value = c.created_by || '';

    // Store the editing ID in a hidden field
    let hidden = document.getElementById('c_id');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.id = 'c_id';
      document.getElementById('campaign-form').prepend(hidden);
    }
    hidden.value = c.campaign_id;

    // Change form title + open it
    const formTitle = document.querySelector('#campaign-form h3');
    if (formTitle) formTitle.textContent = 'Edit Campaign #' + c.campaign_id;

    $('campaign-form').classList.remove('hidden');
    $('campaign-form').scrollIntoView({ behavior: 'smooth' });
  });
}
window.editCampaign = editCampaign;

async function populateCampaignUsers() {
  const users = await api('/users');
  $('c_created_by').innerHTML = '<option value="">Select user...</option>' +
    users.map(u => `<option value="${u.user_id}">${esc(u.full_name || u.username)}</option>`).join('');
}

$('campaign-form').onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;

  const editId = document.getElementById('c_id')?.value;
  const payload = {
    name:        $('c_name').value,
    description: $('c_description').value,
    start_date:  $('c_start').value || null,
    end_date:    $('c_end').value || null,
    status:      $('c_status').value,
    created_by:  +$('c_created_by').value || null
  };

  try {
    if (editId) {
      await api(`/campaigns/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      toast('Campaign updated', 'success');
    } else {
      await jsonPost('/campaigns', payload);
      toast('Campaign created!', 'success');
    }
    form.reset();
    const hidden = document.getElementById('c_id');
    if (hidden) hidden.value = '';
    const formTitle = document.querySelector('#campaign-form h3');
    if (formTitle) formTitle.textContent = 'Create New Campaign';
    form.classList.add('hidden');
    await Promise.all([loadCampaigns(), populateDropdowns()]);
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
  }
};

/* ---------- User form ---------- */
function toggleUserForm() {
  const f = $('user-form');
  f.classList.toggle('hidden');
  if (!f.classList.contains('hidden') && !$('u_id').value) {
    f.reset();
    $('u_id').value = '';
    $('u_active').checked = true;
    $('user-form-title').textContent = 'Create New User';
  }
}

async function editUser(id) {
  await safe(async () => {
    const users = await api('/users');
    const u = users.find(x => x.user_id === id);
    if (!u) return;
    $('u_id').value = u.user_id;
    $('u_username').value = u.username;
    $('u_email').value = u.email;
    $('u_fullname').value = u.full_name || '';
    $('u_role').value = u.role;
    $('u_password').value = '';
    $('u_active').checked = !!u.is_active;
    $('user-form-title').textContent = 'Edit User #' + u.user_id;
    $('user-form').classList.remove('hidden');
    $('user-form').scrollIntoView({ behavior: 'smooth' });
  });
}

async function deleteUser(id) {
  await safe(async () => {
    const ok = await showModal({
      title: 'Delete this user?',
      message: 'All posts they created will also be removed.',
      icon: '⚠️',
      confirmText: 'Delete',
      danger: true
    });
    if (!ok) return;
    await api(`/users/${id}`, { method: 'DELETE' });
    toast('User deleted', 'success');
    await Promise.all([loadUsers(), populateDropdowns()]);
  });
}

$('user-form').onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;

  const id = $('u_id').value;
  const payload = {
    username:  $('u_username').value,
    email:     $('u_email').value,
    full_name: $('u_fullname').value || null,
    role:      $('u_role').value,
    is_active: $('u_active').checked
  };
  const password = $('u_password').value;
  if (password) payload.password = password;

  try {
    if (id) {
      await api(`/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      toast('User updated', 'success');
    } else {
      if (!password) { toast('Password is required for new users', 'error'); btn.disabled = false; return; }
      await jsonPost('/users', payload);
      toast('User created', 'success');
    }
    form.reset();
    $('u_id').value = '';
    form.classList.add('hidden');
    await Promise.all([loadUsers(), populateDropdowns()]);
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
  }
};

/* ---------- Database Admin ---------- */
async function loadAdminTables() {
  const tables = await api('/admin/tables');

  $('db-table-list').innerHTML = tables.length
    ? tables.map(t => `
      <button class="db-table-item" data-table="${esc(t.name)}" onclick="viewTable('${esc(t.name)}', this)">
        <span>${esc(t.name)}</span>
        <span class="count">${+t.rows}</span>
      </button>`).join('')
    : '<p class="muted">No tables found</p>';
}

async function viewTable(name, btn) {
  await safe(async () => {
    // Highlight active
    document.querySelectorAll('.db-table-item').forEach(el => el.classList.remove('active'));
    if (btn) btn.classList.add('active');

    $('db-view-title').textContent = name;
    $('db-row-count').textContent = 'Loading...';

    const data = await api(`/admin/table/${name}`);
    $('db-view-title').textContent = data.table;
    $('db-row-count').textContent = `${data.count} row${data.count === 1 ? '' : 's'}`;
    renderDbTable(data.columns, data.rows);
  });
}

async function runSql() {
  const sql = $('sql-input').value.trim();
  if (!sql) { toast('Enter a query first', 'error'); return; }

  await safe(async () => {
    $('db-view-title').textContent = 'Query Result';
    $('db-row-count').textContent = 'Running...';

    const res = await api('/admin/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });

    $('db-row-count').textContent = `${res.count} row${res.count === 1 ? '' : 's'}`;
    renderDbTable(res.columns, res.rows);
    toast('Query OK', 'success');
  });
}

function clearSql() {
  $('sql-input').value = '';
  $('sql-input').focus();
}

function renderDbTable(columns, rows) {
  const wrap = $('db-results');

  if (!rows || rows.length === 0) {
    wrap.innerHTML = `
            <div class="empty-state">
        <div class="empty-icon" style="width:40px;height:40px;margin:0 auto 12px;">${ICON.inbox}</div>
        <h4>No rows returned</h4>
        <p>The query ran successfully but returned no data.</p>
      </div>`;
    return;
  }

  const headers = columns.map(c => `<th>${esc(c)}</th>`).join('');
  const body = rows.map(row => `
    <tr>
      ${columns.map(c => {
        const v = row[c];
        if (v === null || v === undefined) return `<td class="null-value">NULL</td>`;
        if (typeof v === 'number') return `<td class="num-value">${v}</td>`;
        const s = String(v);
        const display = s.length > 60 ? s.slice(0, 60) + '…' : s;
        return `<td title="${esc(s)}">${esc(display)}</td>`;
      }).join('')}
    </tr>`).join('');

  wrap.innerHTML = `
    <table>
      <thead><tr>${headers}</tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}

window.loadAdminTables = loadAdminTables;
window.viewTable = viewTable;
window.runSql = runSql;
window.clearSql = clearSql;

/* ========== CALENDAR ========== */
let calCurrent = new Date();
let calEvents = [];
let calDraggingId = null;

function calFmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function loadCalendar() {
  const y = calCurrent.getFullYear();
  const m = calCurrent.getMonth();
  const first = new Date(y, m, 1);
  const last  = new Date(y, m + 1, 0);

  const start = new Date(first);
  start.setDate(start.getDate() - first.getDay());
  const end = new Date(last);
  end.setDate(end.getDate() + (6 - last.getDay()));

  try {
    calEvents = await api(`/targets/calendar?start=${calFmt(start)}&end=${calFmt(end)}`);
  } catch (e) {
    calEvents = [];
    toast('Calendar load failed: ' + e.message, 'error');
  }
  renderCalendar(start, end);
}

function renderCalendar(gridStart, gridEnd) {
  $('cal-title').textContent = calCurrent.toLocaleString('en-US', {
    month: 'long', year: 'numeric'
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const iso = calFmt(cursor);
    const dayEvents = calEvents.filter(e => e.scheduled_at && e.scheduled_at.slice(0, 10) === iso);
    const isToday = cursor.getTime() === today.getTime();
    const isOtherMonth = cursor.getMonth() !== calCurrent.getMonth();

    const chips = dayEvents.slice(0, 3).map(e => {
      const plat = (e.platform || '').toLowerCase().replace(/[^a-z]/g, '');
      return `<div class="cal-chip platform-${plat}"
                draggable="true"
                ondragstart="calDragStart(event, ${e.target_id})"
                ondragend="this.classList.remove('dragging')"
                                onclick="event.stopPropagation(); goToCampaign('${esc(e.title)}')"
                title="${esc(e.title)} — ${esc(e.platform)} — ${esc(e.account_name)}">
                <span class="chip-dot"></span>
                <span class="chip-label">${esc(e.title.slice(0, 22))}${e.title.length > 22 ? '…' : ''}</span>
              </div>`;
    }).join('');

    const more = dayEvents.length > 3
      ? `<div class="cal-more">+${dayEvents.length - 3} more</div>`
      : '';

    cells.push(`
      <div class="cal-day ${isToday ? 'today' : ''} ${isOtherMonth ? 'dim' : ''}"
           data-date="${iso}"
           ondragover="calDragOver(event)"
           ondragleave="calDragLeave(event)"
           ondrop="calDrop(event, '${iso}')"
           onclick="calDayClick(event, '${iso}')">
        <div class="cal-day-num">${cursor.getDate()}</div>
        <div class="cal-events">${chips}${more}</div>
      </div>
    `);

    cursor.setDate(cursor.getDate() + 1);
  }

  $('cal-grid').innerHTML = cells.join('');
  if (typeof refreshScrollTriggers === 'function') refreshScrollTriggers();
}
  

function calPrev()  { calCurrent.setMonth(calCurrent.getMonth() - 1); loadCalendar(); }
function calNext()  { calCurrent.setMonth(calCurrent.getMonth() + 1); loadCalendar(); }
function calToday() { calCurrent = new Date(); loadCalendar(); }

function calDragStart(e, targetId) {
  calDraggingId = targetId;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(targetId));
  e.target.classList.add('dragging');
}

function calDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function calDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

async function calDrop(e, isoDate) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  const id = calDraggingId || +e.dataTransfer.getData('text/plain');
  if (!id) return;

  const ev = calEvents.find(x => x.target_id === id);
  const time = ev && ev.scheduled_at ? ev.scheduled_at.slice(11, 19) : '10:00:00';
  const newDateTime = `${isoDate} ${time}`;

  try {
    await api(`/targets/${id}/reschedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_at: newDateTime })
    });
    toast('Rescheduled to ' + isoDate, 'success');
    await loadCalendar();
  } catch (err) {
    toast('Reschedule failed: ' + err.message, 'error');
  }
  calDraggingId = null;
}

async function calDayClick(e, isoDate) {
  if (e.target.closest('.cal-chip')) return;

  await safe(async () => {
    await populateDropdowns();

    const form = $('post-form');
    form.reset();
    form.dataset.editId = '';
    $('targets-container').innerHTML = '';
    form.classList.remove('hidden');

    const t = form.querySelector('h3');
    if (t) t.textContent = 'New Post — ' + isoDate;

    const submit = form.querySelector('button[type="submit"]');
    if (submit) submit.textContent = 'Save Post';

    addTargetRow();
    const firstRow = document.querySelector('#targets-container .target-row');
    if (firstRow) {
      const dt = firstRow.querySelector('.t-scheduled');
      if (dt) dt.value = isoDate + 'T10:00';
    }

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

window.calPrev = calPrev;
window.calNext = calNext;
window.calToday = calToday;
window.calDragStart = calDragStart;
window.calDragOver = calDragOver;
window.calDragLeave = calDragLeave;
window.calDrop = calDrop;
window.calDayClick = calDayClick;
window.loadCalendar = loadCalendar;

/* ---------- Jump to campaign ---------- */
async function goToCampaign(campaignName) {
  await safe(async () => {
    // Switch to Campaigns tab
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    const campBtn = document.querySelector('nav button[data-tab="campaigns"]');
    if (campBtn) campBtn.classList.add('active');

    const campTab = document.getElementById('campaigns');
    if (campTab) campTab.classList.add('active');

    await loadCampaigns();

    // Highlight matching campaign row
    if (campaignName) {
      document.querySelectorAll('#campaigns-table tbody tr').forEach(row => {
        const nameCell = row.querySelector('td:nth-child(2)');
        if (nameCell && nameCell.textContent.trim() === campaignName.trim()) {
          row.style.transition = 'background .3s';
          row.style.background = 'var(--primary-soft)';
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => { row.style.background = ''; }, 1800);
        }
      });
    }
  });
}
window.goToCampaign = goToCampaign;

/* ========== LIVE POST PREVIEW ========== */
const PLATFORM_RULES = {
  'Facebook':    { limit: 63206, needsImage: false, noLinks: false, minLength: 10 },
  'Instagram':   { limit: 2200,  needsImage: true,  noLinks: true,  minLength: 10 },
  'X (Twitter)': { limit: 280,   needsImage: false, noLinks: false, minLength: 5  },
  'LinkedIn':    { limit: 3000,  needsImage: false, noLinks: false, minLength: 50 },
  'TikTok':      { limit: 2200,  needsImage: true,  noLinks: false, minLength: 10 },
  'YouTube':     { limit: 5000,  needsImage: false, noLinks: false, minLength: 10 }
};

let _previewObjectURL = null;

function updatePreview() {
  const wrap = $('post-preview');
  if (!wrap) return;

  const rows = document.querySelectorAll('.target-row');
  if (rows.length === 0) {
    wrap.innerHTML = `<div class="preview-empty"><p>Add platform targets to see how your post will look.</p></div>`;
    return;
  }

  const content = $('content').value || '';
  const title   = $('title').value || '';
  const author  = $('user_id').selectedOptions[0]?.textContent.trim() || 'You';
  const hasLink = /https?:\/\//.test(content);

  // ---- Handle attached file ----
  const fileInput = $('media_file');
  const file = fileInput && fileInput.files[0];
  const hasImage = !!file;

  // Clean up previous object URL to avoid memory leaks
  if (_previewObjectURL) {
    URL.revokeObjectURL(_previewObjectURL);
    _previewObjectURL = null;
  }

  let mediaUrl = '';
  let mediaIsVideo = false;
  if (file) {
    _previewObjectURL = URL.createObjectURL(file);
    mediaUrl = _previewObjectURL;
    mediaIsVideo = file.type.startsWith('video');
  }

  // Reusable media HTML for all platforms
  const mediaHtml = (extraClass = '') => {
    if (!hasImage) return '';
    if (mediaIsVideo) {
      return `<div class="preview-image-box wide ${extraClass}"><video src="${mediaUrl}" controls muted style="width:100%;height:100%;object-fit:cover;"></video></div>`;
    }
    return `<div class="preview-image-box wide ${extraClass}"><img src="${mediaUrl}" alt="preview" /></div>`;
  };

    const mediaHtmlSquare = () => {
    if (!hasImage) return '';
    if (mediaIsVideo) {
      return `<div class="preview-image-box"><video src="${mediaUrl}" controls muted style="width:100%;height:100%;object-fit:cover;"></video></div>`;
    }
    return `<div class="preview-image-box"><img src="${mediaUrl}" alt="preview" /></div>`;
  };
  const cards = [...rows].map(row => {
    const accountId = +row.querySelector('.t-account').value;
    if (!accountId) return '';
    const acc = accountsCache.find(a => a.account_id === accountId);
    if (!acc) return '';

    const platform = acc.platform;
    const slug = platform.toLowerCase().replace(/[^a-z]/g, '');
    const handle = acc.account_handle || '@' + acc.account_name.toLowerCase().replace(/\s+/g, '');
    const rules = PLATFORM_RULES[platform] || { limit: 2200, minLength: 0 };
    const len = content.length;
    const over = len > rules.limit;
    const warn = len > rules.limit * 0.9 && !over;

    const counterHtml = `
      <div class="preview-counter ${over ? 'over' : warn ? 'warn' : ''}">
        <span class="count">${len} / ${rules.limit === 63206 ? '∞' : rules.limit}</span>
        ${over ? '<span style="color:#dc2626">⚠ Over limit</span>' :
          warn ? '<span style="color:#d97706">Almost at limit</span>' :
          '<span style="color:#059669">✓ OK</span>'}
      </div>`;

    /* ---------- INSTAGRAM ---------- */
    if (platform === 'Instagram') {
      const warnHtml = [];
      if (rules.noLinks && hasLink) warnHtml.push('Instagram captions do not support clickable links');
      if (rules.needsImage && !hasImage) warnHtml.push('Instagram posts need an image');

      return `
        <div class="preview-card platform-instagram">
          <span class="preview-platform-tag">Instagram</span>
          <div class="ig-header">
            <div class="ig-avatar-ring"><div class="ig-avatar">${SUPR_LOGO_SVG}</div></div>
            <div class="ig-userinfo">
              <div class="ig-username">${esc(handle.replace('@',''))}</div>
              <div class="ig-location">Sponsored · 🌐</div>
            </div>
            <div class="ig-menu">⋯</div>
          </div>
          ${hasImage
            ? mediaHtmlSquare()
            : '<div class="ig-image" style="font-size:14px;color:#9ca3af;">📷 Add an image to see it here</div>'}
          <div class="ig-actions">
            <div class="ig-actions-left">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </div>
            <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="ig-likes"><b>1,247 likes</b></div>
          <div class="ig-caption"><b>${esc(handle)}</b>${esc(content || title || 'Your caption...')}</div>
          <div class="ig-timestamp">Just now</div>
          ${warnHtml.length ? warnHtml.map(w => `<div class="preview-warning">⚠ ${esc(w)}</div>`).join('') : ''}
          ${counterHtml}
        </div>`;
    }

    /* ---------- FACEBOOK ---------- */
    if (platform === 'Facebook') {
      return `
        <div class="preview-card platform-facebook">
          <span class="preview-platform-tag">Facebook</span>
          <div class="fb-header">
            <div class="fb-avatar">${SUPR_LOGO_SVG}</div>
            <div class="fb-userinfo">
              <div class="fb-name">${esc(acc.account_name)}</div>
              <div class="fb-time">Just now · 🌐</div>
            </div>
            <div class="fb-menu">⋯</div>
          </div>
          <div class="fb-body">${esc(content || title || 'Your post content here...')}</div>
          ${hasImage ? mediaHtml() : ''}
          <div class="fb-stats">
            <div class="fb-reactions">
              <span>👍</span><span>❤️</span><span>😲</span>
              <span style="background:none;color:#65676b;margin-left:6px;font-size:13px;">1.2K</span>
            </div>
            <span>84 comments · 32 shares</span>
          </div>
          <div class="fb-actions">
            <button>👍 Like</button>
            <button>💬 Comment</button>
            <button>↗ Share</button>
          </div>
          ${counterHtml}
        </div>`;
    }

    /* ---------- X (TWITTER) ---------- */
    if (platform === 'X (Twitter)') {
      return `
        <div class="preview-card platform-xtwitter">
          <span class="preview-platform-tag">X</span>
          <div class="x-wrap">
            <div class="x-avatar">${SUPR_LOGO_SVG}</div>
            <div class="x-content">
              <div class="x-head">
                <span class="x-name">${esc(acc.account_name)}</span>
                <svg class="x-verified" viewBox="0 0 24 24" fill="currentColor"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81C14.67 2.63 13.43 1.75 12 1.75s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.33 2.34 4.94-4.95 1.41 1.42-6.35 6.35z"/></svg>
                <span class="x-handle">${esc(handle)} · just now</span>
                <span class="x-menu">⋯</span>
              </div>
              <div class="x-body">${esc(content || title || 'What is happening?!')}</div>
              ${hasImage ? mediaHtml() : ''}
              <div class="x-actions">
                <span>💬 12</span>
                <span>🔁 48</span>
                <span>❤️ 320</span>
                <span>📊 8.2K</span>
                <span>↗</span>
              </div>
            </div>
          </div>
          ${counterHtml}
        </div>`;
    }

    /* ---------- LINKEDIN ---------- */
    if (platform === 'LinkedIn') {
      return `
        <div class="preview-card platform-linkedin">
          <span class="preview-platform-tag">LinkedIn</span>
          <div class="li-header">
            <div class="li-avatar">${SUPR_LOGO_SVG}</div>
            <div class="li-userinfo">
              <div class="li-name">${esc(acc.account_name)}</div>
              <div class="li-subline">Content Manager · Supr_Mnds</div>
              <div class="li-time">Just now · 🌐</div>
            </div>
            <div class="fb-menu">⋯</div>
          </div>
          <div class="li-body">${esc(content || title || 'Share your professional insights...')}</div>
          ${hasImage ? mediaHtml() : ''}
          <div class="li-stats">
            <span class="emoji-row">👍💡❤️</span>
            <span style="margin-left:6px;">184 · 12 comments · 8 reposts</span>
          </div>
          <div class="li-actions">
            <button>👍 Like</button>
            <button>💬 Comment</button>
            <button>🔁 Repost</button>
            <button>📤 Send</button>
          </div>
          ${counterHtml}
        </div>`;
    }

    /* ---------- TIKTOK ---------- */
    if (platform === 'TikTok') {
      return `
        <div class="preview-card platform-tiktok">
          <span class="preview-platform-tag">TikTok</span>
          <div class="tt-wrap">
            <div class="tt-video">
              ${hasImage
                ? (mediaIsVideo
                    ? `<video src="${mediaUrl}" controls muted style="width:100%;height:100%;object-fit:cover;"></video>`
                    : `<img src="${mediaUrl}" alt="preview" style="width:100%;height:100%;object-fit:cover;" />`)
                : '<span style="z-index:1;position:relative;">🎬 Video required</span>'}
              <div class="tt-overlay">
                <div class="tt-username">${esc(handle)}</div>
                <div class="tt-caption">${esc(content || title || 'Your caption here...')}</div>
              </div>
              <div class="tt-side">
                <div class="tt-side-item"><div class="icon">❤️</div>1.2K</div>
                <div class="tt-side-item"><div class="icon">💬</div>84</div>
                <div class="tt-side-item"><div class="icon">↗</div>32</div>
              </div>
            </div>
          </div>
          ${counterHtml}
        </div>`;
    }

    /* ---------- YOUTUBE ---------- */
    if (platform === 'YouTube') {
      return `
        <div class="preview-card platform-youtube">
          <span class="preview-platform-tag">YouTube</span>
          <div class="yt-wrap">
                        <div class="yt-thumb">
              ${hasImage
                ? (mediaIsVideo
                    ? `<video src="${mediaUrl}" controls muted style="width:100%;height:100%;object-fit:cover;"></video>`
                    : `<img src="${mediaUrl}" alt="preview" style="width:100%;height:100%;object-fit:cover;" />`)
                : ''}
              <div class="yt-play">▶</div>
            </div>
            <div class="yt-title">${esc(title || content || 'Your video title')}</div>
            <div class="yt-channel">
              <div class="yt-channel-avatar">${SUPR_LOGO_SVG}</div>
              <div class="yt-channel-info">
                <div class="yt-channel-name">${esc(acc.account_name)}</div>
                <div class="yt-channel-meta">Just now · No views</div>
              </div>
            </div>
          </div>
          ${counterHtml}
        </div>`;
    }

    return '';
  }).filter(Boolean).join('');

  wrap.innerHTML = cards || `<div class="preview-empty"><p>Select an account above to preview.</p></div>`;
}

/* Auto-update on typing */
['content', 'title'].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', updatePreview);
});
$('media_file')?.addEventListener('change', updatePreview);

/* Also update when a target row changes */
document.addEventListener('change', e => {
  if (e.target.classList.contains('t-account')) updatePreview();
});

window.updatePreview = updatePreview;

/* ========== MODAL ========== */
function showModal({ title, message, icon = '⚠️', confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) {
  return new Promise(resolve => {
    const overlay = $('modal-overlay');
    const titleEl = $('modal-title');
    const msgEl = $('modal-message');
    const iconEl = $('modal-icon');
    const confirmBtn = $('modal-confirm');
    const cancelBtn = $('modal-cancel');

    titleEl.textContent = title;
    msgEl.textContent = message;
    iconEl.textContent = icon;
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;
    confirmBtn.className = danger ? 'btn-danger' : 'btn-primary';

    overlay.classList.remove('hidden');

        // GSAP entrance
    gsap.killTweensOf([overlay, '.modal-box']);
    gsap.fromTo(overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: 'power2.out' }
    );
    gsap.fromTo('.modal-box',
      { scale: 0.9, opacity: 0, y: 14 },
      { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
    );

        // GSAP entrance
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
    gsap.fromTo('.modal-box',
      { scale: 0.9, opacity: 0, y: 12 },
      { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
    );

    const finish = (val) => {
      gsap.to('.modal-box', {
        scale: 0.95, opacity: 0, y: 8, duration: 0.2, ease: 'power2.in'
      });
      gsap.to(overlay, {
        opacity: 0, duration: 0.22, ease: 'power2.in',
        onComplete: () => {
          overlay.classList.add('hidden');
          confirmBtn.onclick = null;
          cancelBtn.onclick = null;
          overlay.onclick = null;
          document.removeEventListener('keydown', onKey);
          resolve(val);
        }
      });
    };

    const onKey = (e) => {
      if (e.key === 'Escape') finish(false);
      if (e.key === 'Enter') finish(true);
    };

    confirmBtn.onclick = () => finish(true);
    cancelBtn.onclick = () => finish(false);
    overlay.onclick = (e) => { if (e.target === overlay) finish(false); };
    document.addEventListener('keydown', onKey);

    setTimeout(() => confirmBtn.focus(), 50);
  });
}

window.showModal = showModal;

/* ========== EXPORT CSV ========== */
function exportPostsCSV() {
  const posts = currentPostFilter === 'all'
    ? cachedPosts
    : cachedPosts.filter(p => p.status === currentPostFilter);

  exportCSV('suprmnds-posts.csv', posts, [
    { label: 'Post ID', value: 'post_id' },
    { label: 'Title', value: 'title' },
    { label: 'Author', value: 'author' },
    { label: 'Campaign', value: r => r.campaign || '-' },
    { label: 'Type', value: 'post_type' },
    { label: 'Status', value: 'status' },
    { label: 'Created At', value: r => r.created_at ? new Date(r.created_at).toISOString() : '' },
    { label: 'Targets Count', value: r => (r.targets || []).length }
  ]);
}

async function exportAccountsCSV() {
  await safe(async () => {
    const accounts = await api('/accounts');
    exportCSV('suprmnds-accounts.csv', accounts, [
      { label: 'Account ID', value: 'account_id' },
      { label: 'Account Name', value: 'account_name' },
      { label: 'Handle', value: r => r.account_handle || '' },
      { label: 'Platform', value: 'platform' },
      { label: 'Owner', value: 'username' },
      { label: 'Active', value: r => r.is_active ? 'Yes' : 'No' }
    ]);
  });
}

async function exportUsersCSV() {
  await safe(async () => {
    const users = await api('/users');
    exportCSV('suprmnds-users.csv', users, [
      { label: 'User ID', value: 'user_id' },
      { label: 'Username', value: 'username' },
      { label: 'Full Name', value: r => r.full_name || '' },
      { label: 'Email', value: 'email' },
      { label: 'Role', value: 'role' },
      { label: 'Active', value: r => r.is_active ? 'Yes' : 'No' }
    ]);
  });
}

window.exportPostsCSV = exportPostsCSV;
window.exportAccountsCSV = exportAccountsCSV;
window.exportUsersCSV = exportUsersCSV;

/* ========== BULK ACTIONS ========== */
let selectedPostIds = new Set();

function togglePostSelection(id, checked) {
  if (checked) selectedPostIds.add(id);
  else selectedPostIds.delete(id);
  renderBulkBar();
  document.querySelectorAll('.post-card').forEach(card => {
    const cb = card.querySelector('.post-select');
    if (cb && +cb.dataset.id === id) {
      card.classList.toggle('selected', checked);
    }
  });
}

function renderBulkBar() {
  let bar = document.getElementById('bulk-bar');
  if (selectedPostIds.size === 0) {
    if (bar) bar.remove();
    return;
  }
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'bulk-bar';
    bar.className = 'bulk-bar';
    document.body.appendChild(bar);
  }
  bar.innerHTML = `
    <span class="bulk-count">${selectedPostIds.size} selected</span>
    <div class="bulk-actions">
      ${CURRENT_ROLE === 'admin' || CURRENT_ROLE === 'manager'
        ? `<button class="btn-danger-sm" onclick="bulkDelete()">🗑 Delete</button>`
        : ''}
      ${['admin','manager','editor'].includes(CURRENT_ROLE)
        ? `<button class="btn-approve" onclick="bulkRequestApproval()">📩 Request Approval</button>`
        : ''}
      <button class="btn-ghost" onclick="clearBulkSelection()">Cancel</button>
    </div>`;
}

function clearBulkSelection() {
  selectedPostIds.clear();
  renderBulkBar();
  document.querySelectorAll('.post-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.post-select').forEach(cb => cb.checked = false);
}

async function bulkDelete() {
  const n = selectedPostIds.size;
  const ok = await showModal({
    title: `Delete ${n} posts?`,
    message: `All their platform targets, media links, analytics and comments will also be removed.`,
    icon: '🗑', confirmText: `Delete ${n}`, danger: true
  });
  if (!ok) return;
  await safe(async () => {
    for (const id of selectedPostIds) {
      await api(`/posts/${id}`, { method: 'DELETE' });
    }
    toast(`Deleted ${n} posts`, 'success');
    clearBulkSelection();
    await Promise.all([loadPosts(), loadUpcoming()]);
  });
}

async function bulkRequestApproval() {
  const n = selectedPostIds.size;
  await safe(async () => {
    let success = 0;
    for (const id of selectedPostIds) {
      try {
        await jsonPost(`/posts/${id}/request-approval`, { requested_by: CURRENT_USER_ID });
        success++;
      } catch (e) { /* skip errors */ }
    }
    toast(`Approval requested for ${success} posts`, 'success');
    clearBulkSelection();
    await Promise.all([loadPosts(), loadApprovals(), loadUpcoming()]);
  });
}

window.togglePostSelection = togglePostSelection;
window.clearBulkSelection = clearBulkSelection;
window.bulkDelete = bulkDelete;
window.bulkRequestApproval = bulkRequestApproval;

/* ========== CONTENT HEALTH SCORE ========== */
function computeHealth(post) {
  let score = 0;
  const checks = [];
  const content = post.content || '';

  // Length (0-25)
  if (content.length >= 50 && content.length <= 280) { score += 25; checks.push('✓ Good length'); }
  else if (content.length >= 20) { score += 15; checks.push('⚠ Could be longer'); }
  else { checks.push('✗ Too short'); }

  // Hashtags (0-15)
  if (/#\w+/.test(content)) { score += 15; checks.push('✓ Has hashtags'); }
  else { checks.push('⚠ No hashtags'); }

  // Call-to-action (0-15)
  if (/(shop|click|link|comment|share|buy|subscribe|follow|read|join|register|download)/i.test(content)) {
    score += 15; checks.push('✓ Has CTA');
  } else { checks.push('⚠ No call to action'); }

  // Media (0-15)
  if ((post.media || []).length > 0) { score += 15; checks.push('✓ Has media'); }
  else { checks.push('⚠ No media'); }

  // Platform coverage (0-15)
  const targetCount = (post.targets || []).length;
  if (targetCount >= 3) { score += 15; checks.push(`✓ ${targetCount} platforms`); }
  else if (targetCount >= 2) { score += 10; checks.push(`⚠ ${targetCount} platforms`); }
  else { score += 5; checks.push(`⚠ ${targetCount} platform`); }

  // Status (0-15)
  if (post.status === 'published') { score += 15; checks.push('✓ Already published'); }
  else if (post.status === 'scheduled') { score += 12; checks.push('✓ Scheduled'); }
  else if (post.status === 'approved') { score += 10; checks.push('✓ Approved'); }
  else if (post.status === 'pending') { score += 5; checks.push('⚠ Pending approval'); }
  else { checks.push('⚠ Draft status'); }

  return { score: Math.min(100, score), checks };
}

function healthRingHtml(post) {
  const { score, checks } = computeHealth(post);
  const tier = score >= 70 ? 'good' : score >= 40 ? 'warn' : 'bad';
  return `
    <div class="health-ring ${tier}" title="Content health: ${score}/100">${score}</div>
    <div class="health-tooltip">
      <b>Health: ${score}/100</b>
      <ul>${checks.map(c => `<li>${c}</li>`).join('')}</ul>
    </div>`;
}

/* ========== BEST TIME TO POST ========== */
async function loadBestTime() {
  const panel = document.getElementById('best-time-panel');
  if (!panel) return;
  try {
    const data = await api('/analytics/best-time');
    if (!data.peak) {
      panel.innerHTML = `<h3><span class="panel-icon">${ICON.clock}</span>Best Time to Post</h3><p class="muted">Not enough data yet.</p>`;
      return;
    }
    const hour = data.peak.hour_of_day;
    const hourLabel = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
    const nextHour = hourLabel.replace(/(\d+)/, m => +m + 1);

        panel.innerHTML = `
      <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
        <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#7C6CFF,#C25BFF);display:grid;place-items:center;color:#fff;font-size:20px;flex-shrink:0;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div style="flex:1;min-width:200px;">
          <div style="font-size:10.5px;font-weight:700;letter-spacing:.1em;color:var(--muted);margin-bottom:4px;">PEAK ENGAGEMENT WINDOW</div>
          <div style="font-size:18px;font-weight:700;color:var(--text);letter-spacing:-.02em;">${hourLabel} – ${nextHour}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;">Your audience is most active at this time</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:24px;font-weight:800;background:linear-gradient(135deg,#7C6CFF,#C25BFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${Math.round(Math.min(data.peak.avg_engagement, 9999)).toLocaleString()}</div>
          <div style="font-size:10px;color:var(--muted);font-weight:600;letter-spacing:.05em;">AVG INTERACTIONS</div>
        </div>
      </div>`;
  } catch (e) {
    panel.innerHTML = `<h3><span class="panel-icon">${ICON.clock}</span>Best Time to Post</h3><p class="muted">Could not load: ${esc(e.message)}</p>`;
  }
}

/* ========== SENTIMENT DASHBOARD ========== */
async function loadSentiment() {
  const panel = document.getElementById('sentiment-panel');
  if (!panel) return;
  try {
    const data = await api('/comments/sentiment');
    const total = data.positive + data.neutral + data.negative || 1;
    const pct = (n) => Math.round((n / total) * 100);
    const posPct = pct(data.positive), neuPct = pct(data.neutral), negPct = pct(data.negative);

    panel.innerHTML = `
      <h3 style="margin:0 0 12px;display:flex;align-items:center;gap:8px;"><span class="panel-icon">${ICON.message}</span>Comment Sentiment</h3>
      <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
        <div style="display:flex;flex:1;height:12px;border-radius:var(--r-full);overflow:hidden;min-width:200px;background:var(--bg-alt);">
          <div style="width:${posPct}%;background:#10b981;"></div>
          <div style="width:${neuPct}%;background:#94a3b8;"></div>
          <div style="width:${negPct}%;background:#ef4444;"></div>
        </div>
        <div style="display:flex;gap:14px;font-size:12px;font-weight:600;">
          <span style="color:#10b981;">● Positive ${data.positive}</span>
          <span style="color:#94a3b8;">● Neutral ${data.neutral}</span>
          <span style="color:#ef4444;">● Negative ${data.negative}</span>
        </div>
      </div>`;
  } catch (e) {
    panel.innerHTML = `<h3 style="display:flex;align-items:center;gap:8px;"><span class="panel-icon">${ICON.message}</span>Comment Sentiment</h3><p class="muted">Could not load.</p>`;
  }
}

/* ========== ACTIVITY TIMELINE ========== */
async function loadActivity() {
  const panel = document.getElementById('activity-panel');
  if (!panel) return;
  try {
    const rows = await api('/targets/activity');
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="margin:0;display:flex;align-items:center;gap:8px;"><span class="panel-icon">${ICON.activity}</span>Recent Activity</h3>
        <span style="font-size:11px;color:var(--muted);font-weight:600;">LAST ${rows.length} EVENTS</span>
      </div>
      ${rows.length ? `<div style="display:flex;flex-direction:column;gap:5px;">
        ${rows.map(r => {
          const isApproval = r.kind === 'approval';
          const isSuccess  = r.status === 'success' || r.status === 'approved';
          const cls   = isSuccess ? 'success' : 'danger';
          const ico   = isApproval
            ? (isSuccess ? ICON.checkCircle : ICON.xCircle)
            : (isSuccess ? ICON.rocket : ICON.alert);
          return `<div style="display:flex;gap:10px;align-items:center;padding:6px 10px;background:var(--panel-alt);border-radius:6px;font-size:12.5px;">
            <span class="activity-icon ${cls}">${ico}</span>
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text);">${esc(r.title)}</span>
            <span style="color:var(--muted);font-size:11px;font-weight:500;white-space:nowrap;">${relTime(r.at)}</span>
          </div>`;
        }).join('')}
      </div>` : '<p class="muted" style="font-size:12px;">No activity yet.</p>'}`;
  } catch (e) {
    panel.innerHTML = `<h3 style="display:flex;align-items:center;gap:8px;"><span class="panel-icon">${ICON.activity}</span>Recent Activity</h3><p class="muted">Could not load.</p>`;
  }
}

/* ========== GSAP: TAB ENTRY ANIMATION ========== */
function animateTabEntry(tabId) {
  const tab = document.getElementById(tabId);
  if (!tab) return;

  // Only animate the direct section-level children (not deep descendants)
  const children = tab.querySelectorAll(':scope > *');
  if (!children.length) return;

  gsap.killTweensOf(children);
  gsap.fromTo(children,
    { opacity: 0, y: 10 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out',
      clearProps: 'transform,opacity'
    }
  );
}

window.animateTabEntry = animateTabEntry;

/* ========== GSAP SCROLLTRIGGER ANIMATIONS ========== */
function initScrollAnimations() {
  if (typeof ScrollTrigger === 'undefined' || typeof gsap === 'undefined') {
    console.warn('ScrollTrigger not loaded — skipping scroll animations');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. Sidebar brand letter reveal (on load) ---------- */
  const brandLetters = document.querySelectorAll('.brand-title .letter');
  if (brandLetters.length) {
    gsap.fromTo(brandLetters,
      { y: 12, opacity: 0, rotateX: -40 },
      {
        y: 0, opacity: 1, rotateX: 0,
        duration: 0.55,
        stagger: 0.05,
        ease: 'back.out(1.7)',
        delay: 0.15
      }
    );
  }

  /* ---------- 2. Dashboard panel scroll reveals ---------- */
  // Every panel fades + slides in as it enters the viewport
  ScrollTrigger.batch('.panel, .chart-panel, .stat-card, .insights-grid > *', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'transform'
        }
      );
    }
  });

  /* ---------- 3. Post cards in grid ---------- */
  ScrollTrigger.batch('#posts-list .post-card', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch,
        { opacity: 0, y: 30, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: 'back.out(1.4)',
          clearProps: 'transform'
        }
      );
    }
  });

  /* ---------- 4. Table rows cascade ---------- */
  ScrollTrigger.batch('tbody tr', {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch,
        { opacity: 0, x: -12 },
        {
          opacity: 1, x: 0,
          duration: 0.4,
          stagger: 0.03,
          ease: 'power2.out',
          clearProps: 'transform'
        }
      );
    }
  });

  /* ---------- 5. Calendar day cells ---------- */
  ScrollTrigger.batch('.cal-day', {
    start: 'top 95%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1, scale: 1,
          duration: 0.35,
          stagger: 0.015,
          ease: 'power2.out',
          clearProps: 'transform'
        }
      );
    }
  });

  /* ---------- 6. Parallax on the login hero (if present) ---------- */
  const heroNebula = document.querySelector('.galaxy-nebula');
  if (heroNebula) {
    gsap.to(heroNebula, {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.login-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      }
    });
  }
}

/* Re-run batch animations whenever new content renders */
function refreshScrollTriggers() {
  if (typeof ScrollTrigger !== 'undefined') {
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }
}

window.initScrollAnimations = initScrollAnimations;
window.refreshScrollTriggers = refreshScrollTriggers;

/* ---------- Router ---------- */
function loadTab(tab) {
  safe(async () => {
    if (tab === 'calendar') await loadCalendar();
    if (tab === 'users') await loadUsers();
    if (tab === 'dashboard') await loadUpcoming();
    if (tab === 'posts') { await populateDropdowns(); await loadPosts(); }
    if (tab === 'accounts') await loadAccounts();
    if (tab === 'campaigns') await loadCampaigns();
    if (tab === 'analytics') await loadAnalytics();
    if (tab === 'approvals') await loadApprovals();
    if (tab === 'admin') await loadAdminTables();
    animateTabEntry(tab);
  });
}

/* ---------- Expose functions to inline onclick handlers ---------- */
window.toggleForm = toggleForm;
window.toggleTheme = toggleTheme;
window.toggleUserForm = toggleUserForm;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.loadUsers = loadUsers;
window.toggleAccountForm = toggleAccountForm;
window.toggleCampaignForm = toggleCampaignForm;
window.decide = decide;
window.deletePost = deletePost;
window.deleteAccount = deleteAccount;
window.requestApproval = requestApproval;
window.loadUpcoming = loadUpcoming;
window.loadAccounts = loadAccounts;
window.loadCampaigns = loadCampaigns;
window.loadAnalytics = loadAnalytics;
window.loadApprovals = loadApprovals;
window.loadAdminTables = loadAdminTables;

/* ---------- Init ---------- */
applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
applyRolePermissions();
safe(populateDropdowns);
loadTab('dashboard');

// Wait for DOM + charts to settle, then wire scroll animations
window.addEventListener('load', () => {
  setTimeout(initScrollAnimations, 200);
});
