// controllers/itemController.js
const Item = require('../models/Item');
const User = require('../models/User');
const Request = require('../models/Request');
const upload = require('../middleware/uploadMiddleware');
const { sendBulkNewItemNotifications } = require('../utils/mailer');

const reportLostItem = async (req, res) => {
  try {
    const { title, description, location, dateFound, dateLost, category, subcategory } = req.body;

    if (!title || !location || !category) {
      return res.status(400).json({ message: 'Title, location, and category are required' });
    }

    // Support both dateFound (new) and dateLost (legacy) fields
    const itemDate = dateFound || dateLost;
    if (!itemDate) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newItem = new Item({
      title,
      description,
      location,
      dateFound: itemDate,
      dateLost: itemDate, // Keep for backward compatibility
      imageUrl,
      category,
      subcategory: subcategory || null, // Include subcategory if provided
      reportedBy: req.user.userId
    });

    await newItem.save();

    // Add item to user's reportedItems array
    await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { reportedItems: newItem._id } }
    );

    // Create a pending admin request for this report
    await Request.create({
      type: 'report',
      status: 'pending',
      item: newItem._id,
      user: req.user.userId
    });

    console.log(`✅ Item reported successfully: ${title} - Pending admin approval before email notifications`);

    res.status(201).json({ message: 'Found item reported successfully - pending admin approval', item: newItem });

  } catch (error) {
    console.error('Error reporting item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const claimItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.userId;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.claimedBy) {
      return res.status(400).json({ message: 'Item already claimed' });
    }

    // Create a pending admin request for this claim
    const request = await Request.create({
      type: 'claim',
      status: 'pending',
      item: item._id,
      user: userId
    });

    res.status(200).json({ message: 'Claim request submitted successfully', request });
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllReportedItems = async (req, res) => {
  try {
    const items = await Item.find({})
      .populate('reportedBy', 'name email')
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ items });

  } catch (error) {
    console.error('Error fetching reported items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUnclaimedItemsFromOthers = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Only show items that are approved by admin and not claimed by anyone
    const items = await Item.find({
      claimedBy: null,               // Not claimed by anyone
      reportedBy: { $ne: userId },   // Not reported by current user
      status: { $in: ['approved', 'lost'] }  // Only approved/lost items, exclude claimed items
    })
    .populate('reportedBy', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({ items });

  } catch (error) {
    console.error('Error fetching unclaimed items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLostItems = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Only show approved items that are not claimed and not reported by current user
    const lostItems = await Item.find({
      claimedBy: null,
      reportedBy: { $ne: userId },
      status: { $in: ['approved', 'lost'] }  // Only approved/lost items, exclude claimed items
    }).populate('reportedBy', 'name'); // optional: to show who reported it

    res.status(200).json({ items: lostItems });
  } catch (error) {
    console.error('Error fetching lost items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const getMyReportedItems = async (req, res) => {
  try {
    const userId = req.user.userId;

    const items = await Item.find({ reportedBy: userId })
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ items });
  } catch (error) {
    console.error('Error fetching reported items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyClaimedItems = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get items claimed by the current user where admin has approved the claim
    const items = await Item.find({ 
      claimedBy: userId,
      status: 'claimed' // Only show items where claim was approved by admin
    })
      .populate('reportedBy', 'name email')
      .sort({ claimedAt: -1, updatedAt: -1 }); // Sort by when they were claimed

    res.status(200).json({ items });
  } catch (error) {
    console.error('Error fetching claimed items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's pending claim requests
const getMyPendingRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const Request = require('../models/Request');

    const pendingRequests = await Request.find({
      user: userId,
      status: 'pending'
    })
      .populate('item', 'title description category location imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({ requests: pendingRequests });
  } catch (error) 
  {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {getMyReportedItems, getMyClaimedItems, getMyPendingRequests, getLostItems, reportLostItem, claimItem, getAllReportedItems,getUnclaimedItemsFromOthers };



