/**
 * Main Server File
 * 
 * This is the entry point for the backend server, which handles
 * API requests, SMS notifications, and weather alerts.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const smsRoutes = require('./routes/smsRoutes');
const alertRoutes = require('./routes/alertRoutes');

// Import services
const alertScheduler = require('./services/alertScheduler');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/sms', smsRoutes);
app.use('/api/alerts', alertRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize default alert checks if enabled
  if (process.env.ENABLE_DEFAULT_ALERT_CHECKS === 'true') {
    // Parse default locations from environment variables
    try {
      const defaultLocations = JSON.parse(process.env.DEFAULT_ALERT_LOCATIONS || '[]');
      
      if (defaultLocations.length > 0) {
        console.log(`Setting up ${defaultLocations.length} default alert check(s)...`);
        
        defaultLocations.forEach((loc, index) => {
          if (loc.lat && loc.lng) {
            const jobId = `default-location-${index}`;
            alertScheduler.scheduleAlertCheck(jobId, loc, 60); // Check every hour
            console.log(`Scheduled alert check for location: ${loc.lat}, ${loc.lng} (ID: ${jobId})`);
          }
        });
      }
    } catch (error) {
      console.error('Error initializing default alert checks:', error);
    }
  }
});

module.exports = app; 