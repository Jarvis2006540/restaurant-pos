const db = require('./db');
const { promisify } = require('util');

// Promisify database methods
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));

const Menu = {
  getAll: async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM menu ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getById: async (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM menu WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  create: async (name, price, image, category = null, gst_percentage = 5.0, stock_quantity = -1, description = '') => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO menu (name, price, image, category, gst_percentage, stock_quantity, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, price, image, category, gst_percentage, stock_quantity, description],
        function(err) {
          if (err) reject(err);
          else {
            // Get the newly created item
            Menu.getById(this.lastID).then(resolve).catch(reject);
          }
        }
      );
    });
  },

  update: async (id, name, price, image, category = null, gst_percentage = 5.0, stock_quantity = -1, description = '') => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE menu SET name = ?, price = ?, image = ?, category = ?, gst_percentage = ?, stock_quantity = ?, description = ? WHERE id = ?',
        [name, price, image, category, gst_percentage, stock_quantity, description, id],
        (err) => {
          if (err) reject(err);
          else {
            // Get the updated item
            Menu.getById(id).then(resolve).catch(reject);
          }
        }
      );
    });
  },

  delete: async (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM menu WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

module.exports = Menu;
