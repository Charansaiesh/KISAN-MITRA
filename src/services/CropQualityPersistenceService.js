const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'crop_quality_assessments.json');

// Initialize persistent fallback store
let memoryAssessments = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    memoryAssessments = JSON.parse(raw);
  }
} catch (e) {
  memoryAssessments = [];
}

function persistToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryAssessments, null, 2), 'utf8');
  } catch (e) {
    console.warn('Disk persistence warning:', e.message);
  }
}

class CropQualityPersistenceService {
  /**
   * Saves a new crop quality assessment to Supabase (or memory/disk fallback).
   */
  static async saveAssessment(assessment) {
    const record = {
      id: assessment.id || `cqa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: assessment.user_id || null,
      crop_type: assessment.crop_type,
      crop_confidence: assessment.crop_confidence,
      quality_score: assessment.quality_score,
      quality_category: assessment.quality_category,
      visible_defects: assessment.visible_defects || {},
      maturity_assessment: assessment.maturity_assessment || '',
      recommendation: assessment.recommendation || '',
      market_source: assessment.market_source || 'REFERENCE_DEMO',
      market_name: assessment.market_name || '',
      reference_price: assessment.reference_price || null,
      estimated_realization_min: assessment.estimated_realization_min || null,
      estimated_realization_max: assessment.estimated_realization_max || null,
      estimated_price_min: assessment.estimated_price_min || null,
      estimated_price_max: assessment.estimated_price_max || null,
      image_url: assessment.image_url || null,
      model_name: assessment.model_name || 'CropQuality-VisionEngine',
      model_version: assessment.model_version || '1.0.0',
      analysis_status: assessment.analysis_status || 'completed',
      created_at: assessment.created_at || new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('crop_quality_assessments')
          .insert([record])
          .select()
          .single();

        if (!error && data) {
          return { success: true, saved_to: 'supabase', data };
        }
      } catch (err) {
        // Fallback gracefully
      }
    }

    // Fallback persistent disk store
    memoryAssessments.unshift(record);
    persistToDisk();
    return { success: true, saved_to: 'local_cloud_sync', data: record };
  }

  /**
   * Retrieves assessment history for an authenticated farmer.
   * Strictly isolates data so farmers only see their own records.
   */
  static async getUserHistory(userId) {
    if (!userId) {
      return { success: false, message: 'User ID is required to fetch assessment history.', records: [] };
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('crop_quality_assessments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { success: true, source: 'supabase', count: data.length, records: data };
        }
      } catch (err) {
        console.warn('Supabase exception on getUserHistory:', err.message);
      }
    }

    const filtered = memoryAssessments.filter(a => a.user_id === userId);
    return { success: true, source: 'memory_fallback', count: filtered.length, records: filtered };
  }

  /**
   * Generates strictly anonymized aggregate statistics for the Admin Portal.
   * NO farmer personal info or private images exposed.
   */
  static async getAggregateAnalytics() {
    let allRecords = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('crop_quality_assessments')
          .select('crop_type, quality_category, quality_score, analysis_status, created_at');

        if (!error && data && data.length > 0) {
          allRecords = data;
        }
      } catch (err) {
        console.warn('Supabase exception on getAggregateAnalytics:', err.message);
      }
    }

    if (allRecords.length === 0) {
      allRecords = memoryAssessments;
    }

    const totalAnalyses = allRecords.length;
    const cropDistribution = {
      Tomato: 0,
      Chilli: 0,
      Onion: 0,
      Potato: 0,
      Banana: 0,
      Rice: 0
    };

    const categoryDistribution = {
      EXCELLENT: 0,
      GOOD: 0,
      FAIR: 0,
      'BELOW AVERAGE': 0,
      POOR: 0
    };

    let completedCount = 0;
    let totalScoreSum = 0;

    allRecords.forEach(r => {
      if (r.crop_type && cropDistribution.hasOwnProperty(r.crop_type)) {
        cropDistribution[r.crop_type]++;
      }
      if (r.quality_category && categoryDistribution.hasOwnProperty(r.quality_category)) {
        categoryDistribution[r.quality_category]++;
      }
      if (r.analysis_status === 'completed') {
        completedCount++;
      }
      if (typeof r.quality_score === 'number') {
        totalScoreSum += r.quality_score;
      }
    });

    const averageScore = totalAnalyses > 0 ? Math.round(totalScoreSum / totalAnalyses) : 0;
    const successRate = totalAnalyses > 0 ? Math.round((completedCount / totalAnalyses) * 100) : 100;

    return {
      success: true,
      total_analyses: totalAnalyses,
      average_quality_score: averageScore,
      success_rate_pct: successRate,
      crop_distribution: cropDistribution,
      category_distribution: categoryDistribution,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { CropQualityPersistenceService };
