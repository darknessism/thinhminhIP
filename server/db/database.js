const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'thinhminh.db');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

// Wrapper to make sql.js feel like better-sqlite3
class Database {
  constructor(sqljsDb) {
    this._db = sqljsDb;
  }

  // Run a statement that doesn't return rows (INSERT, UPDATE, DELETE, CREATE)
  run(sql, params = {}) {
    this._db.run(sql, this._bindParams(params));
    const changes = this._db.getRowsModified();
    // Get last insert rowid
    const result = this._db.exec('SELECT last_insert_rowid() as id');
    const lastInsertRowid = result.length > 0 ? result[0].values[0][0] : 0;
    this._save();
    return { changes, lastInsertRowid };
  }

  // Get a single row
  get(sql, params = {}) {
    const stmt = this._db.prepare(sql);
    stmt.bind(this._bindParams(params));
    if (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      stmt.free();
      return this._rowToObj(cols, vals);
    }
    stmt.free();
    return undefined;
  }

  // Get all rows
  all(sql, params = {}) {
    const stmt = this._db.prepare(sql);
    stmt.bind(this._bindParams(params));
    const rows = [];
    const cols = stmt.getColumnNames();
    while (stmt.step()) {
      rows.push(this._rowToObj(cols, stmt.get()));
    }
    stmt.free();
    return rows;
  }

  exec(sql) {
    this._db.run(sql);
    this._save();
  }

  _rowToObj(cols, vals) {
    const obj = {};
    for (let i = 0; i < cols.length; i++) {
      obj[cols[i]] = vals[i];
    }
    return obj;
  }

  // Convert named params (@name) to positional ($name) for sql.js
  _bindParams(params) {
    if (Array.isArray(params)) return params;
    const bound = {};
    for (const [key, val] of Object.entries(params)) {
      // sql.js uses $key or :key or @key
      const k = key.startsWith('@') || key.startsWith('$') || key.startsWith(':') ? key : `@${key}`;
      bound[k] = val === undefined ? null : val;
    }
    return bound;
  }

  _save() {
    const data = this._db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

// Initialize: returns a promise that resolves to the Database wrapper
async function initDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  let sqljsDb;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    sqljsDb = new SQL.Database(buffer);
  } else {
    sqljsDb = new SQL.Database();
  }

  db = new Database(sqljsDb);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS lots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      svg_group_id TEXT NOT NULL,
      lot_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available',
      zoning TEXT,
      zone_size_range TEXT,
      area TEXT,
      coverage TEXT,
      price REAL,
      use_type TEXT,
      height TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_id TEXT,
      lot_name TEXT,
      full_name TEXT NOT NULL,
      company TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      requirements TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expired INTEGER NOT NULL
    );
  `);

  return db;
}

// Synchronous getter — only call after init resolves
function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

module.exports = { initDb, getDb };
