const db = require('../config/db');
const { sendEmail } = require('../services/emailService');

const getAllTasks = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
      SELECT ut.*, uc.contact_number 
      FROM users_task ut
      JOIN users_contact uc ON ut.contact_id = uc.id
      WHERE ut.user_id = ?
    `;
        const params = [req.user.userId];

        if (status) {
            query += ' AND ut.status = ?';
            params.push(status);
        }

        query += ' ORDER BY ut.created_at DESC';

        const [tasks] = await db.query(query, params);
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getTaskById = async (req, res) => {
    try {
        const [tasks] = await db.query(
            'SELECT * FROM users_task WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.userId]
        );

        if (tasks.length === 0) {
            return res.status(403).json({ error: 'Task does not belong to this user' });
        }

        res.status(200).json(tasks[0]);
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createTask = async (req, res) => {
    try {
        const { contact_id, title, description, status, due_date } = req.body;

        const [contacts] = await db.query(
            'SELECT id FROM users_contact WHERE id = ? AND user_id = ?',
            [contact_id, req.user.userId]
        );

        if (contacts.length === 0) {
            return res.status(403).json({ error: 'Contact does not belong to this user' });
        }

        const [result] = await db.query(
            'INSERT INTO users_task (user_id, contact_id, title, description, status, due_date, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.userId, contact_id, title, description, status || 'pending', due_date, req.user.userId, req.user.userId]
        );

        const [users] = await db.query('SELECT email FROM users WHERE id = ?', [req.user.userId]);
        if (users.length > 0) {
            await sendEmail(
                users[0].email,
                `New Task Created: ${title}`,
                `A new task titled "${title}" has been assigned to you with status: ${status || 'pending'}.`
            );
        }

        res.status(201).json({ message: 'Task created successfully', taskId: result.insertId });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateTask = async (req, res) => {
    try {
        const { contact_id, title, description, status, due_date } = req.body;

        const [tasks] = await db.query(
            'SELECT id FROM users_task WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.userId]
        );

        if (tasks.length === 0) {
            return res.status(403).json({ error: 'Task does not belong to this user' });
        }

        if (contact_id) {
            const [contacts] = await db.query(
                'SELECT id FROM users_contact WHERE id = ? AND user_id = ?',
                [contact_id, req.user.userId]
            );

            if (contacts.length === 0) {
                return res.status(403).json({ error: 'Contact does not belong to this user' });
            }
        }

        await db.query(
            'UPDATE users_task SET contact_id = ?, title = ?, description = ?, status = ?, due_date = ?, updated_by = ? WHERE id = ?',
            [contact_id, title, description, status, due_date, req.user.userId, req.params.id]
        );

        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteTask = async (req, res) => {
    try {
        const [tasks] = await db.query(
            'SELECT id FROM users_task WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.userId]
        );

        if (tasks.length === 0) {
            return res.status(403).json({ error: 'Task does not belong to this user' });
        }

        await db.query('DELETE FROM users_task WHERE id = ?', [req.params.id]);

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
