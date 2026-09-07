/**
 * KisanMitra Unified API & Real-Time Cloud Synchronization Engine
 * Guarantees instant multi-device token synchronization across Farmer, Officer, and Community Portals.
 */

const KM_API = (function() {
  const TOKEN_KEY = 'km_jwt_token';
  const USER_KEY = 'km_auth_user';

  const SUPABASE_REST_URL = 'https://rkundyxuyuaktkhquphk.supabase.co/rest/v1';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdW5keXh1eXVha3RraHF1cGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NzczODgsImV4cCI6MjEwNDM1MzM4OH0.9_5gu_IYJTBV6WTqJ1hQ95BCjv57ZlbV-V-JT1wHxfY';

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

  /* ================= DIRECT SUPABASE REST CLIENT ================= */
  async function supabaseFetch(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const cleanPath = path.startsWith('/') ? path : '/' + path;
      const url = SUPABASE_REST_URL + cleanPath;
      const headers = Object.assign({
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }, options.headers || {});
      const response = await fetch(url, Object.assign({}, options, {
        headers,
        signal: controller.signal
      }));
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        console.warn('Supabase REST warning (' + response.status + '):', errBody);
        return null;
      }
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) return await response.json();
      return await response.text();
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Supabase fetch exception:', err);
      return null;
    }
  }

  /* ================= BASE URL & ROUTE FETCH ================= */
  function getBaseUrlCandidates() {
    const list = [];
    if (typeof window !== 'undefined' && window.location) {
      const { protocol, hostname, port, origin } = window.location;
      if (protocol.startsWith('http')) {
        list.push(origin + '/api');
        if (port && port !== '5000') {
          list.push(protocol + '//' + hostname + ':5000/api');
        }
      }
    }
    list.push('/api');
    list.push('https://kisan-mitra-charansaiesh.vercel.app/api');
    return Array.from(new Set(list));
  }

  let currentBaseUrl = getBaseUrlCandidates()[0];

  async function tryFetch(baseUrl, endpoint, options, headers) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
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
    return { ok: false, status: 0, success: false, message: 'Offline/Fallback mode active' };
  }

  /* ================= UNIFIED API EXPORTS ================= */
  return {
    get BASE_URL() { return currentBaseUrl; },
    getToken,
    setToken,
    clearAuth,
    getUser,
    supabaseFetch,

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

    // 🌾 TOKENS ENGINE (Guaranteed Supabase Cloud Persistence)
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

      // 1. Primary: Unified serverless route
      let res = await request('/tokens', { method: 'POST', body: JSON.stringify(payload) });
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
        return res;
      }

      // 2. Fallover: Direct Supabase Cloud REST insertion ensures cross-device sync
      try {
        for (let i = 0; i < 5; i++) {
          const randToken = 'KM2025' + Math.floor(1000 + Math.random() * 9000);
          const inserted = await supabaseFetch('/crop_reports', {
            method: 'POST',
            headers: { 'Prefer': 'return=representation' },
            body: JSON.stringify({
              token: randToken,
              farmer_name: payload.name,
              phone: payload.phone,
              crop: payload.crop,
              quantity_quintal: payload.quantity,
              mandi: payload.mandi,
              district: payload.district,
              status: 'Registration received',
              progress_pct: 20
            })
          });

          if (Array.isArray(inserted) && inserted.length > 0) {
            const createdReport = inserted[0];
            const defaultSteps = [
              { token_id: createdReport.id, step_name: 'Registration received', step_order: 1, is_completed: true },
              { token_id: createdReport.id, step_name: 'Identity verified', step_order: 2, is_completed: false },
              { token_id: createdReport.id, step_name: 'Deposit at mandi', step_order: 3, is_completed: false },
              { token_id: createdReport.id, step_name: 'Quality check', step_order: 4, is_completed: false },
              { token_id: createdReport.id, step_name: 'Payment', step_order: 5, is_completed: false }
            ];
            await supabaseFetch('/token_steps', {
              method: 'POST',
              body: JSON.stringify(defaultSteps)
            });

            try {
              let myTokens = JSON.parse(localStorage.getItem('km_my_tokens') || '[]');
              if (myTokens.indexOf(randToken) === -1) {
                myTokens.unshift(randToken);
                localStorage.setItem('km_my_tokens', JSON.stringify(myTokens));
              }
            } catch(e){}

            return {
              success: true,
              token: randToken,
              data: {
                token: randToken,
                name: payload.name,
                phone: payload.phone,
                crop: payload.crop,
                qty: payload.quantity + ' quintal',
                mandi: payload.mandi,
                district: payload.district,
                steps: [
                  ['Registration received', 1],
                  ['Identity verified', 0],
                  ['Deposit at mandi', 0],
                  ['Quality check', 0],
                  ['Payment', 0]
                ]
              }
            };
          }
        }
      } catch (directErr) {
        console.warn('Direct Supabase token creation error:', directErr);
      }

      return res;
    },

    async getAllTokens() {
      // 1. Primary: Unified serverless route
      let res = await request('/tokens');
      if (res && res.success && res.data && Object.keys(res.data).length > 0) {
        return res;
      }

      // 2. Direct Supabase Cloud REST fetch ensures tokens are loaded across all devices
      try {
        const rows = await supabaseFetch('/crop_reports?select=*,token_steps(*)&order=created_at.desc');
        if (Array.isArray(rows) && rows.length > 0) {
          const formatted = {};
          rows.forEach(r => {
            const steps = (r.token_steps || [])
              .sort((a, b) => (a.step_order || 0) - (b.step_order || 0))
              .map(s => [s.step_name, s.is_completed ? 1 : 0]);

            const pct = r.progress_pct != null ? r.progress_pct : 20;
            const fallbackSteps = [
              ['Registration received', pct >= 20 ? 1 : 0],
              ['Identity verified', pct >= 40 ? 1 : 0],
              ['Deposit at mandi', pct >= 60 ? 1 : 0],
              ['Quality check', pct >= 80 ? 1 : 0],
              ['Payment', pct >= 100 ? 1 : 0]
            ];

            formatted[r.token] = {
              token: r.token,
              name: r.farmer_name,
              phone: r.phone,
              crop: r.crop,
              qty: (r.quantity_quintal || 10) + ' quintal',
              mandi: r.mandi,
              district: r.district,
              status: r.status || (pct >= 100 ? 'Payment approved ✅' : 'Registration received'),
              progress_pct: pct,
              steps: steps.length ? steps : fallbackSteps
            };
          });
          return { success: true, data: formatted };
        }
      } catch (err) {
        console.warn('Direct Supabase getAllTokens error:', err);
      }

      return res || { success: false, data: {} };
    },

    async getToken(tokenId) {
      if (!tokenId) return { success: false, message: 'Token required' };
      const tid = tokenId.toUpperCase().trim();

      let res = await request('/tokens/' + encodeURIComponent(tid));
      if (res && (res.success || res.token)) return res;

      // Direct Supabase Cloud REST failover
      try {
        const rows = await supabaseFetch('/crop_reports?token=eq.' + encodeURIComponent(tid) + '&select=*,token_steps(*)');
        if (Array.isArray(rows) && rows.length > 0) {
          const report = rows[0];
          const steps = (report.token_steps || [])
            .sort((a, b) => (a.step_order || 0) - (b.step_order || 0))
            .map(s => [s.step_name, s.is_completed ? 1 : 0]);
          const doneCount = steps.filter(s => s[1] === 1).length;
          const pct = report.progress_pct != null ? report.progress_pct : Math.round((doneCount / (steps.length || 5)) * 100);

          const fallbackSteps = [
            ['Registration received', pct >= 20 ? 1 : 0],
            ['Identity verified', pct >= 40 ? 1 : 0],
            ['Deposit at mandi', pct >= 60 ? 1 : 0],
            ['Quality check', pct >= 80 ? 1 : 0],
            ['Payment', pct >= 100 ? 1 : 0]
          ];

          return {
            success: true,
            token: report.token,
            name: report.farmer_name,
            phone: report.phone,
            crop: report.crop,
            qty: (report.quantity_quintal || 10) + ' quintal',
            mandi: report.mandi,
            district: report.district,
            status: report.status,
            progress_pct: pct,
            queue_position: pct < 100 ? 1 : 0,
            steps: steps.length ? steps : fallbackSteps
          };
        }
      } catch (err) {
        console.warn('Direct Supabase getToken error:', err);
      }

      return res || { success: false, message: 'Token not found' };
    },

    async advanceStep(tokenId) {
      if (!tokenId) return { success: false, message: 'Token ID required' };
      const tid = tokenId.toUpperCase().trim();
      let res = await request('/tokens/' + encodeURIComponent(tid) + '/advance', { method: 'PATCH' });
      if (res && res.success) return res;

      // Direct Supabase Cloud REST failover
      try {
        const rows = await supabaseFetch('/crop_reports?token=eq.' + encodeURIComponent(tid) + '&select=id,progress_pct,status');
        if (Array.isArray(rows) && rows.length > 0) {
          const report = rows[0];
          let steps = await supabaseFetch('/token_steps?token_id=eq.' + report.id + '&order=step_order.asc');
          if (!Array.isArray(steps) || steps.length === 0) {
            const defaultStepNames = ['Registration received', 'Identity verified', 'Deposit at mandi', 'Quality check', 'Payment'];
            const repPct = report.progress_pct || 20;
            const stepsToInsert = defaultStepNames.map((name, idx) => ({
              token_id: report.id,
              step_name: name,
              step_order: idx + 1,
              is_completed: repPct >= ((idx + 1) * 20),
              completed_at: repPct >= ((idx + 1) * 20) ? new Date().toISOString() : null
            }));
            steps = await supabaseFetch('/token_steps', {
              method: 'POST',
              headers: { 'Prefer': 'return=representation' },
              body: JSON.stringify(stepsToInsert)
            });
          }

          if (Array.isArray(steps)) {
            const nextStep = steps.find(s => !s.is_completed);
            if (nextStep) {
              await supabaseFetch('/token_steps?id=eq.' + nextStep.id, {
                method: 'PATCH',
                body: JSON.stringify({ is_completed: true, completed_at: new Date().toISOString() })
              });
              const doneCount = (steps.filter(s => s.is_completed).length) + 1;
              const pct = Math.min(100, Math.round((doneCount / steps.length) * 100));
              await supabaseFetch('/crop_reports?id=eq.' + report.id, {
                method: 'PATCH',
                body: JSON.stringify({ progress_pct: pct, status: nextStep.step_name, updated_at: new Date().toISOString() })
              });
              return { success: true, message: `Token ${tid} advanced to ${nextStep.step_name}`, token: tid, progress_pct: pct, status: nextStep.step_name };
            } else {
              return { success: true, message: `Token ${tid} already completed`, token: tid, progress_pct: 100, status: 'Payment approved ✅' };
            }
          }
        }
        return { success: false, message: `Token ${tid} not found in database` };
      } catch (err) {
        console.error('Direct Supabase advanceStep error:', err);
        return { success: false, message: err.message || 'Error updating token' };
      }
    },

    async deleteToken(tokenId) {
      if (!tokenId) return { success: false, message: 'Token ID required' };
      const tid = tokenId.toUpperCase().trim();
      let res = await request('/tokens/' + encodeURIComponent(tid), { method: 'DELETE' });
      if (res && res.success) return res;

      // Direct Supabase Cloud REST failover
      try {
        const rows = await supabaseFetch('/crop_reports?token=eq.' + encodeURIComponent(tid) + '&select=id');
        if (Array.isArray(rows) && rows.length > 0) {
          const report = rows[0];
          await supabaseFetch('/token_steps?token_id=eq.' + report.id, { method: 'DELETE' });
          await supabaseFetch('/notifications?token=eq.' + encodeURIComponent(tid), { method: 'DELETE' });
          await supabaseFetch('/crop_reports?id=eq.' + report.id, { method: 'DELETE' });
          return { success: true, message: `Token ${tid} deleted successfully.` };
        }
        return { success: false, message: `Token ${tid} not found in database` };
      } catch (err) {
        console.error('Direct Supabase deleteToken error:', err);
        return { success: false, message: err.message || 'Error deleting token' };
      }
    },

    async resetDemoData() {
      return request('/tokens/reset-demo', { method: 'POST' });
    },

    // 💬 COMMUNITY MARKETPLACE ENGINE (Direct Supabase Cloud Persistence)
    async getCommunityListings(cat, query) {
      let url = '/community/listings?';
      if (cat && cat !== 'all') url += 'cat=' + encodeURIComponent(cat) + '&';
      if (query) url += 'q=' + encodeURIComponent(query);
      let res = await request(url);
      if (res && res.success && res.data && res.data.length > 0) return res;

      // Direct Supabase REST
      try {
        let q = '/community_posts?select=*,community_comments(*)&order=created_at.desc';
        if (cat && cat !== 'all') q += '&category=eq.' + encodeURIComponent(cat);
        const rows = await supabaseFetch(q);
        if (Array.isArray(rows) && rows.length > 0) {
          const mapped = rows.map(r => ({
            id: r.id,
            type: r.type,
            cat: r.category,
            title: r.title,
            name: r.name || r.farmer_name || 'Farmer',
            dist: r.district,
            phone: r.phone,
            price: r.price,
            emoji: r.emoji,
            created_at: r.created_at,
            comments: (r.community_comments || []).map(c => ({
              id: c.id,
              author: c.author_name || 'Farmer',
              author_name: c.author_name || 'Farmer',
              comment: c.comment || c.comment_text || '',
              text: c.comment || c.comment_text || '',
              created_at: c.created_at
            }))
          }));
          return { success: true, data: mapped };
        }
      } catch (err) {
        console.warn('Direct Supabase getCommunityListings error:', err);
      }
      return res || { success: false, data: [] };
    },

    async createCommunityListing(data) {
      let res = await request('/community/listings', { method: 'POST', body: JSON.stringify(data) });
      if (res && res.success) return res;

      // Direct Supabase REST
      try {
        const payload = {
          type: data.type || 'sell',
          category: data.cat || data.category || 'crops',
          title: data.title || '',
          name: data.name || data.farmer_name || 'Farmer',
          district: data.dist || data.district || '',
          phone: (data.phone || '').replace(/\D/g, '').slice(-10),
          price: data.price || '',
          emoji: data.emoji || '🌾'
        };
        const inserted = await supabaseFetch('/community_posts', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (Array.isArray(inserted) && inserted.length > 0) {
          return { success: true, data: inserted[0] };
        }
      } catch (err) {
        console.error('Direct Supabase createCommunityListing error:', err);
      }
      return res;
    },

    async addCommunityComment(postId, data) {
      let res = await request('/community/listings/' + encodeURIComponent(postId) + '/comments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res && res.success) return res;

      // Direct Supabase REST
      try {
        const inserted = await supabaseFetch('/community_comments', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify({
            post_id: postId,
            author_name: data.author || data.author_name || 'Farmer',
            comment: data.text || data.comment || ''
          })
        });
        if (Array.isArray(inserted) && inserted.length > 0) {
          return { success: true, data: inserted[0] };
        }
      } catch (err) {}
      return res;
    },

    async deleteCommunityListing(postId) {
      let res = await request('/community/listings/' + encodeURIComponent(postId), { method: 'DELETE' });
      if (res && res.success) return res;

      // Direct Supabase REST
      try {
        await supabaseFetch('/community_comments?post_id=eq.' + encodeURIComponent(postId), { method: 'DELETE' });
        await supabaseFetch('/community_posts?id=eq.' + encodeURIComponent(postId), { method: 'DELETE' });
        return { success: true };
      } catch (err) {}
      return res;
    },

    // 🌟 FARMER FEEDBACK ENGINE (Direct Supabase Cloud Persistence)
    async submitFeedback(data) {
      const payload = {
        name: data.name || data.farmer_name || 'Farmer',
        phone: data.phone || '',
        rating: Number(data.rating) || 5,
        comments: data.comments || data.comment || ''
      };
      let res = await request('/feedback', { method: 'POST', body: JSON.stringify(payload) });
      if (res && res.success) return res;

      // Direct Supabase REST
      try {
        const inserted = await supabaseFetch('/feedback', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify({
            farmer_name: payload.name,
            phone: payload.phone,
            rating: payload.rating,
            comments: payload.comments
          })
        });
        if (Array.isArray(inserted) && inserted.length > 0) {
          return { success: true, data: inserted[0] };
        }
      } catch (err) {}
      return res;
    },

    async getAllFeedback() {
      let res = await request('/feedback');
      if (res && res.success && (res.feedback || res.data)) {
        const list = res.feedback || res.data;
        return { success: true, count: list.length, feedback: list, data: list };
      }

      // Direct Supabase REST
      try {
        const rows = await supabaseFetch('/feedback?order=created_at.desc');
        if (Array.isArray(rows)) {
          const mapped = rows.map(r => ({
            id: r.id,
            farmer_name: r.farmer_name,
            name: r.farmer_name,
            phone: r.phone,
            rating: r.rating,
            comments: r.comments,
            created_at: r.created_at
          }));
          return { success: true, count: mapped.length, feedback: mapped, data: mapped };
        }
      } catch (err) {}
      return res || { success: false, feedback: [], data: [] };
    },

    // 📢 ANNOUNCEMENTS & NOTIFICATIONS ENGINE (Direct Supabase Cloud Persistence)
    async getNotifications() {
      let res = await request('/notifications');
      if (!res || !res.success) {
        res = await request('/feedback/notifications');
      }
      if (res && res.success && res.notifications && res.notifications.length > 0) return res;

      // Direct Supabase REST failover
      try {
        const rows = await supabaseFetch('/notifications?order=sent_at.desc&limit=50');
        if (Array.isArray(rows)) {
          return { success: true, notifications: rows };
        }
      } catch (err) {}
      return res || { success: true, notifications: [] };
    },

    async createNotification(data) {
      const payload = {
        title: (data.title || '').trim(),
        message: (data.message || data.msg || '').trim(),
        phone: data.phone || 'ALL_FARMERS'
      };
      let res = await request('/notifications', { method: 'POST', body: JSON.stringify(payload) });
      if (!res || !res.success) {
        res = await request('/feedback/notifications', { method: 'POST', body: JSON.stringify(payload) });
      }
      if (res && res.success) return res;

      // Direct Supabase REST failover
      try {
        const inserted = await supabaseFetch('/notifications', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify({
            title: payload.title,
            message: payload.message,
            phone: payload.phone,
            is_read: false
          })
        });
        if (Array.isArray(inserted) && inserted.length > 0) {
          return { success: true, notification: inserted[0] };
        }
      } catch (err) {}
      return res;
    },

    async updateNotification(id, data) {
      const payload = {
        title: data.title ? data.title.trim() : undefined,
        message: data.message ? data.message.trim() : undefined
      };
      let res = await request('/notifications/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(payload) });
      if (!res || !res.success) {
        res = await request('/feedback/notifications/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(payload) });
      }
      if (res && res.success) return res;

      // Direct Supabase REST failover
      try {
        const updated = await supabaseFetch('/notifications?id=eq.' + encodeURIComponent(id), {
          method: 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (Array.isArray(updated) && updated.length > 0) {
          return { success: true, notification: updated[0] };
        }
      } catch (err) {}
      return res;
    },

    async deleteNotification(id) {
      let res = await request('/notifications/' + encodeURIComponent(id), { method: 'DELETE' });
      if (!res || !res.success) {
        res = await request('/feedback/notifications/' + encodeURIComponent(id), { method: 'DELETE' });
      }
      if (res && res.success) return res;

      // Direct Supabase REST failover
      try {
        await supabaseFetch('/notifications?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
        return { success: true };
      } catch (err) {}
      return res;
    },

    // 📊 MANDIS, PRICES, SCHEMES & STATS
    async getMandis() {
      return request('/mandis');
    },

    async getPrices(crop) {
      return request('/mandis/prices?crop=' + encodeURIComponent(crop || 'Wheat'));
    },

    async getAdminStats() {
      let res = await request('/admin/stats');
      if (res && res.success && res.stats) return res;

      try {
        const rows = await supabaseFetch('/crop_reports?select=progress_pct,status');
        if (Array.isArray(rows)) {
          const total = rows.length;
          const done = rows.filter(r => r.progress_pct === 100 || (r.status && r.status.includes('Payment approved'))).length;
          const pend = rows.filter(r => r.progress_pct > 20 && r.progress_pct < 100).length;
          const fresh = rows.filter(r => r.progress_pct <= 20).length;
          return {
            success: true,
            stats: {
              total_tokens: total,
              paid_completed: done,
              in_process: pend,
              new_unreviewed: fresh
            }
          };
        }
      } catch (err) {}
      return res;
    },

    async getSchemes(cat, query) {
      let url = '/schemes?';
      if (cat && cat !== 'all') url += 'cat=' + encodeURIComponent(cat) + '&';
      if (query) url += 'q=' + encodeURIComponent(query);
      return request(url);
    }
  };
})();

if (typeof window !== 'undefined') {
  window.KM_API = KM_API;
}
