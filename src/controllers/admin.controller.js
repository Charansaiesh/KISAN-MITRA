const supabase = require('../config/supabase');
const tokensController = require('./tokens.controller');

// DYNAMIC DASHBOARD STATISTICS
exports.getStats = async (req, res, next) => {
  try {
    if (supabase) {
      const { data: reports, error } = await supabase
        .from('crop_reports')
        .select('id, progress_pct, status, created_at');

      if (error) throw error;

      const total = reports.length;
      const done = reports.filter(r => r.progress_pct === 100 || r.status.includes('Payment approved')).length;
      const pend = reports.filter(r => r.progress_pct > 20 && r.progress_pct < 100).length;
      const fresh = reports.filter(r => r.progress_pct <= 20).length;

      return res.json({
        success: true,
        stats: {
          total_tokens: total,
          paid_completed: done,
          in_process: pend,
          new_unreviewed: fresh
        }
      });
    } else {
      const allTokens = Object.values(require('./tokens.controller'));
      // Check from tokens endpoint handler
      const reqMock = { params: {} };
      let allData = {};
      await tokensController.getAllTokens(reqMock, {
        json: (resp) => { allData = resp.data || {}; }
      }, () => {});

      const list = Object.values(allData);
      const total = list.length;
      let done = 0, pend = 0, fresh = 0;

      list.forEach(item => {
        const completedSteps = item.steps.filter(s => s[1] === 1).length;
        const pct = Math.round((completedSteps / item.steps.length) * 100);
        if (pct === 100) done++;
        else if (pct <= 20) fresh++;
        else pend++;
      });

      return res.json({
        success: true,
        stats: {
          total_tokens: total,
          paid_completed: done,
          in_process: pend,
          new_unreviewed: fresh
        }
      });
    }
  } catch (err) {
    next(err);
  }
};
