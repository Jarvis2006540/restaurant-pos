const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post('/create', orderController.createOrder);
router.get('/all', orderController.getAllOrders);
router.get('/number/:orderNumber', orderController.getOrderByNumber);
router.get('/:id', orderController.getOrderById);

router.delete('/:id', orderController.deleteOrder);
module.exports = router;
