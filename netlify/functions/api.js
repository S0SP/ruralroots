const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const twilio = require('twilio');

const app = express();

// CORS and JSON parsing
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));
app.use(express.json());

// SMS verification endpoint - simplified route path
app.post('/send-verification', async (req, res) => {
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

    res.json({
      success: true,
      sid: verification.sid
    });
  } catch (error) {
    console.error('Twilio error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send verification code'
    });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Base API endpoint' });
});

exports.handler = serverless(app);
