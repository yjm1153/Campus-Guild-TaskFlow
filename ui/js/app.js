const API_BASE = window.API_BASE || '/api';

const state = {
  currentPage: 'login',
  user: null,
  token: null,
  tasks: [],
  filterStatus: 'all',
  searchQuery: '',
  category: '',
  showUserMenu: false,
  profileTab: 'published',
  page: 0,
  totalPages: 0,
  loading: false,
  adminTab: 'users',
  adminUserPage: 0,
  adminTaskPage: 0,
  adminTaskStatus: '',
  adminUsersData: { items: [], totalPages: 0 },
  adminTasksData: { items: [], totalPages: 0 },
  adminStats: null,
};

const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }
    return data.data;
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  get(endpoint) {
    return this.request(endpoint);
  },
};

const apiAuth = {
  login(username, password) {
    return api.post('/auth/login', { username, password });
  },
  register(username, password, nickname) {
    return api.post('/auth/register', { username, password, nickname });
  },
};

const apiAdmin = {
  getUsers(page = 0, pageSize = 10) {
    return api.get(`/admin/users?page=${page}&pageSize=${pageSize}`);
  },
  banUser(userId) {
    return api.request(`/admin/users/${userId}/ban`, { method: 'PUT' });
  },
  unbanUser(userId) {
    return api.request(`/admin/users/${userId}/unban`, { method: 'PUT' });
  },
  getTasks(page = 0, pageSize = 10, status = '') {
    let url = `/admin/tasks?page=${page}&pageSize=${pageSize}`;
    if (status) url += `&status=${status}`;
    return api.get(url);
  },
  deleteTask(taskId) {
    return api.request(`/admin/tasks/${taskId}`, { method: 'DELETE' });
  },
  getStats() {
    return api.get('/admin/stats');
  },
};

const apiTasks = {
  browse(page = 0, pageSize = 10, keyword = '', category = '') {
    const params = new URLSearchParams({ page, pageSize });
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('category', category);
    return api.get(`/tasks?${params}`);
  },
  publish(title, description, category, reward) {
    return api.post('/tasks', { title, description, category, reward });
  },
  accept(taskId) {
    return api.post(`/tasks/${taskId}/accept`, {});
  },
  complete(taskId) {
    return api.post(`/tasks/${taskId}/complete`, {});
  },
  cancel(taskId) {
    return api.post(`/tasks/${taskId}/cancel`, {});
  },
  getDetail(taskId) {
    return api.get(`/tasks/${taskId}`);
  },
  incrementViews(taskId) {
    return api.post(`/tasks/${taskId}/views`, {});
  },
  myPublished(page = 0, pageSize = 10) {
    return api.get(`/tasks/my/published?page=${page}&pageSize=${pageSize}`);
  },
  myAccepted(page = 0, pageSize = 10) {
    return api.get(`/tasks/my/accepted?page=${page}&pageSize=${pageSize}`);
  },
};

const levelNames = ['新手', '见习', '冒险者', '精英', '勇士', '骑士', '领主', '传奇'];
const statusConfig = {
  '待接取': { label: '待接取', className: 'badge-pending' },
  '进行中': { label: '进行中', className: 'badge-progress' },
  '已完成': { label: '已完成', className: 'badge-completed' },
  '已取消': { label: '已取消', className: 'badge-cancelled' },
};

async function init() {
  const savedUser = localStorage.getItem('user');
  const savedToken = localStorage.getItem('token');
  if (savedUser && savedToken) {
    state.user = JSON.parse(savedUser);
    state.token = savedToken;
    state.currentPage = 'dashboard';
    await loadTasks();
  }
  render();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-action]').forEach(el => {
    const action = el.dataset.action;
    el.addEventListener('click', function() {
      if (action === 'openTaskDetail') {
        openTaskDetail(el.dataset.id);
      } else if (action === 'handleAcceptTask') {
        handleAcceptTask(parseInt(el.dataset.id));
      } else if (action === 'handleCompleteTask') {
        handleCompleteTask(parseInt(el.dataset.id));
      } else if (action === 'handleCancelTask') {
        handleCancelTask(parseInt(el.dataset.id));
      } else if (action === 'navigate') {
        navigate(el.dataset.page);
      } else if (action === 'handleLogout') {
        handleLogout();
      } else if (action === 'toggleUserMenu') {
        toggleUserMenu();
      } else if (action === 'selectCategory') {
        selectCategory(el, el.dataset.category);
      } else if (action === 'setReward') {
        setReward(parseInt(el.dataset.value));
      } else if (action === 'setProfileTab') {
        state.profileTab = el.dataset.tab;
        render();
      } else if (action === 'setCategory') {
        state.category = el.dataset.key;
        state.page = 0;
        loadTasks();
      } else if (action === 'handleBanUser') {
        handleBanUser(parseInt(el.dataset.id));
      } else if (action === 'handleUnbanUser') {
        handleUnbanUser(parseInt(el.dataset.id));
      } else if (action === 'handleDeleteTask') {
        handleDeleteTask(parseInt(el.dataset.id));
      } else if (action === 'setAdminTab') {
        state.adminTab = el.dataset.tab;
        state.adminUserPage = 0;
        state.adminTaskPage = 0;
        render();
      } else if (action === 'adminPage') {
        state[el.dataset.key] = parseInt(el.dataset.page);
        render();
      } else if (action === 'adminFilterTasks') {
        state.adminTaskStatus = el.dataset.status;
        state.adminTaskPage = 0;
        render();
      }
    });
  });
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      state.searchQuery = this.value;
      loadTasks();
    });
  }
}

