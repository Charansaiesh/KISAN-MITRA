/**
 * Centralized Minimum Support Price (MSP) Configuration
 * Official rates recommended by CACP & approved by CCEA, Ministry of Agriculture.
 */

const fs = require('fs');
const path = require('path');

const mspFilePath = path.join(__dirname, '..', '..', 'data', 'msp_rates.json');
let MSP_RATES = {};

try {
  MSP_RATES = JSON.parse(fs.readFileSync(mspFilePath, 'utf8'));
} catch (err) {
  console.error("Failed to load msp_rates.json, using fallback configuration:", err.message);
  MSP_RATES = {
    "Wheat": { crop: "Wheat", msp: 2425, season: "Rabi 2026-27", source: "CACP", verified: true },
    "Paddy": { crop: "Paddy", msp: 2300, season: "Kharif 2026-27", source: "CACP", verified: true },
    "Mustard": { crop: "Mustard", msp: 5950, season: "Rabi 2026-27", source: "CACP", verified: true },
    "Gram": { crop: "Gram", msp: 5650, season: "Rabi 2026-27", source: "CACP", verified: true },
    "Maize": { crop: "Maize", msp: 2225, season: "Kharif 2026-27", source: "CACP", verified: true },
    "Cotton": { crop: "Cotton", msp: 7121, season: "Kharif 2026-27", source: "CACP", verified: true },
    "Soybean": { crop: "Soybean", msp: 4892, season: "Kharif 2026-27", source: "CACP", verified: true },
    "Groundnut": { crop: "Groundnut", msp: 6783, season: "Kharif 2026-27", source: "CACP", verified: true }
  };
}

function getMSP(crop) {
  if (!crop) return null;
  const normalized = Object.keys(MSP_RATES).find(
    k => k.toLowerCase() === String(crop).trim().toLowerCase()
  );
  return normalized ? MSP_RATES[normalized] : null;
}

module.exports = {
  MSP_RATES,
  getMSP
};
