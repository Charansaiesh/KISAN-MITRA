const { CropQualityAIService, SUPPORTED_CROPS } = require('../services/CropQualityAIService');
const { MarketPriceProvider } = require('../services/MarketPriceProvider');
const { CropQualityPersistenceService } = require('../services/CropQualityPersistenceService');

exports.analyzeCropQuality = async (req, res) => {
  try {
    const { image, crop, district, save_to_history, language } = req.body;
    const aiLanguage = (language === 'hi' || (typeof language === 'string' && language.trim().toLowerCase() === 'hi')) ? 'hi' : 'en';

    if (!image) return res.status(400).json({ success: false, error_code: 'NO_IMAGE', message: 'No image provided.' });

    let imageBuffer;
    let mimeType = 'image/jpeg';
    if (typeof image === 'string' && image.startsWith('data:')) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        imageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        return res.status(400).json({ success: false, error_code: 'INVALID_BASE64' });
      }
    } else if (typeof image === 'string') {
      imageBuffer = Buffer.from(image, 'base64');
    } else if (Buffer.isBuffer(image)) {
      imageBuffer = image;
    }

    if (crop && !SUPPORTED_CROPS.includes(crop)) {
      return res.status(400).json({ success: false, error_code: 'UNSUPPORTED_CROP' });
    }

    const visionResult = await CropQualityAIService.analyze(imageBuffer, crop, mimeType, aiLanguage);
    if (!visionResult.success) {
      let code = 400;
      if (visionResult.error_code === 'LOW_CONFIDENCE' || visionResult.error_code === 'NON_PRODUCE' || visionResult.status === 422) {
        code = 422;
      } else if (visionResult.error_code === 'AI_SERVICE_UNAVAILABLE' || visionResult.status === 503) {
        code = 503;
      }
      return res.status(code).json(visionResult);
    }

    const analyzedCrop = visionResult.crop;
    const qualityScore = visionResult.quality_score;
    const grade = visionResult.quality_category;
    const realizationLow = visionResult.realization_pct.low;
    const realizationHigh = visionResult.realization_pct.high;

    let marketData = null;
    let priceEstimation = null;

    if (analyzedCrop && analyzedCrop !== 'Unknown') {
      marketData = await MarketPriceProvider.getPrice(analyzedCrop, district);
      if (marketData && marketData.available && marketData.modal_price) {
        const benchmark = Number(marketData.modal_price);
        if (grade === "Fully Spoiled" || realizationHigh === 0) {
          priceEstimation = {
            calculated: true,
            benchmark_price: benchmark,
            estimated_price_min: 0,
            estimated_price_max: 0,
            realization_min_pct: 0,
            realization_max_pct: 0,
            realization_label: "Unfit for Mandi Auction (Fully Spoiled)",
            formatted_range: "₹0 – Not Fit for Sale (Fully Spoiled)"
          };
        } else {
          const estLow = Math.round(benchmark * (realizationLow / 100));
          const estHigh = Math.round(benchmark * (realizationHigh / 100));
          priceEstimation = {
            calculated: true,
            benchmark_price: benchmark,
            estimated_price_min: estLow,
            estimated_price_max: estHigh,
            realization_min_pct: realizationLow,
            realization_max_pct: realizationHigh,
            realization_label: visionResult.realization_pct.label,
            formatted_range: `₹${estLow.toLocaleString('en-IN')} – ₹${estHigh.toLocaleString('en-IN')} / quintal`
          };
        }
      }
    }

    const userId = req.user ? req.user.id : null;
    let savedRecord = null;
    if (save_to_history && userId) {
      savedRecord = await CropQualityPersistenceService.saveAssessment({
        user_id: userId,
        crop: analyzedCrop,
        crop_confidence: visionResult.detection_confidence,
        confidence_tier: visionResult.confidence_tier,
        quality_score: qualityScore,
        quality_category: grade,
        maturity_assessment: visionResult.maturity_assessment,
        defect_ratio_pct: visionResult.visible_metrics?.defect_ratio_pct || 0,
        modal_price: marketData?.modal_price || null,
        estimated_min_price: priceEstimation?.estimated_price_min || null,
        estimated_max_price: priceEstimation?.estimated_price_max || null,
        observations: visionResult.visible_observations,
        price_source: marketData?.source || 'UNAVAILABLE'
      });
    }

    return res.status(200).json({
      success: true,
      source: visionResult.source || 'gemini',
      language: aiLanguage,
      crop: analyzedCrop,
      detection_confidence: visionResult.detection_confidence,
      confidence_tier: visionResult.confidence_tier,
      quality_score: qualityScore,
      quality_category: grade,
      grade_explanation: visionResult.grade_explanation,
      shelf_life: visionResult.shelf_life,
      maturity_assessment: visionResult.maturity_assessment,
      visible_observations: visionResult.visible_observations,
      visible_defects: visionResult.visible_defects,
      visible_metrics: visionResult.visible_metrics,
      recommendations: visionResult.recommendations,
      realization_pct: visionResult.realization_pct,
      market_data: marketData,
      price_estimation: priceEstimation,
      disclaimer: (aiLanguage === 'hi')
        ? "एआई-सहायक सांकेतिक अनुमान। वास्तविक APMC मंडी भाव भौतिक निरीक्षण व नीलामी पर निर्भर करते हैं।"
        : "AI-assisted indicative estimation only. Actual APMC mandi prices depend on official grading and live auctions.",
      saved_to_history: !!savedRecord,
      saved_record_id: savedRecord?.id || null,
      model_status: visionResult.model_status
    });
  } catch (err) {
    return res.status(500).json({ success: false, source: 'fallback', message: 'Server error during assessment.' });
  }
};

exports.getFarmerHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await CropQualityPersistenceService.getUserHistory(userId);
    return res.status(200).json({ success: true, records: history });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve assessment history.' });
  }
};

exports.getAggregateAnalytics = async (req, res) => {
  try {
    const analytics = await CropQualityPersistenceService.getAggregateAnalytics();
    return res.status(200).json({ success: true, ...analytics });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to compute quality analytics.' });
  }
};

exports.getModelStatus = async (req, res) => {
  return res.status(200).json({
    success: true,
    model_name: process.env.GEMINI_MODEL || "gemini-flash-latest",
    provider: "Google Gemini Vision API",
    scoring_engine: "Deterministic KisanMitra Quality & Realization Rules",
    supported_crops: SUPPORTED_CROPS,
    is_honest: true
  });
};

