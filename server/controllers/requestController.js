const Request = require('../models/Request');
const Item = require('../models/Item');
const User = require('../models/User');
const { sendBulkNewItemNotifications } = require('../utils/mailer');

// Get all pending requests (admin)
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('item');
    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve a request (admin)
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;
    const request = await Request.findById(id).populate('item').populate('user');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    request.status = 'approved';
    request.admin = adminId;
    request.actionDate = new Date();
    await request.save();

    // Update item status based on request type
    if (request.type === 'report') {
      // Approve reported item - make it visible on dashboard
      request.item.status = 'approved';
      await request.item.save();

      // 🔔 Send email notifications to subscribers after admin approval
      try {
        // Find users subscribed to this category with notifications enabled
        const subscribers = await User.find({
          subscribedCategories: request.item.category.toLowerCase(),
          emailNotifications: true,
          _id: { $ne: request.user._id } // Don't notify the reporter
        }).select('email name');

        if (subscribers.length > 0) {
          console.log(`📧 Sending notifications to ${subscribers.length} subscribers for approved item: ${request.item.title}`);
          
          await sendBulkNewItemNotifications(
            subscribers,
            {
              ...request.item.toObject(),
              reporterName: request.user.name || 'Anonymous',
              itemUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/items/${request.item._id}`
            }
          );
          
          console.log(`✅ Email notifications sent successfully for approved item: ${request.item.title}`);
        } else {
          console.log(`ℹ️ No subscribers found for category: ${request.item.category}`);
        }
      } catch (emailError) {
        console.error('📧 Error sending email notifications after approval:', emailError);
        // Don't fail the approval if email fails
      }
    } else if (request.type === 'claim') {
      // Approve claim request - assign item to user and remove from dashboard
      request.item.claimedBy = request.user._id;
      request.item.status = 'claimed';
      request.item.claimedAt = new Date();
      await request.item.save();
      
      // Add item to user's claimedItems array
      const User = require('../models/User');
      await User.findByIdAndUpdate(
        request.user._id,
        { $addToSet: { claimedItems: request.item._id } },
        { new: true }
      );

      // 🔄 Automatically reject all other pending claim requests for this item
      await Request.updateMany(
        {
          item: request.item._id,
          type: 'claim',
          status: 'pending',
          _id: { $ne: request._id } // Exclude the current approved request
        },
        {
          status: 'rejected',
          admin: adminId,
          actionDate: new Date(),
          reason: 'Item already claimed by another user'
        }
      );
      
      console.log(`✅ Auto-rejected other pending claim requests for item: ${request.item.title}`);
    }

    res.status(200).json({ 
      message: `${request.type.charAt(0).toUpperCase() + request.type.slice(1)} request approved successfully`,
      request,
      itemStatus: request.item.status
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject a request (admin)
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;
    const { reason } = req.body;
    const request = await Request.findById(id).populate('item').populate('user');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    request.status = 'rejected';
    request.admin = adminId;
    request.actionDate = new Date();
    request.reason = reason || 'Rejected by admin';
    await request.save();

    // Update item status based on request type
    if (request.type === 'report') {
      // Reject reported item - hide from dashboard
      request.item.status = 'rejected';
      await request.item.save();
    } else if (request.type === 'claim') {
      // Reject claim request - item remains available for claiming
      request.item.status = 'approved'; // Keep as approved so others can claim
      request.item.claimedBy = null;
      await request.item.save();
    }

    res.status(200).json({ 
      message: `${request.type.charAt(0).toUpperCase() + request.type.slice(1)} request rejected`,
      request,
      reason: request.reason
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
