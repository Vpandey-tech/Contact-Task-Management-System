# Contact & Task Management System

Full-stack web application for managing contacts and tasks with secure JWT authentication.

## 🎯 Features

- ✅ User registration and authentication with bcrypt password hashing
- ✅ JWT token-based sessions with 15-minute auto-logout
- ✅ Contact management with multiple addresses per contact
- ✅ Task management linked to contacts with status tracking
- ✅ Email simulation via database logging
- ✅ Real-time countdown timer in navbar
- ✅ Clean, responsive UI built **without any UI libraries**
- ✅ Database triggers for auto-populating full_name field

## 🛠 Tech Stack

- **Frontend:** React 18, React Router (No UI libraries - custom CSS only)
- **Backend:** Node.js, Express.js
- **Database:** MySQL 8.x (Aiven Cloud)
- **Authentication:** JWT, bcrypt
- **Validation:** express-validator
- **Logging:** morgan

## 📋 Prerequisites

- Node.js v18 or higher
- MySQL 8.x (or Aiven MySQL account)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Full-stack-assess
```

### 2. Database Setup

#### Option A: Using Aiven (Cloud MySQL)
The project is already configured for Aiven. Just run the setup script.

#### Option B: Using Local MySQL
Create the database:
```bash
mysql -u root -p
CREATE DATABASE assessment_db;
exit
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

**For Aiven:**
```env
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=16299
DB_USER=avnadmin
DB_PASS=your-aiven-password
DB_NAME=defaultdb
JWT_SECRET=your_32_character_minimum_secret_key_here
PORT=5000
```

**For Local MySQL:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=assessment_db
JWT_SECRET=your_32_character_minimum_secret_key_here
PORT=5000
```

**Run database setup:**
```bash
node setup-db.js
```

**Start backend server:**
```bash
npm start
```

Backend will run on `http://localhost:5000`

### 4. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

Frontend will open automatically on `http://localhost:3000`

## 📱 Usage

1. **Register:** Create a new account with email and 10-digit phone number
2. **Login:** Access your account (session expires after 15 minutes)
3. **Dashboard:** View statistics with countdown timer
4. **Manage Contacts Tab:** 
   - Add, edit, delete contacts
   - Manage multiple addresses per contact
5. **Manage Tasks Tab:** 
   - Create tasks linked to contacts
   - Update status via Edit modal
   - Filter tasks by status

## 📂 Project Structure

```
Full-stack-assess/
├── database/
│   └── schema.sql              # Complete database schema with triggers
├── backend/
│   ├── src/
│   │   ├── config/             # Database configuration
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Auth, logging, validation
│   │   ├── routes/             # API endpoints
│   │   └── services/           # Email service
│   ├── server.js               # Express app entry point
│   ├── setup-db.js             # Database setup script
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/              # React page components
│   │   ├── services/           # API service layer
│   │   ├── App.js              # Main app with routing
│   │   └── index.css           # Custom CSS (no UI libraries)
│   └── package.json
├── DOCUMENTATION.md            # Complete technical documentation
├── README.md                   # This file
└── .gitignore
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Contacts (Protected)
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Addresses (Protected)
- `GET /api/contacts/:contactId/addresses` - Get addresses
- `POST /api/contacts/:contactId/addresses` - Create address
- `PUT /api/contacts/:contactId/addresses/:id` - Update address
- `DELETE /api/contacts/:contactId/addresses/:id` - Delete address

### Tasks (Protected)
- `GET /api/tasks?status=pending` - Get tasks (optional filter)
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🔑 Key Features

### Database Triggers
- `full_name` column is **automatically maintained by MySQL triggers**
- Concatenates `first_name` and `last_name` on insert/update
- **Not handled by application code** (as per PRD requirement)

### Security
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after **15 minutes**
- Frontend auto-logout with countdown timer
- Input validation on all endpoints
- Ownership verification on all protected resources

### Email Simulation
- All emails logged to `email_logs` table
- Welcome email on registration
- Notification email on task creation
- No external email service used

### UI/UX
- **No third-party UI libraries** (PRD constraint)
- Custom CSS with modern design
- Smooth animations and transitions
- Responsive design
- 15-minute countdown timer in navbar
- Status updates only via Edit modal

## 🗄️ Database Schema

### Tables
1. **users** - User accounts with auto-generated full_name
2. **users_contact** - Contact information
3. **contact_address** - Multiple addresses per contact
4. **users_task** - Tasks linked to contacts
5. **email_logs** - Email simulation logs

### Viewing Database (Aiven)
1. Login to https://console.aiven.io
2. Select your MySQL service
3. Click "Query Editor"
4. Run queries to view data:
   ```sql
   SHOW TABLES;
   SELECT * FROM users;
   SELECT * FROM email_logs;
   SHOW TRIGGERS;
   ```

## ✅ Testing Checklist

- [ ] Register a new user and verify `full_name` is auto-populated
- [ ] Check `email_logs` table for welcome email
- [ ] Login and verify countdown timer starts at 15:00
- [ ] Create a contact and add addresses
- [ ] Create a task and verify email log entry
- [ ] Test auto-logout after 15 minutes
- [ ] Try duplicate email/phone to verify unique constraints
- [ ] Update task status only via Edit modal
- [ ] Verify all CRUD operations work correctly

## 🎥 Demo Video

[Link to demo video will be added here]

### Demo Script
1. Show database tables in Aiven Query Editor
2. Register new user → Show `full_name` auto-populated in DB
3. Show welcome email in `email_logs` table
4. Login → Show countdown timer
5. Create contact → Add multiple addresses
6. Create task → Show email log entry
7. Filter tasks by status
8. Edit task to change status
9. Show auto-logout when timer reaches 0:00

## 📝 PRD Compliance

✅ Database triggers for `full_name` column  
✅ Input validation on all forms  
✅ Unique constraints enforced at database level  
✅ 15-minute token expiry with auto-logout and countdown timer  
✅ Email logs inserted on registration and task creation  
✅ Clean UI without any third-party UI libraries  
✅ Complete Git repository with documentation  
✅ All CRUD operations implemented  
✅ Ownership verification on all operations  
✅ Status updates only via Edit modal  

## 🤝 Contributing

This project is created for assessment purposes.

## 📄 License

This project is created for assessment purposes.

## 📧 Contact

For questions or issues, please contact the development team.

---

**Built with ❤️ using React, Node.js, Express, and MySQL**
