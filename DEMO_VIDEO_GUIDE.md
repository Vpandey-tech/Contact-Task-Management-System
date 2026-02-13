# Demo Video Recording Guide

## 🎬 Complete Demo Video Script (8-10 minutes)

### **Before Recording:**

1. **Populate Dummy Data:**
   ```bash
   cd backend
   node populate-dummy-data.js
   ```
   This creates:
   - 1 Demo User (john.doe@example.com / Demo@123)
   - 5 Contacts with realistic details
   - 5 Addresses
   - 5 Tasks (completed, in_progress, pending)
   - 6 Email logs

2. **Start Backend Server:**
   ```bash
   cd backend
   npm start
   ```

3. **Start Frontend (in new terminal):**
   ```bash
   cd frontend
   npm start
   ```

4. **Recording Tools:**
   - **Windows:** OBS Studio (free) or Xbox Game Bar (Win+G)
   - **Screen Recording:** 1080p, 30fps
   - **Audio:** Clear microphone narration

---

## 📝 Video Script (Follow This Exactly)

### **PART 1: Introduction (30 seconds)**

**[Screen: Show project folder in VS Code]**

**Narration:**
> "Hello! This is my Contact & Task Management System - a full-stack web application built with React, Node.js, Express, and MySQL. The system features JWT authentication, database triggers, and follows all PRD requirements without using any UI libraries."

---

### **PART 2: Database Structure (2 minutes)**

**[Screen: Open Aiven Console → Query Editor]**

**Steps:**
1. Navigate to https://console.aiven.io
2. Click on MySQL service
3. Click "Query Editor"

**Run these queries one by one:**

```sql
-- Show all tables
SHOW TABLES;
```

**Narration:**
> "Let me show you the database structure. We have 5 tables as per requirements: users, users_contact, contact_address, users_task, and email_logs."

```sql
-- Show triggers (IMPORTANT!)
SHOW TRIGGERS;
```

**Narration:**
> "Here are the database triggers - this is a critical PRD requirement. The full_name column is automatically maintained by MySQL triggers, not application code."

```sql
-- Show users table
SELECT id, first_name, last_name, full_name, email, phone_number FROM users;
```

**Narration:**
> "Notice how the full_name is automatically populated by the trigger - it's the concatenation of first_name and last_name."

```sql
-- Show email logs
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 6;
```

**Narration:**
> "Email simulation is done via database logs. We have welcome emails and task notification emails."

---

### **PART 3: User Registration (1 minute)**

