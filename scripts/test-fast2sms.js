const https = require('https');
require('dotenv').config();

const apiKey = process.env.FAST2SMS_API_KEY;
console.log('Testing Fast2SMS API with key prefix:', apiKey.slice(0, 8) + '...');

// Check account / wallet details or test sending
const options = {
  hostname: 'www.fast2sms.com',
  port: 443,
  path: '/dev/wallet',
  method: 'POST',
  headers: {
    'authorization': apiKey
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Fast2SMS Wallet / Key Verification Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
