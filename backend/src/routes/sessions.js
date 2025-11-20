const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { addSeconds, parseISO, isAfter } = require('date-fns');

// ====================================
// GET STUDENT SESSIONS
// ====================================

router.get('/student/:studentId', async (req, res) => {
  try {
    const sessions = await query(`
      SELECT 
        s.*,
        c.id as course_id,
        c.code as course_code,
        c.name as course_name,
        u.id as teacher_id,
        u.full_name as teacher_name,
        (SELECT COUNT(*) FROM users WHERE role_id = 1) as total_students
      FROM sessions s
      JOIN courses c ON s.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      ORDER BY s.start_time DESC
    `);

    // Get attendance for each session
    const sessionsWithAttendance = await Promise.all(
      sessions.map(async (session) => {
        const attendance = await query(`
          SELECT 
            a.id,
            a.checked_in_at as checked_at,
            u.id as student_id,
            u.full_name as student_name,
            u.student_id as student_number
          FROM attendance a
          JOIN users u ON a.student_id = u.id
          WHERE a.session_id = ?
        `, [session.id]);

        return {
          id: session.id,
          course: {
            id: session.course_id,
            code: session.course_code,
            name: session.course_name,
            teacherName: session.teacher_name,
            teacherId: session.teacher_id
          },
          start_time: session.start_time,
          end_time: session.end_time,
          status: session.status,
          room: session.room,
          totalStudents: session.total_students,
          liveAttendance: attendance.map(a => ({
            id: a.id,
            student: {
              id: a.student_id,
              full_name: a.student_name,
              student_id: a.student_number
            },
            checked_at: a.checked_at
          })),
          activePasscode: session.active_passcode,
          passcodeExpiry: session.passcode_expiry
        };
      })
    );

    res.json({ success: true, sessions: sessionsWithAttendance });
  } catch (error) {
    console.error('Get student sessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
});

// ====================================
// GET TEACHER SESSIONS
// ====================================

router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const sessions = await query(`
      SELECT 
        s.*,
        c.id as course_id,
        c.code as course_code,
        c.name as course_name,
        u.id as teacher_id,
        u.full_name as teacher_name,
        (SELECT COUNT(*) FROM users WHERE role_id = 1) as total_students
      FROM sessions s
      JOIN courses c ON s.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE c.teacher_id = ?
      ORDER BY s.start_time DESC
    `, [req.params.teacherId]);

    const sessionsWithAttendance = await Promise.all(
      sessions.map(async (session) => {
        const attendance = await query(`
          SELECT 
            a.id,
            a.checked_in_at as checked_at,
            u.id as student_id,
            u.full_name as student_name,
            u.student_id as student_number
          FROM attendance a
          JOIN users u ON a.student_id = u.id
          WHERE a.session_id = ?
        `, [session.id]);

        return {
          id: session.id,
          course: {
            id: session.course_id,
            code: session.course_code,
            name: session.course_name,
            teacherName: session.teacher_name,
            teacherId: session.teacher_id
          },
          start_time: session.start_time,
          end_time: session.end_time,
          status: session.status,
          room: session.room,
          totalStudents: session.total_students,
          liveAttendance: attendance.map(a => ({
            id: a.id,
            student: {
              id: a.student_id,
              full_name: a.student_name,
              student_id: a.student_number
            },
            checked_at: a.checked_at
          })),
          activePasscode: session.active_passcode,
          passcodeExpiry: session.passcode_expiry
        };
      })
    );

    res.json({ success: true, sessions: sessionsWithAttendance });
  } catch (error) {
    console.error('Get teacher sessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
});

// ====================================
// CREATE AD-HOC SESSION
// ====================================

router.post('/adhoc', async (req, res) => {
  try {
    const { courseName, courseCode, room, startTime, endTime, teacherId, teacherName } = req.body;

    if (!courseName || !courseCode || !room || !startTime || !endTime || !teacherId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Create or get course
    let courseId;
    const existingCourse = await query('SELECT id FROM courses WHERE code = ?', [courseCode]);
    
    if (existingCourse.length > 0) {
      courseId = existingCourse[0].id;
    } else {
      courseId = `c-${courseCode.replace(/\s+/g, '')}`;
      await query(`
        INSERT INTO courses (id, code, name, teacher_id)
        VALUES (?, ?, ?, ?)
      `, [courseId, courseCode, courseName, teacherId]);
    }

    // Create session
    const sessionId = `adhoc-${Date.now()}`;
    await query(`
      INSERT INTO sessions (id, course_id, start_time, end_time, room, is_adhoc, status)
      VALUES (?, ?, ?, ?, ?, TRUE, 'ongoing')
    `, [sessionId, courseId, startTime, endTime, room]);

    // Log audit
    await query(`
      INSERT INTO audit_logs (actor_name, actor_role, action, target)
      VALUES (?, ?, ?, ?)
    `, [teacherName, 'teacher', 'Created Instant Session', courseName]);

    res.status(201).json({ 
      success: true, 
      message: 'Session created',
      sessionId 
    });
  } catch (error) {
    console.error('Create adhoc session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create session' });
  }
});

// ====================================
// UPDATE SESSION STATUS
// ====================================

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const sessionId = req.params.id;

    if (!['scheduled', 'ongoing', 'paused', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await query('UPDATE sessions SET status = ? WHERE id = ?', [status, sessionId]);

    res.json({ success: true, message: 'Session status updated' });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// ====================================
// SET SESSION PASSCODE
// ====================================

router.patch('/:id/passcode', async (req, res) => {
  try {
    const { passcode, durationSeconds } = req.body;
    const sessionId = req.params.id;

    if (!passcode || !durationSeconds) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passcode and duration are required' 
      });
    }

    const expiry = addSeconds(new Date(), durationSeconds);

    await query(`
      UPDATE sessions 
      SET active_passcode = ?, passcode_expiry = ? 
      WHERE id = ?
    `, [passcode, expiry, sessionId]);

    res.json({ success: true, message: 'Passcode set' });
  } catch (error) {
    console.error('Set passcode error:', error);
    res.status(500).json({ success: false, message: 'Failed to set passcode' });
  }
});

// ====================================
// GET STUDENT HISTORY
// ====================================

router.get('/history/:studentId', async (req, res) => {
  try {
    const sessions = await query(`
      SELECT 
        s.*,
        c.id as course_id,
        c.code as course_code,
        c.name as course_name,
        u.full_name as teacher_name,
        EXISTS(
          SELECT 1 FROM attendance 
          WHERE session_id = s.id AND student_id = ?
        ) as attended
      FROM sessions s
      JOIN courses c ON s.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE s.status = 'completed' OR s.end_time < NOW()
      ORDER BY s.start_time DESC
    `, [req.params.studentId]);

    const history = sessions.map(s => ({
      id: s.id,
      course: {
        id: s.course_id,
        code: s.course_code,
        name: s.course_name,
        teacherName: s.teacher_name
      },
      start_time: s.start_time,
      end_time: s.end_time,
      room: s.room,
      attended: Boolean(s.attended)
    }));

    res.json({ success: true, history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

module.exports = router;