const { AIChatService } = require('../services/AIChatService');

exports.sendMessage = async (req, res) => {
  try {
    const { message, history, context, language, image } = req.body;

    const hasMessage = message && typeof message === 'string' && message.trim().length > 0;
    const hasImage = image && (typeof image === 'object') && (image.data || image.base64);

    if (!hasMessage && !hasImage) {
      return res.status(400).json({
        success: false,
        source: 'fallback',
        error_code: 'INVALID_MESSAGE',
        message: 'A non-empty text message or crop image is required.'
      });
    }

    // Language resolution: support "te" (Telugu), "hi" (Hindi), "en" (English)
    let rawLang = (typeof language === 'string' && language.trim())
      ? language.trim().toLowerCase()
      : (typeof context?.language === 'string' ? context.language.trim().toLowerCase() : '');

    let chosenLang = 'en';
    if (rawLang === 'te' || rawLang.startsWith('te')) chosenLang = 'te';
    else if (rawLang === 'hi' || rawLang.startsWith('hi')) chosenLang = 'hi';

    // Format optional image payload
    let imagePayload = null;
    if (hasImage) {
      const rawData = image.data || image.base64;
      const cleanData = typeof rawData === 'string' ? rawData.replace(/^data:image\/[a-zA-Z]+;base64,/, '') : '';
      if (cleanData.length > 0) {
        imagePayload = {
          data: cleanData,
          mimeType: image.mimeType || 'image/jpeg'
        };
      }
    }

    const mergedContext = { ...(context || {}), language: chosenLang };
    const chatResponse = await AIChatService.chat(history || [], message || "", mergedContext, imagePayload);
    return res.status(200).json(chatResponse);
  } catch (error) {
    console.error('Chat Controller Error:', error.message);
    const rawLang = (typeof req.body?.language === 'string') ? req.body.language.trim().toLowerCase() : '';
    const isTe = rawLang === 'te';
    const isHi = rawLang === 'hi';

    let fallbackMsg = 'AI is busy, please try again in a few minutes.';
    if (isTe) fallbackMsg = 'ఎఐ సర్వర్ ప్రస్తుతం రద్దీగా ఉంది, దయచేసి కాసేపటి తర్వాత ప్రయత్నించండి.';
    else if (isHi) fallbackMsg = 'एआई अभी व्यस्त है, कृपया कुछ मिनटों में पुनः प्रयास करें।';

    return res.status(500).json({
      success: false,
      source: 'fallback',
      error_code: 'CHAT_ERROR',
      message: error.message.includes('GEMINI_API_KEY') ? error.message : fallbackMsg
    });
  }
};

exports.getSuggestions = (req, res) => {
  const lang = (req.query.lang || "en").toLowerCase();
  let suggestions = [];

  if (lang === "te") {
    suggestions = [
      { text: "🌾 వరి ఆకులు పసుపుబారడానికి కారణాలు & నివారణ?", category: "crop_health" },
      { text: "🌧️ రేపటి వర్షం నా పంటపై ప్రభావం చూపుతుందా?", category: "weather" },
      { text: "🌿 సేంద్రీయ మరియు రసాయన ఎరువుల మధ్య తేడా ఏమిటి?", category: "fertilizers" },
      { text: "💰 తెలంగాణ రైతు భరోసా & పీఎం-కిసాన్ వివరాలు?", category: "schemes" },
      { text: "🐛 పత్తిలో గులాబీ రంగు పురుగు నివారణ పద్ధతులు?", category: "pest_control" },
      { text: "📈 మార్కెట్ లో ధాన్యానికి మంచి ధర రావాలంటే ఏం చేయాలి?", category: "mandi" }
    ];
  } else if (lang === "hi") {
    suggestions = [
      { text: "🌾 धान में पत्तियों का पीलापन कैसे दूर करें?", category: "crop_health" },
      { text: "🌧️ क्या आने वाली बारिश में कीटनाशक छिड़कना सुरक्षित है?", category: "weather" },
      { text: "🌿 जैविक खाद बनाम रासायनिक उर्वरक: कौन सा बेहतर है?", category: "fertilizers" },
      { text: "💰 PM-किसान ₹6,000 योजना की स्थिति कैसे जांचें?", category: "schemes" },
      { text: "🍅 टमाटर में लीफ कर्ल (पत्ती मरोड़) का पक्का इलाज?", category: "pest_control" },
      { text: "📈 APMC मंडी में सही ग्रेडिंग से मुनाफा कैसे बढ़ाएं?", category: "mandi" }
    ];
  } else {
    suggestions = [
      { text: "🌾 Why are my paddy leaves turning yellow?", category: "crop_health" },
      { text: "🌧️ Will tomorrow's forecast rain affect chemical spraying?", category: "weather" },
      { text: "⚖️ What is the difference between organic and chemical fertilizers?", category: "fertilizers" },
      { text: "🌾 What are the water requirements for paddy tillering and heading?", category: "irrigation" },
      { text: "🌾 What is the best season and varieties for paddy in Telangana?", category: "season" },
      { text: "🌧️ How to protect standing crops during heavy unseasonal rain?", category: "weather" }
    ];
  }

  return res.status(200).json({ success: true, suggestions });
};
