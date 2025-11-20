const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = '7d';

// ====================================
// LOGIN
// ====================================

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, password, and role are required' 
      });
    }

    // Get user with role
    const users = await query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND r.name = ?
    `, [email, role]);

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found with this role' 
      });
    }

    const user = users[0];

    // Check password (plain text for now - matching seed data)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false,
        message: 'Incorrect password' 
      });
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role_name 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (excluding password)
    delete user.password;
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        auth_uid: user.auth_uid,
        email: user.email,
        full_name: user.full_name,
        role: user.role_name,
        student_id: user.student_id,
        last_login: user.last_login
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed' 
    });
  }
});

// ====================================
// SIGNUP
// ====================================

router.post('/signup', async (req, res) => {
  try {
    const { email, full_name, password, role, student_id } = req.body;

    if (!email || !full_name || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    // Get role_id
    const roles = await query('SELECT id FROM roles WHERE name = ?', [role]);
    if (roles.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role' 
      });
    }

    const role_id = roles[0].id;

    // Generate IDs
    const userId = `u${Date.now()}`;
    const authUid = `auth${Date.now()}`;

    // Insert user
    await query(`
      INSERT INTO users (id, auth_uid, email, full_name, password, role_id, student_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, authUid, email, full_name, password, role_id, student_id || null]);

    // Log audit
    await query(`
      INSERT INTO audit_logs (actor_name, actor_role, action, target)
      VALUES (?, ?, ?, ?)
    `, [full_name, role, 'User Signup', `New ${role} account created`]);

    res.status(201).json({
      success: true,
      message: 'Account created successfully'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Signup failed' 
    });
  }
});

// ====================================
// VERIFY TOKEN
// ====================================

router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get fresh user data
    const users = await query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [decoded.id]);

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const user = users[0];
    delete user.password;

    res.json({
      success: true,
      user: {
        id: user.id,
        auth_uid: user.auth_uid,
        email: user.email,
        full_name: user.full_name,
        role: user.role_name,
        student_id: user.student_id,
        last_login: user.last_login
      }
    });

  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
});

module.exports = router;