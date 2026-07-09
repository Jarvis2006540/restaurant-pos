// In-memory cart storage (in production, use Redis or session storage)
let cart = [];

// Helper function to get cart data directly (used by order controller)
const getCartData = () => {
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  return { cart: [...cart], total };
};

// Helper function to clear cart directly (used by order controller)
const clearCartData = () => {
  cart = [];
};

const cartController = {
  addToCart: async (req, res) => {
    try {
      const { menu_id, quantity = 1 } = req.body;

      if (!menu_id) {
        return res.status(400).json({ error: 'Menu ID is required' });
      }

      // Get menu item details
      const Menu = require('../models/menu');
      const menuItem = await Menu.getById(menu_id);

      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      // Check if item already in cart
      const existingItemIndex = cart.findIndex(item => item.id === menuItem.id);

      if (existingItemIndex >= 0) {
        // Update quantity
        cart[existingItemIndex].quantity += parseInt(quantity);
        cart[existingItemIndex].subtotal = cart[existingItemIndex].quantity * cart[existingItemIndex].price;
      } else {
        // Add new item
        const cartItem = {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          image: menuItem.image,
          gst_percentage: menuItem.gst_percentage || 0,
          quantity: parseInt(quantity),
          subtotal: menuItem.price * parseInt(quantity)
        };
        cart.push(cartItem);
      }

      res.json({ cart, message: 'Item added to cart' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getCart: (req, res) => {
    try {
      const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
      res.json({ cart, total });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateCartItem: (req, res) => {
    try {
      const { menu_id, quantity } = req.body;

      if (!menu_id || quantity === undefined) {
        return res.status(400).json({ error: 'Menu ID and quantity are required' });
      }

      const itemIndex = cart.findIndex(item => item.id === menu_id);

      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      if (parseInt(quantity) <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = parseInt(quantity);
        cart[itemIndex].subtotal = cart[itemIndex].quantity * cart[itemIndex].price;
      }

      const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
      res.json({ cart, total });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  removeFromCart: (req, res) => {
    try {
      const { menu_id } = req.params;

      const itemIndex = cart.findIndex(item => item.id === parseInt(menu_id));

      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      cart.splice(itemIndex, 1);
      const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

      res.json({ cart, total, message: 'Item removed from cart' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  clearCart: (req, res) => {
    try {
      cart = [];
      res.json({ cart, total: 0, message: 'Cart cleared successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

// Export helper functions for use by other controllers
cartController.getCartData = getCartData;
cartController.clearCartData = clearCartData;

module.exports = cartController;
