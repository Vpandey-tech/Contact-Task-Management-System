const db = require('../config/db');

const getAllContacts = async (req, res) => {
    try {
        const [contacts] = await db.query(
            'SELECT * FROM users_contact WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.userId]
        );
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getContactById = async (req, res) => {
    try {
        const [contacts] = await db.query(
            'SELECT * FROM users_contact WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.userId]
        );

        if (contacts.length === 0) {
            return res.status(403).json({ error: 'Contact does not belong to this user' });
        }

        res.status(200).json(contacts[0]);
    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createContact = async (req, res) => {
    try {
        const { contact_number, contact_email, note } = req.body;

        const [result] = await db.query(
            'INSERT INTO users_contact (user_id, contact_number, contact_email, note, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.userId, contact_number, contact_email, note, req.user.userId, req.user.userId]
        );

        res.status(201).json({ message: 'Contact created successfully', contactId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Contact number already exists for this user' });
        }
        console.error('Create contact error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateContact = async (req, res) => {
    try {
        const { contact_number, contact_email, note } = req.body;

        const [contacts] = await db.query(
            'SELECT id FROM users_contact WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.userId]
        );

        if (contacts.length === 0) {
            return res.status(403).json({ error: 'Contact does not belong to this user' });
        }

        await db.query(
            'UPDATE users_contact SET contact_number = ?, contact_email = ?, note = ?, updated_by = ? WHERE id = ?',
            [contact_number, contact_email, note, req.user.userId, req.params.id]
        );

        res.status(200).json({ message: 'Contact updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Contact number already exists for this user' });
        }
        console.error('Update contact error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteContact = async (req, res) => {
    try {
        const [contacts] = await db.query(
            'SELECT id FROM users_contact WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.userId]
        );

        if (contacts.length === 0) {
            return res.status(403).json({ error: 'Contact does not belong to this user' });
        }

        await db.query('DELETE FROM users_contact WHERE id = ?', [req.params.id]);

        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
};
