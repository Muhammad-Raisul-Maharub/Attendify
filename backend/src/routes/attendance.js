const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { isAfter, parseISO } = require('date-fns');

// ====================================
// MARK ATTENDANCE
// ====================================

router.post('/mark', async (req, res) => {
  try {
    const { sessionId, studentId, passcode } = req.body;

    if (!sessionId || !studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session ID and Student ID are required' 
      });
    }

    // Get session
    const sessions = await query(`
      SELECT * FROM sessions WHERE id = ?
    `, [sessionId]);

    if (sessions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    const session = sessions[0];

    // Check if session is ongoing
    if (session.status !== 'ongoing') {
      return res.status(400).json({ 
        success: false, 
        message: 'Session is not active for attendance' 
      });
    }

    // Verify passcode if provided
    if (passcode) {
      if (!session.active_passcode) {
        return res.status(400).json({ 
          success: false, 
          message: 'No active passcode for this session' 
        });
      }

      if (session.active_passcode.toUpperCase() !== passcode.toUpperCase()) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid passcode/QR code' 
        });
      }

      if (session.passcode_expiry && isAfter(new Date(), parseISO(session.passcode_expiry))) {
        return res.status(400).json({ 
          success: false, 
          message: 'Passcode has expired. Ask teacher to refresh' 
        });
      }
    }

    // Check if already marked
    const existing = await query(`
      SELECT id FROM attendance 
      WHERE session_id = ? AND student_id = ?
    `, [sessionId, studentId]);

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Attendance already marked for this session' 
      });
    }

    // Mark attendance
    const attendanceId = `att-${Date.now()}-${Math.random()}`;
    await query(`
      INSERT INTO attendance (id, session_id, student_id, check_method)
      VALUES (?, ?, ?, ?)
    `, [attendanceId, sessionId, studentId, passcode ? 'passcode' : 'qr']);

    res.status(201).json({ 
      success: true, 
      message: 'Attendance marked successfully!' 
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark attendance' 
    });
  }
});

// ====================================
// GET SESSION ATTENDANCE
// ====================================

router.get('/session/:sessionId', async (req, res) => {
  try {
    const attendance = await query(`
      SELECT 
        a.id,
        a.checked_in_at,
        a.check_method,
        u.id as student_id,
        u.full_name as student_name,
        u.student_id as student_number,
        u.email as student_email
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.session_id = ?
      ORDER BY a.checked_in_at ASC
    `, [req.params.sessionId]);

    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch attendance' 
    });
  }
});

// ====================================
// EXPORT ATTENDANCE DATA
// ====================================

router.get('/export/:teacherId', async (req, res) => {
  try {
    const { period = 'daily', courseCode } = req.query;
    const teacherId = req.params.teacherId;

    // Build date filter
    let dateFilter = '';
    if (period === 'daily') {
      dateFilter = 'AND DATE(s.start_time) = CURDATE()';
    } else if (period === 'weekly') {
      dateFilter = 'AND YEARWEEK(s.start_time, 1) = YEARWEEK(CURDATE(), 1)';
    } else if (period === 'monthly') {
      dateFilter = 'AND YEAR(s.start_time) = YEAR(CURDATE()) AND MONTH(s.start_time) = MONTH(CURDATE())';
    }

    // Build course filter
    let courseFilter = '';
    if (courseCode && courseCode !== 'all') {
      courseFilter = 'AND c.code = ?';
    }

    const params = [teacherId];
    if (courseCode && courseCode !== 'all') {
      params.push(courseCode);
    }

    const attendance = await query(`
      SELECT 
        DATE_FORMAT(s.start_time, '%Y-%m-%d %H:%i') as session_date,
        c.code as course_code,
        c.name as course_name,
        u.full_name as student_name,
        u.student_id,
        DATE_FORMAT(a.checked_in_at, '%H:%i:%s') as checkin_time
      FROM attendance a
      JOIN sessions s ON a.session_id = s.id
      JOIN courses c ON s.course_id = c.id
      JOIN users u ON a.student_id = u.id
      WHERE c.teacher_id = ?
      ${courseFilter}
      ${dateFilter}
      ORDER BY s.start_time DESC, a.checked_in_at ASC
    `, params);

    // Generate CSV
    let csv = 'Session Date,Course Code,Course Name,Student Name,Student ID,Check-in Time\n';
    attendance.forEach(row => {
      csv += `${row.session_date},"${row.course_code}","${row.course_name}","${row.student_name}",${row.student_id || ''},${row.checkin_time}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${period}_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export attendance' 
    });
  }
});

// ====================================
// DELETE ATTENDANCE RECORD (Admin only)
// ====================================

router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Attendance record deleted' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete attendance' 
    });
  }
});

module.exports = router;