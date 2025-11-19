// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const { deleteItemByAdmin } = require('../controllers/adminController');

router.delete('/items/:id', auth, isAdmin, deleteItemByAdmin);

module.exports = router;
