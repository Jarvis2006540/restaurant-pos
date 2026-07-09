const Order = require('../models/order');
const cartController = require('./cartController');

function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

const orderController = {
  createOrder: async (req, res) => {
    try {
      // Get current cart
      const cartData = cartController.getCartData();
      const cart = cartData.cart || [];
      const total = cartData.total || 0;

      if (cart.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      const orderNumber = generateOrderNumber();
      const paymentMethod = req.body.payment_method || 'custom';
      
      const metadata = {
        customer_name: req.body.customer_name || '',
        customer_phone: req.body.customer_phone || '',
        table_number: req.body.table_number || '',
        order_type: req.body.order_type || 'Dine-in',
        subtotal: req.body.subtotal || total,
        tax_amount: req.body.tax_amount || 0,
        discount_amount: req.body.discount_amount || 0
      };

      const order = await Order.create(orderNumber, cart, total, paymentMethod, metadata);

      // Clear cart after order creation
      cartController.clearCartData();

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await Order.getById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.getAll();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = orderController;
