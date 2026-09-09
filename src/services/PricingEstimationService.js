/**
 * PricingEstimationService
 * Computes transparent, indicative market realization ranges from quality categories and reference prices.
 * Strictly avoids arbitrary hardcoding in frontend components.
 */

const REALIZATION_RULES = {
  EXCELLENT: {
    min_factor: 0.92,
    max_factor: 1.00,
    label: 'High/Top Realization',
    rationale: 'Premium visible appearance with negligible blemish permits realizing top modal APMC rates.'
  },
  GOOD: {
    min_factor: 0.85,
    max_factor: 0.94,
    label: 'Standard Market Realization',
    rationale: 'Typical sound market quality with minor superficial blemish, realizing healthy modal prices.'
  },
  FAIR: {
    min_factor: 0.75,
    max_factor: 0.85,
    label: 'Moderate Realization',
    rationale: 'Visible variation or breaker stage indicates lot sorting may be required by commission agents.'
  },
  'BELOW AVERAGE': {
    min_factor: 0.60,
    max_factor: 0.75,
    label: 'Discounted Realization',
    rationale: 'Noticeable defects, greening, or shriveling typically leads to mandi trade discounts.'
  },
  POOR: {
    min_factor: 0.40,
    max_factor: 0.60,
    label: 'Distress / Secondary Realization',
    rationale: 'Heavy visible lesions, decay, or over-ripeness restricted to secondary or processing clearance.'
  }
};

class PricingEstimationService {
  /**
   * Calculates the indicative price range based on reference market price and quality category.
   *
   * @param {number} referenceModalPrice - Benchmark or live modal price in ₹/quintal
   * @param {string} qualityCategory - EXCELLENT, GOOD, FAIR, BELOW AVERAGE, POOR
   * @param {number} qualityScore - Numerical quality score 0-100
   * @returns {Object} Structured price realization breakdown
   */
  static calculateRealization(referenceModalPrice, qualityCategory, qualityScore = null) {
    if (!referenceModalPrice || isNaN(referenceModalPrice) || referenceModalPrice <= 0) {
      return {
        calculated: false,
        message: 'Valid reference market price required for realization calculation.'
      };
    }

    const normCategory = (qualityCategory || 'FAIR').toUpperCase().trim();
    const rule = REALIZATION_RULES[normCategory] || REALIZATION_RULES['FAIR'];

    const estimatedMin = Math.round((referenceModalPrice * rule.min_factor) / 10) * 10;
    const estimatedMax = Math.round((referenceModalPrice * rule.max_factor) / 10) * 10;

    return {
      calculated: true,
      quality_category: normCategory,
      quality_score: qualityScore,
      reference_price: Number(referenceModalPrice),
      realization_min_pct: Math.round(rule.min_factor * 100),
      realization_max_pct: Math.round(rule.max_factor * 100),
      estimated_price_min: estimatedMin,
      estimated_price_max: estimatedMax,
      currency: '₹',
      unit: 'quintal',
      formatted_range: `₹${estimatedMin.toLocaleString('en-IN')} – ₹${estimatedMax.toLocaleString('en-IN')} / quintal`,
      realization_label: rule.label,
      realization_rationale: rule.rationale,
      disclaimer: (
        'IMPORTANT: This is an AI-assisted estimate based on visible characteristics and available market data. ' +
        'Final price depends on actual physical inspection, buyer, market conditions, moisture content, ' +
        'and applicable APMC/mandi grade standards.'
      )
    };
  }

  /**
   * Returns all active realization rules for transparency and auditing.
   */
  static getRules() {
    return REALIZATION_RULES;
  }
}

module.exports = { PricingEstimationService, REALIZATION_RULES };
