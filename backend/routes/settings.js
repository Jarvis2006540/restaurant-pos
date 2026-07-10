const express = require('express');
const settingController = require('../controllers/settingController');

const router = express.Router();

router.get('/', settingController.getSettings);
router.put('/', settingController.updateSettings);

module.exports = router;
