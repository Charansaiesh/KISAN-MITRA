require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { AIChatService } = require('../src/services/AIChatService');
const { CropQualityAIService } = require('../src/services/CropQualityAIService');
const { GeminiKeyManager } = require('../src/services/GeminiKeyManager');

async function runTests() {
  console.log('====================================================');
  console.log('🌾 AI LANGUAGE TESTS (ENGLISH & HINDI)');
  console.log('====================================================');

  const keys = GeminiKeyManager.getAllKeys();
  console.log(`Active Gemini Keys in Pool: ${keys.length}`);
  console.log(`Cooldown Active: ${GeminiKeyManager.isCooldownActive()}`);

  const results = [];

  // Helper for Chat testing
  async function testChat(label, lang, question) {
    console.log(`\n--- [CHAT] ${label} (lang: ${lang}) ---`);
    console.log(`Question: "${question}"`);
    const t0 = Date.now();
    try {
      const res = await AIChatService.chat([], question, { language: lang });
      const latencyMs = Date.now() - t0;
      const source = res.source || (res.is_fallback ? 'fallback' : 'gemini');
      const text = res.reply || res.message || '';
      const preview = text.substring(0, 100).replace(/\r?\n/g, ' ');
      
      const record = {
        type: 'chat',
        label,
        lang,
        source,
        latencyMs,
        preview,
        cooldown: res.failure_reason || null
      };
      results.push(record);

      console.log(`Source:    ${source}`);
      console.log(`Latency:   ${latencyMs} ms`);
      console.log(`Preview:   "${preview}..."`);
      if (res.failure_reason) {
        console.log(`Notice:    ${res.failure_reason}`);
      }
    } catch (err) {
      const latencyMs = Date.now() - t0;
      console.log(`Error:     ${err.message}`);
      console.log(`Latency:   ${latencyMs} ms`);
      const is429 = err.message && err.message.includes('429');
      results.push({
        type: 'chat',
        label,
        lang,
        source: 'error',
        latencyMs,
        preview: is429 ? '429 Quota Exceeded (No retry)' : err.message.substring(0, 100),
        is429
      });
    }
  }

  // Helper for Crop Quality testing
  async function testCrop(label, lang, imagePath, crop) {
    console.log(`\n--- [CROP QUALITY] ${label} (lang: ${lang}) ---`);
    const t0 = Date.now();
    try {
      const imgBuffer = fs.readFileSync(imagePath);
      const res = await CropQualityAIService.analyze(imgBuffer, crop, 'image/jpeg', lang);
      const latencyMs = Date.now() - t0;
      const source = res.source || (res.success ? 'gemini' : 'fallback');
      
      let preview = '';
      if (res.success) {
        preview = `[Grade: ${res.quality_category}, Score: ${res.quality_score}] ${res.grade_explanation || ''} ${res.shelf_life || ''}`;
      } else {
        preview = res.message || res.failure_reason || 'Unknown error';
      }
      preview = preview.substring(0, 100).replace(/\r?\n/g, ' ');

      const record = {
        type: 'crop',
        label,
        lang,
        source,
        latencyMs,
        preview,
        cooldown: res.failure_reason || null
      };
      results.push(record);

      console.log(`Source:    ${source}`);
      console.log(`Latency:   ${latencyMs} ms`);
      console.log(`Preview:   "${preview}..."`);
      if (res.failure_reason) {
        console.log(`Notice:    ${res.failure_reason}`);
      }
    } catch (err) {
      const latencyMs = Date.now() - t0;
      console.log(`Error:     ${err.message}`);
      console.log(`Latency:   ${latencyMs} ms`);
      const is429 = err.message && err.message.includes('429');
      results.push({
        type: 'crop',
        label,
        lang,
        source: 'error',
        latencyMs,
        preview: is429 ? '429 Quota Exceeded (No retry)' : err.message.substring(0, 100),
        is429
      });
    }
  }

  // 1. English Chat 1
  await testChat('Chat EN 1 (Fertilizer)', 'en', 'What is the fertilizer schedule for wheat crop?');

  // 2. English Chat 2
  await testChat('Chat EN 2 (Pest Control)', 'en', 'How can I protect my tomato crop from pests?');

  // 3. Hindi Chat 1
  await testChat('Chat HI 1 (Fertilizer)', 'hi', 'गेहूं की फसल के लिए यूरिया और डीएपी कब और कितना डालें?');

  // 4. Hindi Chat 2
  await testChat('Chat HI 2 (Pest Control)', 'hi', 'टमाटर की फसल में कीटों और पत्ती मरोड़ रोग की रोकथाम कैसे करें?');

  // 5. Crop Quality English
  const sampleImg = path.join(__dirname, '..', 'ml', 'test_assets', 'test_tomato.jpg');
  await testCrop('Crop Analysis EN (Tomato)', 'en', sampleImg, 'Tomato');

  // 6. Crop Quality Hindi
  await testCrop('Crop Analysis HI (Tomato)', 'hi', sampleImg, 'Tomato');

  console.log('\n====================================================');
  console.log('📊 SUMMARY TABLE:');
  console.log('====================================================');
  console.table(results.map(r => ({
    Label: r.label,
    Language: r.lang,
    Source: r.source,
    'Latency (ms)': r.latencyMs,
    'Output Preview (100 chars)': r.preview
  })));
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
