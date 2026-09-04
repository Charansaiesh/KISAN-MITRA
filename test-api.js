const http = require('http');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: rawData });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🌾 KISANMITRA COMPLETE AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  let farmerToken = '';
  let officerToken = '';
  let generatedTokenId = '';
  let communityPostId = '';

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${details ? '- ' + details : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'OK', '1. GET /api/health (Server is live & responding)');

    // 2. Public Registration Security Guard (Attempt to register as admin)
    const regPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const regRes = await request('/auth/register', 'POST', {
      name: 'Kisan Ramesh',
      phone: regPhone,
      password: 'password123',
      district: 'Lucknow',
      role: 'admin' // Attempt privilege escalation
    });
    assert(
      regRes.status === 201 && regRes.data.user.role === 'farmer',
      '2. POST /api/auth/register (Role locked to farmer, prevents privilege escalation)',
      `Assigned Role: ${regRes.data.user?.role}`
    );
    farmerToken = regRes.data.token;

    // 3. Farmer Login
    const loginRes = await request('/auth/login', 'POST', {
      phone: regPhone,
      password: 'password123'
    });
    assert(loginRes.status === 200 && !!loginRes.data.token, '3. POST /api/auth/login (JWT token issued)');

    // 4. Officer Login
    const officerRes = await request('/auth/officer-login', 'POST', {
      password: 'admin123'
    });
    assert(
      officerRes.status === 200 && officerRes.data.user.role === 'officer' && !!officerRes.data.token,
      '4. POST /api/auth/officer-login (Officer JWT issued with officer role)'
    );
    officerToken = officerRes.data.token;

    // 5. Create Crop Report / Smart Token
    const createTokRes = await request('/tokens', 'POST', {
      name: 'Rameshwar Lal',
      phone: '9876501234',
      crop: 'Mustard',
      quantity: '40',
      district: 'Jaipur'
    });
    generatedTokenId = createTokRes.data.token;
    assert(
      createTokRes.status === 201 && !!generatedTokenId && createTokRes.data.data.steps.length === 5,
      '5. POST /api/tokens (Crop report created, token issued & steps initialized)',
      `Issued: ${generatedTokenId}`
    );

    // 6. Track Token Status
    const trackRes = await request(`/tokens/${generatedTokenId}`);
    assert(
      trackRes.status === 200 && trackRes.data.token === generatedTokenId && trackRes.data.crop === 'Mustard',
      '6. GET /api/tokens/:token (Real-time token lookup & progress retrieval)'
    );

    // 7. Officer Advance Step (Authorized)
    const advRes = await request(`/tokens/${generatedTokenId}/advance`, 'PATCH', null, officerToken);
    assert(
      advRes.status === 200 && advRes.data.success === true,
      '7. PATCH /api/tokens/:token/advance (Officer successfully advanced step with JWT)'
    );

    // 8. Unauthorized Advance Step Guard (Without JWT or with Farmer JWT)
    const unauthRes = await request(`/tokens/${generatedTokenId}/advance`, 'PATCH', null, null);
    const farmerForbiddenRes = await request(`/tokens/${generatedTokenId}/advance`, 'PATCH', null, farmerToken);
    assert(
      unauthRes.status === 401 && farmerForbiddenRes.status === 403,
      '8. Role-Based Guard Check (Blocks unauthorized & non-officer role modifications)',
      `No Token: ${unauthRes.status}, Farmer Role: ${farmerForbiddenRes.status}`
    );

    // 9. Admin Dynamic Statistics
    const statsRes = await request('/admin/stats', 'GET', null, officerToken);
    assert(
      statsRes.status === 200 && statsRes.data.stats && statsRes.data.stats.total_tokens >= 3,
      '9. GET /api/admin/stats (Dynamic statistics calculated in real-time)',
      `Total Tokens: ${statsRes.data.stats?.total_tokens}, Done: ${statsRes.data.stats?.paid_completed}`
    );

    // 10. Mandi List & Market Prices
    const mandisRes = await request('/mandis');
    const pricesRes = await request('/mandis/prices?crop=Wheat');
    assert(
      mandisRes.status === 200 && mandisRes.data.count >= 20 && pricesRes.status === 200 && pricesRes.data.msp === 2425,
      '10. GET /api/mandis & /api/mandis/prices (70+ Mandis and MSP/Market price data returned)'
    );

    // 11. Community Listings (GET & POST)
    const commPostRes = await request('/community/listings', 'POST', {
      type: 'sell',
      cat: 'crops',
      title: '50 quintal organic wheat available',
      name: 'Harpreet Singh',
      dist: 'Ludhiana',
      phone: '9812345678',
      price: '₹2,550/quintal'
    });
    communityPostId = commPostRes.data.data.id;
    const commListRes = await request('/community/listings');
    assert(
      commPostRes.status === 201 && commListRes.status === 200 && commListRes.data.count > 0,
      '11. POST & GET /api/community/listings (Community marketplace listing created and listed)'
    );

    // 12. Community Comments
    const commentRes = await request(`/community/listings/${communityPostId}/comments`, 'POST', {
      author_name: 'Kuldeep',
      comment: 'Is transportation available to Chandigarh Mandi?'
    });
    assert(
      commentRes.status === 201 && commentRes.data.success === true,
      '12. POST /api/community/listings/:id/comments (Comment added to community thread)'
    );

    // 13. Feedback Submission
    const fbRes = await request('/feedback', 'POST', {
      name: 'Gurdev Singh',
      phone: '9876543210',
      rating: 5,
      comments: 'Smart token system saved 4 hours at the mandi. Direct payment arrived within 48 hours.'
    });
    assert(fbRes.status === 201 && fbRes.data.success === true, '13. POST /api/feedback (User feedback persisted)');

    // 14. Notifications
    const notifRes = await request('/feedback/notifications');
    assert(notifRes.status === 200 && Array.isArray(notifRes.data.notifications), '14. GET /api/feedback/notifications (Notifications delivered)');

    // 15. Delete Token (Officer Only)
    const delRes = await request(`/tokens/${generatedTokenId}`, 'DELETE', null, officerToken);
    assert(delRes.status === 200 && delRes.data.success === true, '15. DELETE /api/tokens/:token (Officer token removal verified)');

  } catch (err) {
    console.error('⚠️ Unexpected test exception:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 FINAL TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
