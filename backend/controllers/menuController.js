const Menu = require('../models/menu');
const path = require('path');
const fs = require('fs');

const menuController = {
  getAllMenu: async (req, res) => {
    try {
      const menu = await Menu.getAll();
      res.json(menu);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getMenuById: async (req, res) => {
    try {
      const menu = await Menu.getById(req.params.id);
      if (!menu) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      res.json(menu);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createMenu: async (req, res) => {
    try {
      const { name, price, category, gst_percentage, stock_quantity, description } = req.body;
      let imagePath = null;

      if (req.file) {
        // Cloudinary returns full URL in path, memory storage returns buffer
        if (req.file.path && req.file.path.startsWith('http')) {
          imagePath = req.file.path; // Cloudinary URL
        } else if (req.file.buffer) {
          // Convert buffer to base64 data URI
          const base64String = req.file.buffer.toString('base64');
          imagePath = `data:${req.file.mimetype};base64,${base64String}`;
        }
      } else if (req.body.image) {
        imagePath = req.body.image;
      }

      if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required' });
      }

      const menu = await Menu.create(
        name, 
        parseFloat(price), 
        imagePath, 
        category || null,
        gst_percentage !== undefined ? parseFloat(gst_percentage) : 5.0,
        stock_quantity !== undefined ? parseInt(stock_quantity, 10) : -1,
        description || ''
      );
      res.status(201).json(menu);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateMenu: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, category, gst_percentage, stock_quantity, description } = req.body;

      const existingMenu = await Menu.getById(id);
      if (!existingMenu) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      let imagePath = existingMenu.image;

      if (req.file) {
        if (req.file.path && req.file.path.startsWith('http')) {
          imagePath = req.file.path; // Cloudinary URL
        } else if (req.file.buffer) {
          const base64String = req.file.buffer.toString('base64');
          imagePath = `data:${req.file.mimetype};base64,${base64String}`;
        }
      } else if (req.body.image !== undefined && req.body.image !== 'null') {
        imagePath = req.body.image;
      }

      const menu = await Menu.update(
        id,
        name || existingMenu.name,
        price ? parseFloat(price) : existingMenu.price,
        imagePath,
        category !== undefined ? category : existingMenu.category,
        gst_percentage !== undefined ? parseFloat(gst_percentage) : existingMenu.gst_percentage,
        stock_quantity !== undefined ? parseInt(stock_quantity, 10) : existingMenu.stock_quantity,
        description !== undefined ? description : existingMenu.description
      );

      res.json(menu);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteMenu: async (req, res) => {
    try {
      const { id } = req.params;
      const menu = await Menu.getById(id);

      if (!menu) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      await Menu.delete(id);
      res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = menuController;
