/**
 * LegalMetriX - Core Application Layout & Global Interactions
 */

const App = (function() {
  // Current active page detection
  function getCurrentPageName() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    return page.split("?")[0];
  }

  // Initialize Global Layout & Event Listeners
  function init() {
    renderSidebar();
    renderTopbar();
    setupGlobalSearch();
    setupNotificationsDropdown();
    setupMobileMenu();
    updateUserSessionDisplay();
  }

  // Render Persistent Sidebar
  function renderSidebar() {
    const sidebarEl = document.getElementById("sidebar-container");
    if (!sidebarEl) return;

    const currentPage = getCurrentPageName();
    const currentUser = API.getCurrentUser();

    // Check Role restrictions
    const role = currentUser.role || 'inspector';

    sidebarEl.innerHTML = `
      <aside class="sidebar" id="app-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo-icon">
            <i class="fa-solid fa-scale-balanced"></i>
          </div>
          <div class="sidebar-brand">
            <h1>LegalMetriX</h1>
            <span>Compliance Intelligence</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a href="dashboard.html" class="nav-item ${currentPage === 'dashboard.html' ? 'active' : ''}">
            <i class="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </a>
          <a href="inspection.html" class="nav-item ${currentPage === 'inspection.html' ? 'active' : ''}">
            <i class="fa-solid fa-camera-viewfinder"></i>
            <span>New Inspection</span>
          </a>
          <a href="history.html" class="nav-item ${currentPage === 'history.html' || currentPage === 'results.html' ? 'active' : ''}">
            <i class="fa-solid fa-clock-rotate-left"></i>
            <span>Inspection History</span>
          </a>
          <a href="products.html" class="nav-item ${currentPage === 'products.html' ? 'active' : ''}">
            <i class="fa-solid fa-box-archive"></i>
            <span>Products</span>
          </a>
          <a href="reports.html" class="nav-item ${currentPage === 'reports.html' ? 'active' : ''}">
            <i class="fa-solid fa-file-shield"></i>
            <span>Reports</span>
          </a>
          <a href="analytics.html" class="nav-item ${currentPage === 'analytics.html' ? 'active' : ''}">
            <i class="fa-solid fa-chart-line"></i>
            <span>Analytics</span>
          </a>

          <div class="nav-section-title">System & Governance</div>
          <a href="settings.html" class="nav-item ${currentPage === 'settings.html' ? 'active' : ''}">
            <i class="fa-solid fa-sliders"></i>
            <span>Settings &amp; Rules</span>
          </a>
          <a href="javascript:void(0)" onclick="App.showHelpModal()" class="nav-item">
            <i class="fa-solid fa-circle-question"></i>
            <span>Rules Reference</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile-box">
            <div class="user-avatar" id="sidebar-avatar">
              ${currentUser.fullName ? currentUser.fullName.charAt(0) : 'I'}
            </div>
            <div class="user-info">
              <div class="user-name" id="sidebar-user-name">${currentUser.fullName || 'Officer'}</div>
              <div class="user-role" id="sidebar-user-role">${currentUser.roleLabel || 'Inspector'}</div>
            </div>
          </div>
          <button class="logout-btn" onclick="App.logout()">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>
      <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="App.toggleMobileMenu(false)"></div>
    `;
  }

  // Render Topbar
  function renderTopbar() {
    const topbarEl = document.getElementById("topbar-container");
    if (!topbarEl) return;

    const pageTitle = topbarEl.getAttribute("data-title") || "LegalMetriX";
    const breadcrumbs = topbarEl.getAttribute("data-breadcrumb") || "Enforcement Portal";
    const currentUser = API.getCurrentUser();
    const notifications = API.getNotifications();
    const unreadCount = notifications.filter(n => n.unread).length;

    topbarEl.innerHTML = `
      <header class="topbar">
        <div class="topbar-left">
          <button class="mobile-menu-btn" onclick="App.toggleMobileMenu(true)" title="Toggle Menu">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div class="page-title-group">
            <h2>${pageTitle}</h2>
            <div class="breadcrumbs">
              <a href="dashboard.html"><i class="fa-solid fa-house"></i> Home</a>
              <i class="fa-solid fa-chevron-right" style="font-size: 9px;"></i>
              <span class="current">${breadcrumbs}</span>
            </div>
          </div>
        </div>

        <div class="topbar-right">
          <!-- Global Search -->
          <div class="search-container">
            <div class="search-input-wrapper">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="global-search-input" class="search-input" placeholder="Search ID, product, brand..." autocomplete="off">
            </div>
            <div id="global-search-results" class="search-results-dropdown"></div>
          </div>

          <!-- Notification Dropdown -->
          <div style="position: relative;">
            <button class="topbar-action-btn" id="notif-btn" title="Notifications" onclick="App.toggleNotifications()">
              <i class="fa-solid fa-bell"></i>
              ${unreadCount > 0 ? '<span class="unread-badge"></span>' : ''}
            </button>
            <div class="notifications-dropdown" id="notif-dropdown">
              <div class="notif-header">
                <h4>Notifications (${unreadCount})</h4>
                <span class="notif-mark-read" onclick="App.markAllNotificationsRead()">Mark all as read</span>
              </div>
              <div class="notif-list" id="notif-list-container">
                ${renderNotificationsList(notifications)}
              </div>
            </div>
          </div>

          <!-- User Role Indicator Pill -->
          <div class="user-role-pill" title="Active Role">
            <span class="user-role-dot"></span>
            <span>${currentUser.roleLabel || 'Inspector'}</span>
          </div>
        </div>
      </header>
    `;
  }

  function renderNotificationsList(notifications) {
    if (!notifications || notifications.length === 0) {
      return `<div style="padding: 20px; text-align: center; color: var(--slate-500); font-size: 12px;">No notifications.</div>`;
    }

    return notifications.map(n => `
      <a href="${n.link}" class="notif-item ${n.unread ? 'unread' : ''}" style="text-decoration: none;">
        <div class="notif-icon ${n.type}">
          <i class="fa-solid ${n.type === 'warning' ? 'fa-triangle-exclamation' : (n.type === 'danger' ? 'fa-circle-xmark' : 'fa-circle-info')}"></i>
        </div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-text">${n.message}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </a>
    `).join('');
  }

  // Setup Global Search Live Input
  function setupGlobalSearch() {
    const input = document.getElementById("global-search-input");
    const resultsContainer = document.getElementById("global-search-results");
    if (!input || !resultsContainer) return;

    input.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      if (query.length < 2) {
        resultsContainer.classList.remove("active");
        resultsContainer.innerHTML = "";
        return;
      }

      const matches = API.globalSearch(query);
      if (matches.length === 0) {
        resultsContainer.innerHTML = `<div style="padding: 12px 16px; font-size: 12px; color: var(--slate-500);">No matching records found for "${query}".</div>`;
      } else {
        resultsContainer.innerHTML = matches.map(item => `
          <div class="search-result-item" onclick="window.location.href='${item.url}'">
            <div class="search-result-title">
              <i class="fa-solid ${item.type === 'inspection' ? 'fa-clipboard-check' : (item.type === 'product' ? 'fa-box' : 'fa-file-lines')}" style="color: var(--primary-navy-700); margin-right: 6px;"></i>
              ${item.title}
            </div>
            <div class="search-result-subtitle">${item.subtitle}</div>
          </div>
        `).join('');
      }
      resultsContainer.classList.add("active");
    });

    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.classList.remove("active");
      }
    });
  }

  // Setup Notifications Toggle
  function setupNotificationsDropdown() {
    document.addEventListener("click", (e) => {
      const notifBtn = document.getElementById("notif-btn");
      const dropdown = document.getElementById("notif-dropdown");
      if (notifBtn && dropdown) {
        if (!notifBtn.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove("active");
        }
      }
    });
  }

  function toggleNotifications() {
    const dropdown = document.getElementById("notif-dropdown");
    if (dropdown) {
      dropdown.classList.toggle("active");
    }
  }

  function markAllNotificationsRead() {
    API.markNotificationsAsRead();
    renderTopbar();
    App.toast("All notifications marked as read", "info");
  }

  // Mobile Menu
  function setupMobileMenu() {
    // Backdrop logic
  }

  function toggleMobileMenu(show) {
    const sidebar = document.getElementById("app-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) {
      if (show) sidebar.classList.add("mobile-open");
      else sidebar.classList.remove("mobile-open");
    }
    if (backdrop) {
      if (show) backdrop.style.display = "block";
      else backdrop.style.display = "none";
    }
  }

  function updateUserSessionDisplay() {
    const user = API.getCurrentUser();
    const avatarEl = document.getElementById("sidebar-avatar");
    const nameEl = document.getElementById("sidebar-user-name");
    const roleEl = document.getElementById("sidebar-user-role");

    if (avatarEl && user.fullName) avatarEl.textContent = user.fullName.charAt(0);
    if (nameEl) nameEl.textContent = user.fullName;
    if (roleEl) roleEl.textContent = user.roleLabel;
  }

  function logout() {
    App.toast("Logging out...", "info");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 600);
  }

  // Global Toast Notifications
  function toast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toastEl = document.createElement("div");
    toastEl.className = `toast ${type}`;
    
    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-circle-check";
    else if (type === "warning") icon = "fa-triangle-exclamation";
    else if (type === "danger") icon = "fa-circle-xmark";

    toastEl.innerHTML = `
      <i class="fa-solid ${icon}" style="font-size: 16px;"></i>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.style.opacity = "0";
      toastEl.style.transition = "opacity 0.3s ease";
      setTimeout(() => toastEl.remove(), 300);
    }, 3500);
  }

  // Legal Metrology Rules Reference Modal
  function showHelpModal() {
    const html = `
      <div class="modal-overlay active" id="help-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fa-solid fa-book-bookmark" style="color: #2563eb; margin-right: 8px;"></i> Legal Metrology Rulebook Reference</h3>
            <button class="modal-close" onclick="document.getElementById('help-modal').remove()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="modal-body" style="font-size: 13px; line-height: 1.6; color: var(--slate-700);">
            <p><strong>The Legal Metrology (Packaged Commodities) Rules, 2011</strong> mandate 6 core declarations on every packaged pre-packed good:</p>
            <ul style="margin: 12px 0 16px 20px;">
              <li><strong>Rule 6(1)(a):</strong> Name and complete address of the manufacturer / packer / importer.</li>
              <li><strong>Rule 6(1)(b):</strong> Country of origin for imported or domestic packaged commodities.</li>
              <li><strong>Rule 6(1)(c):</strong> Common or generic names of the commodity contained in the package.</li>
              <li><strong>Rule 6(1)(d):</strong> Net quantity in terms of standard unit of weight or measure.</li>
              <li><strong>Rule 6(1)(e):</strong> Month and year in which the commodity is manufactured, packed or imported.</li>
              <li><strong>Rule 6(1)(f):</strong> Maximum Retail Price (MRP) inclusive of all taxes, with unit sale price where required.</li>
              <li><strong>Rule 6(1)(g):</strong> Name, address, telephone number, email of the consumer grievance redressal cell.</li>
            </ul>
            <div class="legal-notice">
              <strong>Notice:</strong> This application serves as an automated preliminary compliance screening tool. Final statutory determination remains with the authorized Legal Metrology Enforcement Officer.
            </div>
          </div>
        </div>
      </div>
    `;
    const div = document.createElement("div");
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
  }

  return {
    init: init,
    toggleMobileMenu: toggleMobileMenu,
    toggleNotifications: toggleNotifications,
    markAllNotificationsRead: markAllNotificationsRead,
    toast: toast,
    logout: logout,
    showHelpModal: showHelpModal
  };
})();

// Auto initialize App on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
