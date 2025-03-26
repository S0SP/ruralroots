/**
 * SMS Routes for Twilio Integration
 * 
 * These routes handle the Twilio integration for sending SMS alerts
 * related to weather conditions.
 */

const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const alertScheduler = require('../services/alertScheduler');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// In-memory storage for subscriptions (in production, use a database)
const subscriptions = new Map();

/**
 * Send verification code
 * 
 * POST /api/sms/send-verification
 * Request body: { phoneNumber: string }
 */
router.post('/send-verification', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number is required' 
      });
    }
    
    // Create a verification (in production, use Twilio Verify API)
    // For example:
    // const verification = await twilioClient.verify.v2
    //   .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    //   .verifications.create({
    //     to: phoneNumber,
    //     channel: 'sms'
    //   });
    // 
    // return res.json({ 
    //   success: true, 
    //   sid: verification.sid 
    // });
    
    // For this example, we'll generate a random code and send it directly
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code (in production, use a secure database with expiration)
    subscriptions.set(phoneNumber, {
      verificationCode,
      createdAt: new Date(),
      verified: false
    });
    
    // Send the verification code via SMS
    const message = await twilioClient.messages.create({
      body: `Your verification code for farm weather alerts is: ${verificationCode}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    res.json({ 
      success: true, 
      sid: message.sid
    });
  } catch (error) {
    console.error('Error sending verification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send verification code' 
    });
  }
});

/**
 * Verify OTP and subscribe to alerts
 * 
 * POST /api/sms/verify-and-subscribe
 * Request body: { phoneNumber: string, otp: string, location: { lat: number, lng: number } }
 */
router.post('/verify-and-subscribe', async (req, res) => {
  try {
    const { phoneNumber, otp, location } = req.body;
    
    if (!phoneNumber || !otp || !location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number, OTP, and location are required' 
      });
    }
    
    // Verify the code
    // For Twilio Verify API:
    // const verification = await twilioClient.verify.v2
    //   .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    //   .verificationChecks.create({
    //     to: phoneNumber,
    //     code: otp
    //   });
    //
    // if (!verification.valid) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Invalid verification code'
    //   });
    // }
    
    // For our example, check against stored code
    const subscription = subscriptions.get(phoneNumber);
    
    if (!subscription) {
      return res.status(400).json({
        success: false,
        error: 'No verification found for this number'
      });
    }
    
    if (subscription.verificationCode !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }
    
    // Check if code is expired (15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (subscription.createdAt < fifteenMinutesAgo) {
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired'
      });
    }
    
    // Update subscription with verified status and location
    subscriptions.set(phoneNumber, {
      ...subscription,
      verified: true,
      active: true,
      location,
      subscribedAt: new Date()
    });
    
    // Set up automated alert checking for this location
    // Create a unique ID based on the phone number (hashed or sanitized in production)
    const userId = `user-${phoneNumber.replace(/\+/g, '').slice(-10)}`;
    const checkInterval = 60; // Check hourly by default
    
    // Schedule automatic weather checks for this location
    const alertJob = alertScheduler.scheduleAlertCheck(userId, location, checkInterval);
    
    // Store the job ID with the subscription
    subscriptions.set(phoneNumber, {
      ...subscriptions.get(phoneNumber),
      alertJob: alertJob.id
    });
    
    // Send confirmation SMS
    await twilioClient.messages.create({
      body: 'You have successfully subscribed to farm weather alerts. We will notify you when weather conditions may impact your farming activities.',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    res.json({ 
      success: true,
      alertJob: alertJob
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify code' 
    });
  }
});

/**
 * Get subscription status
 * 
 * GET /api/sms/subscription-status
 * Query params: phoneNumber
 */
router.get('/subscription-status', (req, res) => {
  try {
    const { phoneNumber } = req.query;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number is required' 
      });
    }
    
    const subscription = subscriptions.get(phoneNumber);
    
    if (!subscription || !subscription.verified || !subscription.active) {
      return res.json({ subscribed: false });
    }
    
    res.json({
      subscribed: true,
      subscription: {
        phoneNumber,
        location: subscription.location,
        active: subscription.active,
        createdAt: subscription.subscribedAt,
        alertJob: subscription.alertJob
      }
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check subscription status' 
    });
  }
});

/**
 * Unsubscribe from alerts
 * 
 * POST /api/sms/unsubscribe
 * Request body: { phoneNumber: string }
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number is required' 
      });
    }
    
    const subscription = subscriptions.get(phoneNumber);
    
    if (!subscription || !subscription.verified) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found for this number'
      });
    }
    
    // Stop the alert check job if it exists
    if (subscription.alertJob) {
      alertScheduler.stopAlertCheck(subscription.alertJob);
    }
    
    // Update subscription to inactive
    subscriptions.set(phoneNumber, {
      ...subscription,
      active: false,
      unsubscribedAt: new Date()
    });
    
    // Send confirmation SMS
    await twilioClient.messages.create({
      body: 'You have successfully unsubscribed from farm weather alerts. You will no longer receive notifications.',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to unsubscribe' 
    });
  }
});

/**
 * Send weather alert to subscribed users
 * 
 * This would typically be called by a cron job or webhook when weather alerts are detected
 * POST /api/sms/send-weather-alert
 * Request body: { locationRadius: { lat: number, lng: number, radius: number }, alertType: string, message: string }
 */
router.post('/send-weather-alert', async (req, res) => {
  try {
    const { locationRadius, alertType, message } = req.body;
    
    if (!locationRadius || !alertType || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Location radius, alert type, and message are required' 
      });
    }
    
    const { lat, lng, radius } = locationRadius;
    
    // Find all active subscriptions in the given radius
    const notificationPromises = [];
    
    for (const [phoneNumber, subscription] of subscriptions.entries()) {
      if (!subscription.verified || !subscription.active || !subscription.location) {
        continue;
      }
      
      // Calculate if the subscription is within the alert radius
      // This is a simplified calculation - in production, use a more accurate distance formula
      const latDiff = subscription.location.lat - lat;
      const lngDiff = subscription.location.lng - lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      
      if (distance <= radius) {
        // Send SMS alert
        const smsPromise = twilioClient.messages.create({
          body: `WEATHER ALERT: ${alertType} - ${message}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
        
        notificationPromises.push(smsPromise);
      }
    }
    
    // Wait for all notifications to be sent
    await Promise.all(notificationPromises);
    
    res.json({ 
      success: true, 
      notificationsSent: notificationPromises.length 
    });
  } catch (error) {
    console.error('Error sending weather alerts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send weather alerts' 
    });
  }
});

module.exports = router; 