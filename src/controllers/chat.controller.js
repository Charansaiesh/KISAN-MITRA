const { AIChatService } = require('../services/AIChatService');

exports.sendMessage = async (req, res) => {
  try {
    const { message, history, context, language } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        source: 'fallback',
        error_code: 'INVALID_MESSAGE',
        message: 'A non-empty text message is required.'
      });
    }

    // Accept only "en" or "hi", default to "en" for anything else
    const rawLang = (typeof language === 'string' && language.trim())
      ? language.trim().toLowerCase()
      : (typeof context?.language === 'string' ? context.language.trim().toLowerCase() : '');
    const chosenLang = (rawLang === 'hi') ? 'hi' : 'en';

    const mergedContext = { ...(context || {}), language: chosenLang };
    const chatResponse = await AIChatService.chat(history || [], message, mergedContext);
    return res.status(200).json(chatResponse);
  } catch (error) {
    console.error('Chat Controller Error:', error.message);
    const rawLang = (typeof language === 'string' && language.trim())
      ? language.trim().toLowerCase()
      : (typeof context?.language === 'string' ? context.language.trim().toLowerCase() : '');
    const isHi = (rawLang === 'hi');
    return res.status(500).json({
      success: false,
      source: 'fallback',
      error_code: 'CHAT_ERROR',
      message: error.message.includes('GEMINI_API_KEY')
        ? error.message
        : (isHi ? 'एआई अभी व्यस्त है, कृपया कुछ मिनटों में पुनः प्रयास करें।' : 'AI is busy, please try again in a few minutes.')
    });
  }
};

exports.getSuggestions = (req, res) => {
  const suggestions = [
    { text: "🍅 How to control leaf curl virus in tomatoes?", category: "pest_control" },
    { text: "💰 Am I eligible for PM-KISAN 6,000 subsidy?", category: "schemes" },
    { text: "🌾 What is the ideal fertilizer schedule for wheat?", category: "fertilizers" },
    { text: "🥔 Best storage techniques to prevent potato rotting?", category: "storage" },
    { text: "📈 How does APMC mandi pricing and lot grading work?", category: "mandi" },
    { text: "🌧️ What precautions to take before heavy unseasonal rain?", category: "weather" }
  ];
  return res.status(200).json({ success: true, suggestions });
};
