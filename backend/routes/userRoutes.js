const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles('ADMIN'), userController.listUsers);
router.get('/officers', authenticateToken, userController.listOfficers);
router.patch('/:id', authenticateToken, authorizeRoles('ADMIN'), userController.updateUserStatus);

module.exports = router;
