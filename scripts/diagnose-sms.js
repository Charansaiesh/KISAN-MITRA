const https = require('https');
require('dotenv').config();

const apiKey = process.env.FAST2SMS_API_KEY;
const testPhone = '9876543210'; // Test phone

function sendRoute(routeType, payload) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(payload);
    const options = {
      hostname: 'www.fast2sms.com',
      port: 443,
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, raw: data }); }
      });
    });

    req.on('error', (e) => resolve({ error: e.message }));
    req.write(postData);
    req.end();
  });
}

async function testAll() {
  console.log('🧪 Diagnosing Fast2SMS Route 1: route "q" (Quick)...');
  const resQ = await sendRoute('q', {
    route: 'q',
    message: 'KisanMitra: Hello Farmer! Your procurement token KM20251008 is confirmed. -VM-KISANMT',
    language: 'english',
    flash: 0,
    numbers: testPhone
  });
  console.log('Result route "q":', JSON.stringify(resQ));

  console.log('\n🧪 Diagnosing Fast2SMS Route 2: route "otp"...');
  const resOTP = await sendRoute('otp', {
    route: 'otp',
    variables_values: 'KM20251008',
    numbers: testPhone
  });
  console.log('Result route "otp":', JSON.stringify(resOTP));

  console.log('\n🧪 Diagnosing Fast2SMS Route 3: route "v3"...');
  const resV3 = await sendRoute('v3', {
    route: 'v3',
    sender_id: 'TXTIND',
    message: 'KisanMitra: Hello Farmer! Your token is KM20251008.',
    language: 'english',
    flash: 0,
    numbers: testPhone
  });
  console.log('Result route "v3":', JSON.stringify(resV3));
}

testAll();
