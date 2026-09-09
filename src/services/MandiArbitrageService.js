/**
 * KisanMitra Smart Mandi Arbitrage & Net-Profit Optimization Engine
 * Calculates net in-pocket farmer earnings across candidate APMC mandis after transport, fuel, and handling costs.
 */

const VEHICLE_SPECS = {
  tractor: {
    name: "Tractor Trolley",
    emoji: "🚜",
    rate_per_km: 26,
    max_capacity_qtl: 45,
    avg_speed_kmh: 30
  },
  mini_truck: {
    name: "Pickup / Mini Truck (Bolero/Ace)",
    emoji: "🚚",
    rate_per_km: 18,
    max_capacity_qtl: 25,
    avg_speed_kmh: 45
  },
  heavy_truck: {
    name: "Heavy Truck (6/10 Wheeler)",
    emoji: "🚛",
    rate_per_km: 36,
    max_capacity_qtl: 120,
    avg_speed_kmh: 40
  },
  auto: {
    name: "Small Auto Carrier",
    emoji: "🛺",
    rate_per_km: 12,
    max_capacity_qtl: 12,
    avg_speed_kmh: 35
  }
};

const MANDI_DIRECTORY = [
  // North Zone
  { id: "delhi_azadpur", name: "Azadpur APMC Mandi", district: "North Delhi", state: "Delhi", lat: 28.7078, lon: 77.1772 },
  { id: "delhi_gazipur", name: "Gazipur Flower & Veg Mandi", district: "East Delhi", state: "Delhi", lat: 28.6256, lon: 77.3292 },
  { id: "haryana_karnal", name: "Karnal Grain Market", district: "Karnal", state: "Haryana", lat: 29.6857, lon: 76.9905 },
  { id: "haryana_hisar", name: "Hisar Cotton Market", district: "Hisar", state: "Haryana", lat: 29.1492, lon: 75.7217 },
  { id: "haryana_gurgaon", name: "Gurugram Khandsa Mandi", district: "Gurugram", state: "Haryana", lat: 28.4350, lon: 77.0125 },
  { id: "punjab_ludhiana", name: "Ludhiana APMC Mandi", district: "Ludhiana", state: "Punjab", lat: 30.9010, lon: 75.8573 },
  { id: "punjab_amritsar", name: "Amritsar Bhagtanwala Mandi", district: "Amritsar", state: "Punjab", lat: 31.6340, lon: 74.8723 },
  { id: "up_lucknow", name: "Lucknow Naveen Galla Mandi", district: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462 },
  { id: "up_kanpur", name: "Kanpur Collectorganj Mandi", district: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lon: 80.3319 },
  { id: "up_agra", name: "Agra Khandari Mandi", district: "Agra", state: "Uttar Pradesh", lat: 27.1767, lon: 78.0081 },
  { id: "up_varanasi", name: "Varanasi Chandpur Mandi", district: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lon: 82.9739 },
  { id: "up_meerut", name: "Meerut Delhigate Mandi", district: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lon: 77.7064 },
  
  // West & Central Zone
  { id: "mah_vashi", name: "Mumbai APMC Vashi", district: "Navi Mumbai", state: "Maharashtra", lat: 19.0760, lon: 72.9995 },
  { id: "mah_lasalgaon", name: "Lasalgaon APMC Mandi", district: "Nashik", state: "Maharashtra", lat: 20.1472, lon: 74.2268 },
  { id: "mah_pune", name: "Pune Gultekdi Market Yard", district: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567 },
  { id: "mah_jalgaon", name: "Jalgaon Banana Mandi", district: "Jalgaon", state: "Maharashtra", lat: 21.0077, lon: 75.5626 },
  { id: "mah_nagpur", name: "Nagpur Kalamna Market", district: "Nagpur", state: "Maharashtra", lat: 21.1458, lon: 79.0882 },
  { id: "raj_jaipur", name: "Jaipur Muhana Mandi", district: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873 },
  { id: "raj_kota", name: "Kota Bhamashah Mandi", district: "Kota", state: "Rajasthan", lat: 25.2138, lon: 75.8648 },
  { id: "mp_indore", name: "Indore Choithram Mandi", district: "Indore", state: "Madhya Pradesh", lat: 22.7196, lon: 75.8577 },
  { id: "mp_bhopal", name: "Bhopal Karond Mandi", district: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126 },
  { id: "mp_ujjain", name: "Ujjain Chimanganj Mandi", district: "Ujjain", state: "Madhya Pradesh", lat: 23.1765, lon: 75.7885 },
  { id: "guj_ahmedabad", name: "Ahmedabad Jamalpur APMC", district: "Ahmedabad", state: "Gujarat", lat: 23.0125, lon: 72.5815 },
  { id: "guj_surat", name: "Surat Sardar Market Yard", district: "Surat", state: "Gujarat", lat: 21.1702, lon: 72.8311 },
  { id: "guj_rajkot", name: "Rajkot Bedi Yard APMC", district: "Rajkot", state: "Gujarat", lat: 22.3039, lon: 70.8022 },

  // South Zone
  { id: "tg_hyderabad", name: "Hyderabad Bowenpally Mandi", district: "Hyderabad", state: "Telangana", lat: 17.4630, lon: 78.4827 },
  { id: "tg_gudimalkapur", name: "Hyderabad Gudimalkapur Mandi", district: "Hyderabad", state: "Telangana", lat: 17.3820, lon: 78.4350 },
  { id: "tg_warangal", name: "Warangal Enumamula Mandi", district: "Warangal", state: "Telangana", lat: 17.9689, lon: 79.5941 },
  { id: "tg_khammam", name: "Khammam Chilli Yard", district: "Khammam", state: "Telangana", lat: 17.2473, lon: 80.1514 },
  { id: "ap_guntur", name: "Guntur Mirchi Yard", district: "Guntur", state: "Andhra Pradesh", lat: 16.3067, lon: 80.4365 },
  { id: "ap_vijayawada", name: "Vijayawada Gollapudi Market", district: "Krishna", state: "Andhra Pradesh", lat: 16.5062, lon: 80.6480 },
  { id: "ap_vizag", name: "Visakhapatnam Gajuwaka Mandi", district: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185 },
  { id: "kar_bengaluru", name: "Bengaluru Yeshwanthpur Mandi", district: "Bengaluru", state: "Karnataka", lat: 12.9716, lon: 77.5946 },
  { id: "kar_kolar", name: "Kolar APMC Market", district: "Kolar", state: "Karnataka", lat: 13.1367, lon: 78.1291 },
  { id: "kar_mysuru", name: "Mysuru Bandipalya APMC Yard", district: "Mysuru", state: "Karnataka", lat: 12.2858, lon: 76.6635 },
  { id: "kar_hubli", name: "Hubballi APMC Amargol", district: "Dharwad", state: "Karnataka", lat: 15.3647, lon: 75.1240 },
  { id: "kar_davangere", name: "Davangere APMC Yard", district: "Davangere", state: "Karnataka", lat: 14.4644, lon: 75.9218 },
  { id: "tn_chennai", name: "Chennai Koyambedu Wholesale", district: "Chennai", state: "Tamil Nadu", lat: 13.0694, lon: 80.1948 },
  { id: "tn_erode", name: "Erode Turmeric Market", district: "Erode", state: "Tamil Nadu", lat: 11.3410, lon: 77.7172 },
  { id: "tn_coimbatore", name: "Coimbatore MGR Market", district: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lon: 76.9558 },
  { id: "tn_madurai", name: "Madurai Mattuthavani Mandi", district: "Madurai", state: "Tamil Nadu", lat: 9.9482, lon: 78.1568 },
  { id: "ker_ernakulam", name: "Ernakulam Market", district: "Ernakulam", state: "Kerala", lat: 9.9816, lon: 76.2799 },

  // East Zone
  { id: "bih_patna", name: "Patna Bazar Samiti Mandi", district: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376 },
  { id: "wb_kolkata", name: "Kolkata Posta & Koley Market", district: "Kolkata", state: "West Bengal", lat: 22.5855, lon: 88.3582 },
  { id: "jh_ranchi", name: "Ranchi Pandra Samiti Mandi", district: "Ranchi", state: "Jharkhand", lat: 23.3700, lon: 85.3000 },
  { id: "od_bhubaneswar", name: "Bhubaneswar Aiginia Mandi", district: "Khordha", state: "Odisha", lat: 20.2588, lon: 85.7830 }
];

