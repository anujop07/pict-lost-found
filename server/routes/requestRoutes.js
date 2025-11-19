const express = require('express');
const router = express.Router();
const { getAllRequests, approveRequest, rejectRequest } = require('../controllers/requestController');
const isAdmin = require('../middleware/isAdmin');
const auth = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(auth, isAdmin);

router.get('/', getAllRequests);
router.post('/:id/approve', approveRequest);
router.post('/:id/reject', rejectRequest);

module.exports = router;
