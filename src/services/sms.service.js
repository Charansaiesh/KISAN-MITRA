const https = require('https');
require('dotenv').config();

/**
 * KisanMitra Fast2SMS Service
 * Complies with strict security rules:
 * - FAST2SMS_API_KEY read exclusively from environment variables.
 * - API key is never logged or exposed.
 * - Standardized SMS messages matching exact queue & approval events.
 */

class SMSService {
  constructor() {
    // Loaded strictly from process.env at runtime
  }

  getApiKey() {
    return process.env.FAST2SMS_API_KEY || '';
  }

  /**
   * Dispatch raw SMS via Fast2SMS
   */
  async sendSMS(phone, message) {
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return {
        success: false,
        status: 'failed',
        phone: cleanPhone,
        message: 'Invalid 10-digit mobile number'
      };
    }

    const apiKey = this.getApiKey();

    console.log(`[Fast2SMS Dispatcher] Sending SMS to +91 ${cleanPhone}: "${message}"`);

    if (!apiKey) {
      console.warn('[Fast2SMS Dispatcher] FAST2SMS_API_KEY not configured in environment.');
      return {
        success: false,
        status: 'failed',
        phone: cleanPhone,
        message: 'FAST2SMS_API_KEY environment variable not set'
      };
    }

    try {
      const result = await this._sendViaFast2SMS(cleanPhone, message, apiKey);
      if (result && result.return === true) {
        console.log(`✅ [Fast2SMS Success] Delivered to +91 ${cleanPhone}`);
        return {
          success: true,
          status: 'sent',
          gateway: 'Fast2SMS Live',
          phone: cleanPhone,
          message: 'SMS sent successfully',
          result
        };
      } else {
        const errorMsg = (result && result.message) ? result.message : 'Fast2SMS dispatch failed';
        console.warn(`⚠️ [Fast2SMS Status]:`, errorMsg);
        return {
          success: false,
          status: 'failed',
          gateway: 'Fast2SMS',
          phone: cleanPhone,
          message: errorMsg,
          reason: errorMsg,
          result
        };
      }
    } catch (err) {
      console.error(`⚠️ [Fast2SMS Network Error]:`, err.message);
      return {
        success: false,
        status: 'failed',
        gateway: 'Fast2SMS',
        phone: cleanPhone,
        message: err.message,
        reason: err.message
      };
    }
  }

  /**
   * 1. Initial Token Issuance SMS
   */
  async sendInitialTokenSMS({ token, phone, position }) {
    const pos = position || 1;
    const message = `KisanMitra: Your token is ${token}. Your current queue position is #${pos}. We will notify you about further updates.`;
    return await this.sendSMS(phone, message);
  }

  /**
   * 2 & 3. Queue Position Update SMS
   */
  async sendQueueUpdateSMS({ token, phone, position }) {
    let message = '';
    if (position === 1) {
      message = `KisanMitra: Your token ${token} is now #1. You are next in line. Please be ready.`;
    } else {
      message = `KisanMitra: Your token ${token} is now #${position} in the queue.`;
    }
    return await this.sendSMS(phone, message);
  }

  /**
   * 4. Level 1 Approved SMS
   */
  async sendLevel1ApprovedSMS({ token, phone }) {
    const message = `KisanMitra: Your token ${token} has been Level 1 Approved.`;
    return await this.sendSMS(phone, message);
  }

  _sendViaFast2SMS(phone, message, apiKey) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: phone
      });

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
          try { resolve(JSON.parse(data)); }
          catch (e) { resolve({ return: false, message: data }); }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }
}

module.exports = new SMSService();
