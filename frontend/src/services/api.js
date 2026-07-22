/**
 * API Service — Direct Turso Database Access
 * 
 * This module replaces the old axios-based backend API calls with direct
 * Turso database queries from the browser. The export interface is identical
 * so all components work without changes.
 * 
 * Every method returns { data: result } to match the old axios response format.
 */

import { db, initDatabase } from './db';
import { uploadImage } from './imageUpload';

// Start DB initialization immediately on import
const dbReady = initDatabase();

// Helper: ensure DB is ready before any operation
async function ready() {
  await dbReady;
}

// BACKEND_URL is kept for backward compatibility with image URL construction.
// Cloudinary images are full URLs (start with http), so this is only used
// for very old local-path images which won't resolve without a backend.
export const BACKEND_URL = '';

// ============================================================
// Auth API
// ============================================================
export const authAPI = {
  login: async (credentials) => {
    await ready();
    const { username, password } = credentials;

    if (!username || !password) {
      throw { response: { data: { error: 'Username and password are required' } } };
    }

    // Check credentials
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ? AND password = ?',
      args: [username, password],
    });

    let user = result.rows[0];

    if (!user) {
      // Fallback: if no users exist, create default admin
      const countResult = await db.execute('SELECT COUNT(*) as count FROM users');
      if (Number(countResult.rows[0].count) === 0 && username === 'admin' && password === 'admin123') {
        await db.execute({
          sql: "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
          args: ['admin', 'admin123', 'admin'],
        });
        user = { id: 1, username: 'admin', role: 'admin' };
      } else {
        throw { response: { data: { error: 'Invalid credentials' } } };
      }
    }

    // Generate simple token (same approach as backend)
    const token = btoa(`${user.id}:${user.username}:${Date.now()}`);

    return {
      data: {
        token,
        user: { id: Number(user.id), username: user.username, role: user.role },
      },
    };
  },
};

// ============================================================
// Menu API
// ============================================================
export const menuAPI = {
  getAll: async () => {
    await ready();
    const result = await db.execute('SELECT * FROM menu ORDER BY created_at DESC');
    return { data: result.rows };
  },

  getById: async (id) => {
    await ready();
    const result = await db.execute({ sql: 'SELECT * FROM menu WHERE id = ?', args: [id] });
    return { data: result.rows[0] };
  },

  create: async (formData) => {
    await ready();

    // Extract fields from FormData
    const name = formData.get('name');
    const price = parseFloat(formData.get('price'));
    const category = formData.get('category') || null;
    const gst_percentage = formData.get('gst_percentage') !== null ? parseFloat(formData.get('gst_percentage')) : 5.0;
    const stock_quantity = formData.get('stock_quantity') !== null ? parseInt(formData.get('stock_quantity'), 10) : -1;
    const description = formData.get('description') || '';

    // Handle image upload
    let imagePath = null;
    const imageFile = formData.get('image');
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      imagePath = await uploadImage(imageFile);
    }

    if (!name || isNaN(price)) {
      throw new Error('Name and price are required');
    }

    const result = await db.execute({
      sql: 'INSERT INTO menu (name, price, image, category, gst_percentage, stock_quantity, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [name, price, imagePath, category, gst_percentage, stock_quantity, description],
    });

    // Return the newly created item
    const newId = Number(result.lastInsertRowid);
    const newItem = await db.execute({ sql: 'SELECT * FROM menu WHERE id = ?', args: [newId] });
    return { data: newItem.rows[0] };
  },

  update: async (id, formData) => {
    await ready();

    // Get existing item
    const existing = await db.execute({ sql: 'SELECT * FROM menu WHERE id = ?', args: [id] });
    if (!existing.rows[0]) {
      throw new Error('Menu item not found');
    }
    const existingItem = existing.rows[0];

    // Extract fields from FormData
    const name = formData.get('name') || existingItem.name;
    const price = formData.get('price') ? parseFloat(formData.get('price')) : existingItem.price;
    const category = formData.has('category') ? (formData.get('category') || null) : existingItem.category;
    const gst_percentage = formData.get('gst_percentage') !== null ? parseFloat(formData.get('gst_percentage')) : existingItem.gst_percentage;
    const stock_quantity = formData.get('stock_quantity') !== null ? parseInt(formData.get('stock_quantity'), 10) : existingItem.stock_quantity;
    const description = formData.has('description') ? (formData.get('description') || '') : existingItem.description;

    // Handle image
    let imagePath = existingItem.image;
    const imageFile = formData.get('image');
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      imagePath = await uploadImage(imageFile);
    }

    await db.execute({
      sql: 'UPDATE menu SET name = ?, price = ?, image = ?, category = ?, gst_percentage = ?, stock_quantity = ?, description = ? WHERE id = ?',
      args: [name, price, imagePath, category, gst_percentage, stock_quantity, description, id],
    });

    // Return updated item
    const updated = await db.execute({ sql: 'SELECT * FROM menu WHERE id = ?', args: [id] });
    return { data: updated.rows[0] };
  },

  delete: async (id) => {
    await ready();
    // Delete associated order items first, then the menu item
    await db.batch([
      { sql: 'DELETE FROM order_items WHERE menu_id = ?', args: [id] },
      { sql: 'DELETE FROM menu WHERE id = ?', args: [id] },
    ], 'write');
    return { data: { message: 'Menu item deleted successfully' } };
  },
};

