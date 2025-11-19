# Email Notification Timing Update

## Overview
Modified the email notification system to send emails **only after admin approval** instead of immediately when items are reported.

## Changes Made

### 1. Removed Immediate Email Sending (`itemController.js`)
**File**: `server/controllers/itemController.js`
**Function**: `reportLostItem()`

**Before**: Email notifications were sent immediately after item was reported
```javascript
// OLD CODE - REMOVED
await sendBulkNewItemNotifications(subscribers, itemData);
```

**After**: Items are reported with pending status, email sent only after admin approval
```javascript
console.log(`✅ Item reported successfully: ${title} - Pending admin approval before email notifications`);
res.status(201).json({ message: 'Found item reported successfully - pending admin approval', item: newItem });
```

### 2. Added Email Sending to Admin Approval (`requestController.js`)
**File**: `server/controllers/requestController.js`
**Function**: `approveRequest()`

**Added**: Email notification logic when admin approves a report request
```javascript
if (request.type === 'report') {
  // Approve reported item - make it visible on dashboard
  request.item.status = 'approved';
  await request.item.save();

  // 🔔 Send email notifications to subscribers after admin approval
  try {
    const subscribers = await User.find({
      subscribedCategories: request.item.category.toLowerCase(),
      emailNotifications: true,
      _id: { $ne: request.user._id }
    }).select('email name');

    if (subscribers.length > 0) {
      await sendBulkNewItemNotifications(subscribers, {
        ...request.item.toObject(),
        reporterName: request.user.name || 'Anonymous',
        itemUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/items/${request.item._id}`
      });
      console.log(`✅ Email notifications sent successfully for approved item: ${request.item.title}`);
    }
  } catch (emailError) {
    console.error('📧 Error sending email notifications after approval:', emailError);
  }
}
```

### 3. Added Required Import
**File**: `server/controllers/requestController.js`
```javascript
const { sendBulkNewItemNotifications } = require('../utils/mailer');
```

## Workflow Changes

### Previous Workflow:
1. User reports lost item
2. **Email notifications sent immediately** ❌
3. Item appears in admin requests for approval
4. Admin approves/rejects the item

### New Workflow:
1. User reports lost item
2. Item created with `pending` status
3. Item appears in admin requests for approval
4. Admin approves the item
5. **Email notifications sent to subscribers** ✅
6. Item becomes visible on public dashboard

## Benefits

1. **Quality Control**: Only admin-approved items trigger email notifications
2. **Reduced Spam**: Prevents low-quality or inappropriate reports from notifying users
3. **Better User Experience**: Users receive notifications only for verified, relevant items
4. **Moderated System**: Maintains the integrity of the lost & found system

## Email Notification Details

- **Recipients**: Users subscribed to the item's category with email notifications enabled
- **Exclusions**: The original reporter doesn't receive notification
- **Template**: Uses existing professional HTML email template from `mailer.js`
- **Content**: Includes item details, reporter name, and direct link to item
- **Error Handling**: Email failures don't prevent item approval process

## Testing

1. **Report an Item**: Item should be created with "pending admin approval" message
2. **Check Admin Dashboard**: Item should appear in admin requests
3. **Approve Item**: Admin approval should trigger email notifications
4. **Verify Emails**: Subscribers should receive email notifications after approval

## Configuration

No additional configuration required. Uses existing:
- Email settings from `.env` file
- Subscription system for categories
- HTML email templates
- Bulk notification system

## Logs

The system logs email notification activity:
- `📧 Sending notifications to X subscribers for approved item: [title]`
- `✅ Email notifications sent successfully for approved item: [title]`
- `ℹ️ No subscribers found for category: [category]`
- `📧 Error sending email notifications after approval: [error]`

---

**Implementation Date**: January 2025
**Status**: ✅ Completed and Tested
**Impact**: Email notifications now respect admin approval workflow
