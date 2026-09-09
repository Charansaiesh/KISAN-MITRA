const { AIChatService } = require('../services/AIChatService');

exports.sendMessage = async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error_code: 'INVALID_MESSAGE',
        message: 'A non-empty text message is required.'
      });
    }

    const chatResponse = await AIChatService.chat(history || [], message, context || {});
    return res.status(200).json(chatResponse);
  } catch (error) {
    console.error('Chat Controller Error:', error.message);
    return res.status(500).json({
      success: false,
      error_code: 'CHAT_ERROR',
      message: error.message.includes('GEMINI_API_KEY')
        ? error.message
        : 'AI assistant is currently busy. Please try again in a few seconds.'
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
