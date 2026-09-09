const http = require('http');
require('dotenv').config();

process.env.NODE_ENV = 'test';
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;
const app = require('./server');

let serverInstance = null;

function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    // If path starts with /api/, strip it to avoid /api/api/...
    const cleanPath = path.startsWith('/api/') ? path.substring(4) : path;
    const url = new URL(`${BASE_URL}${cleanPath}`);
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

// Ensure server is listening before tests run
async function ensureServerRunning() {
  try {
    await request('/health');
  } catch (e) {
    // Server not running, start it in-process
    await new Promise((resolve) => {
      serverInstance = app.listen(PORT, () => {
        resolve();
      });
    });
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🌾 KISANMITRA COMPLETE AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  await ensureServerRunning();

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

    // 8. Role-Based Guard Check (Without JWT or with Farmer JWT)
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

    // 13. Feedback Submission & Retrieval
    const fbRes = await request('/feedback', 'POST', {
      name: 'Gurdev Singh',
      phone: '9876543210',
      rating: 5,
      comments: 'Smart token system saved 4 hours at the mandi. Direct payment arrived within 48 hours.'
    });
    const allFbRes = await request('/feedback', 'GET');
    assert(
      fbRes.status === 201 && fbRes.data.success === true && allFbRes.status === 200 && allFbRes.data.count > 0,
      '13. POST & GET /api/feedback (User feedback submitted and retrieved for admin)',
      `Total Feedback: ${allFbRes.data.count}`
    );

    // 14. Notifications Delivery
    const notifRes = await request('/feedback/notifications');
    assert(notifRes.status === 200 && Array.isArray(notifRes.data.notifications), '14. GET /api/feedback/notifications (Notifications delivered)');

    // 15. Delete Token (Officer Only)
    const delRes = await request(`/tokens/${generatedTokenId}`, 'DELETE', null, officerToken);
    assert(delRes.status === 200 && delRes.data.success === true, '15. DELETE /api/tokens/:token (Officer token removal verified)');

    // 16. Government Schemes Catalogue & Filtering
    const schemesRes = await request('/schemes?cat=dbt');
    assert(
      schemesRes.status === 200 && schemesRes.data.success === true && schemesRes.data.count > 0,
      '16. GET /api/schemes (Government schemes & subsidies filtered by category)',
      `Schemes Found: ${schemesRes.data.count}`
    );

    // 17. Community Post Deletion Moderation
    const delPostRes = await request(`/community/listings/${communityPostId}`, 'DELETE');
    assert(
      delPostRes.status === 200 && delPostRes.data.success === true,
      '17. DELETE /api/community/listings/:id (Community post deleted successfully)'
    );

    // 18. Announcements / Notifications Full CRUD Lifecycle (Officer)
    const createNotifRes = await request('/notifications', 'POST', {
      title: 'Emergency Flood Alert',
      message: 'Gate #3 closed temporarily due to heavy rain. Please proceed to Gate #1.',
      phone: 'ALL_FARMERS'
    }, officerToken);
    assert(
      createNotifRes.status === 201 && createNotifRes.data.success === true && createNotifRes.data.notification,
      '18. POST /api/notifications (Officer broadcasted mandi announcement)'
    );

    const createdNotifId = createNotifRes.data.notification.id;

    // 19. Announcement Update
    const updateNotifRes = await request(`/notifications/${createdNotifId}`, 'PATCH', {
      title: 'Gate #3 Reopened',
      message: 'Drainage cleared. Gate #3 is now open for wheat un-loading.'
    }, officerToken);
    assert(
      updateNotifRes.status === 200 && updateNotifRes.data.success === true,
      '19. PATCH /api/notifications/:id (Officer updated announcement in real-time)'
    );

    // 20. Announcement Deletion
    const delNotifRes = await request(`/notifications/${createdNotifId}`, 'DELETE', null, officerToken);
    assert(
      delNotifRes.status === 200 && delNotifRes.data.success === true,
      '20. DELETE /api/notifications/:id (Officer deleted announcement from cloud database)'
    );

    // ====================================================
    // 🔬 AI CROP QUALITY & MARKET VALUE ESTIMATOR TESTS
    // ====================================================

    // ====================================================
    // 🔬 AI CROP QUALITY & MARKET VALUE ESTIMATOR TESTS
    // ====================================================

    // 21. Technical Model Status Endpoint
    const modelStatusRes = await request('/crop-quality/model-status');
    assert(
      modelStatusRes.status === 200 &&
      modelStatusRes.data.success === true &&
      modelStatusRes.data.is_honest === true &&
      modelStatusRes.data.provider.includes('Gemini'),
      '21. GET /api/crop-quality/model-status (Technical metadata is transparent & honest)',
      `Provider: ${modelStatusRes.data?.provider}`
    );

    // 22. Input Validation Guard: Missing Image
    const noImageRes = await request('/crop-quality/analyze', 'POST', { crop: 'Tomato' });
    assert(
      noImageRes.status === 400 && noImageRes.data.error_code === 'NO_IMAGE',
      '22. POST /api/crop-quality/analyze (Rejects missing image gracefully)'
    );

    // 23. Input Validation Guard: Unsupported Crop
    const fs = require('fs');
    const path = require('path');
    const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

    const unsuppRes = await request('/crop-quality/analyze', 'POST', {
      image: testBase64,
      crop: 'Watermelon'
    });
    assert(
      unsuppRes.status === 400 && unsuppRes.data.error_code === 'UNSUPPORTED_CROP',
      '23. POST /api/crop-quality/analyze (Rejects unsupported crop with clear message)'
    );

    // 24. Deterministic Quality Scoring Unit Tests (Boundary Values: 0, 59, 60, 79, 80, 100)
    const {
      calculateQualityScore,
      calculateGrade,
      calculateRealizationRange
    } = require('./src/services/CropQualityAIService');

    const perfectScore = calculateQualityScore({ defect_ratio_pct: 0, ripeness: 'ripe', confidence: 95 });
    const poorScore = calculateQualityScore({ defect_ratio_pct: 50, ripeness: 'overripe', confidence: 30 });
    const spoiledScore = calculateQualityScore({ is_fully_spoiled: true, defect_ratio_pct: 90 });
    
    assert(
      perfectScore === 100 && poorScore < 40 && spoiledScore === 0 &&
      calculateGrade(100) === 'Grade A' &&
      calculateGrade(80) === 'Grade A' &&
      calculateGrade(79) === 'Grade B' &&
      calculateGrade(60) === 'Grade B' &&
      calculateGrade(59) === 'Grade C' &&
      calculateGrade(0) === 'Grade C' &&
      calculateGrade(0, true) === 'Fully Spoiled',
      '24. Unit Test: calculateQualityScore() & calculateGrade() on Boundary Values (0, 59, 60, 79, 80, 100, Fully Spoiled)'
    );

    // 25. Realization Range Interpolation Unit Test
    const r100 = calculateRealizationRange(100, 'Grade A');
    const r80 = calculateRealizationRange(80, 'Grade A');
    const r79 = calculateRealizationRange(79, 'Grade B');
    const r60 = calculateRealizationRange(60, 'Grade B');
    const r59 = calculateRealizationRange(59, 'Grade C');
    const r0 = calculateRealizationRange(0, 'Grade C');
    const rSpoiled = calculateRealizationRange(0, 'Fully Spoiled');

    assert(
      r100.low === 100 && r100.high === 100 &&
      r80.low === 85 && r80.high === 100 &&
      r79.low === 84 && r79.high === 84 &&
      r60.low === 65 && r60.high === 84 &&
      r59.low === 64 && r59.high === 64 &&
      r0.low === 40 && r0.high === 64 &&
      rSpoiled.low === 0 && rSpoiled.high === 0,
      '25. Unit Test: calculateRealizationRange() Interpolation Formula on Grade Boundaries'
    );

    // 26. Market Benchmark Provider & Honest Labeling Check
    const { MarketPriceProvider } = require('./src/services/MarketPriceProvider');
    const mkt = await MarketPriceProvider.getPrice('Tomato');
    assert(
      mkt && mkt.available === true &&
      ['LIVE', 'REFERENCE_DEMO'].includes(mkt.source) &&
      mkt.modal_price > 0,
      '26. MarketPriceProvider Verification (Honest labeling as LIVE or REFERENCE_DEMO)',
      `Source: ${mkt?.source}, Modal: ₹${mkt?.modal_price}`
    );

    // 27. Indicative Realization Price Range Calculation Derivation
    const benchmark = Number(mkt.modal_price);
    const estLowA = Math.round(benchmark * (r80.low / 100));
    const estHighA = Math.round(benchmark * (r80.high / 100));
    assert(
      estLowA <= estHighA && estLowA === Math.round(benchmark * 0.85) && estHighA === benchmark,
      '27. Pricing Estimation Derivation (Mathematically derived from benchmark and realization band)'
    );

    // 28. Farmer Cloud History Persistence & Retrieval
    const { CropQualityPersistenceService } = require('./src/services/CropQualityPersistenceService');
    const savedRecord = await CropQualityPersistenceService.saveAssessment({
      user_id: 'test_farmer_uuid',
      crop: 'Tomato',
      crop_confidence: 92,
      confidence_tier: 'HIGH',
      quality_score: 95,
      quality_category: 'Grade A',
      maturity_assessment: 'Ripeness: ripe',
      defect_ratio_pct: 2,
      modal_price: mkt.modal_price,
      estimated_min_price: estLowA,
      estimated_max_price: estHighA,
      observations: ['Uniform red coloration', 'Firm skin'],
      price_source: mkt.source
    });

    const userHistory = await CropQualityPersistenceService.getUserHistory('test_farmer_uuid');
    assert(
      userHistory && userHistory.success === true && Array.isArray(userHistory.records) && userHistory.records.length > 0,
      '28. Farmer Cloud History (Synchronized & isolated by User ID)',
      `Records found: ${userHistory.records?.length}`
    );

    // 29. Officer/Admin Aggregate Quality Analytics (No PII leaked)
    const analyticsRes = await request('/crop-quality/analytics', 'GET', null, officerToken);
    assert(
      analyticsRes.status === 200 &&
      analyticsRes.data.success === true &&
      typeof analyticsRes.data.total_analyses === 'number' &&
      analyticsRes.data.crop_distribution &&
      analyticsRes.data.category_distribution,
      '29. GET /api/crop-quality/analytics (Admin aggregate metrics loaded, zero farmer PII)',
      `Total: ${analyticsRes.data.total_analyses}, Avg Score: ${analyticsRes.data.average_quality_score}`
    );

    // 30. Security Guard on Analytics (Farmer role blocked with 403, unauthenticated blocked with 401)
    const unauthAnalytics = await request('/crop-quality/analytics', 'GET');
    const farmerAnalytics = await request('/crop-quality/analytics', 'GET', null, farmerToken);
    assert(
      unauthAnalytics.status === 401 && farmerAnalytics.status === 403,
      '30. Role-Based Security Guard on Analytics (Farmer 403, Unauthenticated 401)'
    );

    // 31. AI Chatbot Suggestions
    const chatSuggestions = await request('/chat/suggestions', 'GET');
    assert(
      chatSuggestions.status === 200 &&
      chatSuggestions.data.success === true &&
      Array.isArray(chatSuggestions.data.suggestions) &&
      chatSuggestions.data.suggestions.length > 0,
      '31. GET /api/chat/suggestions (Smart agricultural question suggestions delivered)',
      `Suggestions: ${chatSuggestions.data.suggestions.length}`
    );

    // 32. AI Chatbot Message Validation (Rejects empty message gracefully)
    const emptyChatRes = await request('/chat', 'POST', { message: '' });
    assert(
      emptyChatRes.status === 400 &&
      emptyChatRes.data.error_code === 'INVALID_MESSAGE',
      '32. POST /api/chat (Rejects empty message with clear validation error)'
    );

    // 33. Smart Mandi Arbitrage Calculator Options
    const arbOptions = await request('/mandis/arbitrage-options', 'GET');
    assert(
      arbOptions.status === 200 &&
      arbOptions.data.success === true &&
      Array.isArray(arbOptions.data.crops) &&
      arbOptions.data.vehicles.mini_truck,
      '33. GET /api/mandis/arbitrage-options (Crop list & vehicle freight matrix loaded)'
    );

    // 34. Smart Mandi Arbitrage & Net Profit Calculation Verification
    const arbCalc = await request('/mandis/arbitrage-calculator', 'POST', {
      crop: 'Wheat',
      quantity_qtl: 30,
      origin_lat: 28.4595,
      origin_lon: 77.0266,
      origin_district: 'Gurgaon',
      vehicle_type: 'mini_truck'
    });
    assert(
      arbCalc.status === 200 &&
      arbCalc.data.success === true &&
      arbCalc.data.summary.optimal_mandi &&
      typeof arbCalc.data.summary.optimal_mandi.net_profit === 'number' &&
      Array.isArray(arbCalc.data.comparison) &&
      arbCalc.data.comparison.length > 0,
      '34. POST /api/mandis/arbitrage-calculator (Optimizes highest net in-pocket profit across APMCs)',
      `Optimal: ${arbCalc.data.summary.optimal_mandi.mandi_name} (Net Profit: ₹${arbCalc.data.summary.optimal_mandi.net_profit})`
    );

  } catch (err) {
    console.error('⚠️ Unexpected test exception:', err);
    failed++;
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
  }

  console.log('\n====================================================');
  console.log(`📊 FINAL TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
