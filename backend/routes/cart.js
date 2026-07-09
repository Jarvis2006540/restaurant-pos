const express = require('express');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.post('/add', cartController.addToCart);
router.get('/', cartController.getCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove/:menu_id', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;
