const supabase = require('../config/supabase');
const smsService = require('../services/sms.service');

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
    last_notified_position: null,
    level1_notified: true,
    sms_status: { success: true, status: 'sent', message: 'SMS delivered' },
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
    last_notified_position: 1,
    level1_notified: true,
    sms_status: { success: true, status: 'sent', message: 'SMS delivered' },
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
    last_notified_position: 2,
    level1_notified: true,
    sms_status: { success: true, status: 'sent', message: 'SMS delivered' },
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
};

/**
 * Returns currently active (unfinished) tokens ordered by creation/queue order
 */
function getActiveQueueTokens() {
  return Object.values(memoryTokens)
    .filter(t => {
      const dn = (t.steps || []).filter(s => s[1]).length;
      return dn < (t.steps || []).length;
    })
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at) || a.token.localeCompare(b.token));
}

/**
 * Calculates current 1-based queue position of a token (or null if finished)
 */
function getQueuePosition(tokenNumber) {
  const active = getActiveQueueTokens();
  const idx = active.findIndex(t => t.token === tokenNumber);
  return idx !== -1 ? idx + 1 : null;
}

/**
 * Recalculates queue positions and dispatches SMS updates when positions shift
 * Prevents duplicate notifications using last_notified_position
 */
async function notifyQueueChanges() {
  const active = getActiveQueueTokens();
  for (let i = 0; i < active.length; i++) {
    const item = active[i];
    const newPos = i + 1;
    if (item.last_notified_position && item.last_notified_position !== newPos) {
      console.log(`[Queue Shift] Token ${item.token} shifted from #${item.last_notified_position} to #${newPos}`);
      try {
        await smsService.sendQueueUpdateSMS({
          token: item.token,
          phone: item.phone,
          position: newPos
        });
      } catch (err) {
        console.error(`[Queue Shift SMS Error] Token ${item.token}:`, err.message);
      }
      item.last_notified_position = newPos;
    } else if (!item.last_notified_position) {
      item.last_notified_position = newPos;
    }
  }
}

// CREATE CROP REPORT / SMART TOKEN & DISPATCH INITIAL SMS
exports.createToken = async (req, res, next) => {
  try {
    const { name, phone, crop, quantity, district, mandi } = req.body;

    if (!name || !crop || !quantity) {
      return res.status(400).json({ success: false, message: 'Name, crop, and quantity are required.' });
    }

    const tokenNumber = `KM2025${String(tokenCounter++).padStart(3, '0')}`;
    const qtyStr = `${quantity} quintal`;
    const finalMandi = mandi || (district && district.toLowerCase().includes('mandi') ? district : `${district || 'Central APMC'} Mandi`);
    const cleanPhone = (phone || (req.user ? req.user.phone : '9876500000')).replace(/\D/g, '').slice(-10);

    // 1. Calculate new queue position (active count before insertion + 1)
    const activeBefore = getActiveQueueTokens();
    const queuePosition = activeBefore.length + 1;

    // 2. Dispatch Initial Fast2SMS Notification (Protected with Try/Catch so token creation never crashes)
    let smsStatus = { success: false, status: 'failed', message: 'SMS service pending dispatch' };
    try {
      smsStatus = await smsService.sendInitialTokenSMS({
        token: tokenNumber,
        phone: cleanPhone,
        position: queuePosition
      });
    } catch (smsErr) {
      console.error(`⚠️ [Initial SMS Dispatch Failed]:`, smsErr.message);
      smsStatus = { success: false, status: 'failed', message: smsErr.message };
    }

    if (supabase) {
      try {
        const { data: report, error } = await supabase
          .from('crop_reports')
          .insert([{
            token: tokenNumber,
            user_id: req.user ? req.user.id : null,
            farmer_name: name,
            phone: cleanPhone,
            crop,
            quantity_quintal: parseFloat(quantity),
            mandi: finalMandi,
            district: district || finalMandi,
            status: 'Registration received',
            progress_pct: 20
          }])
          .select()
          .single();

        if (!error && report) {
          const stepsToInsert = DEFAULT_STEPS.map((s, idx) => ({
            token_id: report.id,
            step_name: s[0],
            step_order: idx + 1,
            is_completed: s[1] === 1
          }));
          await supabase.from('token_steps').insert(stepsToInsert);

          await supabase.from('notifications').insert([{
            user_id: req.user ? req.user.id : null,
            phone: cleanPhone,
            token: tokenNumber,
            title: 'Token Issued',
            message: `KisanMitra: Your token is ${tokenNumber}. Your current queue position is #${queuePosition}.`
          }]);
        }
      } catch (dbErr) {
        console.warn(`[Supabase insert notice, fallback to memory active]:`, dbErr.message);
      }
    }

    const newEntry = {
      token: tokenNumber,
      name,
      phone: cleanPhone,
      crop,
      qty: qtyStr,
      mandi: finalMandi,
      district: district || finalMandi,
      steps: JSON.parse(JSON.stringify(DEFAULT_STEPS)),
      queue_position: queuePosition,
      last_notified_position: queuePosition,
      level1_notified: false,
      sms_status: smsStatus,
      created_at: new Date().toISOString()
    };
    memoryTokens[tokenNumber] = newEntry;

    return res.status(201).json({
      success: true,
      message: 'Token issued successfully.',
      token: tokenNumber,
      queue_position: queuePosition,
      sms_status: smsStatus,
      data: newEntry
    });
  } catch (err) {
    next(err);
  }
};

