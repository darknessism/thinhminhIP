const express = require('express');
const router = express.Router();
const lotService = require('../services/lotService');
const inquiryService = require('../services/inquiryService');

// Public API: GET /api/lots
router.get('/lots', (req, res) => {
  try {
    const lots = lotService.getAllPublic();
    res.json(lots);
  } catch (err) {
    console.error('Error reading lots:', err);
    res.status(500).json({ error: 'Failed to load lots data' });
  }
});

// Public API: POST /api/request-info
router.post('/request-info', (req, res) => {
  const { lotId, lotName, fullName, company, email, phone, requirements } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Full name and email are required' });
  }

  try {
    inquiryService.create({
      lot_id: lotId || null,
      lot_name: lotName || null,
      full_name: fullName,
      company: company || null,
      email,
      phone: phone || null,
      requirements: requirements || null,
    });
    res.json({ success: true, message: 'Inquiry submitted successfully' });
  } catch (err) {
    console.error('Error saving inquiry:', err);
    res.status(500).json({ error: 'Failed to save inquiry' });
  }
});

module.exports = router;
