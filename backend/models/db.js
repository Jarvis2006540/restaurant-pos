const { createClient } = require('@libsql/client');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.TURSO_DATABASE_URL || 'file:' + path.join(__dirname, '..', 'restaurant.db');
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient({
  url: dbPath,
  authToken: authToken,
});

const db = {
  run: function(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    client.execute({ sql, args: params || [] })
      .then(result => {
        if (callback) {
          callback.call({ 
            lastID: Number(result.lastInsertRowid), 
            changes: result.rowsAffected 
          }, null);
        }
      })
      .catch(err => {
        if (callback) callback(err);
      });
    return this;
  },
  get: function(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    client.execute({ sql, args: params || [] })
      .then(result => {
        const row = result.rows.length > 0 ? result.rows[0] : undefined;
        if (callback) callback(null, row);
      })
      .catch(err => {
        if (callback) callback(err);
      });
    return this;
  },
  all: function(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    client.execute({ sql, args: params || [] })
      .then(result => {
        if (callback) callback(null, result.rows);
      })
      .catch(err => {
        if (callback) callback(err);
      });
    return this;
  },
  prepare: function(sql) {
    return {
      run: function(...args) {
        let callback = null;
        if (args.length > 0 && typeof args[args.length - 1] === 'function') {
          callback = args.pop();
        }
        client.execute({ sql, args })
          .then(result => {
            if (callback) callback.call({ 
              lastID: Number(result.lastInsertRowid), 
              changes: result.rowsAffected 
            }, null);
          })
          .catch(err => {
            if (callback) callback(err);
          });
      },
      finalize: function(callback) {
        if (callback) callback(null);
      }
    };
  }
};

console.log('Connected to Turso/SQLite database');
initializeDatabase();

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  // Users table for Authentication
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err);
    else {
      // Seed default admin user (password: admin123)
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (!err && row.count === 0) {
          db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
        }
      });
    }
  });

  // Menu table
  db.run(`
    CREATE TABLE IF NOT EXISTS menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      category TEXT,
      gst_percentage REAL DEFAULT 5.0,
      stock_quantity INTEGER DEFAULT -1,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating menu table:', err);
    else {
      // Migrate existing menu table
      const newMenuCols = [
        "gst_percentage REAL DEFAULT 5.0",
        "stock_quantity INTEGER DEFAULT -1",
        "description TEXT"
      ];
      newMenuCols.forEach(col => {
        db.run(`ALTER TABLE menu ADD COLUMN ${col}`, () => {}); // Ignore duplicate column errors
      });
    }
  });

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
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
    )
  `, (err) => {
    if (err) console.error('Error creating orders table:', err);
    else {
      // Migrate existing table by adding new columns (ignoring errors if they already exist)
      const newColumns = [
        "customer_name TEXT",
        "customer_phone TEXT",
        "table_number TEXT",
        "order_type TEXT DEFAULT 'Dine-in'",
        "subtotal REAL",
        "tax_amount REAL",
        "discount_amount REAL",
        "grand_total REAL",
        "payment_method_display TEXT DEFAULT 'Cash'"
      ];
      newColumns.forEach(col => {
        db.run(`ALTER TABLE orders ADD COLUMN ${col}`, (err) => {
          // Ignore "duplicate column name" errors
        });
      });
    }
  });

  // OrderItems table for detailed reporting
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_id) REFERENCES menu(id)
    )
  `, (err) => {
    if (err) console.error('Error creating order_items table:', err);
    else {
      // Seed default menu items if table is empty
      seedDefaultMenuItems();
    }
  });

  // Settings table for Receipt/Shop settings
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
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
      CHECK (id = 1) -- Ensure only one row exists
    )
  `, (err) => {
    if (err) console.error('Error creating settings table:', err);
    else {
      db.get('SELECT COUNT(*) as count FROM settings', (err, row) => {
        if (!err && row.count === 0) {
          db.run("INSERT INTO settings (id) VALUES (1)");
        }
      });
    }
  });
}

function seedDefaultMenuItems() {
  db.get('SELECT COUNT(*) as count FROM menu', (err, row) => {
    if (err) {
      console.error('Error checking menu count:', err);
      return;
    }

    if (row.count === 0) {
      const defaultItems = [
        { name: 'Idly', price: 30.00, image: '/images/default/idly.jpg', category: 'Breakfast' },
        { name: 'Porotta', price: 25.00, image: '/images/default/porotta.jpg', category: 'Main Course' },
        { name: 'Poori', price: 35.00, image: '/images/default/poori.jpg', category: 'Breakfast' },
        { name: 'Coffee', price: 20.00, image: '/images/default/coffee.jpg', category: 'Beverage' },
        { name: 'Dosa', price: 40.00, image: '/images/default/dosa.jpg', category: 'Breakfast' },
        { name: 'Vada', price: 25.00, image: '/images/default/vada.jpg', category: 'Snacks' },
        { name: 'Chappati', price: 30.00, image: '/images/default/chappati.jpg', category: 'Main Course' }
      ];

      const stmt = db.prepare('INSERT INTO menu (name, price, image, category) VALUES (?, ?, ?, ?)');
      
      defaultItems.forEach(item => {
        stmt.run(item.name, item.price, item.image, item.category, (err) => {
          if (err) console.error('Error inserting menu item:', err);
        });
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error finalizing insert statement:', err);
        } else {
          console.log('Default menu items seeded successfully');
        }
      });
    }
  });
}

module.exports = db;
