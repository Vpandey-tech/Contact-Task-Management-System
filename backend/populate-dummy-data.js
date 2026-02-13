require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function populateDummyData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log('\n✅ Connected to database\n');

    try {
        // Create demo user
        const hashedPassword = await bcrypt.hash('Demo@123', 10);

        console.log('Creating demo user...');
        const [userResult] = await connection.query(
            `INSERT INTO users (first_name, last_name, email, phone, password, created_by, updated_by) 
             VALUES (?, ?, ?, ?, ?, 1, 1)`,
            ['John', 'Doe', 'john.doe@example.com', '9876543210', hashedPassword]
        );
        const userId = userResult.insertId;

        // Update created_by and updated_by to the new user id
        await connection.query(
            'UPDATE users SET created_by = ?, updated_by = ? WHERE id = ?',
            [userId, userId, userId]
        );

        // Insert welcome email
        await connection.query(
            'INSERT INTO email_logs (to_email, subject, body) VALUES (?, ?, ?)',
            ['john.doe@example.com', 'Welcome to Contact & Task Management System!',
                'Hello John Doe, your account has been created successfully.']
        );

        console.log('✓ Demo user created (Email: john.doe@example.com, Password: Demo@123)\n');

        // Create 5 contacts
        const contacts = [
            { number: '9123456789', email: 'alice.smith@company.com', note: 'Project Manager - ABC Corp' },
            { number: '9234567890', email: 'bob.johnson@tech.com', note: 'Senior Developer - Tech Solutions' },
            { number: '9345678901', email: 'carol.williams@startup.io', note: 'CEO - Startup Inc' },
            { number: '9456789012', email: 'david.brown@consulting.com', note: 'Business Consultant' },
            { number: '9567890123', email: 'emma.davis@design.studio', note: 'UI/UX Designer' }
        ];

        console.log('Creating 5 contacts...');
        const contactIds = [];
        for (const contact of contacts) {
            const [result] = await connection.query(
                `INSERT INTO users_contact (user_id, contact_number, contact_email, note, created_by, updated_by) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, contact.number, contact.email, contact.note, userId, userId]
            );
            contactIds.push(result.insertId);
            console.log(`  ✓ ${contact.number} - ${contact.note}`);
        }

        // Create addresses for first 3 contacts
        console.log('\nCreating addresses...');
        const addresses = [
            { contactIdx: 0, line1: '123 Business Park', line2: 'Tower A, Floor 5', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
            { contactIdx: 0, line1: '456 Tech Hub', line2: '', city: 'Mumbai', state: 'Maharashtra', pincode: '400002' },
            { contactIdx: 1, line1: '789 Innovation Center', line2: 'Building B', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
            { contactIdx: 2, line1: '321 Startup Lane', line2: 'Suite 101', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
            { contactIdx: 3, line1: '654 Consulting Plaza', line2: '', city: 'Delhi', state: 'Delhi', pincode: '110001' }
        ];

        for (const addr of addresses) {
            await connection.query(
                `INSERT INTO contact_address (contact_id, address_line1, address_line2, city, state, pincode, country, created_by, updated_by) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [contactIds[addr.contactIdx], addr.line1, addr.line2, addr.city, addr.state, addr.pincode, 'India', userId, userId]
            );
            console.log(`  ✓ ${addr.line1}, ${addr.city}`);
        }

        // Create 5 tasks
        console.log('\nCreating 5 tasks...');
        const tasks = [
            { contactIdx: 0, title: 'Project Kickoff Meeting', desc: 'Discuss project timeline and deliverables', status: 'completed', dueDate: '2026-02-10' },
            { contactIdx: 1, title: 'Code Review Session', desc: 'Review backend API implementation', status: 'in_progress', dueDate: '2026-02-15' },
            { contactIdx: 2, title: 'Investment Pitch Preparation', desc: 'Prepare slides for investor meeting', status: 'pending', dueDate: '2026-02-20' },
            { contactIdx: 3, title: 'Business Strategy Consultation', desc: 'Quarterly business review and planning', status: 'pending', dueDate: '2026-02-25' },
            { contactIdx: 4, title: 'UI/UX Design Review', desc: 'Review new dashboard mockups', status: 'in_progress', dueDate: '2026-02-18' }
        ];

        for (const task of tasks) {
            await connection.query(
                `INSERT INTO users_task (user_id, contact_id, title, description, status, due_date, created_by, updated_by) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, contactIds[task.contactIdx], task.title, task.desc, task.status, task.dueDate, userId, userId]
            );

            // Insert email log for task creation
            await connection.query(
                'INSERT INTO email_logs (to_email, subject, body) VALUES (?, ?, ?)',
                ['john.doe@example.com', `New Task Created: ${task.title}`,
                    `A new task titled "${task.title}" has been assigned to you with status: ${task.status}.`]
            );

            console.log(`  ✓ ${task.title} (${task.status})`);
        }

        console.log('\n✅ Successfully populated database with dummy data!\n');
        console.log('📊 Summary:');
        console.log('  - 1 User (john.doe@example.com / Demo@123)');
        console.log('  - 5 Contacts with realistic details');
        console.log('  - 5 Addresses across different cities');
        console.log('  - 5 Tasks with different statuses');
        console.log('  - 6 Email logs (1 welcome + 5 task notifications)\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

populateDummyData();
