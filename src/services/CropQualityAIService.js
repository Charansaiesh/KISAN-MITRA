/**
 * KisanMitra Crop Quality AI Service
 * Powered by Google Gemini Vision API (Server-Side Only)
 * with Resilient Multi-Model Failover & Deterministic Realization Engine.
 */

const { GeminiKeyManager } = require('./GeminiKeyManager');

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

function generateRecommendations(crop, grade, defectRatio, ripeness, language = "en") {
  const isHi = (language === "hi");
  const recs = [];
  if (grade === "Fully Spoiled") {
    if (isHi) {
      recs.push("गंभीर: उत्पाद पूरी तरह सड़ चुका है/खराब हो चुका है। इसे स्वस्थ फसल के ढेर में न मिलाएं।");
      recs.push("फफूंद या जीवाणु संक्रमण फैलने से रोकने के लिए तुरंत अलग करके नष्ट करें या जैविक खाद में उपयोग करें।");
      recs.push("मंडी नीलामी या व्यापारिक परिवहन के लिए सर्वथा अनुपयुक्त।");
    } else {
      recs.push("CRITICAL: Produce is fully spoiled / rotten. Do not mix with healthy crop lots.");
      recs.push("Segregate and discard or use for organic bio-composting immediately to avoid fungal or bacterial spread.");
      recs.push("Unfit for APMC mandi auction or commercial transport.");
    }
  } else if (grade === "Grade A") {
    if (isHi) {
      recs.push("उत्पाद उच्च दृश्य मानकों को पूरा करता है। प्रीमियम APMC मंडी बोली या सीधे खुदरा बिक्री के लिए उपयुक्त।");
      recs.push("नीलामी से पहले गुणवत्ता बनाए रखने के लिए सूखे व हवादार स्थान पर भंडारण करें।");
    } else {
      recs.push("Produce meets high visual standards. Suitable for premium APMC mandi lotting or direct retail listing.");
      recs.push("Maintain dry, well-ventilated storage to preserve quality grade before auction.");
    }
  } else if (grade === "Grade B") {
    if (isHi) {
      recs.push("मंडी में अधिकतम मूल्य पाने के लिए परिवहन से पहले दाग-धब्बे वाले दानों/फलों को छांटकर अलग करें।");
      recs.push("मिश्रित बेचने के बजाय ग्रेड A और ग्रेड B के अलग-अलग लॉट बनाकर नीलाम करें।");
    } else {
      recs.push("Sort out visibly blemished units prior to mandi transport to maximize lot realization.");
      recs.push("Consider grading into separate Grade A and Grade B batches rather than selling mixed.");
    }
  } else {
    if (isHi) {
      recs.push("सतह पर स्पष्ट दोष या अधिक पकाव देखा गया। क्षतिग्रस्त दानों/फलों को तुरंत अलग करें।");
      recs.push("आगे खराब होने से बचाने के लिए स्थानीय स्तर पर प्रसंस्करण या तुरंत निकासी बिक्री पर विचार करें।");
    } else {
      recs.push("Visible surface defects or advanced ripeness observed. Segregate damaged units immediately.");
      recs.push("Explore local direct processing or immediate clearance to prevent further degradation.");
    }
  }
  return recs;
}

function generateGradeExplanation(crop, grade, defectRatio, ripeness, language = "en") {
  const isHi = (language === "hi");
  if (grade === "Fully Spoiled") {
    return isHi
      ? `उत्पाद में अत्यधिक सड़न (${defectRatio}% सतह दोष) पाई गई है, जो व्यापार व उपभोग के अयोग्य है।`
      : `Produce exhibits severe spoilage (${defectRatio}% surface defects) and is unfit for commercial sale.`;
  } else if (grade === "Grade A") {
    return isHi
      ? `उत्कृष्ट रंग, दृढ़ता और न्यूनतम दोष (${defectRatio}% सतह दोष) के साथ प्रीमियम मंडी गुणवत्ता।`
      : `Superior visual quality with optimal firmness, uniform coloration, and minimal blemishes (${defectRatio}% defect area).`;
  } else if (grade === "Grade B") {
    return isHi
      ? `मध्यम व्यावसायिक गुणवत्ता — हल्के सतह दोष (${defectRatio}%) और सामान्य पकाव, मानक मंडी व्यापार हेतु उपयुक्त।`
      : `Moderate commercial quality with minor blemishes (${defectRatio}%) and standard maturity, suitable for regular mandi lots.`;
  } else {
    return isHi
      ? `द्वितीयक गुणवत्ता — दृश्यमान सतह दोष (${defectRatio}%) या अत्यधिक पकाव, तत्काल बिक्री आवश्यक।`
      : `Secondary quality with noticeable blemishes (${defectRatio}%) or advanced ripeness; requires quick clearance.`;
  }
}

