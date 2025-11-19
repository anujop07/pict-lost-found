# 📧 Email Notification System - Environment Setup

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/pict-lost-found

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3000

# Email Configuration (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
MAIL_USER=anujnagpure6@gmail.com
EMAIL_PASS=your-app-password
MAIL_PASS=mmlfxwrrnqohucpk
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=PICT Lost & Found System

# Email Rate Limiting
EMAIL_BATCH_SIZE=5
EMAIL_BATCH_DELAY=2000

# Additional Configuration
NODE_ENV=development
```

## 🔐 Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

## 📧 Email Templates

The system includes professional HTML email templates:
- **New Item Found**: Notifies subscribers when items in their categories are reported
- **Responsive Design**: Works on desktop and mobile devices
- **Professional Styling**: Branded with PICT Lost & Found colors

## 🔧 Feature Overview

### Backend Components:
- **subscribeRoutes.js**: REST API for subscription management
- **mailer.js**: Email utility with HTML templates and batch processing
- **itemController.js**: Updated to send notifications when items are reported
- **User.js**: Updated model with subscription fields

### Frontend Components:
- **Subscriptions.js**: Complete subscription management page
- **App.js**: Updated with subscription routes
- **Navbar.js**: Added subscription navigation link

### API Endpoints:
- `GET /api/subscribe/my-subscriptions` - Get user's subscriptions
- `POST /api/subscribe/subscribe` - Subscribe to a category
- `POST /api/subscribe/unsubscribe` - Unsubscribe from a category
- `PUT /api/subscribe/bulk-update` - Update multiple subscriptions
- `POST /api/subscribe/toggle-notifications` - Toggle email notifications
- `GET /api/subscribe/stats` - Get subscription statistics

## 🚀 Testing the System

1. **Start the servers**:
   ```bash
   # Backend
   cd server && npm start
   
   # Frontend
   cd client && npm start
   ```

2. **Create user accounts** and navigate to `/subscriptions`

3. **Subscribe to categories** like "electronics", "books", etc.

4. **Report a found item** in a subscribed category

5. **Check email** for notification (may take 1-2 minutes)

## 📊 Available Categories

- electronics
- books  
- clothing
- keys
- id card
- wallet
- others

## 🔒 Security Features

- **JWT Authentication**: All subscription routes protected
- **Input Validation**: Category validation and sanitization
- **Rate Limiting**: Batch email processing prevents spam
- **Error Handling**: Graceful degradation if email service fails

## 🎨 UI Features

- **Responsive Design**: Works on all device sizes
- **Dark/Light Theme**: Follows user's theme preference
- **Real-time Updates**: Instant subscription status changes
- **Statistics**: Shows subscription counts and activity
- **Professional Interface**: Modern card-based layout

## 📈 Monitoring

The system logs:
- Email sending attempts and results
- Subscription changes
- Error tracking
- Performance metrics

Check server console for real-time email notifications:
```
📧 Sending notifications to 3 subscribers for category: electronics
✅ Email notifications sent successfully for item: Lost iPhone 13
```
