const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Available categories with subcategories for subscription
const AVAILABLE_CATEGORIES = {
  electronics: {
    name: 'Electronics',
    subcategories: ['phone', 'laptop', 'tablet', 'headphones', 'charger', 'smartwatch', 'camera', 'gaming-device', 'other-electronics']
  },
  books: {
    name: 'Books',
    subcategories: ['textbook', 'notebook', 'novel', 'reference-book', 'magazine', 'journal', 'other-books']
  },
  clothing: {
    name: 'Clothing',
    subcategories: ['shirt', 'jacket', 'shoes', 'bag', 'hat', 'scarf', 'gloves', 'uniform', 'other-clothing']
  },
  keys: {
    name: 'Keys',
    subcategories: ['house-keys', 'car-keys', 'room-keys', 'office-keys', 'bike-keys', 'locker-keys', 'other-keys']
  },
  'id-card': {
    name: 'ID Cards',
    subcategories: ['student-id', 'employee-id', 'driving-license', 'passport', 'credit-card', 'library-card', 'other-id']
  },
  wallet: {
    name: 'Wallet & Money',
    subcategories: ['wallet', 'purse', 'cash', 'coins', 'gift-card', 'other-wallet']
  },
  others: {
    name: 'Others',
    subcategories: ['jewelry', 'glasses', 'stationery', 'sports-equipment', 'documents', 'food-items', 'miscellaneous']
  }
};

// Helper function to get all categories as flat array (for backward compatibility)
const getAllCategoriesFlat = () => {
  return Object.keys(AVAILABLE_CATEGORIES);
};

// Get user's current subscriptions
router.get('/my-subscriptions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('subscribedCategories emailNotifications');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Subscriptions retrieved successfully',
      data: {
        subscribedCategories: user.subscribedCategories || [],
        emailNotifications: user.emailNotifications,
        availableCategories: AVAILABLE_CATEGORIES,
        categoriesFlat: getAllCategoriesFlat()
      }
    });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Subscribe to a category
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, subcategory } = req.body;

    // Validate category
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const categoryKey = category.toLowerCase().replace(' ', '-');
    if (!AVAILABLE_CATEGORIES[categoryKey]) {
      return res.status(400).json({ 
        message: 'Invalid category',
        availableCategories: getAllCategoriesFlat()
      });
    }

    // Validate subcategory if provided
    if (subcategory) {
      const validSubcategories = AVAILABLE_CATEGORIES[categoryKey].subcategories;
      if (!validSubcategories.includes(subcategory.toLowerCase())) {
        return res.status(400).json({
          message: 'Invalid subcategory',
          availableSubcategories: validSubcategories
        });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create subscription key (category or category:subcategory)
    const subscriptionKey = subcategory 
      ? `${categoryKey}:${subcategory.toLowerCase()}`
      : categoryKey;

    // Check if already subscribed
    if (user.subscribedCategories.includes(subscriptionKey)) {
      return res.status(400).json({ 
        message: `Already subscribed to ${subscriptionKey}`,
        subscribedCategories: user.subscribedCategories
      });
    }

    // Add subscription
    user.subscribedCategories.push(subscriptionKey);
    await user.save();

    res.status(200).json({
      message: `Successfully subscribed to ${subscriptionKey}`,
      data: {
        subscribedCategories: user.subscribedCategories,
        newSubscription: subscriptionKey
      }
    });

  } catch (error) {
    console.error('Error subscribing to category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unsubscribe from a category
router.post('/unsubscribe', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, subcategory } = req.body;

    // Validate category
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create subscription key (category or category:subcategory)
    const categoryKey = category.toLowerCase().replace(' ', '-');
    const subscriptionKey = subcategory 
      ? `${categoryKey}:${subcategory.toLowerCase()}`
      : categoryKey;

    // Check if subscribed
    if (!user.subscribedCategories.includes(subscriptionKey)) {
      return res.status(400).json({ 
        message: `Not subscribed to ${subscriptionKey}`,
        subscribedCategories: user.subscribedCategories
      });
    }

    // Remove subscription
    user.subscribedCategories = user.subscribedCategories.filter(
      cat => cat !== subscriptionKey
    );
    await user.save();

    res.status(200).json({
      message: `Successfully unsubscribed from ${subscriptionKey}`,
      data: {
        subscribedCategories: user.subscribedCategories,
        removedSubscription: subscriptionKey
      }
    });

  } catch (error) {
    console.error('Error unsubscribing from category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update multiple subscriptions at once
router.put('/bulk-update', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subscribedCategories, emailNotifications } = req.body;

    // Validate subscribedCategories if provided
    if (subscribedCategories !== undefined) {
      if (!Array.isArray(subscribedCategories)) {
        return res.status(400).json({ message: 'subscribedCategories must be an array' });
      }

      // Validate each subscription (can be category or category:subcategory)
      const invalidSubscriptions = subscribedCategories.filter(subscription => {
        const [category, subcategory] = subscription.split(':');
        const categoryKey = category.toLowerCase();
        
        if (!AVAILABLE_CATEGORIES[categoryKey]) {
          return true;
        }
        
        if (subcategory) {
          const validSubcategories = AVAILABLE_CATEGORIES[categoryKey].subcategories;
          return !validSubcategories.includes(subcategory.toLowerCase());
        }
        
        return false;
      });

      if (invalidSubscriptions.length > 0) {
        return res.status(400).json({
          message: 'Invalid subscriptions found',
          invalidSubscriptions,
          availableCategories: AVAILABLE_CATEGORIES
        });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update subscriptions if provided
    if (subscribedCategories !== undefined) {
      user.subscribedCategories = subscribedCategories.map(subscription => subscription.toLowerCase());
    }

    // Update email notifications preference if provided
    if (emailNotifications !== undefined) {
      user.emailNotifications = Boolean(emailNotifications);
    }

    await user.save();

    res.status(200).json({
      message: 'Subscription preferences updated successfully',
      data: {
        subscribedCategories: user.subscribedCategories,
        emailNotifications: user.emailNotifications
      }
    });

  } catch (error) {
    console.error('Error updating subscription preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle email notifications on/off
router.post('/toggle-notifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle the current state
    user.emailNotifications = !user.emailNotifications;
    await user.save();

    res.status(200).json({
      message: `Email notifications ${user.emailNotifications ? 'enabled' : 'disabled'}`,
      data: {
        emailNotifications: user.emailNotifications,
        subscribedCategories: user.subscribedCategories
      }
    });

  } catch (error) {
    console.error('Error toggling notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get subscription statistics (admin/debug route)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // This could be admin-only if needed
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          usersWithNotifications: { 
            $sum: { $cond: [{ $eq: ['$emailNotifications', true] }, 1, 0] } 
          },
          totalSubscriptions: { 
            $sum: { $size: { $ifNull: ['$subscribedCategories', []] } } 
          }
        }
      }
    ]);

    // Category-wise subscription count
    const categoryStats = await User.aggregate([
      { $unwind: { path: '$subscribedCategories', preserveNullAndEmptyArrays: false } },
      { 
        $group: { 
          _id: '$subscribedCategories', 
          subscriberCount: { $sum: 1 } 
        } 
      },
      { $sort: { subscriberCount: -1 } }
    ]);

    const result = stats[0] || { totalUsers: 0, usersWithNotifications: 0, totalSubscriptions: 0 };

    res.status(200).json({
      message: 'Subscription statistics retrieved successfully',
      data: {
        overview: result,
        categoryBreakdown: categoryStats,
        availableCategories: AVAILABLE_CATEGORIES,
        categoriesFlat: getAllCategoriesFlat()
      }
    });

  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
