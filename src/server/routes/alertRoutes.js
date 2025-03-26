/**
 * Alert Routes
 * 
 * These routes handle the management of weather alert check scheduling
 * and manual triggering of alert checks.
 */

const express = require('express');
const router = express.Router();
const alertScheduler = require('../services/alertScheduler');
const { checkLocationForAlerts } = require('../controllers/weatherAlertController');

/**
 * Start a scheduled weather alert check
 * 
 * POST /api/alerts/schedule
 * Request body: { id: string, location: { lat: number, lng: number }, intervalMinutes: number }
 */
router.post('/schedule', (req, res) => {
  try {
    const { id, location, intervalMinutes } = req.body;
    
    if (!id || !location || !location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        error: 'ID and location (lat/lng) are required'
      });
    }
    
    const jobInfo = alertScheduler.scheduleAlertCheck(
      id,
      location,
      intervalMinutes || 60
    );
    
    res.json({
      success: true,
      job: jobInfo
    });
  } catch (error) {
    console.error('Error scheduling alert check:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule alert check'
    });
  }
});

/**
 * Stop a scheduled weather alert check
 * 
 * POST /api/alerts/stop
 * Request body: { id: string }
 */
router.post('/stop', (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Job ID is required'
      });
    }
    
    const stopped = alertScheduler.stopAlertCheck(id);
    
    if (stopped) {
      res.json({
        success: true,
        message: `Alert check job ${id} stopped successfully`
      });
    } else {
      res.status(404).json({
        success: false,
        error: `No active alert check job found with ID ${id}`
      });
    }
  } catch (error) {
    console.error('Error stopping alert check:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop alert check'
    });
  }
});

/**
 * Get all scheduled weather alert checks
 * 
 * GET /api/alerts/jobs
 */
router.get('/jobs', (req, res) => {
  try {
    const jobs = alertScheduler.getScheduledJobs();
    
    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Error retrieving scheduled jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve scheduled jobs'
    });
  }
});

/**
 * Manually trigger a weather alert check
 * 
 * POST /api/alerts/check
 * Request body: { location: { lat: number, lng: number } }
 */
router.post('/check', async (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        error: 'Location (lat/lng) is required'
      });
    }
    
    const result = await checkLocationForAlerts(location);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error checking for alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check for alerts'
    });
  }
});

module.exports = router; 