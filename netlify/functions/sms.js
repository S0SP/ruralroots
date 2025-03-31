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
    console.log('Twilio credentials check:', {
      hasSID: !!process.env.TWILIO_ACCOUNT_SID,
      hasToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasServiceSID: !!process.env.TWILIO_VERIFICATION_SERVICE_SID
    });

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    console.log('Attempting Twilio verification');
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

console.log('Function initialization completed');

exports.handler = serverless(app);