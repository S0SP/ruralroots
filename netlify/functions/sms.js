const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const twilio = require('twilio');


// Add initial startup logging
console.log('Function initialization started');

const app = express();

// Add middleware logging
app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));
app.use(express.json());

app.post('/send-verification', async (req, res) => {
  console.log('Verification endpoint hit:', {
    body: req.body,
    phoneNumber: req.body?.phoneNumber
  });
  
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      console.log('Phone number missing in request');
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

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

app.get('/', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({ message: 'SMS API is working' });
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error' });
});

console.log('Function initialization completed');

exports.handler = serverless(app);