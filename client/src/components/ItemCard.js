import React, { useState, useEffect } from 'react';
import { itemsAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ItemCard = ({ item, onUpdate, showClaimButton = true, showDeleteButton = false, pendingRequests = [] }) => {
  const { user } = useAuth();
  const [isClaimPending, setIsClaimPending] = useState(false);

  useEffect(() => {
    // Check if this item has a pending claim request by current user
    const hasPendingClaim = pendingRequests.some(request => 
      request.item._id === item._id && request.type === 'claim'
    );
    setIsClaimPending(hasPendingClaim);
  }, [pendingRequests, item._id]);

  const handleClaim = async () => {
    try {
      await itemsAPI.claimItem(item._id);
      toast.success('Claim request submitted! Waiting for admin approval.');
      setIsClaimPending(true);
      if (onUpdate) onUpdate();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit claim request';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await adminAPI.deleteItem(item._id);
        toast.success('Item deleted successfully!');
        if (onUpdate) onUpdate();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete item';
        toast.error(message);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'lost':
        return 'bg-yellow-100 text-yellow-800';
      case 'claimed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'lost':
        return 'Not Yet Claimed';
      case 'claimed':
        return 'Claimed by Owner';
      default:
        return status;
    }
  };

  const isMyItem = item.reportedBy?._id === user?._id || item.reportedBy === user?._id;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-200">
        {item.imageUrl ? (
          <img
            src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Image failed to load:', e.target.src);
              console.log('Original imageUrl:', item.imageUrl);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>`;
            }}
            onLoad={(e) => {
              console.log('Image loaded successfully:', e.target.src);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {item.title}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
            {getStatusText(item.status)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {item.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.location}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-7 4h4m-4 4h8m-8-8h8m-8 4h8" />
            </svg>
            {item.category}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-7 4h4m-4 4h8m-8-8h8m-8 4h8" />
            </svg>
            Found on: {formatDate(item.dateFound || item.dateLost)}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Reported by: {item.reportedBy?.name || 'Unknown'}
          </div>
        </div>
        
        {item.claimedBy && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center text-sm text-green-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Claimed by: {item.claimedBy?.name || 'Unknown'} on {formatDate(item.claimedAt)}
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          {showClaimButton && !item.claimedBy && !isMyItem && (
            <>
              {isClaimPending ? (
                <div className="flex-1 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium text-center">
                  🕐 Request Pending
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Claim Item
                </button>
              )}
            </>
          )}
          
          {showDeleteButton && user?.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Delete
            </button>
          )}
          
          {isMyItem && (
            <div className="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-md text-sm font-medium text-center">
              Your Item
            </div>
          )}

          {item.claimedBy && (
            <div className="flex-1 bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium text-center">
              ✅ Claimed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
