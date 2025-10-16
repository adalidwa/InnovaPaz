const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Login directo con email/password (para ERP)
router.post('/login', authController.loginDirect);

// Login con Firebase (para sitio de marketing)
router.post('/login-firebase', authController.loginUser);

// Nuevo: Login/Registro con Google
router.post('/google-auth', authController.googleAuth);

// Nuevo: Login con Google específico para ERP
router.post('/google-login-erp', authController.googleLoginERP);

// Registro coordinado (Firebase + PostgreSQL)
router.post('/register', authController.registerUser);

// Verificación de token JWT (endpoint explícito)
router.post('/verify-token', authController.verifyTokenEndpoint);

// Obtener usuario autenticado actual (GET /api/auth/me)
router.get('/me', authController.verifyFirebaseToken, authController.getMe);

// Logout
router.post('/logout', authController.logoutUser);

module.exports = router;
