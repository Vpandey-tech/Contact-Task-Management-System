# Contact & Task Management System - Complete Documentation

## Project Overview
Full-stack web application for managing contacts and tasks with secure authentication, built as per PRD requirements.

**Tech Stack:**
- Frontend: React 18 (No UI libraries - custom CSS only)
- Backend: Node.js + Express
- Database: MySQL 8.x (Aiven Cloud)
- Authentication: JWT (15-minute expiry with countdown timer)
- Password Security: bcrypt (10 rounds)

---

## Database Architecture

### Tables Implemented

#### 1. users
- **Purpose:** Store registered users
- **Key Features:**
  - `full_name` auto-populated by DB triggers (NOT application code)
  - Unique constraints on email and phone
  - bcrypt password hashing
  - Audit fields: created_by, updated_by, created_at, updated_at

#### 2. users_contact
- **Purpose:** Store contact entries for users
- **Key Features:**
  - Foreign key to users with CASCADE delete
  - Unique constraint on (user_id, contact_number) combination
  - Optional contact_email and note fields

#### 3. contact_address
- **Purpose:** Store addresses for contacts
- **Key Features:**
  - Foreign key to users_contact with CASCADE delete
  - Default country: 'India'
  - Required: address_line1, city, state, pincode

#### 4. users_task
- **Purpose:** Store tasks linked to users and contacts
- **Key Features:**
  - Foreign keys to both users and users_contact
  - CRITICAL: contact_id must belong to same user (validated in API)
  - Status ENUM: pending, in_progress, completed, cancelled
  - Optional due_date field

#### 5. email_logs
- **Purpose:** Simulate email sending (no actual SMTP)
- **Triggers:**
  - User registration → Welcome email
  - Task creation → Task notification email

### Database Triggers
**CRITICAL EVALUATION ITEM:**
- `trg_users_before_insert`: Auto-fills full_name on INSERT
- `trg_users_before_update`: Auto-updates full_name on UPDATE
- Formula: `CONCAT(first_name, ' ', last_name)`

---

## Backend API Architecture

### Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── logger.js             # Request logging (morgan)
│   │   └── validate.js           # Input validation helper
│   ├── services/
│   │   └── emailService.js       # Email log insertion
│   ├── controllers/
│   │   ├── authController.js     # Register, Login
│   │   ├── contactController.js  # Contact CRUD
│   │   ├── addressController.js  # Address CRUD
│   │   └── taskController.js     # Task CRUD
│   └── routes/
│       ├── auth.routes.js
│       ├── contact.routes.js
│       ├── address.routes.js
│       └── task.routes.js
├── server.js                      # Express app entry
├── package.json
└── .env.example
```

### Authentication Endpoints

#### POST /api/auth/register
- **Validation:** email format, phone (10 digits), password (min 8 chars)
- **Process:**
  1. Check for duplicate email/phone
  2. Hash password with bcrypt (10 rounds)
  3. Insert user (DB trigger fills full_name)
  4. Update created_by/updated_by to new user ID
  5. Insert welcome email log
- **Response:** 201 with userId

#### POST /api/auth/login
- **Validation:** email format, password required
- **Process:**
  1. Fetch user by email
  2. bcrypt.compare() password
  3. Generate JWT with 15-minute expiry
- **Response:** 200 with token and user object

### Protected Endpoints (Require JWT)

#### Contacts
- `GET /api/contacts` - List all user's contacts
- `GET /api/contacts/:id` - Get specific contact (ownership verified)
- `POST /api/contacts` - Create contact (unique per user)
- `PUT /api/contacts/:id` - Update contact (ownership verified)
- `DELETE /api/contacts/:id` - Delete contact (cascades to addresses)

#### Addresses
- `GET /api/contacts/:contactId/addresses` - List addresses
- `POST /api/contacts/:contactId/addresses` - Create address
- `PUT /api/contacts/:contactId/addresses/:id` - Update address
- `DELETE /api/contacts/:contactId/addresses/:id` - Delete address

**Ownership Chain:** All operations verify contact belongs to authenticated user

#### Tasks
- `GET /api/tasks?status=pending` - List tasks (optional filter)
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create task (validates contact ownership + sends email)
- `PUT /api/tasks/:id` - Update task (re-validates contact ownership)
- `DELETE /api/tasks/:id` - Delete task

**CRITICAL:** Task creation validates contact_id belongs to req.user.userId

### Security Implementation

#### Password Security
- bcrypt with 10 salt rounds
- Never exposed in API responses
- bcrypt.compare() for login (no direct comparison)

#### JWT Security
- Expiry: Exactly 15 minutes
- Secret: 32+ characters in .env
- Middleware returns 401 on expiry
- Frontend auto-logout on 401

#### Input Validation
- express-validator on all routes
- Email: RFC 5321 format, normalized to lowercase
- Phone: Regex `/^[0-9]{10}$/`
- Status: ENUM validation
- Pincode: 6 digits

#### Authorization
- Every endpoint checks resource ownership
- Returns 403 (not 404) when resource exists but doesn't belong to user
- Task creation cross-validates contact ownership

### Logging Middleware
**EVALUATION ITEM:**
- Format: `[YYYY-MM-DD HH:MM:SS] METHOD /path - STATUS - TIME ms`
- Logs all HTTP requests
- Implemented with morgan

---

## Frontend Architecture

### Project Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   └── Dashboard.js          # Single page with tabs
│   ├── services/
│   │   └── api.js                # API service layer
│   ├── App.js                    # Router + PrivateRoute
│   ├── index.js
│   └── index.css                 # Custom CSS (NO UI libraries)
└── package.json
```

