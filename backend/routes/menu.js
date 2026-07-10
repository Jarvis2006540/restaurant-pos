const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const menuController = require('../controllers/menuController');

const router = express.Router();

let upload;

// Check if Cloudinary is configured
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  try {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const cloudStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'restaurant-pos-menu',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
      },
    });

    upload = multer({
      storage: cloudStorage,
      limits: { fileSize: 5 * 1024 * 1024 }
    });
    
    console.log('Image upload: Using Cloudinary storage');
  } catch (err) {
    console.warn('Cloudinary setup failed, falling back to local storage:', err.message);
    hasCloudinary && setupLocalStorage();
  }
}

if (!upload) {
  setupLocalStorage();
}

function setupLocalStorage() {
  const memoryStorage = multer.memoryStorage();

  upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });
  
  console.log('Image upload: Using memory storage for Base64 encoding');
}

// Middleware to handle multer errors gracefully
const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      // If upload fails, continue without image
      console.warn('Image upload error (continuing without image):', err.message);
      req.file = null;
    }
    next();
  });
};

router.get('/', menuController.getAllMenu);
router.get('/:id', menuController.getMenuById);
router.post('/', handleUpload, menuController.createMenu);
router.put('/:id', handleUpload, menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

module.exports = router;
