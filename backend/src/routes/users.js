const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { subMonths, isAfter, parseISO } = require('date-fns');

// ====================================
// GET ALL USERS
// ====================================

router.get('/', async (req, res) => {
  try {
    const users = await query(`
      SELECT u.*, r.name as role 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);

    // Remove passwords
    const safeUsers = users.map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });

    res.json({ success: true, users: safeUsers });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// ====================================
// GET USER BY ID
// ====================================

router.get('/:id', async (req, res) => {
  try {
    const users = await query(`
      SELECT u.*, r.name as role 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password, ...user } = users[0];
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// ====================================
// UPDATE USER
// ====================================

router.put('/:id', async (req, res) => {
  try {
    const { full_name, email, role, student_id, password } = req.body;
    const userId = req.params.id;

    // Get role_id if role changed
    let role_id;
    if (role) {
      const roles = await query('SELECT id FROM roles WHERE name = ?', [role]);
      if (roles.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      role_id = roles[0].id;
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (full_name) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role_id) {
      updates.push('role_id = ?');
      values.push(role_id);
    }
    if (student_id !== undefined) {
      updates.push('student_id = ?');
      values.push(student_id || null);
    }
    if (password) {
      updates.push('password = ?');
      values.push(password);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(userId);

    await query(`
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `, values);

    // Log audit
    await query(`
      INSERT INTO audit_logs (actor_name, actor_role, action, target)
      VALUES (?, ?, ?, ?)
    `, ['System', 'admin', 'Updated User', userId]);

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// ====================================
// UPDATE PROFILE NAME (WITH RESTRICTIONS)
// ====================================

router.patch('/:id/name', async (req, res) => {
  try {
    const { newName } = req.body;
    const userId = req.params.id;

    if (!newName) {
      return res.status(400).json({ success: false, message: 'New name is required' });
    }

    // Get user
    const users = await query(`
      SELECT u.*, r.name as role 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    // Only students and teachers can use this endpoint
    if (!['student', 'teacher'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only students and teachers can edit their name this way' 
      });
    }

    // Check name change history
    const sixMonthsAgo = subMonths(new Date(), 6);
    const history = await query(`
      SELECT changed_at 
      FROM name_change_history 
      WHERE user_id = ? AND changed_at >= ?
    `, [userId, sixMonthsAgo]);

    if (history.length >= 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'You can only change your name twice every 6 months' 
      });
    }

    // Update name
    const oldName = user.full_name;
    await query('UPDATE users SET full_name = ? WHERE id = ?', [newName, userId]);

    // Record history
    await query(`
      INSERT INTO name_change_history (user_id, old_name, new_name)
      VALUES (?, ?, ?)
    `, [userId, oldName, newName]);

    // Log audit
    await query(`
      INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, target)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, newName, user.role, 'Updated Own Profile Name', `${oldName} -> ${newName}`]);

    res.json({ success: true, message: 'Name updated successfully' });
  } catch (error) {
    console.error('Update name error:', error);
    res.status(500).json({ success: false, message: 'Failed to update name' });
  }
});

// ====================================
// DELETE USER
// ====================================

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user info for audit log
    const users = await query('SELECT full_name FROM users WHERE id = ?', [userId]);
    
    await query('DELETE FROM users WHERE id = ?', [userId]);

    if (users.length > 0) {
      await query(`
        INSERT INTO audit_logs (actor_name, actor_role, action, target)
        VALUES (?, ?, ?, ?)
      `, ['System', 'admin', 'Deleted User', users[0].full_name]);
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

module.exports = router;