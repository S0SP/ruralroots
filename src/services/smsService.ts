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

// Mock storage for development/demo purposes
let mockSubscription: SmsSubscription | null = null;

// Base API URL - update with your actual API endpoint
const API_KEY = import.meta.env.VITE_SMS_API_KEY || '';

/**
 * Send verification code to phone number
 */
export const sendVerificationCode = async (phoneNumber: string): Promise<{ success: boolean; sid?: string; error?: string }> => {
  try {
    // For production, you would make an actual API call:
    // const response = await fetch(`${API_URL}/sms/send-verification`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ phoneNumber })
    // });
    // const data = await response.json();
    // return data;

    // Mock implementation for development
    console.log(`[Mock] Sending verification code to ${phoneNumber}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    return { 
      success: true,
      sid: `VE${Math.random().toString(36).substring(2, 10)}` 
    };
  } catch (error) {
    console.error('Error sending verification code:', error);
    return { 
      success: false, 
      error: 'Failed to send verification code. Please try again.' 
    };
  }
};

/**
 * Verify OTP and subscribe to SMS alerts
 */
export const verifyOtpAndSubscribe = async (
  phoneNumber: string, 
  otp: string,
  location: { lat: number; lng: number }
): Promise<{ success: boolean; error?: string }> => {
  try {
    // For production, you would make an actual API call:
    // const response = await fetch(`${API_URL}/sms/verify-and-subscribe`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ phoneNumber, otp, location })
    // });
    // const data = await response.json();
    // return data;

    // Mock implementation for development
    console.log(`[Mock] Verifying OTP ${otp} for ${phoneNumber} at location ${location.lat},${location.lng}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    // In mock mode, any 6-digit OTP is valid
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return { success: false, error: 'Invalid verification code' };
    }
    
    // Store subscription
    mockSubscription = {
      phoneNumber,
      location,
      active: true,
      createdAt: new Date()
    };
    
    // Log mock subscription
    console.log('[Mock] Created subscription:', mockSubscription);
    
    return { success: true };
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
export const getSubscriptionStatus = async (phoneNumber: string): Promise<{ subscribed: boolean; subscription?: SmsSubscription }> => {
  try {
    // For production, you would make an actual API call:
    // const response = await fetch(`${API_URL}/sms/subscription-status?phoneNumber=${encodeURIComponent(phoneNumber)}`);
    // const data = await response.json();
    // return data;

    // Mock implementation for development
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    if (mockSubscription && mockSubscription.phoneNumber === phoneNumber) {
      return { 
        subscribed: true,
        subscription: mockSubscription
      };
    }
    
    return { subscribed: false };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { subscribed: false };
  }
};

/**
 * Unsubscribe from SMS alerts
 */
export const unsubscribe = async (phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // For production, you would make an actual API call:
    // const response = await fetch(`${API_URL}/sms/unsubscribe`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ phoneNumber })
    // });
    // const data = await response.json();
    // return data;

    // Mock implementation for development
    console.log(`[Mock] Unsubscribing ${phoneNumber} from alerts`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    if (mockSubscription && mockSubscription.phoneNumber === phoneNumber) {
      mockSubscription.active = false;
      return { success: true };
    }
    
    return { success: false, error: 'No active subscription found' };
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