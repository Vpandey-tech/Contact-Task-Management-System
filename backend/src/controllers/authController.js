const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendEmail } = require('../services/emailService');

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password } = req.body;

        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ? OR phone = ?',
            [email, phone]
        );

        if (existingUsers.length > 0) {
            const existing = existingUsers[0];
            const [checkEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (checkEmail.length > 0) {
                return res.status(409).json({ error: 'Email already exists' });
            }
            return res.status(409).json({ error: 'Phone already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, phone, password, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email.toLowerCase(), phone, hashedPassword, 0, 0]
        );

        const userId = result.insertId;

        await db.query(
            'UPDATE users SET created_by = ?, updated_by = ? WHERE id = ?',
            [userId, userId, userId]
        );

        await sendEmail(
            email,
            'Welcome to Contact & Task Management System!',
            `Hello ${first_name} ${last_name}, your account has been created successfully.`
        );

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query(
            'SELECT id, email, full_name, password FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { register, login };