const CROP_PRICE_MATRIX = {
  Wheat: {
    base_modal: 2450,
    msp: 2425,
    variations: {
      delhi_azadpur: 2560,
      delhi_gazipur: 2540,
      haryana_gurgaon: 2520,
      haryana_karnal: 2510,
      punjab_ludhiana: 2490,
      up_lucknow: 2460,
      up_kanpur: 2440,
      mp_indore: 2480,
      raj_jaipur: 2520,
      guj_ahmedabad: 2500,
      wb_kolkata: 2580,
      bih_patna: 2420
    }
  },
  Tomato: {
    base_modal: 2200,
    msp: null,
    variations: {
      delhi_azadpur: 2750,
      delhi_gazipur: 2710,
      haryana_gurgaon: 2680,
      kar_kolar: 2150,
      kar_bengaluru: 2450,
      kar_mysuru: 2400,
      tg_hyderabad: 2380,
      tg_gudimalkapur: 2390,
      mah_pune: 2500,
      mah_vashi: 2650,
      up_lucknow: 2280,
      mp_indore: 2320,
      tn_chennai: 2580,
      tn_coimbatore: 2350,
      ap_vijayawada: 2310,
      wb_kolkata: 2620
    }
  },
  Onion: {
    base_modal: 1950,
    msp: null,
    variations: {
      mah_lasalgaon: 1920,
      mah_vashi: 2250,
      delhi_azadpur: 2420,
      delhi_gazipur: 2390,
      mah_pune: 2180,
      raj_jaipur: 2250,
      tg_hyderabad: 2300,
      kar_bengaluru: 2340,
      tn_chennai: 2400,
      wb_kolkata: 2480,
      mp_indore: 2050
    }
  },
  Potato: {
    base_modal: 1500,
    msp: null,
    variations: {
      up_agra: 1480,
      delhi_azadpur: 1820,
      up_kanpur: 1540,
      up_lucknow: 1580,
      raj_jaipur: 1690,
      mp_indore: 1620
    }
  },
  Chilli: {
    base_modal: 14200,
    msp: null,
    variations: {
      ap_guntur: 14800,
      tg_warangal: 14350,
      tg_hyderabad: 14950,
      delhi_azadpur: 16200,
      mah_nagpur: 14600,
      kar_bengaluru: 15100
    }
  },
  Rice: {
    base_modal: 2350,
    msp: 2300,
    variations: {
      haryana_karnal: 2540,
      ap_vijayawada: 2380,
      up_varanasi: 2340,
      tg_warangal: 2390,
      punjab_ludhiana: 2480
    }
  },
  Cotton: {
    base_modal: 7250,
    msp: 7121,
    variations: {
      tg_warangal: 7420,
      haryana_hisar: 7380,
      raj_kota: 7310,
      mah_nagpur: 7480
    }
  },
  Soybean: {
    base_modal: 4950,
    msp: 4892,
    variations: {
      mp_indore: 5120,
      mp_ujjain: 5080,
      raj_kota: 5020,
      mp_bhopal: 4980,
      mah_nagpur: 5040
    }
  },
  Mustard: {
    base_modal: 6050,
    msp: 5950,
    variations: {
      raj_jaipur: 6280,
      raj_kota: 6120,
      haryana_hisar: 6180,
      delhi_azadpur: 6350
    }
  },
  Banana: {
    base_modal: 1750,
    msp: null,
    variations: {
      mah_jalgaon: 1720,
      delhi_azadpur: 2350,
      mah_pune: 2050,
      tg_hyderabad: 2150
    }
  }
};