**[Screen: Frontend at http://localhost:3000]**

**Steps:**
1. Click "Register"
2. Fill form:
   - First Name: Sarah
   - Last Name: Wilson
   - Email: sarah.wilson@demo.com
   - Phone: 9988776655
   - Password: Test@123
3. Click "Register"

**Narration:**
> "Let me register a new user. The password is hashed with bcrypt, and upon registration, a welcome email is logged to the database."

**[Screen: Switch to Aiven Query Editor]**

```sql
-- Show new user with full_name auto-populated
SELECT id, first_name, last_name, full_name, email FROM users WHERE email = 'sarah.wilson@demo.com';

-- Show welcome email
SELECT * FROM email_logs WHERE to_email = 'sarah.wilson@demo.com';
```

**Narration:**
> "As you can see, the full_name was automatically populated by the database trigger, and the welcome email was logged."

---

### **PART 4: Login & Countdown Timer (1 minute)**

**[Screen: Frontend - Login page]**

**Steps:**
1. Login with: john.doe@example.com / Demo@123
2. Point to countdown timer in navbar

**Narration:**
> "Now logging in with our demo account. Notice the 15-minute countdown timer in the top right - this is a PRD requirement. When it reaches zero, the user is automatically logged out."

---

### **PART 5: Dashboard & Stats (30 seconds)**

**[Screen: Dashboard with stats]**

**Narration:**
> "The dashboard shows our statistics - 5 contacts and 5 tasks. Notice we have two tabs: Manage Contacts and Manage Tasks. Everything is in one page for better user experience."

---

### **PART 6: Contacts Management (2 minutes)**

**[Screen: Manage Contacts tab]**

**Steps:**
1. Show existing contacts in table
2. Click "Addresses" button on first contact
3. Show addresses modal with multiple addresses
4. Add a new address:
   - Address Line 1: 999 Demo Street
   - City: Chennai
   - State: Tamil Nadu
   - Pincode: 600001
5. Click "Add Address"
6. Close modal

**Narration:**
> "Here are our contacts. Each contact can have multiple addresses. Let me add a new address to demonstrate the functionality. The address is immediately saved and displayed."

**Steps:**
7. Click "+ Add Contact"
8. Fill form:
   - Contact Number: 9111222333
   - Email: new.contact@example.com
   - Note: New business partner
9. Click "Create"

**Narration:**
> "Adding a new contact is simple. All fields are validated on both frontend and backend."

---

### **PART 7: Tasks Management (2 minutes)**

**[Screen: Manage Tasks tab]**

**Steps:**
1. Show existing tasks with different statuses
2. Use status filter dropdown - select "In Progress"
3. Show filtered results
4. Reset filter to "All Status"

**Narration:**
> "The tasks tab shows all tasks linked to contacts. We can filter by status. Notice the status is displayed as a badge - it's not editable inline."

**Steps:**
5. Click "+ Add Task"
6. Fill form:
   - Contact: Select "Alice Smith - 9123456789"
   - Title: Follow-up Meeting
   - Description: Discuss project progress
   - Status: Pending
   - Due Date: [Select future date]
7. Click "Create"

**Narration:**
> "Creating a new task. Tasks must be linked to a contact, and the system validates that the contact belongs to the logged-in user."

**[Screen: Switch to Aiven Query Editor]**

```sql
-- Show new email log for task creation
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 1;
```

**Narration:**
> "A notification email was automatically logged when the task was created."

**[Screen: Back to Frontend]**

**Steps:**
8. Click "Edit" on a task
9. Change status to "Completed"
10. Click "Update"

**Narration:**
> "Status can only be updated through the Edit modal, not inline. This ensures proper validation and user confirmation."

---

### **PART 8: Security Features (1 minute)**

**[Screen: Browser DevTools → Application → Local Storage]**

**Narration:**
> "Let me show the security features. The JWT token is stored in localStorage with the login timestamp."

**[Screen: Show countdown timer]**

**Narration:**
> "The timer is counting down. When it reaches zero, the user will be automatically logged out and redirected to the login page."

**Optional (if time):** Wait for timer to reach 0:00 and show auto-logout

---

### **PART 9: Code Structure (1 minute)**

**[Screen: VS Code - Project structure]**

**Show:**
1. `database/schema.sql` - triggers
2. `backend/` folder structure
3. `frontend/package.json` - NO UI libraries
4. `frontend/src/index.css` - custom CSS

**Narration:**
> "The project follows clean architecture. The database schema includes triggers, the backend has proper separation of concerns, and the frontend uses only React with custom CSS - no UI libraries as per PRD requirements."

---

### **PART 10: Conclusion (30 seconds)**

**[Screen: README.md or GitHub repo]**

**Narration:**
> "This project demonstrates all PRD requirements: database triggers for full_name, 15-minute JWT expiry with countdown timer, email simulation, input validation, and a clean UI without third-party libraries. The complete code is available on GitHub with comprehensive documentation. Thank you for watching!"

---

## 🎥 Recording Tips:

1. **Clear Audio:** Speak clearly and at moderate pace
2. **Smooth Navigation:** Practice transitions between screens
3. **Highlight Important Parts:** Use mouse to point at key features
4. **No Mistakes:** If you make a mistake, pause, then re-record that section
5. **Professional:** Close unnecessary tabs/apps before recording
6. **Time Management:** Aim for 8-10 minutes total

## 📤 After Recording:

1. **Edit Video:** Remove any mistakes or long pauses
2. **Add Title Slide:** "Contact & Task Management System - Full Stack Assessment"
3. **Export:** 1080p MP4 format
4. **Upload:** YouTube (unlisted) or Google Drive
5. **Add Link:** Update README.md with video link

---

**Good luck with your demo! 🚀**
