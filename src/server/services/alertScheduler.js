/**
 * Alert Scheduler Service
 * 
 * This service provides functionality to schedule regular checks for weather alerts
 * and notification to users who have subscribed to SMS alerts.
 */

const { checkLocationForAlerts } = require('../controllers/weatherAlertController');

// In-memory storage of scheduled jobs (in production use a proper job scheduler)
const scheduledJobs = new Map();

/**
 * Start a scheduled job to check for weather alerts for a specific location
 * 
 * @param {string} id - Unique identifier for the job
 * @param {Object} location - Location coordinates {lat, lng}
 * @param {number} intervalMinutes - Interval between checks in minutes
 * @returns {Object} - Job information
 */
const scheduleAlertCheck = (id, location, intervalMinutes = 60) => {
  // Clear any existing job with the same ID
  if (scheduledJobs.has(id)) {
    clearInterval(scheduledJobs.get(id).interval);
  }
  
  // Convert minutes to milliseconds
  const intervalMs = intervalMinutes * 60 * 1000;
  
  // Function to run alert check
  const runCheck = async () => {
    try {
      console.log(`Running scheduled alert check for location: ${location.lat},${location.lng}`);
      const result = await checkLocationForAlerts(location);
      
      console.log(`Alert check complete:`, {
        alertsDetected: result.alertsDetected,
        alertsSent: result.alertsSent || 0,
        apiAlertsProcessed: result.apiAlertsProcessed || 0,
        totalAlertsSent: result.totalAlertsSent || 0
      });
      
      // Update last run information
      if (scheduledJobs.has(id)) {
        scheduledJobs.set(id, {
          ...scheduledJobs.get(id),
          lastRun: new Date(),
          lastResult: result
        });
      }
    } catch (error) {
      console.error(`Error in scheduled alert check for ${id}:`, error);
      
      // Update error information
      if (scheduledJobs.has(id)) {
        scheduledJobs.set(id, {
          ...scheduledJobs.get(id),
          lastError: error,
          lastErrorTime: new Date()
        });
      }
    }
  };
  
  // Create interval
  const interval = setInterval(runCheck, intervalMs);
  
  // Store job information
  const job = {
    id,
    location,
    intervalMinutes,
    interval,
    created: new Date(),
    active: true
  };
  
  scheduledJobs.set(id, job);
  
  // Run immediately for the first time
  runCheck();
  
  return {
    id,
    location,
    intervalMinutes,
    active: true
  };
};

/**
 * Stop a scheduled alert check job
 * 
 * @param {string} id - Job identifier
 * @returns {boolean} - Whether the job was successfully stopped
 */
const stopAlertCheck = (id) => {
  if (scheduledJobs.has(id)) {
    const job = scheduledJobs.get(id);
    clearInterval(job.interval);
    
    // Update job information
    scheduledJobs.set(id, {
      ...job,
      active: false,
      stoppedAt: new Date()
    });
    
    return true;
  }
  
  return false;
};

/**
 * Get information about all scheduled jobs
 * 
 * @returns {Array} - Array of job information objects
 */
const getScheduledJobs = () => {
  return Array.from(scheduledJobs.entries()).map(([id, job]) => ({
    id,
    location: job.location,
    intervalMinutes: job.intervalMinutes,
    created: job.created,
    lastRun: job.lastRun,
    active: job.active,
    lastError: job.lastError ? job.lastError.message : null,
    lastErrorTime: job.lastErrorTime
  }));
};

module.exports = {
  scheduleAlertCheck,
  stopAlertCheck,
  getScheduledJobs
}; 