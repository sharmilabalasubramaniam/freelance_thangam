/**
 * Admin Dashboard Controller for Thangam Farms (STP Chickens)
 * Connects AdminDashboard.html to real backend APIs with authentication,
 * live metrics calculation, search, filters, pagination, and status updates.
 */

(function () {
  'use strict';

  // State Management
  let currentUser = null;
  let currentEnquiries = [];
  let selectedEnquiryId = null;
  let currentPage = 1;
  const pageLimit = 10;
  let totalPages = 1;

  // DOM Elements
  const dashboardWrapper = document.getElementById('dashboardWrapper');
  const loginModal = document.getElementById('loginModal');
  const loginForm = document.getElementById('adminLoginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnText = document.getElementById('loginBtnText');

  const staffNameEl = document.getElementById('staffName');
  const staffRoleEl = document.getElementById('staffRole');
  const staffAvatarEl = document.getElementById('staffAvatar');
  const logoutBtn = document.getElementById('logoutBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  // Overview metric counters
  const metricTotal = document.getElementById('metricTotal');
  const metricNew = document.getElementById('metricNew');
  const metricPending = document.getElementById('metricPending');
  const metricCompleted = document.getElementById('metricCompleted');

  // Table controls
  const searchInput = document.getElementById('tableSearchInput');
  const statusFilter = document.getElementById('tableStatusFilter');
  const dateFilter = document.getElementById('tableDateFilter');
  const enquiriesTableBody = document.getElementById('enquiriesTableBody');
  const paginationInfo = document.getElementById('paginationInfo');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');

  // Detail panel elements
  const detailPanelRef = document.getElementById('detailPanelRef');
  const detailPanelStatusBadge = document.getElementById('detailPanelStatusBadge');
  const detailCustomerEntity = document.getElementById('detailCustomerEntity');
  const detailCustomerType = document.getElementById('detailCustomerType');
  const detailContactPerson = document.getElementById('detailContactPerson');
  const detailDesignation = document.getElementById('detailDesignation');
  const detailPhone = document.getElementById('detailPhone');
  const detailEmail = document.getElementById('detailEmail');
  const detailAddress = document.getElementById('detailAddress');
  const detailProduct = document.getElementById('detailProduct');
  const detailQuantity = document.getElementById('detailQuantity');
  const detailNotes = document.getElementById('detailNotes');
  const detailCreatedAt = document.getElementById('detailCreatedAt');
  const detailStatusSelect = document.getElementById('detailStatusSelect');
  const detailUpdateStatusBtn = document.getElementById('detailUpdateStatusBtn');
  const detailDeleteBtn = document.getElementById('detailDeleteBtn');
  const detailFeedbackBanner = document.getElementById('detailFeedbackBanner');

  // Initialize
  document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await checkAuth();
  });

  function setupEventListeners() {
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    if (searchInput) {
      let debounceTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          currentPage = 1;
          loadEnquiries();
        }, 300);
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        currentPage = 1;
        loadEnquiries();
      });
    }

    if (dateFilter) {
      dateFilter.addEventListener('change', () => {
        currentPage = 1;
        loadEnquiries();
      });
    }

    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          loadEnquiries();
        }
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          loadEnquiries();
        }
      });
    }

    if (detailUpdateStatusBtn) {
      detailUpdateStatusBtn.addEventListener('click', handleStatusUpdate);
    }

    if (detailDeleteBtn) {
      detailDeleteBtn.addEventListener('click', handleDeleteEnquiry);
    }

    if (exportCsvBtn) {
      const apiBase = (window.ThangamAPI && window.ThangamAPI.baseUrl) || 'http://localhost:5000/api';
      exportCsvBtn.href = `${apiBase}/admin/export-csv`;
    }
  }

  /**
   * Check active admin authentication on load
   */
  async function checkAuth() {
    try {
      const response = await window.ThangamAPI.getAdminMe();
      if (response && response.success && response.data && response.data.user) {
        currentUser = response.data.user;
        showDashboard();
        await Promise.all([loadOverview(), loadEnquiries()]);
      } else {
        showLogin();
      }
    } catch (err) {
      showLogin();
    }
  }

  function showLogin() {
    if (dashboardWrapper) dashboardWrapper.classList.add('hidden');
    if (loginModal) loginModal.classList.remove('hidden');
    currentUser = null;
  }

  function showDashboard() {
    if (loginModal) loginModal.classList.add('hidden');
    if (dashboardWrapper) dashboardWrapper.classList.remove('hidden');

    if (currentUser) {
      if (staffNameEl) staffNameEl.textContent = currentUser.name || 'Operations Manager';
      if (staffRoleEl) staffRoleEl.textContent = currentUser.email || 'Kannampalayam Staff';
      if (staffAvatarEl) {
        staffAvatarEl.textContent = (currentUser.name || 'TF').slice(0, 2).toUpperCase();
      }
    }
  }

  /**
   * Handle admin login form submission
   */
  async function handleLogin(e) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
      showLoginError('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);
    hideLoginError();

    try {
      const res = await window.ThangamAPI.adminLogin(email, password);
      if (res && res.success && res.data && res.data.user) {
        currentUser = res.data.user;
        showDashboard();
        await Promise.all([loadOverview(), loadEnquiries()]);
      } else {
        throw new Error((res && res.message) || 'Login failed');
      }
    } catch (err) {
      showLoginError(err.message || 'Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  }

  /**
   * Handle logout
   */
  async function handleLogout() {
    try {
      await window.ThangamAPI.adminLogout();
    } catch (err) {
      // ignore network errors on logout
    }
    showLogin();
  }

  function setLoginLoading(isLoading) {
    if (!loginBtn) return;
    loginBtn.disabled = isLoading;
    if (loginBtnText) {
      loginBtnText.textContent = isLoading ? 'Authenticating...' : 'Authenticate & Access Operations';
    }
  }

  function showLoginError(msg) {
    if (!loginErrorMsg) return;
    loginErrorMsg.textContent = msg;
    loginErrorMsg.classList.remove('hidden');
  }

  function hideLoginError() {
    if (!loginErrorMsg) return;
    loginErrorMsg.classList.add('hidden');
  }

  /**
   * Load real computed overview metrics
   */
  async function loadOverview() {
    try {
      const res = await window.ThangamAPI.getOverviewMetrics();
      if (res && res.success && res.data) {
        const m = res.data;
        if (metricTotal) metricTotal.textContent = m.total;
        if (metricNew) metricNew.textContent = m.new;
        if (metricPending) metricPending.textContent = m.contacted + m.inProgress;
        if (metricCompleted) metricCompleted.textContent = m.completed;
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  }

  /**
   * Load enquiry list with filters
   */
  async function loadEnquiries() {
    renderTableLoading();

    try {
      const params = {
        search: searchInput ? searchInput.value.trim() : '',
        status: statusFilter ? statusFilter.value : 'all',
        page: currentPage,
        limit: pageLimit
      };

      if (dateFilter && dateFilter.value) {
        params.startDate = dateFilter.value;
      }

      const res = await window.ThangamAPI.getEnquiries(params);

      if (res && res.success && res.data) {
        currentEnquiries = res.data.enquiries || [];
        const p = res.data.pagination;
        totalPages = p.totalPages || 1;
        currentPage = p.currentPage || 1;

        renderTable(currentEnquiries);
        renderPagination(p);

        // Auto-select first enquiry or preserve selected
        if (currentEnquiries.length > 0) {
          const target = currentEnquiries.find(e => e.id === selectedEnquiryId) || currentEnquiries[0];
          selectEnquiry(target.id);
        } else {
          renderEmptyDetail();
        }
      }
    } catch (err) {
      renderTableError(err.message);
    }
  }

  function renderTable(enquiries) {
    if (!enquiriesTableBody) return;

    if (enquiries.length === 0) {
      enquiriesTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="py-12 text-center text-light-outline">
            <span class="material-symbols-outlined text-4xl mb-2 text-forest-green/40">inbox</span>
            <p class="font-medium">No commercial enquiries found matching the criteria</p>
            <p class="text-[11px] mt-1 text-light-outline/70">Incoming wholesale requests will appear here in real-time.</p>
          </td>
        </tr>`;
      return;
    }

    enquiriesTableBody.innerHTML = enquiries.map(item => {
      const isSelected = item.id === selectedEnquiryId;
      const statusBadge = getStatusBadge(item.status);
      const rowBg = isSelected ? 'bg-forest-green/10' : 'hover:bg-light-background';

      return `
        <tr class="${rowBg} transition-colors cursor-pointer" onclick="window.AdminDashboard.selectRow('${item.id}')">
          <td class="py-3.5 px-4 font-mono font-bold text-forest-green">${item.id}</td>
          <td class="py-3.5 px-4">
            <div class="font-bold text-charcoal">${escapeHtml(item.businessName)}</div>
            <div class="text-[11px] text-light-outline">${escapeHtml(item.fullName)} • +91 ${escapeHtml(item.phone)}</div>
          </td>
          <td class="py-3.5 px-4">
            <div class="font-medium text-charcoal">${escapeHtml(item.productInterest)}</div>
            <div class="text-[11px] text-forest-green font-semibold">${escapeHtml(item.quantity)}</div>
          </td>
          <td class="py-3.5 px-4">
            ${statusBadge}
          </td>
          <td class="py-3.5 px-4 text-right">
            <button class="px-2.5 py-1 text-xs font-semibold text-forest-green hover:underline">Inspect</button>
          </td>
        </tr>`;
    }).join('');
  }

  function renderTableLoading() {
    if (!enquiriesTableBody) return;
    enquiriesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="py-12 text-center text-light-outline">
          <span class="material-symbols-outlined text-2xl animate-spin text-forest-green">progress_activity</span>
          <p class="text-xs mt-2">Loading commercial registry...</p>
        </td>
      </tr>`;
  }

  function renderTableError(msg) {
    if (!enquiriesTableBody) return;
    enquiriesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="py-8 text-center text-red-600">
          <span class="material-symbols-outlined text-2xl">error</span>
          <p class="text-xs mt-1 font-semibold">Failed to load enquiries: ${escapeHtml(msg)}</p>
        </td>
      </tr>`;
  }

  function renderPagination(p) {
    if (paginationInfo) {
      const from = p.totalRecords > 0 ? (p.currentPage - 1) * p.limit + 1 : 0;
      const to = Math.min(p.currentPage * p.limit, p.totalRecords);
      paginationInfo.textContent = `Showing ${from} to ${to} of ${p.totalRecords} commercial records`;
    }

    if (prevPageBtn) {
      prevPageBtn.disabled = !p.hasPrevPage;
    }
    if (nextPageBtn) {
      nextPageBtn.disabled = !p.hasNextPage;
    }
  }

  /**
   * Select and populate enquiry in detail inspection panel
   */
  function selectEnquiry(id) {
    selectedEnquiryId = id;
    const item = currentEnquiries.find(e => e.id === id);
    if (!item) return;

    // Highlight row
    const rows = enquiriesTableBody.querySelectorAll('tr');
    rows.forEach(row => {
      if (row.innerHTML.includes(id)) {
        row.classList.add('bg-forest-green/10');
      } else {
        row.classList.remove('bg-forest-green/10');
      }
    });

    // Populate panel
    if (detailPanelRef) detailPanelRef.textContent = `Enquiry #${item.id}`;
    if (detailPanelStatusBadge) detailPanelStatusBadge.innerHTML = getStatusBadge(item.status);
    if (detailCustomerEntity) detailCustomerEntity.textContent = item.businessName;
    if (detailCustomerType) detailCustomerType.textContent = 'Wholesale Commercial Client';
    if (detailContactPerson) detailContactPerson.textContent = item.fullName;
    if (detailDesignation) detailDesignation.textContent = 'Procurement Contact';
    if (detailPhone) detailPhone.textContent = `+91 ${item.phone}`;

    const actionBox = document.getElementById('customerActionButtons');
    const callLink = document.getElementById('detailCallLink');
    const waLink = document.getElementById('detailWaLink');
    if (actionBox && callLink && waLink) {
      const cleanPhone = String(item.phone).replace(/\D/g, '').slice(-10);
      callLink.href = `tel:+91${cleanPhone}`;
      waLink.href = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent('Hello ' + (item.fullName || 'Sir') + ', this is STP Chickens Kannampalayam dispatch desk regarding your wholesale enquiry #' + item.id + '.')}`;
      actionBox.classList.remove('hidden');
    }
    if (detailEmail) detailEmail.textContent = item.email;
    if (detailAddress) detailAddress.textContent = item.deliveryLocation;
    if (detailProduct) detailProduct.textContent = item.productInterest;
    if (detailQuantity) detailQuantity.textContent = item.quantity;
    if (detailNotes) detailNotes.textContent = item.message ? `"${item.message}"` : 'No additional cutting notes specified.';
    if (detailCreatedAt) {
      detailCreatedAt.textContent = new Date(item.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    }

    if (detailStatusSelect) {
      detailStatusSelect.value = item.status;
    }

    hideFeedback();
  }

  function renderEmptyDetail() {
    selectedEnquiryId = null;
    if (detailPanelRef) detailPanelRef.textContent = 'No Enquiry Selected';
    if (detailPanelStatusBadge) detailPanelStatusBadge.innerHTML = '';
    if (detailCustomerEntity) detailCustomerEntity.textContent = '—';
    if (detailCustomerType) detailCustomerType.textContent = '—';
    if (detailContactPerson) detailContactPerson.textContent = '—';
    if (detailPhone) detailPhone.textContent = '—';
    const actionBox = document.getElementById('customerActionButtons');
    if (actionBox) actionBox.classList.add('hidden');
    if (detailEmail) detailEmail.textContent = '—';
    if (detailAddress) detailAddress.textContent = '—';
    if (detailProduct) detailProduct.textContent = '—';
    if (detailQuantity) detailQuantity.textContent = '—';
    if (detailNotes) detailNotes.textContent = 'No enquiry selected.';
    if (detailCreatedAt) detailCreatedAt.textContent = '—';
  }

  /**
   * Handle updating enquiry status
   */
  async function handleStatusUpdate() {
    if (!selectedEnquiryId || !detailStatusSelect) return;
    const newStatus = detailStatusSelect.value;

    try {
      if (detailUpdateStatusBtn) detailUpdateStatusBtn.disabled = true;
      const res = await window.ThangamAPI.updateEnquiry(selectedEnquiryId, { status: newStatus });

      if (res && res.success) {
        showFeedback(`Status updated to "${newStatus}"`, 'success');
        // Refresh overview metrics and current list
        await Promise.all([loadOverview(), loadEnquiries()]);
      } else {
        throw new Error((res && res.message) || 'Update failed');
      }
    } catch (err) {
      showFeedback(err.message, 'error');
    } finally {
      if (detailUpdateStatusBtn) detailUpdateStatusBtn.disabled = false;
    }
  }

  /**
   * Handle deleting enquiry with confirmation
   */
  async function handleDeleteEnquiry() {
    if (!selectedEnquiryId) return;

    const confirmed = window.confirm(`Are you sure you want to delete enquiry ${selectedEnquiryId}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      if (detailDeleteBtn) detailDeleteBtn.disabled = true;
      const res = await window.ThangamAPI.deleteEnquiry(selectedEnquiryId);

      if (res && res.success) {
        showFeedback(`Enquiry ${selectedEnquiryId} deleted`, 'success');
        selectedEnquiryId = null;
        await Promise.all([loadOverview(), loadEnquiries()]);
      } else {
        throw new Error((res && res.message) || 'Deletion failed');
      }
    } catch (err) {
      showFeedback(err.message, 'error');
    } finally {
      if (detailDeleteBtn) detailDeleteBtn.disabled = false;
    }
  }

  function showFeedback(msg, type = 'success') {
    if (!detailFeedbackBanner) return;
    detailFeedbackBanner.className = `p-3 rounded-DEFAULT text-xs font-semibold mb-3 ${
      type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
    }`;
    detailFeedbackBanner.textContent = msg;
    detailFeedbackBanner.classList.remove('hidden');

    setTimeout(() => {
      hideFeedback();
    }, 4000);
  }

  function hideFeedback() {
    if (!detailFeedbackBanner) return;
    detailFeedbackBanner.classList.add('hidden');
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'New':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-DEFAULT text-[11px] font-bold bg-emerald-100 text-forest-green border border-forest-green/20">
          <span class="w-1.5 h-1.5 rounded-full bg-forest-green"></span>
          <span>New</span>
        </span>`;
      case 'Contacted':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-DEFAULT text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          <span>Contacted</span>
        </span>`;
      case 'In Progress':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-DEFAULT text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>In Progress</span>
        </span>`;
      case 'Completed':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-DEFAULT text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>Completed</span>
        </span>`;
      case 'Cancelled':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-DEFAULT text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
          <span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
          <span>Cancelled</span>
        </span>`;
      default:
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-DEFAULT text-[11px] font-bold bg-gray-100 text-gray-800">${escapeHtml(status || 'Unknown')}</span>`;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Global handle for inline row selection onclick
  window.AdminDashboard = {
    selectRow: (id) => selectEnquiry(id),
    toggleLoginModal: () => {
      if (loginModal) loginModal.classList.toggle('hidden');
    }
  };
})();

