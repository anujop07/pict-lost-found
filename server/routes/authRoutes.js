const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { registerUser,loginUser } = require('../controllers/authController');

const authenticateUser = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Token validation endpoint
router.get('/validate', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

