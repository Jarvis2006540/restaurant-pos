const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const menuController = require('../controllers/menuController');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurant-pos-menu',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/', menuController.getAllMenu);
router.get('/:id', menuController.getMenuById);
router.post('/', upload.single('image'), menuController.createMenu);
router.put('/:id', upload.single('image'), menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

module.exports = router;