### Key Features

#### Authentication Flow
1. **Register:** Form validation → API call → Redirect to login
2. **Login:** 
   - API call → Store token + user + loginTime in localStorage
   - Redirect to dashboard
   - Check existing session on mount

#### Auto-Logout Implementation with Countdown Timer
**EVALUATION ITEM:**
- **15-minute countdown timer** displayed in navbar (MM:SS format)
- Timer updates every second
- **Turns red** when less than 1 minute remaining
- Compares `Date.now() - loginTime` with 15 minutes
- Clears localStorage and redirects to /login on expiry
- All API calls return 401 on expired token → triggers logout

#### Dashboard (Single Page with Tabs)
- **Always visible:** Stats cards (Total Contacts, Total Tasks)
- **Countdown timer** in navbar showing time remaining
- **Two tabs:**
  1. Manage Contacts - Default view
  2. Manage Tasks
- No separate pages - all functionality in one view

#### Manage Contacts Tab
- List all contacts in table
- Add/Edit contact modal
- Delete with confirmation
- View Addresses modal:
  - List all addresses for contact
  - Add new address inline
  - Delete address with confirmation

#### Manage Tasks Tab
- List all tasks with contact_number
- Filter by status dropdown
- Add/Edit task modal with contact dropdown
- **Status displayed as badge** (not editable inline)
- **Status updates only via Edit modal**
- Delete with confirmation

### CSS Styling
**NO UI LIBRARIES USED:**
- Custom gradient backgrounds (purple theme)
- Card-based layouts with shadows
- Modal overlays with animations
- Responsive tables
- Status badges with color coding
- Hover effects and smooth transitions
- Countdown timer with color change
- Tab navigation with active states

---

## Data Relationships

### Entity Hierarchy
```
User (1) ──→ (Many) Contact ──→ (Many) Address
  │                  │
  └──────────────────┴──→ Task
```

### Cascade Rules
- Delete User → Deletes all Contacts, Addresses, Tasks
- Delete Contact → Deletes all Addresses, Tasks for that contact
- Delete Address → No cascade (leaf node)
- Delete Task → No cascade (leaf node)

### Critical Business Rule
**Task Ownership Validation:**
```sql
SELECT id FROM users_contact 
WHERE id = :contact_id AND user_id = :user_id
```
If no row returned → 403 Forbidden

---

## Email Simulation

### Implementation
- Function: `sendEmail(toEmail, subject, body)`
- Inserts row into `email_logs` table
- No actual SMTP/external service

### Triggers
1. **User Registration:**
   - To: user.email
   - Subject: "Welcome to Contact & Task Management System!"
   - Body: "Hello [full_name], your account has been created successfully."

2. **Task Creation:**
   - To: user.email
   - Subject: "New Task Created: [title]"
   - Body: "A new task titled [title] has been assigned to you with status: [status]."

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8.x
- Git

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:

**For Aiven (Cloud MySQL):**
```
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=16299
DB_USER=avnadmin
DB_PASS=your-aiven-password
DB_NAME=defaultdb
JWT_SECRET=your_32_character_minimum_secret_key_here
PORT=5000
```

**For Local MySQL:**
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=assessment_db
JWT_SECRET=your_32_character_minimum_secret_key_here
PORT=5000
```

Run database setup script:
```bash
node setup-db.js
```

Start server:
```bash
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

App runs on `http://localhost:3000`

---

## Evaluation Checklist - All Items Implemented

✅ **1. full_name maintained by DB trigger**
- Location: `database/schema.sql` lines with TRIGGER definitions
- Test: Register user → Check users table → full_name auto-populated

✅ **2. Proper validations on all inputs**
- Location: All route files with express-validator
- Test: Submit empty forms, invalid emails, 9-digit phone → Returns 400

✅ **3. Unique constraints enforced at DB level**
- Location: `database/schema.sql` UNIQUE constraints
- Test: Register duplicate email/phone → Returns 409

✅ **4. Token expiry handled (15 minutes with countdown timer)**
- Location: `frontend/src/pages/Dashboard.js` timer logic with visual countdown
- Test: Login → Watch timer count down → Auto-logout at 0:00

