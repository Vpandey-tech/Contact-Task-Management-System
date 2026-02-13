const db = require('./src/config/db');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const [rows] = await db.query('SELECT 1 as test');
        console.log('✓ Database connected successfully!');
        console.log('Test query result:', rows);

        console.log('\nChecking tables...');
        const [tables] = await db.query('SHOW TABLES');
        console.log('Tables found:', tables);

        process.exit(0);
    } catch (error) {
        console.error('✗ Database connection failed:');
        console.error('Error:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

testConnection();
