const express = require('express');
const { body } = require('express-validator');
const {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllTasks);

router.get('/:id', getTaskById);

router.post(
    '/',
    [
        body('contact_id').notEmpty().withMessage('Contact ID is required'),
        body('title').notEmpty().withMessage('Title is required'),
        body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
    ],
    validate,
    createTask
);

router.put(
    '/:id',
    [
        body('contact_id').notEmpty().withMessage('Contact ID is required'),
        body('title').notEmpty().withMessage('Title is required'),
        body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
    ],
    validate,
    updateTask
);

router.delete('/:id', deleteTask);

module.exports = router;