function generateShelfLife(crop, grade, ripeness, language = "en") {
  const isHi = (language === "hi");
  if (grade === "Fully Spoiled") {
    return isHi ? "0 दिन (तत्काल नष्ट करें)" : "0 days (discard immediately)";
  }
  const cropLower = (crop || "").toLowerCase();
  if (cropLower.includes("potato") || cropLower.includes("onion")) {
    if (grade === "Grade A") {
      return isHi ? "हवादार सूखे स्थान पर 30-45 दिन" : "30–45 days in cool, ventilated storage";
    } else if (grade === "Grade B") {
      return isHi ? "हवादार सूखे स्थान पर 15-20 दिन" : "15–20 days in ventilated storage";
    } else {
      return isHi ? "7-10 दिन (शीघ्र उपयोग करें)" : "7–10 days (use promptly)";
    }
  } else if (cropLower.includes("rice")) {
    if (grade === "Grade A") {
      return isHi ? "शुष्क भंडारण (नमी < 12%) में 6-12 महीने" : "6–12 months in dry storage (<12% moisture)";
    } else {
      return isHi ? "शुष्क भंडारण में 3-6 महीने" : "3–6 months in dry storage";
    }
  } else {
    // Perishables: Tomato, Chilli, Banana
    if (grade === "Grade A") {
      return isHi ? "सामान्य तापमान पर 5-7 दिन, शीतगृह (10-12°C) में 12-15 दिन" : "5–7 days at room temp, 12–15 days under cool storage (10–12°C)";
    } else if (grade === "Grade B") {
      return isHi ? "सामान्य तापमान पर 3-4 दिन, शीतगृह में 7-10 दिन" : "3–4 days at room temp, 7–10 days under cool storage";
    } else {
      return isHi ? "1-2 दिन (तत्काल उपभोग या प्रसंस्करण)" : "1–2 days (immediate sale or processing)";
    }
  }
}

function generateDefaultDefects(defectRatio, isFullySpoiled, language = "en") {
  const isHi = (language === "hi");
  if (isFullySpoiled) {
    return isHi
      ? ["गंभीर सड़न / फफूंद के घाव", "ऊतक विखंडन व रिसाव"]
      : ["Severe soft rot / fungal lesions", "Tissue breakdown and decay"];
  }
  if (defectRatio <= 5) {
    return isHi
      ? ["कोई स्पष्ट सतह दोष नहीं दिखा"]
      : ["No visible surface defects detected"];
  }
  if (defectRatio <= 20) {
    return isHi
      ? ["हल्के सतही दाग / खरोंच", "मामूली रंग भिन्नता"]
      : ["Minor surface abrasions / spots", "Slight color variation"];
  }
  return isHi
    ? ["दृश्यमान सतही धब्बे व दबाव के निशान", "अधिक पकाव व नरमी के लक्षण"]
    : ["Noticeable surface blemishes and pressure spots", "Advanced maturity and softening"];
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

function getGeminiApiKey() {
  // Reads keys from process.env.GEMINI_API_KEYS or process.env.GEMINI_API_KEY
  const keys = GeminiKeyManager.getAllKeys();
  if (keys.length === 0 || (!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEYS)) {
    throw new Error("GEMINI_API_KEY is not configured on the server. Please set it in your .env file.");
  }
  return keys[0];
}

async function callGeminiWithRetry(endpoint, payload, timeoutMs = 15000, maxRetries = 2) {
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (response.ok) {
        try {
          const { AIChatService } = require('./AIChatService');
          if (AIChatService && AIChatService.setLastSuccessfulCallTime) {
            AIChatService.setLastSuccessfulCallTime(new Date().toISOString());
          }
        } catch (e) {}
        return await response.json();
      }

      const errBody = await response.text().catch(() => '');
      const status = response.status;

      if (status === 401) {
        throw new Error('Gemini API Authentication Failed (401): Invalid GEMINI_API_KEY. ' + errBody);
      }
      if (status === 404) {
        throw new Error('Gemini API Model Not Found (404): Specified model is invalid. ' + errBody);
      }

      if (status === 429) {
        throw new Error('Gemini API 429 (Quota Exceeded): ' + errBody);
      }

      if (status === 503) {
        lastError = new Error('Gemini API 503: ' + errBody);
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn('Gemini Vision API returned 503. Retrying in ' + delay + 'ms (attempt ' + (attempt + 1) + '/' + maxRetries + ')...');
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      } else {
        throw new Error('Gemini API Error (' + status + '): ' + errBody);
      }
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        lastError = new Error('Gemini API request timed out after ' + (timeoutMs / 1000) + 's.');
      } else {
        lastError = err;
      }
      if (err.message && (err.message.includes('(401)') || err.message.includes('(404)'))) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Gemini API call failed after retries.');
}