// GET TOKEN DETAILS BY TOKEN ID
exports.getToken = async (req, res, next) => {
  try {
    const token = req.params.token.toUpperCase().trim();

    if (supabase) {
      try {
        const { data: report, error } = await supabase
          .from('crop_reports')
          .select(`*, token_steps(*)`)
          .eq('token', token)
          .single();

        if (!error && report) {
          const steps = (report.token_steps || [])
            .sort((a, b) => a.step_order - b.step_order)
            .map(s => [s.step_name, s.is_completed ? 1 : 0]);

          const doneCount = steps.filter(s => s[1] === 1).length;
          const pct = Math.round((doneCount / (steps.length || 5)) * 100);
          const queuePos = getQueuePosition(token);

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
            queue_position: queuePos,
            sms_status: { success: true, status: 'sent', message: 'Delivered' },
            steps: steps.length ? steps : DEFAULT_STEPS
          });
        }
      } catch (dbErr) {
        // Fallback to memory
      }
    }

    const d = memoryTokens[token];
    if (!d) {
      return res.status(404).json({ success: false, message: `Token ${token} not found.` });
    }

    const doneCount = d.steps.filter(s => s[1] === 1).length;
    const pct = Math.round((doneCount / d.steps.length) * 100);
    const queuePos = getQueuePosition(token);

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
      queue_position: queuePos,
      sms_status: d.sms_status || { success: true, status: 'sent', message: 'Delivered' },
      steps: d.steps
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL TOKENS (Officer Dashboard)
exports.getAllTokens = async (req, res, next) => {
  try {
    const formatted = {};
    const activeQueue = getActiveQueueTokens();

    Object.keys(memoryTokens).forEach(tok => {
      const item = memoryTokens[tok];
      const qIdx = activeQueue.findIndex(t => t.token === tok);
      formatted[tok] = {
        ...item,
        queue_position: qIdx !== -1 ? qIdx + 1 : null
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

// ADVANCE WORKFLOW STEP (Officer Only)
exports.advanceStep = async (req, res, next) => {
  try {
    const token = req.params.token.toUpperCase().trim();
    const d = memoryTokens[token];

    if (!d) {
      return res.status(404).json({ success: false, message: `Token ${token} not found.` });
    }

    // Find and advance next incomplete step
    const nextStep = d.steps.find(s => !s[1]);
    let justApprovedLevel1 = false;

    if (nextStep) {
      nextStep[1] = 1;
      const completedSteps = d.steps.filter(s => s[1]).length;

      // Check if this advance reached Level 1 Approved (Step 2: Identity verified / Level 1)
      if (completedSteps >= 2 && !d.level1_notified) {
        d.level1_notified = true;
        justApprovedLevel1 = true;
        try {
          await smsService.sendLevel1ApprovedSMS({
            token: d.token,
            phone: d.phone
          });
        } catch (smsErr) {
          console.error(`⚠️ [Level 1 SMS Failed] ${token}:`, smsErr.message);
        }
      }
    }

    if (supabase) {
      try {
        const { data: report } = await supabase
          .from('crop_reports')
          .select('id, token')
          .eq('token', token)
          .single();

        if (report) {
          const { data: steps } = await supabase
            .from('token_steps')
            .select('*')
            .eq('token_id', report.id)
            .order('step_order');

          const sNext = (steps || []).find(s => !s.is_completed);
          if (sNext) {
            await supabase
              .from('token_steps')
              .update({ is_completed: true, completed_at: new Date().toISOString() })
              .eq('id', sNext.id);

            const doneCount = steps.filter(s => s.is_completed).length + 1;
            const pct = Math.round((doneCount / steps.length) * 100);

            await supabase
              .from('crop_reports')
              .update({ progress_pct: pct, status: sNext.step_name })
              .eq('id', report.id);
          }
        }
      } catch (dbErr) {
        console.warn(`[Supabase advance notice]:`, dbErr.message);
      }
    }

    // After step advance, notify any remaining waiting tokens whose queue position shifted
    await notifyQueueChanges();

    const newQueuePos = getQueuePosition(token);

    return res.json({
      success: true,
      message: `Token ${token} advanced successfully.${justApprovedLevel1 ? ' Level 1 Approved SMS dispatched.' : ''}`,
      queue_position: newQueuePos,
      level1_approved: d.level1_notified,
      data: d
    });
  } catch (err) {
    next(err);
  }
};

// DELETE TOKEN (Officer Only)
exports.deleteToken = async (req, res, next) => {
  try {
    const token = req.params.token.toUpperCase().trim();

    if (supabase) {
      try {
        await supabase.from('crop_reports').delete().eq('token', token);
      } catch (dbErr) {}
    }

    if (!memoryTokens[token]) {
      return res.status(404).json({ success: false, message: `Token ${token} not found.` });
    }

    delete memoryTokens[token];

    // Deleting an active token advances everyone behind it!
    await notifyQueueChanges();

    return res.json({ success: true, message: `Token ${token} deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

// RESET DEMO DATA
exports.resetDemoData = async (req, res, next) => {
  try {
    memoryTokens = {
      "KM2024001": { token: "KM2024001", name: "Ram Yadav", phone: "9876543210", crop: "Wheat", qty: "45 quintal", mandi: "Lucknow Mandi", district: "Lucknow", steps: [["Registration received", 1], ["Identity verified", 1], ["Crop deposited at mandi", 1], ["Quality check done", 1], ["Payment approved ✅", 1]], last_notified_position: null, level1_notified: true, sms_status: { success: true, status: 'sent', message: 'SMS delivered' }, created_at: new Date().toISOString() },
      "KM2024002": { token: "KM2024002", name: "Sumitra Devi", phone: "9876543211", crop: "Mustard", qty: "30 quintal", mandi: "Jaipur Mandi", district: "Jaipur", steps: [["Registration received", 1], ["Identity verified", 1], ["Crop deposited at mandi", 1], ["Quality check ⏳", 1], ["Payment", 0]], last_notified_position: 1, level1_notified: true, sms_status: { success: true, status: 'sent', message: 'SMS delivered' }, created_at: new Date().toISOString() },
      "KM2024003": { token: "KM2024003", name: "Mohan Patel", phone: "9876543212", crop: "Paddy", qty: "60 quintal", mandi: "Patna Mandi", district: "Patna", steps: [["Registration received", 1], ["Identity verified ⏳", 1], ["Deposit at mandi (Oct 10)", 0], ["Quality check", 0], ["Payment", 0]], last_notified_position: 2, level1_notified: true, sms_status: { success: true, status: 'sent', message: 'SMS delivered' }, created_at: new Date().toISOString() }
    };
    tokenCounter = 1004;

    return res.json({ success: true, message: 'Demo data reset successfully.', data: memoryTokens });
  } catch (err) {
    next(err);
  }
};
