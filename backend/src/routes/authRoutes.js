const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', controller.login);
router.post('/register', controller.register);
router.get('/me', verifyToken, controller.me);
router.put('/password', verifyToken, controller.cambiarContrasena);

module.exports = router;
