// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { getAnalytics, getSpecificAnalytics } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// Get comprehensive analytics (admin only)
router.get('/dashboard', authMiddleware, isAdmin, getAnalytics);

// Get specific analytics by type (admin only)
router.get('/specific/:type', authMiddleware, isAdmin, getSpecificAnalytics);

// Export analytics data (admin only)
router.get('/export', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { getAnalytics } = require('../controllers/analyticsController');
    
    // Get analytics data
    const mockReq = { user: req.user };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          // Format data for CSV export
          const csvData = formatAnalyticsForCSV(data.data);
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
          res.send(csvData);
        }
      })
    };
    
    await getAnalytics(mockReq, mockRes);
    
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

// Helper function to format analytics data for CSV
const formatAnalyticsForCSV = (data) => {
  let csv = 'Analytics Report\n';
  csv += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Overview section
  csv += 'OVERVIEW\n';
  csv += 'Metric,Value\n';
  csv += `Total Users,${data.overview.totalUsers}\n`;
  csv += `Total Items,${data.overview.totalItems}\n`;
  csv += `Total Requests,${data.overview.totalRequests}\n`;
  csv += `Total Admins,${data.overview.totalAdmins}\n`;
  csv += `Success Rate,${data.overview.successRate}%\n`;
  csv += `Avg Resolution Time,${data.overview.avgResolutionTime} hours\n\n`;
  
  // Items by category
  csv += 'ITEMS BY CATEGORY\n';
  csv += 'Category,Total,Claimed,Pending,Approved,Rejected\n';
  data.itemStats.byCategory.forEach(cat => {
    csv += `${cat._id},${cat.total},${cat.claimed},${cat.pending},${cat.approved},${cat.rejected}\n`;
  });
  
  return csv;
};

module.exports = router;
