/**
 * KisanMitra AI Agri Assistant Service
 * Powered by Google Gemini API with multi-language farmer support & resilient agricultural knowledge fallback.
 */

const { GeminiKeyManager } = require('./GeminiKeyManager');

function generateAgriKnowledgeFallback(query = "", history = [], context = {}) {
  const q = (query || "").toLowerCase();
  const isHi = (context?.language === 'hi' || (typeof context?.language === 'string' && context.language.startsWith('hi')));

  // 1. Leaf curl / Virus / Whitefly in Tomato or Chilli / Pest & Insect Management
  if (q.includes("pest") || q.includes("insect") || q.includes("कीट") || q.includes("whitefly") || q.includes("leaf curl") || q.includes("curl") || q.includes("मरोड़") || q.includes("पत्ती") || (q.includes("tomato") && (q.includes("virus") || q.includes("yellow") || q.includes("leaf"))) || (q.includes("chilli") && (q.includes("leaf") || q.includes("curl")))) {
    if (isHi) {
      return `### 🍅 टमाटर और मिर्च में पत्ती मरोड़ (लीफ कर्ल) रोग का प्रबंधन

पत्ती मरोड़ रोग मुख्य रूप से **टोमैटो लीफ कर्ल वायरस (ToLCV)** या मिर्च वायरस के कारण होता है, जो **सफेद मक्खी (*Bemisia tabaci*)** द्वारा फैलता है।

#### 🔍 मुख्य लक्षण
* पत्तियां ऊपर या नीचे की ओर मुड़ना, सिकुड़ना और खुरदरी होना।
* पत्तियों की नसें पीली व मोटी पड़ना।
* पौधों की बढ़वार रुकना (बौनापन) और फल-फूल बहुत कम आना।

#### 🛡️ रोकथाम एवं उपचार
1. **सफेद मक्खी का रासायनिक नियंत्रण:**
   * **इमिडाक्लोप्रिड 17.8% SL** @ **0.5 मिली प्रति लीटर** पानी में घोलकर छिड़कें, या
   * **डाइफेन्थियुरॉन 50% WP** @ **1.2 ग्राम प्रति लीटर** पानी में शाम को छिड़कें।
2. **जैविक एवं प्राकृतिक विकल्प:**
   * **नीम का तेल (10,000 ppm)** @ **3 मिली प्रति लीटर** पानी में 1 मिली लिक्विड साबुन मिलाकर छिड़काव करें।
3. **खेत प्रबंधन:**
   * खेत में **पीले चिपचिपे ट्रैप (Yellow Sticky Traps)** @ 15-20 प्रति एकड़ लगाएं।
   * अधिक संक्रमित पौधों को उखाड़कर तुरंत नष्ट करें ताकि स्वस्थ पौधों में संक्रमण न फैले।`;
    }

    return `### 🍅 Management of Leaf Curl Disease (Tomato & Chilli)

Leaf Curl is primarily caused by **Tomato Leaf Curl Virus (ToLCV)** or Chilli Veinal Mottle Virus, transmitted by **Whiteflies (*Bemisia tabaci*)**.

#### 🔍 Symptoms
* Upward or downward curling and puckering of leaves.
* Thickening and yellowing of leaf veins.
* Stunted plant growth with aborted flower buds.

#### 🛡️ Actionable Remedies
1. **Vector Control (Whitefly Suppression):**
   * Spray **Imidacloprid 17.8% SL** @ **0.5 ml per litre** of water, OR
   * Spray **Diafenthiuron 50% WP** @ **1.2 g per litre** of water during evening hours.
2. **Organic / Botanical Alternative:**
   * Spray **Neem Oil (10,000 ppm)** @ **3 ml per litre** of water with 1 ml liquid soap.
3. **Cultural Practices:**
   * Install **yellow sticky traps** @ 15-20 traps per acre at crop canopy level.
   * Rogue out and safely burn severely infected, stunted plants to halt transmission.
   * Avoid excessive urea/nitrogen application which attracts sucking pests.`;
  }

  // 2. Summer crops / Zaid / Seasonality
  if (q.includes("summer") || q.includes("telangana") || q.includes("what to grow") || q.includes("season") || q.includes("crops grow best") || q.includes("zaid") || q.includes("जायद") || q.includes("गर्मी")) {
    if (isHi) {
      return `### ☀️ ग्रीष्मकालीन (जायद) फसलों की सफल खेती एवं जल प्रबंधन

मार्च से जून की तेज गर्मी में कम अवधि व सूखा-सहनशील फसलें चुनें:

#### 1. उच्च मूल्य वाली सब्जियां
* **भिंडी:** 8-10 दिन के सिंचाई अंतराल पर अत्यधिक लाभकारी। पूसा ए-4 या अर्का अनामिका लगाएं।
* **तरबूज, खरबूजा व खीरा:** ड्रिप सिंचाई व मल्चिंग के साथ 25-30 टन प्रति एकड़ पैदावार।
* **ग्वार फली व लोबिया:** तेज धूप सहने में सक्षम और मिट्टी में नाइट्रोजन बढ़ाती हैं।

#### 2. कम अवधि की दलहन व तिलहन
* **तिल (Sesame):** कम पानी (3-4 सिंचाई) में भरपूर उत्पादन।
* **मूंग व उड़द:** 60-65 दिनों में तैयार होकर खरीफ धान से पहले मिट्टी की उर्वरता बढ़ाती हैं।

#### 💧 जल संरक्षण टिप्स:
* खुली सिंचाई की जगह **ड्रिप सिंचाई** अपनाएं (40-50% पानी की बचत)।
* तेज वाष्पीकरण से बचने के लिए **सुबह (5-8 बजे)** या **शाम** को सिंचाई करें।`;
    }

    return `### ☀️ Best Summer (Zaid) Crops for Semi-Arid Regions

During the hot dry summer (March–June), select heat-tolerant, short-duration crops that conserve moisture:

#### 1. High-Value Vegetables
* **Okra (Bhindi):** Highly profitable; requires 8–10 day irrigation intervals. Use *Arka Anamika* or *Kashi Kranti*.
* **Cucurbits (Watermelon & Muskmelon):** Peak summer demand. Drip irrigation with silver-black mulch yields up to 25–30 tonnes/acre.
* **Cluster Bean (Guar) & Cowpea:** High heat tolerance and fixes soil nitrogen.

#### 2. Short-Duration Pulses & Oilseeds
* **Sesame (Til / Sesame):** Thrives in high temperatures with minimal water (3–4 irrigations).
* **Green Gram (Moong) & Black Gram (Urad):** 60–65 day duration; enriches soil fertility for the upcoming Kharif paddy.

#### 💧 Water & Soil Conservation Tips:
* Adopt **drip irrigation** to save 40–50% water compared to furrow flooding.
* Irrigate during **early morning (5–8 AM)** or **late evening** to minimize evaporative loss.
* Spread organic mulch (paddy straw) around root zones to retain soil moisture.`;
  }

  // 3. PM-KISAN & Government Subsidies
  if (q.includes("pm-kisan") || q.includes("pm kisan") || q.includes("subsidy") || q.includes("6000") || q.includes("scheme") || q.includes("kcc") || q.includes("fasal bima") || q.includes("pmfby") || q.includes("योजना") || q.includes("सब्सिडी")) {
    if (isHi) {
      return `### 💰 प्रमुख सरकारी कृषि योजनाएं एवं सब्सिडी विवरण

#### 1. PM-किसान सम्मान निधि (PM-KISAN)
* **लाभ:** पात्र किसान परिवारों को प्रति वर्ष **₹6,000** की प्रत्यक्ष आर्थिक सहायता (₹2,000 की 3 समान किस्तों में सीधे DBT बैंक खाते में)।
* **स्थिति कैसे जांचें:**
  1. आधिकारिक पोर्टल [pmkisan.gov.in](https://pmkisan.gov.in) पर जाएं।
  2. **'Beneficiary Status'** पर क्लिक कर आधार या रजिस्ट्रेशन नंबर दर्ज करें।
  3. बैंक खाते में **आधार सीडिंग (e-KYC)** पूर्ण होना अनिवार्य है।

#### 2. प्रधानमंत्री फसल बीमा योजना (PMFBY)
* **प्रीमियम दरें:** रबी फसलों के लिए मात्र **1.5%**, खरीफ फसलों के लिए **2%**, और बागवानी फसलों के लिए **5%**।

#### 3. किसान क्रेडिट कार्ड (KCC)
* समय पर ऋण अदायगी पर मात्र **4%** की रियायती ब्याज दर पर **₹3 लाख** तक का फसली ऋण।`;
    }

    return `### 💰 Government Agricultural Schemes & Subsidy Guide

#### 1. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)
* **Benefit:** Direct income support of **₹6,000 per year** in 3 equal installments of **₹2,000** directly to the farmer's bank account via DBT.
* **Eligibility:** All landholding farmer families with cultivable land in their names.
* **How to Check Status:**
  1. Visit official portal: [pmkisan.gov.in](https://pmkisan.gov.in)
  2. Click **"Beneficiary Status"** and enter your Aadhaar or Registration Number.
  3. Ensure your bank account has active **Aadhaar-seeding (e-KYC)** completed.

#### 2. PM Fasal Bima Yojana (PMFBY)
* **Benefit:** Comprehensive crop insurance against drought, floods, pest epidemics, and unseasonal rainfall.
* **Farmer Premium:** Only **1.5%** for Rabi crops, **2%** for Kharif crops, and **5%** for commercial/horticultural crops.

#### 3. Kisan Credit Card (KCC)
* Short-term crop loans up to **₹3 Lakh** at an effective subsidized interest rate of **4%** per annum upon timely repayment.`;
  }

  // 4. Fertilizer Schedule & Soil Health
  if (q.includes("fertilizer") || q.includes("urea") || q.includes("dap") || q.includes("npk") || q.includes("soil") || q.includes("उर्वरक") || q.includes("खाद") || q.includes("यूरिया")) {
    if (isHi) {
      return `### 🌾 संतुलित उर्वरक एवं पोषण प्रबंधन कार्यक्रम

#### 1. बुवाई के समय (बेसल डोज)
* फास्फोरस व पोटाश की पूरी मात्रा: **DAP** @ 50 किग्रा/एकड़ + **MOP (पोटाश)** @ 25 किग्रा/एकड़।
* जिंक की कमी वाली मिट्टी में **जिंक सल्फेट (21%)** @ 10 किग्रा/एकड़ डालें। (जिंक और DAP को कभी एक साथ न मिलाएं)।

#### 2. यूरिया की टॉप ड्रेसिंग (Split Nitrogen)
* **पहला छिड़काव (बुवाई के 21–25 दिन बाद / CRI अवस्था):** पहली सिंचाई के बाद **यूरिया** @ 30–35 किग्रा/एकड़।
* **दूसरा छिड़काव (गाभा / कल्ले फूटते समय):** बची हुई **यूरिया** @ 25 किग्रा/एकड़।

#### 3. जैविक खाद का उपयोग
* बुवाई से 15 दिन पूर्व 2 टन प्रति एकड़ गोबर की सड़ी खाद (FYM) या केंचुआ खाद मिलाएं।`;
    }

    return `### 🌾 Optimal Fertilizer & Nutrition Management Schedule

#### 1. Basal Application (At Sowing / Transplanting)
* Apply full dose of Phosphorus and Potash: **DAP (Di-Ammonium Phosphate)** @ 50 kg/acre + **MOP (Muriate of Potash)** @ 25 kg/acre.
* Add **Zinc Sulphate (21%)** @ 10 kg/acre in zinc-deficient soils. (Never mix Zinc directly with DAP).

#### 2. Split Nitrogen Application (Top Dressing)
* **First Split (21–25 days after sowing/transplanting):** Apply **Urea** @ 30–35 kg/acre after first weeding.
* **Second Split (Panicle Initiation / Flowering stage):** Apply remaining **Urea** @ 25 kg/acre with 0.5% Potash spray.

#### 3. Organic & Bio-fertilizer Boosters
* Incorporate **Well-rotted Farmyard Manure (FYM)** or Vermicompost @ 2 tonnes/acre 15 days prior to sowing.
* Seed treatment with **Azotobacter / Rhizobium** + **PSB (Phosphate Solubilizing Bacteria)** @ 10 g/kg seed enhances nutrient uptake by 20%.`;
  }

  // 5. Produce Storage
  if (q.includes("potato") || q.includes("storage") || q.includes("onion") || q.includes("rotting") || /\brot\b/.test(q) || q.includes("भंडारण") || q.includes("आलू") || q.includes("प्याज")) {
    if (isHi) {
      return `### 🥔 आलू व प्याज का वैज्ञानिक भंडारण एवं सड़न से बचाव

#### 1. आलू भंडारण
* **क्योरिंग:** ताजा खुदाई के बाद कंदों को 15-20°C पर छायादार स्थान में 10-12 दिन रखें ताकि छिलका मजबूत हो सके।
* **भंडारण:** अंधेरे व हवादार कमरे में जूट की बोरियों या क्रेट्स में रखें। धूप से बचाएं ताकि आलू हरा न पड़े।

#### 2. प्याज भंडारण
* कंदों को सूखी हवादार जालीदार संरचनाओं (कांदा चाल) में रखें जिससे नमी न रुके और फफूंद न लगे।`;
    }

    return `### 🥔 Scientific Produce Storage & Spoilage Prevention

#### 1. Potato Post-Harvest Handling
* **Curing:** Keep freshly harvested tubers in a cool, well-ventilated shade at 15–20°C with 85% RH for 10–12 days to heal skin abrasions.
* **Storage Environment:** Maintain diffuse, dark ventilation (prevent greening from solanine). Store at 10–12°C for table potatoes.
* **Avoid:** Storing in plastic sacks. Use breathable jute bags or aerated plastic crates stacked on wooden pallets.

#### 2. Onion Storage
* Cure bulbs in windrows under shade until necks are thoroughly dry and tight.
* Store in traditional aerated structures (*Kanda Chawl*) with raised slotted floors to prevent fungal rotting.`;
  }

  // 6. Mandi Pricing, Lot Grading & Arbitrage
  if (q.includes("mandi") || q.includes("price") || q.includes("apmc") || q.includes("sell") || q.includes("मंडी") || q.includes("भाव") || q.includes("मुनाफा")) {
    if (isHi) {
      return `### 📈 APMC मंडी लॉट ग्रेडिंग एवं मुनाफा बढ़ाने के उपाय

#### 1. खेत पर ही सही ग्रेडिंग
* अपनी उपज को **ग्रेड A** (एक समान आकार, रंग, दाग-धब्बा रहित), **ग्रेड B** और **ग्रेड C** में छांटें।
* मिश्रित लॉट लाने पर व्यापारी पूरे माल का भाव ग्रेड C का लगाते हैं। छंटाई से **15–25%** अधिक मूल्य मिलता है।

#### 2. नमी नियंत्रण (Moisture Control)
* अनाज (गेहूं, धान, मक्का) को मंडी लाने से पहले सुखाकर **12% नमी** तक लाएं।

#### 3. किसानमित्र मंडी आर्बिट्रेज फीचर
* पोर्टल पर **स्मार्ट मंडी आर्बिट्रेज** कैलकुलेटर का उपयोग करें और परिवहन खर्च काटकर सबसे अधिक शुद्ध मुनाफा देने वाली मंडी चुनें।`;
    }

    return `### 📈 APMC Mandi Lot Grading & Profit Maximization Tips

#### 1. Proper Grading Before Bringing to Mandi
* Separate produce into **Grade A** (uniform size, color, zero blemish), **Grade B** (minor cosmetic markings), and **Grade C** (small/culled).
* Mandi commission agents penalize mixed lots by offering Grade C prices for the entire load. Sorting at farm level increases realization by **15–25%**.

#### 2. Moisture Control
* Dry food grains (paddy, wheat, maize) down to **12% moisture** before entry. Exceeding 14% triggers severe buyer moisture deductions.

#### 3. KisanMitra Mandi Arbitrage Feature
* Use the **Mandi Arbitrage Calculator** in the KisanMitra portal to compare live modal prices across nearby APMCs against transport freight costs to pocket the highest net return!`;
  }

  // 7. Weather & Rain Precautions
  if (q.includes("weather") || q.includes("rain") || q.includes("storm") || q.includes("मौसम") || q.includes("बारिश")) {
    if (isHi) {
      return `### 🌧️ बेमौसम बारिश व आंधी से पहले खेत सुरक्षा चेकलिस्ट

1. **जल निकासी:** खेत की मेड़ों के किनारे नालियां साफ करें ताकि खड़ा पानी तुरंत बाहर निकल सके।
2. **छिड़काव रोकें:** बारिश की संभावना होने पर कीटनाशक या उर्वरक का छिड़काव तुरंत टाल दें।
3. **कटी फसल की सुरक्षा:** खलिहान में रखी फसल को ऊंचे स्थान पर रखकर तिरपाल से अच्छी तरह ढकें।
4. **बागवानी सहारा:** आंधी से बचाने के लिए टमाटर, मिर्च व पपीते के पौधों को बांस की खपच्चियों का सहारा दें।`;
    }

    return `### 🌧️ Farm Protection Checklist Before Unseasonal Rain / Storms

1. **Drainage Management:** Deepen field perimeter trenches to allow rapid discharge of excess standing water, preventing root asphyxiation.
2. **Postpone Chemical Sprays:** Do not apply foliar fertilizers, pesticides, or weedicides if rainfall is expected within 24 hours.
3. **Threshing Floor Safety:** Move harvested sheaves or grain heaps to elevated platforms and cover securely with heavy-duty tarpaulins (tirpal).
4. **Horticultural Staking:** Provide bamboo support to tomato, chilli, papaya, and banana plants to prevent lodging under strong winds.`;
  }

  // Default: when question does not match any local agri domain categories
  if (isHi) {
    return "एआई अभी व्यस्त है, कृपया कुछ मिनटों में पुनः प्रयास करें।";
  }

  return "AI is busy, please try again in a few minutes.";
}

