const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

router.get('/complaints', mapController.getMapComplaints);

module.exports = router;
