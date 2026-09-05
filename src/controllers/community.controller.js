const supabase = require('../config/supabase');

let memoryCommunityListings = [
  { id: "cm_1", type: "sell", cat: "crops", title: "40 quintal tomato — fresh harvest", name: "Karuppasamy", dist: "Coimbatore", phone: "9876543210", price: "₹1,800/quintal", emoji: "🍅", created_at: new Date(Date.now() - 3600000 * 5).toISOString(), comments: [] },
  { id: "cm_2", type: "sell", cat: "crops", title: "30 quintal paddy (Sona Masoori)", name: "Venkatesh", dist: "Nizamabad", phone: "9848012345", price: "₹2,150/quintal", emoji: "🌾", created_at: new Date(Date.now() - 3600000 * 8).toISOString(), comments: [] },
  { id: "cm_3", type: "buy", cat: "crops", title: "Wanted: 100 quintal maize, bulk buyer", name: "Sri Traders", dist: "Davangere", phone: "9900112233", price: "₹2,100/quintal", emoji: "🌽", created_at: new Date(Date.now() - 3600000 * 12).toISOString(), comments: [] },
  { id: "cm_4", type: "sell", cat: "equipment", title: "Tractor with rotavator for hire", name: "Muthu", dist: "Erode", phone: "9787654321", price: "₹900/hour", emoji: "🚜", created_at: new Date(Date.now() - 86400000).toISOString(), comments: [] },
  { id: "cm_5", type: "sell", cat: "transport", title: "10-wheel lorry — all South India", name: "Bala Transport", dist: "Salem", phone: "9445566778", price: "₹35/km", emoji: "🚚", created_at: new Date(Date.now() - 86400000 * 2).toISOString(), comments: [] },
  { id: "cm_6", type: "sell", cat: "transport", title: "Tractor trolley — local mandi trips", name: "Suresh", dist: "Warangal", phone: "9652123456", price: "₹28/km", emoji: "🚚", created_at: new Date(Date.now() - 86400000 * 3).toISOString(), comments: [] },
  { id: "cm_7", type: "buy", cat: "equipment", title: "Wanted: second-hand seed drill", name: "Lakshmi FPO", dist: "Kurnool", phone: "9000112233", price: "Budget ₹45,000", emoji: "🚜", created_at: new Date(Date.now() - 86400000 * 4).toISOString(), comments: [] },
  { id: "cm_8", type: "sell", cat: "crops", title: "25 quintal onion — Nashik quality", name: "Jitendra", dist: "Pune", phone: "9822011223", price: "₹1,400/quintal", emoji: "🧅", created_at: new Date(Date.now() - 86400000 * 5).toISOString(), comments: [] }
];

const categoryEmojis = {
  crops: "🌾",
  equipment: "🚜",
  transport: "🚚"
};

// GET ALL COMMUNITY POSTS WITH OPTIONAL CATEGORY / SEARCH
exports.getListings = async (req, res, next) => {
  try {
    const { cat, q } = req.query;

    if (supabase) {
      let query = supabase
        .from('community_posts')
        .select(`*, community_comments(*)`)
        .order('created_at', { ascending: false });

      if (cat && cat !== 'all') {
        query = query.eq('category', cat);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = data.map(item => ({
        id: item.id,
        type: item.type,
        cat: item.category,
        title: item.title,
        name: item.name,
        dist: item.district,
        phone: item.phone,
        price: item.price,
        emoji: item.emoji || categoryEmojis[item.category] || "🌾",
        created_at: item.created_at,
        comments: (item.community_comments || []).map(c => ({
          id: c.id,
          author_name: c.author_name,
          comment: c.comment,
          created_at: c.created_at
        }))
      }));

      if (q) {
        const queryLower = q.toLowerCase();
        results = results.filter(x =>
          (x.title + " " + x.name + " " + x.dist).toLowerCase().includes(queryLower)
        );
      }

      return res.json({ success: true, count: results.length, data: results });
    } else {
      let filtered = memoryCommunityListings;
      if (cat && cat !== 'all') {
        filtered = filtered.filter(x => x.cat === cat);
      }
      if (q) {
        const queryLower = q.toLowerCase();
        filtered = filtered.filter(x =>
          (x.title + " " + x.name + " " + x.dist).toLowerCase().includes(queryLower)
        );
      }
      return res.json({ success: true, count: filtered.length, data: filtered });
    }
  } catch (err) {
    next(err);
  }
};

// CREATE COMMUNITY LISTING / POST
exports.createListing = async (req, res, next) => {
  try {
    const { type, cat, title, name, dist, phone, price } = req.body;

    if (!type || !cat || !title || !name || !dist || !phone || !price) {
      return res.status(400).json({ success: false, message: 'All listing fields are required.' });
    }

    const emoji = categoryEmojis[cat] || "🌾";

    if (supabase) {
      const { data, error } = await supabase
        .from('community_posts')
        .insert([{
          user_id: req.user ? req.user.id : null,
          type: type.toLowerCase(),
          category: cat.toLowerCase(),
          title,
          name,
          district: dist,
          phone,
          price,
          emoji
        }])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Community listing posted successfully.',
        data: {
          id: data.id,
          type: data.type,
          cat: data.category,
          title: data.title,
          name: data.name,
          dist: data.district,
          phone: data.phone,
          price: data.price,
          emoji: data.emoji,
          comments: []
        }
      });
    } else {
      const newItem = {
        id: `cm_${Date.now()}`,
        type: type.toLowerCase(),
        cat: cat.toLowerCase(),
        title,
        name,
        dist,
        phone,
        price,
        emoji,
        created_at: new Date().toISOString(),
        comments: []
      };

      memoryCommunityListings.unshift(newItem);

      return res.status(201).json({
        success: true,
        message: 'Community listing posted successfully.',
        data: newItem
      });
    }
  } catch (err) {
    next(err);
  }
};

// ADD COMMENT TO COMMUNITY POST
exports.addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { author_name, comment } = req.body;

    if (!comment) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

    const cleanAuthor = author_name || (req.user ? req.user.name : 'Farmer');

    if (supabase) {
      const { data, error } = await supabase
        .from('community_comments')
        .insert([{
          post_id: postId,
          user_id: req.user ? req.user.id : null,
          author_name: cleanAuthor,
          comment
        }])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, message: 'Comment added.', comment: data });
    } else {
      const post = memoryCommunityListings.find(p => p.id === postId);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Community listing not found.' });
      }

      const newComment = {
        id: `c_${Date.now()}`,
        author_name: cleanAuthor,
        comment,
        created_at: new Date().toISOString()
      };

      post.comments = post.comments || [];
      post.comments.push(newComment);

      return res.status(201).json({ success: true, message: 'Comment added.', comment: newComment });
    }
  } catch (err) {
    next(err);
  }
};

// DELETE COMMUNITY POST (Officer / Admin Moderation or Author)
exports.deleteListing = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (supabase) {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      return res.json({ success: true, message: 'Listing deleted successfully.' });
    } else {
      const idx = memoryCommunityListings.findIndex(p => p.id === postId);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Listing not found.' });
      }
      memoryCommunityListings.splice(idx, 1);
      return res.json({ success: true, message: 'Listing deleted successfully.' });
    }
  } catch (err) {
    next(err);
  }
};
