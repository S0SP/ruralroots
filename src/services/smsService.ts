/**
 * SMS Service for Twilio integration
 * 
 * This service provides functions to interact with the backend API
 * for Twilio SMS functionality, including verification codes and alerts.
 */

// Types
export interface SmsSubscription {
  phoneNumber: string;
  location: {
    lat: number;
    lng: number;
  };
  active: boolean;
  createdAt: Date;
}

// Base API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL;

console.log('API_BASE_URL value:', API_BASE_URL); // Add this to debug

if (!API_BASE_URL) {
  console.error("Error: VITE_API_URL environment variable is not set.");
}

/**
 * Send verification code to phone number
 */
export const sendVerificationCode = async (phoneNumber: string): Promise<{ success: boolean; sid?: string; error?: string }> => {
  if (!API_BASE_URL) return { success: false, error: 'API URL not configured' };
  try {
    const url = new URL('/api/sms/send-verification', API_BASE_URL).toString();
    console.log(`Sending verification to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ phoneNumber }),
      credentials: 'same-origin'
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: `Failed with status: ${response.status}` };
      }
      
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Success response:', data);
    return data;
  } catch (error) {
    console.error('Error sending verification code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send verification code. Please try again.' 
    };
  }
};

/**
 * Verify Otp and subscribe to SMS alerts
 */
export const verifyOtpAndSubscribe = async (
  phoneNumber: string,
  otp: string,
  location: { lat: number; lng: number }
): Promise<{ success: boolean; error?: string }> => {
  if (!API_BASE_URL) return { success: false, error: 'API URL not configured' };
  try {
    const url = new URL('/.netlify/functions/api/sms/verify-and-subscribe', API_BASE_URL).toString();
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otp, location }),
      credentials: 'include'
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to verify OTP' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { 
      success: false, 
      error: 'Failed to verify code. Please try again.' 
    };
  }
};

/**
 * Get current subscription status
 */
export const getSubscriptionStatus = async (phoneNumber: string): Promise<{ subscribed: boolean; subscription?: SmsSubscription; error?: string }> => {
  if (!API_BASE_URL) return { subscribed: false, error: 'API URL not configured' };
  try {
    const url = new URL('/.netlify/functions/api/sms/subscription-status', API_BASE_URL);
    url.searchParams.append('phoneNumber', phoneNumber);
    const response = await fetch(url.toString(), {
      credentials: 'include'
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get subscription status' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { subscribed: false };
  }
};

/**
 * Unsubscribe from SMS alerts
 */
export const unsubscribe = async (phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
  if (!API_BASE_URL) return { success: false, error: 'API URL not configured' };
  try {
    const url = new URL('/.netlify/functions/api/sms/unsubscribe', API_BASE_URL).toString();
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
      credentials: 'include'
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to unsubscribe' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return { 
      success: false, 
      error: 'Failed to unsubscribe. Please try again.' 
    };
  }
};

// Export service
export default {
  sendVerificationCode,
  verifyOtpAndSubscribe,
  getSubscriptionStatus,
  unsubscribe
};
