const express = require('express');
const { body } = require('express-validator');
const {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
} = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllContacts);

router.get('/:id', getContactById);

router.post(
    '/',
    [
        body('contact_number').notEmpty().withMessage('Contact number is required'),
        body('contact_email').optional().isEmail().withMessage('Valid email format required')
    ],
    validate,
    createContact
);

router.put(
    '/:id',
    [
        body('contact_number').notEmpty().withMessage('Contact number is required'),
        body('contact_email').optional().isEmail().withMessage('Valid email format required')
    ],
    validate,
    updateContact
);

router.delete('/:id', deleteContact);

module.exports = router;
