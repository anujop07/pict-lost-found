// server/controllers/adminController.js
const Item = require('../models/Item');
const User = require('../models/User');

const deleteItemByAdmin = async (req, res) => {
  try {
    const itemId = req.params.id;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Remove reference from user's reportedItems and claimedItems
    await User.updateMany(
      {
        $or: [
          { reportedItems: itemId },
          { claimedItems: itemId }
        ]
      },
      {
        $pull: {
          reportedItems: itemId,
          claimedItems: itemId
        }
      }
    );

    await item.deleteOne();

    res.status(200).json({ message: 'Item deleted by admin' });
  } catch (error) {
    console.error('Admin item delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  deleteItemByAdmin
};
