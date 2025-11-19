import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AdminRequests = () => {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRequests(data.requests);
      else setMessage(data.message || 'Failed to fetch requests');
    } catch (err) {
      setMessage('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: action === 'reject' ? JSON.stringify({ reason: 'Rejected by admin' }) : undefined
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Request ${action}ed successfully! ${data.itemStatus ? `Item status: ${data.itemStatus}` : ''}`);
        fetchRequests(); // Refresh requests list
        
        // If claim was approved, the item should be removed from general dashboard
        if (action === 'approve' && data.request?.type === 'claim') {
          setMessage(`Claim approved! Item has been assigned to ${data.request.user?.name || 'the user'} and removed from dashboard.`);
        }
      } else {
        setMessage(data.message || 'Action failed');
      }
    } catch (err) {
      setMessage('Action failed');
      console.error('Error processing request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔍 Admin Approval Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve user requests for reporting items and claiming items
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 px-2 py-1 rounded">
              📝 Report Requests: Items submitted for approval
            </span>
            <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 px-2 py-1 rounded">
              🤲 Claim Requests: Users wanting to claim items
            </span>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') || message.includes('approved') || message.includes('rejected')
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {message}
          </div>
        )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No pending requests</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">All requests have been processed!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map(req => (
            <Card key={req._id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      req.type === 'claim' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                    }`}>
                      {req.type === 'claim' ? '🤲 Claim Request' : '📝 Report Request'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Item: {req.item?.title || 'Unknown Item'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Category: {req.item?.category || 'N/A'} | Location: {req.item?.location || 'N/A'}
                      </p>
                      {req.item?.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Description: {req.item.description.substring(0, 100)}
                          {req.item.description.length > 100 ? '...' : ''}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {req.type === 'claim' ? 'Claiming User:' : 'Reporting User:'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Name: {req.user?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Email: {req.user?.email || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {req.type === 'claim' && req.item?.reportedBy && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Originally reported by:</strong> {req.item.reportedBy.name || 'Unknown'} ({req.item.reportedBy.email || 'Unknown'})
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 lg:flex-col lg:w-32">
                  <Button
                    onClick={() => handleAction(req._id, 'approve')}
                    disabled={actionLoading === req._id + 'approve'}
                    className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading === req._id + 'approve' ? 'Approving...' : '✅ Approve'}
                  </Button>
                  <Button
                    onClick={() => handleAction(req._id, 'reject')}
                    disabled={actionLoading === req._id + 'reject'}
                    className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white"
                  >
                    {actionLoading === req._id + 'reject' ? 'Rejecting...' : '❌ Reject'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminRequests;
