const session = require('express-session');
const { getDb } = require('./database');

class SQLiteSessionStore extends session.Store {
  constructor(options = {}) {
    super(options);
    // Clean expired sessions every 15 minutes
    this._cleanup = setInterval(() => this._clearExpired(), 15 * 60 * 1000);
  }

  _clearExpired() {
    try {
      getDb().run('DELETE FROM sessions WHERE expired < @now', { now: Date.now() });
    } catch (_) { /* db may not be ready yet */ }
  }

  get(sid, callback) {
    try {
      const row = getDb().get('SELECT sess FROM sessions WHERE sid = @sid AND expired > @now', { sid, now: Date.now() });
      if (!row) return callback(null, null);
      callback(null, JSON.parse(row.sess));
    } catch (err) {
      callback(err);
    }
  }

  set(sid, sess, callback) {
    try {
      const maxAge = sess.cookie && sess.cookie.maxAge ? sess.cookie.maxAge : 86400000;
      const expired = Date.now() + maxAge;
      getDb().run('REPLACE INTO sessions (sid, sess, expired) VALUES (@sid, @sess, @expired)', { sid, sess: JSON.stringify(sess), expired });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  destroy(sid, callback) {
    try {
      getDb().run('DELETE FROM sessions WHERE sid = @sid', { sid });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  touch(sid, sess, callback) {
    try {
      const maxAge = sess.cookie && sess.cookie.maxAge ? sess.cookie.maxAge : 86400000;
      const expired = Date.now() + maxAge;
      getDb().run('UPDATE sessions SET expired = @expired WHERE sid = @sid', { expired, sid });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = SQLiteSessionStore;
