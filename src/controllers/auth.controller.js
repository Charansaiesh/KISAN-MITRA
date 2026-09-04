const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Robust fallback user memory store
const memoryUsers = [];

const generateJWT = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, phone: user.phone, role: user.role, district: user.district },
    process.env.JWT_SECRET || 'kisanmitra_jwt_secret_dev_key_2025_secure_983274293',
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

// OFFICER QUICK LOGIN (For Admin Portal Authentication)
exports.officerLogin = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Officer password required.' });
    }

    const validOfficerPass = process.env.ADMIN_INITIAL_SECRET || 'admin123';
    if (password === validOfficerPass) {
      const officerUser = {
        id: 'officer_1042',
        name: 'Officer #1042',
        phone: '18001801551',
        role: 'officer',
        district: 'Procurement Control HQ'
      };
      const token = generateJWT(officerUser);

      return res.json({
        success: true,
        message: 'Officer authenticated successfully.',
        user: officerUser,
        token
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid officer authentication credentials.' });
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
