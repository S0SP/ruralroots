const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const twilio = require('twilio');

console.log('Function initialization started');

const app = express();

// Add middleware logging
app.use((req, res, next) => {
  // Parse the Buffer body
  if (req.body instanceof Buffer) {
    try {
      req.body = JSON.parse(req.body.toString());
    } catch (e) {
      console.error('Failed to parse body:', e);
    }
  }
  
  console.log('Parsed request:', {
    method: req.method,
    path: req.path,
    body: req.body
  });
  next();
});

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));
app.use(express.json());

// Update the path to match the incoming request
app.post('/.netlify/functions/sms/send-verification', async (req, res) => {
  console.log('Verification endpoint hit with body:', req.body);
  
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      console.log('Phone number missing in request');
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    console.log('Processing phone number:', phoneNumber);
    
    // Check Twilio credentials
    if (!process.env.TWILIO_VERIFICATION_SERVICE_SID) {
      console.error('Missing Twilio Verification Service SID');
      return res.status(500).json({ 
        success: false, 
        error: 'Twilio service not properly configured' 
      });
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    console.log('Attempting Twilio verification with service:', process.env.TWILIO_VERIFICATION_SERVICE_SID);
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFICATION_SERVICE_SID)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    console.log('Twilio verification successful:', verification.sid);
    res.json({ success: true, sid: verification.sid });
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add the verify-and-subscribe endpoint
app.post('/.netlify/functions/sms/verify-and-subscribe', async (req, res) => {
  console.log('Verify and subscribe endpoint hit with body:', req.body);
  
  try {
    const { phoneNumber, otp, location } = req.body;
    if (!phoneNumber || !otp) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and OTP are required' 
      });
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    console.log('Attempting to verify OTP');
    const verification_check = await client.verify.v2
      .services(process.env.TWILIO_VERIFICATION_SERVICE_SID)
      .verificationChecks.create({ to: phoneNumber, code: otp });

    if (verification_check.status === 'approved') {
      console.log('OTP verified successfully');
      // Here you can add subscription logic for the location
      res.json({ 
        success: true,
        message: 'Phone number verified and subscribed successfully'
      });
    } else {
      console.log('OTP verification failed:', verification_check.status);
      res.status(400).json({ 
        success: false, 
        error: 'Invalid verification code' 
      });
    }
  } catch (error) {
    console.error('Verification error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify code. Please try again.' 
    });
  }
});

console.log('Function initialization completed');

exports.handler = serverless(app);