// Middleware to protect admin routes
function requireAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  // API routes return JSON
  if (req.path.startsWith('/api/admin')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Page routes redirect to login
  return res.redirect('/admin/login');
}

module.exports = { requireAuth };