let lastSuccessfulCallTime = null;

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
        lastSuccessfulCallTime = new Date().toISOString();
        return await response.json();
      }

      const errBody = await response.text().catch(() => '');
      const status = response.status;

      if (status === 401) {
        throw new Error(`Gemini API Authentication Failed (401): Invalid GEMINI_API_KEY. ${errBody}`);
      }
      if (status === 404) {
        throw new Error(`Gemini API Model Not Found (404): Specified model is invalid. ${errBody}`);
      }

      if (status === 429) {
        throw new Error(`Gemini API 429 (Quota Exceeded): ${errBody}`);
      }

      if (status === 503) {
        lastError = new Error(`Gemini API 503: ${errBody}`);
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`Gemini API returned 503. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      } else {
        throw new Error(`Gemini API Error (${status}): ${errBody}`);
      }
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        lastError = new Error(`Gemini API request timed out after ${timeoutMs / 1000}s.`);
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

class AIChatService {
  static getLastSuccessfulCallTime() {
    return lastSuccessfulCallTime;
  }

  static setLastSuccessfulCallTime(isoTime) {
    lastSuccessfulCallTime = isoTime;
  }
  static getSystemPrompt(userLang = 'en') {
    const rawLang = (typeof userLang === 'string') ? userLang.trim().toLowerCase() : '';
    const normLang = (rawLang === 'hi') ? 'hi' : 'en';
    const isHindi = (normLang === 'hi');
    const targetLang = isHindi ? 'Hindi (हिन्दी)' : 'English';

    return `You are "KisanMitra AI Sahayak (किसानमित्र एआई सहायक)", an authoritative, compassionate, and practical agricultural AI assistant designed specifically for Indian farmers and agricultural officers.

Reply ONLY in the selected language: simple English if en, simple Hindi in Devanagari script if hi, even if the user writes in a different language.

LANGUAGE SUPPORT POLICY (STRICT):
- Selected language code: "${normLang}".
- AI features in KisanMitra support ONLY TWO languages: English and Hindi (हिन्दी).
- The user has chosen: ${targetLang} (${normLang}).
- You MUST formulate your entire response strictly in ${targetLang}.
- If the chosen language is Hindi (hi), formulate your reply in simple Hindi using Devanagari script (हिन्दी) and familiar agricultural terms (जैसे खाद, उर्वरक, छिड़काव, कीट, रोग, मंडी भाव).
- If the chosen language is English (en), formulate your reply in simple English.
- Reply ONLY in the selected language: simple English if en, simple Hindi in Devanagari script if hi, even if the user writes in a different language.
- Do NOT output replies in Tamil, Telugu, Marathi, or any other language. If the user asks a question in another language, reply strictly in the selected language: simple English if en, simple Hindi in Devanagari script if hi.

YOUR CAPABILITIES & KNOWLEDGE:
1. Crop Health & Agronomy: Diagnose plant diseases, leaf curl, blight, pest infestations, nutrient deficiencies, and recommend organic/chemical remedies, spraying timings, and dosages.
2. Soil & Fertilizers: Recommend NPK ratios, bio-fertilizers, vermicompost, urea/DAP applications, and soil health management.
3. Government Schemes & Subsidies: Explain schemes like PM-KISAN, PM Fasal Bima Yojana (PMFBY), Kisan Credit Card (KCC), Sub-Mission on Agricultural Mechanization (SMAM), Solar Pump schemes (PM-KUSUM), and state subsidies.
4. Mandi & Market Insights: Offer tips on APMC mandi operations, grading, moisture control, harvesting techniques, and maximizing market realization.
5. KisanMitra Platform Features: Help farmers understand how to track their mandi queue tokens, evaluate crop quality with the AI Vision Estimator, browse live mandi prices, and interact on the farmer community marketplace.

CRITICAL INSTRUCTIONS:
- Be polite, encouraging, clear, and actionable.
- Format responses cleanly using markdown bullet points and bold highlights for dosages, timings, and names.
- Keep answers practical and easy to follow in the field.
- PRICING & MSP HONESTY RULE:
  * NEVER claim or state "today's price" or "current live price" unless you are quoting verified live price data explicitly provided in the user context.
  * When quoting Minimum Support Price (MSP), state clearly that it is the official government procurement floor price for that specific crop and season (e.g. Rabi 2026-27: Wheat ₹2,425/quintal; Kharif 2026-27: Paddy ₹2,300/quintal), NOT today's spot auction price. Direct farmers to the KisanMitra Mandi section for real-time daily auction rates.`;
  }

  static async chat(messages = [], currentMessage = "", context = {}) {
    // Reads keys from process.env.GEMINI_API_KEYS or process.env.GEMINI_API_KEY
    const allKeys = GeminiKeyManager.getAllKeys();
    if (allKeys.length === 0 || (!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEYS)) {
      throw new Error("GEMINI_API_KEY is not configured on the server. Please set it in your .env file.");
    }

    if (!currentMessage || typeof currentMessage !== "string" || !currentMessage.trim()) {
      throw new Error("Message cannot be empty.");
    }

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const rawLang = (typeof context?.language === 'string') ? context.language.trim().toLowerCase() : '';
    const safeLang = (rawLang === 'hi') ? 'hi' : 'en';
    const safeContext = { ...(context || {}), language: safeLang };

    // 10-Minute Cooldown Guard on per-day 429 quota exhaustion
    if (GeminiKeyManager.isCooldownActive()) {
      const remainingSec = Math.round(GeminiKeyManager.getRemainingCooldownMs() / 1000);
      console.warn(`Gemini 429 10-minute cooldown active (${remainingSec}s remaining). Directly serving KisanMitra domain fallback.`);
      const fallbackReply = generateAgriKnowledgeFallback(currentMessage, messages, safeContext);
      return {
        success: true,
        reply: fallbackReply,
        language: safeLang,
        model: "KisanMitra Agri Engine (Fallback)",
        source: "fallback",
        is_fallback: true,
        quota_notice: "Offline answer (AI quota exhausted)",
        failure_reason: `Gemini API 429 10-minute cooldown active (${remainingSec}s remaining)`,
        timestamp: new Date().toISOString()
      };
    }

    // Prepare contents array for Gemini
    const contents = [];

    if (Array.isArray(messages)) {
      const recent = messages.slice(-10);
      for (const m of recent) {
        if (!m || !m.content) continue;
        const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
        contents.push({
          role,
          parts: [{ text: String(m.content) }]
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: currentMessage.trim() }]
    });

    const payload = {
      system_instruction: {
        parts: [{ text: this.getSystemPrompt(safeLang) }]
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };

    let lastError = null;
    let attempts = 0;
    const maxKeyAttempts = allKeys.length;

    while (attempts < maxKeyAttempts) {
      const apiKey = GeminiKeyManager.getNextAvailableKey();
      if (!apiKey) break; // All keys currently under cooldown
      attempts++;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const resData = await callGeminiWithRetry(endpoint, payload, 15000, 2);
        const replyText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          GeminiKeyManager.markKeySuccess(apiKey);
          return {
            success: true,
            reply: replyText.trim(),
            language: safeLang,
            model: model,
            source: "gemini",
            is_fallback: false,
            timestamp: new Date().toISOString()
          };
        }
      } catch (err) {
        lastError = err;
        console.warn(`Gemini Chat error on ${model} (key attempt ${attempts}/${maxKeyAttempts}):`, err.message);
        if (err.message && err.message.includes('429')) {
          GeminiKeyManager.markKey429(apiKey);
          console.warn(`Key placed on 10-minute cooldown. Rotating to next key (if available).`);
          continue;
        }
        if (err.message && (err.message.includes('(401)') || err.message.includes('(404)'))) {
          throw err;
        }
        break;
      }
    }

    // Resilient Domain Fallback: When remote Gemini is rate-limited (429), unavailable (503), or offline
    console.warn("Activating KisanMitra Agricultural Knowledge Engine fallback:", lastError?.message || "Remote models unavailable");
    const fallbackReply = generateAgriKnowledgeFallback(currentMessage, messages, safeContext);

    return {
      success: true,
      reply: fallbackReply,
      language: safeLang,
      model: "KisanMitra Agri Engine (Fallback)",
      source: "fallback",
      is_fallback: true,
      quota_notice: "Offline answer (AI unavailable)",
      failure_reason: lastError?.message || "Gemini unavailable",
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { AIChatService, generateAgriKnowledgeFallback };
