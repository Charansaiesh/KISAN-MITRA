/**
 * KisanMitra Unified API Client
 * Shared across Farmer Portal, Admin Dashboard, and Community Marketplace
 */

const KM_API = (function() {
  const isHttp = window.location.protocol.startsWith('http');
  const BASE_URL = isHttp ? `${window.location.origin}/api` : 'http://localhost:5000/api';

  const TOKEN_KEY = 'km_jwt_token';
  const USER_KEY = 'km_auth_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  async function request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();
      return { ok: response.ok, status: response.status, ...data };
    } catch (error) {
      console.warn(`[KM_API] Request to ${endpoint} failed:`, error.message);
      return { ok: false, status: 0, success: false, message: error.message };
    }
  }

  return {
    BASE_URL,
    getToken,
    setToken,
    clearAuth,
    getUser,

    // Health
    async checkHealth() {
      return request('/health');
    },

    // Auth
    async register(data) {
      const res = await request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
      if (res.token) setToken(res.token, res.user);
      return res;
    },

    async login(phone, password) {
      const res = await request('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
      if (res.token) setToken(res.token, res.user);
      return res;
    },

    async officerLogin(password) {
      const res = await request('/auth/officer-login', { method: 'POST', body: JSON.stringify({ password }) });
      if (res.token) setToken(res.token, res.user);
      return res;
    },

    // Crop Reports & Tokens
    async createToken(data) {
      return request('/tokens', { method: 'POST', body: JSON.stringify(data) });
    },

    async getToken(tokenId) {
      return request(`/tokens/${encodeURIComponent(tokenId)}`);
    },

    async getAllTokens() {
      return request('/tokens');
    },

    async advanceStep(tokenId) {
      return request(`/tokens/${encodeURIComponent(tokenId)}/advance`, { method: 'PATCH' });
    },

    async deleteToken(tokenId) {
      return request(`/tokens/${encodeURIComponent(tokenId)}`, { method: 'DELETE' });
    },

    async resetDemoData() {
      return request('/tokens/reset-demo', { method: 'POST' });
    },

    // Admin Stats
    async getAdminStats() {
      return request('/admin/stats');
    },

    // Mandis & Prices
    async getMandis() {
      return request('/mandis');
    },

    async getPrices(crop) {
      return request(`/mandis/prices?crop=${encodeURIComponent(crop || 'Wheat')}`);
    },

    // Community
    async getCommunityListings(cat, query) {
      let url = '/community/listings?';
      if (cat && cat !== 'all') url += `cat=${encodeURIComponent(cat)}&`;
      if (query) url += `q=${encodeURIComponent(query)}`;
      return request(url);
    },

    async createCommunityListing(data) {
      return request('/community/listings', { method: 'POST', body: JSON.stringify(data) });
    },

    async addCommunityComment(postId, data) {
      return request(`/community/listings/${encodeURIComponent(postId)}/comments`, { method: 'POST', body: JSON.stringify(data) });
    },

    async deleteCommunityListing(postId) {
      return request(`/community/listings/${encodeURIComponent(postId)}`, { method: 'DELETE' });
    },

    // Government Schemes
    async getSchemes(cat, query) {
      let url = '/schemes?';
      if (cat && cat !== 'all') url += `cat=${encodeURIComponent(cat)}&`;
      if (query) url += `q=${encodeURIComponent(query)}`;
      return request(url);
    },

    // Feedback & Notifications
    async submitFeedback(data) {
      return request('/feedback', { method: 'POST', body: JSON.stringify(data) });
    },

    async getAllFeedback() {
      return request('/feedback');
    },

    async getNotifications() {
      return request('/feedback/notifications');
    }
  };
})();

if (typeof window !== 'undefined') {
  window.KM_API = KM_API;
}
