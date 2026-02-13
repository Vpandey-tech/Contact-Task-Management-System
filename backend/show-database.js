require('dotenv').config();
const mysql = require('mysql2/promise');

async function showDatabase() {
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

    console.log('\n✅ Connected to Aiven MySQL Database\n');

    // Show all tables
    console.log('📋 TABLES IN DATABASE:');
    console.log('='.repeat(50));
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
    });

    // Show triggers
    console.log('\n🔧 DATABASE TRIGGERS:');
    console.log('='.repeat(50));
    const [triggers] = await connection.query('SHOW TRIGGERS');
    triggers.forEach(trigger => {
        console.log(`  - ${trigger.Trigger} (${trigger.Event} on ${trigger.Table})`);
    });

    // Show users table structure
    console.log('\n👥 USERS TABLE STRUCTURE:');
    console.log('='.repeat(50));
    const [usersCols] = await connection.query('DESCRIBE users');
    usersCols.forEach(col => {
        console.log(`  ${col.Field.padEnd(20)} ${col.Type.padEnd(20)} ${col.Key}`);
    });

    // Show sample users
    console.log('\n👥 SAMPLE USERS DATA:');
    console.log('='.repeat(50));
    const [users] = await connection.query('SELECT id, first_name, last_name, full_name, email FROM users LIMIT 5');
    console.table(users);

    // Show contacts
    console.log('\n📞 SAMPLE CONTACTS:');
    console.log('='.repeat(50));
    const [contacts] = await connection.query('SELECT * FROM users_contact LIMIT 5');
    console.table(contacts);

    // Show tasks
    console.log('\n✅ SAMPLE TASKS:');
    console.log('='.repeat(50));
    const [tasks] = await connection.query('SELECT * FROM users_task LIMIT 5');
    console.table(tasks);

    // Show email logs
    console.log('\n📧 EMAIL LOGS:');
    console.log('='.repeat(50));
    const [emails] = await connection.query('SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 5');
    console.table(emails);

    await connection.end();
    console.log('\n✅ Database inspection complete!\n');
}

showDatabase().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
