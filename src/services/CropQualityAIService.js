/**
 * KisanMitra Crop Quality AI Service
 * Powered by Google Gemini Vision API (Server-Side Only)
 * with Resilient Multi-Model Failover & Deterministic Realization Engine.
 */

const SUPPORTED_CROPS = ["Tomato", "Chilli", "Onion", "Potato", "Banana", "Rice"];
const VALID_RIPENESS = ["unripe", "partially_ripe", "ripe", "overripe", "unknown"];

/**
 * 1. Pure Deterministic Quality Scoring Function
 */
function calculateQualityScore(analysis) {
  if (!analysis) return 0;
  if (analysis.is_fully_spoiled) return 0;
  const baseScore = 100;

  // 1. Defect Penalty (up to 50 pts)
  const defectPct = Math.max(0, Math.min(100, Number(analysis.defect_ratio_pct) || 0));
  const defectPenalty = Math.min(50, defectPct * 1.5);

  // 2. Ripeness Penalty (up to 25 pts)
  const ripenessMap = {
    ripe: 0,
    partially_ripe: 8,
    unripe: 18,
    overripe: 25,
    spoiled: 35,
    unknown: 15
  };
  const ripenessPenalty = ripenessMap[analysis.ripeness] ?? 15;

  // 3. Image & Identification Confidence Penalty (up to 20 pts)
  const conf = Math.max(0, Math.min(100, Number(analysis.confidence) || 0));
  let confidencePenalty = 0;
  if (conf >= 80) confidencePenalty = 0;
  else if (conf >= 60) confidencePenalty = 5;
  else if (conf >= 40) confidencePenalty = 12;
  else confidencePenalty = 20;

  const rawScore = baseScore - defectPenalty - ripenessPenalty - confidencePenalty;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

/**
 * 2. Pure Grade Classification Function
 */
function calculateGrade(qualityScore, isFullySpoiled = false) {
  if (isFullySpoiled) return "Fully Spoiled";
  const score = Number(qualityScore) || 0;
  if (score >= 80) return "Grade A";
  if (score >= 60) return "Grade B";
  return "Grade C";
}

/**
 * 3. Pure Realization Range Interpolation Function
 */
function calculateRealizationRange(qualityScore, grade) {
  const score = Math.max(0, Math.min(100, Number(qualityScore) || 0));

  if (grade === "Fully Spoiled") {
    return { low: 0, high: 0, label: "Unfit for commercial auction (Fully Spoiled)" };
  } else if (grade === "Grade A" || score >= 80) {
    const ratio = (score - 80) / (100 - 80);
    const low = Math.round(85 + ratio * (100 - 85));
    return { low, high: 100, label: "Premium APMC lotting band" };
  } else if (grade === "Grade B" || score >= 60) {
    const ratio = (score - 60) / (79 - 60);
    const low = Math.round(65 + ratio * (84 - 65));
    return { low, high: 84, label: "Standard market lotting band" };
  } else {
    const ratio = score / 59;
    const low = Math.round(40 + ratio * (64 - 40));
    return { low, high: 64, label: "Discounted / secondary clearance band" };
  }
}

function generateRecommendations(crop, grade, defectRatio, ripeness) {
  const recs = [];
  if (grade === "Fully Spoiled") {
    recs.push(`CRITICAL: Produce is fully spoiled / rotten. Do not mix with healthy crop lots.`);
    recs.push(`Segregate and discard or use for organic bio-composting immediately to avoid fungal or bacterial spread.`);
    recs.push(`Unfit for APMC mandi auction or commercial transport.`);
  } else if (grade === "Grade A") {
    recs.push(`Produce meets high visual standards. Suitable for premium APMC mandi lotting or direct retail listing.`);
    recs.push(`Maintain dry, well-ventilated storage to preserve quality grade before auction.`);
  } else if (grade === "Grade B") {
    recs.push(`Sort out visibly blemished units prior to mandi transport to maximize lot realization.`);
    recs.push(`Consider grading into separate Grade A and Grade B batches rather than selling mixed.`);
  } else {
    recs.push(`Visible surface defects or advanced ripeness observed. Segregate damaged units immediately.`);
    recs.push(`Explore local direct processing or immediate clearance to prevent further degradation.`);
  }
  return recs;
}

function extractJSON(text) {
  if (!text) return null;
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    }
    throw e;
  }
}

