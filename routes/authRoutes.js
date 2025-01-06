const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();



// Auth Routes
router.get('/signin', (req, res) => res.render('auth/login', { message: req.flash('error') }));
router.post('/signin', authController.signin);
router.post('/signup', authController.signup);
router.get('/logout', authController.logout);

module.exports = router;
