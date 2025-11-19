import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import toast from 'react-hot-toast';

const ReportItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    dateFound: '',
    category: '',
    subcategory: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Complete category structure matching the subscription system
  const AVAILABLE_CATEGORIES = {
    electronics: {
      name: 'Electronics',
      subcategories: ['phone', 'laptop', 'tablet', 'headphones', 'charger', 'smartwatch', 'camera', 'gaming-device', 'other-electronics']
    },
    books: {
      name: 'Books',
      subcategories: ['textbook', 'notebook', 'novel', 'reference-book', 'magazine', 'journal', 'other-books']
    },
    clothing: {
      name: 'Clothing',
      subcategories: ['shirt', 'jacket', 'shoes', 'bag', 'hat', 'scarf', 'gloves', 'uniform', 'other-clothing']
    },
    keys: {
      name: 'Keys',
      subcategories: ['house-keys', 'car-keys', 'room-keys', 'office-keys', 'bike-keys', 'locker-keys', 'other-keys']
    },
    'id-card': {
      name: 'ID Cards',
      subcategories: ['student-id', 'employee-id', 'driving-license', 'passport', 'credit-card', 'library-card', 'other-id']
    },
    wallet: {
      name: 'Wallet & Money',
      subcategories: ['wallet', 'purse', 'cash', 'coins', 'gift-card', 'other-wallet']
    },
    others: {
      name: 'Others',
      subcategories: ['jewelry', 'glasses', 'stationery', 'sports-equipment', 'documents', 'food-items', 'miscellaneous']
    }
  };

  // Format subcategory name for display
  const formatSubcategoryName = (subcategory) => {
    return subcategory.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If category changes, reset subcategory
    if (name === 'category') {
      setFormData({
        ...formData,
        [name]: value,
        subcategory: '', // Reset subcategory when category changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    document.getElementById('image').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = { ...formData };
      if (imageFile) {
        submitData.image = imageFile;
      }

      await itemsAPI.reportItem(submitData);
      toast.success('Found item reported successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to report found item';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report Found Item</h1>
          <p className="mt-2 text-gray-600">
            Provide detailed information about the item you found to help the owner reclaim it
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Item Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="e.g., Blue iPhone 13, Black Laptop Bag"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Provide a detailed description including brand, color, size, distinctive features, etc."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Found Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="e.g., Library 2nd Floor, Computer Lab, Cafeteria"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {Object.entries(AVAILABLE_CATEGORIES).map(([categoryKey, categoryData]) => (
                  <option key={categoryKey} value={categoryKey}>
                    {categoryData.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            {formData.category && (
              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                  Subcategory (Optional)
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={formData.subcategory}
                  onChange={handleChange}
                >
                  <option value="">Select a subcategory (optional)</option>
                  {AVAILABLE_CATEGORIES[formData.category].subcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {formatSubcategoryName(subcategory)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Found */}
            <div>
              <label htmlFor="dateFound" className="block text-sm font-medium text-gray-700">
                Date Found *
              </label>
              <input
                type="date"
                id="dateFound"
                name="dateFound"
                required
                max={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.dateFound}
                onChange={handleChange}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Item Image (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="image"
                            name="image"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Reporting...' : 'Report Found Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportItem;
