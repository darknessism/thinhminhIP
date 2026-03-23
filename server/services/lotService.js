const { getDb } = require('../db/database');

const lotService = {
  getAll({ search, status, zoning, page = 1, limit = 50 } = {}) {
    const db = getDb();
    let where = [];
    let params = {};

    if (search) {
      where.push("(lot_id LIKE @search OR name LIKE @search OR use_type LIKE @search)");
      params.search = `%${search}%`;
    }
    if (status) {
      where.push("status = @status");
      params.status = status;
    }
    if (zoning) {
      where.push("zoning = @zoning");
      params.zoning = zoning;
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (page - 1) * limit;

    const total = db.get(`SELECT COUNT(*) as count FROM lots ${whereClause}`, params).count;
    const lots = db.all(`SELECT * FROM lots ${whereClause} ORDER BY lot_id ASC LIMIT @limit OFFSET @offset`, { ...params, limit, offset });

    return { lots, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getAllPublic() {
    const lots = getDb().all('SELECT * FROM lots ORDER BY lot_id ASC');
    return lots.map(lot => ({
      svgGroupId: lot.svg_group_id,
      lotId: lot.lot_id,
      name: lot.name,
      status: lot.status,
      zoning: lot.zoning,
      zoneSizeRange: lot.zone_size_range,
      area: lot.area,
      coverage: lot.coverage,
      price: lot.price,
      use: lot.use_type,
      height: lot.height,
      rent: typeof lot.price === 'number' && lot.area !== '-'
        ? Math.round(parseFloat(lot.area) * 10000 * lot.price).toLocaleString()
        : '-'
    }));
  },

  getById(id) {
    return getDb().get('SELECT * FROM lots WHERE id = @id', { id });
  },

  create(data) {
    const result = getDb().run(`
      INSERT INTO lots (svg_group_id, lot_id, name, status, zoning, zone_size_range, area, coverage, price, use_type, height)
      VALUES (@svg_group_id, @lot_id, @name, @status, @zoning, @zone_size_range, @area, @coverage, @price, @use_type, @height)
    `, data);
    return this.getById(result.lastInsertRowid);
  },

  update(id, data) {
    getDb().run(`
      UPDATE lots SET
        svg_group_id = @svg_group_id, lot_id = @lot_id, name = @name, status = @status,
        zoning = @zoning, zone_size_range = @zone_size_range, area = @area, coverage = @coverage,
        price = @price, use_type = @use_type, height = @height, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `, { ...data, id });
    return this.getById(id);
  },

  delete(id) {
    return getDb().run('DELETE FROM lots WHERE id = @id', { id });
  },

  getStats() {
    const db = getDb();
    const total = db.get('SELECT COUNT(*) as count FROM lots').count;
    const available = db.get("SELECT COUNT(*) as count FROM lots WHERE status = 'Available'").count;
    const negotiation = db.get("SELECT COUNT(*) as count FROM lots WHERE status = 'Under Negotiation'").count;
    const sold = db.get("SELECT COUNT(*) as count FROM lots WHERE status = 'Sold'").count;
    const totalArea = db.get("SELECT COALESCE(SUM(CAST(area AS REAL)), 0) as total FROM lots WHERE area != '-'").total;
    return { total, available, negotiation, sold, totalArea: totalArea.toFixed(1) };
  },

  getDistinctStatuses() {
    return getDb().all('SELECT DISTINCT status FROM lots ORDER BY status').map(r => r.status);
  },

  getDistinctZonings() {
    return getDb().all('SELECT DISTINCT zoning FROM lots WHERE zoning IS NOT NULL ORDER BY zoning').map(r => r.zoning);
  }
};

module.exports = lotService;
