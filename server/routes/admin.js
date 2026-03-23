const express = require('express');
const router = express.Router();
const lotService = require('../services/lotService');
const inquiryService = require('../services/inquiryService');
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');

// All admin API routes require authentication
router.use(requireAuth);

// ============ Dashboard Stats ============
router.get('/stats', (req, res) => {
  const lotStats = lotService.getStats();
  const inquiryStats = inquiryService.getStats();
  res.json({ lots: lotStats, inquiries: inquiryStats });
});

// ============ Lots CRUD ============
router.get('/lots', (req, res) => {
  const { search, status, zoning, page = 1, limit = 20 } = req.query;
  const result = lotService.getAll({ search, status, zoning, page: parseInt(page), limit: parseInt(limit) });
  res.json(result);
});

router.get('/lots/filters', (req, res) => {
  res.json({
    statuses: lotService.getDistinctStatuses(),
    zonings: lotService.getDistinctZonings(),
  });
});

router.get('/lots/:id', (req, res) => {
  const lot = lotService.getById(req.params.id);
  if (!lot) return res.status(404).json({ error: 'Lot not found' });
  res.json(lot);
});

router.post('/lots', (req, res) => {
  try {
    const lot = lotService.create(req.body);
    res.status(201).json(lot);
  } catch (err) {
    console.error('Error creating lot:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/lots/:id', (req, res) => {
  try {
    const lot = lotService.update(req.params.id, req.body);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });
    res.json(lot);
  } catch (err) {
    console.error('Error updating lot:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/lots/:id', (req, res) => {
  const result = lotService.delete(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Lot not found' });
  res.json({ success: true });
});

// ============ Inquiries ============
router.get('/inquiries', (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const result = inquiryService.getAll({ search, page: parseInt(page), limit: parseInt(limit) });
  res.json(result);
});

router.get('/inquiries/:id', (req, res) => {
  const inquiry = inquiryService.getById(req.params.id);
  if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
  res.json(inquiry);
});

router.delete('/inquiries/:id', (req, res) => {
  const result = inquiryService.delete(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Inquiry not found' });
  res.json({ success: true });
});

// ============ Change Password ============
router.post('/change-password', (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Both old and new passwords are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  const result = authService.changePassword(req.session.admin.id, oldPassword, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json({ success: true });
});

module.exports = router;
