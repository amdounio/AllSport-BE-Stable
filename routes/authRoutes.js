// routes/authRoutes.js
const express = require('express');
const { login, ssoLogin } = require('../controllers/authController');
const router = express.Router();

// POST /api/auth/login - traditional login
router.post('/login', login);

// POST /api/auth/login/sso - SSO login (Google, iCloud)
//router.post('/login/sso', ssoLogin);

module.exports = router;
