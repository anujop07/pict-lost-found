// pages/Subscriptions.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';

const Subscriptions = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [subscriptions, setSubscriptions] = useState({
    subscribedCategories: [],
    emailNotifications: true,
    availableCategories: {},
    categoriesFlat: []
  });
  const [expandedCategories, setExpandedCategories] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch current subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subscribe/my-subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setSubscriptions(data.data);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setMessage({ type: 'error', text: 'Failed to load subscriptions' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSubscriptions();
    }
  }, [token, fetchSubscriptions]);

  // Subscribe to a category or subcategory
  const handleSubscribe = async (category, subcategory = null) => {
    setUpdating(true);
    try {
      const response = await fetch('http://localhost:5000/api/subscribe/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, subcategory })
      });

      const data = await response.json();
      if (response.ok) {
        setSubscriptions(prev => ({
          ...prev,
          subscribedCategories: data.data.subscribedCategories
        }));
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage({ type: 'error', text: 'Failed to subscribe' });
    } finally {
      setUpdating(false);
    }
  };

  // Unsubscribe from a category or subcategory
  const handleUnsubscribe = async (category, subcategory = null) => {
    setUpdating(true);
    try {
      const response = await fetch('http://localhost:5000/api/subscribe/unsubscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, subcategory })
      });

      const data = await response.json();
      if (response.ok) {
        setSubscriptions(prev => ({
          ...prev,
          subscribedCategories: data.data.subscribedCategories
        }));
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setMessage({ type: 'error', text: 'Failed to unsubscribe' });
    } finally {
      setUpdating(false);
    }
  };

  // Toggle email notifications
  const handleToggleNotifications = async () => {
    setUpdating(true);
    try {
      const response = await fetch('http://localhost:5000/api/subscribe/toggle-notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setSubscriptions(prev => ({
          ...prev,
          emailNotifications: data.data.emailNotifications
        }));
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      setMessage({ type: 'error', text: 'Failed to toggle notifications' });
    } finally {
      setUpdating(false);
    }
  };

  // Toggle category expansion
  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  // Check if user is subscribed to a specific item
  const isSubscribed = (category, subcategory = null) => {
    const subscriptionKey = subcategory ? `${category}:${subcategory}` : category;
    return subscriptions.subscribedCategories.includes(subscriptionKey);
  };

  // Format subcategory name for display
  const formatSubcategoryName = (subcategory) => {
    return subcategory.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📧 Email Subscriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Subscribe to categories to get notified when new items are reported
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Email Notifications Toggle */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive email alerts when new items are reported in your subscribed categories
              </p>
            </div>
            <Button
              onClick={handleToggleNotifications}
              disabled={updating}
              className={`${
                subscriptions.emailNotifications
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              {subscriptions.emailNotifications ? '🔔 Enabled' : '🔕 Disabled'}
            </Button>
          </div>
        </Card>

        {/* Categories and Subcategories */}
        <div className="space-y-4">
          {Object.entries(subscriptions.availableCategories).map(([categoryKey, categoryData]) => (
            <Card key={categoryKey} className="overflow-hidden">
              {/* Category Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                onClick={() => toggleCategory(categoryKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {categoryKey === 'electronics' && '📱'}
                      {categoryKey === 'books' && '📚'}
                      {categoryKey === 'clothing' && '👕'}
                      {categoryKey === 'keys' && '🔑'}
                      {categoryKey === 'id-card' && '🆔'}
                      {categoryKey === 'wallet' && '💳'}
                      {categoryKey === 'others' && '📦'}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {categoryData.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {categoryData.subcategories.length} subcategories available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Category Subscribe/Unsubscribe Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSubscribed(categoryKey)) {
                          handleUnsubscribe(categoryKey);
                        } else {
                          handleSubscribe(categoryKey);
                        }
                      }}
                      disabled={updating}
                      size="sm"
                      className={
                        isSubscribed(categoryKey)
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }
                    >
                      {isSubscribed(categoryKey) ? 'Unsubscribe All' : 'Subscribe All'}
                    </Button>
                    {/* Expand/Collapse Icon */}
                    <svg 
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        expandedCategories[categoryKey] ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories[categoryKey] && (
                <div className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryData.subcategories.map((subcategory) => (
                      <div 
                        key={subcategory}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatSubcategoryName(subcategory)}
                        </span>
                        <Button
                          onClick={() => {
                            if (isSubscribed(categoryKey, subcategory)) {
                              handleUnsubscribe(categoryKey, subcategory);
                            } else {
                              handleSubscribe(categoryKey, subcategory);
                            }
                          }}
                          disabled={updating}
                          size="sm"
                          className={
                            isSubscribed(categoryKey, subcategory)
                              ? 'bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-2 py-1'
                          }
                        >
                          {isSubscribed(categoryKey, subcategory) ? '✓' : '+'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Current Subscriptions Summary */}
        {subscriptions.subscribedCategories.length > 0 && (
          <Card className="mt-8 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Active Subscriptions ({subscriptions.subscribedCategories.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {subscriptions.subscribedCategories.map((subscription) => (
                <span
                  key={subscription}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
                >
                  {subscription.includes(':') 
                    ? formatSubcategoryName(subscription.split(':')[1]) + ` (${subscription.split(':')[0]})`
                    : subscription
                  }
                  <button
                    onClick={() => {
                      const [category, subcategory] = subscription.split(':');
                      handleUnsubscribe(category, subcategory);
                    }}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
