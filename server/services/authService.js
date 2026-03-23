const { getDb } = require('../db/database');
const bcrypt = require('bcryptjs');

const authService = {
  authenticate(username, password) {
    const admin = getDb().get('SELECT * FROM admins WHERE username = @username', { username });
    if (!admin) return null;
    if (!bcrypt.compareSync(password, admin.password_hash)) return null;
    return { id: admin.id, username: admin.username, display_name: admin.display_name };
  },

  getById(id) {
    return getDb().get('SELECT id, username, display_name, created_at FROM admins WHERE id = @id', { id });
  },

  changePassword(id, oldPassword, newPassword) {
    const admin = getDb().get('SELECT * FROM admins WHERE id = @id', { id });
    if (!admin) return { success: false, message: 'Admin not found' };
    if (!bcrypt.compareSync(oldPassword, admin.password_hash)) {
      return { success: false, message: 'Current password is incorrect' };
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    getDb().run('UPDATE admins SET password_hash = @hash WHERE id = @id', { hash, id });
    return { success: true };
  }
};

module.exports = authService;
