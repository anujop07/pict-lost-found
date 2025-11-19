// controllers/analyticsController.js
const User = require('../models/User');
const Item = require('../models/Item');
const Request = require('../models/Request');

// Get comprehensive analytics data
const getAnalytics = async (req, res) => {
  try {
    // Overall Statistics
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Item Statistics by Status
    const itemsByStatus = await Item.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent Activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentItems = await Item.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const recentRequests = await Request.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Category Analytics
    const itemsByCategory = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          claimed: {
            $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Request Analytics
    const requestsByType = await Request.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    // User Activity Analytics
    const topReporters = await Item.aggregate([
      {
        $group: {
          _id: '$reportedBy',
          itemsReported: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          collegeId: '$user.collegeId',
          itemsReported: 1
        }
      },
      { $sort: { itemsReported: -1 } },
      { $limit: 10 }
    ]);

    const topClaimers = await Item.aggregate([
      { $match: { claimedBy: { $ne: null } } },
      {
        $group: {
          _id: '$claimedBy',
          itemsClaimed: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          collegeId: '$user.collegeId',
          itemsClaimed: 1
        }
      },
      { $sort: { itemsClaimed: -1 } },
      { $limit: 10 }
    ]);

    // Monthly Trends (last 12 months)
    const monthlyTrends = await Item.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          itemsReported: { $sum: 1 },
          itemsClaimed: {
            $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Success Rate (items claimed vs reported)
    const successRate = totalItems > 0 ? 
      ((await Item.countDocuments({ status: 'claimed' })) / totalItems * 100).toFixed(2) : 0;

    // Email Subscription Analytics
    const emailStats = await User.aggregate([
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

    // Category subscription breakdown
    const categorySubscriptions = await User.aggregate([
      { $unwind: { path: '$subscribedCategories', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: '$subscribedCategories',
          subscriberCount: { $sum: 1 }
        }
      },
      { $sort: { subscriberCount: -1 } }
    ]);

    // Average resolution time for requests
    const resolvedRequests = await Request.find({
      status: { $in: ['approved', 'rejected'] },
      actionDate: { $ne: null }
    }).select('createdAt actionDate');

    let avgResolutionTime = 0;
    if (resolvedRequests.length > 0) {
      const totalTime = resolvedRequests.reduce((sum, request) => {
        const timeDiff = new Date(request.actionDate) - new Date(request.createdAt);
        return sum + timeDiff;
      }, 0);
      avgResolutionTime = Math.round(totalTime / resolvedRequests.length / (1000 * 60 * 60)); // in hours
    }

    // Location Analytics
    const itemsByLocation = await Item.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent activity feed
    const recentActivity = await Item.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: 'reportedBy',
          foreignField: '_id',
          as: 'reporter'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'claimedBy',
          foreignField: '_id',
          as: 'claimer'
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          status: 1,
          createdAt: 1,
          claimedAt: 1,
          reporter: { $arrayElemAt: ['$reporter.name', 0] },
          claimer: { $arrayElemAt: ['$claimer.name', 0] }
        }
      }
    ]);

    // Response data
    const analyticsData = {
      overview: {
        totalUsers,
        totalItems,
        totalRequests,
        totalAdmins,
        successRate: parseFloat(successRate),
        avgResolutionTime
      },
      recent: {
        items: recentItems,
        users: recentUsers,
        requests: recentRequests
      },
      itemStats: {
        byStatus: itemsByStatus,
        byCategory: itemsByCategory,
        byLocation: itemsByLocation
      },
      requestStats: {
        byType: requestsByType
      },
      userActivity: {
        topReporters,
        topClaimers
      },
      trends: {
        monthly: monthlyTrends
      },
      emailAnalytics: {
        overview: emailStats[0] || { totalUsers: 0, usersWithNotifications: 0, totalSubscriptions: 0 },
        categorySubscriptions
      },
      recentActivity
    };

    res.status(200).json({
      message: 'Analytics data retrieved successfully',
      data: analyticsData
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get specific analytics (for targeted queries)
const getSpecificAnalytics = async (req, res) => {
  try {
    const { type } = req.params;
    let data = {};

    switch (type) {
      case 'users':
        data = await getUserAnalytics();
        break;
      case 'items':
        data = await getItemAnalytics();
        break;
      case 'requests':
        data = await getRequestAnalytics();
        break;
      case 'subscriptions':
        data = await getSubscriptionAnalytics();
        break;
      default:
        return res.status(400).json({ message: 'Invalid analytics type' });
    }

    res.status(200).json({
      message: `${type} analytics retrieved successfully`,
      data
    });

  } catch (error) {
    console.error(`Error fetching ${req.params.type} analytics:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper functions for specific analytics
const getUserAnalytics = async () => {
  const totalUsers = await User.countDocuments();
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const regularUsers = totalUsers - adminUsers;
  
  const userRegistrations = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return {
    total: totalUsers,
    admins: adminUsers,
    regular: regularUsers,
    registrationTrends: userRegistrations
  };
};

const getItemAnalytics = async () => {
  const totalItems = await Item.countDocuments();
  const claimedItems = await Item.countDocuments({ status: 'claimed' });
  const pendingItems = await Item.countDocuments({ status: 'pending' });
  const approvedItems = await Item.countDocuments({ status: 'approved' });
  
  return {
    total: totalItems,
    claimed: claimedItems,
    pending: pendingItems,
    approved: approvedItems,
    claimRate: totalItems > 0 ? ((claimedItems / totalItems) * 100).toFixed(2) : 0
  };
};

const getRequestAnalytics = async () => {
  const totalRequests = await Request.countDocuments();
  const pendingRequests = await Request.countDocuments({ status: 'pending' });
  const approvedRequests = await Request.countDocuments({ status: 'approved' });
  const rejectedRequests = await Request.countDocuments({ status: 'rejected' });
  
  return {
    total: totalRequests,
    pending: pendingRequests,
    approved: approvedRequests,
    rejected: rejectedRequests,
    approvalRate: totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(2) : 0
  };
};

const getSubscriptionAnalytics = async () => {
  const usersWithNotifications = await User.countDocuments({ emailNotifications: true });
  const totalSubscriptions = await User.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: { $size: { $ifNull: ['$subscribedCategories', []] } } }
      }
    }
  ]);

  return {
    usersWithNotifications,
    totalSubscriptions: totalSubscriptions[0]?.total || 0
  };
};

module.exports = {
  getAnalytics,
  getSpecificAnalytics
};
