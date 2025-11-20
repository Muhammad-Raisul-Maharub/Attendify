-- Attendify Seed Data
-- This populates the database with initial data from the existing app

-- ====================================
-- 1. ROLES
-- ====================================

INSERT INTO roles (id, name) VALUES
(1, 'student'),
(2, 'teacher'),
(3, 'admin');

-- ====================================
-- 2. USERS (from existing app data)
-- ====================================

-- Admin
INSERT INTO users (id, auth_uid, email, full_name, password, role_id) VALUES
('1', 'auth1', 'admin@attendify.app', 'System Admin', '123', 3);

-- Teachers
INSERT INTO users (id, auth_uid, email, full_name, password, role_id) VALUES
('2', 'auth2', 'arif@attendify.app', 'Mohammad Arif Hasan Chowdhury', '123', 2),
('3', 'auth3', 'zainal@attendify.app', 'Mohammad Zainal Abedin', '123', 2),
('4', 'auth4', 'mahmudur@attendify.app', 'Md Mahmudur Rahman', '123', 2),
('5', 'auth5', 'mubasshar@attendify.app', 'Mubasshar-Ul-Ishraq Tamim', '123', 2);

-- Students
INSERT INTO users (id, auth_uid, email, full_name, password, role_id, student_id) VALUES
('10', 'auth10', 'student@attendify.app', 'Alex Johnson', '123', 1, 'S001'),
('11', 'auth11', 'student2@attendify.app', 'Ben Stone', '123', 1, 'S002');

-- Demo accounts for quick login
INSERT INTO users (id, auth_uid, email, full_name, password, role_id) VALUES
('50', 'demo1', 'admin@attendify.app', 'Demo Admin', '123', 3),
('51', 'demo2', 'arif@attendify.app', 'Demo Teacher', '123', 2),
('52', 'demo3', 'student@attendify.app', 'Demo Student', '123', 1);

-- ====================================
-- 3. COURSES (from existing routine)
-- ====================================

INSERT INTO courses (id, code, name, teacher_id) VALUES
('c-CSE413', 'CSE 413', 'Software Engineering', '2'),
('c-CSE417', 'CSE 417', 'Computer Graphics and Image Processing', '3'),
('c-CSE418', 'CSE 418', 'Computer Graphics and Image Processing Lab', '3'),
('c-CSE414', 'CSE 414', 'Software Engineering Lab', '2'),
('c-CSE467', 'CSE 467', 'Advanced Database Management System', '4'),
('c-CSE468', 'CSE 468', 'ADBMS Lab', '4'),
('c-EEE411', 'EEE 411', 'VLSI Design', '5'),
('c-CSE410', 'CSE 410', 'System Analysis and Design Lab', '2');

-- ====================================
-- 4. CLASS ROUTINE (weekly schedule)
-- ====================================

INSERT INTO class_routine (id, course_id, day_of_week, start_time, end_time, room) VALUES
-- Sunday
('cr1', 'c-CSE413', 'Sunday', '08:15:00', '10:00:00', '1604'),
('cr2', 'c-CSE417', 'Sunday', '13:45:00', '15:30:00', '1405'),

-- Monday
('cr3', 'c-CSE418', 'Monday', '08:15:00', '10:55:00', '402'),
('cr4', 'c-CSE414', 'Monday', '11:00:00', '13:45:00', '404'),
('cr5', 'c-CSE467', 'Monday', '13:45:00', '14:35:00', '107'),

-- Tuesday
('cr6', 'c-CSE413', 'Tuesday', '09:10:00', '10:00:00', '1403'),
('cr7', 'c-CSE468', 'Tuesday', '11:00:00', '13:45:00', '402'),
('cr8', 'c-EEE411', 'Tuesday', '13:45:00', '16:20:00', '1407'),

-- Wednesday
('cr9', 'c-CSE410', 'Wednesday', '08:15:00', '10:00:00', '404'),
('cr10', 'c-CSE467', 'Wednesday', '10:05:00', '11:50:00', '1405'),
('cr11', 'c-CSE417', 'Wednesday', '11:55:00', '12:45:00', '1405');

-- ====================================
-- 5. SAMPLE SESSION (today's date)
-- ====================================

-- Create a sample session for today
INSERT INTO sessions (id, course_id, start_time, end_time, status, room, is_adhoc) 
VALUES (
    CONCAT('sample-', DATE_FORMAT(NOW(), '%Y%m%d')),
    'c-CSE413',
    CONCAT(CURDATE(), ' 09:00:00'),
    CONCAT(CURDATE(), ' 10:30:00'),
    'completed',
    '1604',
    FALSE
);

-- ====================================
-- 6. SAMPLE ATTENDANCE
-- ====================================

-- Mark sample attendance for student Alex Johnson
INSERT INTO attendance (id, session_id, student_id, check_method) 
VALUES (
    CONCAT('att-sample-', UNIX_TIMESTAMP()),
    CONCAT('sample-', DATE_FORMAT(NOW(), '%Y%m%d')),
    '10',
    'qr'
);

-- ====================================
-- 7. AUDIT LOGS (initial setup log)
-- ====================================

INSERT INTO audit_logs (actor_name, actor_role, action, target) VALUES
('System', 'system', 'Database Initialized', 'Created all tables and seeded initial data'),
('System Admin', 'admin', 'System Setup', 'Configured Attendify application');

-- ====================================
-- 8. SUCCESS MESSAGE
-- ====================================

SELECT 'Database initialized successfully!' AS message,
       (SELECT COUNT(*) FROM users) AS total_users,
       (SELECT COUNT(*) FROM courses) AS total_courses,
       (SELECT COUNT(*) FROM class_routine) AS routine_items,
       (SELECT COUNT(*) FROM sessions) AS total_sessions,
       (SELECT COUNT(*) FROM attendance) AS attendance_records;