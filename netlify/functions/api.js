const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
const router = express.Router();  // Add router

// Add more detailed CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Move routes to router
router.post('/sms/send-verification', async (req, res) => {
  console.log('Received verification request:', req.body);
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      console.log('No phone number provided');
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number is required' 
      });
    }

    console.log('Twilio credentials:', {
      accountSid: process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set',
      authToken: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
      serviceSid: process.env.TWILIO_VERIFICATION_SERVICE_SID ? 'Set' : 'Not set'
    });

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFICATION_SERVICE_SID)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    console.log('Verification sent:', verification.sid);
    
    res.json({
      success: true,
      sid: verification.sid
    });
  } catch (error) {
    console.error('Detailed Twilio error:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send verification code'
    });
  }
});

// Test endpoint on router
router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Mount router at /
app.use('/', router);

// Add base route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Base API endpoint' });
});

// Export the serverless function
module.exports.handler = serverless(app);
