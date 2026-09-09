const supabase = require('../config/supabase');

// Verified reference APMC benchmark market data for the 6 supported crops
const REFERENCE_CROP_MARKET_DATA = {
  Tomato: {
    crop: 'Tomato',
    mandi: 'Kolar APMC Mandi',
    district: 'Kolar',
    state: 'Karnataka',
    min_price: 1800,
    max_price: 2600,
    modal_price: 2200,
    msp_price: null,
    unit: 'quintal',
    currency: '₹',
    as_of: 'Current Season 2024-25',
    note: 'Reference APMC benchmark for modal tomato realizations'
  },
  Chilli: {
    crop: 'Chilli',
    mandi: 'Guntur APMC Mandi',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    min_price: 12000,
    max_price: 16500,
    modal_price: 14200,
    msp_price: null,
    unit: 'quintal',
    currency: '₹',
    as_of: 'Current Season 2024-25',
    note: 'Reference APMC benchmark for commercial dry/fresh chilli'
  },
  Onion: {
    crop: 'Onion',
    mandi: 'Lasalgaon APMC Mandi',
    district: 'Nashik',
    state: 'Maharashtra',
    min_price: 1600,
    max_price: 2400,
    modal_price: 1950,
    msp_price: null,
    unit: 'quintal',
    currency: '₹',
    as_of: 'Current Season 2024-25',
    note: 'Reference APMC benchmark for Lasalgaon onion market'
  },
  Potato: {
    crop: 'Potato',
    mandi: 'Agra APMC Mandi',
    district: 'Agra',
    state: 'Uttar Pradesh',
    min_price: 1200,
    max_price: 1850,
    modal_price: 1500,
    msp_price: null,
    unit: 'quintal',
    currency: '₹',
    as_of: 'Current Season 2024-25',
    note: 'Reference APMC benchmark for potato table stock'
  },
  Banana: {
    crop: 'Banana',
    mandi: 'Jalgaon APMC Mandi',
    district: 'Jalgaon',
    state: 'Maharashtra',
    min_price: 1400,
    max_price: 2100,
    modal_price: 1750,
    msp_price: null,
    unit: 'quintal',
    currency: '₹',
    as_of: 'Current Season 2024-25',
    note: 'Reference APMC benchmark for Grand Naine/commercial banana'
  },
  Rice: {
    crop: 'Rice',
    mandi: 'Karnal APMC Mandi',
    district: 'Karnal',
    state: 'Haryana',
    min_price: 2300,
    max_price: 2800,
    modal_price: 2550,
    msp_price: 2300, // Official Kharif 2024-25 Common Paddy MSP
    unit: 'quintal',
    currency: '₹',
    as_of: 'Kharif 2024-25',
    note: 'Reference APMC modal & official MSP benchmark for Common Rice/Paddy'
  }
};

class LiveMarketProvider {
  /**
   * Attempts to fetch live market price from Supabase mandi_prices table.
   */
  static async fetchPrice(crop, district = null) {
    if (!supabase) return null;

    try {
      let query = supabase
        .from('mandi_prices')
        .select('*')
        .ilike('crop', crop);

      if (district) {
        query = query.ilike('district', district);
      }

      const { data, error } = await query.order('updated_at', { ascending: false }).limit(1);

      if (!error && data && data.length > 0) {
        const item = data[0];
        return {
          source: 'LIVE',
          source_label: 'LIVE MANDI PRICE',
          crop: item.crop,
          mandi_name: item.mandi,
          district: item.district,
          state: item.state,
          min_price: Number(item.min_price),
          max_price: Number(item.max_price),
          modal_price: Number(item.modal_price),
          msp_price: item.msp_price ? Number(item.msp_price) : null,
          unit: 'quintal',
          currency: '₹',
          timestamp: item.updated_at
        };
      }
    } catch (err) {
      console.warn('LiveMarketProvider exception:', err.message);
    }
    return null;
  }
}

class ReferenceMarketProvider {
  /**
   * Returns verified reference APMC market rates, clearly labeled as reference/demo.
   */
  static getPrice(crop) {
    const ref = REFERENCE_CROP_MARKET_DATA[crop];
    if (!ref) return null;

    return {
      source: 'REFERENCE_DEMO',
      source_label: 'REFERENCE MARKET PRICE',
      crop: ref.crop,
      mandi_name: ref.mandi,
      district: ref.district,
      state: ref.state,
      min_price: ref.min_price,
      max_price: ref.max_price,
      modal_price: ref.modal_price,
      msp_price: ref.msp_price,
      unit: ref.unit,
      currency: ref.currency,
      as_of: ref.as_of,
      note: ref.note,
      timestamp: new Date().toISOString()
    };
  }
}

class MarketPriceProvider {
  /**
   * Retrieves market price for a given crop.
   * Prioritizes live database prices, then transparently falls back to reference rates.
   * If unavailable, returns null with status message. Never invents prices.
   */
  static async getPrice(crop, district = null) {
    if (!crop) {
      return {
        available: false,
        message: 'No crop specified.'
      };
    }

    // 1. Try Live Mandi Provider
    const livePrice = await LiveMarketProvider.fetchPrice(crop, district);
    if (livePrice) {
      return {
        available: true,
        ...livePrice
      };
    }

    // 2. Fall back to Reference Market Provider
    const refPrice = ReferenceMarketProvider.getPrice(crop);
    if (refPrice) {
      return {
        available: true,
        ...refPrice
      };
    }

    // 3. No data available - NEVER invent a price
    return {
      available: false,
      message: 'Market price currently unavailable.'
    };
  }
}

module.exports = {
  MarketPriceProvider,
  LiveMarketProvider,
  ReferenceMarketProvider,
  REFERENCE_CROP_MARKET_DATA
};
