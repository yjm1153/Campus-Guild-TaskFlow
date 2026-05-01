const API_BASE = 'http://localhost:8080/api';

const state = {
  currentPage: 'login',
  user: null,
  tasks: [],
  filterStatus: 'all',
  searchQuery: '',
  showUserMenu: false,
  profileTab: 'published',
};

const mockTasks = [
  { id: 1, title: '帮忙代取快递到宿舍', description: '从南门菜鸟驿站取一个中等大小的包裹送到8号楼302', publisher: '张三', reward: 15, status: 'PENDING', timeAgo: '10分钟前', views: 24 },
  { id: 2, title: '帮忙打印复习资料', description: '图书馆二楼打印店，打印约30页的复习资料，双面', publisher: '李四', reward: 10, status: 'PENDING', timeAgo: '25分钟前', views: 42 },
  { id: 3, title: 'Python代码调试求助', description: '爬虫项目遇到问题，requests库返回状态码403，需要帮忙解决', publisher: '王五', reward: 25, status: 'IN_PROGRESS', timeAgo: '1小时前', views: 89 },
  { id: 4, title: '二手自行车出售', description: '九成新山地车，骑行半年，因毕业出售，价格可议', publisher: '赵六', reward: 200, status: 'PENDING', timeAgo: '2小时前', views: 156 },
  { id: 5, title: '帮忙占自习室座位', description: '明天早上7点需要去图书馆3楼占一个靠窗的位置', publisher: '小明', reward: 8, status: 'PENDING', timeAgo: '3小时前', views: 67 },
  { id: 6, title: '高数作业辅导', description: '微积分下册第5章习题，需要详细解答过程', publisher: '小红', reward: 30, status: 'COMPLETED', timeAgo: '5小时前', views: 203 },
];

const levelNames = ['新手', '见习', '冒险者', '精英', '勇士', '骑士', '领主', '传奇'];
const statusConfig = {
  PENDING: { label: '待接取', className: 'badge-pending' },
  IN_PROGRESS: { label: '进行中', className: 'badge-progress' },
  COMPLETED: { label: '已完成', className: 'badge-completed' },
};

function init() {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    state.user = JSON.parse(savedUser);
    state.currentPage = 'dashboard';
  }
  state.tasks = [...mockTasks];
  render();
}

function navigate(page, params = {}) {
  state.currentPage = page;
  state.showUserMenu = false;
  state.pageParams = params;
  render();
}

function saveUser(user) {
  state.user = user;
  localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
  state.user = null;
  localStorage.removeItem('user');
  navigate('login');
}

function login(username, password) {
  const user = { username, points: 100, level: 1 };
  saveUser(user);
  navigate('dashboard');
}

function register(username, password) {
  const user = { username, points: 100, level: 1 };
  saveUser(user);
  navigate('dashboard');
}

function svgIcon(path, className = 'w-5 h-5') {
  return `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="${path}"/></svg>`;
}

