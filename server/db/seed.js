/**
 * Seed script - import lots-data.json into SQLite and create default admin
 * Run: npm run seed
 */
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { initDb } = require('./database');

async function seed() {
  const db = await initDb();

  // Seed lots from JSON
  const lotsJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'lots-data.json'), 'utf-8')
  );

  let lotCount = 0;
  for (const lot of lotsJson) {
    const existing = db.get('SELECT id FROM lots WHERE lot_id = @lot_id', { lot_id: lot.lotId });
    if (existing) continue;
    db.run(`
      INSERT INTO lots (svg_group_id, lot_id, name, status, zoning, zone_size_range, area, coverage, price, use_type, height)
      VALUES (@svg_group_id, @lot_id, @name, @status, @zoning, @zone_size_range, @area, @coverage, @price, @use_type, @height)
    `, {
      svg_group_id: lot.svgGroupId,
      lot_id: lot.lotId,
      name: lot.name,
      status: lot.status,
      zoning: lot.zoning || null,
      zone_size_range: lot.zoneSizeRange || null,
      area: lot.area || null,
      coverage: lot.coverage || null,
      price: lot.price || null,
      use_type: lot.use || null,
      height: lot.height || null,
    });
    lotCount++;
  }
  console.log(`Seeded ${lotCount} lots into database.`);

  // Seed inquiries from local file if exists
  const inquiriesPath = path.join(__dirname, '..', 'inquiries.json');
  if (fs.existsSync(inquiriesPath)) {
    const inquiriesJson = JSON.parse(fs.readFileSync(inquiriesPath, 'utf-8'));
    let inqCount = 0;
    for (const item of inquiriesJson) {
      db.run(`
        INSERT INTO inquiries (lot_id, lot_name, full_name, company, email, phone, requirements, created_at)
        VALUES (@lot_id, @lot_name, @full_name, @company, @email, @phone, @requirements, @created_at)
      `, {
        lot_id: item.lotId || null,
        lot_name: item.lotName || null,
        full_name: item.fullName,
        company: item.company || null,
        email: item.email,
        phone: item.phone || null,
        requirements: item.requirements || null,
        created_at: item.timestamp || new Date().toISOString(),
      });
      inqCount++;
    }
    console.log(`Seeded ${inqCount} inquiries into database.`);
  }

  // Create default admin account
  const existingAdmin = db.get('SELECT id FROM admins WHERE username = @username', { username: 'admin' });
  if (!existingAdmin) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.run('INSERT INTO admins (username, password_hash, display_name) VALUES (@username, @password_hash, @display_name)', {
      username: 'admin',
      password_hash: hash,
      display_name: 'Administrator',
    });
    console.log('Created default admin: username="admin", password="admin123"');
  } else {
    console.log('Default admin already exists.');
  }

  console.log('Seed completed!');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
