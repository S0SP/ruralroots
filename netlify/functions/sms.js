const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const twilio = require('twilio');

const app = express();

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));
app.use(express.json());

app.post('/send-verification', async (req, res) => {
  console.log('Request received:', req.body);
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFICATION_SERVICE_SID)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    res.json({ success: true, sid: verification.sid });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'SMS API is working' });
});

exports.handler = serverless(app);