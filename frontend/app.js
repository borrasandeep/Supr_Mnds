const BASE = 'http://localhost:5000';
const API = `${BASE}/api`;

/* ---------- Theme ---------- */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('cms_theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    // Re-render charts with theme-aware colors
  if (typeof loadUpcoming === 'function' && document.querySelector('#platformChart')) {
    setTimeout(() => loadUpcoming(), 60);
  }
}

function toggleTheme() {
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

function logout() {
  sessionStorage.removeItem('cms_user');
  sessionStorage.removeItem('cms_token');
  window.location.href = 'login.html';
}
window.logout = logout;

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return isNaN(dt) ? esc(d) : dt.toLocaleString();
};

async function api(path, options = {}) {
  const token = sessionStorage.getItem('cms_token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem('cms_user');
    sessionStorage.removeItem('cms_token');
    window.location.replace('login.html');
    return;
  }

  if (!res.ok) {
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
function toast(msg, type = '') {
  const el = $('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

async function safe(fn) {
  try { return await fn(); }
  catch (e) { toast(e.message || 'Something went wrong', 'error'); }
}

const emptyRow = (cols, msg) =>
  `<tr><td colspan="${cols}" style="text-align:center;color:#9ca3af;padding:1.5rem;">${msg}</td></tr>`;


/* ---------- Cached data ---------- */
let accountsCache = [];
let currentPostFilter = 'all';
let cachedPosts = [];

async function populateDropdowns() {
  const [users, campaigns, accounts] = await Promise.all([
    api('/users'), api('/campaigns'), api('/accounts')
  ]);

  // ---------- Author dropdown ----------
  const authorLabel = $('user_id').closest('label');

  if (CURRENT_ROLE === 'editor') {
    // Editors can only post as themselves — hide the field
    authorLabel.style.display = 'none';
    $('user_id').innerHTML = `<option value="${CURRENT_USER_ID}" selected>${esc(ME.full_name || ME.username)}</option>`;
  } else if (CURRENT_ROLE === 'viewer') {
    // Viewers can't post at all — hide the field
    authorLabel.style.display = 'none';
    $('user_id').innerHTML = `<option value="${CURRENT_USER_ID}" selected>${esc(ME.full_name || ME.username)}</option>`;
  } else {
    // Admin / manager: full list
    authorLabel.style.display = '';
    $('user_id').innerHTML = '<option value="">Select author...</option>' +
      users.map(u => `<option value="${u.user_id}">${esc(u.full_name || u.username)} (${esc(u.role)})</option>`).join('');
  }

  // ---------- Campaign dropdown ----------
  $('campaign_id').innerHTML = '<option value="">No campaign</option>' +
    campaigns.map(c => `<option value="${c.campaign_id}">${esc(c.name)}</option>`).join('');

  // ---------- Accounts cache (for target rows) ----------
  accountsCache = accounts;
}

/* ---------- Role-based access ---------- */
const ROLE_TABS = {
  admin:   ['dashboard','posts','accounts','campaigns','users','admin','analytics','approvals'],
  manager: ['dashboard','posts','accounts','campaigns','analytics','approvals'],
  editor:  ['dashboard','posts','campaigns','analytics'],
  viewer:  ['dashboard','analytics']
};

function applyRolePermissions() {
  // Fill sidebar user chip
  $('me-avatar').textContent = (ME.full_name || ME.username).charAt(0).toUpperCase();
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
document.querySelectorAll('nav button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.tab).classList.add('active');
    loadTab(btn.dataset.tab);
  };
});

/* ---------- Edit post ---------- */
async function editPost(id) {
  await safe(async () => {
    // Find post in cache
    const post = cachedPosts.find(p => p.post_id === id);
    if (!post) { toast('Post not found', 'error'); return; }

    // Open the form
    $('post-form').classList.remove('hidden');
    $('post-form').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Change the form title dynamically
    const formTitle = $('post-form').querySelector('h3');
    formTitle.textContent = 'Edit Post #' + id;

    // Store the editing ID on the form
    $('post-form').dataset.editId = id;

    // Fill fields (editors/viewers can only author as themselves)
    if (CURRENT_ROLE === 'editor' || CURRENT_ROLE === 'viewer') {
      $('user_id').value = CURRENT_USER_ID;
    } else {
      $('user_id').value = post.user_id || '';
    }
    $('campaign_id').value   = post.campaign_id || '';
    $('title').value         = post.title || '';
    $('content').value       = post.content || '';
    $('post_type').value     = post.post_type || 'text';

    // Clear existing target rows, rebuild from the post's targets
    $('targets-container').innerHTML = '';

    if ((post.targets || []).length === 0) {
      addTargetRow();
    } else {
      for (const t of post.targets) {
        const acc = accountsCache.find(a => a.account_name === t.account_name);
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
  });
}
window.editPost = editPost;

/* ---------- New post form ---------- */
function toggleForm() {
  const f = $('post-form');

  if (f.classList.contains('hidden')) {
    // Opening: reset to CREATE mode
    f.reset();
    f.dataset.editId = '';
    $('targets-container').innerHTML = '';

    // Re-apply editor/viewer self-authoring after reset
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
  } else {
    // Closing
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
  const [rows, posts, accounts, pending, byPlatform] = await Promise.all([
    api('/targets/upcoming'),
    api('/posts'),
    api('/accounts'),
    api('/approvals/pending'),
    api('/analytics/by-platform')
  ]);

  // ---- Upcoming table ----
  document.querySelector('#upcoming-table tbody').innerHTML = rows.length
    ? rows.map(x => `
      <tr>
        <td>${esc(x.title)}</td>
        <td>${esc(x.platform)}</td>
        <td>${esc(x.account_name)}</td>
        <td>${fmtDate(x.scheduled_at)}</td>
        <td><span class="badge ${esc(x.status)}">${esc(x.status)}</span></td>
      </tr>`).join('')
    : `<tr><td colspan="5">
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <h4>Nothing scheduled yet</h4>
          <p>Create your first scheduled post to see it here.</p>
          <button class="btn-primary" onclick="document.querySelector('[data-tab=posts]').click(); toggleForm();">+ Create Post</button>
        </div>
      </td></tr>`;

  // ---- Stat cards ----
  const scheduled = rows.length;
  const totalEngagement = byPlatform.reduce(
    (s, p) => s + (+p.total_likes || 0) + (+p.total_comments || 0) + (+p.total_shares || 0), 0
  );

  $('stat-cards').innerHTML = `
    <div class="stat-card">
      <div class="stat-body">
        <div class="label">Total Posts</div>
        <div class="value" data-count="${posts.length}">0</div>
        <div class="trend up">▲ Active content</div>
      </div>
      <div class="stat-icon">📝</div>
    </div>

    <div class="stat-card green">
      <div class="stat-body">
        <div class="label">Social Accounts</div>
        <div class="value" data-count="${accounts.length}">0</div>
        <div class="trend flat">Connected platforms</div>
      </div>
      <div class="stat-icon">🌐</div>
    </div>

    <div class="stat-card orange">
      <div class="stat-body">
        <div class="label">Scheduled</div>
        <div class="value" data-count="${scheduled}">0</div>
        <div class="trend up">▲ Upcoming</div>
      </div>
      <div class="stat-icon">📅</div>
    </div>

    <div class="stat-card red">
      <div class="stat-body">
        <div class="label">Pending Approvals</div>
        <div class="value" data-count="${pending.length}">0</div>
        <div class="trend ${pending.length > 0 ? 'down' : 'flat'}">${pending.length > 0 ? '⚠ Needs review' : '✓ All clear'}</div>
      </div>
      <div class="stat-icon">✅</div>
    </div>
  `;

  // Count-up animation
  document.querySelectorAll('.stat-card .value').forEach(el => {
    const target = +el.dataset.count;
    const duration = 600;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  // ---- Charts ----
  renderPlatformChart(byPlatform);
  renderDistributionChart(posts);
}

function renderPlatformChart(byPlatform) {
  const ctx = document.getElementById('platformChart');
  if (!ctx) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,.06)' : 'rgba(15,23,42,.06)';
  const textColor = isDark ? '#9aa5bd' : '#7b8299';

  if (platformChartInstance) platformChartInstance.destroy();

  platformChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: byPlatform.map(p => p.name),
      datasets: [
        {
          label: 'Likes',
          data: byPlatform.map(p => +p.total_likes || 0),
          backgroundColor: '#6366f1',
          borderRadius: 6,
          barThickness: 28
        },
        {
          label: 'Comments',
          data: byPlatform.map(p => +p.total_comments || 0),
          backgroundColor: '#8b5cf6',
          borderRadius: 6,
          barThickness: 28
        },
        {
          label: 'Shares',
          data: byPlatform.map(p => +p.total_shares || 0),
          backgroundColor: '#a78bfa',
          borderRadius: 6,
          barThickness: 28
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 }, padding: 14, boxWidth: 12 }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
        y: { grid: { color: gridColor, drawBorder: false }, ticks: { color: textColor, font: { size: 11 }, precision: 0 } }
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
  const posts = currentPostFilter === 'all'
    ? cachedPosts
    : cachedPosts.filter(p => p.status === currentPostFilter);

  $('posts-list').innerHTML = posts.length
    ? posts.map(p => `
      <div class="post-card">
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
              ${p.targets.map(t => `
                <div class="target-pill">
                  <span><strong>${esc(t.platform)}</strong> · ${esc(t.account_name)}</span>
                  <span class="badge ${esc(t.status)}">${esc(t.status)}</span>
                </div>`).join('')}
             </div>`
          : ''}

        <div class="meta">
          <span>👤 ${esc(p.author)}</span>
          <span>📁 ${esc(p.campaign || 'No campaign')}</span>
        </div>

        <div class="post-actions">
          ${['admin','manager','editor'].includes(CURRENT_ROLE)
            ? `<button class="btn-ghost" onclick="editPost(${+p.post_id})">✏ Edit</button>`
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
        <div class="empty-icon">🔍</div>
        <h4>No ${currentPostFilter === 'all' ? '' : currentPostFilter} posts</h4>
        <p>Try a different filter or create a new post.</p>
      </div>`;

  // Update count text
  const label = currentPostFilter === 'all' ? 'posts' : `${currentPostFilter} posts`;
  $('post-count').textContent = `${posts.length} ${label}`;
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
    renderPostChips();
    renderPosts();
  };
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
        <td>${fmtDate(x.requested_at)}</td>
        <td>${['admin','manager'].includes(CURRENT_ROLE)
          ? `<button class="btn-approve" onclick="decide(${+x.approval_id},'approved')">Approve</button>
             <button class="btn-reject" onclick="decide(${+x.approval_id},'rejected')">Reject</button>`
          : '<span class="muted">—</span>'}</td>
      </tr>`).join('')
    : emptyRow(5, 'No pending approvals 🎉');
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
}

async function deletePost(id) {
  await safe(async () => {
    if (!confirm('Delete this post?\nIts platform targets, media links, analytics and comments will also be removed.')) return;
    await api(`/posts/${id}`, { method: 'DELETE' });
    toast('Post deleted', 'success');
    currentPostFilter = 'all';
    await Promise.all([loadPosts(), loadUpcoming()]);
  });
}

async function deleteAccount(id) {
  await safe(async () => {
    if (!confirm('Delete this social account?\nAll its post targets will also be removed.')) return;
    await api(`/accounts/${id}`, { method: 'DELETE' });
    toast('Account deleted', 'success');
    await loadAccounts();
  });
}

async function requestApproval(id) {
  await safe(async () => {
    if (!confirm('Send this post for approval?')) return;
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
    if (!confirm('Delete this user?\nAll posts they created will also be removed.')) return;
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
        <div class="empty-icon">📭</div>
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

/* ---------- Router ---------- */
function loadTab(tab) {
  safe(async () => {
    if (tab === 'users')     await loadUsers();
    if (tab === 'dashboard') await loadUpcoming();
    if (tab === 'posts')     { await populateDropdowns(); await loadPosts(); }
    if (tab === 'accounts')  await loadAccounts();
    if (tab === 'campaigns') await loadCampaigns();
    if (tab === 'analytics') await loadAnalytics();
    if (tab === 'approvals') await loadApprovals();
    if (tab === 'admin')     await loadAdminTables();
  });
}

/* ---------- Expose functions to inline onclick handlers ---------- */
window.toggleForm        = toggleForm;
window.toggleTheme = toggleTheme;
window.toggleUserForm = toggleUserForm;
window.editUser       = editUser;
window.deleteUser     = deleteUser;
window.loadUsers      = loadUsers;
window.toggleAccountForm = toggleAccountForm;
window.toggleCampaignForm = toggleCampaignForm;
window.decide            = decide;
window.deletePost        = deletePost;
window.deleteAccount     = deleteAccount;
window.requestApproval   = requestApproval;
window.loadUpcoming      = loadUpcoming;
window.loadAccounts      = loadAccounts;
window.loadCampaigns     = loadCampaigns;
window.loadAnalytics     = loadAnalytics;
window.loadApprovals     = loadApprovals;

/* ---------- Init ---------- */
applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
applyRolePermissions();
safe(populateDropdowns);
loadTab('dashboard');
