const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Login directo con email/password (para ERP)
router.post('/login', authController.loginDirect); // <-- Cambiado aquí

// Login con Firebase (para sitio de marketing)
router.post('/login-firebase', authController.loginUser); // <-- Si lo necesitas para marketing

// Registro coordinado (Firebase + PostgreSQL)
router.post('/register', authController.registerUser);

// Verificación de token JWT (endpoint explícito)
router.post('/verify-token', authController.verifyTokenEndpoint);

// Logout
router.post('/logout', authController.logoutUser);

module.exports = router;
