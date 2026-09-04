const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function seedAdmin() {
  const name = process.argv[2] || 'Lead Officer #1042';
  const phone = process.argv[3] || '9999900000';
  const password = process.argv[4] || 'adminSecret2025';
  const role = 'officer';

  console.log(`🔐 Secure Admin Provisioning: Creating ${role} (${name}, Phone: ${phone})...`);

  const password_hash = await bcrypt.hash(password, 10);

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase.from('users').upsert([
        { name, phone, password_hash, role, district: 'Procurement HQ' }
      ], { onConflict: 'phone' }).select();

      if (error) {
        console.error('❌ Database insertion failed:', error.message);
      } else {
        console.log(`✅ Officer account successfully provisioned in Supabase PostgreSQL: ${phone} (Role: ${role})`);
      }
    } catch (e) {
      console.error('❌ Supabase error:', e.message);
    }
  } else {
    console.log(`✅ Seed logic verified. Set SUPABASE_SERVICE_ROLE_KEY in .env to persist directly to Supabase.`);
  }
}

seedAdmin();
