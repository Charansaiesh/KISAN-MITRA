const supabase = require('../config/supabase');

let memoryFeedback = [
  { id: "fb_1", farmer_name: "Rameshwar Yadav", phone: "9876501234", rating: 5, comments: "Token system saved 4 hours at mandi. Fast payment received via DBT.", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "fb_2", farmer_name: "Gurdev Singh", phone: "9812345678", rating: 5, comments: "Live prices match the APMC mandi board accurately. Excellent initiative.", created_at: new Date(Date.now() - 86400000 * 2).toISOString() }
];

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
      memoryFeedback.unshift(entry);
      return res.status(201).json({ success: true, message: 'Thank you for your feedback!', feedback: entry });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllFeedback = async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, count: data.length, feedback: data });
    } else {
      return res.json({ success: true, count: memoryFeedback.length, feedback: memoryFeedback });
    }
  } catch (err) {
    next(err);
  }
};