function navigate(page, params = {}) {
  state.currentPage = page;
  state.showUserMenu = false;
  state.pageParams = params;
  render();
}

function saveUser(user, token) {
  state.user = user;
  state.token = token;
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
}

function clearSession() {
  state.user = null;
  state.token = null;
  state.tasks = [];
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

async function handleLogout(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  try {
    await api.post('/auth/logout', {});
  } catch (err) {
  }
  clearSession();
  navigate('login');
}

async function loadTasks() {
  state.loading = true;
  render();
  try {
    const result = await apiTasks.browse(state.page, 10, state.searchQuery, state.category);
    state.tasks = result.items;
    state.totalPages = result.totalPages;
  } catch (e) {
    showError(e.message);
  } finally {
    state.loading = false;
    render();
  }
}

function showError(message, elementId = 'error-message') {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

function svgIcon(path, className = 'w-5 h-5') {
  return `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="${path}"/></svg>`;
}

function formatTimeAgo(dateString) {
  if (!dateString) return '刚刚';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}

function renderNavbar() {
  if (!state.user) return '';
  const navItems = [
    { page: 'dashboard', label: '任务大厅', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { page: 'publish', label: '发布悬赏', icon: 'M12 4v16m8-8H4' },
    { page: 'profile', label: '个人中心', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];
  if (state.user.role === 'ADMIN') {
    navItems.push({ page: 'admin', label: '管理后台', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' });
  }
  const initial = escapeHtml(state.user.username?.charAt(0).toUpperCase() || 'U');
  return `
    <nav class="navbar">
      <div class="container">
        <div class="navbar-inner">
          <a href="#" class="navbar-logo" data-action="navigate" data-page="dashboard">
            <div class="navbar-logo-icon gradient-campus">${svgIcon('M13 10V3L4 14h7v7l9-11h-7z', 'w-5 h-5 text-white')}</div>
            <span class="navbar-logo-text">TaskFlow</span>
          </a>
          <div class="navbar-nav">
            ${navItems.map(item => `
              <a href="#" class="navbar-nav-item ${state.currentPage === item.page ? 'active' : ''}" data-action="navigate" data-page="${item.page}">
                ${svgIcon(item.icon)} ${item.label}
              </a>
            `).join('')}
          </div>
          <div class="navbar-actions">
            <div class="navbar-points">
              ${svgIcon('M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z', 'navbar-points-icon')}
              <span class="navbar-points-value">${state.user.points || 0}</span>
            </div>
            <div class="navbar-user">
              <button class="navbar-user-btn" data-action="toggleUserMenu">
                <div class="navbar-user-avatar gradient-campus">${initial}</div>
                <span class="navbar-user-name">${escapeHtml(state.user.username)}</span>
              </button>
              ${state.showUserMenu ? `
                <div class="navbar-user-menu">
                  <div class="navbar-user-menu-header">
                    <div class="navbar-user-menu-name">${escapeHtml(state.user.username)}</div>
                    <div class="navbar-user-menu-level">Lv.${state.user.guildLevel || 1} · ${state.user.points || 0} 积分</div>
                  </div>
                  <button class="navbar-user-menu-item" data-action="navigate" data-page="profile">个人中心</button>
                  <button class="navbar-user-menu-item logout" data-action="handleLogout">退出登录</button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
      <div class="navbar-mobile">
        <div class="container">
          <div class="navbar-mobile-nav">
            ${navItems.map(item => `
              <a href="#" class="navbar-mobile-item ${state.currentPage === item.page ? 'active' : ''}" data-action="navigate" data-page="${item.page}">
                ${svgIcon(item.icon, 'w-5 h-5')}
                <span>${item.label}</span>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    </nav>
  `;
}

function renderTaskCard(task) {
  const status = statusConfig[task.status] || statusConfig['待接取'];
  const initial = escapeHtml(task.publisherNickname?.charAt(0).toUpperCase() || 'U');
  return `
    <div class="task-card card animate-slide-up">
      <div class="task-card-header">
        <h3 class="task-card-title">${escapeHtml(task.title)}</h3>
        <span class="badge ${status.className}">${status.label}</span>
      </div>
      <p class="task-card-desc">${escapeHtml(task.description || '')}</p>
      <div class="task-card-footer">
        <div class="task-card-publisher">
          <div class="task-card-avatar gradient-campus">${initial}</div>
          <span class="task-card-publisher-name">${escapeHtml(task.publisherNickname)}</span>
        </div>
        <div class="task-card-reward">
          ${svgIcon('M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z', 'w-4 h-4')}
          <span class="task-card-reward-value">${task.reward} 积分</span>
        </div>
      </div>
      <div class="task-card-meta">
        <span class="task-card-meta-item">${svgIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 'w-3.5 h-3.5')} ${formatTimeAgo(task.createdAt)}</span>
        <span class="task-card-meta-item">${svgIcon('M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', 'w-3.5 h-3.5')} ${task.views || 0}</span>
      </div>
      <button class="task-card-btn" data-action="openTaskDetail" data-id="${task.id}">查看详情</button>
    </div>
  `;
}

function renderLoginPage() {
  return `
    <div class="login-page gradient-subtle">
      <div class="login-container">
        <div class="login-header animate-fade-in">
          <div class="login-header-icon gradient-campus">${svgIcon('M13 10V3L4 14h7v7l9-11h-7z', 'w-8 h-8')}</div>
          <h1>欢迎回来</h1>
          <p>登录你的 Campus Guild 账号</p>
        </div>
        <div class="login-card card animate-slide-up">
          <form class="login-form" id="login-form" onsubmit="handleLogin(event)">
            <div>
              <label class="login-form-label">用户名</label>
              <input type="text" id="login-username" class="input-field" placeholder="请输入用户名" required>
            </div>
            <div>
              <label class="login-form-label">密码</label>
              <input type="password" id="login-password" class="input-field" placeholder="请输入密码" required>
            </div>
            <div id="login-error" class="error-message" style="display:none;"></div>
            <button type="submit" class="btn-primary" id="login-btn">登录</button>
          </form>
          <div class="login-footer">
            <p class="login-footer-text">还没有账号？ <a href="#" class="login-footer-link" data-action="navigate" data-page="register">立即注册</a></p>
          </div>
        </div>
        <div class="login-copyright">Campus Guild TaskFlow © 2026</div>
      </div>
    </div>
  `;
}

function renderRegisterPage() {
  return `
    <div class="login-page gradient-subtle">
      <div class="login-container">
        <div class="login-header animate-fade-in">
          <div class="login-header-icon gradient-campus">${svgIcon('M13 10V3L4 14h7v7l9-11h-7z', 'w-8 h-8')}</div>
          <h1>加入公会</h1>
          <p>注册你的 Campus Guild 账号</p>
        </div>
        <div class="login-card card animate-slide-up">
          <div id="register-error" class="error-message" style="display:none;"></div>
          <form class="login-form" id="register-form" onsubmit="handleRegister(event)">
            <div>
              <label class="login-form-label">用户名</label>
              <input type="text" id="reg-username" class="input-field" placeholder="请输入用户名" required>
            </div>
            <div>
              <label class="login-form-label">昵称</label>
              <input type="text" id="reg-nickname" class="input-field" placeholder="请输入昵称" required>
            </div>
            <div>
              <label class="login-form-label">密码</label>
              <input type="password" id="reg-password" class="input-field" placeholder="请输入密码（至少6位）" required>
            </div>
            <div>
              <label class="login-form-label">确认密码</label>
              <input type="password" id="reg-confirm" class="input-field" placeholder="请再次输入密码" required>
            </div>
            <button type="submit" class="btn-primary">注册</button>
          </form>
          <div class="login-footer">
            <p class="login-footer-text">已有账号？ <a href="#" class="login-footer-link" data-action="navigate" data-page="login">立即登录</a></p>
          </div>
        </div>
        <div class="login-copyright">Campus Guild TaskFlow © 2026</div>
      </div>
    </div>
  `;
}

async function renderDashboardPage() {
  const filterBtns = [
    { key: '', label: '全部' },
    { key: 'delivery', label: '代拿代送' },
    { key: 'tech', label: '技术求助' },
    { key: 'study', label: '学习辅导' },
    { key: 'secondhand', label: '二手交易' },
    { key: 'other', label: '其他' },
  ];
  return `
    <div class="page">
      ${renderNavbar()}
      <div class="container page-content">
        <div class="dashboard-header animate-fade-in">
          <h1>任务大厅</h1>
          <p>浏览并接取感兴趣的校园任务</p>
        </div>
        <div class="filter-bar card animate-slide-up" style="animation-delay:0.2s">
          <div class="filter-bar-inner">
            <div class="search-wrapper">
              ${svgIcon('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', 'w-5 h-5')}
              <input type="text" class="input-field search-input" placeholder="搜索任务..." value="${escapeHtml(state.searchQuery)}" oninput="state.searchQuery=this.value;loadTasks();">
            </div>
            <div class="filter-buttons">
              ${filterBtns.map(btn => `
                <button class="filter-btn ${state.category === btn.key ? 'active' : ''}" data-action="setCategory" data-key="${btn.key}">${btn.label}</button>
              `).join('')}
            </div>
          </div>
        </div>
        ${state.loading ? `
          <div class="card empty-state">
            <p>加载中...</p>
          </div>
        ` : state.tasks.length > 0 ? `
          <div class="tasks-grid">
            ${state.tasks.map((task, i) => renderTaskCard(task)).join('')}
          </div>
        ` : `
          <div class="card empty-state">
            ${svgIcon('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 'w-16 h-16')}
            <p>暂无匹配的任务</p>
          </div>
        `}
      </div>
    </div>
  `;
}

async function viewTaskDetail(taskId) {
  try {
    const task = await apiTasks.getDetail(taskId);
    state.currentTask = task;
    state.currentPage = 'taskDetail';
    render();
  } catch (e) {
    console.error('viewTaskDetail error:', e);
  }
}

async function renderTaskDetailPage() {
  const task = state.currentTask;
  if (!task) {
    return renderDashboardPage();
  }
  const status = statusConfig[task.status];
  const initial = escapeHtml(task.publisherNickname?.charAt(0).toUpperCase() || 'U');
  let actionHtml = '';
  if (task.status === '待接取') {
    if (task.publisherId === state.user.id) {
      actionHtml = `<div class="detail-progress">这是你发布的任务，等待他人接取</div>
                    <button class="btn-secondary" data-action="handleCancelTask" data-id="${task.id}">取消任务</button>`;
    } else {
      actionHtml = `<button class="btn-success" data-action="handleAcceptTask" data-id="${task.id}">接取任务</button>`;
    }
  } else if (task.status === '进行中') {
    if (task.publisherId === state.user.id) {
      actionHtml = `<button class="btn-primary" data-action="handleCompleteTask" data-id="${task.id}">确认完成</button>
                    <button class="btn-secondary" data-action="handleCancelTask" data-id="${task.id}">取消任务</button>`;
    } else if (task.accepterId === state.user.id) {
      actionHtml = `<div class="detail-progress">你已接取此任务，请尽快完成</div>`;
    } else {
      actionHtml = `<div class="detail-progress">任务进行中...</div>`;
    }
  } else {
    actionHtml = `<div class="detail-completed">${escapeHtml(status?.label || task.status)}</div>`;
  }
  return `
    <div class="page">
      ${renderNavbar()}
      <div class="container page-content">
        <button class="back-btn" data-action="navigate" data-page="dashboard">${svgIcon('M15 19l-7-7 7-7')} 返回</button>
        <div id="detail-message" class="error-message" style="display:none;"></div>
        <div class="detail-card card animate-scale-in">
          <div class="detail-header">
            <div>
              <h1 class="detail-title">${escapeHtml(task.title)}</h1>
              <div class="detail-badges">
                <span class="badge ${status.className}">${status.label}</span>
                <span class="task-card-meta-item">${svgIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 'w-4 h-4')} ${formatTimeAgo(task.createdAt)}</span>
                <span class="task-card-meta-item">${svgIcon('M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', 'w-4 h-4')} ${task.views || 0} 次浏览</span>
              </div>
            </div>
            <div class="detail-reward">
              ${svgIcon('M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z')}
              <span class="detail-reward-value">${task.reward}</span>
              <span class="detail-reward-label">积分</span>
            </div>
          </div>
          <div class="detail-section">
            <h2 class="detail-section-title">任务描述</h2>
            <p class="detail-desc">${escapeHtml(task.description || '无描述')}</p>
          </div>
          <div class="detail-section">
            <h2 class="detail-section-title">发布者信息</h2>
            <div class="detail-publisher">
              <div class="detail-publisher-avatar gradient-campus">${initial}</div>
              <div>
                <div class="detail-publisher-name">${escapeHtml(task.publisherNickname)}</div>
                <div class="detail-publisher-level">Lv.${task.publisherGuildLevel || 1} · 公会成员</div>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-actions">
              ${actionHtml}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPublishPage() {
  const categories = [
    { value: 'delivery', label: '代拿代送', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { value: 'tech', label: '技术求助', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { value: 'study', label: '学习辅导', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { value: 'secondhand', label: '二手交易', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { value: 'other', label: '其他', icon: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z' },
  ];
  return `
    <div class="page">
      ${renderNavbar()}
      <div class="container page-content">
        <div class="publish-header animate-fade-in">
          <h1>发布悬赏</h1>
          <p>填写任务信息，等待冒险者接取</p>
        </div>
        <div class="publish-card card animate-slide-up">
          <div id="publish-error" class="error-message" style="display:none;"></div>
          <form class="publish-form" onsubmit="handlePublish(event)">
            <div>
              <label class="publish-label">任务标题</label>
              <input type="text" id="pub-title" class="input-field" placeholder="简要描述你的任务" required>
            </div>
            <div>
              <label class="publish-label">任务分类</label>
              <div class="publish-categories">
                ${categories.map(cat => `
                  <button type="button" class="publish-category-btn" data-action="selectCategory" data-category="${cat.value}">
                    ${svgIcon(cat.icon)} <span>${cat.label}</span>
                  </button>
                `).join('')}
              </div>
            </div>
            <div>
              <label class="publish-label">详细描述</label>
              <textarea id="pub-desc" class="input-field publish-textarea" placeholder="详细描述任务内容、要求、时间地点等信息"></textarea>
            </div>
            <div>
              <label class="publish-label">悬赏积分</label>
              <div class="publish-reward-row">
                <input type="number" id="pub-reward" class="input-field publish-reward-input" placeholder="10" min="1" required>
                <span class="publish-reward-label">积分</span>
                <div class="publish-reward-presets">
                  <button type="button" class="publish-reward-preset" data-action="setReward" data-value="10">10</button>
                  <button type="button" class="publish-reward-preset" data-action="setReward" data-value="20">20</button>
                  <button type="button" class="publish-reward-preset" data-action="setReward" data-value="50">50</button>
                </div>
              </div>
            </div>
            <div class="publish-actions">
              <button type="button" class="btn-secondary" data-action="navigate" data-page="dashboard">取消</button>
              <button type="submit" class="btn-primary">发布任务</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

async function renderProfilePage() {
  const user = state.user;
  const level = user?.guildLevel || 1;
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];
  const initial = user?.username?.charAt(0).toUpperCase() || 'U';
  const activeTab = state.profileTab || 'published';

  let myTasks = [];
  try {
    const result = activeTab === 'published'
      ? await apiTasks.myPublished()
      : await apiTasks.myAccepted();
    myTasks = result.items || [];
  } catch (e) {
    console.error(e);
  }

  const exp = user?.experience || 0;
  const expThisLevel = exp - (level - 1) * 100;
  const expPercent = Math.min(100, Math.max(0, (expThisLevel / 100) * 100));
  return `
    <div class="page">
      ${renderNavbar()}
      <div class="container page-content">
        <div class="profile-card card animate-fade-in">
          <div class="profile-banner gradient-campus">
            <div class="profile-banner-decor">
              <div class="profile-banner-circle profile-banner-circle-1"></div>
              <div class="profile-banner-circle profile-banner-circle-2"></div>
              <div class="profile-banner-circle profile-banner-circle-3"></div>
            </div>
          </div>
          <div class="profile-body">
            <div class="profile-info">
              <div class="profile-avatar-wrapper">
                <div class="profile-avatar gradient-campus">${initial}</div>
              </div>
              <div class="profile-details">
                <div class="profile-name-row">
                  <h1 class="profile-name">${escapeHtml(user?.username || '用户')}</h1>
                  <span class="profile-level-badge">Lv.${level} · ${levelName}</span>
                </div>
                <p class="profile-joined">积分: ${user?.points || 0} | 经验: ${exp}</p>
              </div>
            </div>
            <div class="profile-exp">
              <div class="profile-exp-header">
                <span class="profile-exp-label">经验值</span>
                <span class="profile-exp-value">${Math.max(0, expThisLevel)} / 100</span>
              </div>
              <div class="profile-exp-bar">
                <div class="profile-exp-fill gradient-campus" style="width:${expPercent}%"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="profile-tabs-card card animate-slide-up" style="animation-delay:0.4s">
          <div class="profile-tabs">
            <button class="profile-tab ${activeTab === 'published' ? 'active' : ''}" data-action="setProfileTab" data-tab="published">我发布的</button>
            <button class="profile-tab ${activeTab === 'accepted' ? 'active' : ''}" data-action="setProfileTab" data-tab="accepted">我接取的</button>
          </div>
          <div class="profile-tab-content">
            ${myTasks.length > 0 ? `
              <div class="tasks-grid">
                ${myTasks.map(task => renderTaskCard(task)).join('')}
              </div>
            ` : `
              <div class="profile-empty">暂无任务记录</div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

async function renderAdminPage() {
  if (!state.adminStats) {
    try { state.adminStats = await apiAdmin.getStats(); } catch (e) { state.adminStats = {}; }
  }
  const stats = state.adminStats || {};
  const activeTab = state.adminTab || 'users';
  const statsCards = [
    { key: 'totalUsers', label: '用户总数', color: 'var(--campus-500)', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', bg: 'var(--campus-50)' },
    { key: 'totalTasks', label: '任务总数', color: 'var(--leaf-500)', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', bg: 'var(--green-50)' },
    { key: 'pendingTasks', label: '待接取', color: 'var(--campus-600)', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'var(--blue-50)' },
    { key: 'completedTasks', label: '已完成', color: 'var(--leaf-600)', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'var(--green-50)' },
  ];

  let tabContent = '';
  if (activeTab === 'users') {
    try {
      const result = await apiAdmin.getUsers(state.adminUserPage);
      state.adminUsersData = result;
    } catch (e) { state.adminUsersData = { items: [], totalPages: 0 }; }
    const users = state.adminUsersData.items || [];
    tabContent = `
      <div class="card admin-table-card animate-slide-up">
        <table class="admin-table">
          <thead><tr>
            <th>ID</th><th>用户名</th><th>昵称</th><th>角色</th><th>等级</th><th>积分</th><th>状态</th><th>操作</th>
          </tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td class="admin-table-id">${u.id}</td>
                <td class="admin-table-username">${escapeHtml(u.username)}</td>
                <td>${escapeHtml(u.nickname || '')}</td>
                <td><span class="admin-role-badge ${u.role === 'ADMIN' ? 'admin-role-admin' : ''}">${u.role === 'ADMIN' ? '管理员' : '用户'}</span></td>
                <td>Lv.${u.guildLevel || 1}</td>
                <td>${u.points || 0}</td>
                <td><span class="badge ${u.banned ? 'badge-progress' : 'badge-completed'}">${u.banned ? '已封禁' : '正常'}</span></td>
                <td>
                  ${u.role !== 'ADMIN' ? (
                    u.banned
                      ? `<button class="admin-action-btn admin-action-unban" data-action="handleUnbanUser" data-id="${u.id}">解封</button>`
                      : `<button class="admin-action-btn admin-action-ban" data-action="handleBanUser" data-id="${u.id}">封禁</button>`
                  ) : '<span class="admin-action-na">-</span>'}
                </td>
              </tr>
            `).join('')}
            ${users.length === 0 ? '<tr><td colspan="8" class="admin-table-empty">暂无用户数据</td></tr>' : ''}
          </tbody>
        </table>
        ${renderAdminPagination(state.adminUserPage, state.adminUsersData.totalPages || 0, 'adminUserPage', 'admin-prev-users', 'admin-next-users')}
      </div>`;
  } else {
    const statusOptions = [
      { value: '', label: '全部' },
      { value: 'PENDING', label: '待接取' },
      { value: 'IN_PROGRESS', label: '进行中' },
      { value: 'COMPLETED', label: '已完成' },
      { value: 'CANCELLED', label: '已取消' },
    ];
    try {
      const result = await apiAdmin.getTasks(state.adminTaskPage, 10, state.adminTaskStatus);
      state.adminTasksData = result;
    } catch (e) { state.adminTasksData = { items: [], totalPages: 0 }; }
    const tasks = state.adminTasksData.items || [];
    tabContent = `
      <div class="admin-filter-bar">
        ${statusOptions.map(s => `
          <button class="filter-btn ${state.adminTaskStatus === s.value ? 'active' : ''}" data-action="adminFilterTasks" data-status="${s.value}">${s.label}</button>
        `).join('')}
      </div>
      <div class="card admin-table-card animate-slide-up">
        <table class="admin-table">
          <thead><tr>
            <th>ID</th><th>标题</th><th>发布者</th><th>状态</th><th>赏金</th><th>截止日期</th><th>操作</th>
          </tr></thead>
          <tbody>
            ${tasks.map(t => {
              const st = statusConfig[t.status] || statusConfig['待接取'];
              const dl = t.deadline ? new Date(t.deadline).toLocaleDateString('zh-CN') : '-';
              return `
                <tr>
                  <td class="admin-table-id">${t.id}</td>
                  <td class="admin-table-title" title="${escapeHtml(t.title)}">${escapeHtml(t.title)}</td>
                  <td>${escapeHtml(t.publisherNickname || '')}</td>
                  <td><span class="badge ${st.className}">${st.label}</span></td>
                  <td>${t.reward}</td>
                  <td>${dl}</td>
                  <td>
                    <button class="admin-action-btn admin-action-delete" data-action="handleDeleteTask" data-id="${t.id}">删除</button>
                  </td>
                </tr>`;
            }).join('')}
            ${tasks.length === 0 ? '<tr><td colspan="7" class="admin-table-empty">暂无任务数据</td></tr>' : ''}
          </tbody>
        </table>
        ${renderAdminPagination(state.adminTaskPage, state.adminTasksData.totalPages || 0, 'adminTaskPage', 'admin-prev-tasks', 'admin-next-tasks')}
      </div>`;
  }

  return `
    <div class="page">
      ${renderNavbar()}
      <div class="container page-content">
        <div class="dashboard-header animate-fade-in">
          <h1>管理后台</h1>
          <p>管理用户与任务</p>
        </div>
        <div id="admin-message" class="error-message" style="display:none;"></div>
        <div class="stats-grid animate-slide-up" style="animation-delay:0.1s">
          ${statsCards.map(c => `
            <div class="stat-card card">
              <div class="stat-icon" style="background:${c.bg}">${svgIcon(c.icon)}</div>
              <div>
                <div class="stat-value">${stats[c.key] ?? '-'}</div>
                <div class="stat-label">${c.label}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="profile-tabs card animate-slide-up" style="animation-delay:0.2s; margin-bottom: 1rem;">
          <div class="profile-tabs">
            <button class="profile-tab ${activeTab === 'users' ? 'active' : ''}" data-action="setAdminTab" data-tab="users">用户管理</button>
            <button class="profile-tab ${activeTab === 'tasks' ? 'active' : ''}" data-action="setAdminTab" data-tab="tasks">任务管理</button>
          </div>
        </div>
        ${tabContent}
      </div>
    </div>
  `;
}

function renderAdminPagination(page, totalPages, stateKey, prevId, nextId) {
  if (totalPages <= 1) return '';
  return `
    <div class="admin-pagination">
      <button class="filter-btn" data-action="adminPage" data-page="${page - 1}" data-key="${stateKey}" id="${prevId}" ${page <= 0 ? 'disabled' : ''}>上一页</button>
      <span class="admin-pagination-info">第 ${page + 1} / ${totalPages} 页</span>
      <button class="filter-btn" data-action="adminPage" data-page="${page + 1}" data-key="${stateKey}" id="${nextId}" ${page >= totalPages - 1 ? 'disabled' : ''}>下一页</button>
    </div>`;
}

async function handleBanUser(userId) {
  try {
    await apiAdmin.banUser(userId);
    await loadAdminUsers();
    render();
    showError('用户已封禁', 'admin-message');
  } catch (e) { showError(e.message, 'admin-message'); }
}

async function handleUnbanUser(userId) {
  try {
    await apiAdmin.unbanUser(userId);
    await loadAdminUsers();
    render();
    showError('用户已解封', 'admin-message');
  } catch (e) { showError(e.message, 'admin-message'); }
}

async function handleDeleteTask(taskId) {
  try {
    await apiAdmin.deleteTask(taskId);
    state.adminStats = await apiAdmin.getStats();
    await loadAdminTasks();
    render();
    showError('任务已删除', 'admin-message');
  } catch (e) { showError(e.message, 'admin-message'); }
}

async function loadAdminUsers() {
  try {
    state.adminUsersData = await apiAdmin.getUsers(state.adminUserPage);
  } catch (e) {}
}

async function loadAdminTasks() {
  try {
    state.adminTasksData = await apiAdmin.getTasks(state.adminTaskPage, 10, state.adminTaskStatus);
  } catch (e) {}
}

async function render() {
  const app = document.getElementById('app');
  let html = '';
  switch (state.currentPage) {
    case 'login': html = renderLoginPage(); break;
    case 'register': html = renderRegisterPage(); break;
    case 'dashboard': html = await renderDashboardPage(); break;
    case 'taskDetail': html = await renderTaskDetailPage(); break;
    case 'publish': html = renderPublishPage(); break;
    case 'profile': html = await renderProfilePage(); break;
    case 'admin': html = await renderAdminPage(); break;
    default: html = renderLoginPage();
  }
  app.innerHTML = html;
  window.scrollTo(0, 0);
  bindEvents();
}

async function handleLogin(e) {
  if (e) {
    e.preventDefault();
  }
  const usernameEl = document.getElementById('login-username');
  const passwordEl = document.getElementById('login-password');
  const errorEl = document.getElementById('login-error');
  
  if (!usernameEl || !passwordEl) {
    return;
  }
  
  const username = usernameEl.value;
  const password = passwordEl.value;
  
  try {
    const response = await apiAuth.login(username, password);
    saveUser(response.user, response.token);
    navigate('dashboard');
    await loadTasks();
  } catch (err) {
    console.error('Login error:', err);
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
    setTimeout(function() { errorEl.style.display = 'none'; }, 3000);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const nickname = document.getElementById('reg-nickname').value;
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const errorEl = document.getElementById('register-error');
  if (password !== confirm) {
    errorEl.textContent = '两次输入的密码不一致';
    errorEl.style.display = 'block';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = '密码长度至少为6位';
    errorEl.style.display = 'block';
    return;
  }
  try {
    await apiAuth.register(username, password, nickname);
    navigate('login');
    showError('注册成功，请登录', 'login-error');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  }
}

async function handleAcceptTask(taskId) {
  try {
    await apiTasks.accept(taskId);
    state.currentTask = await apiTasks.getDetail(taskId);
    render();
    showError('接取成功！', 'detail-message');
  } catch (e) {
    render();
    showError(e.message || '接取失败', 'detail-message');
  }
}

async function handleCompleteTask(taskId) {
  try {
    await apiTasks.complete(taskId);
    state.currentTask = await apiTasks.getDetail(taskId);
    // 刷新用户信息（积分变动）
    const me = await api.get('/auth/me');
    saveUser(me, state.token);
    render();
    showError('任务已完成，积分已结算！', 'detail-message');
  } catch (e) {
    render();
    showError(e.message || '操作失败', 'detail-message');
  }
}

async function handleCancelTask(taskId) {
  try {
    await apiTasks.cancel(taskId);
    // 刷新用户信息（积分退还）
    const me = await api.get('/auth/me');
    saveUser(me, state.token);
    navigate('dashboard');
    await loadTasks();
  } catch (e) {
    render();
    showError(e.message || '取消失败', 'detail-message');
  }
}

function selectCategory(btn, value) {
  document.querySelectorAll('.publish-category-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.selectedCategory = value;
}

function setReward(amount) {
  document.getElementById('pub-reward').value = amount;
  document.querySelectorAll('.publish-reward-preset').forEach(b => {
    b.classList.toggle('active', b.textContent == amount);
  });
}

async function handlePublish(e) {
  e.preventDefault();
  const title = document.getElementById('pub-title').value;
  const description = document.getElementById('pub-desc').value;
  const reward = parseInt(document.getElementById('pub-reward').value);
  const category = state.selectedCategory || 'other';
  const errorEl = document.getElementById('publish-error');
  try {
    await apiTasks.publish(title, description, category, reward);
    navigate('dashboard');
    await loadTasks();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  }
}

function toggleUserMenu() {
  state.showUserMenu = !state.showUserMenu;
  render();
}

function openTaskDetail(id) {
  viewTaskDetail(id);
}

function doLogin() {
  handleLogin({preventDefault: function() {}}).catch(function(err) {
    console.error('Login error:', err);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  init();
});