function isValidImageBuffer(buf) {
  if (!buf || buf.length < 12) return false;
  const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  const isWebp = buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP';
  const isGif = buf.slice(0, 3).toString('ascii') === 'GIF';
  return isJpeg || isPng || isWebp || isGif;
}

class CropQualityAIService {
  static async callGeminiVision(imageBuffer, mimeType = "image/jpeg", requestedCrop = null, language = "en") {
    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const base64Image = imageBuffer.toString("base64");
    const isHi = (language === "hi");

    const allKeys = GeminiKeyManager.getAllKeys();
    if (allKeys.length === 0) {
      throw new Error("GEMINI_API_KEY is not configured on the server. Please set it in your .env file.");
    }

    if (GeminiKeyManager.isCooldownActive()) {
      const remainingSec = Math.round(GeminiKeyManager.getRemainingCooldownMs() / 1000);
      throw new Error(`Gemini API 429: 10-minute cooldown active (${remainingSec}s remaining)`);
    }

    const systemPrompt = `You are a specialized agricultural vision assistant for Indian farmers.
Analyze the provided image of harvested crop/produce strictly for VISIBLE physical quality characteristics.
Examine visible external indicators: surface color uniformity, skin texture firmness, bruises, fungal spots, insect puncture holes, decay/rot lesions, wilt, and signs of overripeness.

CRITICAL Produce Verification:
- First determine if the image actually shows agricultural produce, fruits, vegetables, grains, or crops.
- If the image is NOT produce (e.g. solid color, human, landscape, machinery, household object, blank/corrupt image), return cropName as "Unknown" and confidence below 20.

LANGUAGE REQUIREMENT:
Write the grade_explanation, visibleDefects list, advice (actionable recommendations), and shelf_life text in ${isHi ? "simple Hindi in Devanagari script (e.g. 'उत्कृष्ट रंग...', 'हल्के दाग...')" : "simple English"}.

Return ONLY a valid JSON object matching this exact schema:
{
  "cropName": "Tomato" | "Chilli" | "Onion" | "Potato" | "Banana" | "Rice" | "Unknown",
  "confidence": <number 0-100>,
  "ripeness": "unripe" | "early_ripe" | "ripe" | "overripe" | "spoiled",
  "is_fully_spoiled": <boolean>,
  "defect_ratio_pct": <number 0-100 indicating percentage of surface area with visible defects>,
  "grade_explanation": "<concise explanation of the grade in ${isHi ? 'Hindi' : 'English'}>",
  "shelf_life": "<estimated shelf life under recommended storage in ${isHi ? 'Hindi' : 'English'}>",
  "observations": [<array of concise strings noting color, surface condition, firmness indicators in ${isHi ? 'Hindi' : 'English'}>],
  "visibleDefects": [<array of strings describing visible lesions, bruises, mold, insect damage in ${isHi ? 'Hindi' : 'English'}>],
  "advice": [<array of 2-3 actionable harvesting/storage/mandi recommendations in ${isHi ? 'Hindi' : 'English'}>]
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
    let attempts = 0;
    const maxKeyAttempts = allKeys.length;

    while (attempts < maxKeyAttempts) {
      const apiKey = GeminiKeyManager.getNextAvailableKey();
      if (!apiKey) break;
      attempts++;

      const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
      try {
        const resData = await callGeminiWithRetry(endpoint, payload, 15000, 2);
        const textOutput = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOutput) {
          GeminiKeyManager.markKeySuccess(apiKey);
          const parsed = extractJSON(textOutput);
          parsed._active_model = model;
          parsed._source = "gemini";
          return parsed;
        }
        throw new Error("Empty text output from Gemini Vision API.");
      } catch (err) {
        lastError = err;
        console.error('Gemini Vision call error on ' + model + ' (key attempt ' + attempts + '/' + maxKeyAttempts + '):', err.message);
        if (err.message && err.message.includes('429')) {
          GeminiKeyManager.markKey429(apiKey);
          console.warn('Vision Key placed on 10-minute cooldown. Rotating to next key (if available).');
          continue;
        }
        throw err;
      }
    }
    throw lastError || new Error("All Gemini Vision keys exhausted or on cooldown.");
  }

  static async analyze(imageBuffer, requestedCrop = null, mimeType = "image/jpeg", language = "en") {
    const safeLang = (language === 'hi' || (typeof language === 'string' && language.trim().toLowerCase() === 'hi')) ? 'hi' : 'en';

    if (!imageBuffer || imageBuffer.length < 500) {
      return {
        success: false,
        source: "fallback",
        status: 400,
        error_code: "INVALID_IMAGE",
        message: "Image file is too small or corrupt. Minimum 80x80px required."
      };
    }

    if (imageBuffer.length > 10 * 1024 * 1024) {
      return {
        success: false,
        source: "fallback",
        status: 400,
        error_code: "IMAGE_TOO_LARGE",
        message: "Image file size exceeds the 10MB limit. Please upload a smaller image."
      };
    }

    if (!isValidImageBuffer(imageBuffer)) {
      return {
        success: false,
        source: "fallback",
        status: 422,
        error_code: "INVALID_IMAGE_FORMAT",
        message: "Uploaded file is not a valid image format. Please upload a clear JPG, PNG, or WebP photo of agricultural produce."
      };
    }

    if (requestedCrop && !SUPPORTED_CROPS.includes(requestedCrop)) {
      return {
        success: false,
        source: "fallback",
        status: 400,
        error_code: "UNSUPPORTED_CROP",
        message: `Crop '${requestedCrop}' is not supported. Supported crops: ${SUPPORTED_CROPS.join(", ")}.`
      };
    }

    try {
      const geminiRaw = await this.callGeminiVision(imageBuffer, mimeType, requestedCrop, safeLang);

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
          error_code: "NON_PRODUCE", status: 422, source: "gemini",
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

      const recommendations = (Array.isArray(geminiRaw.advice) && geminiRaw.advice.length > 0)
        ? geminiRaw.advice
        : generateRecommendations(cropName, grade, defectRatio, ripeness, safeLang);

      const gradeExplanation = (typeof geminiRaw.grade_explanation === 'string' && geminiRaw.grade_explanation.trim().length > 0)
        ? geminiRaw.grade_explanation.trim()
        : generateGradeExplanation(cropName, grade, defectRatio, ripeness, safeLang);

      const shelfLife = (typeof geminiRaw.shelf_life === 'string' && geminiRaw.shelf_life.trim().length > 0)
        ? geminiRaw.shelf_life.trim()
        : generateShelfLife(cropName, grade, ripeness, safeLang);

      const finalDefects = (visibleDefects.length > 0)
        ? visibleDefects
        : generateDefaultDefects(defectRatio, isFullySpoiled, safeLang);

      return {
        success: true,
        source: "gemini",
        language: safeLang,
        crop: cropName,
        detection_confidence: confidence,
        confidence_tier: confidence >= 70 ? "HIGH" : "MEDIUM",
        quality_score: qualityScore,
        quality_category: grade,
        grade_explanation: gradeExplanation,
        shelf_life: shelfLife,
        maturity_assessment: isFullySpoiled 
          ? ((safeLang === 'hi') ? "पूर्णतः सड़ा हुआ / उपभोग अयोग्य" : "Fully Spoiled / Unfit for Consumption") 
          : ((safeLang === 'hi') ? `पकाव: ${ripeness.replace('_', ' ')}` : `Ripeness: ${ripeness.replace('_', ' ')}`),
        visible_observations: observations,
        visible_defects: finalDefects,
        visible_metrics: {
          defect_ratio_pct: defectRatio,
          ripeness_stage: ripeness,
          is_fully_spoiled: isFullySpoiled
        },
        recommendations,
        realization_pct: realization,
        model_status: {
          model_name: geminiRaw._active_model || process.env.GEMINI_MODEL || "gemini-3.8-flash",
          provider: "Google Gemini Vision API",
          scoring_engine: "Deterministic KisanMitra Quality & Realization Rules",
          is_honest: true
        }
      };
    } catch (err) {
      console.error("CropQualityAIService error:", err.message);
      return {
        success: false,
        source: "fallback",
        error_code: "AI_SERVICE_UNAVAILABLE",
        status: 503,
        failure_reason: err.message,
        message: err.message.includes("GEMINI_API_KEY")
          ? err.message
          : (safeLang === 'hi' ? "एआई गुणवत्ता मूल्यांकन अभी अनुपलब्ध है। कृपया कुछ देर बाद पुनः प्रयास करें।" : "AI quality assessment is currently unavailable. Please try again shortly.")
      };
    }
  }
}

module.exports = {
  CropQualityAIService,
  SUPPORTED_CROPS,
  calculateQualityScore,
  calculateGrade,
  calculateRealizationRange,
  generateGradeExplanation,
  generateRecommendations,
  generateShelfLife,
  generateDefaultDefects
};
