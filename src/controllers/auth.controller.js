const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const getJwtSecret = () => process.env.JWT_SECRET || 'kisanmitra_jwt_secret_dev_key_2025_secure_983274293';

// Robust fallback user memory store
const memoryUsers = [];

const generateJWT = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, phone: user.phone, role: user.role, district: user.district },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// PUBLIC FARMER REGISTRATION
exports.register = async (req, res, next) => {
  try {
    const { name, phone, password, aadhaar, district } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone and password are required.' });
    }

    if (phone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number.' });
    }

    // STRICT SECURITY: Public registration is HARD-LOCKED to 'farmer'
    const role = 'farmer';
    const password_hash = await bcrypt.hash(password, 10);
    const aadhaar_hash = aadhaar ? await bcrypt.hash(aadhaar, 6) : null;

    if (supabase) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single();

      if (existingUser) {
        return res.status(409).json({ success: false, message: 'A farmer account with this phone number already exists.' });
      }

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ name, phone, password_hash, aadhaar_hash, district: district || '', role }])
        .select('id, name, phone, district, role, created_at')
        .single();

      if (error) throw error;

      const token = generateJWT(newUser);
      return res.status(201).json({
        success: true,
        message: 'Farmer account registered successfully.',
        user: newUser,
        token
      });
    } else {
      if (memoryUsers.find(u => u.phone === phone)) {
        return res.status(409).json({ success: false, message: 'A farmer account with this phone number already exists.' });
      }

      const user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name,
        phone,
        district: district || '',
        role,
        password_hash,
        created_at: new Date().toISOString()
      };
      memoryUsers.push(user);

      const token = generateJWT(user);
      return res.status(201).json({
        success: true,
        message: 'Farmer account registered successfully.',
        user: { id: user.id, name: user.name, phone: user.phone, district: user.district, role: user.role },
        token
      });
    }
  } catch (err) {
    next(err);
  }
};

// USER LOGIN (Farmer / Officer)
exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required.' });
    }

    let user = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error || !data) {
        return res.status(401).json({ success: false, message: 'Invalid phone or password.' });
      }
      user = data;
    } else {
      user = memoryUsers.find(u => u.phone === phone);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid phone or password.' });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password.' });
    }

    const token = generateJWT(user);
    return res.json({
      success: true,
      message: 'Login successful.',
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role, district: user.district },
      token
    });
  } catch (err) {
    next(err);
  }
};

// INITIAL OFFICER SEEDING (FROM ADMIN_INITIAL_SECRET)
const seedInitialOfficer = async () => {
  const secret = process.env.ADMIN_INITIAL_SECRET;
  if (!secret) {
    console.log('ℹ️ ADMIN_INITIAL_SECRET not configured. Skipping initial officer seeding.');
    return;
  }

  const phone = '9999900000';
  const name = 'Lead Officer #1042';
  const role = 'officer';
  const district = 'Procurement Control HQ';
  const password_hash = await bcrypt.hash(secret, 10);

  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from('users').insert([{
          name,
          phone,
          password_hash,
          role,
          district
        }]);
        if (error) {
          console.warn('⚠️ Could not seed officer to Supabase:', error.message);
        } else {
          console.log('✅ Initial officer seeded to Supabase with bcrypt hash.');
        }
      } else {
        await supabase.from('users').update({ password_hash }).eq('phone', phone);
        console.log('✅ Initial officer password hash updated in Supabase.');
      }
    } catch (err) {
      console.warn('⚠️ Supabase officer seed error:', err.message);
    }
  }

  const existingMemIdx = memoryUsers.findIndex(u => u.phone === phone);
  const memUser = {
    id: 'officer_1042',
    name,
    phone,
    role,
    district,
    password_hash,
    created_at: new Date().toISOString()
  };
  if (existingMemIdx >= 0) {
    memoryUsers[existingMemIdx] = memUser;
  } else {
    memoryUsers.push(memUser);
  }
};

// Seed officer at startup
seedInitialOfficer().catch(err => console.warn('Officer seed warning:', err.message));

exports.seedInitialOfficer = seedInitialOfficer;

// OFFICER QUICK LOGIN (For Admin Portal Authentication)
exports.officerLogin = async (req, res, next) => {
  try {
    const { password, phone } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Officer password required.' });
    }

    let officer = null;

    if (supabase) {
      let query = supabase.from('users').select('*').eq('role', 'officer');
      if (phone) {
        query = query.eq('phone', phone);
      }
      const { data, error } = await query.limit(1).maybeSingle();
      if (!error && data) {
        officer = data;
      }
    }

    if (!officer) {
      officer = memoryUsers.find(u => u.role === 'officer' && (!phone || u.phone === phone));
    }

    let isMatch = false;
    if (officer && officer.password_hash) {
      try {
        isMatch = await bcrypt.compare(password, officer.password_hash);
      } catch (e) {
        isMatch = false;
      }
    }

    // Resilient fallback: allow configured ADMIN_INITIAL_SECRET
    const adminSecret = process.env.ADMIN_INITIAL_SECRET;
    if (!isMatch && adminSecret && password === adminSecret) {
      isMatch = true;
      try {
        const newHash = await bcrypt.hash(password, 10);
        if (supabase) {
          await supabase.from('users').update({ password_hash: newHash }).eq('phone', officer?.phone || '9999900000');
        }
      } catch (e) {}
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid officer authentication credentials.' });
    }

    const officerUser = {
      id: officer?.id || 'officer_1042',
      name: officer?.name || 'Lead Officer #1042',
      phone: officer?.phone || '9999900000',
      role: 'officer',
      district: officer?.district || 'Procurement Control HQ'
    };
    const token = generateJWT(officerUser);

    return res.json({
      success: true,
      message: 'Officer authenticated successfully.',
      user: officerUser,
      token
    });
  } catch (err) {
    next(err);
  }
};

// GET CURRENT AUTHENTICATED USER PROFILE
exports.getMe = async (req, res, next) => {
  try {
    return res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};
