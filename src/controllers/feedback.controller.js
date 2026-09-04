const supabase = require('../config/supabase');

let memoryFeedback = [];

exports.submitFeedback = async (req, res, next) => {
  try {
    const { name, phone, rating, comments } = req.body;

    if (!name || !comments) {
      return res.status(400).json({ success: false, message: 'Name and comments are required.' });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          user_id: req.user ? req.user.id : null,
          farmer_name: name,
          phone: phone || '',
          rating: rating || 5,
          comments
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Thank you for your feedback!', feedback: data });
    } else {
      const entry = {
        id: `fb_${Date.now()}`,
        farmer_name: name,
        phone: phone || '',
        rating: rating || 5,
        comments,
        created_at: new Date().toISOString()
      };
      memoryFeedback.push(entry);
      return res.status(201).json({ success: true, message: 'Thank you for your feedback!', feedback: entry });
    }
  } catch (err) {
    next(err);
  }
};
