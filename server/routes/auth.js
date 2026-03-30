const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// POST /auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const admin = authService.authenticate(username, password);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  req.session.admin = admin;
  res.json({ success: true, admin: { username: admin.username, display_name: admin.display_name } });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// GET /auth/me
router.get('/me', (req, res) => {
  if (req.session && req.session.admin) {
    return res.json({ admin: req.session.admin });
  }
  res.status(401).json({ error: 'Not authenticated' });
});

module.exports = router;