/**
 * Haversine formula to compute great-circle distance in kilometers
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Multiply by road detour factor (~1.25x for Indian highways/rural roads)
  return Math.round(R * c * 1.25);
}

class MandiArbitrageService {
  static getSupportedCrops() {
    return Object.keys(CROP_PRICE_MATRIX);
  }

  static getVehicleTypes() {
    return VEHICLE_SPECS;
  }

  static getMandiDirectory() {
    return MANDI_DIRECTORY;
  }

  static calculateArbitrage({
    crop = "Tomato",
    quantity_qtl = 20,
    origin_lat = 28.4595, // Default Gurgaon/NCR
    origin_lon = 77.0266,
    origin_district = "Gurgaon",
    vehicle_type = "mini_truck"
  }) {
    const qty = Math.max(1, Number(quantity_qtl) || 20);
    const vehicle = VEHICLE_SPECS[vehicle_type] || VEHICLE_SPECS.mini_truck;
    const cropData = CROP_PRICE_MATRIX[crop] || CROP_PRICE_MATRIX.Tomato;

    // Calculate distance and net realization for all candidate mandis
    const mandiEvaluations = MANDI_DIRECTORY.map(mandi => {
      const distanceKm = calculateDistanceKm(origin_lat, origin_lon, mandi.lat, mandi.lon);
      
      // Get crop price in this mandi (or variation / fallback)
      const modalPrice = cropData.variations[mandi.id] || cropData.base_modal;
      
      // Estimated travel time in hours
      const travelTimeHours = (distanceKm / vehicle.avg_speed_kmh).toFixed(1);

      // Financials:
      // 1. Gross Revenue
      const grossRevenue = Math.round(modalPrice * qty);

      // 2. Transport Fuel & Freight (Round trip distance * rate per km)
      const transportCost = Math.round(distanceKm * 2 * vehicle.rate_per_km);

      // 3. APMC Loading, Weighing & Cess (~₹15/quintal)
      const handlingCost = Math.round(qty * 15);

      // 4. Net In-Pocket Earnings
      const netProfit = grossRevenue - transportCost - handlingCost;

      // Google maps direction link
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin_lat},${origin_lon}&destination=${mandi.lat},${mandi.lon}&travelmode=driving`;

      return {
        mandi_id: mandi.id,
        mandi_name: mandi.name,
        district: mandi.district,
        state: mandi.state,
        distance_km: distanceKm,
        travel_time_hours: Number(travelTimeHours),
        modal_price_qtl: modalPrice,
        gross_revenue: grossRevenue,
        transport_cost: transportCost,
        handling_cost: handlingCost,
        net_profit: netProfit,
        maps_url: mapsUrl
      };
    });

    // Filter relevant mandis (distance <= 350 km to keep logistics realistic)
    // Resolve district if unknown or default
    let resolvedDistrict = origin_district;
    if (!resolvedDistrict || resolvedDistrict === "Auto GPS" || resolvedDistrict === "NCR") {
      const closestMandiOverall = [...mandiEvaluations].sort((a, b) => a.distance_km - b.distance_km)[0];
      if (closestMandiOverall) {
        resolvedDistrict = `${closestMandiOverall.district} Region`;
      }
    }

    // Filter relevant mandis (distance <= 350 km to keep logistics realistic)
    let candidateMandis = mandiEvaluations.filter(m => m.distance_km <= 350);
    if (candidateMandis.length === 0) {
      // Fallback to top 6 closest if all are further
      candidateMandis = mandiEvaluations.sort((a, b) => a.distance_km - b.distance_km).slice(0, 6);
    }

    // Sort by Distance to identify Nearest Mandi (Baseline)
    const sortedByDistance = [...candidateMandis].sort((a, b) => a.distance_km - b.distance_km);
    const nearestMandi = sortedByDistance[0];

    // Sort by Net Profit to identify Optimal Mandi
    const sortedByProfit = [...candidateMandis].sort((a, b) => b.net_profit - a.net_profit);
    const optimalMandi = sortedByProfit[0];

    // Calculate Arbitrage Spread
    const arbitrageGain = Math.max(0, optimalMandi.net_profit - nearestMandi.net_profit);
    const hasProfitableArbitrage = optimalMandi.mandi_id !== nearestMandi.mandi_id && arbitrageGain > 500;

    // Generate Smart Verdict
    let verdictTitle = "";
    let verdictDescription = "";

    if (hasProfitableArbitrage) {
      verdictTitle = `🚀 Earn +₹${arbitrageGain.toLocaleString("en-IN")} Extra Net Profit at ${optimalMandi.mandi_name}!`;
      verdictDescription = `Even after spending ₹${optimalMandi.transport_cost.toLocaleString("en-IN")} on ${vehicle.name} transport (${optimalMandi.distance_km} km), higher auction prices at ${optimalMandi.mandi_name} (₹${optimalMandi.modal_price_qtl}/q vs ₹${nearestMandi.modal_price_qtl}/q) give you higher take-home profit.`;
    } else {
      verdictTitle = `✅ Sell at Nearest Mandi: ${nearestMandi.mandi_name}`;
      verdictDescription = `Transporting to distant mandis is not cost-effective for ${qty} quintals after fuel expenses. Your local ${nearestMandi.mandi_name} (${nearestMandi.distance_km} km) gives you the highest net in-pocket return of ₹${nearestMandi.net_profit.toLocaleString("en-IN")}.`;
    }

    // Decide which list to return based on sort_by
    const displayList = (sort_by === "distance" ? sortedByDistance : sortedByProfit).slice(0, 6);

    return {
      success: true,
      inputs: {
        crop,
        quantity_qtl: qty,
        origin_lat,
        origin_lon,
        origin_district: resolvedDistrict,
        sort_by,
        vehicle: {
          type: vehicle_type,
          name: vehicle.name,
          emoji: vehicle.emoji,
          rate_per_km: vehicle.rate_per_km
        }
      },
      summary: {
        nearest_mandi: nearestMandi,
        optimal_mandi: optimalMandi,
        arbitrage_gain: arbitrageGain,
        has_arbitrage: hasProfitableArbitrage,
        verdict_title: verdictTitle,
        verdict_description: verdictDescription,
        all_nearest: sortedByDistance.slice(0, 4)
      },
      comparison: displayList
    };
  }
}

module.exports = { MandiArbitrageService };
