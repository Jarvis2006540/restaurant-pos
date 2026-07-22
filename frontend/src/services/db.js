import { createClient } from '@libsql/client/web';

const client = createClient({
  url: import.meta.env.VITE_TURSO_DATABASE_URL,
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN,
});

let _initialized = false;
let _initPromise = null;

/**
 * Initialize the database schema — creates tables if they don't exist
 * and seeds default data. Safe to call multiple times (idempotent).
 */
export function initDatabase() {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    if (_initialized) return;

    try {
      // Enable foreign keys
      await client.execute('PRAGMA foreign_keys = ON');

      // Create all tables in a single write transaction
      await client.batch([
        // Users table
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        // Menu table
        `CREATE TABLE IF NOT EXISTS menu (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          image TEXT,
          category TEXT,
          gst_percentage REAL DEFAULT 5.0,
          stock_quantity INTEGER DEFAULT -1,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        // Orders table
        `CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number TEXT UNIQUE NOT NULL,
          items TEXT NOT NULL,
          total_amount REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_method TEXT,
          customer_name TEXT,
          customer_phone TEXT,
          table_number TEXT,
          order_type TEXT DEFAULT 'Dine-in',
          subtotal REAL,
          tax_amount REAL,
          discount_amount REAL,
          grand_total REAL,
          payment_method_display TEXT DEFAULT 'Cash',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        // Order items table
        `CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          menu_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          subtotal REAL NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (menu_id) REFERENCES menu(id)
        )`,
        // Settings table
        `CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          shop_name TEXT DEFAULT 'THE GRAND RESTAURANT',
          address TEXT DEFAULT '123 Food Street, City, 10001',
          phone TEXT DEFAULT '+91 98765 43210',
          gstin TEXT DEFAULT '33AABCU9603R1ZM',
          upi_id TEXT DEFAULT 'merchant@upi',
          payee_name TEXT DEFAULT 'Restaurant',
          thank_you_note TEXT DEFAULT 'Thank you for your visit!',
          visit_again_note TEXT DEFAULT 'Please visit again',
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          CHECK (id = 1)
        )`,
      ], 'write');

      // Seed default admin user if none exists
      const userCount = await client.execute('SELECT COUNT(*) as count FROM users');
      if (Number(userCount.rows[0].count) === 0) {
        await client.execute({
          sql: "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
          args: ['admin', 'admin123', 'admin'],
        });
      }

      // Seed default settings row if none exists
      const settingsCount = await client.execute('SELECT COUNT(*) as count FROM settings');
      if (Number(settingsCount.rows[0].count) === 0) {
        await client.execute("INSERT INTO settings (id) VALUES (1)");
      }

      // Seed default menu items if menu table is empty
      const menuCount = await client.execute('SELECT COUNT(*) as count FROM menu');
      if (Number(menuCount.rows[0].count) === 0) {
        await client.batch([
          { sql: "INSERT INTO menu (name, price, category, gst_percentage) VALUES (?, ?, ?, ?)", args: ['Idly', 30.00, 'Breakfast', 5.0] },
          { sql: "INSERT INTO menu (name, price, category, gst_percentage) VALUES (?, ?, ?, ?)", args: ['Porotta', 25.00, 'Main Course', 5.0] },
          { sql: "INSERT INTO menu (name, price, category, gst_percentage) VALUES (?, ?, ?, ?)", args: ['Poori', 35.00, 'Breakfast', 5.0] },
          { sql: "INSERT INTO menu (name, price, category, gst_percentage) VALUES (?, ?, ?, ?)", args: ['Coffee', 20.00, 'Beverage', 5.0] },
          { sql: "INSERT INTO menu (name, price, category, gst_percentage) VALUES (?, ?, ?, ?)", args: ['Dosa', 40.00, 'Breakfast', 5.0] },
          { sql: "INSERT INTO menu (name, price, category, gst_percentage) VALUES (?, ?, ?, ?)", args: ['Vada', 25.00, 'Snacks', 5.0] },
          { sql: "INSERT INTO menu (name, price, category, gst_percentage) VALUES (?, ?, ?, ?)", args: ['Chappati', 30.00, 'Main Course', 5.0] }
        ], 'write');
      }

      _initialized = true;
      console.log('Database initialized successfully');
    } catch (err) {
      console.error('Database initialization error:', err);
      // Reset so it can be retried
      _initPromise = null;
      throw err;
    }
  })();

  return _initPromise;
}

export { client as db };
