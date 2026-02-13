const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
    '/register',
    [
        body('first_name').notEmpty().withMessage('First name is required'),
        body('last_name').notEmpty().withMessage('Last name is required'),
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('phone').matches(/^[0-9]{10}$/).withMessage('Phone must be exactly 10 digits'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    ],
    validate,
    register
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validate,
    login
);

module.exports = router;
