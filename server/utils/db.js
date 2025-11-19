// server/utils/db.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load variables from .env (go up one directory to find .env)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
  try {
   
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
