const supabase = require('../config/supabase');

let memoryNotifications = [
  { id: "n1", title: "Registration Confirmed", message: "KisanMitra: 70+ mandis mapped across India! Live AGMARKNET prices now on the portal.", time: new Date().toISOString() }
];

exports.getNotifications = async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return res.json({ success: true, notifications: data });
    } else {
      return res.json({ success: true, notifications: memoryNotifications });
    }
  } catch (err) {
    next(err);
  }
};
