// Builds a fresh in-browser SQLite database for the SQL injection labs.
async function makeLabDb() {
  const SQL = await initSqlJs({ locateFile: f => '../../vendor/' + f });
  const db = new SQL.Database();
  const rand = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, '0')).join('');
  db.run(`
    CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT);
    CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, description TEXT, price REAL, hidden INTEGER);
    CREATE TABLE secrets (id INTEGER PRIMARY KEY, name TEXT, value TEXT);
  `);
  const u = db.prepare('INSERT INTO users (username, password, role) VALUES (?,?,?)');
  [['admin', rand(), 'admin'], ['jsmith', rand(), 'user'], ['mgarcia', rand(), 'user']].forEach(r => u.run(r));
  u.free();
  const p = db.prepare('INSERT INTO products (name, description, price, hidden) VALUES (?,?,?,?)');
  [
    ['Lockpick Set', '15-piece practice lockpick kit', 29.99, 0],
    ['USB Rubber Duck', 'Keystroke injection tool', 79.99, 0],
    ['WiFi Pineapple', 'Wireless auditing platform', 119.99, 0],
    ['Flipper Zero', 'Multi-tool for pentesters', 169.0, 0],
    ['Proxmark3', 'RFID research tool', 299.0, 0],
    ['LAN Turtle', 'Covert network access', 59.99, 0],
    ['Prototype Implant', 'INTERNAL - not for sale', 9999.0, 1],
  ].forEach(r => p.run(r));
  p.free();
  const s = db.prepare('INSERT INTO secrets (name, value) VALUES (?,?)');
  s.run(['api_key', 'sk_live_' + rand()]);
  s.run(['flag', atob('UkNDe3VuMTBuX3MzbDNjdF80bGxfdGgzX3RoMW5nc30=')]);
  s.free();
  return db;
}
