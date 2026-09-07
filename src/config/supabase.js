const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://rkundyxuyuaktkhquphk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdW5keXh1eXVha3RraHF1cGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NzczODgsImV4cCI6MjEwNDM1MzM4OH0.9_5gu_IYJTBV6WTqJ1hQ95BCjv57ZlbV-V-JT1wHxfY';

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('✅ Supabase Client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Could not initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set in .env. Using robust high-performance in-memory persistence layer.');
}

module.exports = supabase;