function normalizeCropName(rawName) {
  if (!rawName || typeof rawName !== 'string') return "Unknown";
  const lower = rawName.toLowerCase();
  for (const c of SUPPORTED_CROPS) {
    if (lower.includes(c.toLowerCase())) return c;
  }
  if (lower.includes("chile") || lower.includes("pepper") || lower.includes("capsicum")) return "Chilli";
  if (lower.includes("paddy") || lower.includes("grain")) return "Rice";
  return "Unknown";
}

function normalizeRipeness(rawRipeness) {
  if (!rawRipeness || typeof rawRipeness !== 'string') return "unknown";
  const lower = rawRipeness.toLowerCase();
  if (lower.includes("spoil") || lower.includes("rot") || lower.includes("decay")) return "spoiled";
  if (lower.includes("over") || lower.includes("senescent")) return "overripe";
  if (lower.includes("part") || lower.includes("turn") || lower.includes("semi") || lower.includes("breaker")) return "partially_ripe";
  if (lower.includes("unripe") || lower.includes("green") || lower.includes("early")) return "unripe";
  if (lower.includes("ripe")) return "ripe";
  return "unknown";
}

class CropQualityAIService {
  static async callGeminiVision(imageBuffer, mimeType = "image/jpeg", requestedCrop = null) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the server. Please set it in your .env file.");
    }

    const primaryModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    const candidateModels = [
      primaryModel,
      "gemini-3.5-flash-lite",
      "gemini-3.6-flash",
      "gemini-3.7-flash",
      "gemini-3.8-flash",
      "gemini-3.5-flash"
    ];
    // Remove duplicates while preserving order
    const modelCascade = Array.from(new Set(candidateModels));

    const base64Image = imageBuffer.toString("base64");

    const systemPrompt = `You are a specialized agricultural vision assistant for Indian farmers.
Analyze the provided image of harvested crop/produce strictly for VISIBLE physical quality characteristics.
Supported crops: Tomato, Chilli, Onion, Potato, Banana, Rice.

IMPORTANT GUIDELINES:
- ONLY assess what can reasonably be seen visually (color, skin blemishes, surface spots, wrinkles, shape).
- Check if the produce is severely rotten, decaying, full of black mold/fungus, decomposed, or completely spoiled. Set "is_fully_spoiled" to true if so, else false.
- DO NOT claim to detect pesticide residue, chemical composition, internal rot, exact moisture, laboratory metrics, or exact market grades.
- If the image is blurry, does not contain produce, or is ambiguous, set "cropName" to "Unknown" and provide a low "confidence" (0-30).
${requestedCrop ? `- The user indicated this might be '${requestedCrop}'. Verify if the image visually matches '${requestedCrop}'.` : ""}

Return ONLY a valid JSON object matching this exact schema:
{
  "cropName": "Tomato | Chilli | Onion | Potato | Banana | Rice | Unknown",
  "confidence": 0 to 100,
  "observations": ["array of clear visible physical findings"],
  "visibleDefects": ["array of visible surface defects if any"],
  "ripeness": "unripe | partially_ripe | ripe | overripe | spoiled | unknown",
  "is_fully_spoiled": boolean,
  "defect_ratio_pct": 0 to 100
}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            },
            {
              text: systemPrompt
            }
          ]
        }
      ]
    };

    let lastError = null;

    for (const model of modelCascade) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errBody = await response.text();
          // If high demand 503 or rate limit 429, try next model in cascade
          if (response.status === 503 || response.status === 429) {
            console.warn(`Gemini model ${model} returned ${response.status}. Trying next available model in cascade...`);
            lastError = new Error(`Gemini API ${model} status ${response.status}: ${errBody}`);
            continue;
          }
          throw new Error(`Gemini API error (${model} status ${response.status}): ${errBody}`);
        }

        const resData = await response.json();
        const textOutput = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textOutput) {
          throw new Error(`Empty response received from Gemini model ${model}.`);
        }

        const parsed = extractJSON(textOutput);
        parsed._active_model = model;
        return parsed;
      } catch (err) {
        clearTimeout(timeout);
        lastError = err;
        if (err.name === "AbortError") {
          console.warn(`Gemini model ${model} timed out. Trying next fallback model...`);
          continue;
        }
      }
    }

    throw lastError || new Error("All Gemini Vision model endpoints failed. Please check your internet connection.");
  }

  static async analyze(imageBuffer, requestedCrop = null, mimeType = "image/jpeg") {
    if (!imageBuffer || imageBuffer.length < 500) {
      return {
        success: false,
        error_code: "INVALID_IMAGE",
        message: "Image file is too small or corrupt. Minimum 80x80px required."
      };
    }

    if (imageBuffer.length > 10 * 1024 * 1024) {
      return {
        success: false,
        error_code: "IMAGE_TOO_LARGE",
        message: "Image file size exceeds the 10MB limit. Please upload a smaller image."
      };
    }

    if (requestedCrop && !SUPPORTED_CROPS.includes(requestedCrop)) {
      return {
        success: false,
        error_code: "UNSUPPORTED_CROP",
        message: `Crop '${requestedCrop}' is not supported. Supported crops: ${SUPPORTED_CROPS.join(", ")}.`
      };
    }

    try {
      const geminiRaw = await this.callGeminiVision(imageBuffer, mimeType, requestedCrop);

      const cropName = normalizeCropName(geminiRaw.cropName);
      
      let rawConf = Number(geminiRaw.confidence) || 0;
      if (rawConf > 0 && rawConf <= 1.0) rawConf = rawConf * 100;
      const confidence = Math.max(0, Math.min(100, Math.round(rawConf)));

      let rawDefect = Number(geminiRaw.defect_ratio_pct) || 0;
      if (rawDefect > 0 && rawDefect <= 1.0) rawDefect = rawDefect * 100;
      const defectRatio = Math.max(0, Math.min(100, Math.round(rawDefect)));
      
      const ripeness = normalizeRipeness(geminiRaw.ripeness);

      let observations = [];
      if (Array.isArray(geminiRaw.observations)) {
        observations = geminiRaw.observations;
      } else if (typeof geminiRaw.observations === "string" && geminiRaw.observations.trim().length > 0) {
        observations = [geminiRaw.observations];
      }

      let visibleDefects = [];
      if (Array.isArray(geminiRaw.visibleDefects)) {
        visibleDefects = geminiRaw.visibleDefects;
      } else if (typeof geminiRaw.visibleDefects === "string" && geminiRaw.visibleDefects.trim().length > 0) {
        visibleDefects = [geminiRaw.visibleDefects];
      }

      if (cropName === "Unknown" || confidence < 35) {
        return {
          success: false,
          error_code: "LOW_CONFIDENCE",
          crop: cropName,
          confidence,
          message: "We couldn't confidently assess this image. Please upload a clearer photo of the harvested produce or select the crop manually."
        };
      }

      const isFullySpoiled = Boolean(
        geminiRaw.is_fully_spoiled === true ||
        geminiRaw.spoilage_status === "fully_spoiled" ||
        ripeness === "spoiled" ||
        defectRatio >= 85 ||
        (Array.isArray(visibleDefects) && visibleDefects.some(d => /rot|decay|fungus|mold|spoiled/i.test(d)))
      );

      const qualityScore = calculateQualityScore({
        defect_ratio_pct: defectRatio,
        ripeness,
        confidence,
        is_fully_spoiled: isFullySpoiled
      });

      const grade = calculateGrade(qualityScore, isFullySpoiled);
      const realization = calculateRealizationRange(qualityScore, grade);
      const recommendations = generateRecommendations(cropName, grade, defectRatio, ripeness);

      return {
        success: true,
        crop: cropName,
        detection_confidence: confidence,
        confidence_tier: confidence >= 70 ? "HIGH" : "MEDIUM",
        quality_score: qualityScore,
        quality_category: grade,
        maturity_assessment: isFullySpoiled 
          ? "Fully Spoiled / Unfit for Consumption" 
          : `Ripeness: ${ripeness.replace('_', ' ')}`,
        visible_observations: observations,
        visible_defects: visibleDefects,
        visible_metrics: {
          defect_ratio_pct: defectRatio,
          ripeness_stage: ripeness,
          is_fully_spoiled: isFullySpoiled
        },
        recommendations,
        realization_pct: realization,
        model_status: {
          model_name: geminiRaw._active_model || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
          provider: "Google Gemini Vision API",
          scoring_engine: "Deterministic KisanMitra Quality & Realization Rules",
          is_honest: true
        }
      };
    } catch (err) {
      console.error("CropQualityAIService error:", err.message);
      return {
        success: false,
        error_code: "AI_ANALYSIS_ERROR",
        message: err.message.includes("GEMINI_API_KEY")
          ? err.message
          : "Unable to complete AI image analysis. Please ensure image is clear and try again."
      };
    }
  }
}

module.exports = {
  CropQualityAIService,
  SUPPORTED_CROPS,
  calculateQualityScore,
  calculateGrade,
  calculateRealizationRange
};
