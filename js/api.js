/**
 * KisanMitra Unified API Client
 * Connects browser clients directly and securely to the KisanMitra /api backend routes.
 */

const KM_API = (function() {
  const TOKEN_KEY = 'km_jwt_token';
  const USER_KEY = 'km_auth_user';

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch(e) { return ''; }
  }

  function setToken(token, user) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch(e) {}
  }

  function clearAuth() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch(e) {}
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch(e) { return null; }
  }

  /* ================= BASE URL & ROUTE FETCH ================= */
  function getBaseUrlCandidates() {
    const list = [];
    if (typeof window !== 'undefined' && window.location) {
      const { protocol, hostname, port, origin } = window.location;
      if (protocol.startsWith('http')) {
        list.push(origin + '/api');
        list.push(origin);
        if (port && port !== '5000') {
          list.push(protocol + '//' + hostname + ':5000/api');
        }
      }
    }
    list.push('/api');
    list.push('http://localhost:5000/api');
    list.push('http://127.0.0.1:5000/api');
    return Array.from(new Set(list));
  }

  let currentBaseUrl = getBaseUrlCandidates()[0];

  async function tryFetch(baseUrl, endpoint, options, headers) {
    const controller = new AbortController();
    const timeoutMs = (options && options.timeout) ? options.timeout : 8000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
      const url = baseUrl + cleanEndpoint;
      const response = await fetch(url, Object.assign({}, options, {
        headers,
        signal: controller.signal
      }));
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { text };
      }
      return Object.assign({ ok: response.ok, status: response.status }, data);
    } catch (err) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  async function request(endpoint, options = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    let res = await tryFetch(currentBaseUrl, endpoint, options, headers);
    if (res && (res.ok || (res.status > 0 && res.status !== 404))) {
      return res;
    }

    const candidates = getBaseUrlCandidates().filter(c => c !== currentBaseUrl);
    for (const candidate of candidates) {
      res = await tryFetch(candidate, endpoint, options, headers);
      if (res && (res.ok || (res.status > 0 && res.status !== 404))) {
        currentBaseUrl = candidate;
        return res;
      }
    }
    return { ok: false, status: 0, success: false, message: 'API request failed / server unavailable' };
  }

  /* ================= UNIFIED API EXPORTS ================= */
  return {
    get BASE_URL() { return currentBaseUrl; },
    getToken,
    setToken,
    clearAuth,
    getUser,

    // Health Check
    async checkHealth() {
      return request('/health');
    },

    // Auth
    async register(data) {
      const res = await request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
      if (res && res.token) setToken(res.token, res.user);
      return res;
    },

    async login(phone, password) {
      const res = await request('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
      if (res && res.token) setToken(res.token, res.user);
      return res;
    },

    async officerLogin(password) {
      const res = await request('/auth/officer-login', { method: 'POST', body: JSON.stringify({ password }) });
      if (res && res.token) setToken(res.token, res.user);
      return res;
    },

    // 🌾 TOKENS ENGINE
    async createToken(data) {
      const cleanPhone = (data.phone || '9876500000').replace(/\D/g, '').slice(-10);
      const mandiStr = (data.mandi || data.district || 'Central Mandi').trim();
      const distStr = (data.district || data.mandi || 'Central District').trim();
      const qtyNum = parseFloat(data.quantity || data.qty || 10) || 10;

      const payload = {
        name: data.name || 'Farmer',
        phone: cleanPhone,
        crop: data.crop || 'Wheat',
        quantity: qtyNum,
        district: distStr,
        mandi: mandiStr
      };

      const res = await request('/tokens', { method: 'POST', body: JSON.stringify(payload) });
      if (res && (res.success || res.token)) {
        const tokenNum = res.token || (res.data ? res.data.token : '');
        if (tokenNum) {
          try {
            let myTokens = JSON.parse(localStorage.getItem('km_my_tokens') || '[]');
            if (myTokens.indexOf(tokenNum) === -1) {
              myTokens.unshift(tokenNum);
              localStorage.setItem('km_my_tokens', JSON.stringify(myTokens));
            }
          } catch(e){}
        }
      }
      return res;
    },

    async getAllTokens() {
      const res = await request('/tokens');
      return res || { success: false, data: {} };
    },

    async getToken(tokenId) {
      if (!tokenId) return { success: false, message: 'Token required' };
      const tid = tokenId.toUpperCase().trim();
      const res = await request('/tokens/' + encodeURIComponent(tid));
      return res || { success: false, message: 'Token not found' };
    },

    async advanceStep(tokenId) {
      if (!tokenId) return { success: false, message: 'Token ID required' };
      const tid = tokenId.toUpperCase().trim();
      return request('/tokens/' + encodeURIComponent(tid) + '/advance', { method: 'PATCH' });
    },

    async deleteToken(tokenId) {
      if (!tokenId) return { success: false, message: 'Token ID required' };
      const tid = tokenId.toUpperCase().trim();
      return request('/tokens/' + encodeURIComponent(tid), { method: 'DELETE' });
    },

    async resetDemoData() {
      return request('/tokens/reset-demo', { method: 'POST' });
    },

    // 💬 COMMUNITY MARKETPLACE ENGINE
    async getCommunityListings(cat, query) {
      let url = '/community/listings?';
      if (cat && cat !== 'all') url += 'cat=' + encodeURIComponent(cat) + '&';
      if (query) url += 'q=' + encodeURIComponent(query);
      return request(url);
    },

    async createCommunityListing(data) {
      return request('/community/listings', { method: 'POST', body: JSON.stringify(data) });
    },

    async addCommunityComment(postId, data) {
      return request('/community/listings/' + encodeURIComponent(postId) + '/comments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async deleteCommunityListing(postId) {
      return request('/community/listings/' + encodeURIComponent(postId), {
        method: 'DELETE'
      });
    },

    // 📝 FEEDBACK & ANNOUNCEMENTS
    async submitFeedback(data) {
      return request('/feedback', { method: 'POST', body: JSON.stringify(data) });
    },

    async getAllFeedback() {
      return request('/feedback');
    },

    async getNotifications() {
      return request('/notifications');
    },

    async createNotification(data) {
      return request('/notifications', { method: 'POST', body: JSON.stringify(data) });
    },

    async updateNotification(id, data) {
      return request('/notifications/' + encodeURIComponent(id), {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },

    async deleteNotification(id) {
      return request('/notifications/' + encodeURIComponent(id), { method: 'DELETE' });
    },

    // 📊 MANDIS, PRICES, SCHEMES & STATS
    async getMandis() {
      return request('/mandis');
    },

    async getPrices(crop) {
      return request('/mandis/prices?crop=' + encodeURIComponent(crop || 'Wheat'));
    },

    async getAdminStats() {
      return request('/admin/stats');
    },

    async getSchemes(cat, query) {
      let url = '/schemes?';
      if (cat && cat !== 'all') url += 'cat=' + encodeURIComponent(cat) + '&';
      if (query) url += 'q=' + encodeURIComponent(query);
      return request(url);
    },

    // 🔬 AI CROP QUALITY & MARKET VALUE ESTIMATION
    async analyzeCropQuality(payload) {
      return request('/crop-quality/analyze', {
        method: 'POST',
        body: JSON.stringify(payload),
        timeout: 35000
      });
    },

    async getCropQualityHistory() {
      return request('/crop-quality/history');
    },

    async getCropQualityAnalytics() {
      return request('/crop-quality/analytics');
    },

    async getCropQualityModelStatus() {
      return request('/crop-quality/model-status');
    },

    // 🤖 AI AGRI ASSISTANT CHAT
    async sendChatMessage(payload) {
      return request('/chat', {
        method: 'POST',
        body: JSON.stringify(payload),
        timeout: 25000
      });
    },

    async getChatSuggestions() {
      return request('/chat/suggestions');
    },

    async getAIStatus() {
      return request('/ai/status');
    },

    // 🌦️ LIVE AGRICULTURAL WEATHER & FORECAST
    async getWeather(params = {}) {
      const q = new URLSearchParams();
      if (params.location) q.append('location', params.location);
      if (params.lat) q.append('lat', params.lat);
      if (params.lon) q.append('lon', params.lon);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/weather${queryStr}`);
    },

    // 🚜 SMART MANDI ARBITRAGE & NET PROFIT CALCULATOR
    async calculateMandiArbitrage(payload) {
      return request('/mandis/arbitrage-calculator', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    async getArbitrageOptions() {
      return request('/mandis/arbitrage-options');
    }
  };
})();

if (typeof window !== 'undefined') {
  window.KM_API = KM_API;
}
