const supabase = require('../config/supabase');

const MANDIS_LIST = [
  { name: "Lucknow Mandi", state: "Uttar Pradesh", crop: "Wheat", lat: 26.8467, lon: 80.9462 },
  { name: "Kanpur Mandi", state: "Uttar Pradesh", crop: "Wheat", lat: 26.4499, lon: 80.3319 },
  { name: "Varanasi Mandi", state: "Uttar Pradesh", crop: "Paddy", lat: 25.3176, lon: 82.9739 },
  { name: "Meerut Mandi", state: "Uttar Pradesh", crop: "Sugarcane", lat: 28.9845, lon: 77.7064 },
  { name: "Agra Mandi", state: "Uttar Pradesh", crop: "Potato", lat: 27.1767, lon: 78.0081 },
  { name: "Patna Mandi", state: "Bihar", crop: "Paddy", lat: 25.5941, lon: 85.1376 },
  { name: "Muzaffarpur Mandi", state: "Bihar", crop: "Litchi", lat: 26.1209, lon: 85.3647 },
  { name: "Jaipur Mandi", state: "Rajasthan", crop: "Mustard", lat: 26.9124, lon: 75.7873 },
  { name: "Kota Mandi", state: "Rajasthan", crop: "Soybean", lat: 25.2138, lon: 75.8648 },
  { name: "Bhopal Mandi", state: "Madhya Pradesh", crop: "Gram", lat: 23.2599, lon: 77.4126 },
  { name: "Indore Mandi", state: "Madhya Pradesh", crop: "Soybean", lat: 22.7196, lon: 75.8577 },
  { name: "Chandigarh Mandi", state: "Chandigarh", crop: "Maize", lat: 30.7333, lon: 76.7794 },
  { name: "Ludhiana Mandi", state: "Punjab", crop: "Wheat", lat: 30.9010, lon: 75.8573 },
  { name: "Amritsar Mandi", state: "Punjab", crop: "Wheat", lat: 31.6340, lon: 74.8723 },
  { name: "Karnal Mandi", state: "Haryana", crop: "Paddy", lat: 29.6857, lon: 76.9905 },
  { name: "Hisar Mandi", state: "Haryana", crop: "Cotton", lat: 29.1492, lon: 75.7217 },
  { name: "Delhi Azadpur Mandi", state: "Delhi", crop: "Vegetables", lat: 28.6989, lon: 77.1546 },
  { name: "Guntur Mandi", state: "Andhra Pradesh", crop: "Chilli", lat: 16.3067, lon: 80.4365 },
  { name: "Vijayawada Mandi", state: "Andhra Pradesh", crop: "Paddy", lat: 16.5062, lon: 80.6480 },
  { name: "Hyderabad Mandi", state: "Telangana", crop: "Vegetables", lat: 17.4630, lon: 78.4827 },
  { name: "Warangal Mandi", state: "Telangana", crop: "Cotton", lat: 17.9689, lon: 79.5941 },
  { name: "Bengaluru Mandi", state: "Karnataka", crop: "Ragi", lat: 12.9716, lon: 77.5946 },
  { name: "Erode Mandi", state: "Tamil Nadu", crop: "Turmeric", lat: 11.3410, lon: 77.7172 },
  { name: "Coimbatore Mandi", state: "Tamil Nadu", crop: "Coconut", lat: 11.0168, lon: 76.9558 },
  { name: "Ernakulam Mandi", state: "Kerala", crop: "Rice", lat: 9.9312, lon: 76.2673 }
];

const MSP_RATES = {
  "Wheat": { msp: 2425, season: "Rabi 2024-25" },
  "Paddy": { msp: 2300, season: "Kharif 2024-25" },
  "Mustard": { msp: 5950, season: "Rabi 2024-25" },
  "Gram": { msp: 5650, season: "Rabi 2024-25" },
  "Maize": { msp: 2225, season: "Kharif 2024-25" },
  "Cotton": { msp: 7121, season: "Kharif 2024-25" },
  "Soybean": { msp: 4892, season: "Kharif 2024-25" },
  "Groundnut": { msp: 6783, season: "Kharif 2024-25" }
};

const SAMPLE_MARKET_PRICES = {
  "Wheat": [
    { mandi: "Lucknow Mandi", district: "Lucknow", state: "Uttar Pradesh", min: 2380, max: 2540, modal: 2460 },
    { mandi: "Kanpur Mandi", district: "Kanpur", state: "Uttar Pradesh", min: 2400, max: 2520, modal: 2450 },
    { mandi: "Ludhiana Mandi", district: "Ludhiana", state: "Punjab", min: 2425, max: 2600, modal: 2490 },
    { mandi: "Karnal Mandi", district: "Karnal", state: "Haryana", min: 2425, max: 2580, modal: 2480 }
  ],
  "Paddy": [
    { mandi: "Patna Mandi", district: "Patna", state: "Bihar", min: 2250, max: 2400, modal: 2320 },
    { mandi: "Varanasi Mandi", district: "Varanasi", state: "Uttar Pradesh", min: 2280, max: 2390, modal: 2340 },
    { mandi: "Vijayawada Mandi", district: "Krishna", state: "Andhra Pradesh", min: 2300, max: 2450, modal: 2370 }
  ],
  "Mustard": [
    { mandi: "Jaipur Mandi", district: "Jaipur", state: "Rajasthan", min: 5800, max: 6250, modal: 6050 },
    { mandi: "Kota Mandi", district: "Kota", state: "Rajasthan", min: 5750, max: 6180, modal: 5980 }
  ],
  "Gram": [
    { mandi: "Bhopal Mandi", district: "Bhopal", state: "Madhya Pradesh", min: 5500, max: 5900, modal: 5720 },
    { mandi: "Indore Mandi", district: "Indore", state: "Madhya Pradesh", min: 5550, max: 5950, modal: 5760 }
  ],
  "Maize": [
    { mandi: "Chandigarh Mandi", district: "Chandigarh", state: "Chandigarh", min: 2180, max: 2350, modal: 2270 },
    { mandi: "Davangere Mandi", district: "Davangere", state: "Karnataka", min: 2150, max: 2310, modal: 2240 }
  ]
};

// GET ALL MANDIS
exports.getMandis = async (req, res, next) => {
  try {
    return res.json({ success: true, count: MANDIS_LIST.length, mandis: MANDIS_LIST });
  } catch (err) {
    next(err);
  }
};

// GET MARKET PRICES BY CROP
exports.getPrices = async (req, res, next) => {
  try {
    const crop = req.query.crop || 'Wheat';
    const mspInfo = MSP_RATES[crop] || { msp: null, season: "N/A" };
    const prices = SAMPLE_MARKET_PRICES[crop] || [
      { mandi: `${crop} Mandi A`, district: "Central", state: "National", min: 2200, max: 2500, modal: 2350 }
    ];

    return res.json({
      success: true,
      crop,
      msp: mspInfo.msp,
      season: mspInfo.season,
      count: prices.length,
      records: prices
    });
  } catch (err) {
    next(err);
  }
};