// ============================================================
// Cart API (kept as stubs for backward compatibility)
// Cart is managed client-side in POSView.jsx — these are no-ops.
// ============================================================
export const cartAPI = {
  add: async () => ({ data: { cart: [], message: 'Cart is client-side' } }),
  get: async () => ({ data: { cart: [], total: 0 } }),
  update: async () => ({ data: { cart: [], total: 0 } }),
  remove: async () => ({ data: { cart: [], total: 0 } }),
  clear: async () => ({ data: { cart: [], total: 0 } }),
};

// ============================================================
// Orders API
// ============================================================

function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

export const ordersAPI = {
  create: async (orderData) => {
    await ready();
    const {
      items = [],
      payment_method = 'cash',
      payment_method_display = 'Cash',
      customer_name = '',
      customer_phone = '',
      table_number = '',
      order_type = 'Dine-in',
      subtotal,
      tax_amount = 0,
      discount_amount = 0,
      grand_total,
    } = orderData;

    if (!items || items.length === 0) {
      throw { response: { data: { error: 'Cart is empty' } } };
    }

    const orderNumber = generateOrderNumber();
    const totalAmount = items.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0);

    // Insert the order
    const orderResult = await db.execute({
      sql: `INSERT INTO orders 
        (order_number, items, total_amount, payment_method, status, customer_name, customer_phone, table_number, order_type, subtotal, tax_amount, discount_amount, grand_total, payment_method_display)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        orderNumber, JSON.stringify(items), totalAmount, payment_method, 'paid',
        customer_name, customer_phone, table_number, order_type,
        subtotal || totalAmount, tax_amount, discount_amount, grand_total || totalAmount,
        payment_method_display,
      ],
    });

    const orderId = Number(orderResult.lastInsertRowid);

    // Insert order items and update stock in a batch
    const batchStmts = [];
    for (const item of items) {
      batchStmts.push({
        sql: 'INSERT INTO order_items (order_id, menu_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
        args: [orderId, item.id, item.quantity, item.price, item.subtotal || item.price * item.quantity],
      });
      batchStmts.push({
        sql: 'UPDATE menu SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity > 0',
        args: [item.quantity, item.id],
      });
    }

    if (batchStmts.length > 0) {
      await db.batch(batchStmts, 'write');
    }

    // Fetch and return the created order
    const orderRow = await db.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [orderId] });
    const order = { ...orderRow.rows[0] };
    if (order.items && typeof order.items === 'string') {
      try { order.items = JSON.parse(order.items); } catch { /* keep as-is */ }
    }

    return { data: order };
  },

  getById: async (id) => {
    await ready();
    const result = await db.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [id] });
    const order = result.rows[0] ? { ...result.rows[0] } : null;
    if (order && order.items && typeof order.items === 'string') {
      try { order.items = JSON.parse(order.items); } catch { /* keep as-is */ }
    }
    return { data: order };
  },

  getByNumber: async (orderNumber) => {
    await ready();
    const result = await db.execute({ sql: 'SELECT * FROM orders WHERE order_number = ?', args: [orderNumber] });
    const order = result.rows[0] ? { ...result.rows[0] } : null;
    if (order && order.items && typeof order.items === 'string') {
      try { order.items = JSON.parse(order.items); } catch { /* keep as-is */ }
    }
    return { data: order };
  },

  getAll: async () => {
    await ready();
    const result = await db.execute('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = result.rows.map(row => {
      const order = { ...row };
      if (order.items && typeof order.items === 'string') {
        try { order.items = JSON.parse(order.items); } catch { /* keep as-is */ }
      }
      return order;
    });
    return { data: orders };
  },

  delete: async (id) => {
    await ready();
    await db.batch([
      { sql: 'DELETE FROM order_items WHERE order_id = ?', args: [id] },
      { sql: 'DELETE FROM orders WHERE id = ?', args: [id] },
    ], 'write');
    return { data: { message: 'Order deleted successfully' } };
  },
};

// ============================================================
// Reports API
// ============================================================
export const reportsAPI = {
  getMonthly: async (month, year) => {
    await ready();
    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString();

    // Run all 3 report queries in parallel for maximum speed
    const [summaryResult, dailyResult, itemResult] = await Promise.all([
      db.execute({
        sql: `SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue
              FROM orders WHERE strftime('%m', created_at) = ? AND strftime('%Y', created_at) = ?`,
        args: [monthStr, yearStr],
      }),
      db.execute({
        sql: `SELECT DATE(created_at) as date, COUNT(*) as order_count, SUM(total_amount) as total_revenue
              FROM orders WHERE strftime('%m', created_at) = ? AND strftime('%Y', created_at) = ?
              GROUP BY DATE(created_at) ORDER BY date`,
        args: [monthStr, yearStr],
      }),
      db.execute({
        sql: `SELECT m.name, SUM(oi.quantity) as total_quantity, SUM(oi.subtotal) as total_revenue
              FROM order_items oi
              JOIN orders ord ON oi.order_id = ord.id
              JOIN menu m ON oi.menu_id = m.id
              WHERE strftime('%m', ord.created_at) = ? AND strftime('%Y', ord.created_at) = ?
              GROUP BY m.id, m.name ORDER BY total_revenue DESC`,
        args: [monthStr, yearStr],
      }),
    ]);

    const summary = summaryResult.rows[0] || { total_orders: 0, total_revenue: 0 };

    return {
      data: {
        month,
        year,
        summary: {
          total_orders: Number(summary.total_orders) || 0,
          total_revenue: Number(summary.total_revenue) || 0,
        },
        daily_sales: dailyResult.rows || [],
        item_sales: itemResult.rows || [],
      },
    };
  },
};

// ============================================================
// Settings API
// ============================================================
export const settingsAPI = {
  get: async () => {
    await ready();
    const result = await db.execute('SELECT * FROM settings WHERE id = 1');
    return { data: result.rows[0] || null };
  },

  update: async (settingsData) => {
    await ready();
    const { shop_name, address, phone, gstin, upi_id, payee_name, thank_you_note, visit_again_note } = settingsData;

    await db.execute({
      sql: `UPDATE settings SET
        shop_name = COALESCE(?, shop_name),
        address = COALESCE(?, address),
        phone = COALESCE(?, phone),
        gstin = COALESCE(?, gstin),
        upi_id = COALESCE(?, upi_id),
        payee_name = COALESCE(?, payee_name),
        thank_you_note = COALESCE(?, thank_you_note),
        visit_again_note = COALESCE(?, visit_again_note),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1`,
      args: [shop_name, address, phone, gstin, upi_id, payee_name, thank_you_note, visit_again_note],
    });

    // Return updated settings
    const result = await db.execute('SELECT * FROM settings WHERE id = 1');
    return { data: result.rows[0] };
  },
};

// Default export (for backward compatibility if anything imports default)
export default { execute: db.execute.bind(db) };
