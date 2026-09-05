const supabase = require('../config/supabase');
// Clean token management

const DEFAULT_STEPS = [
  ["Registration received", 1],
  ["Identity verified", 0],
  ["Deposit at mandi", 0],
  ["Quality check", 0],
  ["Payment", 0]
];

// In-memory fallback dataset
let tokenCounter = 1004;
let memoryTokens = {
  "KM2024001": {
    token: "KM2024001",
    name: "Ram Yadav",
    phone: "9876543210",
    crop: "Wheat",
    qty: "45 quintal",
    mandi: "Lucknow Mandi",
    district: "Lucknow",
    steps: [
      ["Registration received", 1],
      ["Identity verified", 1],
      ["Crop deposited at mandi", 1],
      ["Quality check done", 1],
      ["Payment approved ✅", 1]
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  "KM2024002": {
    token: "KM2024002",
    name: "Sumitra Devi",
    phone: "9876543211",
    crop: "Mustard",
    qty: "30 quintal",
    mandi: "Jaipur Mandi",
    district: "Jaipur",
    steps: [
      ["Registration received", 1],
      ["Identity verified", 1],
      ["Crop deposited at mandi", 1],
      ["Quality check ⏳", 1],
      ["Payment", 0]
    ],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  "KM2024003": {
    token: "KM2024003",
    name: "Mohan Patel",
    phone: "9876543212",
    crop: "Paddy",
    qty: "60 quintal",
    mandi: "Patna Mandi",
    district: "Patna",
    steps: [
      ["Registration received", 1],
      ["Identity verified ⏳", 1],
      ["Deposit at mandi (Oct 10)", 0],
      ["Quality check", 0],
      ["Payment", 0]
    ],
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
};

// CREATE CROP REPORT / SMART TOKEN & DISPATCH REAL SMS
exports.createToken = async (req, res, next) => {
  try {
    let { name, phone, crop, quantity, district, mandi } = req.body;

    if (!name || !crop || !quantity) {
      return res.status(400).json({ success: false, message: 'Name, crop, and quantity are required.' });
    }

    district = (district || mandi || 'Central District').trim();
    const tokenNumber = `KM2025${String(tokenCounter++).padStart(3, '0')}`;
    const qtyStr = `${quantity} quintal`;
    const mandiStr = (mandi || (district.toLowerCase().includes('mandi') ? district : `${district} Mandi`)).trim();
    const cleanPhone = (phone || (req.user ? req.user.phone : '9876500000')).replace(/\D/g, '').slice(-10);

    // Token record created

    if (supabase) {
      const { data: report, error } = await supabase
        .from('crop_reports')
        .insert([{
          token: tokenNumber,
          user_id: req.user ? req.user.id : null,
          farmer_name: name,
          phone: cleanPhone,
          crop,
          quantity_quintal: parseFloat(quantity),
          mandi: mandiStr,
          district,
          status: 'Registration received',
          progress_pct: 20
        }])
        .select()
        .single();

      if (error) throw error;

      // Seed step items
      const stepsToInsert = DEFAULT_STEPS.map((s, idx) => ({
        token_id: report.id,
        step_name: s[0],
        step_order: idx + 1,
        is_completed: s[1] === 1
      }));
      await supabase.from('token_steps').insert(stepsToInsert);

      // Notification
      await supabase.from('notifications').insert([{
        user_id: req.user ? req.user.id : null,
        phone: cleanPhone,
        token: tokenNumber,
        title: 'Token Issued',
        message: `KisanMitra: Hello ${name}! Your ${crop} procurement token ${tokenNumber} has been issued. Mandi: ${mandiStr}.`
      }]);

      return res.status(201).json({
        success: true,
        message: 'Token issued successfully.',
        token: tokenNumber,
        data: {
          token: tokenNumber,
          name,
          phone: cleanPhone,
          crop,
          qty: qtyStr,
          mandi: mandiStr,
          district,
          steps: DEFAULT_STEPS
        }
      });
    } else {
      const newEntry = {
        token: tokenNumber,
        name,
        phone: cleanPhone,
        crop,
        qty: qtyStr,
        mandi: mandiStr,
        district,
        steps: JSON.parse(JSON.stringify(DEFAULT_STEPS)),
        created_at: new Date().toISOString()
      };
      memoryTokens[tokenNumber] = newEntry;

      return res.status(201).json({
        success: true,
        message: 'Token issued successfully.',
        token: tokenNumber,
        data: newEntry
      });
    }
  } catch (err) {
    next(err);
  }
};

// GET TOKEN DETAILS BY TOKEN ID
exports.getToken = async (req, res, next) => {
  try {
    const token = req.params.token.toUpperCase().trim();

    if (supabase) {
      const { data: report, error } = await supabase
        .from('crop_reports')
        .select(`*, token_steps(*)`)
        .eq('token', token)
        .single();

      if (error || !report) {
        return res.status(404).json({ success: false, message: `Token ${token} not found.` });
      }

      const steps = (report.token_steps || [])
        .sort((a, b) => a.step_order - b.step_order)
        .map(s => [s.step_name, s.is_completed ? 1 : 0]);

      const doneCount = steps.filter(s => s[1] === 1).length;
      const pct = Math.round((doneCount / (steps.length || 5)) * 100);

      return res.json({
        success: true,
        token: report.token,
        name: report.farmer_name,
        phone: report.phone,
        crop: report.crop,
        qty: `${report.quantity_quintal} quintal`,
        mandi: report.mandi,
        district: report.district,
        status: report.status,
        progress_pct: pct,
        steps: steps.length ? steps : DEFAULT_STEPS
      });
    } else {
      const d = memoryTokens[token];
      if (!d) {
        return res.status(404).json({ success: false, message: `Token ${token} not found.` });
      }

      const doneCount = d.steps.filter(s => s[1] === 1).length;
      const pct = Math.round((doneCount / d.steps.length) * 100);

      return res.json({
        success: true,
        token: d.token,
        name: d.name,
        phone: d.phone,
        crop: d.crop,
        qty: d.qty,
        mandi: d.mandi,
        district: d.district,
        progress_pct: pct,
        steps: d.steps
      });
    }
  } catch (err) {
    next(err);
  }
};

// GET ALL TOKENS
exports.getAllTokens = async (req, res, next) => {
  try {
    if (supabase) {
      const { data: reports, error } = await supabase
        .from('crop_reports')
        .select(`*, token_steps(*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = {};
      reports.forEach(r => {
        const steps = (r.token_steps || [])
          .sort((a, b) => a.step_order - b.step_order)
          .map(s => [s.step_name, s.is_completed ? 1 : 0]);

        formatted[r.token] = {
          token: r.token,
          name: r.farmer_name,
          phone: r.phone,
          crop: r.crop,
          qty: `${r.quantity_quintal} quintal`,
          mandi: r.mandi,
          district: r.district,
          steps: steps.length ? steps : DEFAULT_STEPS
        };
      });

      return res.json({ success: true, data: formatted });
    } else {
      return res.json({ success: true, data: memoryTokens });
    }
  } catch (err) {
    next(err);
  }
};

// ADVANCE WORKFLOW STEP (Officer Only)
exports.advanceStep = async (req, res, next) => {
  try {
    const token = req.params.token.toUpperCase().trim();

    if (supabase) {
      const { data: report } = await supabase
        .from('crop_reports')
        .select('id, token')
        .eq('token', token)
        .single();

      if (!report) return res.status(404).json({ success: false, message: `Token ${token} not found.` });

      const { data: steps } = await supabase
        .from('token_steps')
        .select('*')
        .eq('token_id', report.id)
        .order('step_order');

      const nextStep = (steps || []).find(s => !s.is_completed);
      if (nextStep) {
        await supabase
          .from('token_steps')
          .update({ is_completed: true, completed_at: new Date().toISOString() })
          .eq('id', nextStep.id);

        const doneCount = steps.filter(s => s.is_completed).length + 1;
        const pct = Math.round((doneCount / steps.length) * 100);

        await supabase
          .from('crop_reports')
          .update({ progress_pct: pct, status: nextStep.step_name })
          .eq('id', report.id);
      }

      return res.json({ success: true, message: `Token ${token} advanced to next step.` });
    } else {
      const d = memoryTokens[token];
      if (!d) return res.status(404).json({ success: false, message: `Token ${token} not found.` });

      const nextStep = d.steps.find(s => !s[1]);
      if (nextStep) {
        nextStep[1] = 1;
      }
      return res.json({ success: true, message: `Token ${token} advanced to next step.`, data: d });
    }
  } catch (err) {
    next(err);
  }
};

// DELETE TOKEN (Officer Only)
exports.deleteToken = async (req, res, next) => {
  try {
    const token = req.params.token.toUpperCase().trim();

    if (supabase) {
      const { error } = await supabase.from('crop_reports').delete().eq('token', token);
      if (error) throw error;
      return res.json({ success: true, message: `Token ${token} deleted successfully.` });
    } else {
      if (!memoryTokens[token]) {
        return res.status(404).json({ success: false, message: `Token ${token} not found.` });
      }
      delete memoryTokens[token];
      return res.json({ success: true, message: `Token ${token} deleted successfully.` });
    }
  } catch (err) {
    next(err);
  }
};

// RESET DEMO DATA
exports.resetDemoData = async (req, res, next) => {
  try {
    memoryTokens = {
      "KM2024001": { token: "KM2024001", name: "Ram Yadav", phone: "9876543210", crop: "Wheat", qty: "45 quintal", mandi: "Lucknow Mandi", district: "Lucknow", steps: [["Registration received", 1], ["Identity verified", 1], ["Crop deposited at mandi", 1], ["Quality check done", 1], ["Payment approved ✅", 1]], created_at: new Date().toISOString() },
      "KM2024002": { token: "KM2024002", name: "Sumitra Devi", phone: "9876543211", crop: "Mustard", qty: "30 quintal", mandi: "Jaipur Mandi", district: "Jaipur", steps: [["Registration received", 1], ["Identity verified", 1], ["Crop deposited at mandi", 1], ["Quality check ⏳", 1], ["Payment", 0]], created_at: new Date().toISOString() },
      "KM2024003": { token: "KM2024003", name: "Mohan Patel", phone: "9876543212", crop: "Paddy", qty: "60 quintal", mandi: "Patna Mandi", district: "Patna", steps: [["Registration received", 1], ["Identity verified ⏳", 1], ["Deposit at mandi (Oct 10)", 0], ["Quality check", 0], ["Payment", 0]], created_at: new Date().toISOString() }
    };
    tokenCounter = 1004;

    return res.json({ success: true, message: 'Demo data reset successfully.', data: memoryTokens });
  } catch (err) {
    next(err);
  }
};
