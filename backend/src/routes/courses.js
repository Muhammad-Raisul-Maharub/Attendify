const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// ====================================
// GET ALL COURSES
// ====================================

router.get('/', async (req, res) => {
  try {
    const courses = await query(`
      SELECT c.*, u.full_name as teacher_name
      FROM courses c
      JOIN users u ON c.teacher_id = u.id
      ORDER BY c.code
    `);

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
});

// ====================================
// GET CLASS ROUTINE
// ====================================

router.get('/routine', async (req, res) => {
  try {
    const routine = await query(`
      SELECT 
        cr.*,
        c.code as course_code,
        c.name as course_name,
        u.id as teacherId,
        u.full_name as teacherName
      FROM class_routine cr
      JOIN courses c ON cr.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE cr.is_active = TRUE
      ORDER BY 
        FIELD(cr.day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
        cr.start_time
    `);

    res.json({ success: true, routine });
  } catch (error) {
    console.error('Get routine error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch routine' });
  }
});

// ====================================
// ADD COURSE TO ROUTINE
// ====================================

router.post('/routine', async (req, res) => {
  try {
    const { 
      day, 
      start_time, 
      end_time, 
      course_code, 
      course_name, 
      room, 
      teacherId, 
      teacherName 
    } = req.body;

    if (!day || !start_time || !end_time || !course_code || !course_name || !room || !teacherId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Create or get course
    let courseId;
    const existingCourse = await query('SELECT id FROM courses WHERE code = ?', [course_code]);
    
    if (existingCourse.length > 0) {
      courseId = existingCourse[0].id;
    } else {
      courseId = `c-${course_code.replace(/\s+/g, '')}`;
      await query(`
        INSERT INTO courses (id, code, name, teacher_id)
        VALUES (?, ?, ?, ?)
      `, [courseId, course_code, course_name, teacherId]);
    }

    // Add to routine
    const routineId = `cr${Date.now()}`;
    await query(`
      INSERT INTO class_routine (id, course_id, day_of_week, start_time, end_time, room)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [routineId, courseId, day, start_time, end_time, room]);

    // Log audit
    await query(`
      INSERT INTO audit_logs (actor_name, actor_role, action, target)
      VALUES (?, ?, ?, ?)
    `, [teacherName || 'System', 'teacher', 'Added Class to Routine', course_code]);

    res.status(201).json({ 
      success: true, 
      message: 'Class added to schedule',
      routineId 
    });
  } catch (error) {
    console.error('Add routine error:', error);
    res.status(500).json({ success: false, message: 'Failed to add to routine' });
  }
});

// ====================================
// UPDATE ROUTINE ITEM
// ====================================

router.put('/routine/:id', async (req, res) => {
  try {
    const { day, start_time, end_time, room } = req.body;
    const routineId = req.params.id;

    const updates = [];
    const values = [];

    if (day) {
      updates.push('day_of_week = ?');
      values.push(day);
    }
    if (start_time) {
      updates.push('start_time = ?');
      values.push(start_time);
    }
    if (end_time) {
      updates.push('end_time = ?');
      values.push(end_time);
    }
    if (room) {
      updates.push('room = ?');
      values.push(room);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(routineId);

    await query(`
      UPDATE class_routine 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `, values);

    res.json({ success: true, message: 'Class schedule updated' });
  } catch (error) {
    console.error('Update routine error:', error);
    res.status(500).json({ success: false, message: 'Failed to update routine' });
  }
});

// ====================================
// DELETE ROUTINE ITEM
// ====================================

router.delete('/routine/:id', async (req, res) => {
  try {
    await query('DELETE FROM class_routine WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Class removed from schedule' });
  } catch (error) {
    console.error('Delete routine error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete routine' });
  }
});

// ====================================
// GET AUDIT LOGS
// ====================================

router.get('/admin/logs', async (req, res) => {
  try {
    const logs = await query(`
      SELECT * FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT 200
    `);

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
});

module.exports = router;