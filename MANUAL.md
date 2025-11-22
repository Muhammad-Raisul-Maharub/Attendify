# Attendify - Complete Usage Manual

## Table of Contents
1. [Part 1: Setup & Installation](#part-1-setup--installation)
2. [Part 2: Docker & Database Management](#part-2-docker--database-management)
3. [Part 3: Application Usage](#part-3-application-usage)
4. [Part 4: Advanced Topics](#part-4-advanced-topics)
5. [Part 5: Troubleshooting & FAQ](#part-5-troubleshooting--faq)

---

## Part 1: Setup & Installation

### 1.1 Prerequisites
Before installing Attendify, ensure you have the following:

#### Required Software
| Software | Minimum Version | Purpose |
|----------|-----------------|---------|
| **Docker Desktop** | 4.0+ | Container runtime |
| **Node.js** | 18.0+ | JavaScript runtime |
| **npm** | Included with Node | Package manager |
| **Git** | 2.30+ | Version control |

#### System Requirements
- **Operating System**: Windows 10/11, macOS 11+, or Linux
- **RAM**: 4 GB minimum (8 GB recommended)
- **Disk Space**: At least 5 GB free
- **Network**: Internet connection for initial setup
- **Browser**: Latest Chrome, Firefox, Edge, or Safari

#### Recommended Tools
- [VS Code](https://code.visualstudio.com) - Code editor
- [Postman](https://www.postman.com) - API testing client
- [MySQL Workbench](https://www.mysql.com/products/workbench/) - Alternative database client (optional)

### 1.2 Initial Setup
Follow these steps to set up Attendify on your local machine.

#### Step 1: Install Docker Desktop
1. Download Docker Desktop from the official website.
2. Run the installer and follow the installation wizard.
3. Restart your computer if prompted.
4. Launch Docker Desktop and wait for it to fully start.
5. Verify installation:
   ```bash
   docker --version
   docker compose version
   ```

#### Step 2: Install Node.js
1. Download Node.js LTS from the official website.
2. Run the installer (npm will be installed automatically).
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Step 3: Clone the Repository
```bash
# macOS / Linux
cd ~/projects

# Windows
cd C:\projects

git clone https://github.com/Muhammad-Raisul-Maharab/Attendify.git
cd Attendify
```

#### Step 4: Install Frontend Dependencies
```bash
npm install
```

#### Step 5: Start Docker Services
This starts the backend, MySQL database, and Adminer.
```bash
docker compose up -d
```

#### Step 6: Verify Backend Health
Open [http://localhost:5000/health](http://localhost:5000/health) in your browser or run:
```bash
curl http://localhost:5000/health
```

#### Step 7: Start Frontend Development Server
```bash
npm run dev
```
You should see the local URL, typically `http://localhost:3000`.

#### Step 8: Access the Application
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Adminer**: [http://localhost:8080](http://localhost:8080)

### 1.3 Verifying Installation
Run the following checks to confirm everything is working correctly.

#### Check Docker Containers
```bash
docker ps
```
*You should see containers for backend, MySQL, and Adminer running.*

#### Check Backend Logs
```bash
docker logs attendify_backend
```
*Look for lines indicating the server is running and the database is connected.*

#### Check MySQL Connection
```bash
docker exec -it attendify_mysql mysql -u attendify_user -pattendify_pass -e "SHOW DATABASES;"
```
*Expected databases include `attendify_db`.*

#### Test Login Functionality
1. Open [http://localhost:3000](http://localhost:3000).
2. Log in with demo credentials (if provided by your admin).
3. Confirm you can reach the dashboard.

### 1.4 Team Collaboration Setup
If you're working with a team, each member should follow these steps on their own PC.

#### For Team Members
1. Install Docker Desktop, Node.js, and Git.
2. Clone the repository:
   ```bash
   git clone https://github.com/Muhammad-Raisul-Maharab/Attendify.git
   cd Attendify
   npm install
   docker compose up -d
   npm run dev
   ```

#### Notes for Collaboration
- Each PC has its own local database by default.
- Use Git for code sharing.
- Share migration scripts or SQL files for database changes.
- Use branches to manage features and bug fixes.

---

## Part 2: Docker & Database Management

### 2.1 Docker Commands Reference

#### Starting and Stopping Services
```bash
docker compose up -d        # Start all services
docker compose up           # Start with logs
docker compose down         # Stop all services
docker compose down -v      # Stop and remove volumes (deletes data)
docker compose restart      # Restart all services
docker restart attendify_backend # Restart backend only
```

#### Viewing Logs
```bash
docker compose logs         # Logs from all services
docker compose logs -f      # Follow all logs
docker logs attendify_backend
docker logs attendify_mysql
docker logs attendify_adminer
```

#### Container Management
```bash
docker ps                   # List running containers
docker ps -a                # List all containers
docker stop attendify_backend
docker start attendify_backend
docker rm attendify_backend
docker inspect attendify_mysql
```

#### Volume Management
```bash
docker volume ls
docker volume inspect attendify_mysql_data
docker volume prune         # Remove unused volumes
docker volume rm attendify_mysql_data
```

#### Executing Commands Inside Containers
```bash
docker exec -it attendify_mysql mysql -u root -prootpass123
docker exec -it attendify_backend bash
```
*Example: Create a database backup from inside container:*
```bash
docker exec attendify_mysql mysqldump -u root -prootpass123 attendify_db > backup.sql
```

### 2.2 Accessing Adminer
Adminer is a lightweight database management tool.

#### Access Adminer
1. Open [http://localhost:8080](http://localhost:8080) in your browser.
2. Use the following credentials (or as configured in your environment):
   - **System**: MySQL
   - **Server**: `mysql` (or `attendify_mysql` / `localhost` depending on context)
   - **Username**: `attendify_user`
   - **Password**: `attendify_pass`
   - **Database**: `attendify_db`

#### Adminer Interface Overview
- **Left sidebar**: List of tables.
- **Top menu**: SQL command, Import, Export, etc.
- **Main area**: Data and structure views for the selected table.

#### Key Features
- Browse and edit data.
- Run SQL queries.
- Import/export data.
- View and modify structure (columns, indexes, foreign keys).

### 2.3 Database CRUD Operations

#### Reading Data (SELECT)
**Using Adminer UI**:
1. Click a table (e.g., `users`).
2. Click "Select data".
3. View results and apply filters as needed.

**Using SQL**:
1. Click "SQL command".
2. Enter queries like:
   ```sql
   SELECT * FROM users;
   ```

**Examples**:
```sql
-- Get all students
SELECT * FROM users WHERE role_id = 1;

-- Get users with role names
SELECT u.full_name, u.email, r.name AS role FROM users u
JOIN roles r ON u.role_id = r.id;

-- Get courses taught by a specific teacher
SELECT c.code, c.name AS course_name, u.full_name AS teacher FROM courses c
JOIN users u ON c.teacher_id = u.id
WHERE u.email = 'arit@attendify.app';
```

#### Creating Data (INSERT)
**Using Adminer Form**:
1. Click a table (e.g., `users`).
2. Click "New item".
3. Fill in the fields.
4. Click "Save".

**Using SQL**:
```sql
-- Insert a new student
INSERT INTO users (id, auth_uid, email, full_name, password, role_id, student_id) 
VALUES ('u1234567890', 'auth|234567890', 'john@attendify.app', 'John Doe', '123', 1, 'S2024001');

-- Insert multiple records
INSERT INTO users (id, auth_uid, email, full_name, password, role_id, student_id) 
VALUES 
('u111', 'auth|111', 'alice@attendify.app', 'Alice Smith', '123', 1, 'S2024002'),
('u222', 'auth|222', 'bob@attendify.app', 'Bob Johnson', '123', 1, 'S2024003');

-- Insert a new course
INSERT INTO courses (id, code, name, teacher_id)
VALUES ('c001', 'CSE 101', 'Introduction to Programming', 'u001');
```

#### Updating Data (UPDATE)
**Using Adminer Form**:
1. Select data from a table.
2. Click "edit" on the desired row.
3. Change values.
4. Click "Save".

**Using SQL**:
```sql
-- Update a user's name
UPDATE users
SET full_name = 'Jane Doe Updated'
WHERE id = 'u1234567890';

-- Update multiple fields
UPDATE users
SET full_name = 'Jane Doe', email = 'jane.new@attendify.app' 
WHERE id = 'u1234567890';

-- Update session status
UPDATE sessions
SET status = 'completed', end_time = NOW()
WHERE id = 'session123';
```

#### Deleting Data (DELETE)
**Using Adminer UI**:
1. Select data from a table.
2. Tick the checkbox for rows to delete.
3. Click "Delete" at the bottom.
4. Confirm deletion.

**Using SQL**:
```sql
-- Delete a specific user
DELETE FROM users WHERE id = 'u1234567890';

-- Delete multiple records
DELETE FROM users WHERE role_id = 1 AND last_login IS NULL;

-- Delete old attendance records
DELETE FROM attendance WHERE checked_in_at < '2023-01-01';
```

**Handling Foreign Key Constraints**:
If a delete fails, you may need to delete child records first:
```sql
DELETE FROM attendance WHERE student_id = 'u1234567890';
DELETE FROM attendance_change_history WHERE user_id = 'u1234567890';
DELETE FROM users WHERE id = 'u1234567890';
```

### 2.4 Running SQL Queries

#### Examples
**1. Attendance statistics by student**:
```sql
SELECT
    u.full_name, u.student_id,
    COUNT(DISTINCT a.session_id) AS classes_attended, 
    (SELECT COUNT(*) FROM sessions WHERE status = 'completed') AS total_classes, 
    ROUND(
        COUNT(DISTINCT a.session_id) / (SELECT COUNT(*) FROM sessions WHERE status = 'completed') * 100, 2
    ) AS attendance_percentage 
FROM users u
LEFT JOIN attendance a ON u.id = a.student_id 
WHERE u.role_id = 1
GROUP BY u.id
ORDER BY attendance_percentage DESC;
```

**2. Active sessions today**:
```sql
SELECT
    s.id, c.code, c.name,
    s.start_time, s.end_time,
    COUNT(a.id) AS current_attendance
FROM sessions s
JOIN courses c ON s.course_id = c.id 
LEFT JOIN attendance a ON s.id = a.session_id 
WHERE DATE(s.start_time) = CURDATE()
AND s.status IN ('ongoing', 'scheduled') 
GROUP BY s.id, c.code, c.name, s.start_time, s.end_time
ORDER BY s.start_time ASC;
```

**3. Teacher course load**:
```sql
SELECT
    u.full_name AS teacher_name, 
    COUNT(DISTINCT c.id) AS total_courses, 
    COUNT(DISTINCT s.id) AS routine_classes, 
    COUNT(DISTINCT a.id) AS sessions_held 
FROM users u
LEFT JOIN courses c ON u.id = c.teacher_id 
LEFT JOIN sessions s ON s.course_id = c.id
LEFT JOIN attendance a ON a.session_id = s.id 
WHERE u.role_id = 2
GROUP BY u.id
ORDER BY total_courses DESC;
```

**4. Students below 75% attendance**:
```sql
SELECT
    u.full_name, u.email, u.student_id,
    COUNT(DISTINCT a.session_id) * 100.0 / (SELECT COUNT(*) FROM sessions WHERE status = 'completed') AS percentage
FROM users u
LEFT JOIN attendance a ON u.id = a.student_id 
WHERE u.role_id = 1
GROUP BY u.id
HAVING percentage < 75 
ORDER BY percentage ASC;
```

### 2.5 Database Backup & Restore

#### Creating Backups
```bash
# Full database backup
docker exec -t attendify_mysql mysqldump -u root -prootpass123 attendify_db > backup.sql

# Backup specific table
docker exec -t attendify_mysql mysqldump -u root -prootpass123 attendify_db users > users_backup.sql

# Backup structure only (no data)
docker exec -t attendify_mysql mysqldump -u root -prootpass123 attendify_db --no-data > schema_only.sql
```

#### Restoring Backups
```bash
# Restore full database
cat backup.sql | docker exec -i attendify_mysql mysql -u root -prootpass123 attendify_db

# Restore specific table (optional drop first)
docker exec -i attendify_mysql mysql -u root -prootpass123 attendify_db -e "DROP TABLE IF EXISTS users";
cat users_backup.sql | docker exec -i attendify_mysql mysql -u root -prootpass123 attendify_db
```

#### Automated Backup Script (Linux/Mac example)
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups" 
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker exec -t attendify_mysql mysqldump -u root -prootpass123 attendify_db > "$BACKUP_DIR/attendify_db_$TIMESTAMP.sql"
find "$BACKUP_DIR" -name "attendify_db_*.sql" -mtime +30 -delete
```
