import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const MyReports = () => {
  const [reportedItems, setReportedItems] = useState([]);
  const [claimedItems, setClaimedItems] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reported'); // 'reported', 'claimed', 'pending'

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [reportsResponse, claimsResponse, pendingResponse] = await Promise.all([
        itemsAPI.getMyReports(),
        itemsAPI.getMyClaims(),
        itemsAPI.getMyPendingRequests()
      ]);
      
      setReportedItems(reportsResponse.data.items || []);
      setClaimedItems(claimsResponse.data.items || []);
      setPendingRequests(pendingResponse.data.requests || []);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch your data';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemUpdate = () => {
    fetchAllData();
  };

  const getActiveItems = () => {
    switch (activeTab) {
      case 'reported':
        return reportedItems;
      case 'claimed':
        return claimedItems;
      case 'pending':
        return pendingRequests.map(req => ({
          ...req.item,
          requestType: req.type,
          requestStatus: req.status,
          requestId: req._id
        }));
      default:
        return [];
    }
  };

  const getStats = () => {
    return {
      reported: reportedItems.length,
      claimed: claimedItems.length,
      pending: pendingRequests.length,
    };
  };

  if (isLoading) {
    return <Loading message="Loading your data..." />;
  }

  const stats = getStats();
  const activeItems = getActiveItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Activity</h1>
          <p className="mt-2 text-gray-600">
            Track items you've reported, claimed, and pending requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Items I Reported</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.reported}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Items I Claimed</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.claimed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('reported')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reported'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📝 Items I Reported ({stats.reported})
              </button>
              <button
                onClick={() => setActiveTab('claimed')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'claimed'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🤲 Items I Claimed ({stats.claimed})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⏳ Pending Requests ({stats.pending})
              </button>
            </nav>
          </div>
        </div>

        {/* Items Grid */}
        {activeItems.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {activeTab === 'reported' && "No reported items"}
              {activeTab === 'claimed' && "No claimed items"}
              {activeTab === 'pending' && "No pending requests"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'reported' && "You haven't reported any found items yet."}
              {activeTab === 'claimed' && "You haven't claimed any items yet."}
              {activeTab === 'pending' && "You don't have any pending claim requests."}
            </p>
            {activeTab === 'reported' && (
              <div className="mt-6">
                <Link
                  to="/report-item"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Report Found Item
                </Link>
              </div>
            )}
            {activeTab === 'pending' && (
              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Items to Claim
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeItems.map((item) => {
              // Handle different item types (regular items vs. pending requests)
              const isRequest = item.requestType !== undefined;
              return (
                <div key={item._id || item.requestId} className="relative">
                  {isRequest && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.requestStatus === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : item.requestStatus === 'approved'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {item.requestType === 'claim' ? '🤲' : '📝'} {item.requestStatus}
                      </span>
                    </div>
                  )}
                  <ItemCard
                    item={item}
                    onUpdate={handleItemUpdate}
                    showClaimButton={activeTab === 'claimed'} // Only show claim button for claimed items
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
