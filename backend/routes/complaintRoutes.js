const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create complaint (Citizen, or any authenticated user)
router.post('/', authenticateToken, upload.single('image'), complaintController.createComplaint);

// List complaints (role-isolated)
router.get('/', authenticateToken, complaintController.listComplaints);

// Get single complaint with details & history
router.get('/:id', authenticateToken, complaintController.getComplaintById);

// Update status (Officer or Admin)
router.patch('/:id/status', authenticateToken, authorizeRoles('OFFICER', 'ADMIN'), complaintController.updateStatus);

// Assign complaint (Admin only)
router.patch('/:id/assign', authenticateToken, authorizeRoles('ADMIN'), complaintController.assignComplaint);

module.exports = router;
