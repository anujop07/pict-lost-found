import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { token, user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAnalyticsData(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      fetchAnalytics();
    } else if (user?.role !== 'admin') {
      setLoading(false);
    }
  }, [user, token, fetchAnalytics]);

  const exportAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/analytics/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Analytics exported successfully!');
      } else {
        toast.error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Export failed');
    }
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only administrators can access analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Data Available</h1>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    );
  }

  const { overview, recent, itemStats, requestStats, userActivity, trends, emailAnalytics, recentActivity } = analyticsData;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📊 System Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into your Lost & Found system
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={fetchAnalytics} className="bg-blue-600 hover:bg-blue-700">
            🔄 Refresh
          </Button>
          <Button onClick={exportAnalytics} className="bg-green-600 hover:bg-green-700">
            📥 Export CSV
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { key: 'overview', label: '📈 Overview', icon: '📈' },
          { key: 'items', label: '📦 Items', icon: '📦' },
          { key: 'users', label: '👥 Users', icon: '👥' },
          { key: 'trends', label: '📊 Trends', icon: '📊' },
          { key: 'activity', label: '🔄 Activity', icon: '🔄' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedView(tab.key)}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              selectedView === tab.key
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="flex items-center">
                <div className="text-3xl mr-4">👥</div>
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{overview.totalUsers}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📦</div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Items</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{overview.totalItems}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📋</div>
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Requests</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{overview.totalRequests}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🎯</div>
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Success Rate</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{overview.successRate}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📈 Recent Activity (30 days)</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">New Items</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{recent.items}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">New Users</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{recent.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">New Requests</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{recent.requests}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚡ Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Resolution Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{overview.avgResolutionTime}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Admin Users</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{overview.totalAdmins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email Subscribers</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{emailAnalytics.overview.usersWithNotifications}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Items by Status</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{itemStats.byStatus.length} types</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Categories</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{itemStats.byCategory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Request Types</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{requestStats.byType.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Items Tab */}
      {selectedView === 'items' && (
        <div className="space-y-6">
          {/* Items by Status */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📊 Items by Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {itemStats.byStatus.map((status, index) => (
                <div key={status._id} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{status.count}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status._id}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Items by Category */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📦 Items by Category</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Claimed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Approved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {itemStats.byCategory.map((category) => (
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {category._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{category.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{category.claimed}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400">{category.pending}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">{category.approved}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {category.total > 0 ? ((category.claimed / category.total) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top Locations */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📍 Top Locations</h3>
            <div className="space-y-3">
              {itemStats.byLocation.slice(0, 10).map((location, index) => (
                <div key={location._id} className="flex justify-between items-center">
                  <span className="text-gray-900 dark:text-white">{location._id}</span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                    {location.count} items
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {selectedView === 'users' && (
        <div className="space-y-6">
          {/* Top Contributors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🏆 Top Reporters</h3>
              <div className="space-y-3">
                {userActivity.topReporters.map((user, index) => (
                  <div key={user._id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                      {user.collegeId && <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({user.collegeId})</span>}
                    </div>
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm">
                      {user.itemsReported} items
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🎯 Top Claimers</h3>
              <div className="space-y-3">
                {userActivity.topClaimers.map((user, index) => (
                  <div key={user._id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                      {user.collegeId && <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({user.collegeId})</span>}
                    </div>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                      {user.itemsClaimed} items
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Email Subscriptions */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📧 Email Subscriptions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{emailAnalytics.overview.usersWithNotifications}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Users with Notifications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{emailAnalytics.overview.totalSubscriptions}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Subscriptions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {emailAnalytics.overview.totalUsers > 0 ? 
                    ((emailAnalytics.overview.usersWithNotifications / emailAnalytics.overview.totalUsers) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Notification Rate</div>
              </div>
            </div>

            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Popular Categories</h4>
            <div className="space-y-2">
              {emailAnalytics.categorySubscriptions.slice(0, 10).map((cat) => (
                <div key={cat._id} className="flex justify-between items-center">
                  <span className="text-gray-900 dark:text-white capitalize">{cat._id.replace(':', ' → ')}</span>
                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-sm">
                    {cat.subscriberCount} subscribers
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Trends Tab */}
      {selectedView === 'trends' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📈 Monthly Trends</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items Reported</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items Claimed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {trends.monthly.map((month) => (
                    <tr key={`${month._id.year}-${month._id.month}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{month.itemsReported}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{month.itemsClaimed}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {month.itemsReported > 0 ? ((month.itemsClaimed / month.itemsReported) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Activity Tab */}
      {selectedView === 'activity' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🔄 Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl">
                    {activity.status === 'claimed' ? '✅' : 
                     activity.status === 'approved' ? '👍' : 
                     activity.status === 'pending' ? '⏳' : '📦'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{activity.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Category: {activity.category} • Reporter: {activity.reporter}
                      {activity.claimer && ` • Claimed by: ${activity.claimer}`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    activity.status === 'claimed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    activity.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {activity.status}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;
