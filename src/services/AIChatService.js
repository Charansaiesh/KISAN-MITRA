/**
 * KisanMitra AI Agri Assistant Service
 * Powered by Google Gemini Multi-Model API with Multimodal Vision,
 * Real-Time Weather Integration, PJTSAU / Pan-India Agronomic Intelligence,
 * Trilingual (English, Telugu, Hindi) Farmer Support, and Resilient Fallback Engine.
 */

const { GeminiKeyManager } = require('./GeminiKeyManager');
const { WeatherService } = require('./WeatherService');

// Priority candidate models for high availability across free tiers
const CANDIDATE_MODELS = Array.from(new Set([
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.8-flash"
].filter(Boolean)));

/**
 * Deep Agricultural Knowledge Fallback Engine
 * Provides accurate, region-specific, scientifically-grounded agricultural guidance
 * for Indian & Telangana farmers when remote AI APIs are offline or rate-limited.
 */
function generateAgriKnowledgeFallback(query = "", history = [], context = {}) {
  const q = (query || "").toLowerCase();
  const rawLang = context?.language || (typeof context === "string" ? context : "en");
  const isTe = rawLang === "te" || /[\u0C00-\u0C7F]/.test(query);
  const isHi = rawLang === "hi" || /[\u0900-\u097F]/.test(query);

  // 1. Paddy / Rice Leaf Yellowing (Chlorosis, Nitrogen, Zinc Khaira, Stem Borer)
  if ((q.includes("paddy") || q.includes("rice") || q.includes("వరి") || q.includes("धान") || q.includes("चावल")) &&
      (q.includes("yellow") || q.includes("leaf") || q.includes("leaves") || q.includes("పసుపు") || q.includes("ఆకు") || q.includes("पीली") || q.includes("पीला") || q.includes("chlorosis"))) {
    if (isTe) {
      return `### 🌾 వరి ఆకులు పసుపు రంగులోకి మారడానికి కారణాలు & నివారణ చర్యలు (PJTSAU మార్గదర్శకాలు)

వరి పంటలో ఆకులు పసుపు రంగులోకి మారడం అనేది ప్రధానంగా పోషక లోపాలు లేదా చీడపీడల వల్ల సంభవిస్తుంది:

#### 🔍 ప్రధాన కారణాలు & గుర్తించే విధానం:
1. **నత్రజని (Nitrogen) లోపం:**
   * **లక్షణాలు:** పాత (క్రింది) ఆకులు మొదట పసుపు రంగులోకి మారి పై ఆకులకు విస్తరిస్తాయి. మొక్క ఎదుగుదల మందగిస్తుంది.
   * **నివారణ:** ఎకరాకు **20-25 కిలోల యూరియా**ను పైపాటుగా (Top-dressing) వేయాలి లేదా తీవ్రత ఎక్కువగా ఉంటే **2% యూరియా ద్రావణం** (లీటరు నీటికి 20 గ్రాములు) పిచికారీ చేయాలి.

2. **జింక్ (Zinc / ఖైరా) లోపం:**
   * **లక్షణాలు:** పిలకలు కట్టే దశలో మధ్య ఆకులపై తుప్పు లేదా ఇటుక రంగు మచ్చలు ఏర్పడి ఆకులు పసుపు-గోధుమ రంగులోకి మారతాయి.
   * **నివారణ:** లీటరు నీటికి **2 గ్రాముల జింక్ సల్ఫేట్ (21%)** కలిపి 7-10 రోజుల వ్యవధిలో రెండుసార్లు పిచికారీ చేయాలి.

3. **ఇనుము (Iron) లోపం:**
   * **లక్షణాలు:** లేత (పై) ఆకుల ఈనెల మధ్య భాగం తెల్లగా లేదా లేత పసుపు రంగులోకి మారుతుంది. చౌడు నేలల్లో ఇది ఎక్కువగా వస్తుంది.
   * **నివారణ:** లీటరు నీటికి **5 గ్రాముల అన్నభేది (ఫెర్రస్ సల్ఫేట్) + 1 గ్రాము నిమ్మ ఉప్పు** కలిపి పిచికారీ చేయాలి.

4. **కాండం తొలిచే పురుగు (Stem Borer):**
   * **లక్షణాలు:** పిలక దశలో ఆకులు పసుపు రంగులోకి మారి ఎండిపోయి "డెడ్ హార్ట్" ఏర్పడుతుంది.
   * **నివారణ:** **కార్టాప్ హైడ్రోక్లోరైడ్ 50% SP** @ **2 గ్రాములు/లీటరు** లేదా **క్లోరాంట్రానిలిప్రోల్ 18.5% SC** @ **0.3 మి.లీ/లీటరు** నీటికి కలిపి పిచికారీ చేయాలి.`;
    }

    if (isHi) {
      return `### 🌾 धान में पत्तियों का पीलापन: कारण एवं वैज्ञानिक उपचार

धान की फसल में पत्तियों का पीला पड़ना मुख्यतः पोषक तत्वों की कमी या कीट/रोग का संकेत होता है:

#### 🔍 प्रमुख कारण एवं पहचान:
1. **नाइट्रोजन (Nitrogen) की कमी:**
   * **लक्षण:** नीचे की पुरानी पत्तियां पहले नोक से पीली पड़नी शुरू होती हैं। पौधों का विकास रुक जाता है।
   * **उपचार:** **यूरिया** @ **25–30 किग्रा/एकड़** की टॉप ड्रेसिंग करें या **2% यूरिया घोल** (20 ग्राम प्रति लीटर पानी) का छिड़काव करें।

2. **जिंक की कमी (खैरा रोग):**
   * **लक्षण:** रोपाई के 2–3 सप्ताह बाद मध्यम पत्तियों पर भूरे-तांबे जैसे धब्बे उभरते हैं और पत्तियां पीली-कत्थई हो जाती हैं।
   * **उपचार:** **जिंक सल्फेट (21%)** @ **5 किग्रा + 2.5 किग्रा बुझा हुआ चूना** प्रति 200 लीटर पानी में घोलकर प्रति एकड़ छिड़कें।

3. **लोहा (Iron) की कमी:**
   * **लक्षण:** नई ऊपरी पत्तियों की नसें हरी रहती हैं लेकिन बीच का भाग पीला या सफेद हो जाता है।
   * **उपचार:** **फेरस सल्फेट** @ **10 ग्राम + 1 ग्राम साइट्रिक एसिड (नींबू सत्व)** प्रति लीटर पानी में मिलाकर छिड़कें।

4. **तना छेदक कीट (Stem Borer):**
   * **लक्षण:** मुख्य गोभ सूखकर पीली पड़ जाती है (डेड हार्ट)।
   * **उपचार:** **क्लोरांट्रानिलीप्रोल 18.5% SC** @ **0.3 मिली/लीटर** या **कार्टाप हाइड्रोक्लोराइड 50% SP** @ **2 ग्राम/लीटर** पानी में छिड़कें।`;
    }

    return `### 🌾 Diagnostic Guide: Yellow Leaves in Paddy (Rice)

Yellowing (chlorosis) in paddy is driven by distinct nutritional or pest factors. Inspect the leaf position and pattern:

#### 🔍 Primary Causes & Field Differentiation:
1. **Nitrogen (N) Deficiency:**
   * **Symptoms:** Begins uniformly on **older lower leaves** progressing upward; leaves turn pale yellow starting from leaf tips; stunted tillering.
   * **Remedy:** Top-dress **Urea @ 25–30 kg/acre** after weeding, or apply a quick corrective foliar spray of **2% Urea** (20 g/L water).

2. **Zinc (Zn) Deficiency (Khaira Disease):**
   * **Symptoms:** Appears 2–3 weeks after transplanting on **middle leaves** with rusty bronze/brown blotches coalescing over yellowed lamina.
   * **Remedy:** Foliar spray **Zinc Sulphate (21%) @ 5 g/L** + 2.5 g/L slaked lime, or Chelated Zinc (Zn-EDTA 12%) @ 1 g/L.

3. **Iron (Fe) Chlorosis:**
   * **Symptoms:** Appears on **youngest emerging leaves** where interveinal spaces turn creamy white/yellow while veins remain green (common in calcareous/alkaline light soils).
   * **Remedy:** Foliar spray of **Ferrous Sulphate (19%) @ 5–10 g/L** + 1 g/L Citric Acid twice at 7-day intervals.

4. **Stem Borer (*Scirpophaga incertulas*):**
   * **Symptoms:** Central shoot dries up and turns yellow/straw-colored ("Dead Heart"), pulling out easily with chewed bases.
   * **Remedy:** Spray **Chlorantraniliprole 18.5% SC @ 0.3 ml/L** or **Cartap Hydrochloride 50% SP @ 2 g/L** of water.`;
  }

  // 2. Nitrogen Deficiency (General Crops)
  if (q.includes("nitrogen") || q.includes("నత్రజని") || q.includes("नाइट्रोजन") || (q.includes("deficiency") && q.includes("nutrient"))) {
    if (isTe) {
      return `### 🌿 పంటలలో నత్రజని (Nitrogen) లోపం - సమగ్ర యాజమాన్యం

నత్రజని మొక్కల పచ్చదనం, ఆకుల పెరుగుదల మరియు కిరణజన్య సంయోగక్రియకు అత్యంత ముఖ్యమైన పోషకం.

#### 🔍 ప్రధాన లోప లక్షణాలు:
* **క్రింది ఆకులు పసుపుబారడం:** నత్రజని మొక్కలో త్వరగా కదిలే పోషకం కాబట్టి లోపం ముందుగా ముదురు (క్రింది) ఆకులపై కనిపిస్తుంది.
* **మొక్కల ఎదుగుదల లోపించడం:** కాండం సన్నబడి గిడసబారిపోతుంది, పిలకలు లేదా కొమ్మల సంఖ్య తగ్గుతుంది.
* **ఆకుల పరిమాణం తగ్గడం:** ఆకులు చిన్నవిగా, లేత ఆకుపచ్చ నుండి పసుపు రంగులోకి మారతాయి.

#### 🛡️ నివారణ మరియు ఎరువుల మోతాదు:
1. **పైపాటుగా యూరియా:**
   * ఎకరాకు **25-30 కిలోల వేపపూత పూసిన యూరియా (Neem Coated Urea)** ను తేమ ఉన్నప్పుడు వేయాలి.
   * తక్షణ ఫలితం కోసం **2% యూరియా ద్రావణం** (లీటరు నీటికి 20 గ్రాములు) ఆకులపై పిచికారీ చేయవచ్చు.
2. **జీవన ఎరువులు:**
   * వరి కోసం **అజోస్పైరిల్లమ్ / బ్లూ గ్రీన్ ఆల్గే**, ఇతర పంటలకు **అజటోబాక్టర్** @ ఎకరాకు 2 కిలోలు వాడాలి.
3. **సమతుల్య యాజమాన్యం:**
   * కేవలం యూరియా మాత్రమే కాకుండా సిఫార్సు చేసిన మోతాదులో భాస్వరం మరియు పొటాష్ ఎరువులతో సమతుల్యంగా వేయాలి.`;
    }

    if (isHi) {
      return `### 🌿 फसलों में नाइट्रोजन (Nitrogen) की कमी: लक्षण एवं वैज्ञानिक प्रबंधन

नाइट्रोजन पौधों की वनस्पति वृद्धि, क्लोरोफिल निर्माण और पैदावार के लिए प्राथमिक तत्व है:

#### 🔍 मुख्य लक्षण:
* **पुरानी पत्तियों का पीलापन:** नाइट्रोजन पौधे में गतिशील होता है, अतः कमी के लक्षण सबसे पहले **निचली पुरानी पत्तियों** पर दिखते हैं।
* **बौनापन:** पौधों की बढ़वार रुक जाती है, कल्ले (tillers) या शाखाएं कम निकलती हैं।
* **हल्का हरा/पीला रंग:** पत्तियां पतली होकर हल्के हरे से पूर्ण पीली पड़ जाती हैं।

#### 🛡️ सुधारात्मक उपाय:
1. **यूरिया की टॉप-ड्रेसिंग:**
   * खेत में पर्याप्त नमी होने पर **नीम लेपित यूरिया @ 25-30 किग्रा/एकड़** की स्प्लिट खुराक दें।
   * गंभीर कमी की स्थिति में **2% यूरिया घोल (20 ग्राम प्रति लीटर पानी)** का पर्णीय छिड़काव (foliar spray) करें।
2. **जैव उर्वरक का उपयोग:**
   * **एजोटोबैक्टर / एजोस्पिरिलम** कल्चर @ 2 किग्रा प्रति एकड़ मिट्टी में मिलाएं।
3. **संतुलित NPK अनुपात:**
   * केवल यूरिया पर निर्भर न रहें; फॉस्फोरस और पोटाश के साथ संतुलित 4:2:1 अनुपात में प्रयोग करें।`;
    }

    return `### 🌿 Nitrogen (N) Deficiency Symptoms & Correction

Nitrogen is the cornerstone of plant protein synthesis and vegetative canopy development:

#### 🔍 Diagnostic Symptoms:
* **General Chlorosis on Older Foliage:** Because nitrogen is highly mobile inside the plant, it translocates to young growing tips, leaving **lower/older leaves pale yellow first**.
* **V-Shaped Yellowing:** In cereals like maize and sorghum, yellowing starts at the leaf tip and progresses along the midrib in a characteristic 'V' shape.
* **Stunted Architecture:** Stems remain thin, erect, and woody; tillering and branching drop sharply.

#### 🛡️ Corrective Management:
1. **Soil Split Top-Dressing:**
   * Apply **Neem Coated Urea (NCU) @ 25–35 kg/acre** timed with irrigation or adequate soil moisture.
   * Avoid broadcasting in standing water without incorporation to minimize volatilization losses.
2. **Emergency Foliar Rescue:**
   * Spray **2% aqueous Urea solution** (20 g per litre of water) during early morning or late afternoon.
   * For drip-irrigated crops, fertigate with water-soluble 19:19:19 or Urea at 3–4 kg/acre.
3. **Biological Nitrogen Fixation:**
   * Incorporate *Azotobacter* / *Azospirillum* biofertilizers and grow leguminous green manures (Dhaincha / Sunnhemp).`;
  }

  // 3. Organic vs Chemical Fertilizers
  if ((q.includes("organic") || q.includes("సేంద్రీయ") || q.includes("जैविक")) &&
      (q.includes("chemical") || q.includes("రసాయన") || q.includes("रासायनिक") || q.includes("versus") || q.includes("vs") || q.includes("difference") || q.includes("उर्वरक") || q.includes("fertilizer"))) {
    if (isTe) {
      return `### ⚖️ సేంద్రీయ ఎరువులు vs రసాయన ఎరువులు: సమగ్ర పోలిక & ఉత్తమ విధానం

రైతులు తమ పొలంలో గరిష్ట దిగుబడి మరియు భూసారాన్ని కాపాడుకోవడానికి ఈ రెండింటి వ్యత్యాసాన్ని అర్థం చేసుకోవడం చాలా ముఖ్యం:

| లక్షణం | సేంద్రీయ ఎరువులు (Organic) | రసాయన ఎరువులు (Chemical) |
|---|---|---|
| **మూలం** | పశువుల పేడ (FYM), వర్మీకంపోస్ట్, జీవామృతం | పారిశ్రామికంగా తయారైన యూరియా, DAP, MOP |
| **పోషకాలు అందే వేగం**| నెమ్మదిగా, స్థిరంగా మొక్కలకు అందుతాయి | వేగంగా, వెంటనే మొక్కలకు అందుతాయి |
| **భూసారం & సూక్ష్మజీవులు**| నేలలో జీవపదార్థం (Organic Carbon) & వానపాములు పెరుగుతాయి | దీర్ఘకాలంలో నేల గట్టిపడటం, సూక్ష్మజీవులు నశించడం |
| **నీటి నిల్వ సామర్థ్యం**| నేలలో నీటిని నిలిపి ఉంచే శక్తి గణనీయంగా పెరుగుతుంది | నీటి నిల్వ సామర్థ్యంపై ప్రభావం ఉండదు |
| **ఖర్చు & లభ్యత** | స్థానికంగా రైతు సొంతంగా తయారు చేసుకోవచ్చు | మార్కెట్ కొనుగోలుపై ఆధారపడాలి, ఖర్చు ఎక్కువ |

#### 💡 ఉత్తమ విధానం (సమీకృత పోషక యాజమాన్యం - INM):
కేవలం ఒకదానిపైనే ఆధారపడకుండా **70% రసాయన ఎరువులు + 30% సేంద్రీయ ఎరువులు (వర్మీకంపోస్ట్ / పచ్చిరొట్ట ఎరువులు)** కలిపి వాడితే నేల సారవంతం కావడమే కాక అత్యధిక దిగుబడి లభిస్తుంది.`;
    }

    if (isHi) {
      return `### ⚖️ जैविक खाद बनाम रासायनिक उर्वरक: तुलना एवं वैज्ञानिक सिफारिश

मृदा स्वास्थ्य और अधिकतम फसल उत्पादकता के लिए दोनों की कार्यप्रणाली समझना आवश्यक है:

| बिंदु | जैविक खाद (Organic Manure) | रासायनिक उर्वरक (Chemical Fertilizer) |
|---|---|---|
| **पोषक तत्व प्रवाह** | धीमी गति से दीर्घकाल तक निरंतर पोषक तत्व मिलते हैं | तुरंत और तेजी से फसल को उपलब्ध होते हैं |
| **मृदा स्वास्थ्य** | जैविक कार्बन (Organic Carbon) बढ़ता है, मिट्टी भुरभुरी होती है | निरंतर अत्यधिक प्रयोग से मिट्टी अम्लीय/क्षारीय व कठोर होती है |
| **सूक्ष्मजीव** | केंचुए और मित्र जीवाणुओं की संख्या तेजी से बढ़ती है | रासायनिक लवणों के कारण सूक्ष्मजीव घटते हैं |
| **जल धारण क्षमता** | मिट्टी की पानी सोखने और थामने की क्षमता बढ़ती है | जल धारण क्षमता में कोई सुधार नहीं होता |
| **पर्यावरण प्रभाव** | सुरक्षित, भूजल प्रदूषण रहित | लीचिंग से भूजल और पर्यावरण प्रदूषण का खतरा |

#### 💡 किसानहितैषी सिफारिश (एकीकृत पोषक तत्व प्रबंधन - INM):
सर्वश्रेष्ठ परिणाम के लिए **एकीकृत पोषण (70% अनुशंसित रासायनिक + 30% जैविक खाद जैसे गोबर खाद, केंचुआ खाद, हरी खाद)** का प्रयोग करें। इससे उपज भी अधिक मिलती है और जमीन भी बंजर नहीं होती।`;
    }

    return `### ⚖️ Organic Manures vs. Chemical Fertilizers: Comparative Analysis

A sustainable farming strategy requires understanding the distinct roles of organic and synthetic inputs:

| Parameter | Organic Manures (FYM, Vermicompost, Green Manure) | Synthetic Chemical Fertilizers (Urea, DAP, MOP) |
|---|---|---|
| **Nutrient Release** | Slow, sustained release as microbial mineralization occurs | Rapid, immediate availability to plant roots |
| **Soil Organic Carbon (SOC)** | Dramatically builds humic content and sponge-like soil structure | Does not add organic matter; high doses accelerate carbon burn-off |
| **Microbial Ecology** | Nurtures beneficial fungi (Mycorrhiza), rhizobacteria, and earthworms | High chemical salt index can temporarily suppress beneficial soil biology |
| **Moisture Retention** | Increases soil water-holding capacity by up to 20–30% | No direct contribution to moisture buffering |
| **Residual Value** | Benefits subsequent crops across 2–3 growing seasons | Prone to leaching (nitrates) and fixation (phosphorus) |

#### 💡 Agronomist Recommendation (Integrated Nutrient Management - INM):
The most profitable approach is **Integrated Nutrient Management (INM)**: Combine **75% Soil-Test-Based Chemical Fertilizers** with **25% Organic Sources (FYM @ 2–3 tonnes/acre, bio-fertilizers, and green manuring with Dhaincha)**. This maximizes immediate crop yields while building permanent soil fertility.`;
  }

  // 4. Water Requirements for Paddy
  if ((q.includes("water") || q.includes("నీటి") || q.includes("నీరు") || q.includes("पानी") || q.includes("सिंचाई")) &&
      (q.includes("paddy") || q.includes("rice") || q.includes("వరి") || q.includes("धान"))) {
    if (isTe) {
      return `### 💧 వరి పంటలో నీటి యాజమాన్యం: పద్ధతులు & కీలక దశలు

వరి పంటకు జీవితకాలంలో సుమారు **1200-1400 మి.మీ** నీరు అవసరమవుతుంది. నీటిని పొదుపుగా వాడుతూ అధిక దిగుబడి సాధించే పద్ధతులు:

#### 1. కీలక దశలు (నీటి ఎద్దడి ఉండకూడదు):
* **నాట్లు వేసిన మొదటి వారం:** 2-3 సెం.మీ పలుచని నీరు ఉంచాలి (మొక్కలు నాటుకోవడానికి).
* **పిలకలు కట్టే దశ (Tillering):** 2-3 సెం.మీ నీరు చాలు.
* **చిరుపొట్ట మరియు ఈనె దశ (Panicle Initiation & Flowering):** ఈ దశలో ఖచ్చితంగా 3-5 సెం.మీ నిలకడగా నీరు ఉండాలి. ఇక్కడ నీటి ఎద్దడి వస్తే తాలు గింజలు ఏర్పడతాయి.
* **గింజ పాలుపోసుకునే దశ (Milk stage):** తేమ తప్పనిసరి.
* **కోతకు 10-12 రోజుల ముందు:** నీటిని పూర్తిగా తీసివేయాలి (గింజలు గట్టిపడటానికి).

#### 2. ప్రత్యామ్నాయ తడి-ఆరబెట్టే విధానం (AWD - Alternate Wetting & Drying):
* ఎల్లప్పుడూ నీటిని నిల్వ ఉంచకుండా, పొలంలో నీరు ఇంకిపోయి నేల పైభాగంలో చిన్న పగుళ్లు కనిపించగానే తిరిగి తడి ఇవ్వాలి.
* దీనివల్ల **30% నీరు ఆదా** అవుతుంది, వేర్లు బలంగా లోపలికి వెళ్లి మొక్కలు పడిపోకుండా ఉంటాయి.`;
    }

    if (isHi) {
      return `### 💧 धान की फसल में जल प्रबंधन: विधियां एवं क्रांतिक अवस्थाएं

धान में पूरे जीवनकाल में लगभग **1200 से 1400 मिमी** पानी की आवश्यकता होती है:

#### 1. सिंचाई की क्रांतिक अवस्थाएं (Critical Stages):
* **रोपाई के 1 सप्ताह बाद तक:** 2–3 सेमी पानी बनाए रखें ताकि पौधे अच्छी तरह जड़ पकड़ सकें।
* **कल्ले फूटते समय (Tillering):** 2–3 सेमी उथला पानी पर्याप्त है।
* **गाभा अवस्था एवं फूल आते समय (Panicle & Flowering):** 5 सेमी पानी लगातार बना रहना चाहिए। इस समय पानी की कमी से दाने खोखले (पोसिस) रह जाते हैं।
* **दाना भरते समय (Dough stage):** खेत में नमी अनिवार्य है।
* **कटाई से 10–12 दिन पूर्व:** खेत से पानी पूरी तरह निकाल दें ताकि दाना ठोस हो सके और कटाई में सुगमता रहे।

#### 2. जल बचत तकनीक (AWD - Alternate Wetting & Drying):
* लगातार खेत में पानी भरने के बजाय खेत में पानी सूखने पर और हल्की दरारें आने पर ही अगली सिंचाई करें। इससे **30% पानी की बचत** होती है और जड़ों में वायु संचार बढ़ता है।`;
    }

    return `### 💧 Water Management & Irrigation Regimes in Paddy (Rice)

Paddy requires approximately **1,200–1,400 mm** of water across its lifecycle. Flooding the field continuously is neither water-efficient nor optimal for root aeration:

#### 1. Critical Water-Sensitive Stages (Zero Moisture Stress):
* **Initial Establishment (0–7 DAT):** Maintain shallow standing water (2–3 cm) to suppress weed growth and help root anchorage.
* **Active Tillering (20–40 DAT):** Shallow water (2–3 cm). Continuous deep water suppresses tiller emergence.
* **Panicle Initiation & Flowering (Booting to Heading):** **MOST CRITICAL**. Maintain 5 cm standing water. Water stress here causes pollen sterility and high chaffy grain percentage.
* **Grain Filling (Milk to Dough stage):** Soil must stay fully saturated.
* **Pre-Harvest Drainage:** Drain the field completely **10–12 days prior to harvest** to achieve uniform maturity and ease mechanized combine harvesting.

#### 2. Water-Saving Technology (Alternate Wetting and Drying - AWD):
* Adopt the **AWD method**: Re-irrigate only when standing water drops 15 cm below soil surface (monitored with perforated field water pipes). Saves **25–35% irrigation water** and reduces methane emissions without penalty on grain yield.`;
  }

  // 5. Best Paddy Season in Telangana
  if ((q.includes("telangana") || q.includes("తెలంగాణ") || q.includes("तेलंगाना")) &&
      (q.includes("paddy") || q.includes("rice") || q.includes("వరి") || q.includes("धान") || q.includes("season") || q.includes("సమయం") || q.includes("సీజన్") || q.includes("मौसम"))) {
    if (isTe) {
      return `### 🌾 తెలంగాణలో వరి సాగుకు అనుకూలమైన సీజన్లు & PJTSAU సిఫార్సు చేసిన రకాలు

తెలంగాణ వాతావరణంలో వరి ప్రధానంగా రెండు ప్రధాన కాలాల్లో సాగవుతుంది:

#### 1. వానాకాలం (ఖరీఫ్ - Kharif):
* **విత్తే సమయం:** జూన్ 15 నుండి జూలై 15 వరకు నారుమడులు పోసుకోవాలి.
* **నాట్లు వేసే సమయం:** జూలై రెండవ పక్షం నుండి ఆగస్టు మొదటి వారం వరకు.
* **సిఫార్సు రకాలు:**
  * **తెలంగాణ సోనా (RNR 15048):** సన్న గింజ, తక్కువ గ్లైసెమిక్ ఇండెక్స్ (షుగర్ పేషెంట్లకు మంచిది), తెగుళ్లను తట్టుకుంటుంది (125 రోజులు).
  * **సాంబ మసూరి (BPT 5204):** అత్యధిక డిమాండ్ ఉన్న సన్న రకం (145-150 రోజులు).
  * **KNM 118, JGL 24423, MTU 1010, MTU 1061 (ఇంద్ర).**

#### 2. యాసంగి (రబీ - Rabi):
* **విత్తే సమయం:** నవంబర్ 15 నుండి డిసెంబర్ 15 వరకు. (చలి తీవ్రతకు ముందే నారు సిద్ధం కావాలి).
* **నాట్లు వేసే సమయం:** డిసెంబర్ చివరి నుండి జనవరి 15 లోపు పూర్తి చేయాలి.
* **సిఫార్సు రకాలు:** చలిని తట్టుకునే తక్కువ కాలపరిమితి రకాలు ఎంచుకోవాలి:
  * **MTU 1010:** యాసంగికి అత్యంత అనుకూలమైనది (120 రోజులు).
  * **KNM 118, JGL 18047, RNR 15048, ఐఆర్-64 (IR-64).**

#### 📌 ముఖ్య గమనిక:
యాసంగిలో నవంబర్ దాటితే నారుమడులపై రాత్రి వేళల్లో పాలిథిన్ షీట్ కప్పి చలి తీవ్రత నుండి కాపాడుకోవాలి.`;
    }

    if (isHi) {
      return `### 🌾 तेलंगाना में धान की खेती: सर्वोत्तम सीजन, समय एवं अनुशंसित किस्में

तेलंगाना में प्रोफेसर जयशंकर तेलंगाना राज्य कृषि विश्वविद्यालय (PJTSAU) के अनुसार धान दो मुख्य ऋतुओं में उगाया जाता है:

#### 1. वानाकालम (खरीफ - Kharif):
* **नर्सरी का समय:** 15 जून से 15 जुलाई।
* **रोपाई का समय:** 15 जुलाई से 10 अगस्त तक।
* **सर्वश्रेष्ठ किस्में:**
  * **तेलंगाना सोना (RNR 15048):** कम ग्लाइसेमिक इंडेक्स, महीन दाना, ब्लास्ट प्रतिरोधी (125 दिन)।
  * **बीपीटी 5204 (सांबा महसूरी):** उच्च बाजार भाव (145-150 दिन)।
  * **केएनएम 118, जेजीएल 24423, एमटीयू 1010।**

#### 2. यासंगी (रबी - Rabi):
* **नर्सरी का समय:** 15 नवंबर से 15 दिसंबर।
* **रोपाई का समय:** जनवरी के प्रथम पखवाड़े तक।
* **सर्वश्रेष्ठ किस्में:** ठंड सहनशील व कम अवधि वाली किस्में:
  * **एमटीयू 1010 (MTU 1010):** यासंगी के लिए सबसे लोकप्रिय (120 दिन)।
  * **केएनएम 118, जेजीएल 18047, आरएनआर 15048।**`;
    }

    return `### 🌾 Best Paddy Cropping Seasons & Recommended Varieties in Telangana

According to Professor Jayashankar Telangana State Agricultural University (PJTSAU), paddy is cultivated across two distinct seasons in Telangana:

#### 1. Vaanakalam (Kharif Season):
* **Nursery Sowing:** June 15 to July 15 (with arrival of South-West Monsoon).
* **Transplanting Window:** July 15 to August 10.
* **PJTSAU Recommended Varieties:**
  * **Telangana Sona (RNR 15048):** Short slender grain, low Glycemic Index (GI 51.5), blast resistant, 125-day duration.
  * **BPT 5204 (Samba Mahsuri):** Premium market fine grain (145–150 days).
  * **JGL 24423, KNM 118, MTU 1061 (Indra), MTU 1010.**

#### 2. Yasangi (Rabi Season):
* **Nursery Sowing:** November 15 to December 15.
* **Transplanting Window:** Late December to mid-January. (Delaying past Jan 20 causes severe spikelet sterility under March summer heatwaves).
* **PJTSAU Recommended Varieties (Cold-Tolerant & Short Duration):**
  * **MTU 1010:** High yielding, widely adapted for Yasangi (120 days).
  * **KNM 118, JGL 18047, RNR 15048, IR-64.**

#### 📌 Practical Farmer Tip:
In Yasangi, protect young nurseries from nocturnal cold injury during December by covering seedbeds with 100-gauge polythene sheets from 5 PM to 8 AM.`;
  }

  // 6. Protecting Crops During Heavy Rain / Storms (Guarded: zero accidental storage misrouting)
  if ((q.includes("rain") || q.includes("storm") || q.includes("వర్షం") || q.includes("తుఫాను") || q.includes("बारिश") || q.includes("तूफान") || q.includes("flood") || q.includes("waterlog")) &&
      (q.includes("protect") || q.includes("రక్షణ") || q.includes("బచావ్") || q.includes("बचाव") || q.includes("precaution") || q.includes("care") || q.includes("standing"))) {
    if (isTe) {
      return `### 🌧️ భారీ వర్షాలు & తుఫానుల సమయంలో పంటల రక్షణ చర్యలు

భారీ వర్షాలు మరియు నీరు నిలిచిపోయే పరిస్థితుల నుండి నిలబడిన పంటను కాపాడుకోవడానికి అత్యవసర చర్యలు:

#### 1. తక్షణ క్షేత్ర చర్యలు:
* **మురుగు నీటి కాలువలు తెరవడం:** పొలంలో ఎక్కడా నీరు నిల్వ ఉండకుండా గట్ల వెంబడి ప్రధాన మురుగు కాలువలను వెడల్పు చేసి నీటిని వెంటనే బయటకు మళ్లించాలి.
* **మందుల పిచికారీ తక్షణమే నిలిపివేయండి:** వర్షం కురిసే అవకాశం ఉన్నప్పుడు పురుగుమందులు, ఎరువులు లేదా కలుపు మందులు పిచికారీ చేయవద్దు (మందులు కొట్టుకుపోయి వృథా అవుతాయి).
* **పంటల నిలకడ (Staking):** భారీ గాలులకు కూలిపోకుండా టమాటా, మిరప, అరటి, బొప్పాయి చెట్లకు వెదురు బొంగులు లేదా తాళ్ళతో ఊతం ఇవ్వాలి.

#### 2. వర్షం తగ్గిన తర్వాత రక్షణ చర్యలు:
* నీరు తగ్గిన వెంటనే వేరుకుళ్లు, శిలీంధ్ర వ్యాధులు రాకుండా లీటరు నీటికి **3 గ్రాముల కాపర్ ఆక్సిక్లోరైడ్ (COC)** కలిపి మొదళ్ల వద్ద తడపాలి.
* వరద ప్రభావంతో పసుపుబారిన పంట త్వరగా కోలుకోవడానికి **1% యూరియా లేదా 19:19:19 (లీటరుకు 10 గ్రాములు)** ఆకులపై పిచికారీ చేయాలి.
* కోసిన ధాన్యాన్ని లేదా కల్లాల్లో ఉన్న పంటను ఎత్తైన ప్రదేశాలలో ఉంచి టార్పాలిన్లతో గట్టిగా కప్పాలి.`;
    }

    if (isHi) {
      return `### 🌧️ भारी बारिश और जलभराव से खड़ी फसलों की सुरक्षा के उपाय

अत्यधिक वर्षा व आंधी-तूफान के समय फसलों को नुकसान से बचाने हेतु वैज्ञानिक कार्ययोजना:

#### 1. वर्षा से पूर्व व वर्षा के दौरान तात्कालिक कदम:
* **जल निकासी का पुख्ता प्रबंध:** खेत की मेड़ों के किनारे बनी मुख्य जलनिकासी नालियों को तुरंत साफ और गहरा करें ताकि खड़ा पानी 12–24 घंटे के भीतर निकल जाए।
* **स्प्रे तुरंत टालें:** बारिश की संभावना होने पर किसी भी प्रकार के कीटनाशक, खरपतवारनाशक या तरल खाद का छिड़काव न करें।
* **सहारा देना (Staking):** हवा के तेज झोंकों से बचाने हेतु केला, पपीता, टमाटर और मिर्च के पौधों को बांस की खपच्चियों का सहारा दें।

#### 2. वर्षा के बाद सुधारात्मक उपचार:
* जलभराव समाप्त होने पर फफूंद व जड़ सड़न से बचाव के लिए **कॉपर ऑक्सीक्लोराइड (COC) @ 3 ग्राम/लीटर** की दर से जड़ों के पास ड्रेंचिंग करें।
* फसल की पत्तियों में क्लोरोफिल और पोषण वापस लाने के लिए **1% यूरिया या 19:19:19 (10 ग्राम प्रति लीटर)** का पर्णीय छिड़काव करें।
* खलिहान में रखी कटी हुई फसल को ऊंचे चबूतरे पर रखकर तिरपाल से कसकर बांधें।`;
    }

    return `### 🌧️ Protecting Standing Crops During Heavy Rains & Storms

Excessive rainfall and waterlogging cause root asphyxiation and post-flood fungal epidemics. Follow this emergency protocol:

#### 1. Immediate Drainage & Pre-Storm Action:
* **Clear Field Trenches:** Open perimeter field ditches immediately. Water must not remain stagnant in standing crops for more than 12–24 hours.
* **Suspend All Spraying:** Do not apply foliar fertilizers, pesticides, or herbicides if rain is anticipated within 24 hours.
* **Horticultural Staking:** Secure tall or fragile crops (Banana, Tomato, Chilli, Papaya) with bamboo stakes to prevent lodging under gale winds.

#### 2. Post-Rain Recovery Protocol:
* **Anti-Fungal Protection:** Drench root zones with **Copper Oxychloride (COC 50% WP) @ 3 g/L** or **Metalaxyl + Mancozeb @ 2 g/L** to prevent damping-off, collar rot, and bacterial wilt.
* **Revival Nutrient Spray:** Once water drains, spray **1% Urea + 1% Potassium Nitrate (13:0:45) @ 10 g/L** to stimulate root respiration and rapidly reverse chlorosis.
* **Harvested Produce:** Move all harvested sheaves to elevated covered sheds. Use heavy 250+ GSM HDPE tarpaulins with proper sandbag anchors.`;
  }

  // 7. Pest & Disease Management (Tomato / Chilli / General Leaf Curl)
  if (q.includes("pest") || q.includes("insect") || q.includes("leaf curl") || q.includes("whitefly") || q.includes("పురుగు") || q.includes("తెగులు") || q.includes("కీటకాలు") || q.includes("कीट") || q.includes("पत्ती मरोड़")) {
    if (isTe) {
      return `### 🍅 టమాటా & మిరపలో ఆకుముడత (Leaf Curl) & రసం పీల్చే పురుగుల నివారణ

ఆకుముడత తెగులు ప్రధానంగా **తెల్లదోమ (Whitefly)** మరియు **తామర పురుగులు (Thrips)** ద్వారా వ్యాపిస్తుంది:

#### 🔍 ప్రధాన లక్షణాలు:
* ఆకులు పైకి లేదా క్రిందికి ముడుచుకుపోయి పడవ ఆకారంలో మారడం.
* ఆకుల ఈనెలు దళసరిగా మారి మొక్క గిడసబారడం.

#### 🛡️ నివారణ చర్యలు:
1. **తెల్లదోమ & రసం పీల్చే పురుగుల నియంత్రణ:**
   * **ఎసిఫేట్ 75% SP** @ **1.5 గ్రాములు/లీటరు** లేదా **ఇమిడాక్లోప్రిడ్ 17.8% SL** @ **0.5 మి.లీ/లీటరు** నీటికి కలిపి పిచికారీ చేయాలి.
   * తామర పురుగుల (Black Thrips) ఉధృతి ఎక్కువగా ఉంటే **స్పైనోసాడ్ 45% SC** @ **0.3 మి.లీ/లీటరు** లేదా **ఫిప్రోనిల్ 5% SC** @ **2 మి.లీ/లీటరు** వాడాలి.
2. **సేంద్రీయ ప్రత్యామ్నాయం:**
   * **వేపనూనె (10,000 ppm)** @ **3 మి.లీ/లీటరు** నీటికి కలిపి సాయంత్రం వేళల్లో పిచికారీ చేయాలి.
3. **క్షేత్ర పరిశుభ్రత:**
   * ఎకరాకు **15-20 పసుపు మరియు నీలి రంగు జిగురు అట్టలు (Yellow & Blue Sticky Traps)** అమర్చాలి.`;
    }

    if (isHi) {
      return `### 🍅 टमाटर एवं मिर्च में पत्ती मरोड़ (लीफ कर्ल) व कीट प्रबंधन

यह रोग **सफेद मक्खी (Whitefly)** और **थ्रिप्स** द्वारा वायरस फैलने के कारण होता है:

#### 🛡️ रासायनिक एवं जैविक नियंत्रण:
1. **सफेद मक्खी नियंत्रण:**
   * **इमिडाक्लोप्रिड 17.8% SL** @ **0.5 मिली/लीटर** या **डाइफेन्थियुरॉन 50% WP** @ **1.2 ग्राम/लीटर** पानी में मिलाकर छिड़कें।
2. **जैविक विकल्प:**
   * **नीम तेल (10,000 ppm)** @ **3 मिली/लीटर** पानी में 1 मिली शैंपू मिलाकर छिड़कें।
3. **खेत प्रबंधन:**
   * खेत में **15-20 पीले चिपचिपे ट्रैप (Yellow Sticky Traps)** लगाएं। रोगग्रस्त पौधों को उखाड़कर नष्ट करें।`;
    }

    return `### 🍅 Integrated Management of Leaf Curl Disease & Sucking Pests

Leaf curl is a viral complex transmitted by **Whiteflies (*Bemisia tabaci*)** and **Thrips (*Scirtothrips dorsalis*)**:

#### 🛡️ Management Strategy (IPM Protocol):
1. **Vector Management:**
   * Spray **Imidacloprid 17.8% SL @ 0.5 ml/L** OR **Diafenthiuron 50% WP @ 1.2 g/L** during early morning or evening hours.
   * If black thrips are predominant, use **Spinosad 45% SC @ 0.3 ml/L** or **Fipronil 5% SC @ 2 ml/L**.
2. **Botanical / Organic Option:**
   * Foliar spray of **Cold-pressed Neem Oil (10,000 ppm) @ 3 ml/L** with mild liquid soap emulsifier.
3. **Cultural & Physical Traps:**
   * Install **Yellow Sticky Traps (15–20/acre)** for whiteflies and **Blue Sticky Traps** for thrips.
   * Rogue out severely infected, stunted plants immediately to prevent viral reservoirs.`;
  }

  // 8. Produce Storage (Guarded: exact word boundaries on rot/rotting)
  if (q.includes("storage") || q.includes("potato") || q.includes("onion") || /\b(rot|rotting|rotten)\b/.test(q) || q.includes("भंडारण") || q.includes("నిల్వ")) {
    if (isTe) {
      return `### 🥔 ఆలుగడ్డ, ఉల్లిపాయ మరియు ధాన్యం శాస్త్రీయ నిల్వ పద్ధతులు

దిగుబడిని నిల్వ ఉంచే సమయంలో కుళ్ళిపోకుండా మరియు బరువు తగ్గకుండా కాపాడుకోవడానికి:

1. **ఆలుగడ్డ (బంగాళాదుంప):**
   * తవ్విన తర్వాత 15-20°C ఉష్ణోగ్రత వద్ద నీడలో 10-12 రోజులు ఆరబెట్టాలి (Curing).
   * చీకటి మరియు గాలి తగిలే గదులలో జనుము సంచులలో లేదా చెక్క డబ్బాలలో నిల్వ చేయాలి. సూర్యకాంతి తగిలితే ఆలుగడ్డ పచ్చగా మారి విషపూరితమవుతుంది.
2. **ఉల్లిపాయలు:**
   * నేలపై కాకుండా వెదురు రెంజిలు లేదా ఎత్తైన గాలి ఆడే షెడ్లలో (కందా చావ్ల్) పలుచగా పరచి నిల్వ చేయాలి.
3. **వరి & ఇతర ధాన్యాలు:**
   * ధాన్యాన్ని ఎండబెట్టి తేమ శాతం **12% కంటే తక్కువగా** ఉన్నప్పుడు మాత్రమే నిల్వ చేయాలి.`;
    }

    if (isHi) {
      return `### 🥔 आलू व प्याज का वैज्ञानिक भंडारण एवं सड़न से बचाव

1. **आलू भंडारण:**
   * खुदाई के तुरंत बाद 10-12 दिन छायादार हवादार स्थान पर रखें ताकि छिलका मजबूत हो जाए।
   * अंधेरे, हवादार कमरे में जूट की बोरियों में रखें। धूप से बचाएं ताकि आलू हरा न पड़े।
2. **प्याज भंडारण:**
   * कंदों को सूखी, हवादार जालीदार संरचनाओं (कांदा चाल) में रखें जिससे नमी न रुके और सड़न न फैले।
3. **अनाज में नमी:**
   * भंडारण से पहले अनाज को सुखाकर नमी **12% से कम** लाएं।`;
    }

    return `### 🥔 Scientific Post-Harvest Storage & Spoilage Prevention

1. **Potato Curing & Storage:**
   * Cure harvested tubers at 15–20°C in diffuse shade for 10–12 days to heal surface skin cuts.
   * Store in breathable jute bags on wooden dunnage in cool, dark, well-ventilated chambers (avoid light exposure to prevent green solanine toxic accumulation).
2. **Onion Curing:**
   * Cure under shaded windrows until necks are completely dry and papery. Store on slatted bamboo platforms with free air circulation.
3. **Grain Moisture Benchmark:**
   * Ensure grain moisture is strictly below **12%** before bagging to prevent fungal heating and weevil multiplication.`;
  }

  // 9. Government Schemes & Subsidies (Rythu Bharosa, PM-KISAN, PMFBY)
  if (q.includes("pm-kisan") || q.includes("subsidy") || q.includes("rythu") || q.includes("scheme") || q.includes("రైతు భరోసా") || q.includes("योजना") || q.includes("सब्सिडी")) {
    if (isTe) {
      return `### 💰 ప్రధాన ప్రభుత్వ రైతు సంక్షేమ పథకాలు & సబ్సిడీలు

#### 1. పీఎం-కిసాన్ (PM-KISAN):
* **సహాయం:** అర్హులైన రైతులకు సంవత్సరానికి **₹6,000** (₹2,000 చొప్పున 3 విడతల్లో నేరుగా బ్యాంకు ఖాతాలో DBT ద్వారా జమ).
* **అర్హత:** pmkisan.gov.in లో e-KYC మరియు ఆధార్ లింక్ తప్పనిసరి.

#### 2. రైతు భరోసా (తెలంగాణ):
* తెలంగాణ ప్రభుత్వం ద్వారా వ్యవసాయ పెట్టుబడి సహాయం అందించబడుతుంది.

#### 3. ప్రధానమంత్రి ఫసల్ బీమా యోజన (PMFBY):
* ప్రకృతి వైపరీత్యాల నుండి పంట నష్టపరిహార బీమా. రబీ పంటలకు కేవలం **1.5%**, ఖరీఫ్ పంటలకు **2%** తక్కువ ప్రీమియం.

#### 4. కిసాన్ క్రెడిట్ కార్డ్ (KCC):
* సకాలంలో చెల్లింపు చేసే రైతులకు కేవలం **4% రాయితీ వడ్డీ రేటుతో ₹3 లక్షల వరకు** పంట రుణాలు.`;
    }

    if (isHi) {
      return `### 💰 प्रमुख सरकारी कृषि योजनाएं एवं सब्सिडी

#### 1. PM-किसान सम्मान निधि:
* प्रति वर्ष **₹6,000** की प्रत्यक्ष आर्थिक सहायता (₹2,000 की 3 समान किस्तों में DBT द्वारा)। [pmkisan.gov.in](https://pmkisan.gov.in) पर e-KYC अनिवार्य।
#### 2. PM फसल बीमा योजना (PMFBY):
* प्राकृतिक आपदाओं से फसल सुरक्षा। रबी फसलों के लिए मात्र 1.5% एवं खरीफ के लिए 2% प्रीमियम।
#### 3. किसान क्रेडिट कार्ड (KCC):
* समय पर अदायगी पर मात्र **4% रियायती ब्याज दर** पर ₹3 लाख तक का फसली ऋण।`;
    }

    return `### 💰 Major Agricultural Schemes & Financial Support

1. **PM-KISAN (Pradhan Mantri Kisan Samman Nidhi):**
   * Direct income support of **₹6,000/year** paid in three 4-monthly installments of ₹2,000 via DBT. Requires active e-KYC on pmkisan.gov.in.
2. **PM Fasal Bima Yojana (PMFBY):**
   * Comprehensive crop insurance against drought, floods, and unseasonal rainfall. Farmer premium is only **1.5% for Rabi crops, 2% for Kharif crops**.
3. **Kisan Credit Card (KCC):**
   * Short-term crop production credit up to **₹3 Lakh at an effective subsidized rate of 4% per annum** upon prompt repayment.`;
  }

  // 10. General-Purpose Questions Outside Agriculture
  if (q.includes("math") || q.includes("program") || q.includes("code") || q.includes("calculate") || q.includes("solve") || q.includes("what is") || q.includes("who is")) {
    if (isTe) {
      return `నమస్కారం! నేను కిసాన్ మిత్ర సహాయకుడిని. వ్యవసాయ సంబంధిత ప్రశ్నలతో పాటు సాధారణ విజ్ఞానం, గణితం మరియు సాంకేతిక సందేహాలకు కూడా సహాయం చేయగలను. మీ ప్రశ్నకు పూర్తి వివరాలు ఇవ్వండి, నేను సంతోషంగా సమాధానమిస్తాను.`;
    }
    if (isHi) {
      return `नमस्ते! मैं किसानमित्र सहायक हूँ। कृषि के साथ-साथ मैं गणित, विज्ञान, सामान्य ज्ञान एवं तकनीकी प्रश्नों का सटीक उत्तर देने में सक्षम हूँ। कृपया अपना प्रश्न स्पष्ट रूप से पूछें।`;
    }
    return `Hello! I am your KisanMitra Assistant. In addition to farming and agricultural advisory, I am capable of answering mathematics, coding, science, education, and general knowledge questions. Please state your exact question and I will be glad to assist you.`;
  }

  // Universal Default Fallback
  if (isTe) {
    return "నమస్కారం రైతు మిత్రమా! ఎఐ సర్వర్ ప్రస్తుతం అధిక రద్దీలో ఉంది. దయచేసి కొన్ని నిమిషాల తర్వాత తిరిగి ప్రయత్నించండి లేదా మీ పంట పేరు మరియు సమస్యను వివరంగా తెలపండి.";
  }
  if (isHi) {
    return "नमस्ते किसान मित्र! एआई सर्वर अभी व्यस्त है, कृपया कुछ ही मिनटों में पुनः प्रयास करें अथवा अपनी फसल और समस्या का विवरण लिखकर पूछें।";
  }
  return "Namaste Kisan Mitra! The AI service is currently busy handling high demand. Please try again in a few moments or provide details about your specific crop and query.";
}

