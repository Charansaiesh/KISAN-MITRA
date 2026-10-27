/**
 * KisanMitra Gemini API Key Manager & Rate Limiting Guard
 * Handles:
 * 1. Multi-key pool rotation (GEMINI_API_KEYS comma-separated or single GEMINI_API_KEY).
 * 2. 10-minute cooldown on HTTP 429 quota exhaustion.
 * 3. Zero retries on 429 per-day quota limits to conserve bandwidth and prevent latency spikes.
 */

const COOLDOWN_DURATION_MS = 10 * 60 * 1000; // 10 minutes

class GeminiKeyManager {
  static keyCooldowns = new Map(); // key -> timestamp ms until cooldown expires
  static globalCooldownUntil = 0;
  static currentKeyIndex = 0;

  /**
   * Parse keys from environment
   * Supports GEMINI_API_KEYS="key1,key2,key3" or fallback to GEMINI_API_KEY
   */
  static getAllKeys() {
    const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const keys = rawKeys
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0 && !k.startsWith("AIzaSyFake") && !k.includes("placeholder"));
    return keys;
  }

  /**
   * Checks if all keys are currently under 10-minute cooldown
   */
  static isCooldownActive() {
    const now = Date.now();
    if (this.globalCooldownUntil > now) {
      return true;
    }
    const keys = this.getAllKeys();
    if (keys.length === 0) return false;

    // Check if every key is on cooldown
    const allOnCooldown = keys.every(k => (this.keyCooldowns.get(k) || 0) > now);
    if (allOnCooldown) {
      // Find maximum expiry among keys
      let maxExpiry = now + COOLDOWN_DURATION_MS;
      for (const k of keys) {
        const exp = this.keyCooldowns.get(k) || 0;
        if (exp > maxExpiry) maxExpiry = exp;
      }
      this.globalCooldownUntil = maxExpiry;
      return true;
    }

    return false;
  }

  static getRemainingCooldownMs() {
    const now = Date.now();
    if (this.globalCooldownUntil > now) {
      return this.globalCooldownUntil - now;
    }
    const keys = this.getAllKeys();
    let minRemaining = 0;
    for (const k of keys) {
      const exp = this.keyCooldowns.get(k) || 0;
      if (exp > now) {
        const rem = exp - now;
        if (minRemaining === 0 || rem < minRemaining) minRemaining = rem;
      }
    }
    return minRemaining;
  }

  /**
   * Selects next available key not under cooldown
   */
  static getNextAvailableKey() {
    const keys = this.getAllKeys();
    if (keys.length === 0) return null;
    const now = Date.now();

    for (let i = 0; i < keys.length; i++) {
      const idx = (this.currentKeyIndex + i) % keys.length;
      const key = keys[idx];
      const cooldownUntil = this.keyCooldowns.get(key) || 0;
      if (cooldownUntil <= now) {
        this.currentKeyIndex = (idx + 1) % keys.length;
        return key;
      }
    }

    // All keys on cooldown
    this.globalCooldownUntil = now + COOLDOWN_DURATION_MS;
    return null;
  }

  /**
   * Mark a key as 429 quota exhausted -> 10-minute cooldown
   */
  static markKey429(key) {
    if (!key) return;
    const now = Date.now();
    const expiry = now + COOLDOWN_DURATION_MS;
    this.keyCooldowns.set(key, expiry);

    // Check if all keys are exhausted
    const keys = this.getAllKeys();
    const allExhausted = keys.every(k => (this.keyCooldowns.get(k) || 0) > now);
    if (allExhausted) {
      this.globalCooldownUntil = expiry;
    }
  }

  /**
   * Reset cooldown on success
   */
  static markKeySuccess(key) {
    if (key && this.keyCooldowns.has(key)) {
      this.keyCooldowns.delete(key);
    }
    this.globalCooldownUntil = 0;
  }

  /**
   * Clear cooldowns for testing
   */
  static resetCooldowns() {
    this.keyCooldowns.clear();
    this.globalCooldownUntil = 0;
    this.currentKeyIndex = 0;
  }
}

module.exports = { GeminiKeyManager, COOLDOWN_DURATION_MS };
