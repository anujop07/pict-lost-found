const nodemailer = require('nodemailer');
const path = require('path');

// Create transporter with Gmail configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const getNewItemEmailTemplate = (user, item) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const dashboardUrl = `${baseUrl}/dashboard`;
  
  return {
    subject: `🔍 New Found Item Alert: ${item.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Item Found - PICT Lost & Found</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container { 
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e9ecef;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #007bff;
          }
          .logo { 
            background: linear-gradient(135deg, #007bff, #0056b3); 
            color: white; 
            padding: 15px; 
            border-radius: 50%; 
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            width: 60px; 
            height: 60px; 
            margin-bottom: 15px; 
            font-size: 24px;
          }
          .item-card { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 10px; 
            margin: 20px 0;
            border: 1px solid #dee2e6;
          }
          .item-title { 
            font-size: 22px; 
            font-weight: bold; 
            color: #007bff; 
            margin-bottom: 15px;
          }
          .item-details { 
            margin: 15px 0; 
          }
          .detail-row { 
            display: flex; 
            margin: 10px 0; 
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .detail-label { 
            font-weight: 600; 
            width: 120px; 
            color: #495057;
          }
          .detail-value { 
            flex: 1; 
            color: #212529;
          }
          .category-badge { 
            background: #28a745; 
            color: white; 
            padding: 5px 12px; 
            border-radius: 20px; 
            font-size: 14px; 
            display: inline-block;
            text-transform: capitalize;
          }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #007bff, #0056b3); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            margin: 20px 0;
            text-align: center;
            transition: all 0.3s ease;
          }
          .cta-button:hover { 
            background: linear-gradient(135deg, #0056b3, #004085); 
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #dee2e6; 
            color: #6c757d; 
            font-size: 14px;
          }
          .unsubscribe { 
            color: #6c757d; 
            font-size: 12px; 
            margin-top: 15px;
          }
          .unsubscribe a { 
            color: #007bff; 
            text-decoration: none;
          }
          .alert-banner {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔍</div>
            <h1 style="margin: 0; color: #007bff;">PICT Lost & Found</h1>
            <p style="margin: 5px 0 0 0; color: #6c757d;">Pune Institute of Computer Technology</p>
          </div>
          
          <div class="alert-banner">
            🎉 Great News! A new item matching your interests has been found!
          </div>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Hi <strong>${user.name}</strong>,
          </p>
          
          <p style="margin-bottom: 25px;">
            Someone just reported a found item in the <strong>${item.category.toUpperCase()}</strong> category 
            that you're subscribed to. Here are the details:
          </p>

          <div class="item-card">
            <div class="item-title">${item.title}</div>
            
            <div class="item-details">
              <div class="detail-row">
                <span class="detail-label">📂 Category:</span>
                <span class="detail-value">
                  <span class="category-badge">${item.category}</span>
                </span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">📍 Location:</span>
                <span class="detail-value">${item.location}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">📅 Date Found:</span>
                <span class="detail-value">${new Date(item.dateFound || item.dateLost).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              ${item.description ? `
                <div class="detail-row">
                  <span class="detail-label">📝 Description:</span>
                  <span class="detail-value">${item.description}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" class="cta-button">
              🚀 View Item & Claim if Yours
            </a>
          </div>

          <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0056b3;">💡 What's Next?</h3>
            <ul style="margin-bottom: 0; padding-left: 20px;">
              <li>Click the button above to visit the dashboard</li>
              <li>Look for the item in the found items list</li>
              <li>If it's yours, click "Claim Item" to get it back</li>
              <li>Contact the finder if you need more details</li>
            </ul>
          </div>

          <div class="footer">
            <p><strong>PICT Lost & Found</strong> - Helping students reconnect with their belongings</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
            
            <div class="unsubscribe">
              <p>Don't want these notifications? 
                <a href="${baseUrl}/profile">Manage your subscription preferences</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Found Item Alert - PICT Lost & Found
      
      Hi ${user.name},
      
      A new item has been found in the "${item.category.toUpperCase()}" category that you're subscribed to:
      
      Item: ${item.title}
      Category: ${item.category}
      Location: ${item.location}
      Date Found: ${new Date(item.dateFound || item.dateLost).toLocaleDateString()}
      ${item.description ? `Description: ${item.description}` : ''}
      
      Visit the dashboard to view and claim this item if it's yours:
      ${dashboardUrl}
      
      ---
      PICT Lost & Found
      This is an automated notification.
    `
  };
};

// Send email to individual user
const sendNewItemNotification = async (user, item) => {
  try {
    console.log(`📧 Attempting to send email to: ${user.email} (${user.name})`);
    
    const transporter = createTransporter();
    const emailTemplate = getNewItemEmailTemplate(user, item);
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'PICT Lost & Found',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'X-Mailer': 'PICT Lost & Found System'
      }
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${user.email} (${user.name}) for item: ${item.title}`);
    return { success: true, messageId: result.messageId, email: user.email };
    
  } catch (error) {
    console.error(`❌ Failed to send email to ${user.email} (${user.name}):`, error.message);
    return { success: false, error: error.message, email: user.email };
  }
};

// Send emails to multiple users (batch processing)
const sendBulkNewItemNotifications = async (users, item) => {
  console.log(`📧 Starting bulk notifications for item: ${item.title}`);
  console.log(`👥 Recipients: ${users.map(u => `${u.name} (${u.email})`).join(', ')}`);
  
  const results = [];
  const batchSize = parseInt(process.env.EMAIL_BATCH_SIZE) || 5;
  
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.map(u => u.email).join(', ')}`);
    
    const batchPromises = batch.map(user => sendNewItemNotification(user, item));
    
    try {
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to respect Gmail rate limits
      if (i + batchSize < users.length) {
        const delay = parseInt(process.env.EMAIL_BATCH_DELAY) || 2000;
        console.log(`⏳ Waiting ${delay}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error);
    }
  }
  
  const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
  const failed = results.length - successful;
  
  console.log(`📊 Email notification summary: ${successful} sent, ${failed} failed`);
  
  return {
    total: results.length,
    successful,
    failed,
    results
  };
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendNewItemNotification,
  sendBulkNewItemNotifications,
  verifyEmailConfig,
  createTransporter
};
