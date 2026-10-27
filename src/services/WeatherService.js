/**
 * KisanMitra Weather Service
 * High-accuracy, real-time weather and 7-day agricultural forecasts
 * Powered by Open-Meteo with WMO code translation, caching, and agronomic recommendations.
 */

const WMO_CODES = {
  0: { description: "Clear sky", emoji: "☀️", spraySafe: true },
  1: { description: "Mainly clear", emoji: "🌤️", spraySafe: true },
  2: { description: "Partly cloudy", emoji: "⛅", spraySafe: true },
  3: { description: "Overcast", emoji: "☁️", spraySafe: true },
  45: { description: "Foggy", emoji: "🌫️", spraySafe: false },
  48: { description: "Depositing rime fog", emoji: "🌫️", spraySafe: false },
  51: { description: "Light drizzle", emoji: "🌦️", spraySafe: false },
  53: { description: "Moderate drizzle", emoji: "🌦️", spraySafe: false },
  55: { description: "Dense drizzle", emoji: "🌧️", spraySafe: false },
  61: { description: "Slight rain", emoji: "🌦️", spraySafe: false },
  63: { description: "Moderate rain", emoji: "🌧️", spraySafe: false },
  65: { description: "Heavy rain", emoji: "🌧️", spraySafe: false },
  71: { description: "Slight snowfall", emoji: "🌨️", spraySafe: false },
  73: { description: "Moderate snowfall", emoji: "🌨️", spraySafe: false },
  75: { description: "Heavy snowfall", emoji: "❄️", spraySafe: false },
  80: { description: "Slight rain showers", emoji: "🌦️", spraySafe: false },
  81: { description: "Moderate rain showers", emoji: "🌧️", spraySafe: false },
  82: { description: "Violent rain showers", emoji: "⛈️", spraySafe: false },
  95: { description: "Thunderstorm", emoji: "⛈️", spraySafe: false },
  96: { description: "Thunderstorm with slight hail", emoji: "⛈️", spraySafe: false },
  99: { description: "Thunderstorm with heavy hail", emoji: "⛈️", spraySafe: false }
};

// Known coordinates for major agricultural centers & Telangana districts (fast offline fallback)
const KNOWN_LOCATIONS = {
  "warangal": { lat: 17.97, lon: 79.60, name: "Warangal", state: "Telangana" },
  "hyderabad": { lat: 17.38, lon: 78.48, name: "Hyderabad", state: "Telangana" },
  "karimnagar": { lat: 18.43, lon: 79.13, name: "Karimnagar", state: "Telangana" },
  "nizamabad": { lat: 18.67, lon: 78.10, name: "Nizamabad", state: "Telangana" },
  "khammam": { lat: 17.25, lon: 80.15, name: "Khammam", state: "Telangana" },
  "nalgonda": { lat: 17.05, lon: 79.27, name: "Nalgonda", state: "Telangana" },
  "mahabubnagar": { lat: 16.74, lon: 78.00, name: "Mahabubnagar", state: "Telangana" },
  "medak": { lat: 18.04, lon: 78.26, name: "Medak", state: "Telangana" },
  "adilabad": { lat: 19.66, lon: 78.53, name: "Adilabad", state: "Telangana" },
  "siddipet": { lat: 18.10, lon: 78.85, name: "Siddipet", state: "Telangana" },
  "suryapet": { lat: 17.14, lon: 79.62, name: "Suryapet", state: "Telangana" },
  "guntur": { lat: 16.30, lon: 80.44, name: "Guntur", state: "Andhra Pradesh" },
  "vijayawada": { lat: 16.51, lon: 80.64, name: "Vijayawada", state: "Andhra Pradesh" },
  "lucknow": { lat: 26.85, lon: 80.95, name: "Lucknow", state: "Uttar Pradesh" },
  "jaipur": { lat: 26.91, lon: 75.79, name: "Jaipur", state: "Rajasthan" },
  "bhopal": { lat: 23.26, lon: 77.41, name: "Bhopal", state: "Madhya Pradesh" },
  "chandigarh": { lat: 30.73, lon: 76.78, name: "Chandigarh", state: "Punjab/Haryana" },
  "patna": { lat: 25.60, lon: 85.14, name: "Patna", state: "Bihar" },
  "coimbatore": { lat: 11.01, lon: 76.96, name: "Coimbatore", state: "Tamil Nadu" },
  "pune": { lat: 18.52, lon: 73.85, name: "Pune", state: "Maharashtra" },
  "nagpur": { lat: 21.14, lon: 79.08, name: "Nagpur", state: "Maharashtra" },
  "indore": { lat: 22.72, lon: 75.86, name: "Indore", state: "Madhya Pradesh" }
};

const cache = new Map(); // key -> { data, expiresAt }
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

class WeatherService {
  /**
   * Translates WMO weather code to text description and emoji
   */
  static getWMOInfo(code) {
    return WMO_CODES[code] || { description: "Variable conditions", emoji: "🌤️", spraySafe: true };
  }

