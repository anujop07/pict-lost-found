const express = require('express');
const router = express.Router();
const { reportLostItem } = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');
const { claimItem } = require('../controllers/itemController');
const { getAllReportedItems } = require('../controllers/itemController');
const { getUnclaimedItemsFromOthers } = require('../controllers/itemController');
const { getMyReportedItems, getMyClaimedItems, getMyPendingRequests } = require('../controllers/itemController');
const upload = require('../middleware/uploadMiddleware');

// Get unclaimed items from other users (main dashboard view)
router.get('/lost', authMiddleware, getUnclaimedItemsFromOthers);

// Claim an item
router.post('/claim/:id', authMiddleware, claimItem);

// Get all reported items (admin view)
router.get('/all', authMiddleware, getAllReportedItems);

// Report a new lost item
router.post('/report', authMiddleware, upload.single('image'), reportLostItem);

// Get user's own reported items
router.get('/my-reports', authMiddleware, getMyReportedItems);

// Get user's claimed items (approved claims)
router.get('/my-claims', authMiddleware, getMyClaimedItems);

// Get user's pending requests
router.get('/my-pending-requests', authMiddleware, getMyPendingRequests);

module.exports = router;
