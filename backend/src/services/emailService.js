const db = require('../config/db');

async function sendEmail(toEmail, subject, body) {
    try {
        await db.query(
            'INSERT INTO email_logs (to_email, subject, body) VALUES (?, ?, ?)',
            [toEmail, subject, body]
        );
    } catch (error) {
        console.error('Email log error:', error);
    }
}

module.exports = { sendEmail };
