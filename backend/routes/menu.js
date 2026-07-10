const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const menuController = require('../controllers/menuController');

const router = express.Router();

let upload;

// Check if Cloudinary is configured (or use fallbacks for Render if env is missing)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'ny4yqvae';
const apiKey = process.env.CLOUDINARY_API_KEY || '933718491499319';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'X5vQB8ngIhGdGpCzwMNlWOp7wZw';

const hasCloudinary = cloudName && apiKey && apiSecret;

if (hasCloudinary) {
  try {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    const cloudStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'restaurant-pos-menu',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      },
    });

    upload = multer({
      storage: cloudStorage,
      limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
    });
    
    console.log('Image upload: Using Cloudinary storage');
  } catch (err) {
    console.warn('Cloudinary setup failed, falling back to local storage:', err.message);
    hasCloudinary && setupLocalStorage();
  }
} else {
  setupLocalStorage();
}

function setupLocalStorage() {
  // Use persistent volume path if on Fly.io, otherwise local uploads folder
  const uploadsDir = process.env.STORAGE_PATH || path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({
    storage: localStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
  
  console.log('Image upload: Using local disk storage at ' + uploadsDir);
}

// Middleware to handle multer errors gracefully
const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Image upload failed: ' + err.message });
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
