const db = require('../config/db');

const getAddressesByContact = async (req, res) => {
    try {
        const [contacts] = await db.query(
            'SELECT id FROM users_contact WHERE id = ? AND user_id = ?',
            [req.params.contactId, req.user.userId]
        );

        if (contacts.length === 0) {
            return res.status(403).json({ error: 'Contact does not belong to this user' });
        }

        const [addresses] = await db.query(
            'SELECT * FROM contact_address WHERE contact_id = ? ORDER BY created_at DESC',
            [req.params.contactId]
        );

        res.status(200).json(addresses);
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createAddress = async (req, res) => {
    try {
        const { address_line1, address_line2, city, state, pincode, country } = req.body;

        const [contacts] = await db.query(
            'SELECT id FROM users_contact WHERE id = ? AND user_id = ?',
            [req.params.contactId, req.user.userId]
        );

        if (contacts.length === 0) {
            return res.status(403).json({ error: 'Contact does not belong to this user' });
        }

        const [result] = await db.query(
            'INSERT INTO contact_address (contact_id, address_line1, address_line2, city, state, pincode, country, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.params.contactId, address_line1, address_line2, city, state, pincode, country || 'India', req.user.userId, req.user.userId]
        );

        res.status(201).json({ message: 'Address created successfully', addressId: result.insertId });
    } catch (error) {
        console.error('Create address error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateAddress = async (req, res) => {
    try {
        const { address_line1, address_line2, city, state, pincode, country } = req.body;

        const [addresses] = await db.query(
            `SELECT ca.id FROM contact_address ca
       JOIN users_contact uc ON ca.contact_id = uc.id
       WHERE ca.id = ? AND ca.contact_id = ? AND uc.user_id = ?`,
            [req.params.id, req.params.contactId, req.user.userId]
        );

        if (addresses.length === 0) {
            return res.status(403).json({ error: 'Address does not belong to this user' });
        }

        await db.query(
            'UPDATE contact_address SET address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?, country = ?, updated_by = ? WHERE id = ?',
            [address_line1, address_line2, city, state, pincode, country || 'India', req.user.userId, req.params.id]
        );

        res.status(200).json({ message: 'Address updated successfully' });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const [addresses] = await db.query(
            `SELECT ca.id FROM contact_address ca
       JOIN users_contact uc ON ca.contact_id = uc.id
       WHERE ca.id = ? AND ca.contact_id = ? AND uc.user_id = ?`,
            [req.params.id, req.params.contactId, req.user.userId]
        );

        if (addresses.length === 0) {
            return res.status(403).json({ error: 'Address does not belong to this user' });
        }

        await db.query('DELETE FROM contact_address WHERE id = ?', [req.params.id]);

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAddressesByContact,
    createAddress,
    updateAddress,
    deleteAddress
};
