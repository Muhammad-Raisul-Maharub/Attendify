╔══════════════════════════════════════════════════════════════════════════════╗
║                        ATTENDIFY - README                                    ║
║              Smart Attendance Management System with MySQL                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
📋 TABLE OF CONTENTS
═══════════════════════════════════════════════════════════════════════════════

1. Overview
2. System Architecture
3. Features
4. Technology Stack
5. Quick Start (One Command Setup)
6. Port Configuration
7. Default Credentials
8. Project Structure
9. Database Schema
10. API Endpoints
11. Troubleshooting
12. Contributing
13. License

═══════════════════════════════════════════════════════════════════════════════
1. OVERVIEW
═══════════════════════════════════════════════════════════════════════════════

Attendify is a modern, full-stack attendance management system designed for
educational institutions. It provides:

✓ QR Code-based attendance marking
✓ Real-time session monitoring
✓ Role-based access (Student, Teacher, Admin)
✓ Analytics and reporting
✓ Audit logging
✓ Responsive design (mobile-first)

This system uses Docker for containerization, MySQL for data persistence,
Adminer for database management, and a Node.js/Express backend API.

═══════════════════════════════════════════════════════════════════════════════
2. SYSTEM ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────┐
│   React App     │ (Frontend - Port 3000)
│  (Vite + TS)    │
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│  Express API    │ (Backend - Port 5000)
│   (Node.js)     │
└────────┬────────┘
         │ SQL Queries
         ▼
┌─────────────────┐
│  MySQL 8.0      │ (Database - Port 3306)
│   (Persistent)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    Adminer      │ (DB GUI - Port 8080)
│  (Management)   │
└─────────────────┘

═══════════════════════════════════════════════════════════════════════════════
3. FEATURES
═══════════════════════════════════════════════════════════════════════════════

STUDENT FEATURES:
  • View class schedule
  • Mark attendance via QR code or passcode
  • View attendance history
  • Track attendance percentage
  • Update profile (limited name changes)

TEACHER FEATURES:
  • Create instant sessions
  • Generate QR codes for attendance
  • View live roster
  • Manage class routine
  • Export attendance reports (CSV)
  • Session analytics

ADMIN FEATURES:
  • User management (CRUD)
  • System analytics
  • Audit log viewing
  • Course management
  • Full database access via Adminer

═══════════════════════════════════════════════════════════════════════════════
4. TECHNOLOGY STACK
═══════════════════════════════════════════════════════════════════════════════

FRONTEND:
  • React 19.2
  • TypeScript
  • Vite
  • Tailwind CSS (via CDN)
  • React Router DOM
  • QR Code generation/scanning
  • Date-fns
  • Recharts

BACKEND:
  • Node.js 18
  • Express 4.18
  • MySQL2 (driver)
  • JWT authentication
  • bcrypt (password hashing)
  • CORS, Helmet (security)

DATABASE:
  • MySQL 8.0
  • Adminer (latest)

INFRASTRUCTURE:
  • Docker & Docker Compose
  • Volume persistence
  • Health checks
  • Auto-restart policies

═══════════════════════════════════════════════════════════════════════════════
5. QUICK START (ONE COMMAND SETUP)
═══════════════════════════════════════════════════════════════════════════════

PREREQUISITES:
  1. Docker Desktop installed and running
  2. Git installed
  3. Node.js 18+ (for local frontend development)

SETUP STEPS:

Step 1: Clone the repository
────────────────────────────────────────────────────────────────────────────────
git clone <your-repo-url>
cd attendify
────────────────────────────────────────────────────────────────────────────────

Step 2: Create required directories
────────────────────────────────────────────────────────────────────────────────
mkdir -p backend/src/config backend/src/routes backend/src/middleware docker/init-scripts
────────────────────────────────────────────────────────────────────────────────

Step 3: Copy all provided files to their locations (see Project Structure below)

Step 4: Start all services with ONE command
────────────────────────────────────────────────────────────────────────────────
docker compose up -d
────────────────────────────────────────────────────────────────────────────────

Step 5: Install frontend dependencies and start
────────────────────────────────────────────────────────────────────────────────
npm install
npm run dev
────────────────────────────────────────────────────────────────────────────────

That's it! The system is now running.

═══════════════════════════════════════════════════════════════════════════════
6. PORT CONFIGURATION
═══════════════════════════════════════════════════════════════════════════════

Service       Port    URL
─────────────────────────────────────────────────────────────────────────────
Frontend      3000    http://localhost:3000
Backend API   5000    http://localhost:5000
MySQL         3306    mysql://localhost:3306
Adminer       8080    http://localhost:8080
─────────────────────────────────────────────────────────────────────────────

═══════════════════════════════════════════════════════════════════════════════
7. DEFAULT CREDENTIALS
═══════════════════════════════════════════════════════════════════════════════

APPLICATION LOGIN:
─────────────────────────────────────────────────────────────────────────────
Role        Email                         Password
─────────────────────────────────────────────────────────────────────────────
Admin       admin@attendify.app           123
Teacher     arif@attendify.app            123
Student     student@attendify.app         123
─────────────────────────────────────────────────────────────────────────────

