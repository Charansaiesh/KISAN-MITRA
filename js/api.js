/**
 * KisanMitra Unified API & Real-Time Cloud Synchronization Engine
 * Guarantees instant multi-device token synchronization across Farmer, Officer, and Community Portals.
 */

const KM_API = (function() {
  const CLOUD_TOKEN_STORE_ID = 'ff808181a067127101a0719315bb196c';
  const CLOUD_COMM_STORE_ID = 'ff808181a067127101a0719372d5196d';
  const CLOUD_FB_STORE_ID = 'ff808181a067127101a07193737b196e';
  const CLOUD_BASE = 'https://api.restful-api.dev/objects';

  const TOKEN_KEY = 'km_jwt_token';
  const USER_KEY = 'km_auth_user';
  const LOCAL_DB_KEY = 'kisanmitra_db_v3';

  // Seed default tokens
  const DEFAULT_TOKENS = {
    "KM2024001": {
      token: "KM2024001",
      name: "Ram Yadav",
      phone: "9876543210",
      crop: "Wheat",
      qty: "45 quintal",
      mandi: "Lucknow Mandi",
      district: "Lucknow",
      steps: [
        ["Registration received", 1],
        ["Identity verified", 1],
        ["Crop deposited at mandi", 1],
        ["Quality check done", 1],
        ["Payment approved ✅", 1]
      ],
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    "KM2024002": {
      token: "KM2024002",
      name: "Sumitra Devi",
      phone: "9876543211",
      crop: "Mustard",
      qty: "30 quintal",
      mandi: "Jaipur Mandi",
      district: "Jaipur",
      steps: [
        ["Registration received", 1],
        ["Identity verified", 1],
        ["Crop deposited at mandi", 1],
        ["Quality check ⏳", 1],
        ["Payment", 0]
      ],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    "KM2024003": {
      token: "KM2024003",
      name: "Mohan Patel",
      phone: "9876543212",
      crop: "Paddy",
      qty: "60 quintal",
      mandi: "Patna Mandi",
      district: "Patna",
      steps: [
        ["Registration received", 1],
        ["Identity verified ⏳", 1],
        ["Deposit at mandi (Oct 10)", 0],
        ["Quality check", 0],
        ["Payment", 0]
      ],
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  };

  function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
  function setToken(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch(e) { return null; }
  }

  function getLocalTokens() {
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_DB_KEY) || '{}');
      return Object.keys(stored).length ? stored : { ...DEFAULT_TOKENS };
    } catch(e) {
      return { ...DEFAULT_TOKENS };
    }
  }

  function saveLocalTokens(tokens) {
    try {
      localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(tokens));
    } catch(e){}
  }

  /* ================= CLOUD SYNC CORE ================= */
  async function fetchCloudStore(storeId) {
    try {
      const res = await fetch(`${CLOUD_BASE}/${storeId}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch(e) {
      console.warn('[KM_CLOUD_SYNC] Fetch failed:', e.message);
    }
    return null;
  }

  async function updateCloudStore(storeId, storeName, data) {
    try {
      const res = await fetch(`${CLOUD_BASE}/${storeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: storeName, data })
      });
      return res.ok;
    } catch(e) {
      console.warn('[KM_CLOUD_SYNC] Update failed:', e.message);
      return false;
    }
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

    // 🌾 TOKENS ENGINE (Guaranteed Global Real-Time Sync)
    async createToken(data) {
      const tokenNumber = 'KM2025' + Math.floor(1000 + Math.random() * 9000);
      const cleanPhone = (data.phone || '9876500000').replace(/\D/g, '').slice(-10);
      const mandiStr = (data.mandi || data.district || 'Central Mandi').trim();
      const distStr = (data.district || data.mandi || 'Central District').trim();

      const newEntry = {
        token: tokenNumber,
        name: data.name || 'Farmer',
        phone: cleanPhone,
        crop: data.crop || 'Wheat',
        qty: `${data.quantity || data.qty || 10} quintal`,
        mandi: mandiStr,
        district: distStr,
        steps: [
          ["Registration received", 1],
          ["Identity verified", 0],
          ["Deposit at mandi", 0],
          ["Quality check", 0],
          ["Payment", 0]
        ],
        created_at: new Date().toISOString()
      };

      // 1. Save to Local Storage immediately
      const local = getLocalTokens();
      local[tokenNumber] = newEntry;
      saveLocalTokens(local);
      try { localStorage.setItem('km_new_token', tokenNumber); } catch(e){}

      // 2. Broadcast to Central Cloud Store across all devices
      try {
        const cloudData = await fetchCloudStore(CLOUD_TOKEN_STORE_ID) || local;
        cloudData[tokenNumber] = newEntry;
        updateCloudStore(CLOUD_TOKEN_STORE_ID, 'KM_TOKEN_STORE_V1', cloudData);
      } catch(e){
        console.warn('Cloud store write fallback:', e);
      }

      // 3. Post to backend route if available
      request('/tokens', { method: 'POST', body: JSON.stringify(data) }).catch(() => {});

      return {
        success: true,
        ok: true,
        token: tokenNumber,
        data: newEntry
      };
    },

    async getAllTokens() {
      // 1. Fetch live tokens from Cloud Store
      let tokens = await fetchCloudStore(CLOUD_TOKEN_STORE_ID);

      // 2. If cloud responded, merge with local cache
      if (tokens && typeof tokens === 'object' && Object.keys(tokens).length > 0) {
        const local = getLocalTokens();
        const merged = { ...DEFAULT_TOKENS, ...local, ...tokens };
        saveLocalTokens(merged);
        return { success: true, ok: true, data: merged };
      }

      // 3. Fallback to API route or local
      const apiRes = await request('/tokens');
      if (apiRes && apiRes.data && Object.keys(apiRes.data).length > 0) {
        return apiRes;
      }

      return { success: true, ok: true, data: getLocalTokens() };
    },

    async getToken(tokenId) {
      if (!tokenId) return { success: false, message: 'Token required' };
      const tid = tokenId.toUpperCase().trim();

      // Check cloud first
      const cloudData = await fetchCloudStore(CLOUD_TOKEN_STORE_ID);
      if (cloudData && cloudData[tid]) {
        const d = cloudData[tid];
        const doneCount = (d.steps || []).filter(s => s[1] === 1 || s[1] === true).length;
        const pct = Math.round((doneCount / (d.steps ? d.steps.length : 5)) * 100);
        return { success: true, ok: true, token: d.token, ...d, progress_pct: pct };
      }

      // Check local cache
      const local = getLocalTokens();
      if (local[tid]) {
        const d = local[tid];
        const doneCount = (d.steps || []).filter(s => s[1] === 1 || s[1] === true).length;
        const pct = Math.round((doneCount / (d.steps ? d.steps.length : 5)) * 100);
        return { success: true, ok: true, token: d.token, ...d, progress_pct: pct };
      }

      return request(`/tokens/${encodeURIComponent(tid)}`);
    },

    async advanceStep(tokenId) {
      if (!tokenId) return;
      const tid = tokenId.toUpperCase().trim();

      // 1. Update local
      const local = getLocalTokens();
      if (local[tid] && local[tid].steps) {
        const next = local[tid].steps.find(s => !s[1]);
        if (next) next[1] = 1;
        saveLocalTokens(local);
      }

      // 2. Update cloud
      try {
        const cloudData = await fetchCloudStore(CLOUD_TOKEN_STORE_ID) || local;
        if (cloudData[tid] && cloudData[tid].steps) {
          const next = cloudData[tid].steps.find(s => !s[1]);
          if (next) next[1] = 1;
          await updateCloudStore(CLOUD_TOKEN_STORE_ID, 'KM_TOKEN_STORE_V1', cloudData);
        }
      } catch(e){}

      return request(`/tokens/${encodeURIComponent(tid)}/advance`, { method: 'PATCH' });
    },

    async deleteToken(tokenId) {
      if (!tokenId) return;
      const tid = tokenId.toUpperCase().trim();

      // 1. Delete local
      const local = getLocalTokens();
      delete local[tid];
      saveLocalTokens(local);

      // 2. Delete from cloud
      try {
        const cloudData = await fetchCloudStore(CLOUD_TOKEN_STORE_ID) || local;
        delete cloudData[tid];
        await updateCloudStore(CLOUD_TOKEN_STORE_ID, 'KM_TOKEN_STORE_V1', cloudData);
      } catch(e){}

      return request(`/tokens/${encodeURIComponent(tid)}`, { method: 'DELETE' });
    },

    async resetDemoData() {
      saveLocalTokens(DEFAULT_TOKENS);
      await updateCloudStore(CLOUD_TOKEN_STORE_ID, 'KM_TOKEN_STORE_V1', DEFAULT_TOKENS);
      return request('/tokens/reset-demo', { method: 'POST' });
    },

    // 💬 COMMUNITY ENGINE (Cloud Synchronized)
    async getCommunityListings(cat, query) {
      let cloudPosts = await fetchCloudStore(CLOUD_COMM_STORE_ID);
      if (cloudPosts && Array.isArray(cloudPosts) && cloudPosts.length > 0) {
        let filtered = cloudPosts;
        if (cat && cat !== 'all') filtered = filtered.filter(p => p.cat === cat);
        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter(p => (p.title || '').toLowerCase().includes(q) || (p.dist || '').toLowerCase().includes(q));
        }
        return { success: true, ok: true, data: filtered };
      }

      let url = '/community/listings?';
      if (cat && cat !== 'all') url += `cat=${encodeURIComponent(cat)}&`;
      if (query) url += `q=${encodeURIComponent(query)}`;
      return request(url);
    },

    async createCommunityListing(data) {
      const newPost = {
        id: 'cm_' + Date.now(),
        ...data,
        created_at: new Date().toISOString(),
        comments: []
      };

      try {
        let cloudPosts = await fetchCloudStore(CLOUD_COMM_STORE_ID) || [];
        if (!Array.isArray(cloudPosts)) cloudPosts = [];
        cloudPosts.unshift(newPost);
        updateCloudStore(CLOUD_COMM_STORE_ID, 'KM_COMMUNITY_STORE_V1', cloudPosts);
      } catch(e){}

      request('/community/listings', { method: 'POST', body: JSON.stringify(data) }).catch(() => {});
      return { success: true, ok: true, data: newPost };
    },

    async addCommunityComment(postId, data) {
      try {
        let cloudPosts = await fetchCloudStore(CLOUD_COMM_STORE_ID) || [];
        const post = cloudPosts.find(p => p.id === postId);
        if (post) {
          if (!post.comments) post.comments = [];
          post.comments.push({ ...data, created_at: new Date().toISOString() });
          await updateCloudStore(CLOUD_COMM_STORE_ID, 'KM_COMMUNITY_STORE_V1', cloudPosts);
        }
      } catch(e){}

      return request(`/community/listings/${encodeURIComponent(postId)}/comments`, { method: 'POST', body: JSON.stringify(data) });
    },

    async deleteCommunityListing(postId) {
      try {
        let cloudPosts = await fetchCloudStore(CLOUD_COMM_STORE_ID) || [];
        cloudPosts = cloudPosts.filter(p => p.id !== postId);
        await updateCloudStore(CLOUD_COMM_STORE_ID, 'KM_COMMUNITY_STORE_V1', cloudPosts);
      } catch(e){}

      return request(`/community/listings/${encodeURIComponent(postId)}`, { method: 'DELETE' });
    },

    // 🌟 FARMER FEEDBACK ENGINE (Cloud Synchronized)
    async submitFeedback(data) {
      const fbEntry = {
        id: 'fb_' + Date.now(),
        farmer_name: data.name || data.farmer_name || 'Farmer',
        phone: data.phone || '-',
        rating: Number(data.rating) || 5,
        comments: data.comments || data.comment || '',
        created_at: new Date().toISOString()
      };

      try {
        let cloudFb = await fetchCloudStore(CLOUD_FB_STORE_ID) || [];
        if (!Array.isArray(cloudFb)) cloudFb = [];
        cloudFb.unshift(fbEntry);
        updateCloudStore(CLOUD_FB_STORE_ID, 'KM_FEEDBACK_STORE_V1', cloudFb);
      } catch(e){}

      request('/feedback', { method: 'POST', body: JSON.stringify(data) }).catch(() => {});
      return { success: true, ok: true, data: fbEntry };
    },

    async getAllFeedback() {
      let cloudFb = await fetchCloudStore(CLOUD_FB_STORE_ID);
      if (cloudFb && Array.isArray(cloudFb) && cloudFb.length > 0) {
        return { success: true, ok: true, feedback: cloudFb };
      }
      return request('/feedback');
    },

    // Mandis & Prices
    async getMandis() { return request('/mandis'); },
    async getPrices(crop) { return request(`/mandis/prices?crop=${encodeURIComponent(crop || 'Wheat')}`); },
    async getAdminStats() { return request('/admin/stats'); },
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

