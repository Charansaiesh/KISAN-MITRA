const supabase = require('../config/supabase');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let memoryNotifications = [
  { id: "n1", title: "Registration Confirmed", message: "KisanMitra: 70+ mandis mapped across India! Live AGMARKNET prices now on the portal.", phone: "ALL_FARMERS", is_read: false, sent_at: new Date().toISOString() },
  { id: "n2", title: "Wheat MSP Active", message: "Official MSP rate ₹2,425/quintal active across 70+ state APMC mandis.", phone: "ALL_FARMERS", is_read: false, sent_at: new Date(Date.now() - 3600000).toISOString() }
];

// 1. GET ALL NOTIFICATIONS / ANNOUNCEMENTS
exports.getNotifications = async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.json({ success: true, notifications: data });
    } else {
      return res.json({ success: true, notifications: memoryNotifications });
    }
  } catch (err) {
    next(err);
  }
};

// 2. CREATE ANNOUNCEMENT / NOTIFICATION (Admin / Officer)
exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, phone } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const targetPhone = phone || 'ALL_FARMERS';

    if (supabase) {
      const validUserId = (req.user && req.user.id && UUID_REGEX.test(req.user.id)) ? req.user.id : null;
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: validUserId,
          title: title.trim(),
          message: message.trim(),
          phone: targetPhone,
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Announcement broadcast successfully.', notification: data });
    } else {
      const entry = {
        id: `notif_${Date.now()}`,
        title: title.trim(),
        message: message.trim(),
        phone: targetPhone,
        is_read: false,
        sent_at: new Date().toISOString()
      };
      memoryNotifications.unshift(entry);
      return res.status(201).json({ success: true, message: 'Announcement broadcast successfully.', notification: entry });
    }
  } catch (err) {
    next(err);
  }
};

// 3. UPDATE ANNOUNCEMENT / NOTIFICATION (Admin / Officer)
exports.updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, message } = req.body;

    if (!title && !message) {
      return res.status(400).json({ success: false, message: 'Title or message required for update.' });
    }

    const updates = {};
    if (title) updates.title = title.trim();
    if (message) updates.message = message.trim();

    if (supabase && UUID_REGEX.test(id)) {
      const { data, error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return res.json({ success: true, message: 'Announcement updated successfully.', notification: data });
    } else {
      const item = memoryNotifications.find(n => n.id === id);
      if (item) {
        if (title) item.title = title.trim();
        if (message) item.message = message.trim();
      }
      return res.json({ success: true, message: 'Announcement updated successfully.', notification: item });
    }
  } catch (err) {
    next(err);
  }
};

// 4. DELETE ANNOUNCEMENT / NOTIFICATION (Admin / Officer)
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (supabase && UUID_REGEX.test(id)) {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.json({ success: true, message: 'Announcement deleted successfully.' });
    } else {
      memoryNotifications = memoryNotifications.filter(n => n.id !== id);
      return res.json({ success: true, message: 'Announcement deleted successfully.' });
    }
  } catch (err) {
    next(err);
  }
};
