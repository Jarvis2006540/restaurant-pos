const db = require('./db');

const Order = {
  create: async (orderNumber, items, totalAmount, paymentMethod = null, metadata = {}) => {
    return new Promise((resolve, reject) => {
      const itemsJson = JSON.stringify(items);
      const {
        customer_name = null,
        customer_phone = null,
        table_number = null,
        order_type = 'Dine-in',
        subtotal = totalAmount,
        tax_amount = 0,
        discount_amount = 0,
        grand_total = totalAmount,
        payment_method_display = 'Cash'
      } = metadata;

      db.run(
        `INSERT INTO orders 
          (order_number, items, total_amount, payment_method, status, customer_name, customer_phone, table_number, order_type, subtotal, tax_amount, discount_amount, grand_total, payment_method_display) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderNumber, itemsJson, totalAmount, paymentMethod, 'paid', customer_name, customer_phone, table_number, order_type, subtotal, tax_amount, discount_amount, grand_total, payment_method_display],
        function(err) {
          if (err) {
            reject(err);
            return;
          }

          const orderId = this.lastID;

          // Insert order items for reporting
          const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, menu_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)');
          
          const orderItems = items.map(item => ({
            menu_id: item.id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal
          }));

          let completed = 0;
          let hasError = false;

          if (orderItems.length === 0) {
            insertOrderItem.finalize((err) => {
              if (err) reject(err);
              else Order.getById(orderId).then(resolve).catch(reject);
            });
            return;
          }

          orderItems.forEach((item) => {
            insertOrderItem.run(orderId, item.menu_id, item.quantity, item.price, item.subtotal, (err) => {
              if (err && !hasError) {
                hasError = true;
                reject(err);
                return;
              }
              
              // Automatically reduce stock for items that have a finite stock limit
              db.run('UPDATE menu SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity > 0', [item.quantity, item.menu_id], (err) => {
                if (err) console.error("Failed to update stock for item", item.menu_id);
                
                completed++;
                if (completed === orderItems.length && !hasError) {
                  insertOrderItem.finalize((err) => {
                    if (err) reject(err);
                    else Order.getById(orderId).then(resolve).catch(reject);
                  });
                }
              });
            });
          });
        }
      );
    });
  },

  getById: async (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else {
          if (row && row.items) {
            try {
              row.items = JSON.parse(row.items);
            } catch (e) {
              // items already parsed or invalid
            }
          }
          resolve(row);
        }
      });
    });
  },

  getByOrderNumber: async (orderNumber) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber], (err, row) => {
        if (err) reject(err);
        else {
          if (row && row.items) {
            try {
              row.items = JSON.parse(row.items);
            } catch (e) {
              // items already parsed or invalid
            }
          }
          resolve(row);
        }
      });
    });
  },

  getAll: async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else {
          // Parse items JSON for each row
          const parsed = (rows || []).map(row => {
            if (row.items) {
              try {
                row.items = JSON.parse(row.items);
              } catch (e) {
                // keep as-is
              }
            }
            return row;
          });
          resolve(parsed);
        }
      });
    });
  },

  getMonthlySales: async (month, year) => {
    return new Promise((resolve, reject) => {
      const monthStr = month.toString().padStart(2, '0');
      const yearStr = year.toString();
      db.all(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as order_count,
          SUM(total_amount) as total_revenue
        FROM orders
        WHERE strftime('%m', created_at) = ? AND strftime('%Y', created_at) = ?
        GROUP BY DATE(created_at)
        ORDER BY date`,
        [monthStr, yearStr],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  getMonthlyItemSales: async (month, year) => {
    return new Promise((resolve, reject) => {
      const monthStr = month.toString().padStart(2, '0');
      const yearStr = year.toString();
      db.all(
        `SELECT 
          m.name,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.subtotal) as total_revenue
        FROM order_items oi
        JOIN orders ord ON oi.order_id = ord.id
        JOIN menu m ON oi.menu_id = m.id
        WHERE strftime('%m', ord.created_at) = ? AND strftime('%Y', ord.created_at) = ?
        GROUP BY m.id, m.name
        ORDER BY total_revenue DESC`,
        [monthStr, yearStr],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  getMonthlySummary: async (month, year) => {
    return new Promise((resolve, reject) => {
      const monthStr = month.toString().padStart(2, '0');
      const yearStr = year.toString();
      db.get(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as total_revenue
        FROM orders
        WHERE strftime('%m', created_at) = ? AND strftime('%Y', created_at) = ?`,
        [monthStr, yearStr],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || { total_orders: 0, total_revenue: 0 });
        }
      );
    });
  }
};

  delete: async (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM order_items WHERE order_id = ?', [id], function(err) {
        if (err) return reject(err);
        db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
          if (err) return reject(err);
          resolve({ changes: this.changes });
        });
      });
    });
  }
};

module.exports = Order;
