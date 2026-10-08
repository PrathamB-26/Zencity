const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', categoryController.listCategories);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), categoryController.createCategory);

module.exports = router;
