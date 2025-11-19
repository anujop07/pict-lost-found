// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./utils/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes');
const { registerUser, loginUser } = require('./controllers/authController');
// const { loginUser } = require('./controllers/authController');
const itemRoutes = require('./routes/itemRoutes');

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });
connectDB();               // ← This runs our db.js code



const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
