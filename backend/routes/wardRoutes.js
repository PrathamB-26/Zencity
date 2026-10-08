const express = require('express');
const router = express.Router();
const wardController = require('../controllers/wardController');

router.get('/', wardController.listWards);

module.exports = router;