let lastSuccessfulCallTime = null;

async function callGeminiWithRetry(endpoint, payload, timeoutMs = 18000, maxRetries = 1) {
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
        throw new Error(`Gemini API 401: Invalid API key. ${errBody}`);
      }
      if (status === 404) {
        throw new Error(`Gemini API 404: Model not found. ${errBody}`);
      }
      if (status === 429) {
        throw new Error(`Gemini API 429: Quota exceeded. ${errBody}`);
      }
      if (status === 503) {
        lastError = new Error(`Gemini API 503: High demand spike. ${errBody}`);
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
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
      if (err.message && (err.message.includes('401') || err.message.includes('404') || err.message.includes('429'))) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Gemini API call failed after retries.');
}

const callGeminiEndpoint = callGeminiWithRetry;

class AIChatService {
  static getLastSuccessfulCallTime() {
    return lastSuccessfulCallTime;
  }

  static setLastSuccessfulCallTime(isoTime) {
    lastSuccessfulCallTime = isoTime;
  }

  static getSystemPrompt(userLang = 'en', liveWeatherContext = null, cropAnalysisContext = null) {
    const raw = (typeof userLang === 'string') ? userLang.trim().toLowerCase() : 'en';
    const isTe = raw === 'te';
    const isHi = raw === 'hi';
    const targetLang = isTe ? 'Telugu (తెలుగు)' : (isHi ? 'Hindi (हिन्दी)' : 'English');

    let weatherBlock = "";
    if (liveWeatherContext) {
      weatherBlock = `
=== VERIFIED LIVE WEATHER DATA (GROUND TRUTH) ===
Location: ${liveWeatherContext.location?.name || "Target Region"}
Current: ${liveWeatherContext.current?.temperature_c}°C, ${liveWeatherContext.current?.condition} (${liveWeatherContext.current?.emoji || ""}), Humidity: ${liveWeatherContext.current?.relative_humidity_pct}%, Wind: ${liveWeatherContext.current?.wind_speed_kmh} km/h
Spray Advisory: ${liveWeatherContext.advisories?.spray_advisory || ""}
Drainage Advisory: ${liveWeatherContext.advisories?.drainage_advisory || ""}
Forecast Next Days:
${(liveWeatherContext.forecast || []).slice(0, 4).map(f => `- ${f.day} (${f.date}): Max ${f.temp_max}°C, Min ${f.temp_min}°C, Rain Chance: ${f.rain_probability_pct}%, Precip: ${f.rain_sum_mm}mm, ${f.condition}`).join("\n")}
* RULE: When the user asks about weather, rain, spraying, or crop safety, base your recommendations directly on these verified numbers. Do not invent contradictory forecast data.
`;
    }

    let cropContextBlock = "";
    if (cropAnalysisContext) {
      cropContextBlock = `
=== RECENT CROP ANALYSIS CONTEXT IN ACTIVE CONVERSATION ===
Crop: ${cropAnalysisContext.crop || "Unknown"}
Observed Symptoms: ${cropAnalysisContext.symptoms || "Visual indicators noted"}
Diagnosis / Cause: ${cropAnalysisContext.diagnosis || "Under evaluation"}
* RULE: When the farmer asks follow-up questions ("Why did this happen?", "How to stop it spreading?", "Will it affect yield?", "What to do first?"), remember and maintain this exact crop context.
`;
    }

    return `You are "KisanMitra AI Sahayak (రైతు మిత్ర / किसान मित्र सहायक)", an authoritative, compassionate, practical agricultural AI assistant and expert advisor for Indian farmers, especially in Telangana and broader Indian agro-climatic zones.

LANGUAGE DIRECTIVE (CRITICAL):
- Target Response Language: ${targetLang}.
- If ${isTe ? 'true' : 'false'}, respond in natural, fluent, respectful Telugu (తెలుగు) using proper agricultural vocabulary (ఉదా: వరి, పత్తి, మిరప, ఆకుముడత, పురుగు మందుల మోతాదు, ఎరువులు, సాగు నీటి యాజమాన్యం).
- If ${isHi ? 'true' : 'false'}, respond in clear, simple Hindi (हिन्दी) in Devanagari script.
- If English, respond in simple, practical English.
- If the user explicitly asks to explain or translate into Telugu, Hindi, or English, always respect their requested language immediately.

YOUR CORE EXPERTISE:
1. Crop Health & Photo Diagnostics:
   - When inspecting crop/plant photos, follow the 6-part framework:
     A. Crop Identification (likely crop or state uncertainty if image is unclear).
     B. Visible Symptoms (describe exact visible lesions, spots, yellowing, curling, holes — never hallucinate invisible symptoms).
     C. Possible Causes (diseases, pests, nutrient deficiencies, environmental heat/water stress).
     D. Confidence & Limitations (qualitative confidence, state limitations of photo, suggest closer angles).
     E. Recommended Next Actions (immediate low-risk steps, what to check in field).
     F. Treatment Guidance (IPM first, cultural/botanical remedies first, responsible chemical guidance with cautions, never invent unapproved pesticides).
2. Regional Agricultural Intelligence:
   - Deep knowledge of Telangana cropping patterns: PJTSAU recommendations, Vaanakalam (Kharif) and Yasangi (Rabi) cycles, popular varieties (Telangana Sona / RNR 15048, BPT 5204, MTU 1010, KNM 118, JGL 24423).
   - Major crops: Paddy/Rice, Cotton (Pink bollworm & sucking pests), Chilli (Thrips & Gemini leaf curl), Maize (Fall Armyworm), Pulses, Turmeric, Vegetables.
3. Weather-Driven Agronomy:
   - Correlate live weather with field tasks: delay sprays when rain chance > 40% or wind > 18 km/h; field trenching for heavy rains; post-flood foliar revival.
4. Soil, Fertilizer & Water Management:
   - Split application of nitrogen (Neem Coated Urea), DAP, MOP, micronutrients (Zinc, Iron, Boron), FYM, Vermicompost, and Alternate Wetting and Drying (AWD).
5. Government Schemes & Subsidies:
   - Accurate explanations of PM-KISAN, Rythu Bharosa / Bandhu, PM Fasal Bima (PMFBY), Kisan Credit Card (KCC).
6. GENERAL QUESTIONS POLICY:
   - While farming is your primary purpose, you are ALSO capable of directly answering mathematics, coding (Python, C, JS), physics, science, translation, education, and general conversational questions.
   - If the user switches topics to a non-farming query, answer it directly, accurately, and politely without forcing it into agricultural advice.

FORMATTING & TONE:
- Format cleanly with markdown bullet points, bold key terms and dosages.
- Be polite, encouraging, practical, and honest.
${weatherBlock}
${cropContextBlock}`;
  }

