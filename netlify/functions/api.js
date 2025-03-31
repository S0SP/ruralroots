const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// SMS verification endpoint
app.post('/sms/send-verification', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFICATION_SERVICE_SID)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    res.json({ success: true, sid: verification.sid });
  } catch (error) {
    console.error('Twilio error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send verification code' 
    });
  }
});

// Export the serverless function
module.exports.handler = serverless(app);