function renderNavbar() {
  if (!state.user) return '';
  const navItems = [
    { page: 'dashboard', label: '任务大厅', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { page: 'publish', label: '发布悬赏', icon: 'M12 4v16m8-8H4' },
    { page: 'profile', label: '个人中心', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];
  const initial = state.user.username?.charAt(0).toUpperCase() || 'U';
  return `
    <nav class="navbar">
      <div class="container">
        <div class="navbar-inner">
          <a href="#" class="navbar-logo" onclick="navigate('dashboard');return false;">
            <div class="navbar-logo-icon gradient-campus">${svgIcon('M13 10V3L4 14h7v7l9-11h-7z', 'w-5 h-5 text-white')}</div>
            <span class="navbar-logo-text">TaskFlow</span>
          </a>
          <div class="navbar-nav">
            ${navItems.map(item => `
              <a href="#" class="navbar-nav-item ${state.currentPage === item.page ? 'active' : ''}" onclick="navigate('${item.page}');return false;">
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
              <button class="navbar-user-btn" onclick="state.showUserMenu=!state.showUserMenu;render();">
                <div class="navbar-user-avatar gradient-campus">${initial}</div>
                <span class="navbar-user-name">${state.user.username}</span>
              </button>
              ${state.showUserMenu ? `
                <div class="navbar-user-menu">
                  <div class="navbar-user-menu-header">
                    <div class="navbar-user-menu-name">${state.user.username}</div>
                    <div class="navbar-user-menu-level">Lv.${state.user.level || 1} · ${state.user.points || 0} 积分</div>
                  </div>
                  <button class="navbar-user-menu-item" onclick="navigate('profile')">个人中心</button>
                  <button class="navbar-user-menu-item logout" onclick="logout()">退出登录</button>
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
              <a href="#" class="navbar-mobile-item ${state.currentPage === item.page ? 'active' : ''}" onclick="navigate('${item.page}');return false;">
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
  const status = statusConfig[task.status] || statusConfig.PENDING;
  const initial = task.publisher?.charAt(0).toUpperCase() || 'U';
  return `
    <div class="task-card card animate-slide-up" onclick="navigate('taskDetail',{id:${task.id}})">
      <div class="task-card-header">
        <h3 class="task-card-title">${task.title}</h3>
        <span class="badge ${status.className}">${status.label}</span>
      </div>
      <p class="task-card-desc">${task.description}</p>
      <div class="task-card-footer">
        <div class="task-card-publisher">
          <div class="task-card-avatar gradient-campus">${initial}</div>
          <span class="task-card-publisher-name">${task.publisher}</span>
        </div>
        <div class="task-card-reward">
          ${svgIcon('M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z', 'w-4 h-4')}
          <span class="task-card-reward-value">${task.reward} 积分</span>
        </div>
      </div>
      <div class="task-card-meta">
        <span class="task-card-meta-item">${svgIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 'w-3.5 h-3.5')} ${task.timeAgo}</span>
        <span class="task-card-meta-item">${svgIcon('M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', 'w-3.5 h-3.5')} ${task.views}</span>
      </div>
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
          <form class="login-form" onsubmit="handleLogin(event)">
            <div>
              <label class="login-form-label">用户名</label>
              <input type="text" id="login-username" class="input-field" placeholder="请输入用户名" required>
            </div>
            <div>
              <label class="login-form-label">密码</label>
              <input type="password" id="login-password" class="input-field" placeholder="请输入密码" required>
            </div>
            <button type="submit" class="btn-primary">登录</button>
          </form>
          <div class="login-footer">
            <p class="login-footer-text">还没有账号？ <a href="#" class="login-footer-link" onclick="navigate('register');return false;">立即注册</a></p>
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
          <form class="login-form" onsubmit="handleRegister(event)">
            <div>
              <label class="login-form-label">用户名</label>
              <input type="text" id="reg-username" class="input-field" placeholder="请输入用户名" required>
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
            <p class="login-footer-text">已有账号？ <a href="#" class="login-footer-link" onclick="navigate('login');return false;">立即登录</a></p>
          </div>
        </div>
        <div class="login-copyright">Campus Guild TaskFlow © 2026</div>
      </div>
    </div>
  `;
}

function renderDashboardPage() {
  const filtered = state.tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || task.description.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchFilter = state.filterStatus === 'all' || task.status === state.filterStatus;
    return matchSearch && matchFilter;
  });
  const stats = [
    { label: '进行中任务', value: '12', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-[var(--campus-400)] to-[var(--campus-600)]' },
    { label: '已完成', value: '47', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-[var(--leaf-400)] to-[var(--leaf-600)]' },
    { label: '获得积分', value: '320', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', gradient: 'from-[var(--amber-400)] to-[var(--amber-600)]' },
  ];
  const filterBtns = [
    { key: 'all', label: '全部' },
    { key: 'PENDING', label: '待接取' },
    { key: 'IN_PROGRESS', label: '进行中' },
    { key: 'COMPLETED', label: '已完成' },
  ];
  return `
    <div class="page">
      ${renderNavbar()}
      <div class="container page-content">
        <div class="dashboard-header animate-fade-in">
          <h1>任务大厅</h1>
          <p>浏览并接取感兴趣的校园任务</p>
        </div>
        <div class="stats-grid">
          ${stats.map((s, i) => `
            <div class="stat-card card animate-slide-up" style="animation-delay:${i * 0.1}s">
              <div class="stat-icon gradient-campus">${svgIcon(s.icon, 'w-6 h-6')}</div>
              <div>
                <div class="stat-value">${s.value}</div>
                <div class="stat-label">${s.label}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="filter-bar card animate-slide-up" style="animation-delay:0.2s">
          <div class="filter-bar-inner">
            <div class="search-wrapper">
              ${svgIcon('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', 'w-5 h-5')}
              <input type="text" class="input-field search-input" placeholder="搜索任务..." value="${state.searchQuery}" oninput="state.searchQuery=this.value;render();">
            </div>
            <div class="filter-buttons">
              ${filterBtns.map(btn => `
                <button class="filter-btn ${state.filterStatus === btn.key ? 'active' : ''}" onclick="state.filterStatus='${btn.key}';render();">${btn.label}</button>
              `).join('')}
            </div>
          </div>
        </div>
        ${filtered.length > 0 ? `
          <div class="tasks-grid">
            ${filtered.map((task, i) => renderTaskCard(task)).join('')}
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

function renderTaskDetailPage() {
  const task = state.tasks.find(t => t.id === state.pageParams?.id) || state.tasks[0];
  const status = statusConfig[task.status];
  const initial = task.publisher?.charAt(0).toUpperCase() || 'U';
  let actionHtml = '';
  if (task.status === 'PENDING') {
    actionHtml = `<button class="btn-success" onclick="handleAcceptTask(${task.id})">接取任务</button>`;
  } else if (task.status === 'IN_PROGRESS') {
    actionHtml = `<button class="btn-primary" onclick="handleCompleteTask(${task.id})">确认完成</button>`;
  } else {
    actionHtml = `<div class="detail-completed">任务已完成</div>`;
  }
  return `
    <div class="page">
      ${renderNavbar()}
      <div class="container page-content">
        <button class="back-btn" onclick="navigate('dashboard')">${svgIcon('M15 19l-7-7 7-7')} 返回</button>
        <div class="detail-card card animate-scale-in">
          <div class="detail-header">
            <div>
              <h1 class="detail-title">${task.title}</h1>
              <div class="detail-badges">
                <span class="badge ${status.className}">${status.label}</span>
                <span class="task-card-meta-item">${svgIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 'w-4 h-4')} ${task.timeAgo}</span>
                <span class="task-card-meta-item">${svgIcon('M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', 'w-4 h-4')} ${task.views} 次浏览</span>
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
            <p class="detail-desc">${task.description}</p>
          </div>
          <div class="detail-section">
            <h2 class="detail-section-title">发布者信息</h2>
            <div class="detail-publisher">
              <div class="detail-publisher-avatar gradient-campus">${initial}</div>
              <div>
                <div class="detail-publisher-name">${task.publisher}</div>
                <div class="detail-publisher-level">Lv.5 · 公会成员</div>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-actions">
              ${actionHtml}
              <button class="btn-secondary">${svgIcon('M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 103 3m0 0a3 3 0 00-3-3m0 3h2.5M12 18v-6m0 0V6m0 6H9.5m2.5 0H15')}</button>
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
          <form class="publish-form" onsubmit="handlePublish(event)">
            <div>
              <label class="publish-label">任务标题</label>
              <input type="text" id="pub-title" class="input-field" placeholder="简要描述你的任务" required>
            </div>
            <div>
              <label class="publish-label">任务分类</label>
              <div class="publish-categories">
                ${categories.map(cat => `
                  <button type="button" class="publish-category-btn" onclick="selectCategory(this,'${cat.value}')">
                    ${svgIcon(cat.icon)} <span>${cat.label}</span>
                  </button>
                `).join('')}
              </div>
            </div>
            <div>
              <label class="publish-label">详细描述</label>
              <textarea id="pub-desc" class="input-field publish-textarea" placeholder="详细描述任务内容、要求、时间地点等信息" required></textarea>
            </div>
            <div>
              <label class="publish-label">悬赏积分</label>
              <div class="publish-reward-row">
                <input type="number" id="pub-reward" class="input-field publish-reward-input" placeholder="10" min="1" required>
                <span class="publish-reward-label">积分</span>
                <div class="publish-reward-presets">
                  <button type="button" class="publish-reward-preset" onclick="setReward(10)">10</button>
                  <button type="button" class="publish-reward-preset" onclick="setReward(20)">20</button>
                  <button type="button" class="publish-reward-preset" onclick="setReward(50)">50</button>
                </div>
              </div>
            </div>
            <div class="publish-actions">
              <button type="button" class="btn-secondary" onclick="navigate('dashboard')">取消</button>
              <button type="submit" class="btn-primary">发布任务</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function renderProfilePage() {
  const user = state.user;
  const level = user?.level || 1;
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];
  const initial = user?.username?.charAt(0).toUpperCase() || 'U';
  const activeTab = state.profileTab || 'published';
  const stats = [
    { label: '发布任务', value: '12', color: 'var(--campus-600)' },
    { label: '完成任务', value: '47', color: 'var(--leaf-600)' },
    { label: '获得积分', value: '320', color: 'var(--amber-600)' },
    { label: '信誉评分', value: '4.8', color: 'var(--purple-600)' },
  ];
  const publishedTasks = state.tasks.slice(0, 3);
  const acceptedTasks = state.tasks.filter(t => t.status === 'IN_PROGRESS').slice(0, 3);
  const currentTasks = activeTab === 'published' ? publishedTasks : acceptedTasks;
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
                  <h1 class="profile-name">${user?.username || '用户'}</h1>
                  <span class="profile-level-badge">Lv.${level} · ${levelName}</span>
                </div>
                <p class="profile-joined">注册时间：2026年4月</p>
              </div>
              <button class="btn-secondary profile-logout" onclick="logout()">退出登录</button>
            </div>
            <div class="profile-exp">
              <div class="profile-exp-header">
                <span class="profile-exp-label">经验值</span>
                <span class="profile-exp-value">${(level-1)*100+50} / ${level*100}</span>
              </div>
              <div class="profile-exp-bar">
                <div class="profile-exp-fill gradient-campus" style="width:50%"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="profile-stats-grid">
          ${stats.map((s, i) => `
            <div class="profile-stat-card card animate-slide-up" style="animation-delay:${i*0.1}s">
              <div class="profile-stat-value" style="color:${s.color}">${s.value}</div>
              <div class="profile-stat-label">${s.label}</div>
            </div>
          `).join('')}
        </div>
        <div class="profile-tabs-card card animate-slide-up" style="animation-delay:0.4s">
          <div class="profile-tabs">
            <button class="profile-tab ${activeTab === 'published' ? 'active' : ''}" onclick="state.profileTab='published';render();">我发布的</button>
            <button class="profile-tab ${activeTab === 'accepted' ? 'active' : ''}" onclick="state.profileTab='accepted';render();">我接取的</button>
          </div>
          <div class="profile-tab-content">
            ${currentTasks.length > 0 ? `
              <div class="tasks-grid">
                ${currentTasks.map(task => renderTaskCard(task)).join('')}
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

function render() {
  const app = document.getElementById('app');
  let html = '';
  switch (state.currentPage) {
    case 'login': html = renderLoginPage(); break;
    case 'register': html = renderRegisterPage(); break;
    case 'dashboard': html = renderDashboardPage(); break;
    case 'taskDetail': html = renderTaskDetailPage(); break;
    case 'publish': html = renderPublishPage(); break;
    case 'profile': html = renderProfilePage(); break;
    default: html = renderLoginPage();
  }
  app.innerHTML = html;
  window.scrollTo(0, 0);
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  login(username, '');
}

function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
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
  register(username, password);
}

function handleAcceptTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.status = 'IN_PROGRESS';
    render();
  }
}

function handleCompleteTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.status = 'COMPLETED';
    if (state.user) {
      state.user.points = (state.user.points || 0) + task.reward;
      localStorage.setItem('user', JSON.stringify(state.user));
    }
    render();
  }
}

function selectCategory(btn, value) {
  document.querySelectorAll('.publish-category-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function setReward(amount) {
  document.getElementById('pub-reward').value = amount;
  document.querySelectorAll('.publish-reward-preset').forEach(b => {
    b.classList.toggle('active', b.textContent == amount);
  });
}

function handlePublish(e) {
  e.preventDefault();
  const title = document.getElementById('pub-title').value;
  const desc = document.getElementById('pub-desc').value;
  const reward = parseInt(document.getElementById('pub-reward').value);
  const newTask = {
    id: state.tasks.length + 1,
    title,
    description: desc,
    publisher: state.user.username,
    reward,
    status: 'PENDING',
    timeAgo: '刚刚',
    views: 0,
  };
  state.tasks.unshift(newTask);
  navigate('dashboard');
}

init();