  /**
   * Main Chat Dispatcher with Multi-Model Failover, Multimodal Vision, and Live Weather
   */
  static async chat(messages = [], currentMessage = "", context = {}, image = null) {
    const allKeys = GeminiKeyManager.getAllKeys();
    if (allKeys.length === 0 || (!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEYS)) {
      throw new Error("GEMINI_API_KEY is not configured on the server. Please set it in your .env file.");
    }

    if (!currentMessage || typeof currentMessage !== "string" || !currentMessage.trim()) {
      if (!image) {
        throw new Error("Message or image is required.");
      }
      currentMessage = "Please analyze this crop photograph and provide diagnostic guidance.";
    }

    // Determine Language (en, hi, te)
    let rawLang = (typeof context?.language === 'string') ? context.language.trim().toLowerCase() : '';
    if (!rawLang || (rawLang !== 'hi' && rawLang !== 'te' && rawLang !== 'en')) {
      if (/[\u0C00-\u0C7F]/.test(currentMessage)) rawLang = 'te';
      else if (/[\u0900-\u097F]/.test(currentMessage)) rawLang = 'hi';
      else rawLang = 'en';
    }
    const safeLang = rawLang;
    const safeContext = { ...(context || {}), language: safeLang };

    // Weather Context Resolution: Check if query relates to weather, rain, spraying, or forecast
    let liveWeather = null;
    const weatherKeywords = /weather|rain|storm|forecast|temperature|humidity|spray|వర్షం|వాతావరణం|తుఫాను|मौसम|बारिश/i;
    if (weatherKeywords.test(currentMessage) || context.fetchWeather) {
      try {
        const loc = context.location || "Warangal, Telangana";
        liveWeather = await WeatherService.getWeatherByLocation(loc);
      } catch (err) {
        console.warn("Live weather lookup during chat skipped:", err.message);
      }
    }

    // Prepare contents array for Gemini API
    const contents = [];

    if (Array.isArray(messages)) {
      const recent = messages.slice(-10);
      for (const m of recent) {
        if (!m || !m.content) continue;
        const role = (m.role === "assistant" || m.role === "model") ? "model" : "user";
        contents.push({
          role,
          parts: [{ text: String(m.content) }]
        });
      }
    }

    // Construct current user parts (with image if provided)
    const userParts = [];
    if (image && image.data) {
      userParts.push({
        inline_data: {
          mime_type: image.mimeType || "image/jpeg",
          data: image.data
        }
      });
    }
    userParts.push({ text: currentMessage.trim() });

    contents.push({
      role: "user",
      parts: userParts
    });

    const payload = {
      system_instruction: {
        parts: [{ text: this.getSystemPrompt(safeLang, liveWeather, context.activeCropDiagnosis) }]
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1200
      }
    };

    let lastError = null;
    const apiKey = GeminiKeyManager.getNextAvailableKey() || allKeys[0];

    // Multi-Model Cascade: iterate through candidate models upon 429 / 503
    for (const modelCandidate of CANDIDATE_MODELS) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelCandidate}:generateContent?key=${apiKey}`;

      try {
        const resData = await callGeminiEndpoint(endpoint, payload, 18000);
        const replyText = resData?.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;

        if (replyText) {
          GeminiKeyManager.markKeySuccess(apiKey);
          return {
            success: true,
            reply: replyText.trim(),
            language: safeLang,
            model: modelCandidate,
            source: "gemini",
            is_fallback: false,
            weather_grounded: Boolean(liveWeather),
            image_analyzed: Boolean(image && image.data),
            timestamp: new Date().toISOString()
          };
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelCandidate} failed: ${err.message}. Cascading to next candidate...`);
        // If 401 (auth failure), do not retry other models with same key
        if (err.message.includes("401")) {
          throw err;
        }
      }
    }

    // If all remote models fail, serve the deep agricultural knowledge fallback
    console.warn("Activating enhanced KisanMitra Knowledge Fallback Engine:", lastError?.message || "Remote models unavailable");
    const fallbackReply = generateAgriKnowledgeFallback(currentMessage, messages, safeContext);

    return {
      success: true,
      reply: fallbackReply,
      language: safeLang,
      model: "KisanMitra Knowledge Engine (Offline Fallback)",
      source: "fallback",
      is_fallback: true,
      quota_notice: "Offline answer (AI server busy)",
      failure_reason: lastError?.message || "Remote models unavailable",
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { AIChatService, generateAgriKnowledgeFallback };
