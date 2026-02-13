const express = require('express');
const { body } = require('express-validator');
const {
    getAddressesByContact,
    createAddress,
    updateAddress,
    deleteAddress
} = require('../controllers/addressController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get('/:contactId/addresses', getAddressesByContact);

router.post(
    '/:contactId/addresses',
    [
        body('address_line1').notEmpty().withMessage('Address line 1 is required'),
        body('city').notEmpty().withMessage('City is required'),
        body('state').notEmpty().withMessage('State is required'),
        body('pincode').notEmpty().withMessage('Pincode is required')
    ],
    validate,
    createAddress
);

router.put(
    '/:contactId/addresses/:id',
    [
        body('address_line1').notEmpty().withMessage('Address line 1 is required'),
        body('city').notEmpty().withMessage('City is required'),
        body('state').notEmpty().withMessage('State is required'),
        body('pincode').notEmpty().withMessage('Pincode is required')
    ],
    validate,
    updateAddress
);

router.delete('/:contactId/addresses/:id', deleteAddress);

module.exports = router;
