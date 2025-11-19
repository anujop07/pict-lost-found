const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

 email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  validate: {
    validator: function(v) {
      // Basic email check
      return /^\S+@\S+\.\S+$/.test(v);
    },
    message: props => `${props.value} is not a valid email!`
  }
},

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  claimedItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    }
  ],

  reportedItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    }
  ],

  subscribedCategories: [
    {
      type: String,
      // Remove enum constraint to allow subcategories (format: "category" or "category:subcategory")
      lowercase: true
    }
  ],

  emailNotifications: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
