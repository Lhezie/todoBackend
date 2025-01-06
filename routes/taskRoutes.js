const express = require('express');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Task Routes
router.get('/', authenticate, taskController.getTasks);
router.post('/', authenticate, taskController.createTask);
router.post('/:id/update', authenticate, taskController.updateTask);

module.exports = router;
