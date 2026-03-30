const { getDb } = require('../db/database');

const inquiryService = {
  getAll({ search, page = 1, limit = 20 } = {}) {
    const db = getDb();
    let where = [];
    let params = {};

    if (search) {
      where.push("(full_name LIKE @search OR email LIKE @search OR lot_id LIKE @search OR company LIKE @search)");
      params.search = `%${search}%`;
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (page - 1) * limit;

    const total = db.get(`SELECT COUNT(*) as count FROM inquiries ${whereClause}`, params).count;
    const inquiries = db.all(`SELECT * FROM inquiries ${whereClause} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`, { ...params, limit, offset });

    return { inquiries, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getById(id) {
    return getDb().get('SELECT * FROM inquiries WHERE id = @id', { id });
  },

  create(data) {
    const result = getDb().run(`
      INSERT INTO inquiries (lot_id, lot_name, full_name, company, email, phone, requirements)
      VALUES (@lot_id, @lot_name, @full_name, @company, @email, @phone, @requirements)
    `, data);
    return this.getById(result.lastInsertRowid);
  },

  delete(id) {
    return getDb().run('DELETE FROM inquiries WHERE id = @id', { id });
  },

  getStats() {
    const db = getDb();
    const total = db.get('SELECT COUNT(*) as count FROM inquiries').count;
    const today = db.get("SELECT COUNT(*) as count FROM inquiries WHERE DATE(created_at) = DATE('now')").count;
    const thisWeek = db.get("SELECT COUNT(*) as count FROM inquiries WHERE created_at >= DATE('now', '-7 days')").count;
    return { total, today, thisWeek };
  }
};

module.exports = inquiryService;