  /**
   * Geocodes a location query (e.g. "Warangal", "Nizamabad", "Khammam")
   */
  static async geocode(locationQuery) {
    if (!locationQuery || typeof locationQuery !== "string") return null;
    const q = locationQuery.trim().toLowerCase();

    // Check known agricultural locations first
    if (KNOWN_LOCATIONS[q]) {
      return KNOWN_LOCATIONS[q];
    }
    for (const [key, loc] of Object.entries(KNOWN_LOCATIONS)) {
      if (q.includes(key) || key.includes(q)) {
        return loc;
      }
    }

    // Call Open-Meteo Geocoding API
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationQuery)}&count=5&language=en&format=json`;
      const res = await fetch(url, { headers: { "User-Agent": "KisanMitra-AgriPlatform/1.0" } });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.results || data.results.length === 0) return null;

      // Prefer Indian location matches
      const inMatch = data.results.find(r => r.country_code === "IN") || data.results[0];
      return {
        lat: inMatch.latitude,
        lon: inMatch.longitude,
        name: inMatch.name,
        state: inMatch.admin1 || inMatch.country || "India"
      };
    } catch (err) {
      console.warn("Geocoding lookup error:", err.message);
      return null;
    }
  }

  /**
   * Fetches real-time weather & 7-day forecast for given lat/lon
   */
  static async getWeatherByCoordinates(lat, lon, locationName = "Current Location") {
    const cacheKey = `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=7`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "KisanMitra-AgriPlatform/1.0" },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`Weather provider responded with status ${res.status}`);
      }

      const raw = await res.json();
      const current = raw.current || {};
      const daily = raw.daily || {};

      const curWmo = this.getWMOInfo(current.weather_code);
      const todayRainProb = daily.precipitation_probability_max?.[0] ?? 0;
      const tomorrowRainProb = daily.precipitation_probability_max?.[1] ?? 0;
      const todayRainSum = daily.precipitation_sum?.[0] ?? 0;
      const tomorrowRainSum = daily.precipitation_sum?.[1] ?? 0;
      const windSpeed = current.wind_speed_10m || 0;

      // Automated Agronomic Advisory Analysis
      const spraySafeToday = Boolean(curWmo.spraySafe && todayRainProb < 40 && todayRainSum < 1.0 && windSpeed < 18);
      const spraySafeTomorrow = Boolean(tomorrowRainProb < 40 && tomorrowRainSum < 1.0 && (daily.wind_speed_10m_max?.[1] || 0) < 18);

      let sprayAdvisory = "";
      if (!spraySafeToday) {
        sprayAdvisory = `⚠️ Postpone chemical spraying today. High rain risk (${todayRainProb}%) or wind (${windSpeed} km/h) will wash away chemicals or cause spray drift.`;
      } else if (!spraySafeTomorrow) {
        sprayAdvisory = `⚠️ Rain or thunderstorms expected tomorrow (${tomorrowRainProb}% chance, ~${tomorrowRainSum}mm). Hold off on systemic pesticides and foliar sprays.`;
      } else {
        sprayAdvisory = `✅ Favorable weather for spraying and foliar applications during calm morning hours (6–9 AM).`;
      }

      let drainageAdvisory = "";
      if (todayRainSum > 5 || tomorrowRainSum > 5 || todayRainProb > 70 || tomorrowRainProb > 70) {
        drainageAdvisory = `🌧️ Approaching rain (${Math.max(todayRainSum, tomorrowRainSum)}mm). Inspect field drainage channels to prevent waterlogging around root zones. Move harvested heaps to elevated covered platforms.`;
      } else {
        drainageAdvisory = `💧 Normal field conditions. Maintain regular soil moisture checks based on crop stage.`;
      }

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const forecastDays = [];

      if (Array.isArray(daily.time)) {
        for (let i = 0; i < daily.time.length; i++) {
          const dateStr = daily.time[i];
          const dt = new Date(dateStr + "T00:00:00");
          const dayName = i === 0 ? "Today" : (i === 1 ? "Tomorrow" : dayNames[dt.getDay()]);
          const wmo = this.getWMOInfo(daily.weather_code[i]);
          forecastDays.push({
            date: dateStr,
            day: dayName,
            condition: wmo.description,
            emoji: wmo.emoji,
            temp_max: Math.round(daily.temperature_2m_max[i]),
            temp_min: Math.round(daily.temperature_2m_min[i]),
            rain_probability_pct: daily.precipitation_probability_max[i] ?? 0,
            rain_sum_mm: daily.precipitation_sum[i] ?? 0,
            wind_speed_max: Math.round(daily.wind_speed_10m_max[i] || 0)
          });
        }
      }

      const formattedData = {
        success: true,
        source: "Open-Meteo Official Weather API",
        retrieval_time: new Date().toISOString(),
        meta: {
          retrieved_at: new Date().toISOString(),
          provider: "Open-Meteo"
        },
        units: {
          temperature: "°C",
          wind_speed: "km/h",
          precipitation: "mm",
          humidity: "%"
        },
        location: {
          name: locationName,
          latitude: Number(lat),
          longitude: Number(lon)
        },
        current: {
          temperature_c: Math.round(current.temperature_2m),
          condition: curWmo.description,
          emoji: curWmo.emoji,
          relative_humidity_pct: current.relative_humidity_2m || 0,
          wind_speed_kmh: Math.round(windSpeed),
          precipitation_mm: current.precipitation || 0,
          observed_at: current.time || new Date().toISOString()
        },
        advisories: {
          spray_safe_today: spraySafeToday,
          spray_safe_tomorrow: spraySafeTomorrow,
          spray_advisory: sprayAdvisory,
          drainage_advisory: drainageAdvisory
        },
        forecast: forecastDays
      };

      cache.set(cacheKey, { data: formattedData, expiresAt: now + CACHE_TTL_MS });
      return formattedData;
    } catch (err) {
      clearTimeout(timer);
      throw new Error(`Weather fetch failed: ${err.message}`);
    }
  }

  /**
   * Resolves location name and returns complete weather package
   */
  static async getWeatherByLocation(locationQuery) {
    const geo = await this.geocode(locationQuery);
    if (!geo) {
      throw new Error(`Location "${locationQuery}" could not be found. Please check the spelling or provide a nearby town or district.`);
    }
    const displayName = `${geo.name}${geo.state ? ", " + geo.state : ""}`;
    return await this.getWeatherByCoordinates(geo.lat, geo.lon, displayName);
  }
}

module.exports = { WeatherService };
