const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const SQLiteSessionStore = require('./db/sessionStore');
const { initDb } = require('./db/database');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  store: new SQLiteSessionStore(),
  secret: process.env.SESSION_SECRET || 'thinhminh-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
  }
}));

// Serve static files from public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============ Public API Routes ============
app.use('/api', require('./routes/api'));

// ============ Auth Routes ============
app.use('/auth', require('./routes/auth'));

// ============ Admin API Routes ============
app.use('/api/admin', require('./routes/admin'));

// ============ Admin Page Routes ============
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect('/admin');
  }
  res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});

app.get('/admin/lots', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-lots.html'));
});

app.get('/admin/inquiries', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-inquiries.html'));
});

// ============ Initialize DB then start server ============
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`- Frontend: http://localhost:${PORT}/index.html`);
    console.log(`- Layout:   http://localhost:${PORT}/layout.html`);
    console.log(`- Admin:    http://localhost:${PORT}/admin`);
    console.log(`- API Lots: http://localhost:${PORT}/api/lots`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