ADMINER LOGIN:
─────────────────────────────────────────────────────────────────────────────
System      MySQL
Server      mysql (or "attendify_mysql" or "localhost")
Username    attendify_user
Password    attendify_pass
Database    attendify_db
─────────────────────────────────────────────────────────────────────────────

MYSQL ROOT:
─────────────────────────────────────────────────────────────────────────────
Username    root
Password    rootpass123
─────────────────────────────────────────────────────────────────────────────

═══════════════════════════════════════════════════════════════════════════════
8. PROJECT STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

attendify/
├── backend/                        # Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        # MySQL connection pool
│   │   ├── routes/
│   │   │   ├── auth.js            # Login, signup, JWT
│   │   │   ├── users.js           # User CRUD
│   │   │   ├── courses.js         # Course & routine management
│   │   │   ├── sessions.js        # Session management
│   │   │   └── attendance.js      # Attendance marking
│   │   └── server.js              # Express app entry point
│   ├── .env                       # Environment variables
│   ├── package.json               # Dependencies
│   └── Dockerfile                 # Container config
│
├── docker/                         # Docker configuration
│   └── init-scripts/
│       ├── 01-schema.sql          # Database schema
│       └── 02-seed.sql            # Seed data
│
├── components/                     # React components
├── pages/                          # React pages
├── services/                       # Frontend services
├── context/                        # React context
│
├── docker-compose.yml              # Orchestration config
├── README.txt                      # This file
├── MANUAL.txt                      # Detailed usage guide
└── package.json                    # Frontend dependencies

═══════════════════════════════════════════════════════════════════════════════
9. DATABASE SCHEMA
═══════════════════════════════════════════════════════════════════════════════

TABLES:
  • roles                  - User role definitions
  • users                  - User accounts
  • name_change_history    - Track profile name changes
  • courses                - Course catalog
  • class_routine          - Weekly schedule
  • sessions               - Class sessions (routine + ad-hoc)
  • attendance             - Attendance records
  • audit_logs             - System activity logs
  • system_metadata        - Configuration settings

RELATIONSHIPS:
  users → roles (FK: role_id)
  courses → users (FK: teacher_id)
  class_routine → courses (FK: course_id)
  sessions → courses (FK: course_id)
  attendance → sessions, users (FK: session_id, student_id)

═══════════════════════════════════════════════════════════════════════════════
10. API ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

BASE URL: http://localhost:5000/api

AUTHENTICATION:
  POST   /auth/login                  Login with email, password, role
  POST   /auth/signup                 Create new account
  GET    /auth/verify                 Verify JWT token

USERS:
  GET    /users                       Get all users
  GET    /users/:id                   Get user by ID
  PUT    /users/:id                   Update user
  PATCH  /users/:id/name              Update profile name (restricted)
  DELETE /users/:id                   Delete user

COURSES:
  GET    /courses                     Get all courses
  GET    /courses/routine             Get class routine
  POST   /courses/routine             Add class to routine
  PUT    /courses/routine/:id         Update routine item
  DELETE /courses/routine/:id         Delete routine item

SESSIONS:
  GET    /sessions/student/:id        Get sessions for student
  GET    /sessions/teacher/:id        Get sessions for teacher
  POST   /sessions/adhoc              Create instant session
  PATCH  /sessions/:id/status         Update session status
  PATCH  /sessions/:id/passcode       Set session passcode
  GET    /sessions/history/:id        Get student attendance history

ATTENDANCE:
  POST   /attendance/mark             Mark attendance
  GET    /attendance/session/:id      Get session attendance
  GET    /attendance/export/:id       Export attendance CSV
  DELETE /attendance/:id              Delete attendance record

═══════════════════════════════════════════════════════════════════════════════
11. TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

PROBLEM: "Port already in use"
SOLUTION: Change ports in docker-compose.yml or stop conflicting services

PROBLEM: "Cannot connect to MySQL"
SOLUTION: Wait 30 seconds for MySQL to fully initialize on first startup

PROBLEM: "Permission denied" errors
SOLUTION: Run with sudo on Linux, or check Docker Desktop permissions

PROBLEM: Adminer can't connect to MySQL
SOLUTION: Use server name "mysql" instead of "localhost"

PROBLEM: Frontend can't reach backend
SOLUTION: Check CORS settings in backend/.env

PROBLEM: Database reset needed
SOLUTION: Run: docker compose down -v
         Then: docker compose up -d

═══════════════════════════════════════════════════════════════════════════════
12. CONTRIBUTING
═══════════════════════════════════════════════════════════════════════════════

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit changes (git commit -m 'Add amazing feature')
4. Push to branch (git push origin feature/amazing-feature)
5. Open a Pull Request

═══════════════════════════════════════════════════════════════════════════════
13. LICENSE
═══════════════════════════════════════════════════════════════════════════════

MIT License - see LICENSE file for details

═══════════════════════════════════════════════════════════════════════════════

For detailed usage instructions, see MANUAL.txt
For technical support, create an issue on GitHub

═══════════════════════════════════════════════════════════════════════════════