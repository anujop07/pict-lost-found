const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['electronics', 'books', 'clothing', 'keys', 'id-card', 'wallet', 'others'],
    required: true,
    lowercase: true  // This will automatically convert to lowercase
  },
  subcategory: {
    type: String,
    lowercase: true  // This will automatically convert to lowercase
  },
  location: {
    type: String,
    required: true
  },
  dateLost: {
    type: Date,
    required: true
  },
  dateFound: {
    type: Date,
    default: function() {
      return this.dateLost; // Use dateLost as fallback for existing records
    }
  },
  imageUrl: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'claimed'],
    default: 'pending'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  claimedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
 