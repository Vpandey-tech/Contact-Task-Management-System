const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    console.log('Connecting to Aiven MySQL...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Database:', process.env.DB_NAME);

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

    console.log('✓ Connected successfully!\n');

    try {
        console.log('Creating tables...\n');

        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        full_name VARCHAR(200) NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone CHAR(10) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NOT NULL,
        updated_by INT NOT NULL
      )
    `);
        console.log('✓ Created table: users');

        await connection.query(`
      CREATE TABLE IF NOT EXISTS users_contact (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        contact_email VARCHAR(255) NULL,
        note TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NOT NULL,
        updated_by INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_contact (user_id, contact_number)
      )
    `);
        console.log('✓ Created table: users_contact');

        await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_address (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contact_id INT NOT NULL,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255) NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'India',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NOT NULL,
        updated_by INT NOT NULL,
        FOREIGN KEY (contact_id) REFERENCES users_contact(id) ON DELETE CASCADE
      )
    `);
        console.log('✓ Created table: contact_address');

        await connection.query(`
      CREATE TABLE IF NOT EXISTS users_task (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        contact_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
        due_date DATE NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NOT NULL,
        updated_by INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES users_contact(id) ON DELETE CASCADE
      )
    `);
        console.log('✓ Created table: users_task');

        await connection.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        to_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✓ Created table: email_logs');

        console.log('\nCreating triggers...\n');

        await connection.query('DROP TRIGGER IF EXISTS trg_users_before_insert');
        await connection.query(`
      CREATE TRIGGER trg_users_before_insert 
      BEFORE INSERT ON users 
      FOR EACH ROW 
      SET NEW.full_name = CONCAT(NEW.first_name, ' ', NEW.last_name)
    `);
        console.log('✓ Created trigger: trg_users_before_insert');

        await connection.query('DROP TRIGGER IF EXISTS trg_users_before_update');
        await connection.query(`
      CREATE TRIGGER trg_users_before_update 
      BEFORE UPDATE ON users 
      FOR EACH ROW 
      SET NEW.full_name = CONCAT(NEW.first_name, ' ', NEW.last_name)
    `);
        console.log('✓ Created trigger: trg_users_before_update');

        console.log('\nVerifying tables...\n');
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables in database:', tables.map(t => Object.values(t)[0]));

        console.log('\n✅ Database setup complete!\n');
    } catch (error) {
        console.error('❌ Error during setup:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

setupDatabase().catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
});
