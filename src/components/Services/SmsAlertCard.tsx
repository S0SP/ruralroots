import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  TextField,
  Button,
  CircularProgress,
  Collapse,
  Alert,
  AlertTitle,
  FormHelperText
} from '@mui/material';
import { Notifications, Check, Error, Phone } from '@mui/icons-material';
import smsService from '../../services/smsService';

interface UserLocation {
  latitude: number;
  longitude: number;
}

const SmsAlertCard: React.FC<{ userLocation: UserLocation }> = ({ userLocation }) => {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [verificationSid, setVerificationSid] = useState<string | null>(null);

  // Check if there's an existing subscription when the component mounts
  useEffect(() => {
    const checkExistingSubscription = async () => {
      const storedPhone = localStorage.getItem('smsAlertPhone');
      if (storedPhone) {
        setPhoneNumber(storedPhone);
        const { subscribed } = await smsService.getSubscriptionStatus(storedPhone);
        if (subscribed) {
          setSubscribed(true);
          setAlertsEnabled(true);
        }
      }
    };

    checkExistingSubscription();
  }, []);

  const handleAlertToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setAlertsEnabled(enabled);
    
    if (!enabled && subscribed) {
      // If user turns off alerts and was subscribed, unsubscribe
      setLoading(true);
      try {
        const result = await smsService.unsubscribe(phoneNumber);
        if (result.success) {
          setSubscribed(false);
          localStorage.removeItem('smsAlertPhone');
        } else {
          setError(result.error || 'Failed to unsubscribe');
          setAlertsEnabled(true); // Revert toggle if unsuccessful
        }
      } catch (err) {
        setError('Failed to unsubscribe. Please try again.');
        setAlertsEnabled(true); // Revert toggle if unsuccessful
      } finally {
        setLoading(false);
      }
    } else if (!enabled) {
      // Just reset states if not subscribed
      setShowOtpField(false);
      setVerificationSent(false);
      setOtp('');
      setError(null);
    }
  };

  const validatePhoneNumber = (phone: string) => {
    // Simple validation - could be enhanced with more comprehensive validation
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPhoneNumber(value);
    
    if (value && !validatePhoneNumber(value)) {
      setPhoneError('Please enter a valid phone number (e.g., +1234567890)');
    } else {
      setPhoneError(null);
    }
  };

  const handleSendVerification = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    if (!userLocation) {
      setError('Location data is unavailable. Please enable location services.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await smsService.sendVerificationCode(phoneNumber);
      
      if (result.success) {
        setVerificationSent(true);
        setShowOtpField(true);
        setVerificationSid(result.sid || null);
      } else {
        setError(result.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    if (!userLocation) {
      setError('Location data is unavailable. Please enable location services.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await smsService.verifyOtpAndSubscribe(phoneNumber, otp, userLocation);
      
      if (result.success) {
        setSubscribed(true);
        setShowOtpField(false);
        localStorage.setItem('smsAlertPhone', phoneNumber);
      } else {
        setError(result.error || 'Failed to verify code');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If location is not available, show a message
  if (!userLocation) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Phone sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6" component="h2">
              Weather SMS Alerts
            </Typography>
          </Box>
          <Alert severity="warning">
            Location data is unavailable. Please enable location services to use SMS alerts.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <Notifications sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6" component="h2">
              Weather SMS Alerts
            </Typography>
          </Box>
          <Switch
            checked={alertsEnabled}
            onChange={handleAlertToggle}
            color="primary"
            disabled={loading}
          />
        </Box>

        {subscribed ? (
          <Alert severity="success" icon={<Check fontSize="inherit" />}>
            <AlertTitle>Subscribed!</AlertTitle>
            You're now receiving SMS alerts for weather conditions that may affect your farm.
            We'll send notifications to {phoneNumber}.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="textSecondary" paragraph>
              Get SMS notifications when weather conditions may impact your farming activities.
            </Typography>

            <Collapse in={alertsEnabled}>
              <Box mt={2}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+1234567890"
                  disabled={loading || verificationSent}
                  error={!!phoneError}
                  helperText={phoneError}
                  margin="normal"
                  size="small"
                />
                
                {!verificationSent && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendVerification}
                    disabled={loading || !phoneNumber || !!phoneError}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
                  </Button>
                )}

                <Collapse in={showOtpField}>
                  <Box mt={2}>
                    <TextField
                      fullWidth
                      label="Verification Code"
                      variant="outlined"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      disabled={loading}
                      margin="normal"
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleVerifyOtp}
                      disabled={loading || !otp}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Verify & Subscribe'}
                    </Button>
                  </Box>
                </Collapse>

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                {verificationSent && !error && !subscribed && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Verification code sent to {phoneNumber}. Please check your messages.
                  </Alert>
                )}
              </Box>
            </Collapse>

            {!alertsEnabled && (
              <FormHelperText>
                Toggle the switch to enable SMS alerts for weather conditions.
              </FormHelperText>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SmsAlertCard; 