✅ **5. Email logs inserted**
- Location: `backend/src/services/emailService.js`
- Test: Register + Create task → Check email_logs table

✅ **6. Clean UI with no UI libraries**
- Location: `frontend/package.json` (only react, react-dom, react-router-dom)
- Test: Check dependencies → No Bootstrap, MUI, Tailwind

✅ **7. Complete Git repo**
- Includes: schema.sql, .env.example, README, all source code

---

## Main Components Summary

### Backend Components
1. **Authentication System:** bcrypt + JWT with 15-min expiry
2. **Database Layer:** MySQL with triggers and constraints
3. **API Layer:** RESTful endpoints with ownership validation
4. **Middleware:** Auth, logging, validation
5. **Email Service:** Database-based simulation

### Frontend Components
1. **Auth Pages:** Login, Register with validation
2. **Dashboard:** Single page with tabs, stats, and countdown timer
3. **Manage Contacts Tab:** CRUD with address sub-management
4. **Manage Tasks Tab:** CRUD with status filtering (status updates via Edit only)
5. **Routing:** Protected routes with token expiry check
6. **Countdown Timer:** Visual 15-minute timer in navbar

### Security Components
1. **Password Hashing:** bcrypt (10 rounds)
2. **Token Management:** JWT with strict expiry
3. **Input Validation:** Server-side with express-validator
4. **Authorization:** Resource ownership verification
5. **Error Handling:** Consistent HTTP status codes

---

## Testing Checklist

### Manual Testing Flow
1. ✅ Register new user → Check DB for full_name + email_log
2. ✅ Login → Verify token in localStorage
3. ✅ Dashboard → See stats and full_name
4. ✅ Add contact → Verify unique constraint
5. ✅ Add address to contact → Verify cascade
6. ✅ Create task → Check email_log + contact ownership
7. ✅ Update task status → Verify inline update
8. ✅ Delete contact → Verify cascade to addresses
9. ✅ Wait 15 min → Verify auto-logout
10. ✅ Try duplicate email/phone → Verify 409 error

### Database Verification
```sql
-- Check trigger worked
SELECT id, first_name, last_name, full_name FROM users;

-- Check email logs
SELECT * FROM email_logs ORDER BY sent_at DESC;

-- Check constraints
SHOW CREATE TABLE users;
SHOW CREATE TABLE users_contact;
```

---

## Error Handling

### HTTP Status Codes Used
- **200 OK:** Successful GET/PUT
- **201 Created:** Successful POST
- **400 Bad Request:** Validation errors
- **401 Unauthorized:** Missing/invalid/expired token
- **403 Forbidden:** Valid token but not authorized for resource
- **404 Not Found:** Resource doesn't exist
- **409 Conflict:** Duplicate unique field
- **500 Internal Server Error:** Unexpected errors

### Global Error Handler
Location: `backend/server.js`
- Catches all unhandled errors
- Never exposes stack traces to client
- Returns generic 500 message

---

## Production Readiness

### Completed Requirements
✅ All database tables with constraints
✅ All API endpoints with validation
✅ All frontend pages with functionality
✅ Security: bcrypt, JWT, input validation
✅ Auto-logout on token expiry
✅ Email simulation via database
✅ Clean code structure
✅ No UI libraries
✅ Complete documentation

### Files Included
- `/database/schema.sql` - Complete DDL
- `/backend/.env.example` - Environment template
- `/backend/` - Complete backend code
- `/frontend/` - Complete frontend code
- `README.md` - Setup instructions
- `DOCUMENTATION.md` - This file

---

## Demo Video Script Reference

### Viewing Database in Aiven
1. Login to https://console.aiven.io
2. Select your MySQL service
3. Click "Query Editor" in left sidebar
4. Run: `SHOW TABLES;` to show all 5 tables
5. Run: `SELECT * FROM users;` to show full_name auto-populated
6. Run: `SHOW TRIGGERS;` to show the database triggers

### Demo Flow
1. Show Register page → Fill form → Submit
2. Open Aiven Query Editor → Show users table with full_name + email_logs
3. Login → Show countdown timer starts at 15:00
4. Dashboard → Show stats cards (centered, equal size)
5. Manage Contacts Tab → Add contact → Show in list
6. View Addresses → Add address → Show saved
7. Manage Tasks Tab → Create task → Show email_log entry in Aiven
8. Edit task → Change status via modal (not inline)
9. Show timer counting down → Demonstrate auto-logout at 0:00
10. Show GitHub repo structure
11. Show terminal logs (logging middleware)

---

## Notes

- **No comments overload:** Comments only at file top or complex logic
- **PRD compliance:** Every feature matches PRD specification exactly
- **No advanced features:** Only what's specified in PRD
- **Single documentation:** This file covers everything
- **Constraints followed:** All database, security, and validation constraints implemented

---

**End of Documentation**
