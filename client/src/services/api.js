/**
 * Centralized Client API Service for Thangam Farms (STP Chickens)
 * Provides configured endpoints, HTTP utilities, and authentication handling.
 */
(function (global) {
  'use strict';

  // Configurable base URL: Defaults to localhost:5000/api
  const API_BASE_URL = global.API_BASE_URL || 'http://localhost:5000/api';

  const apiClient = {
    baseUrl: API_BASE_URL,

    /**
     * Standard fetch wrapper that ensures credentials (cookies) are transmitted
     */
    async _request(endpoint, options = {}) {
      const url = `${this.baseUrl}${endpoint}`;
      const defaultHeaders = {
        'Accept': 'application/json'
      };

      if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }

      options.headers = {
        ...defaultHeaders,
        ...options.headers
      };

      // Always include cookies for session credentials
      options.credentials = 'include';

      try {
        const response = await fetch(url, options);
        const result = await response.json().catch(() => null);

        if (!response.ok) {
          const errorMessage = (result && result.message) || `Request failed with status ${response.status}`;
          const err = new Error(errorMessage);
          err.statusCode = response.status;
          err.errors = result ? result.errors : null;
          throw err;
        }

        return result;
      } catch (err) {
        if (!err.statusCode) {
          err.message = 'Unable to connect to the Thangam Farms server. Please check your network or server status.';
        }
        throw err;
      }
    },

    // --- PUBLIC ENDPOINTS ---

    /**
     * Submit wholesale commercial enquiry
     */
    async submitEnquiry(enquiryData) {
      return this._request('/enquiries', {
        method: 'POST',
        body: enquiryData
      });
    },

    /**
     * Check backend API health
     */
    async checkHealth() {
      return this._request('/health');
    },

    // --- ADMIN AUTHENTICATION ---

    /**
     * Admin login with email & password
     */
    async adminLogin(email, password) {
      return this._request('/admin/login', {
        method: 'POST',
        body: { email, password }
      });
    },

    /**
     * Get authenticated admin profile session
     */
    async getAdminMe() {
      return this._request('/admin/me', {
        method: 'GET'
      });
    },

    /**
     * Admin logout
     */
    async adminLogout() {
      return this._request('/admin/logout', {
        method: 'POST'
      });
    },

    // --- ADMIN DASHBOARD & ENQUIRY OPERATIONS ---

    /**
     * Get real computed overview metrics
     */
    async getOverviewMetrics() {
      return this._request('/admin/overview', {
        method: 'GET'
      });
    },

    /**
     * Query enquiries with search, filters and pagination
     */
    async getEnquiries(params = {}) {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.status && params.status !== 'all') query.append('status', params.status);
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);

      const qs = query.toString();
      return this._request(`/enquiries${qs ? '?' + qs : ''}`, {
        method: 'GET'
      });
    },

    /**
     * Get single enquiry by ID
     */
    async getEnquiryById(id) {
      return this._request(`/enquiries/${id}`, {
        method: 'GET'
      });
    },

    /**
     * Update enquiry status or admin notes
     */
    async updateEnquiry(id, updates) {
      return this._request(`/enquiries/${id}`, {
        method: 'PATCH',
        body: updates
      });
    },

    /**
     * Delete an enquiry
     */
    async deleteEnquiry(id) {
      return this._request(`/enquiries/${id}`, {
        method: 'DELETE'
      });
    },

    /**
     * Download secure CSV of enquiries
     */
    getExportCsvUrl() {
      return `${this.baseUrl}/admin/export-csv`;
    }
  };

  global.ThangamAPI = apiClient;
})(typeof window !== 'undefined' ? window : this);
