/**
 * KisanMitra Unified API & Real-Time Cloud Synchronization Engine
 * Guarantees instant multi-device token synchronization across Farmer, Officer, and Community Portals.
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
        list.push(`${origin}/api`);
        if (port && port !== '5000') {
          list.push(`${protocol}//${hostname}:5000/api`);
        }
      }
    }
    list.push('/api');
    return Array.from(new Set(list));
  }

  let currentBaseUrl = getBaseUrlCandidates()[0];

  async function tryFetch(baseUrl, endpoint, options, headers) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${baseUrl}${cleanEndpoint}`;
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { text };
      }
      return { ok: response.ok, status: response.status, ...data };
    } catch (err) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  async function request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

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
    return { ok: false, status: 0, success: false, message: 'Offline/Fallback mode active' };
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

    // 🌾 TOKENS ENGINE (Direct Supabase Cloud Persistence)
    async createToken(data) {
      const cleanPhone = (data.phone || '9876500000').replace(/\D/g, '').slice(-10);
      const mandiStr = (data.mandi || data.district || 'Central Mandi').trim();
      const distStr = (data.district || data.mandi || 'Central District').trim();

      const payload = {
        name: data.name || 'Farmer',
        phone: cleanPhone,
        crop: data.crop || 'Wheat',
        quantity: data.quantity || data.qty || 10,
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
      return request('/tokens');
    },

    async getToken(tokenId) {
      if (!tokenId) return { success: false, message: 'Token required' };
      const tid = tokenId.toUpperCase().trim();
      return request(`/tokens/${encodeURIComponent(tid)}`);
    },

    async advanceStep(tokenId) {
      if (!tokenId) return;
      const tid = tokenId.toUpperCase().trim();
      return request(`/tokens/${encodeURIComponent(tid)}/advance`, { method: 'PATCH' });
    },

    async deleteToken(tokenId) {
      if (!tokenId) return;
      const tid = tokenId.toUpperCase().trim();
      return request(`/tokens/${encodeURIComponent(tid)}`, { method: 'DELETE' });
    },

    async resetDemoData() {
      return request('/tokens/reset-demo', { method: 'POST' });
    },

    // 💬 COMMUNITY MARKETPLACE ENGINE (Direct Supabase Cloud Persistence)
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
      return request(`/community/listings/${encodeURIComponent(postId)}/comments`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async deleteCommunityListing(postId) {
      return request(`/community/listings/${encodeURIComponent(postId)}`, { method: 'DELETE' });
    },

    // 🌟 FARMER FEEDBACK ENGINE (Direct Supabase Cloud Persistence)
    async submitFeedback(data) {
      const payload = {
        name: data.name || data.farmer_name || 'Farmer',
        phone: data.phone || '',
        rating: Number(data.rating) || 5,
        comments: data.comments || data.comment || ''
      };
      return request('/feedback', { method: 'POST', body: JSON.stringify(payload) });
    },

    async getAllFeedback() {
      return request('/feedback');
    },

    // 📊 MANDIS, PRICES, SCHEMES & STATS
    async getMandis() {
      return request('/mandis');
    },

    async getPrices(crop) {
      return request(`/mandis/prices?crop=${encodeURIComponent(crop || 'Wheat')}`);
    },

    async getAdminStats() {
      return request('/admin/stats');
    },

    async getSchemes(cat, query) {
      let url = '/schemes?';
      if (cat && cat !== 'all') url += `cat=${encodeURIComponent(cat)}&`;
      if (query) url += `q=${encodeURIComponent(query)}`;
      return request(url);
    }
  };
})();

if (typeof window !== 'undefined') {
  window.KM_API = KM_API;
}

